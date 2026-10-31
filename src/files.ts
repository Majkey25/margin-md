export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface TextFormat {
  newline: '\n' | '\r\n' | '\r';
  bom: boolean;
}

export interface LoadedFile {
  name: string;
  source: string;
  format: TextFormat;
  bytes: Uint8Array;
  handle?: FileSystemFileHandle;
}

export function decodeMarkdown(bytes: Uint8Array): { source: string; format: TextFormat } {
  const bom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch {
    throw new TypeError('Soubor není platný text UTF-8.');
  }
  const newline = text.match(/\r\n|\r|\n/)?.[0] as TextFormat['newline'] | undefined;
  return { source: text.replace(/\r\n|\r/g, '\n'), format: { newline: newline ?? '\n', bom } };
}

export function encodeMarkdown(source: string, format: TextFormat): Uint8Array<ArrayBuffer> {
  const text = source.replace(/\r\n|\r|\n/g, format.newline);
  return new TextEncoder().encode((format.bom ? '\ufeff' : '') + text);
}

export async function readMarkdown(file: File, handle?: FileSystemFileHandle): Promise<LoadedFile> {
  if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('Vyberte soubor s příponou .md nebo .markdown.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Soubor překračuje limit 5 MiB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length > MAX_FILE_BYTES) throw new Error('Soubor překračuje limit 5 MiB.');
  return { name: file.name, ...decodeMarkdown(bytes), bytes, handle };
}

export class FileConflictError extends Error {
  constructor() {
    super('File changed since it was opened.');
    this.name = 'FileConflictError';
  }
}

export async function writeMarkdown(
  handle: FileSystemFileHandle,
  source: string,
  format: TextFormat,
  baseline?: Uint8Array,
): Promise<Uint8Array> {
  if (baseline) {
    const file = await handle.getFile();
    if (file.size !== baseline.length) throw new FileConflictError();
    const current = new Uint8Array(await file.arrayBuffer());
    if (current.length !== baseline.length || current.some((byte, index) => byte !== baseline[index])) {
      throw new FileConflictError();
    }
  }
  const bytes = encodeMarkdown(source, format);
  if (bytes.length > MAX_FILE_BYTES) throw new Error('Text překračuje limit 5 MiB. Před uložením jej zkraťte.');
  const writable = await handle.createWritable();
  try {
    await writable.write(bytes);
    await writable.close();
  } catch (error) {
    try {
      await writable.abort();
    } catch {
      // Preserve the original write or close error.
    }
    throw error;
  }
  return bytes;
}

export function getLocalMarkdownUrl(value: string): URL {
  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname).replace(/\\/g, '/');
    if (url.protocol === 'file:' && !url.hostname && !path.startsWith('//') && /\.(md|markdown)$/i.test(path)) {
      return url;
    }
  } catch {
    // Report malformed URLs and percent encoding consistently.
  }
  throw new Error('URL must refer to a local .md or .markdown file.');
}
