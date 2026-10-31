export const shell = String.raw`
<header class="toolbar" aria-label="Hlavní panel nástrojů">
  <div class="brand">
    <svg class="brand-mark" viewBox="0 0 16 16" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M2 2h7v2H4v6H2zM14 14H7v-2h5V6h2z"/></svg>
    <span class="brand-name">Margin</span>
  </div>

  <div class="doc-info">
    <h1 id="doc-name" class="doc-name">Bez názvu.md</h1>
    <p class="doc-meta">
      <span id="doc-location" class="doc-location">Nový dokument</span>
      <span id="dirty-state" class="dirty-state" data-dirty="false">Beze změn</span>
    </p>
  </div>

  <div class="toolbar-actions" role="group" aria-label="Soubor">
    <button id="new-file" type="button" class="btn" title="Nový dokument">Nový</button>
    <button id="open-file" type="button" class="btn" title="Otevřít soubor Markdown">Otevřít</button>
    <button id="save-file" type="button" class="btn btn-outline" title="Uložit (Ctrl+S)" aria-keyshortcuts="Control+S">Uložit<kbd class="kbd" aria-hidden="true">Ctrl+S</kbd></button>
    <button id="save-as" type="button" class="btn" title="Uložit jako (Ctrl+Shift+S)" aria-keyshortcuts="Control+Shift+S">Uložit jako<kbd class="kbd" aria-hidden="true">Ctrl+Shift+S</kbd></button>
  </div>

  <div class="toolbar-modes" role="group" aria-label="Režim zobrazení">
    <button type="button" class="seg" data-mode="source" aria-pressed="false" title="Jen zdrojový text">Text</button>
    <button type="button" class="seg" data-mode="split" aria-pressed="true" title="Zdrojový text a náhled vedle sebe">Vedle sebe</button>
    <button type="button" class="seg" data-mode="preview" aria-pressed="false" title="Jen náhled">Náhled</button>
  </div>

  <div class="toolbar-utils">
    <button id="theme-toggle" type="button" class="icon-btn" aria-pressed="false" aria-label="Tmavý režim" title="Přepnout světlý a tmavý režim"><svg class="icon icon-sun" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.25"/><path d="M10 2.5V4M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1.06 1.06M14.24 14.24l1.06 1.06M4.7 15.3l1.06-1.06M14.24 5.76l1.06-1.06"/></svg><svg class="icon icon-moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 11.6A6.75 6.75 0 0 1 8.4 3.5a6.75 6.75 0 1 0 8.1 8.1Z"/></svg></button>
    <button id="preferences-open" type="button" class="icon-btn" aria-haspopup="dialog" aria-label="Nastavení vzhledu" title="Nastavení vzhledu"><svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h8M14.5 6.5H17M3 13.5h2.5M9 13.5h8"/><circle cx="12.75" cy="6.5" r="1.75"/><circle cx="7.25" cy="13.5" r="1.75"/></svg></button>
    <button id="fullscreen" type="button" class="icon-btn" aria-pressed="false" aria-label="Celá obrazovka" title="Celá obrazovka"><svg class="icon icon-expand" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4"/></svg><svg class="icon icon-collapse" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 3.5v4h-4M16.5 7.5h-4v-4M12.5 16.5v-4h4M3.5 12.5h4v4"/></svg></button>
  </div>
</header>

<main class="main">
<div id="workspace" class="workspace" data-mode="split">
  <section id="source-pane" class="source-pane" role="region" aria-labelledby="source-title">
    <div class="pane-head source-head">
      <div class="pane-head-inner">
        <h2 id="source-title" class="pane-title">Markdown</h2>
      </div>
    </div>
    <div id="editor"></div>
  </section>

  <section id="preview-pane" class="preview-pane" role="region" aria-labelledby="preview-title" tabindex="0">
    <div class="pane-head preview-head">
      <div class="pane-head-inner">
        <h2 id="preview-title" class="pane-title">Náhled</h2>
      </div>
    </div>
    <article id="preview" class="preview"></article>
  </section>
</div>
</main>

<div id="drop-overlay" class="drop-overlay" hidden>
  <div class="drop-frame">
    <svg class="drop-mark" viewBox="0 0 16 16" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M2 2h7v2H4v6H2zM14 14H7v-2h5V6h2z"/></svg>
    <span class="drop-label">Pusťte Markdown soubor sem</span>
    <span class="drop-hint">Přípona .md nebo .markdown, nejvýše 5 MiB</span>
  </div>
</div>

<footer class="footer">
  <span id="status-message" class="status-message" role="status" aria-live="polite"></span>
  <div class="footer-right">
    <span id="word-count" class="footer-count">0 slov</span>
    <span id="line-count" class="footer-count">0 ř.</span>
    <span id="cursor-position" class="footer-count">Ř 1, sl 1</span>
    <span class="footer-local">Jen lokálně</span>
  </div>
</footer>

<input id="file-input" type="file" accept=".md,.markdown,text/markdown,text/plain" hidden>

<dialog id="save-dialog" class="dialog" aria-labelledby="save-title" aria-describedby="save-description">
  <form id="save-form" class="dialog-body">
    <h2 id="save-title" class="dialog-title">Uložit jako</h2>
    <p id="save-description" class="dialog-text">Zadejte název a potom vyberte složku. Chrome Marginu povolí přístup k vybrané složce, Margin v ní ale zapíše jen soubor s tímto názvem.</p>
    <label class="field-label" for="save-name">Název souboru</label>
    <input id="save-name" class="field" type="text" required maxlength="255" autocomplete="off" spellcheck="false" aria-describedby="save-hint">
    <p id="save-hint" class="field-hint">Přípona .md nebo .markdown.</p>
    <p id="save-error" class="field-error" role="alert" hidden></p>
    <div class="dialog-actions">
      <button id="save-cancel" type="button" class="btn btn-outline">Zrušit</button>
      <button id="save-select" type="submit" class="btn btn-primary">Vybrat složku a uložit</button>
    </div>
  </form>
</dialog>

<dialog id="discard-dialog" class="dialog dialog-confirm" aria-labelledby="discard-title" aria-describedby="discard-description">
  <div class="dialog-body">
    <h2 id="discard-title" class="dialog-title">Zahodit neuložené změny?</h2>
    <p id="discard-description" class="dialog-text">Změny v aktuálním dokumentu budou ztraceny.</p>
    <div class="dialog-actions">
      <button id="discard-cancel" type="button" class="btn btn-outline">Zrušit</button>
      <button id="discard-confirm" type="button" class="btn btn-danger">Zahodit</button>
    </div>
  </div>
</dialog>

<dialog id="preferences-dialog" class="dialog dialog-prefs" aria-labelledby="preferences-title">
  <div class="prefs-head">
    <h2 id="preferences-title" class="dialog-title">Vzhled</h2>
    <button id="preferences-close" type="button" class="icon-btn" aria-label="Zavřít nastavení" title="Zavřít"><svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg></button>
  </div>

  <div class="prefs-body">
    <section class="pref-section" aria-labelledby="pref-app-title">
      <h3 id="pref-app-title" class="pref-section-title">Aplikace</h3>

      <div class="pref-row">
        <label class="pref-label" for="theme-setting">Režim</label>
        <span class="select">
          <select id="theme-setting" aria-describedby="theme-hint">
            <option value="system">Podle zařízení</option>
            <option value="light">Světlý</option>
            <option value="dark">Tmavý</option>
          </select>
        </span>
        <p id="theme-hint" class="pref-hint">Podle zařízení sleduje nastavení systému. Tlačítko v liště volbu přepne na světlý nebo tmavý.</p>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="surface-setting">Styl rozhraní</label>
        <span class="select">
          <select id="surface-setting">
            <option value="minimal">Minimal</option>
            <option value="glass">Glass</option>
            <option value="material">Material You</option>
          </select>
        </span>
        <p class="pref-hint surface-note" data-for="minimal">Černá a bílá, tenké linky, nic navíc.</p>
        <p class="pref-hint surface-note" data-for="glass">Průsvitná lišta a dialogy s jemným rozostřením, panely jako listy.</p>
        <p class="pref-hint surface-note" data-for="material">Měkké tvary a tlumené zelené tóny.</p>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-preview-title">
      <h3 id="pref-preview-title" class="pref-section-title">Náhled Markdownu</h3>

      <div class="pref-row">
        <label class="pref-label" for="preview-theme-setting">Styl náhledu</label>
        <span class="select">
          <select id="preview-theme-setting" aria-describedby="preview-theme-hint">
            <option value="github">GitHub</option>
            <option value="vscode">VS Code</option>
            <option value="reading">Čtení</option>
          </select>
        </span>
        <p id="preview-theme-hint" class="pref-hint">Platí jen pro náhled, nezávisle na stylu rozhraní.</p>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="preview-font-setting">Písmo<span class="sr-only"> náhledu</span></label>
        <span class="select">
          <select id="preview-font-setting">
            <option value="default">Podle stylu</option>
            <option value="sans">Bezpatkové</option>
            <option value="serif">Patkové</option>
            <option value="mono">Neproporcionální</option>
          </select>
        </span>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="preview-size-setting">Velikost<span class="sr-only"> písma náhledu</span></label>
        <span class="select">
          <select id="preview-size-setting">
            <option value="default">Podle stylu</option>
            <option value="14">14 px</option>
            <option value="16">16 px</option>
            <option value="18">18 px</option>
            <option value="20">20 px</option>
            <option value="22">22 px</option>
            <option value="24">24 px</option>
          </select>
        </span>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-editor-title">
      <h3 id="pref-editor-title" class="pref-section-title">Editor</h3>

      <div class="pref-row">
        <label class="pref-label" for="editor-font-setting">Písmo<span class="sr-only"> editoru</span></label>
        <span class="select">
          <select id="editor-font-setting">
            <option value="system">Systémové</option>
            <option value="cascadia">Cascadia</option>
            <option value="consolas">Consolas</option>
          </select>
        </span>
      </div>

      <div class="pref-row">
        <label class="pref-label" for="editor-size-setting">Velikost<span class="sr-only"> písma editoru</span></label>
        <span class="select">
          <select id="editor-size-setting">
            <option value="12">12 px</option>
            <option value="13">13 px</option>
            <option value="14">14 px</option>
            <option value="15">15 px</option>
            <option value="16">16 px</option>
            <option value="18">18 px</option>
            <option value="20">20 px</option>
          </select>
        </span>
      </div>
    </section>

    <p class="pref-note">Používají se písma nainstalovaná v zařízení; chybějící nahradí podobné dostupné písmo. Nastavení se ukládá jen v tomto prohlížeči.</p>
  </div>
</dialog>
`;
