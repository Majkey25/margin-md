const icon = (paths: string): string =>
  `<svg class="icon" viewBox="0 0 20 20" aria-hidden="true">${paths}</svg>`;

const icons = {
  newFile: icon('<path d="M11.5 3H6a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 6 17h8a1.5 1.5 0 0 0 1.5-1.5V7z"/><path d="M11.5 3v4h4M10 9.75v4.5M7.75 12h4.5"/>'),
  open: icon('<path d="M2.75 14.5V5.25c0-.83.67-1.5 1.5-1.5h3.3l1.7 1.75h5.5c.83 0 1.5.67 1.5 1.5V8"/><path d="M2.75 14.5l2.05-5.1a1.5 1.5 0 0 1 1.4-.95h11.05l-2.2 6.05a1.5 1.5 0 0 1-1.41.99H4.25a1.5 1.5 0 0 1-1.5-.99z"/>'),
  save: icon('<path d="M4.75 3.5h8.5l3 3v8.75c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25V4.75c0-.69.56-1.25 1.25-1.25z"/><path d="M6.75 3.5v3.25h5.5V3.5M6.25 16.5v-4.25h7.5v4.25"/>'),
  saveAs: icon('<path d="M9.25 16.5h-4.5c-.69 0-1.25-.56-1.25-1.25V4.75c0-.69.56-1.25 1.25-1.25h8.5l3 3V9"/><path d="M6.75 3.5v3.25h5.5V3.5M6.25 16.5v-4.25h3.25"/><path d="M15.4 11.1l1.5 1.5-4.15 4.15h-1.5v-1.5z"/>'),
  source: icon('<path d="M7 6.5 3.5 10 7 13.5M13 6.5l3.5 3.5-3.5 3.5"/>'),
  split: icon('<rect x="3" y="4" width="14" height="12" rx="2"/><path d="M10 4v12"/>'),
  preview: icon('<path d="M2.5 10s2.75-5.25 7.5-5.25S17.5 10 17.5 10s-2.75 5.25-7.5 5.25S2.5 10 2.5 10z"/><circle cx="10" cy="10" r="2.25"/>'),
  local: icon('<rect x="4" y="4.5" width="12" height="8.5" rx="1.25"/><path d="M2.5 15.5h15"/>'),
};

const mark = (size: number, className: string): string =>
  `<svg class="${className}" viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M2 2h7v2H4v6H2zM14 14H7v-2h5V6h2z"/></svg>`;

export const shell = String.raw`
<header class="toolbar" aria-label="Hlavní panel nástrojů">
  <div class="brand">
    ${mark(22, 'brand-mark')}
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
    <button id="new-file" type="button" class="btn" title="Nový dokument">${icons.newFile}<span>Nový</span></button>
    <button id="open-file" type="button" class="btn" title="Otevřít soubor Markdown">${icons.open}<span>Otevřít</span></button>
    <span class="toolbar-sep" aria-hidden="true"></span>
    <button id="save-file" type="button" class="btn btn-outline" title="Uložit (Ctrl+S)" aria-keyshortcuts="Control+S">${icons.save}<span>Uložit</span><kbd class="kbd" aria-hidden="true">Ctrl+S</kbd></button>
    <button id="save-as" type="button" class="btn" title="Uložit jako (Ctrl+Shift+S)" aria-keyshortcuts="Control+Shift+S">${icons.saveAs}<span>Uložit jako</span><kbd class="kbd" aria-hidden="true">Ctrl+Shift+S</kbd></button>
  </div>

  <div class="toolbar-modes" role="group" aria-label="Režim zobrazení">
    <button type="button" class="seg" data-mode="source" aria-pressed="false" title="Jen zdrojový text">${icons.source}<span>Text</span></button>
    <button type="button" class="seg" data-mode="split" aria-pressed="true" title="Zdrojový text a náhled vedle sebe">${icons.split}<span>Vedle sebe</span></button>
    <button type="button" class="seg" data-mode="preview" aria-pressed="false" title="Jen náhled">${icons.preview}<span>Náhled</span></button>
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
        ${icons.source}
        <h2 id="source-title" class="pane-title">Markdown</h2>
      </div>
    </div>
    <div id="editor"></div>
  </section>

  <section id="preview-pane" class="preview-pane" role="region" aria-labelledby="preview-title" tabindex="0">
    <div class="pane-head preview-head">
      <div class="pane-head-inner">
        ${icons.preview}
        <h2 id="preview-title" class="pane-title">Náhled</h2>
      </div>
    </div>
    <article id="preview" class="preview"></article>
  </section>
</div>
</main>

<div id="drop-overlay" class="drop-overlay" hidden>
  <div class="drop-frame">
    ${mark(32, 'drop-mark')}
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
    <span class="footer-local">${icons.local}Jen lokálně</span>
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
      <div class="pref-group">
        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="theme-setting">Režim</label>
            <p id="theme-hint" class="pref-hint">Podle zařízení sleduje nastavení systému. Tlačítko v liště volbu přepne na světlý nebo tmavý.</p>
          </div>
          <span class="select">
            <select id="theme-setting" aria-describedby="theme-hint">
              <option value="system">Podle zařízení</option>
              <option value="light">Světlý</option>
              <option value="dark">Tmavý</option>
            </select>
          </span>
        </div>

        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="surface-setting">Styl rozhraní</label>
            <p class="pref-hint surface-note" data-for="minimal">Černá a bílá, tenké linky, nic navíc.</p>
            <p class="pref-hint surface-note" data-for="glass">Průsvitná lišta a dialogy s jemným rozostřením, panely jako listy.</p>
            <p class="pref-hint surface-note" data-for="material">Měkké tvary a tlumené zelené tóny.</p>
            <p class="pref-hint surface-note" data-for="fluent">Klidné plochy ve stylu Windows, jemné obrysy a modrý akcent.</p>
            <p class="pref-hint surface-note" data-for="nord">Arktické barvy: sněhově světlé nebo polárně tmavé vrstvy s mrazivým akcentem.</p>
          </div>
          <span class="select">
            <select id="surface-setting">
              <option value="minimal">Minimal</option>
              <option value="glass">Glass</option>
              <option value="material">Material You</option>
              <option value="fluent">Fluent</option>
              <option value="nord">Nord</option>
            </select>
          </span>
        </div>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-preview-title">
      <h3 id="pref-preview-title" class="pref-section-title">Náhled Markdownu</h3>
      <div class="pref-group">
        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="preview-theme-setting">Styl náhledu</label>
            <p id="preview-theme-hint" class="pref-hint">Platí jen pro náhled, nezávisle na stylu rozhraní.</p>
          </div>
          <span class="select">
            <select id="preview-theme-setting" aria-describedby="preview-theme-hint">
              <option value="github">GitHub</option>
              <option value="vscode">VS Code</option>
              <option value="reading">Čtení</option>
              <option value="nord">Nord</option>
            </select>
          </span>
        </div>

        <div class="pref-row pref-pair">
          <div class="pref-field">
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
          <div class="pref-field">
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
        </div>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-editor-title">
      <h3 id="pref-editor-title" class="pref-section-title">Editor</h3>
      <div class="pref-group">
        <div class="pref-row pref-pair">
          <div class="pref-field">
            <label class="pref-label" for="editor-font-setting">Písmo<span class="sr-only"> editoru</span></label>
            <span class="select">
              <select id="editor-font-setting">
                <option value="system">Systémové</option>
                <option value="cascadia">Cascadia</option>
                <option value="consolas">Consolas</option>
              </select>
            </span>
          </div>
          <div class="pref-field">
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
        </div>
      </div>
    </section>

    <p class="pref-note">Používají se písma nainstalovaná v zařízení; chybějící nahradí podobné dostupné písmo. Nastavení se ukládá jen v tomto prohlížeči.</p>
  </div>
</dialog>
`;
