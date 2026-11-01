import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { resolve } from 'node:path';

test('extension editing, safe rendering and file-save regressions', { timeout: 60000 }, async () => {
  const extension = resolve('dist');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    locale: 'cs-CZ',
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    // Keep the complete sample mounted while testing persisted editor typography.
    viewport: { width: 1440, height: 1200 },
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.addInitScript(() => localStorage.setItem('margin.markdownFormat', 'strict'));
    const errors: string[] = [];
    const network: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => { if (/^https?:/i.test(request.url())) network.push(request.url()); });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/index.html`);
    const theme = page.locator('#theme-setting');
    const surface = page.locator('#surface-setting');
    const toggle = page.locator('#theme-toggle');
    const openPreferences = async () => {
      await page.locator('#preferences-open').click();
      await page.locator('#preferences-dialog').waitFor({ state: 'visible' });
    };
    await openPreferences();
    assert.equal(await theme.inputValue(), 'system');
    assert.equal(await surface.inputValue(), 'minimal');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    const sampleText = await page.locator('.cm-content').innerText();
    const previewTheme = page.locator('#preview-theme-setting');
    const previewFont = page.locator('#preview-font-setting');
    const previewSize = page.locator('#preview-size-setting');
    const editorFont = page.locator('#editor-font-setting');
    const editorSize = page.locator('#editor-size-setting');
    for (const [control, value] of [[previewTheme, 'github'], [previewFont, 'default'], [previewSize, 'default'], [editorFont, 'system'], [editorSize, '14']] as const) {
      assert.equal(await control.inputValue(), value);
    }
    assert.equal(await page.locator('html').getAttribute('data-preview-theme'), 'github');
    await page.evaluate(() => {
      for (const key of ['previewTheme', 'previewFont', 'previewSize', 'editorFont', 'editorSize']) {
        localStorage.setItem(`margin.${key}`, 'invalid; color: red');
      }
    });
    await page.reload();
    await openPreferences();
    for (const [control, value] of [[previewTheme, 'github'], [previewFont, 'default'], [previewSize, 'default'], [editorFont, 'system'], [editorSize, '14']] as const) {
      assert.equal(await control.inputValue(), value);
    }
    assert.equal(await page.locator('html').getAttribute('data-preview-theme'), 'github');
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--preview-size')), '');
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--editor-size')), '14px');
    await previewTheme.selectOption('vscode');
    await previewFont.selectOption('serif');
    await previewSize.selectOption('18');
    await editorFont.selectOption('cascadia');
    await editorSize.selectOption('16');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('html').getAttribute('data-surface'), 'minimal');
    assert.equal(await page.locator('html').getAttribute('data-preview-theme'), 'vscode');
    assert.match(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--preview-font')), /Georgia/);
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--preview-size')), '18px');
    assert.match(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--editor-font')), /Cascadia/);
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--code-lh')), '26px');
    assert.equal(await page.locator('#preview').evaluate((node) => getComputedStyle(node).fontSize), '18px');
    assert.equal(await page.locator('#editor .cm-scroller').evaluate((node) => getComputedStyle(node).fontSize), '16px');
    await page.reload();
    await openPreferences();
    for (const [control, value] of [[previewTheme, 'vscode'], [previewFont, 'serif'], [previewSize, '18'], [editorFont, 'cascadia'], [editorSize, '16']] as const) {
      assert.equal(await control.inputValue(), value);
    }
    for (const value of ['reading', 'nord', 'github']) {
      await previewTheme.selectOption(value);
      assert.equal(await page.locator('html').getAttribute('data-preview-theme'), value);
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      assert.equal(await page.locator('html').getAttribute('data-surface'), 'minimal');
      if (value === 'nord') {
        assert.equal(await page.evaluate(() => localStorage.getItem('margin.previewTheme')), 'nord');
        await page.reload();
        await openPreferences();
        assert.equal(await previewTheme.inputValue(), 'nord');
        assert.equal(await page.locator('html').getAttribute('data-preview-theme'), 'nord');
        assert.equal(await page.locator('.cm-content').innerText(), sampleText);
      }
    }
    await previewFont.selectOption('default');
    await previewSize.selectOption('default');
    await editorFont.selectOption('system');
    await editorSize.selectOption('14');
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--preview-font')), '');
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--preview-size')), '');
    await page.evaluate(() => {
      for (const id of ['preview-theme-setting', 'preview-font-setting', 'preview-size-setting', 'editor-font-setting', 'editor-size-setting']) {
        const select = document.getElementById(id) as HTMLSelectElement;
        select.add(new Option('Invalid', 'invalid; color: red'));
        select.value = 'invalid; color: red';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    for (const [control, value] of [[previewTheme, 'github'], [previewFont, 'default'], [previewSize, 'default'], [editorFont, 'system'], [editorSize, '14']] as const) {
      assert.equal(await control.inputValue(), value);
    }
    assert.equal(await page.locator('html').getAttribute('data-preview-theme'), 'github');
    assert.equal(await page.locator('html').evaluate((root) => root.style.getPropertyValue('--editor-size')), '14px');
    await page.keyboard.press('Control+s');
    assert.equal(await page.locator('#save-dialog').evaluate((dialog) => (dialog as HTMLDialogElement).open), false);
    assert.equal(await page.locator('.cm-content').innerText(), sampleText);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await theme.selectOption('dark');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => matchMedia('(prefers-color-scheme: dark)').matches);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => !matchMedia('(prefers-color-scheme: dark)').matches);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('margin.theme')), 'dark');
    await page.reload();
    await openPreferences();
    assert.equal(await theme.inputValue(), 'dark');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await theme.selectOption('system');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('margin.theme')), 'system');
    await page.reload();
    await openPreferences();
    assert.equal(await theme.inputValue(), 'system');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    for (const value of ['glass', 'material', 'fluent', 'nord', 'minimal']) {
      await surface.selectOption(value);
      assert.equal(await page.locator('html').getAttribute('data-surface'), value);
      assert.equal(await page.evaluate(() => localStorage.getItem('margin.surface')), value);
      assert.equal(await page.locator('.cm-content').innerText(), sampleText);
      assert.equal(await page.locator('#dirty-state').innerText(), 'Beze změn');
      await page.reload();
      await openPreferences();
      assert.equal(await surface.inputValue(), value);
      assert.equal(await page.locator('html').getAttribute('data-surface'), value);
      assert.equal(await page.locator('.cm-content').innerText(), sampleText);
    }
    await page.locator('#preferences-close').click();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => {
      const root = document.documentElement;
      const start = document.startViewTransition;
      document.startViewTransition = function (...args) {
        root.dataset.testTransitionCalls = String(Number(root.dataset.testTransitionCalls || '0') + 1);
        return Reflect.apply(start, document, args) as ViewTransition;
      };
      const animate = root.animate;
      root.animate = function (keyframes, options) {
        if (typeof options === 'object' && options?.pseudoElement === '::view-transition-new(root)') {
          root.dataset.testThemeAnimation = JSON.stringify(keyframes);
        }
        return animate.call(root, keyframes, options);
      };
    });
    await toggle.click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light' && !document.documentElement.classList.contains('theme-switch'));
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.match(await page.locator('html').getAttribute('data-test-theme-animation') ?? '', /circle\(0 at/);
    await page.evaluate(() => {
      const button = document.getElementById('theme-toggle') as HTMLButtonElement;
      button.click();
      button.click();
    });
    await page.waitForFunction(() => !document.documentElement.classList.contains('theme-switch'));
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.evaluate(() => localStorage.getItem('margin.theme')), 'light');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const transitionCalls = await page.locator('html').getAttribute('data-test-transition-calls');
    await toggle.click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('html').getAttribute('data-test-transition-calls'), transitionCalls);
    assert.equal(await page.locator('html').evaluate((root) => root.classList.contains('theme-switch')), false);
    assert.equal(await page.locator('#preview h1').innerText(), 'Prostor pro vaše myšlenky');
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle('regression.md', { create: true });
      const create = handle.createWritable.bind(handle);
      const stream = await create();
      await stream.write('# Original');
      await stream.close();
      let failure = '';
      document.addEventListener('test-fail-write', () => { failure = 'write'; });
      document.addEventListener('test-fail-close', () => { failure = 'close'; });
      document.addEventListener('test-reset-save', () => { failure = ''; });
      handle.createWritable = async () => {
        const writable = await create();
        const write = writable.write.bind(writable);
        const close = writable.close.bind(writable);
        writable.write = async (data) => {
          if (failure === 'write') throw new DOMException('Write rejected', 'AbortError');
          await write(data);
        };
        writable.close = async () => {
          if (failure === 'close') throw new DOMException('Close rejected', 'AbortError');
          await new Promise((resolve) => setTimeout(resolve, 250));
          await close();
        };
        return writable;
      };
      const getFileHandle = root.getFileHandle.bind(root);
      root.getFileHandle = async (name, options) => name === 'regression.md' ? handle : getFileHandle(name, options);
      window.showOpenFilePicker = async () => [handle];
      window.showSaveFilePicker = async () => {
        document.documentElement.dataset.unsafePicker = 'called';
        throw new Error('Unsafe save picker was called');
      };
      window.showDirectoryPicker = async (options) => {
        if (options?.mode !== 'readwrite') throw new Error('Directory picker requires write access');
        return root;
      };
    });
    await page.locator('#open-file').click();
    await page.waitForFunction(() => document.querySelector('#doc-name')?.textContent === 'regression.md');
    const editor = page.locator('.cm-content');
    await editor.fill('# Changed');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Changed');
    await openPreferences();
    for (const value of ['glass', 'material', 'fluent', 'nord', 'minimal']) {
      await surface.selectOption(value);
      assert.equal(await editor.innerText(), '# Changed');
      assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    }
    await previewTheme.selectOption('nord');
    await previewFont.selectOption('mono');
    await previewSize.selectOption('20');
    await editorFont.selectOption('consolas');
    await editorSize.selectOption('18');
    assert.equal(await editor.innerText(), '# Changed');
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    await previewTheme.selectOption('github');
    await previewFont.selectOption('default');
    await previewSize.selectOption('default');
    await editorFont.selectOption('system');
    await editorSize.selectOption('14');
    await page.locator('#preferences-close').click();
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

    const diskBytes = () => page.evaluate(async () => Array.from(new Uint8Array(await (await (await (await navigator.storage.getDirectory()).getFileHandle('regression.md')).getFile()).arrayBuffer())));
    const saveAsExisting = async () => {
      await page.locator('#save-as').click();
      await page.locator('#save-dialog').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#save-name').inputValue(), 'regression.md');
      await page.locator('#save-select').click();
      await page.locator('#discard-dialog').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#discard-title').innerText(), 'Nahradit existující soubor?');
    };
    const waitForSave = () => page.waitForFunction(() => !(document.querySelector('#save-as') as HTMLButtonElement).disabled);

    await editor.fill('# Save As');
    await saveAsExisting();
    await page.locator('#discard-confirm').click();
    await waitForSave();
    assert.equal(await page.locator('#dirty-state').innerText(), 'Beze změn');
    const savedBytes = Array.from(Buffer.from('# Save As'));
    assert.deepEqual(await diskBytes(), savedBytes);

    await editor.fill('# Cancelled');
    await saveAsExisting();
    await page.locator('#discard-cancel').click();
    await waitForSave();
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    assert.deepEqual(await diskBytes(), savedBytes);

    for (const failure of ['write', 'close']) {
      await page.evaluate((event) => document.dispatchEvent(new Event(event)), `test-fail-${failure}`);
      await editor.fill(`# Rejected ${failure}`);
      await saveAsExisting();
      await page.locator('#discard-confirm').click();
      await waitForSave();
      assert.equal(await page.locator('#status-message').getAttribute('data-error'), 'true');
      assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
      assert.deepEqual(await diskBytes(), savedBytes);
      await page.evaluate(() => document.dispatchEvent(new Event('test-reset-save')));
    }
    assert.equal(await page.locator('html').getAttribute('data-unsafe-picker'), null);

    await page.evaluate(() => document.dispatchEvent(new Event('test-fail-close')));
    await editor.fill('# Rejected');
    await page.locator('#save-file').click();
    await waitForSave();
    assert.equal(await page.locator('#status-message').getAttribute('data-error'), 'true');
    assert.equal(await page.locator('#dirty-state').innerText(), 'Neuložené změny');
    assert.deepEqual(await diskBytes(), savedBytes);
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

    await page.locator('#file-input').setInputFiles({
      name: 'formatting.md', mimeType: 'text/markdown',
      buffer: Buffer.from('# Formatting\n\n**Bold** *italic* ~~removed~~\n\n- Parent\n  - Child\n\n```js\nconst value = 1;\n```\n\n| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |'),
    });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Formatting');
    assert.equal(await page.locator('#preview strong').innerText(), 'Bold');
    assert.equal(await page.locator('#preview em').innerText(), 'italic');
    assert.equal(await page.locator('#preview s').innerText(), 'removed');
    assert.equal(await page.locator('#preview ul ul li').innerText(), 'Child');
    assert.equal(await page.locator('#preview pre code').innerText(), 'const value = 1;\n');
    assert.ok(await page.locator('#preview pre .tok-keyword').count() > 0);
    for (const alignment of ['left', 'center', 'right']) {
      assert.equal(await page.locator(`#preview th.align-${alignment}, #preview td.align-${alignment}`).count(), 2);
    }
    assert.equal(await page.locator('#preview [style]').count(), 0);

    const taskSource = '# Tasks\n\n- [ ] Parent\n  - [X] Child\n- \\[x] Escaped\n- `[x] Code`\n- [x][reference] Link\n\n---\n\n- [x] Loose task\n\n  Later paragraph [x] stays text.\n\n[reference]: https://example.com/\n\n';
    const htmlCode = '<img src="https://example.com/tracker.png" onerror="alert(1)">\n<script>alert(1)</script>\n';
    const unknownCode = '<script>literal unknown fence</script>\n';
    await page.locator('#file-input').setInputFiles({
      name: 'tasks-and-code.md', mimeType: 'text/markdown',
      buffer: Buffer.from(taskSource + '```html\n' + htmlCode + '```\n\n```constructor\n' + unknownCode + '```\n'),
    });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Tasks');
    const checkboxes = page.locator('#preview .task-list-checkbox');
    assert.equal(await checkboxes.count(), 3);
    assert.deepEqual(await checkboxes.evaluateAll((nodes) => nodes.map((node) => ({
      checked: (node as HTMLInputElement).checked, disabled: (node as HTMLInputElement).disabled, label: node.getAttribute('aria-label'),
    }))), [
      { checked: false, disabled: true, label: 'Parent' },
      { checked: true, disabled: true, label: 'Child' },
      { checked: true, disabled: true, label: 'Loose task' },
    ]);
    assert.match(await page.locator('#preview').innerText(), /\[x\] Escaped/);
    assert.match(await page.locator('#preview').innerText(), /Later paragraph \[x\] stays text/);
    assert.equal(await page.locator('#preview pre code').nth(0).textContent(), htmlCode);
    assert.ok(await page.locator('#preview pre').nth(0).locator('span').count() > 0);
    assert.equal(await page.locator('#preview pre code').nth(1).textContent(), unknownCode);
    assert.equal(await page.locator('#preview pre').nth(1).locator('span').count(), 0);
    assert.equal(await page.locator('#preview script, #preview img, #preview iframe').count(), 0);
    assert.deepEqual(network, []);

    const largeCode = 'const value = 1;\n'.repeat(800);
    await page.locator('#file-input').setInputFiles({
      name: 'highlight-budget.md', mimeType: 'text/markdown',
      buffer: Buffer.from('# Highlight budget\n\n```js\n' + largeCode + '```\n\n```js\n' + largeCode + '```\n'),
    });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Highlight budget');
    const fences = page.locator('#preview pre');
    assert.ok(await fences.nth(0).locator('span').count() > 0);
    assert.equal(await fences.nth(1).locator('span').count(), 0);
    assert.equal(await fences.nth(1).locator('code').textContent(), largeCode);

    await page.locator('[data-mode="source"]').click();
    assert.equal(await page.locator('#preview-pane').isVisible(), false);
    await page.locator('[data-mode="preview"]').click();
    assert.equal(await page.locator('#source-pane').isVisible(), false);
    await page.locator('[data-mode="split"]').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
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
