export const shell = String.raw`
<header class="toolbar" aria-label="Hlavní panel nástrojů">
  <div class="toolbar-left">
    <span class="margin-mark" aria-hidden="true">⌜M⌝</span>
    <div class="doc-info">
      <span id="doc-name" class="doc-name">Bez názvu.md</span>
      <span id="doc-location" class="doc-location">Nový dokument</span>
      <span id="dirty-state" class="dirty-state" data-dirty="false">Beze změn</span>
    </div>
  </div>

  <div class="toolbar-actions">
    <button id="new-file" type="button" title="Nový soubor">Nový</button>
    <button id="open-file" type="button" title="Otevřít soubor">Otevřít</button>
    <button id="save-file" type="button" title="Uložit soubor">Uložit<kbd class="kbd-hint">Ctrl+S</kbd></button>
    <button id="save-as" type="button" title="Uložit jako">Uložit jako<kbd class="kbd-hint">Ctrl+Shift+S</kbd></button>
  </div>

  <div class="toolbar-modes" role="group" aria-label="Režim zobrazení">
    <button type="button" data-mode="source" aria-pressed="false" title="Jen zdrojový text">Text</button>
    <button type="button" data-mode="split" aria-pressed="true" title="Zdrojový text a náhled vedle sebe">Vedle sebe</button>
    <button type="button" data-mode="preview" aria-pressed="false" title="Jen náhled">Náhled</button>
  </div>

  <div class="toolbar-utils">
    <button id="theme-toggle" type="button" aria-pressed="false" aria-label="Přepnout tmavý režim" title="Světlý / tmavý režim"><svg class="icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="4"/><path d="M9 1.5v2M9 14.5v2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M1.5 9h2M14.5 9h2M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4"/></svg></button>
    <button id="fullscreen" type="button" aria-pressed="false" aria-label="Celá obrazovka" title="Celá obrazovka"><svg class="icon" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.5 1.5H16.5V6.5M6.5 16.5H1.5V11.5M16.5 11.5V16.5H11.5M1.5 6.5V1.5H6.5"/></svg></button>
  </div>
</header>

<main>
<div id="workspace" class="workspace" data-mode="split">
  <section id="source-pane" class="source-pane" role="region" aria-label="Zdrojový kód">
    <div id="editor"></div>
  </section>

  <section id="preview-pane" class="preview-pane" role="region" aria-label="Náhled dokumentu" tabindex="0">
    <article id="preview" class="preview"></article>
  </section>
</div>
</main>

<div id="drop-overlay" class="drop-overlay" hidden>
  <span class="drop-label">Přetáhněte Markdown soubor</span>
</div>

<footer class="footer">
  <span id="status-message" class="status-message" role="status" aria-live="polite"></span>
  <div class="footer-right">
    <span id="word-count">0 slov</span>
    <span id="line-count">0 ř.</span>
    <span id="cursor-position">Ř 1, sl 1</span>
    <span class="footer-separator" aria-hidden="true">|</span>
    <span class="footer-local">Jen lokálně</span>
  </div>
</footer>

<input id="file-input" type="file" accept=".md,.markdown,text/markdown,text/plain" hidden>

<dialog id="discard-dialog" class="discard-dialog" aria-labelledby="discard-title">
  <h2 id="discard-title" class="dialog-title">Zahodit neuložené změny?</h2>
  <p class="dialog-text">Změny v aktuálním dokumentu budou ztraceny.</p>
  <div class="dialog-actions">
    <button id="discard-cancel" type="button" class="btn-cancel">Zrušit</button>
    <button id="discard-confirm" type="button" class="btn-discard">Zahodit</button>
  </div>
</dialog>
`;
