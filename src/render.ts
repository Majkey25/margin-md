import MarkdownIt, { type Env } from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { full as emoji } from 'markdown-it-emoji';
import DOMPurify from 'dompurify';
import { classHighlighter, highlightCode } from '@lezer/highlight';
import { parser as javascript } from '@lezer/javascript';
import { parser as css } from '@lezer/css';
import { parser as html } from '@lezer/html';
import { getLocale, t, type Locale } from './i18n';
import type { MarkdownFormat } from './preferences';
import { hydrateImages, prepareImages, resetImages } from './images';

const markdown = new MarkdownIt({ html: false, linkify: false, typographer: false });
const github = new MarkdownIt({ html: true, linkify: true, typographer: false }).use(footnote).use(emoji, { shortcuts: {} });
DOMPurify.addHook('uponSanitizeAttribute', (_node, attribute) => {
  if (attribute.attrName === 'id' || attribute.attrName === 'name') attribute.attrValue = `user-content-${attribute.attrValue}`;
});
// shortcut: color at most 20,000 characters per render; use a worker for larger highlighted documents.
const MAX_HIGHLIGHT_CHARS = 20_000;
const typescript = javascript.configure({ dialect: 'ts' });
const codeParsers: ReadonlyMap<string, typeof javascript> = new Map([
  ['js', javascript], ['javascript', javascript],
  ['ts', typescript], ['typescript', typescript],
  ['jsx', javascript.configure({ dialect: 'jsx' })],
  ['tsx', javascript.configure({ dialect: 'jsx ts' })],
  ['json', javascript.configure({ top: 'SingleExpression' })],
  ['css', css], ['html', html],
]);

interface RenderContext extends Env { highlightRemaining: number; format: MarkdownFormat }
// Cache only the displayed document, capped at 32 million HTML characters and released with the page.
const MAX_CACHED_HTML_CHARS = 32 * 1024 * 1024;
let previous: { target: HTMLElement; locale: Locale; format: MarkdownFormat; blocks: string[] } | undefined;

export function resetPreview(): void {
  previous = undefined;
  resetImages();
}
window.addEventListener('pagehide', (event) => { if (!event.persisted) resetPreview(); });

function uniqueId(base: string, used: Map<string, number>): string {
  let id = base;
  let suffix = used.get(base) ?? 0;
  while (used.has(id)) id = `${base}-${++suffix}`;
  used.set(base, suffix);
  used.set(id, 0);
  return id;
}

const plainFence = markdown.renderer.rules.fence!;
markdown.renderer.rules.fence = (tokens, index, options, context, renderer) => {
  const token = tokens[index];
  const language = token.info.trim().split(/\s+/, 1)[0].toLowerCase();
  const parser = codeParsers.get(language);
  if ((!parser && language !== 'diff') || !context || typeof context.highlightRemaining !== 'number'
    || token.content.length > context.highlightRemaining) {
    return plainFence(tokens, index, options, context, renderer);
  }
  context.highlightRemaining -= token.content.length;
  let highlighted = '';
  try {
    if (language === 'diff') {
      highlighted = token.content.split('\n').map((line) => {
        const text = markdown.utils.escapeHtml(line);
        return line.startsWith('+') ? `<span class="tok-inserted">${text}</span>`
          : line.startsWith('-') ? `<span class="tok-deleted">${text}</span>` : text;
      }).join('\n');
    } else if (parser) highlightCode(token.content, parser.parse(token.content), classHighlighter, (text, classes) => {
      const escaped = markdown.utils.escapeHtml(text);
      highlighted += classes ? `<span class="${markdown.utils.escapeHtml(classes)}">${escaped}</span>` : escaped;
    }, () => { highlighted += '\n'; });
  } catch {
    return plainFence(tokens, index, options, context, renderer);
  }
  return plainFence(tokens, index, { ...options, highlight: () => highlighted }, context, renderer);
};
github.renderer.rules.fence = markdown.renderer.rules.fence;

for (const parser of [markdown, github]) parser.core.ruler.before('inline', 'task-list', (state) => {
  for (let i = 2; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    if (token.type !== 'inline' || state.tokens[i - 1].type !== 'paragraph_open'
      || state.tokens[i - 2].type !== 'list_item_open') continue;
    const marker = /^\[([ xX])\](?:\s+|$)/.exec(token.content);
    if (!marker) continue;
    token.content = token.content.slice(marker[0].length);
    state.tokens[i - 2].attrJoin('class', marker[1] === ' ' ? 'task-list-item' : 'task-list-item task-list-checked');
  }
});

const plainImage = markdown.renderer.rules.image!;
for (const parser of [markdown, github]) parser.renderer.rules.image = (tokens, index, options, context, renderer) =>
  context?.format === 'github' ? plainImage(tokens, index, options, context, renderer)
    : `<span class="blocked-image">${markdown.utils.escapeHtml(t('Obrázek: {name} (nenačten)', { name: tokens[index].content || t('bez popisu') }))}</span>`;

for (const parser of [markdown, github]) for (const type of ['th_open', 'td_open']) {
  parser.renderer.rules[type] = (tokens, index, options, _env, renderer) => {
    const token = tokens[index];
    const style = token.attrGet('style');
    const align = typeof style === 'string' ? style.replace('text-align:', '') : undefined;
    if (align === 'left' || align === 'center' || align === 'right') token.attrSet('class', `align-${align}`);
    return renderer.renderToken(tokens, index, options);
  };
}

github.core.ruler.before('inline', 'alerts', (state) => {
  for (let index = 0; index < state.tokens.length - 2; index++) {
    if (state.tokens[index].type !== 'blockquote_open' || state.tokens[index + 1].type !== 'paragraph_open') continue;
    const inline = state.tokens[index + 2];
    const marker = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\n|$)/.exec(inline.content);
    if (!marker) continue;
    state.tokens[index].attrSet('class', `markdown-alert markdown-alert-${marker[1].toLowerCase()}`);
    inline.content = inline.content.slice(marker[0].length);
  }
});
github.renderer.rules.blockquote_open = (tokens, index, options, _context, renderer) => {
  const classes = String(tokens[index].attrGet('class') ?? '');
  const kind = classes.split(' ').find((value) => value.startsWith('markdown-alert-'))?.slice(15);
  const titles = { note: 'Poznámka', tip: 'Tip', important: 'Důležité', warning: 'Varování', caution: 'Upozornění' } as const;
  const title = kind && Object.hasOwn(titles, kind) ? t(titles[kind as keyof typeof titles]) : undefined;
  return renderer.renderToken(tokens, index, options) + (title ? `<p class="markdown-alert-title">${title}</p>\n` : '');
};
github.core.ruler.after('inline', 'heading-anchors', (state) => {
  const used = new Map<string, number>();
  for (let index = 0; index < state.tokens.length - 1; index++) {
    if (state.tokens[index].type !== 'heading_open') continue;
    const text = state.tokens[index + 1].children?.map((token) => token.type === 'html_inline' ? '' : token.content).join('') ?? '';
    const base = text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/\s+/g, '-') || 'section';
    state.tokens[index].attrSet('id', uniqueId(base, used));
  }
});

export function renderMarkdown(source: string, target: HTMLElement, format: MarkdownFormat): void {
  const parser = format === 'github' ? github : markdown;
  const context: RenderContext = { highlightRemaining: MAX_HIGHLIGHT_CHARS, format };
  const tokens = parser.parse(source, context);
  // A fresh footnote namespace cannot collide with headings or authored HTML IDs.
  if (tokens.some((token) => token.type === 'footnote_block_open')) context.docId = crypto.randomUUID();
  // Raw HTML and footnotes can span token groups, so sanitize their complete tree.
  const whole = tokens.some((token) => token.type.startsWith('html_') || token.type === 'footnote_block_open'
    || token.children?.some((child) => child.type.startsWith('html_')));
  const blocks: string[] = [];
  let blockStart = 0;
  let htmlChars = 0;
  if (whole) {
    blocks.push(parser.renderer.render(tokens, parser.options, context));
  } else for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].level !== 0 || tokens[index].nesting > 0) continue;
    const html = parser.renderer.render(tokens.slice(blockStart, index + 1), parser.options, context);
    blocks.push(html);
    htmlChars += html.length;
    blockStart = index + 1;
  }
  const locale = getLocale();
  let first = 0;
  let oldEnd = target.children.length;
  let newEnd = blocks.length;
  const cached = !whole && previous?.target === target && previous.locale === locale && previous.format === format && previous.blocks.length === oldEnd ? previous : undefined;
  if (cached) {
    while (first < oldEnd && first < newEnd && cached.blocks[first] === blocks[first]) first++;
    while (oldEnd > first && newEnd > first && cached.blocks[oldEnd - 1] === blocks[newEnd - 1]) { oldEnd--; newEnd--; }
  }
  const html = blocks.slice(first, newEnd).join('');
  let dirty: string | DocumentFragment = html;
  const prepare = format === 'github' && (whole || html.includes('<img'));
  if (prepare) {
    const template = document.createElement('template');
    template.innerHTML = html;
    prepareImages(template.content);
    dirty = template.content;
  }
  const fragment = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's',
      'a', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'span', 'div', 'section', 'details', 'summary', 'kbd', 'sub', 'sup', 'ins', 'del', 'b', 'i', 'u', 'small', 'abbr', 'mark', 'picture'],
    ALLOWED_ATTR: ['href', 'title', 'class', 'start', 'id', 'name', 'align', 'valign', 'width', 'height', 'colspan', 'rowspan', 'open', 'data-margin-image'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    SANITIZE_NAMED_PROPS: true,
    RETURN_DOM_FRAGMENT: true,
  });
  for (const node of fragment.querySelectorAll<HTMLElement>('[class]')) {
    for (const value of Array.from(node.classList)) {
      if (!/^(?:tok-[A-Za-z0-9]+|align-(?:left|center|right)|task-list-(?:item|checked)|blocked-image|footnote(?:s|s-list|s-sep|-ref|-item|-backref)|markdown-alert(?:-note|-tip|-important|-warning|-caution|-title)?)$/.test(value)) node.classList.remove(value);
    }
    if (!node.className) node.removeAttribute('class');
  }
  for (const node of fragment.querySelectorAll<HTMLElement>('[align], [valign], [width], [height], [colspan], [rowspan]')) {
    const align = node.getAttribute('align');
    if (align === 'left' || align === 'center' || align === 'right') node.classList.add(`align-${align}`);
    node.removeAttribute('align');
    if (!['top', 'middle', 'bottom', 'baseline'].includes(node.getAttribute('valign') ?? '')) node.removeAttribute('valign');
    for (const attr of ['width', 'height', 'colspan', 'rowspan']) {
      const value = node.getAttribute(attr);
      const percentage = attr === 'width' && /^(?:100|[1-9]\d?)%$/.test(value ?? '');
      const number = Number(value);
      if (value && !percentage && (!/^\d+$/.test(value) || number < 1 || number > (attr === 'colspan' || attr === 'rowspan' ? 1000 : 4096))) node.removeAttribute(attr);
    }
  }
  for (const anchor of fragment.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    const href = anchor.getAttribute('href')!;
    if (href.length > 1) anchor.setAttribute('href', `#user-content-${href.slice(1)}`);
  }
  for (const anchor of fragment.querySelectorAll<HTMLAnchorElement>('a[name]')) {
    if (!anchor.id) anchor.id = anchor.name;
    anchor.removeAttribute('name');
  }
  if (whole) {
    const ids = new Map<string, number>();
    for (const node of fragment.querySelectorAll<HTMLElement>('[id]')) {
      node.id = uniqueId(node.id, ids);
    }
  }
  for (const item of fragment.querySelectorAll('li.task-list-item')) {
    const text = item.firstElementChild?.tagName === 'P' ? item.firstElementChild : item;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = true;
    checkbox.checked = item.classList.contains('task-list-checked');
    checkbox.className = 'task-list-checkbox';
    const label = Array.from(text.childNodes)
      .filter((node) => !(node instanceof HTMLElement && (node.tagName === 'UL' || node.tagName === 'OL')))
      .map((node) => node.textContent ?? '').join('').trim().slice(0, 240);
    checkbox.setAttribute('aria-label', label || t('Úkol'));
    text.prepend(checkbox, ' ');
  }
  for (const block of fragment.querySelectorAll<HTMLElement>('pre, table')) block.tabIndex = 0;
  if (prepare) hydrateImages(fragment);
  if (whole) {
    target.replaceChildren(fragment);
    previous = undefined;
    return;
  }
  if (fragment.children.length !== newEnd - first) throw new Error('Unexpected Markdown block structure.');
  for (const node of Array.from(fragment.childNodes)) if (node.nodeType !== Node.ELEMENT_NODE) node.remove();
  if (!cached) target.replaceChildren(fragment);
  else {
    if (oldEnd > first) {
      const range = document.createRange();
      range.setStartBefore(target.children[first]);
      range.setEndAfter(target.children[oldEnd - 1]);
      range.deleteContents();
    }
    target.insertBefore(fragment, target.children[first] ?? null);
  }
  previous = htmlChars <= MAX_CACHED_HTML_CHARS ? { target, locale, format, blocks } : undefined;
}
