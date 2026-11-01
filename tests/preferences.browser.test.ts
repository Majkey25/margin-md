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
    await page.waitForFunction(() => document.querySelector('#open-file')?.hasAttribute('disabled') === false);
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

test('settings cards stay in sync and preserve an edited document', { timeout: 120000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, locale: 'cs-CZ',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1440, height: 900 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/index.html`);
    await page.locator('#file-input').setInputFiles({
      name: 'cards.md', mimeType: 'text/markdown', buffer: Buffer.from('# Original'),
    });
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'cards.md');
    const editor = page.locator('.cm-content');
    const source = '# Draft\n\nText with **formatting**.';
    const editorText = async () => (await editor.locator('.cm-line').allTextContents()).join('\n');
    await editor.fill(source);
    const cursor = await page.locator('#cursor-position').innerText();
    await page.locator('#preferences-open').click();
    await page.locator('#preferences-dialog').waitFor({ state: 'visible' });
    const appPreview = page.locator('.theme-preview').first();
    const markdownPreview = page.locator('.markdown-style-preview').first();
    const lightApp = await appPreview.screenshot();
    const lightMarkdown = await markdownPreview.screenshot();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.notDeepEqual(await appPreview.screenshot(), lightApp, 'application preview follows dark mode');
    assert.notDeepEqual(await markdownPreview.screenshot(), lightMarkdown, 'Markdown preview follows dark mode');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');

    const groups = [
      { id: 'surface-setting', key: 'margin.surface', values: ['minimal', 'glass', 'material', 'fluent', 'nord', 'paper', 'terminal'] },
      { id: 'preview-theme-setting', key: 'margin.previewTheme', values: ['github', 'vscode', 'reading', 'nord', 'paper', 'terminal'] },
      { id: 'editor-type-setting', key: 'margin.editorType', values: ['code', 'prose', 'plain'] },
    ];
    for (const group of groups) {
      const cards = page.locator(`button[data-setting="${group.id}"]`);
      const select = page.locator(`#${group.id}`);
      assert.equal(await cards.count(), group.values.length);
      for (const value of group.values) {
        const card = page.locator(`button[data-setting="${group.id}"][data-value="${value}"]`);
        await card.click();
        assert.equal(await select.inputValue(), value);
        assert.equal(await card.getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator(`button[data-setting="${group.id}"][aria-pressed="true"]`).count(), 1);
        assert.equal(await page.evaluate((key) => localStorage.getItem(key), group.key), value);
        assert.equal(await editorText(), source);
        assert.equal(await page.locator('#cursor-position').innerText(), cursor);
        assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
      }
      await select.selectOption(group.values[0]);
      assert.equal(await page.locator(`button[data-setting="${group.id}"][data-value="${group.values[0]}"]`).getAttribute('aria-pressed'), 'true');
      await page.locator(`button[data-setting="${group.id}"][data-value="${group.values[group.values.length - 1]}"]`).click();
    }

    await page.locator('#editor-font-setting').selectOption('serif');
    await page.locator('#editor-size-setting').selectOption('18');
    await page.locator('#preview-font-setting').selectOption('serif');
    await page.locator('#preview-size-setting').selectOption('20');
    const sourceSample = page.locator('.editor-font-sample').first();
    const previewSample = page.locator('[data-follow-preview]').first();
    assert.match(await sourceSample.evaluate((node) => getComputedStyle(node).fontFamily), /Georgia/);
    assert.equal(await sourceSample.evaluate((node) => getComputedStyle(node).fontSize), '18px');
    assert.match(await previewSample.evaluate((node) => getComputedStyle(node).fontFamily), /Georgia/);
    assert.equal(await previewSample.evaluate((node) => getComputedStyle(node).fontSize), '20px');
    assert.equal(await editorText(), source);
    assert.equal(await page.locator('#cursor-position').innerText(), cursor);
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    await page.locator('#preferences-close').click();
    await editor.press('Control+z');
    await page.waitForFunction(() => document.querySelector('#dirty-state')?.textContent === 'Beze změn');
    assert.equal(await editorText(), '# Original');
    assert.equal(await page.locator('#doc-name').innerText(), 'cards.md');

    await page.reload();
    await page.locator('#preferences-open').click();
    for (const group of groups) {
      const value = group.values[group.values.length - 1];
      assert.equal(await page.locator(`#${group.id}`).inputValue(), value);
      assert.equal(await page.locator(`button[data-setting="${group.id}"][data-value="${value}"]`).getAttribute('aria-pressed'), 'true');
    }
    assert.equal(await page.locator('#editor-font-setting').inputValue(), 'serif');
    assert.equal(await page.locator('#editor-size-setting').inputValue(), '18');
    assert.equal(await page.locator('#preview-font-setting').inputValue(), 'serif');
    assert.equal(await page.locator('#preview-size-setting').inputValue(), '20');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
