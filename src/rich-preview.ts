import createDOMPurify from 'dompurify';
import { t } from './i18n';
import type { MarkdownFormat } from './preferences';

interface RichBlock {
  node: HTMLElement;
  source: string;
  kind: 'diagram' | 'inline' | 'block';
  key?: string;
  url?: string;
}

const purifier = createDOMPurify(window);
const blocks = new Map<HTMLElement, RichBlock>();
const pending = new Set<RichBlock>();
const diagrams = new Map<string, string>();
const MAX_SOURCE_CHARS = 64_000;
const MAX_CACHE_CHARS = 4 * 1024 * 1024;
let cacheChars = 0;
let running = false;
let renderer: { frame: HTMLIFrameElement; ready: Promise<void> } | undefined;
let abortDiagram: (() => void) | undefined;
let katex: Promise<typeof import('katex')> | undefined;

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) if (entry.isIntersecting) {
    const block = blocks.get(entry.target as HTMLElement);
    if (block) pending.add(block);
    observer.unobserve(entry.target);
  }
  void drain();
}, { rootMargin: '300px' });

new MutationObserver(() => {
  for (const block of blocks.values()) if (block.kind === 'diagram') {
    observer.observe(block.node);
  }
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function release(block: RichBlock): void {
  observer.unobserve(block.node);
  pending.delete(block);
  if (block.url) URL.revokeObjectURL(block.url);
  blocks.delete(block.node);
}

export function resetRichPreview(): void {
  for (const block of blocks.values()) release(block);
  diagrams.clear();
  cacheChars = 0;
  abortDiagram?.();
  renderer?.frame.remove();
  renderer = undefined;
}

export function enhanceRichPreview(target: HTMLElement, format: MarkdownFormat): void {
  for (const block of blocks.values()) if (!target.contains(block.node)) release(block);
  if (format !== 'github') { resetRichPreview(); return; }
  let chars = 0;
  let diagramCount = 0;
  let mathCount = 0;
  for (const block of blocks.values()) {
    chars += block.source.length;
    if (block.kind === 'diagram') diagramCount++; else mathCount++;
  }
  for (const node of target.querySelectorAll<HTMLElement>('code.language-mermaid, .math-inline, .math-block')) {
    if (blocks.has(node)) continue;
    const source = node.textContent ?? '';
    const kind = node.tagName === 'CODE' ? 'diagram' : node.classList.contains('math-block') ? 'block' : 'inline';
    // shortcut: Mermaid needs the extension sandbox; web development keeps source until an equally isolated renderer exists.
    if (kind === 'diagram' && location.protocol !== 'chrome-extension:') {
      node.dataset.richState = 'source';
      node.title = t('Diagramy Mermaid vyžadují načtené rozšíření Chrome.');
      continue;
    }
    const count = kind === 'diagram' ? ++diagramCount : ++mathCount;
    chars += source.length;
    if (source.length > (kind === 'diagram' ? 12_000 : 8_000) || chars > MAX_SOURCE_CHARS
      || count > (kind === 'diagram' ? 32 : 200)) {
      node.title = t('Náhled překračuje limit složitosti. Zdrojový text zůstává zobrazený.');
      continue;
    }
    const block: RichBlock = { node, source, kind };
    if (kind === 'block') node.tabIndex = 0;
    blocks.set(node, block);
    node.dataset.richState = 'pending';
    observer.observe(node);
  }
}

function renderDiagram(source: string, dark: boolean): Promise<string> {
  if (!renderer) {
    const frame = document.createElement('iframe');
    frame.className = 'diagram-renderer';
    frame.title = 'Mermaid renderer';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.sandbox.add('allow-scripts');
    frame.src = new URL('diagram.html', document.baseURI).href;
    const ready = new Promise<void>((resolve, reject) => {
      frame.onload = () => resolve();
      frame.onerror = () => reject(new Error('Diagram renderer failed to load.'));
    });
    renderer = { frame, ready };
    document.body.append(frame);
  }
  const current = renderer;
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = (svg?: string): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      if (abortDiagram === abort) abortDiagram = undefined;
      if (svg) resolve(svg); else reject(new Error('Could not render diagram.'));
    };
    const abort = (): void => finish();
    const timer = setTimeout(() => {
      if (renderer === current) { current.frame.remove(); renderer = undefined; }
      finish();
    }, 10_000);
    abortDiagram = abort;
    channel.port1.onmessage = (event: MessageEvent<unknown>) => finish(
      typeof event.data === 'string' && event.data.length <= 2 * 1024 * 1024 ? event.data : undefined,
    );
    void current.ready.then(() => {
      if (!settled) {
        try { current.frame.contentWindow!.postMessage({ source, dark }, '*', [channel.port2]); }
        catch { finish(); }
      }
    }, () => finish());
  });
}

async function drain(): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (const block of pending) {
      pending.delete(block);
      const { node, source, kind } = block;
      const valid = (): boolean => node.isConnected && blocks.get(node) === block;
      if (!valid()) continue;
      const dark = document.documentElement.dataset.theme === 'dark';
      const key = `${kind}:${dark}:${source}`;
      if (block.key === key) continue;
      node.setAttribute('aria-busy', 'true');
      try {
        if (kind === 'diagram') {
          let svg = diagrams.get(key);
          if (!svg) {
            svg = await renderDiagram(source, dark);
            if (!valid()) continue;
            // SVG is displayed only as an image; scripts, links and external resources stay inactive.
            const fragment = purifier.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true },
              FORBID_TAGS: ['foreignObject', 'image', 'a'], RETURN_DOM_FRAGMENT: true });
            const image = fragment.querySelector('svg');
            if (!image) throw new Error('Missing diagram SVG.');
            svg = new XMLSerializer().serializeToString(image);
            while (diagrams.size && (diagrams.size >= 32 || cacheChars + svg.length > MAX_CACHE_CHARS)) {
              const oldest = diagrams.keys().next().value!;
              cacheChars -= diagrams.get(oldest)!.length;
              diagrams.delete(oldest);
            }
            if (svg.length <= MAX_CACHE_CHARS) { diagrams.set(key, svg); cacheChars += svg.length; }
          }
          if (!valid() || dark !== (document.documentElement.dataset.theme === 'dark')) continue;
          const image = document.createElement('img');
          const description = new DOMParser().parseFromString(svg, 'image/svg+xml');
          image.alt = Array.from(description.querySelectorAll('title, desc')).map((node) => node.textContent).join('. ')
            || t('Mermaid diagram');
          const bounds = description.documentElement.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
          if (bounds?.length === 4 && bounds.every(Number.isFinite) && bounds[2] > 0 && bounds[3] > 0) {
            const scale = Math.min(1, 2048 / bounds[2], 4096 / bounds[3]);
            image.width = Math.ceil(bounds[2] * scale);
            image.height = Math.ceil(bounds[3] * scale);
          }
          image.decoding = 'async';
          const previousUrl = block.url;
          block.url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
          image.src = block.url;
          node.replaceChildren(image);
          node.parentElement?.classList.add('markdown-diagram');
          if (previousUrl) URL.revokeObjectURL(previousUrl);
        } else {
          katex ??= import('katex');
          const { renderToString } = await katex;
          if (!valid()) continue;
          const math = renderToString(source, { displayMode: kind === 'block', output: 'mathml',
            trust: false, strict: 'error', throwOnError: true, maxExpand: 500, maxSize: 20 });
          node.replaceChildren(purifier.sanitize(math, { USE_PROFILES: { mathMl: true },
            ADD_TAGS: ['semantics', 'annotation'], ADD_ATTR: ['encoding'], FORBID_TAGS: ['annotation-xml'], RETURN_DOM_FRAGMENT: true }));
        }
        block.key = key;
        node.dataset.richState = 'ready';
        node.removeAttribute('title');
      } catch {
        if (valid()) {
          block.key = undefined;
          if (block.url) { URL.revokeObjectURL(block.url); block.url = undefined; }
          node.textContent = source;
          node.dataset.richState = 'error';
          node.title = t('Náhled nelze vykreslit. Ověřte syntaxi; zdrojový text zůstává zobrazený.');
        }
      } finally { node.removeAttribute('aria-busy'); }
    }
  } finally { running = false; }
}
