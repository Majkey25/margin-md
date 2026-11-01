import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

test('preview preserves unchanged blocks and refreshes document-wide references', { timeout: 60000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, locale: 'en-US',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1440, height: 900 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/index.html`);
    const source = '# Stable\n\nChange me\n\n[Reference][target]\n\n'
      + '> Quote\n>\n> - [ ] Nested task\n\n'
      + '| A | B |\n| :- | -: |\n| 1 | 2 |\n\n'
      + '```js\nconst value = 1;\n```\n\n[target]: https://example.com/first\n';
    const editor = page.locator('.cm-content');
    const preview = page.locator('#preview');
    await editor.fill(source);
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Stable');
    const stable = await preview.locator(':scope > h1, :scope > blockquote, :scope > table, :scope > pre').elementHandles();
    assert.equal(stable.length, 4);
    assert.equal(await preview.locator('input:disabled').count(), 1);
    assert.equal(await preview.locator('td.align-right').innerText(), '2');
    await editor.fill(source.replace('Change me', 'Changed paragraph'));
    await page.waitForFunction(() => document.querySelector('#preview > p')?.textContent === 'Changed paragraph');
    for (const node of stable) assert.equal(await node.evaluate((node) => node.parentElement?.id), 'preview');
    assert.equal(await preview.locator('pre').getAttribute('tabindex'), '0');
    assert.ok(await preview.locator('pre span[class]').count() > 0);

    await editor.fill(source.replace('/first', '/second'));
    await page.waitForFunction(() => document.querySelector('#preview a')?.getAttribute('href') === 'https://example.com/second');
    for (const node of stable) assert.equal(await node.evaluate((node) => node.parentElement?.id), 'preview');

    await editor.fill('Before\n\n' + source + '\n---\n\nAfter');
    await page.waitForFunction(() => document.querySelector('#preview')?.lastElementChild?.textContent === 'After');
    assert.deepEqual(await preview.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.tagName)),
      ['P', 'H1', 'P', 'P', 'BLOCKQUOTE', 'TABLE', 'PRE', 'HR', 'P']);
    await editor.fill('## Replacement\n\n1. One\n2. Two\n\n![offline](https://example.com/a.png)');
    await page.waitForFunction(() => document.querySelector('#preview h2')?.textContent === 'Replacement');
    assert.deepEqual(await preview.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.tagName)), ['H2', 'OL', 'P']);
    assert.equal(await preview.locator('img, script, iframe').count(), 0);
    await editor.fill('');
    await page.waitForFunction(() => document.querySelector('#preview')?.childNodes.length === 0);
    await editor.fill('# Recovered');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Recovered');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
