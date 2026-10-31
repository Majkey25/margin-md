import assert from 'node:assert/strict';
import test from 'node:test';
import {
  decodeMarkdown,
  encodeMarkdown,
  FileConflictError,
  getLocalMarkdownUrl,
  MAX_FILE_BYTES,
  readMarkdown,
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
  return { handle, error, contents: () => contents, created: () => created, aborted: () => aborted };
}

test('detects same-length changes before opening a writer', async () => {
  const fake = fakeHandle(encoder.encode('new'));
  await assert.rejects(writeMarkdown(fake.handle, 'edited', { bom: false, newline: '\n' }, encoder.encode('old')), FileConflictError);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('new'));
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
    assert.throws(() => getLocalMarkdownUrl(url), /local/);
  }
});

test('refuses to write a document too large to reopen', async () => {
  const fake = fakeHandle(encoder.encode('old'));
  await assert.rejects(writeMarkdown(fake.handle, 'a'.repeat(MAX_FILE_BYTES + 1), { bom: false, newline: '\n' }), /limit/);
  assert.equal(fake.created(), 0);
  assert.deepEqual(fake.contents(), encoder.encode('old'));
});
