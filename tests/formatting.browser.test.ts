import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { githubSample, initialSample } from '../src/sample';

interface ImagePickerTestWindow extends Window {
  pickerCalls?: number;
  resolveImageFolder?: (folder: FileSystemDirectoryHandle) => void;
}

test('GitHub showcase, strict mode, safe HTML, images and document preservation', { timeout: 180000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, locale: 'en-US',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1440, height: 900 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const url = `chrome-extension://${new URL(worker.url()).host}/index.html`;
    const page = await context.newPage();
    await page.addInitScript(() => { window.showDirectoryPicker = async () => navigator.storage.getDirectory(); });
    const errors: string[] = [];
    const rejectedHandlers: string[] = [];
    let testingUnsafeHtml = false;
    const requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      // Chromium reports blocked handlers while parsing even an inert <template>.
      if (testingUnsafeHtml && message.text().startsWith('Executing inline event handler violates the following Content Security Policy')) rejectedHandlers.push(message.text());
      else errors.push(message.text());
    });
    page.on('request', (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.route('https://example.com/**', (route) => route.fulfill({
      contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16"><rect width="24" height="16" fill="green"/></svg>',
    }));
    await page.goto(url);
    const preview = page.locator('#preview');
    const editor = page.locator('.cm-content');
    assert.equal(await page.locator('html').getAttribute('data-markdown-format'), 'github');
    assert.equal(await preview.locator('.markdown-alert').count(), 5);
    for (const level of [1, 2, 3, 4, 5, 6]) assert.ok(await preview.locator(`h${level}`).count() > 0);
    assert.equal(await preview.locator('details').count(), 1);
    assert.equal(await preview.locator('.footnotes').count(), 1);
    assert.equal(await preview.locator('.task-list-checkbox:disabled').count(), 2);
    assert.match(await preview.innerText(), /🚀/u);
    for (const image of await preview.locator('img').all()) await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => Array.from(document.querySelectorAll<HTMLImageElement>('#preview img')).every((image) => image.complete && image.naturalWidth > 0));
    assert.equal(await preview.locator('img').count(), 3);
    assert.deepEqual(requests, []);
    await preview.locator('a[href="#user-content-code"]').first().click();
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'user-content-code');
    const footnoteId = (await preview.locator('.footnote-ref a').getAttribute('href'))!.slice(1);
    await preview.locator('.footnote-ref a').click();
    assert.equal(await page.evaluate(() => document.activeElement?.id), footnoteId);
    assert.equal(await preview.locator('.footnotes [id]').getAttribute('id'), footnoteId);
    await preview.locator('summary').click();
    assert.equal(await preview.locator('details').getAttribute('open'), '');
    await preview.locator('summary').press('Enter');
    assert.equal(await preview.locator('details').getAttribute('open'), null);

    const saveTo = async (name: string): Promise<string> => {
      await page.locator('#save-as').click();
      await page.locator('#save-name').fill(name);
      await page.locator('#save-select').click();
      await page.waitForFunction((name) => document.querySelector('#doc-name')?.textContent === name
        && !(document.querySelector('#save-as') as HTMLButtonElement).disabled
        && document.querySelector('#dirty-state')?.getAttribute('data-dirty') === 'false', name);
      return page.evaluate(async (name) => (await (await (await navigator.storage.getDirectory()).getFileHandle(name)).getFile()).text(), name);
    };
    assert.equal(await saveTo('showcase.md'), githubSample('en'));

    const source = '# Original\n\n<details><summary>More</summary>Text</details>\n';
    await page.locator('#file-input').setInputFiles({ name: 'mode.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Original');
    await editor.press('Control+Home');
    await editor.press('End');
    await editor.press('x');
    const cursor = await page.locator('#cursor-position').innerText();
    const raw = (await editor.locator('.cm-line').allTextContents()).join('\n');
    await page.locator('#preferences-open').click();
    await page.locator('#markdown-format-setting').selectOption('strict');
    assert.equal(await preview.locator('details').count(), 0);
    assert.match(await preview.innerText(), /<details>/);
    assert.equal((await editor.locator('.cm-line').allTextContents()).join('\n'), raw);
    assert.equal(await page.locator('#cursor-position').innerText(), cursor);
    assert.equal(await page.locator('#dirty-state').getAttribute('data-dirty'), 'true');
    await page.locator('#markdown-format-setting').selectOption('github');
    assert.equal(await preview.locator('details').count(), 1);
    await page.locator('#markdown-format-setting').selectOption('strict');
    await page.locator('#preferences-close').click();
    await editor.press('Control+z');
    assert.equal(await page.locator('#dirty-state').getAttribute('data-dirty'), 'false');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-markdown-format'), 'strict');
    assert.equal(await saveTo('strict-welcome.md'), initialSample('en'));
    await page.evaluate(() => localStorage.setItem('margin.markdownFormat', 'invalid'));
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-markdown-format'), 'github');

    const active = '<style>@import "https://example.com/css";</style><link rel="stylesheet" href="https://example.com/style">'
      + '<iframe src="https://example.com/frame" srcdoc="<img src=https://example.com/srcdoc>"></iframe>'
      + '<svg><image href="https://example.com/svg"/></svg><template><img src="https://example.com/template"></template>'
      + '<div id="save-file" class="toolbar dialog" style="position:fixed"><script>document.documentElement.dataset.executed="yes"</script>'
      + '<form action="https://example.com/post"><input autofocus><button>Submit</button></form>Safe</div>'
      + '<span data-margin-image="0">Forged marker</span><img src="https://example.com/badge.svg" alt="Remote badge" height="25" onerror="alert(1)">';
    testingUnsafeHtml = true;
    await editor.fill('# Safe HTML\n\n' + active);
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Safe HTML');
    testingUnsafeHtml = false;
    assert.equal(await preview.locator('script, iframe, svg, template, link, style, form, input, .toolbar, .dialog, [style], [onerror], [data-margin-image]').count(), 0);
    assert.equal(await page.locator('#save-file').count(), 1);
    assert.equal(await preview.locator('#user-content-save-file').count(), 1);
    assert.equal(await preview.locator('img').count(), 0);
    assert.equal(await page.locator('html').getAttribute('data-executed'), null);
    assert.ok(rejectedHandlers.every((message) => message.includes('The action has been blocked.')));
    assert.deepEqual(requests, []);
    await preview.getByRole('button').click();
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview img')?.naturalWidth);
    assert.equal(await preview.locator('img').evaluate((image) => getComputedStyle(image).height), '25px');
    assert.deepEqual(requests, ['https://example.com/badge.svg']);

    await editor.fill('<div>Old HTML</div>ORPHAN');
    await page.waitForFunction(() => document.querySelector('#preview')?.textContent?.includes('ORPHAN'));
    await editor.fill('# Only');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Only');
    assert.equal((await preview.innerText()).trim(), 'Only');
    await editor.fill('# Topic\n\n# user-content-topic\n\n[second](#user-content-topic)');
    await page.waitForFunction(() => document.querySelectorAll('#preview h1').length === 2);
    assert.deepEqual(await preview.locator('h1').evaluateAll((nodes) => nodes.map((node) => node.id)), ['user-content-topic', 'user-content-user-content-topic']);
    await preview.getByRole('link', { name: 'second', exact: true }).click();
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'user-content-user-content-topic');

    await page.evaluate(async () => {
      const directory = await (await navigator.storage.getDirectory()).getDirectoryHandle('assets', { create: true });
      const writable = await (await directory.getFileHandle('local.svg', { create: true })).createWritable();
      await writable.write('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="12"><rect width="20" height="12" fill="blue"/><image href="https://example.com/local-tracker.svg"/><script>document.documentElement.dataset.executed="yes"</script></svg>');
      await writable.close();
    });
    await editor.fill('# Local image\n\n![Local](assets/local.svg)');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Local image');
    await preview.getByRole('button').press('Enter');
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview img[src^="blob:"]')?.naturalWidth);
    assert.deepEqual(requests, ['https://example.com/badge.svg']);
    assert.equal(await page.locator('html').getAttribute('data-executed'), null);
    const blob = await preview.locator('img').getAttribute('src');
    await saveTo('first-image.md');
    await page.locator('#file-input').setInputFiles({ name: 'second-image.md', mimeType: 'text/markdown', buffer: Buffer.from('# Local image\n\n![Local](assets/local.svg)') });
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'second-image.md');
    assert.equal(await preview.locator('img').count(), 0);
    assert.equal(await preview.getByRole('button').isEnabled(), true);
    await preview.getByRole('button').click();
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview img[src^="blob:"]')?.naturalWidth);
    assert.notEqual(await preview.locator('img').getAttribute('src'), blob);

    await editor.fill('# Invalid image\n\n<img src="../private.svg"><img src="file:///private.svg">');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Invalid image');
    assert.equal(await preview.getByRole('button').count(), 0);
    assert.equal(await preview.locator('img').count(), 0);
    await page.locator('#new-file').click();
    await page.locator('#discard-confirm').click();
    await page.evaluate(() => {
      let cancel = true;
      window.showDirectoryPicker = async () => {
        if (cancel) { cancel = false; throw new DOMException('Cancelled', 'AbortError'); }
        return navigator.storage.getDirectory();
      };
    });
    await editor.fill('# Cancel image\n\n![Local](assets/local.svg)');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Cancel image');
    await preview.getByRole('button').click();
    await page.waitForFunction(() => !(document.querySelector('#preview button') as HTMLButtonElement).disabled);
    assert.equal(await preview.locator('img').count(), 0);
    assert.equal(await preview.locator('.image-error').innerText(), '');
    await preview.getByRole('button').click();
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview img')?.naturalWidth);

    await page.locator('#new-file').click();
    await page.locator('#discard-confirm').click();
    await page.evaluate(() => {
      const state = window as ImagePickerTestWindow;
      state.pickerCalls = 0;
      window.showDirectoryPicker = () => new Promise((resolve) => {
        state.pickerCalls = (state.pickerCalls ?? 0) + 1;
        state.resolveImageFolder = resolve;
      });
    });
    await editor.fill('# Pending image\n\n![Local](assets/local.svg)');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Pending image');
    await preview.getByRole('button').click();
    await page.locator('#new-file').click();
    await page.locator('#discard-confirm').click();
    await page.evaluate(async () => (window as ImagePickerTestWindow).resolveImageFolder?.(await navigator.storage.getDirectory()));
    assert.equal(await preview.locator('img').count(), 0);
    await editor.fill('# Next image\n\n![Local](assets/local.svg)');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Next image');
    await preview.getByRole('button').click();
    assert.equal(await page.evaluate(() => (window as ImagePickerTestWindow).pickerCalls), 2);
    await page.evaluate(async () => (window as ImagePickerTestWindow).resolveImageFolder?.(await navigator.storage.getDirectory()));
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview img')?.naturalWidth);

    await editor.fill('# Repeated\n\n' + '## Duplicate\n\n'.repeat(1000));
    await page.waitForFunction(() => document.querySelectorAll('#preview h2').length === 1000);
    const ids = await preview.locator('h2').evaluateAll((nodes) => nodes.map((node) => node.id));
    assert.equal(new Set(ids).size, 1000);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
