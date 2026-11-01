import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { initialSample } from '../src/sample';

interface DelayedDiagramWindow extends Window { releaseDiagram?: () => void }

test('GitHub diagrams and math render offline; Strict keeps literal source', { timeout: 120000 }, async () => {
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
    const remote: string[] = [];
    const scripts: string[] = [];
    const editor = page.locator('.cm-content');
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => {
      if (/^https?:/.test(request.url())) remote.push(request.url());
      if (request.resourceType() === 'script') scripts.push(request.url());
    });
    await page.addInitScript(() => {
      if (location.pathname !== '/index.html') return;
      localStorage.setItem('margin.markdownFormat', 'strict');
      const descriptor = Object.getOwnPropertyDescriptor(MessagePort.prototype, 'onmessage')!;
      let held = false;
      // Hold the first real renderer response to exercise a theme change during the first render.
      Object.defineProperty(MessagePort.prototype, 'onmessage', {
        get: descriptor.get,
        set(this: MessagePort, handler: MessagePort['onmessage']) {
          descriptor.set!.call(this, handler && ((event: MessageEvent) => {
            if (held) handler.call(this, event);
            else {
              held = true;
              (window as DelayedDiagramWindow).releaseDiagram = () => handler.call(this, event);
            }
          }));
        },
      });
    });
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/index.html`);
    assert.equal(await page.locator('#preview h1').innerText(), initialSample('en').split('\n')[0].slice(2));
    assert.equal(await page.locator('iframe').count(), 0);
    assert.equal(scripts.some((url) => /katex|diagram/.test(url)), false);
    const source = '# Diagrams and math\n\n```mermaid\nflowchart LR\n accTitle: Local flow\n A[Source] --> B[Preview]\n```\n\n'
      + 'Inline $e^{i\\pi}+1=0$ and $`x^2`$. Literal `$$not math$$` and \\$5.\n\n'
      + '$$\nx=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\n$$\n\n```math\n\\int_0^1 x^2\\,dx=\\frac{1}{3}\n```\n';
    await page.locator('#file-input').setInputFiles({ name: 'formulas.md', mimeType: 'text/markdown', buffer: Buffer.from(source) });
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Diagrams and math');
    assert.equal(await page.locator('#preview math, #preview img').count(), 0);
    assert.match(await page.locator('#preview').innerText(), /\$e\^/);
    await page.locator('#preferences-open').click();
    await page.locator('#markdown-format-setting').selectOption('github');
    await page.locator('#preferences-close').click();
    for (const node of await page.locator('#preview [data-rich-state]').all()) {
      await node.scrollIntoViewIfNeeded();
    }
    await page.waitForFunction(() => typeof (window as DelayedDiagramWindow).releaseDiagram === 'function');
    assert.equal(await page.locator('#preview code.language-mermaid').getAttribute('data-rich-state'), 'pending');
    await page.locator('#theme-toggle').click();
    await page.evaluate(() => (window as DelayedDiagramWindow).releaseDiagram?.());
    await page.waitForFunction(() => document.querySelectorAll('#preview [data-rich-state="ready"]').length === 5);
    await page.waitForFunction(() => !!document.querySelector<HTMLImageElement>('#preview .markdown-diagram img')?.naturalWidth);
    assert.equal(await page.locator('#preview math').count(), 4);
    assert.equal(await page.locator('#preview math[display="block"]').count(), 2);
    assert.equal(await page.locator('#preview .markdown-diagram img').count(), 1);
    assert.equal(await page.locator('#preview .markdown-diagram img').getAttribute('alt'), 'Local flow');
    const sandbox = page.frames().find((frame) => frame.url().endsWith('/diagram.html'))!;
    assert.deepEqual(await sandbox.evaluate(() => {
      let parentReadable = false;
      try { parentReadable = !!parent.document; } catch { /* An opaque sandbox must reject this access. */ }
      return { parentReadable, extensionApi: typeof chrome !== 'undefined' && !!chrome.runtime?.id, origin: self.origin };
    }), { parentReadable: false, extensionApi: false, origin: 'null' });
    assert.equal(await page.locator('#preview svg, #preview iframe, #preview [href^="javascript:"]').count(), 0);
    assert.match(await page.locator('#preview').innerText(), /Literal \$\$not math\$\$ and \$5/);
    assert.deepEqual(remote, []);
    assert.deepEqual(errors, []);
    const image = await page.locator('#preview .markdown-diagram img').elementHandle();
    await editor.press('Control+End');
    await page.keyboard.insertText('\n\nTail paragraph');
    await page.waitForFunction(() => document.querySelector('#preview p:last-child')?.textContent === 'Tail paragraph');
    assert.equal(await image!.evaluate((node) => node.isConnected), true);
    const light = await image!.getAttribute('src');
    await page.locator('#theme-toggle').click();
    await page.waitForFunction((light) => {
      const image = document.querySelector<HTMLImageElement>('#preview .markdown-diagram img');
      return image && image.src !== light && image.complete && image.naturalWidth > 0;
    }, light);
    await page.locator('#preferences-open').click();
    await page.locator('#markdown-format-setting').selectOption('strict');
    assert.equal(await page.locator('#preview math, #preview img, iframe').count(), 0);
    assert.match(await page.locator('#preview').innerText(), /flowchart LR/);
    assert.equal(await page.locator('#dirty-state').getAttribute('data-dirty'), 'true');
    await page.locator('#preferences-close').click();
    await editor.press('Control+z');
    assert.equal(await page.locator('#dirty-state').getAttribute('data-dirty'), 'false');
    await page.locator('#preferences-open').click();
    await page.locator('#markdown-format-setting').selectOption('github');
    await page.locator('#preferences-close').click();
    await editor.fill('# Invalid\n\n```mermaid\nNOT A DIAGRAM\n```\n\n$\\frac{1}{$\n\n$\\includegraphics{https://example.com/tracker.svg}$\n');
    await page.waitForFunction(() => document.querySelectorAll('#preview [data-rich-state="error"]').length === 2
      && document.querySelectorAll('#preview math').length === 1);
    assert.match(await page.locator('#preview').innerText(), /NOT A DIAGRAM/);
    assert.equal(await page.locator('#preview img, #preview svg').count(), 0);
    assert.match(await page.locator('#preview math annotation').textContent() ?? '', /includegraphics/);
    await editor.fill('# Safe\n\n```mermaid\n%%{init: {"securityLevel":"loose","htmlLabels":true,"themeCSS":"@import url(https://example.com/style);"}}%%\nflowchart LR\n accTitle: Safe graph\n A[Safe] --> B[Local]\n click A "javascript:alert(1)"\n```\n\n$\\href{https://example.com/math}{secret}$');
    await page.waitForFunction(() => document.querySelector('#preview [data-rich-state="ready"] img') !== null);
    assert.equal(await page.locator('#preview a, #preview iframe, #preview svg').count(), 0);
    assert.deepEqual(remote, []);
    assert.deepEqual(errors, []);
    await editor.fill('# Bounded\n\n$' + 'x+'.repeat(4100) + 'x$');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Bounded');
    assert.equal(await page.locator('#preview math').count(), 0);
    assert.match(await page.locator('#preview .math-inline').getAttribute('title') ?? '', /complexity limit/);
    // A pending result from the previous document cannot appear in the next document.
    await editor.fill('# Pending\n\n```mermaid\nsequenceDiagram\n A->>B: Hello\n```');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Pending');
    await page.locator('#new-file').click();
    await page.locator('#discard-confirm').click();
    await page.waitForFunction(() => document.querySelector('#preview')?.childNodes.length === 0
      && !(document.querySelector('#new-file') as HTMLButtonElement).disabled);
    await editor.fill('# Replacement\n\nNo diagram.');
    await page.waitForFunction(() => document.querySelector('#preview h1')?.textContent === 'Replacement');
    assert.equal(await page.locator('#preview img, #preview math, iframe').count(), 0);
    assert.deepEqual(remote, []);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
