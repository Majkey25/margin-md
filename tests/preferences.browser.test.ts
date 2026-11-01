import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import { isMessageKey } from '../src/i18n';

test('language settings follow device preferences and preserve documents', { timeout: 120000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1440, height: 900 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const url = `chrome-extension://${new URL(worker.url()).host}/index.html`;
    const pageWithLanguages = async (languages: string[]): Promise<Page> => {
      const page = await context.newPage();
      await page.addInitScript((values) => {
        Object.defineProperty(navigator, 'languages', { configurable: true, value: values });
      }, languages);
      await page.goto(url);
      return page;
    };
    for (const [languages, locale, label] of [
      [['en-US'], 'en', 'Open'],
      [['cs-CZ'], 'cs', 'Otevřít'],
      [['de-AT'], 'de', 'Öffnen'],
      [['fr-FR'], 'en', 'Open'],
      [['fr-FR', 'de-AT'], 'de', 'Öffnen'],
    ] as const) {
      const page = await pageWithLanguages([...languages]);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('#open-file span').innerText(), label);
      await page.close();
    }

    const page = await pageWithLanguages(['en-US']);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const markers = await page.locator('[data-i18n], [data-i18n-title], [data-i18n-aria-label]').evaluateAll((nodes) =>
      nodes.flatMap((node) => ['data-i18n', 'data-i18n-title', 'data-i18n-aria-label']
        .map((attribute) => node.getAttribute(attribute)).filter((key): key is string => key !== null)));
    assert.ok(markers.length > 0);
    assert.deepEqual(markers.filter((key) => !isMessageKey(key)), []);
    assert.equal(await page.locator('[data-i18n] svg, [data-i18n] kbd').count(), 0);

    const openSettings = async () => {
      await page.locator('#preferences-open').click();
      await page.locator('#preferences-dialog').waitFor({ state: 'visible' });
    };
    for (const language of ['en', 'cs', 'de']) {
      await openSettings();
      await page.locator('#language-setting').selectOption(language);
      assert.equal(await page.locator('html').getAttribute('lang'), language);
      await page.locator('#preferences-close').click();
      await page.reload();
      await openSettings();
      assert.equal(await page.locator('#language-setting').inputValue(), language);
      assert.equal(await page.locator('html').getAttribute('lang'), language);
      assert.equal(await page.evaluate(() => localStorage.getItem('margin.language')), language);
      await page.locator('#preferences-close').click();
    }
    await openSettings();
    await page.locator('#language-setting').selectOption('system');
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'languages', { configurable: true, value: ['de-AT'] });
      window.dispatchEvent(new Event('languagechange'));
    });
    assert.equal(await page.locator('html').getAttribute('lang'), 'de');
    await page.locator('#language-setting').selectOption('cs');
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'languages', { configurable: true, value: ['en-US'] });
      window.dispatchEvent(new Event('languagechange'));
    });
    assert.equal(await page.locator('html').getAttribute('lang'), 'cs');
    await page.locator('#preferences-close').click();
    await page.evaluate(() => localStorage.setItem('margin.language', 'invalid'));
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await openSettings();
    assert.equal(await page.locator('#language-setting').inputValue(), 'system');
    await page.locator('#language-setting').selectOption('en');
    await page.locator('#preferences-close').click();

    await page.locator('#file-input').setInputFiles({
      name: 'český #.md', mimeType: 'text/markdown', buffer: Buffer.from('# Original'),
    });
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'český #.md');
    const editor = page.locator('.cm-content');
    const sourceText = async (): Promise<string> => (await editor.locator('.cm-line').allTextContents()).join('\n');
    const source = '# Edited\n\n![](https://example.com/image.png)\n\n- [ ]';
    await editor.fill(source);
    await page.waitForFunction(() => document.querySelector('#preview .blocked-image')?.textContent?.includes('Image: no description'));
    assert.equal(await page.locator('#preview input[type="checkbox"]').getAttribute('aria-label'), 'Task');
    const cursor = (await page.locator('#cursor-position').innerText()).match(/\d+/g);
    await openSettings();
    for (const profile of ['plain', 'prose', 'code']) {
      await page.locator('#editor-type-setting').selectOption(profile);
      assert.equal(await page.locator('html').getAttribute('data-editor-type'), profile);
      assert.equal(await page.evaluate(() => localStorage.getItem('margin.editorType')), profile);
      assert.equal(await page.locator('.cm-gutters').count(), profile === 'code' ? 1 : 0);
      assert.equal(await page.locator('.cm-activeLine').count(), profile === 'code' ? 1 : 0);
      assert.equal(await editor.locator('span[class]').count() > 0, profile !== 'plain');
      assert.equal(await sourceText(), source);
      assert.deepEqual((await page.locator('#cursor-position').innerText()).match(/\d+/g), cursor);
      assert.equal(await page.locator('#dirty-state').innerText(), 'Unsaved changes');
    }
    await page.locator('#language-setting').selectOption('de');
    assert.equal(await page.locator('html').getAttribute('lang'), 'de');
    assert.equal(await page.locator('#doc-name').innerText(), 'český #.md');
    assert.equal(await sourceText(), source);
    assert.equal(await page.locator('#dirty-state').innerText(), 'Ungespeicherte Änderungen');
    assert.deepEqual((await page.locator('#cursor-position').innerText()).match(/\d+/g), cursor);
    assert.equal(await editor.getAttribute('aria-label'), 'Markdown-Quelltext');
    assert.match(await page.locator('#preview .blocked-image').innerText(), /Bild: ohne Beschreibung/);
    assert.equal(await page.locator('#preview input[type="checkbox"]').getAttribute('aria-label'), 'Aufgabe');
    await page.locator('#preferences-close').click();
    await page.locator('#new-file').click();
    assert.equal(await page.locator('#discard-title').innerText(), 'Ungespeicherte Änderungen verwerfen?');
    await page.locator('#discard-cancel').click();
    await page.locator('#file-input').setInputFiles({ name: 'wrong.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
    await page.waitForFunction(() => document.querySelector('#status-message')?.getAttribute('data-error') === 'true');
    assert.match(await page.locator('#status-message').innerText(), /Endung \.md oder \.markdown/);
    assert.equal(await sourceText(), source);
    await editor.press('Control+z');
    await page.waitForFunction(() => document.querySelector('#dirty-state')?.textContent === 'Keine Änderungen');
    assert.equal(await editor.innerText(), '# Original');
    assert.equal(await page.locator('#doc-name').innerText(), 'český #.md');
    await openSettings();
    await page.locator('#editor-type-setting').selectOption('prose');
    await page.locator('#editor-font-setting').selectOption('serif');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-editor-type'), 'prose');
    assert.equal(await page.locator('.cm-gutters').count(), 0);
    assert.match(await editor.evaluate((node) => getComputedStyle(node).fontFamily), /Georgia/);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
