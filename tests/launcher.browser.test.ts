import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

test('launcher opens once, reuses the editor and preserves unsaved documents', { timeout: 60000 }, async () => {
  const extension = resolve('dist');
  const manifest = JSON.parse(await readFile(resolve(extension, 'manifest.json'), 'utf8')) as { action: { default_popup?: string } };
  assert.equal(manifest.action.default_popup, 'launcher.html');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, locale: 'en-US',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  try {
    const errors: string[] = [];
    context.on('page', (page) => page.on('pageerror', (error) => errors.push(error.message)));
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const id = new URL(worker.url()).host;
    const editorUrl = `chrome-extension://${id}/index.html`;
    const firstLauncher = await context.newPage();
    const firstOpened = context.waitForEvent('page');
    await firstLauncher.goto(`chrome-extension://${id}/launcher.html`, { waitUntil: 'commit' }).catch((error: unknown) => {
      if (!firstLauncher.isClosed()) throw error;
    });
    const existing = await firstOpened;
    await existing.waitForURL(editorUrl);
    await existing.locator('.cm-content').fill('# Keep my unsaved document');
    if (!firstLauncher.isClosed()) await firstLauncher.close();
    for (let click = 0; click < 2; click++) {
      const launcher = await context.newPage();
      await launcher.goto(`chrome-extension://${id}/launcher.html`, { waitUntil: 'commit' }).catch((error: unknown) => {
        if (!launcher.isClosed()) throw error;
      });
      await existing.waitForFunction(async () => (await chrome.tabs.getCurrent())?.active === true, undefined, { polling: 50 });
      assert.equal(context.pages().filter((page) => page.url() === editorUrl).length, 1);
      assert.equal(await existing.locator('.cm-content').innerText(), '# Keep my unsaved document');
      assert.equal(await existing.locator('#dirty-state').getAttribute('data-dirty'), 'true');
      if (!launcher.isClosed()) await launcher.close();
    }

    const fallback = await context.newPage();
    await fallback.addInitScript(() => {
      chrome.runtime.getContexts = () => Promise.reject(new Error('Injected launch failure'));
    });
    await fallback.goto(`chrome-extension://${id}/launcher.html`);
    const link = fallback.getByRole('link', { name: 'Margin', exact: true });
    await fallback.waitForFunction(() => document.activeElement === document.querySelector('a'));
    const opened = context.waitForEvent('page');
    await link.click();
    const editor = await opened;
    await editor.waitForURL(editorUrl);
    await editor.locator('#preview h1').waitFor();
    assert.deepEqual(errors, []);
    await existing.locator('.cm-content').press('Control+z');
    assert.equal(await existing.locator('#dirty-state').getAttribute('data-dirty'), 'false');
  } finally {
    await context.close();
  }
});
