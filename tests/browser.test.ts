import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { resolve } from 'node:path';

test('extension editing, safe rendering and file-save regressions', { timeout: 60000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1440, height: 900 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    const errors: string[] = [];
    const network: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (/^https?:/i.test(request.url())) network.push(request.url()); });
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/index.html`);
    assert.equal(await page.locator('#preview h1').innerText(), 'Prostor pro vaše myšlenky');
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle('regression.md', { create: true });
      const create = handle.createWritable.bind(handle);
      const stream = await create();
      await stream.write('# Original');
      await stream.close();
      let abort = false;
      document.addEventListener('test-abort-save', () => { abort = true; });
      document.addEventListener('test-reset-save', () => { abort = false; });
      handle.createWritable = async () => {
        const writable = await create();
        const close = writable.close.bind(writable);
        writable.close = async () => {
          if (abort) throw new DOMException('Write rejected', 'AbortError');
          await new Promise((resolve) => setTimeout(resolve, 250));
          await close();
        };
        return writable;
      };
      window.showOpenFilePicker = async () => [handle];
      // Chromium Save As can truncate an existing destination before returning its handle.
      window.showSaveFilePicker = async () => {
        await (await create()).close();
        return handle;
      };
    });
    await page.locator('#open-file').click();
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'regression.md');
    const editor = page.locator('.cm-content');
    await editor.fill('# Changed');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Changed');
    await page.locator('#save-file').click();
    await editor.press('Control+z');
    await page.waitForFunction(() => document.querySelector('#dirty-state')?.textContent === 'Beze změn');
    assert.equal(await page.evaluate(() => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    }), true, 'pending write must guard unload after undo');
    await page.waitForFunction(() => document.querySelector('#status-message')?.textContent?.startsWith('Soubor uložen.'));
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');

    await editor.fill('# Save As');
    await page.locator('#save-as').click();
    await page.waitForFunction(() => document.querySelector('#dirty-state')?.textContent === 'Beze změn');
    const diskText = () => page.evaluate(async () => (await (await (await navigator.storage.getDirectory()).getFileHandle('regression.md')).getFile()).text());
    assert.equal(await diskText(), '# Save As', 'Save As to the same truncated file must write the snapshot');

    await page.evaluate(() => document.dispatchEvent(new Event('test-abort-save')));
    await editor.fill('# Rejected');
    await page.locator('#save-file').click();
    await page.waitForFunction(() => document.querySelector('#status-message')?.getAttribute('data-error') === 'true');
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    assert.equal(await diskText(), '# Save As');
    await page.evaluate(() => document.dispatchEvent(new Event('test-reset-save')));

    await page.locator('#new-file').click();
    await page.locator('#discard-dialog').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#discard-cancel').evaluate((button) => button === document.activeElement), true);
    await page.locator('#discard-cancel').click();
    assert.match(await editor.innerText(), /Rejected/);
    await page.locator('#new-file').click();
    await page.locator('#discard-confirm').click();
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'Bez názvu.md');
    await page.evaluate(() => {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['# Dropped file'], 'dropped.md', { type: 'text/markdown' }));
      document.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
    });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Dropped file');
    await page.locator('#file-input').setInputFiles({
      name: 'hostile.md', mimeType: 'text/markdown',
      buffer: Buffer.from('# Safe\n<script>document.title="PWNED"</script>\n![remote](https://example.com/tracker.png)\n[x](javascript:alert(1))\n<svg onload="alert(1)"></svg>'),
    });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Safe');
    assert.equal(await page.locator('#preview img, #preview script, #preview svg, #preview iframe').count(), 0);
    assert.equal(await page.locator('#preview a[href^="javascript:"]').count(), 0);
    assert.match(await page.locator('#preview').innerText(), /Obrázek: remote/);
    assert.deepEqual(network, []);

    await page.locator('[data-mode="source"]').click();
    assert.equal(await page.locator('#preview-pane').isVisible(), false);
    await page.locator('[data-mode="preview"]').click();
    assert.equal(await page.locator('#source-pane').isVisible(), false);
    await page.locator('[data-mode="split"]').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('.cm-gutters').evaluate((node) => getComputedStyle(node).backgroundColor),
      await page.locator('.toolbar').evaluate((node) => getComputedStyle(node).backgroundColor));
    await page.locator('#fullscreen').click();
    await page.waitForFunction(() => !!document.fullscreenElement);
    await page.locator('#fullscreen').click();
    await page.waitForFunction(() => !document.fullscreenElement);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.locator('[data-mode="source"]').click();
    await editor.fill('# Keep this text');
    const closeDialog = page.waitForEvent('dialog');
    const closeAttempt = page.close({ runBeforeUnload: true });
    const question = await closeDialog;
    assert.equal(question.type(), 'beforeunload');
    await question.dismiss();
    await closeAttempt;
    assert.equal(page.isClosed(), false);
    assert.match(await editor.innerText(), /Keep this text/);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
