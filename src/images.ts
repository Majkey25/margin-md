import { isMessageKey, t } from './i18n';

type ImageSource =
  | { kind: 'asset'; key: string; url: string }
  | { kind: 'remote'; key: string; url: string; host: string }
  | { kind: 'local'; key: string; parts: string[] };

interface ImageMetadata {
  fallback?: ImageSource;
  sources: { source: ImageSource; media: string }[];
  alt: string;
  width?: number;
  height?: number;
}

const MAX_SOURCES = 128;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_LOCAL_BYTES = 64 * 1024 * 1024;
const assets = new Map([
  ['margin-asset:showcase.svg', '/showcase/showcase.svg'],
  ['margin-asset:showcase-dark.svg', '/showcase/showcase-dark.svg'],
  ['margin-asset:badge.svg', '/showcase/badge.svg'],
]);
const prepared: ImageMetadata[][] = [];
const consented = new Map<string, { url: string; local: boolean; bytes: number }>();
const resourceAttributes = new Set(['src', 'srcset', 'srcdoc', 'poster', 'data', 'background', 'style', 'ping', 'action', 'formaction']);
let assetsRoot: FileSystemDirectoryHandle | undefined;
let version = 0;

function imageSource(raw: string): ImageSource | undefined {
  const value = raw.trim();
  if (value.length > 4096) return;
  const asset = assets.get(value);
  if (asset) return { kind: 'asset', key: value, url: new URL(asset, location.href).href };
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname && !url.username && !url.password) {
      return { kind: 'remote', key: url.href, url: url.href, host: url.hostname };
    }
    return;
  } catch { /* Relative paths are resolved only through a selected directory. */ }
  try {
    const path = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    if (!path || path.startsWith('/') || /[\\:\u0000]/.test(path)) return;
    const parts = path.split('/').filter((part) => part && part !== '.');
    if (!parts.length || parts.length > 64 || parts.some((part) => part === '..' || /[. ]$/.test(part))) return;
    return { kind: 'local', key: `local:${parts.join('/')}`, parts };
  } catch { return; }
}

function singleSource(value: string | null): string | undefined {
  const source = value?.trim();
  return source && !/[\s,]/.test(source) ? source : undefined;
}

function dimension(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return;
  const number = Number(value);
  return number > 0 && number <= 4096 ? number : undefined;
}

export function prepareImages(fragment: DocumentFragment): void {
  for (const template of fragment.querySelectorAll('template')) template.remove();
  const nodes = Array.from(fragment.querySelectorAll('*'));
  for (const node of nodes) {
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.localName.toLowerCase();
      if (name === 'data-margin-image' || name === 'srcdoc' || name.startsWith('on')) node.removeAttributeNode(attribute);
    }
  }
  if (prepared.length >= MAX_SOURCES) throw new Error('Too many nested image renders.');
  const batch: ImageMetadata[] = [];
  for (const image of nodes.filter((node) => node.localName === 'img')) {
    const sources: ImageMetadata['sources'] = [];
    if (image.parentElement?.localName === 'picture') {
      for (const source of image.parentElement.children) {
        if (source === image) break;
        if (source.localName !== 'source') continue;
        const raw = singleSource(source.getAttribute('srcset'));
        const parsed = raw ? imageSource(raw) : undefined;
        if (parsed) sources.push({ source: parsed, media: source.getAttribute('media') ?? '' });
      }
    }
    const marker = document.createElement('span');
    marker.setAttribute('data-margin-image', String(batch.length));
    const fallback = imageSource(singleSource(image.getAttribute('srcset')) ?? image.getAttribute('src') ?? '');
    const width = dimension(image.getAttribute('width'));
    const height = dimension(image.getAttribute('height'));
    const intrinsic = fallback?.kind === 'asset' && !width && !height
      ? (fallback.key === 'margin-asset:badge.svg' ? [126, 26] : [800, 200]) : undefined;
    batch.push({
      fallback,
      sources,
      alt: (image.getAttribute('alt') ?? '').slice(0, 1000),
      width: width ?? intrinsic?.[0],
      height: height ?? intrinsic?.[1],
    });
    image.replaceWith(marker);
  }
  for (const node of nodes) {
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.localName.toLowerCase();
      if (resourceAttributes.has(name) || name.startsWith('on')
        || (name === 'href' && !(node instanceof HTMLAnchorElement && attribute.name === 'href'))) {
        node.removeAttributeNode(attribute);
      }
    }
  }
  // Nested synchronous renders consume their own batch before the enclosing render.
  prepared.push(batch);
}

function knownUrl(source: ImageSource): string | undefined {
  return source.kind === 'asset' ? source.url : consented.get(source.key)?.url;
}

function forget(source: ImageSource): void {
  const saved = consented.get(source.key);
  if (saved?.local) URL.revokeObjectURL(saved.url);
  consented.delete(source.key);
}

export function resetImages(): void {
  version++;
  for (const saved of consented.values()) if (saved.local) URL.revokeObjectURL(saved.url);
  consented.clear();
  prepared.length = 0;
  assetsRoot = undefined;
}

function hydrateImage(marker: HTMLElement, metadata: ImageMetadata): void {
  const epoch = version;
  const sources = Array.from(new Map([
    ...metadata.sources.map(({ source }) => [source.key, source] as const),
    ...(metadata.fallback ? [[metadata.fallback.key, metadata.fallback] as const] : []),
  ]).values());
  marker.className = 'markdown-image';
  const caption = document.createElement('span');
  caption.className = 'blocked-image';
  caption.textContent = t('Obrázek: {name} (nenačten)', { name: metadata.alt || t('bez popisu') });
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'image-load';
  const errorText = document.createElement('span');
  errorText.className = 'image-error';
  errorText.setAttribute('role', 'status');
  const hosts = Array.from(new Set(sources.flatMap((source) => source.kind === 'remote' ? [source.host] : []))).join(', ');
  const buttonLabel = (): string => {
    const label = sources.some((source) => source.kind === 'local' && !knownUrl(source)) && !assetsRoot
      ? t('Vybrat složku dokumentu') : t('Načíst obrázek');
    return hosts ? `${label} (${hosts})` : label;
  };
  button.textContent = buttonLabel();
  const relative = sources.find((source) => source.kind === 'local');
  if (relative?.kind === 'local') button.title = t('Relativní cesta: {path}', { path: relative.parts.join('/') });
  marker.replaceChildren(caption, button, errorText);
  if (!sources.length) {
    button.remove();
    errorText.textContent = t('Zdroj obrázku není podporován.');
    return;
  }
  let attempt = 0;
  let media: HTMLElement | undefined;
  const active = (ticket: number): boolean => epoch === version && ticket === attempt && marker.isConnected;
  const display = (): void => {
    const fallback = metadata.fallback && knownUrl(metadata.fallback);
    const available = metadata.sources.flatMap(({ source, media }) => {
      const url = knownUrl(source);
      return url ? [{ url, media }] : [];
    });
    if (!fallback && !available.length) return;
    const used = new Map(sources.map((source) => [source.key, knownUrl(source)]));
    media?.remove();
    const ticket = ++attempt;
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = metadata.alt;
    image.referrerPolicy = 'no-referrer';
    image.className = 'markdown-image-content';
    if (metadata.width) image.width = metadata.width;
    if (metadata.height) image.height = metadata.height;
    if (metadata.height && !metadata.width) image.style.height = `${metadata.height}px`;
    if (metadata.height && metadata.width) image.style.aspectRatio = `${metadata.width} / ${metadata.height}`;
    const picture = document.createElement('picture');
    for (const candidate of available) {
      const source = document.createElement('source');
      source.srcset = candidate.url;
      if (candidate.media) source.media = candidate.media;
      picture.append(source);
    }
    image.onload = () => {
      if (!active(ticket)) return;
      caption.hidden = true;
      errorText.textContent = '';
      button.hidden = sources.every((source) => knownUrl(source));
    };
    image.onerror = () => {
      if (!active(ticket)) return;
      media?.remove();
      for (const source of sources) {
        if (consented.get(source.key)?.url === used.get(source.key)) forget(source);
      }
      caption.hidden = false;
      button.hidden = false;
      button.disabled = false;
      button.textContent = buttonLabel();
      errorText.textContent = t('Obrázek nelze načíst. Zkuste to znovu.');
    };
    picture.append(image);
    media = available.length ? picture : image;
    marker.prepend(media);
    if (fallback) image.src = fallback;
  };
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (button.disabled || epoch !== version || !marker.isConnected) return;
    const ticket = ++attempt;
    const local = sources.some((source) => source.kind === 'local' && !consented.has(source.key));
    button.disabled = true;
    errorText.textContent = '';
    let directory = assetsRoot;
    try {
      if (consented.size + sources.filter((source) => source.kind !== 'asset' && !consented.has(source.key)).length > MAX_SOURCES) {
        throw new Error('Byl dosažen limit 128 obrázků v dokumentu.');
      }
      // Keep the directory picker directly in the user's click, before any await.
      if (local && !directory) directory = await window.showDirectoryPicker({ mode: 'read' });
      if (!active(ticket)) return;
      for (const source of sources) {
        if (source.kind === 'asset') continue;
        if (!consented.has(source.key) && consented.size >= MAX_SOURCES) {
          throw new Error('Byl dosažen limit 128 obrázků v dokumentu.');
        }
        if (source.kind === 'remote') {
          consented.set(source.key, { url: source.url, local: false, bytes: 0 });
          continue;
        }
        if (consented.has(source.key)) continue;
        let folder = directory;
        if (!folder) throw new Error('Obrázek nelze načíst. Zkuste to znovu.');
        for (const part of source.parts.slice(0, -1)) folder = await folder.getDirectoryHandle(part);
        const handle = await folder.getFileHandle(source.parts[source.parts.length - 1]);
        const file = await handle.getFile();
        if (!active(ticket)) return;
        if (file.size > MAX_IMAGE_BYTES) throw new Error('Obrázek překračuje limit 10 MiB.');
        if (!file.type.toLowerCase().startsWith('image/') && !/\.(svg|png|jpe?g|webp|gif|avif)$/i.test(file.name)) {
          throw new Error('Soubor není podporovaný obrázek.');
        }
        if (!consented.has(source.key) && consented.size >= MAX_SOURCES) {
          throw new Error('Byl dosažen limit 128 obrázků v dokumentu.');
        }
        if (consented.has(source.key)) continue;
        if (Array.from(consented.values()).reduce((sum, saved) => sum + saved.bytes, 0) + file.size > MAX_LOCAL_BYTES) {
          throw new Error('Místní obrázky překračují celkový limit 64 MiB.');
        }
        consented.set(source.key, { url: URL.createObjectURL(file), local: true, bytes: file.size });
      }
      if (!active(ticket)) return;
      if (local) assetsRoot = directory;
      display();
    } catch (error) {
      if (!active(ticket)) return;
      if (local && assetsRoot === directory) assetsRoot = undefined;
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        errorText.textContent = error instanceof Error && isMessageKey(error.message)
          ? t(error.message) : t('Obrázek nelze načíst. Zkuste to znovu.');
      }
    } finally {
      if (epoch === version && marker.isConnected) {
        button.disabled = false;
        button.textContent = buttonLabel();
      }
    }
  });
  display();
}

export function hydrateImages(fragment: DocumentFragment): void {
  const batch = prepared.pop() ?? [];
  for (const marker of fragment.querySelectorAll<HTMLElement>('[data-margin-image]')) {
    const index = marker.getAttribute('data-margin-image') ?? '';
    marker.removeAttribute('data-margin-image');
    const metadata = /^\d+$/.test(index) ? batch[Number(index)] : undefined;
    if (metadata) hydrateImage(marker, metadata);
  }
}
