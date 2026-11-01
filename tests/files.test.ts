import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSaveTarget,
  decodeMarkdown,
  encodeMarkdown,
  FileConflictError,
  getLocalMarkdownUrl,
  MAX_FILE_BYTES,
  prepareSaveTarget,
  readMarkdown,
  validateMarkdownName,
  writeMarkdown,
} from '../src/files';

const encoder = new TextEncoder();

test('preserves UTF-8 BOM and first newline style', async () => {
  const bytes = encoder.encode('\ufeffŽluťoučký\r\nkůň\rřeka\n');
  const loaded = await readMarkdown(new File([bytes], 'poznámky.MARKDOWN'));
  assert.equal(loaded.source, 'Žluťoučký\nkůň\nřeka\n');
  assert.deepEqual(loaded.format, { bom: true, newline: '\r\n' });
  assert.deepEqual(loaded.bytes, bytes);
  assert.deepEqual(encodeMarkdown(loaded.source, loaded.format), encoder.encode('\ufeffŽluťoučký\r\nkůň\r\nřeka\r\n'));
  assert.deepEqual(decodeMarkdown(encoder.encode('a\rb')).format, { bom: false, newline: '\r' });
  assert.deepEqual(decodeMarkdown(encoder.encode('a')).format, { bom: false, newline: '\n' });
});

test('rejects invalid UTF-8, extensions and oversized files', async () => {
  assert.throws(() => decodeMarkdown(Uint8Array.of(0xff)), TypeError);
  await assert.rejects(readMarkdown(new File(['a'], 'notes.txt')), /příponou/);
  await assert.rejects(readMarkdown(new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'large.md')), /limit/);
  assert.equal((await readMarkdown(new File([new Uint8Array(MAX_FILE_BYTES)], 'large.md'))).bytes.length, MAX_FILE_BYTES);
});

function fakeHandle(initial: Uint8Array, failure?: 'write' | 'close') {
  let contents = initial;
  let created = 0;
  let aborted = false;
  const error = new Error(`${failure} failed`);
  const handle = {
    async getFile() {
      return new File([new Uint8Array(contents).buffer], 'notes.md');
    },
    async createWritable() {
      created++;
      let pending: Uint8Array = new Uint8Array();
      return {
        async write(data: Uint8Array) {
          if (failure === 'write') throw error;
          pending = data;
        },
        async close() {
          if (failure === 'close') throw error;
          contents = pending;
        },
        async abort() {
          aborted = true;
        },
      };
    },
  } as unknown as FileSystemFileHandle;
  return { handle, error, contents: () => contents, replace: (bytes: Uint8Array) => { contents = bytes; }, created: () => created, aborted: () => aborted };
}

test('accepts ordinary Markdown names and rejects unsafe Windows names', () => {
  for (const name of ['české poznámky %#.md', 'A.MARKDOWN']) assert.doesNotThrow(() => validateMarkdownName(name));
  for (const name of ['', '.', '..', ' notes.md', 'notes.md ', 'a/b.md', 'a\\b.md', 'a:b.md', 'a?.md', 'a\u0000.md', 'CON.md', 'notes.txt']) {
    assert.throws(() => validateMarkdownName(name));
  }
});

test('preparing a missing target does not create it and creation follows confirmation', async () => {
  const fake = fakeHandle(new Uint8Array());
  let existing = false;
  let creations = 0;
  const directory = {
    async getFileHandle(_name: string, options?: { create?: boolean }) {
      if (options?.create) { existing = true; creations++; return fake.handle; }
      if (!existing) throw new DOMException('missing', 'NotFoundError');
      return fake.handle;
    },
  } as unknown as FileSystemDirectoryHandle;
  assert.deepEqual(await prepareSaveTarget(directory, 'new.md'), { existed: false });
  assert.equal(creations, 0);
  const target = await createSaveTarget(directory, 'new.md');
  assert.equal(creations, 1);
  assert.deepEqual(target.baseline, new Uint8Array());
  await writeMarkdown(target.handle, 'nový', { bom: false, newline: '\n' }, target.baseline);
  assert.deepEqual(fake.contents(), encoder.encode('nový'));
  await assert.rejects(createSaveTarget(directory, 'new.md'), FileConflictError);
  assert.equal(creations, 1);
});

test('a target appearing during creation is checked before writing', async () => {
  const fake = fakeHandle(encoder.encode('another app'));
  const directory = {
    async getFileHandle(_name: string, options?: { create?: boolean }) {
      if (!options?.create) throw new DOMException('missing', 'NotFoundError');
      return fake.handle;
    },
  } as unknown as FileSystemDirectoryHandle;
  const target = await createSaveTarget(directory, 'new.md');
  await assert.rejects(writeMarkdown(target.handle, 'new', { bom: false, newline: '\n' }, target.baseline), FileConflictError);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('another app'));
});

test('preparing an existing target preserves bytes and detects later changes', async () => {
  const original = encoder.encode('original');
  const fake = fakeHandle(original);
  const directory = { async getFileHandle() { return fake.handle; } } as unknown as FileSystemDirectoryHandle;
  const target = await prepareSaveTarget(directory, 'existing.md');
  assert.equal(target.existed, true);
  if (!target.existed) return;
  assert.deepEqual(target.baseline, original);
  assert.equal(fake.created(), 0);
  fake.replace(encoder.encode('external'));
  await assert.rejects(writeMarkdown(target.handle, 'new', { bom: false, newline: '\n' }, target.baseline), FileConflictError);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('external'));
});

test('preparing an existing target preserves its bytes when writing fails', async () => {
  const original = encoder.encode('original');
  const fake = fakeHandle(original, 'close');
  const directory = { async getFileHandle() { return fake.handle; } } as unknown as FileSystemDirectoryHandle;
  const target = await prepareSaveTarget(directory, 'existing.md');
  assert.equal(target.existed, true);
  if (!target.existed) return;
  await assert.rejects(writeMarkdown(target.handle, 'new', { bom: false, newline: '\n' }, target.baseline), (error) => error === fake.error);
  assert.equal(fake.aborted(), true);
  assert.deepEqual(fake.contents(), original);
});

test('lookup propagates permission errors and rejects oversized targets', async () => {
  const denied = new DOMException('denied', 'NotAllowedError');
  const deniedDirectory = { async getFileHandle() { throw denied; } } as unknown as FileSystemDirectoryHandle;
  await assert.rejects(prepareSaveTarget(deniedDirectory, 'file.md'), (error) => error === denied);
  await assert.rejects(createSaveTarget(deniedDirectory, 'file.md'), (error) => error === denied);
  const large = { async getFile() { return { size: MAX_FILE_BYTES + 1 }; } };
  const directory = { async getFileHandle() { return large; } } as unknown as FileSystemDirectoryHandle;
  await assert.rejects(prepareSaveTarget(directory, 'large.md'), /limit/);
});

test('detects same-length changes before opening a writer', async () => {
  const fake = fakeHandle(encoder.encode('new'));
  await assert.rejects(writeMarkdown(fake.handle, 'edited', { bom: false, newline: '\n' }, encoder.encode('old')), FileConflictError);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('new'));
});

test('aborts when the file changes while opening a writer', async () => {
  const original = encoder.encode('old');
  const external = encoder.encode('new');
  const fake = fakeHandle(original);
  const handle = {
    getFile: () => fake.handle.getFile(),
    async createWritable() {
      const writable = await fake.handle.createWritable();
      fake.replace(external);
      return writable;
    },
  } as unknown as FileSystemFileHandle;
  await assert.rejects(writeMarkdown(handle, 'edit', { bom: false, newline: '\n' }, original), FileConflictError);
  assert.equal(fake.created(), 1);
  assert.equal(fake.aborted(), true);
  assert.deepEqual(fake.contents(), external);
});

test('rejects a size conflict without reading the file or opening a writer', async () => {
  const handle = {
    async getFile() {
      return { size: MAX_FILE_BYTES + 1 };
    },
  } as unknown as FileSystemFileHandle;
  await assert.rejects(writeMarkdown(handle, 'edited', { bom: false, newline: '\n' }, encoder.encode('old')), FileConflictError);
});

test('commits and returns encoded bytes only after close', async () => {
  const original = encoder.encode('old');
  const fake = fakeHandle(original);
  const result = await writeMarkdown(fake.handle, 'ž\nř', { bom: true, newline: '\r\n' }, original);
  assert.deepEqual(result, encoder.encode('\ufeffž\r\nř'));
  assert.deepEqual(fake.contents(), result);
  assert.equal(fake.aborted(), false);
});

for (const failure of ['write', 'close'] as const) {
  test(`aborts after ${failure} failure and preserves the original error`, async () => {
    const original = encoder.encode('old');
    const fake = fakeHandle(original, failure);
    await assert.rejects(writeMarkdown(fake.handle, 'new', { bom: false, newline: '\n' }), (error) => error === fake.error);
    assert.equal(fake.aborted(), true);
    assert.deepEqual(fake.contents(), original);
  });
}

test('accepts only local Markdown file URLs', () => {
  assert.equal(getLocalMarkdownUrl('file:///C:/notes%20%C5%BE.MD').protocol, 'file:');
  for (const url of [
    'https://example.com/notes.md',
    'file://server/share/notes.md',
    'file:////server/share/notes.md',
    'file:///%2Fserver/share/notes.md',
    'file:///%5C%5Cserver/share/notes.md',
    'file:///notes.txt',
    'file:///notes%ZZ.md',
    'not a url',
  ]) {
    assert.throws(() => getLocalMarkdownUrl(url), /místní/);
  }
});

test('refuses to write a document too large to reopen', async () => {
  const fake = fakeHandle(encoder.encode('old'));
  await assert.rejects(writeMarkdown(fake.handle, 'a'.repeat(MAX_FILE_BYTES + 1), { bom: false, newline: '\n' }), /limit/);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('old'));
});
