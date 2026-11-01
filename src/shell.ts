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
  `<svg class="${className}" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="M4 4h15v5H9v11H4zM28 28H13v-5h10V12h5z"/></svg>`;

/* Settings cards. Each is a visual shortcut for the native select named in
   data-setting; root dispatches the select change and keeps aria-pressed in
   sync. Miniatures are decorative (aria-hidden) and carry their own fixed
   data-surface / data-preview-theme, so they read the same palette tokens as
   the real window and pane. Only the visible label is translated. */
const cardLabel = (label: string, translated: boolean): string =>
  `<span class="setting-card-label"${translated ? ` data-i18n="${label}"` : ''}>${label}</span>`;

const themeCard = (value: string, label: string, translated = false): string => `
<button type="button" class="setting-card" data-setting="surface-setting" data-value="${value}" aria-pressed="false">
  <span class="theme-preview" data-surface="${value}" aria-hidden="true">
    <span class="tp-bar">${mark(8, 'tp-mark')}<span class="tp-name">Aa</span><span class="tp-seg"><span></span><span class="tp-on"></span><span></span></span><span class="tp-save"></span></span>
    <span class="tp-main"><span class="tp-ws">
      <span class="tp-pane tp-src"><span class="tp-l tp-h"></span><span class="tp-act"><span class="tp-l"></span><span class="tp-caret"></span></span><span class="tp-row"><span class="tp-k"></span><span class="tp-l"></span></span><span class="tp-l"></span></span>
      <span class="tp-pane tp-doc"><span class="tp-l tp-dh"></span><span class="tp-l"></span><span class="tp-l"></span><span class="tp-l"></span></span>
    </span></span>
    <span class="tp-foot"><span class="tp-dot"></span><span class="tp-l"></span></span>
  </span>
  ${cardLabel(label, translated)}
</button>`;

const markdownCard = (value: string, label: string, translated = false): string => `
<button type="button" class="setting-card" data-setting="preview-theme-setting" data-value="${value}" aria-pressed="false">
  <span class="markdown-style-preview mini-doc" data-preview-theme="${value}" aria-hidden="true">
    <span class="md-h">Aa</span>
    <span class="md-l"></span>
    <span class="md-row"><span class="md-l"></span><span class="md-link"></span><span class="md-code"></span></span>
    <span class="md-quote"><span class="md-l"></span></span>
    <span class="md-blocks"><span class="md-pre"><span class="md-tk md-tk-k"></span><span class="md-tk md-tk-s"></span><span class="md-tk md-tk-c"></span></span><span class="md-table"><span class="md-th"></span><span class="md-th"></span><span></span><span></span></span></span>
  </span>
  ${cardLabel(label, translated)}
</button>`;

const editorCard = (value: 'code' | 'prose' | 'plain', label: string, hint: string): string => `
<button type="button" class="setting-card" data-setting="editor-type-setting" data-value="${value}" aria-pressed="false">
  <span class="editor-preview" data-type="${value}" aria-hidden="true">
    ${value === 'code' ? '<span class="ep-gutter"><span>1</span><span class="ep-on">2</span><span>3</span><span>4</span></span>' : ''}
    <span class="ep-text">
      <span class="ep-line"><span class="ep-mark">#</span><span class="ep-bar ep-h"></span></span>
      <span class="ep-line${value === 'code' ? ' ep-active' : ''}"><span class="ep-bar ep-w1"></span><span class="ep-caret"></span></span>
      <span class="ep-line"><span class="ep-mark">-</span><span class="ep-bar ep-link"></span></span>
      <span class="ep-line"><span class="ep-bar ep-code"></span><span class="ep-bar ep-w2"></span></span>
    </span>
  </span>
  <span class="setting-card-label" data-i18n="${label}">${label}</span>
  <span class="setting-card-hint" data-i18n="${hint}">${hint}</span>
</button>`;

export const shell = String.raw`
<header class="toolbar" aria-label="Hlavní panel nástrojů" data-i18n-aria-label="Hlavní panel nástrojů">
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

  <div class="toolbar-actions" role="group" aria-label="Soubor" data-i18n-aria-label="Soubor">
    <button id="new-file" type="button" class="btn" title="Nový dokument" data-i18n-title="Nový dokument">${icons.newFile}<span data-i18n="Nový">Nový</span></button>
    <button id="open-file" type="button" class="btn" title="Otevřít soubor Markdown" data-i18n-title="Otevřít soubor Markdown">${icons.open}<span data-i18n="Otevřít">Otevřít</span></button>
    <span class="toolbar-sep" aria-hidden="true"></span>
    <button id="save-file" type="button" class="btn btn-outline" title="Uložit (Ctrl+S)" data-i18n-title="Uložit (Ctrl+S)" aria-keyshortcuts="Control+S">${icons.save}<span data-i18n="Uložit">Uložit</span><kbd class="kbd" aria-hidden="true">Ctrl+S</kbd></button>
    <button id="save-as" type="button" class="btn" title="Uložit jako (Ctrl+Shift+S)" data-i18n-title="Uložit jako (Ctrl+Shift+S)" aria-keyshortcuts="Control+Shift+S">${icons.saveAs}<span data-i18n="Uložit jako">Uložit jako</span><kbd class="kbd" aria-hidden="true">Ctrl+Shift+S</kbd></button>
  </div>

  <div class="toolbar-modes" role="group" aria-label="Režim zobrazení" data-i18n-aria-label="Režim zobrazení">
    <button type="button" class="seg" data-mode="source" aria-pressed="false" title="Jen zdrojový text" data-i18n-title="Jen zdrojový text">${icons.source}<span data-i18n="Text">Text</span></button>
    <button type="button" class="seg" data-mode="split" aria-pressed="true" title="Zdrojový text a náhled vedle sebe" data-i18n-title="Zdrojový text a náhled vedle sebe">${icons.split}<span data-i18n="Vedle sebe">Vedle sebe</span></button>
    <button type="button" class="seg" data-mode="preview" aria-pressed="false" title="Jen náhled" data-i18n-title="Jen náhled">${icons.preview}<span data-i18n="Náhled">Náhled</span></button>
  </div>

  <div class="toolbar-utils">
    <button id="theme-toggle" type="button" class="icon-btn" aria-pressed="false" aria-label="Tmavý režim" title="Přepnout světlý a tmavý režim" data-i18n-aria-label="Tmavý režim" data-i18n-title="Přepnout světlý a tmavý režim"><svg class="icon icon-sun" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.25"/><path d="M10 2.5V4M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1.06 1.06M14.24 14.24l1.06 1.06M4.7 15.3l1.06-1.06M14.24 5.76l1.06-1.06"/></svg><svg class="icon icon-moon" viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 11.6A6.75 6.75 0 0 1 8.4 3.5a6.75 6.75 0 1 0 8.1 8.1Z"/></svg></button>
    <button id="preferences-open" type="button" class="icon-btn" aria-haspopup="dialog" aria-label="Nastavení vzhledu" title="Nastavení vzhledu" data-i18n-aria-label="Nastavení vzhledu" data-i18n-title="Nastavení vzhledu"><svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h8M14.5 6.5H17M3 13.5h2.5M9 13.5h8"/><circle cx="12.75" cy="6.5" r="1.75"/><circle cx="7.25" cy="13.5" r="1.75"/></svg></button>
    <button id="fullscreen" type="button" class="icon-btn" aria-pressed="false" aria-label="Celá obrazovka" title="Celá obrazovka" data-i18n-aria-label="Celá obrazovka" data-i18n-title="Celá obrazovka"><svg class="icon icon-expand" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4"/></svg><svg class="icon icon-collapse" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 3.5v4h-4M16.5 7.5h-4v-4M12.5 16.5v-4h4M3.5 12.5h4v4"/></svg></button>
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
        <h2 id="preview-title" class="pane-title" data-i18n="Náhled">Náhled</h2>
      </div>
    </div>
    <article id="preview" class="preview"></article>
  </section>
</div>
</main>

<div id="drop-overlay" class="drop-overlay" hidden>
  <div class="drop-frame">
    ${mark(32, 'drop-mark')}
    <span class="drop-label" data-i18n="Pusťte Markdown soubor sem">Pusťte Markdown soubor sem</span>
    <span class="drop-hint" data-i18n="Přípona .md nebo .markdown, nejvýše 5 MiB">Přípona .md nebo .markdown, nejvýše 5 MiB</span>
  </div>
</div>

<footer class="footer">
  <span id="status-message" class="status-message" role="status" aria-live="polite"></span>
  <div class="footer-right">
    <span id="word-count" class="footer-count">0 slov</span>
    <span id="line-count" class="footer-count">0 ř.</span>
    <span id="cursor-position" class="footer-count">Ř 1, sl 1</span>
    <span class="footer-local">${icons.local}<span data-i18n="Jen lokálně">Jen lokálně</span></span>
  </div>
</footer>

<input id="file-input" type="file" accept=".md,.markdown,text/markdown,text/plain" hidden>

<dialog id="save-dialog" class="dialog" aria-labelledby="save-title" aria-describedby="save-description">
  <form id="save-form" class="dialog-body">
    <h2 id="save-title" class="dialog-title" data-i18n="Uložit jako">Uložit jako</h2>
    <p id="save-description" class="dialog-text" data-i18n="Zadejte název a potom vyberte složku. Chrome Marginu povolí přístup k vybrané složce, Margin v ní ale zapíše jen soubor s tímto názvem.">Zadejte název a potom vyberte složku. Chrome Marginu povolí přístup k vybrané složce, Margin v ní ale zapíše jen soubor s tímto názvem.</p>
    <label class="field-label" for="save-name" data-i18n="Název souboru">Název souboru</label>
    <input id="save-name" class="field" type="text" required maxlength="255" autocomplete="off" spellcheck="false" aria-describedby="save-hint">
    <p id="save-hint" class="field-hint" data-i18n="Přípona .md nebo .markdown.">Přípona .md nebo .markdown.</p>
    <p id="save-error" class="field-error" role="alert" hidden></p>
    <div class="dialog-actions">
      <button id="save-cancel" type="button" class="btn btn-outline" data-i18n="Zrušit">Zrušit</button>
      <button id="save-select" type="submit" class="btn btn-primary" data-i18n="Vybrat složku a uložit">Vybrat složku a uložit</button>
    </div>
  </form>
</dialog>

<dialog id="discard-dialog" class="dialog dialog-confirm" aria-labelledby="discard-title" aria-describedby="discard-description">
  <div class="dialog-body">
    <h2 id="discard-title" class="dialog-title">Zahodit neuložené změny?</h2>
    <p id="discard-description" class="dialog-text">Změny v aktuálním dokumentu budou ztraceny.</p>
    <div class="dialog-actions">
      <button id="discard-cancel" type="button" class="btn btn-outline" data-i18n="Zrušit">Zrušit</button>
      <button id="discard-confirm" type="button" class="btn btn-danger">Zahodit</button>
    </div>
  </div>
</dialog>

<dialog id="preferences-dialog" class="dialog dialog-prefs" aria-labelledby="preferences-title">
  <div class="prefs-head">
    <h2 id="preferences-title" class="dialog-title" data-i18n="Vzhled">Vzhled</h2>
    <button id="preferences-close" type="button" class="icon-btn" aria-label="Zavřít nastavení" title="Zavřít" data-i18n-aria-label="Zavřít nastavení" data-i18n-title="Zavřít"><svg class="icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg></button>
  </div>

  <div class="prefs-body">
   <div class="prefs-layout">
    <section class="pref-section pref-section-wide" aria-labelledby="pref-app-title">
      <h3 id="pref-app-title" class="pref-section-title" data-i18n="Aplikace">Aplikace</h3>
      <div class="pref-group pref-group-split">
        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="language-setting" data-i18n="Jazyk">Jazyk</label>
            <p class="pref-hint" data-i18n="Jazyk rozhraní se řídí předvolbami prohlížeče.">Jazyk rozhraní se řídí předvolbami prohlížeče.</p>
          </div>
          <span class="select"><select id="language-setting">
            <option value="system" data-i18n="Podle zařízení">Podle zařízení</option>
            <option value="en">English</option><option value="cs">Čeština</option><option value="de">Deutsch</option>
          </select></span>
        </div>
        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="theme-setting" data-i18n="Režim">Režim</label>
            <p id="theme-hint" class="pref-hint" data-i18n="Podle zařízení sleduje nastavení systému. Tlačítko v liště volbu přepne na světlý nebo tmavý.">Podle zařízení sleduje nastavení systému. Tlačítko v liště volbu přepne na světlý nebo tmavý.</p>
          </div>
          <span class="select">
            <select id="theme-setting" aria-describedby="theme-hint">
              <option value="system" data-i18n="Podle zařízení">Podle zařízení</option>
              <option value="light" data-i18n="Světlý">Světlý</option>
              <option value="dark" data-i18n="Tmavý">Tmavý</option>
            </select>
          </span>
        </div>

        <div class="pref-row pref-row-cards">
          <div class="pref-text">
            <label class="pref-label" for="surface-setting" data-i18n="Styl rozhraní">Styl rozhraní</label>
            <p class="pref-hint surface-note" data-for="minimal" data-i18n="Černá a bílá, tenké linky, nic navíc.">Černá a bílá, tenké linky, nic navíc.</p>
            <p class="pref-hint surface-note" data-for="glass" data-i18n="Průsvitná lišta a dialogy s jemným rozostřením, panely jako listy.">Průsvitná lišta a dialogy s jemným rozostřením, panely jako listy.</p>
            <p class="pref-hint surface-note" data-for="material" data-i18n="Měkké tvary a tlumené zelené tóny.">Měkké tvary a tlumené zelené tóny.</p>
            <p class="pref-hint surface-note" data-for="fluent" data-i18n="Klidné plochy ve stylu Windows, jemné obrysy a modrý akcent.">Klidné plochy ve stylu Windows, jemné obrysy a modrý akcent.</p>
            <p class="pref-hint surface-note" data-for="nord" data-i18n="Arktické barvy: sněhově světlé nebo polárně tmavé vrstvy s mrazivým akcentem.">Arktické barvy: sněhově světlé nebo polárně tmavé vrstvy s mrazivým akcentem.</p>
            <p class="pref-hint surface-note" data-for="paper" data-i18n="Papírové plochy a teplý inkoust.">Papírové plochy a teplý inkoust.</p>
            <p class="pref-hint surface-note" data-for="terminal" data-i18n="Ostré hrany, zelený akcent a technické písmo.">Ostré hrany, zelený akcent a technické písmo.</p>
          </div>
          <span class="select">
            <select id="surface-setting">
              <option value="minimal">Minimal</option>
              <option value="glass">Glass</option>
              <option value="material">Material You</option>
              <option value="fluent">Fluent</option>
              <option value="nord">Nord</option>
              <option value="paper" data-i18n="Papír">Papír</option>
              <option value="terminal" data-i18n="Terminál">Terminál</option>
            </select>
          </span>
          <div class="card-grid card-grid-theme" role="group" aria-label="Styl rozhraní" data-i18n-aria-label="Styl rozhraní">
            ${themeCard('minimal', 'Minimal')}
            ${themeCard('glass', 'Glass')}
            ${themeCard('material', 'Material You')}
            ${themeCard('fluent', 'Fluent')}
            ${themeCard('nord', 'Nord')}
            ${themeCard('paper', 'Papír', true)}
            ${themeCard('terminal', 'Terminál', true)}
          </div>
        </div>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-preview-title">
      <h3 id="pref-preview-title" class="pref-section-title" data-i18n="Náhled Markdownu">Náhled Markdownu</h3>
      <div class="pref-group">
        <div class="pref-row">
          <div class="pref-text">
            <label class="pref-label" for="markdown-format-setting" data-i18n="Formát Markdownu">Formát Markdownu</label>
            <p id="markdown-format-hint" class="pref-hint" data-i18n="GitHub přidává bezpečné HTML, upozornění a poznámky pod čarou. Strict používá původní Markdown. Text dokumentu se nemění.">GitHub přidává bezpečné HTML, upozornění a poznámky pod čarou. Strict používá původní Markdown. Text dokumentu se nemění.</p>
          </div>
          <span class="select"><select id="markdown-format-setting" aria-describedby="markdown-format-hint">
            <option value="github">GitHub</option>
            <option value="strict">Strict Markdown</option>
          </select></span>
        </div>

        <div class="pref-row pref-row-cards">
          <div class="pref-text">
            <label class="pref-label" for="preview-theme-setting" data-i18n="Styl náhledu">Styl náhledu</label>
            <p id="preview-theme-hint" class="pref-hint" data-i18n="Platí jen pro náhled, nezávisle na stylu rozhraní.">Platí jen pro náhled, nezávisle na stylu rozhraní.</p>
          </div>
          <span class="select">
            <select id="preview-theme-setting" aria-describedby="preview-theme-hint">
              <option value="github">GitHub</option>
              <option value="vscode">VS Code</option>
              <option value="reading" data-i18n="Čtení">Čtení</option>
              <option value="nord">Nord</option>
              <option value="paper" data-i18n="Papír">Papír</option>
              <option value="terminal" data-i18n="Terminál">Terminál</option>
            </select>
          </span>
          <div class="card-grid card-grid-markdown" role="group" aria-label="Styl náhledu" data-i18n-aria-label="Styl náhledu">
            ${markdownCard('github', 'GitHub')}
            ${markdownCard('vscode', 'VS Code')}
            ${markdownCard('reading', 'Čtení', true)}
            ${markdownCard('nord', 'Nord')}
            ${markdownCard('paper', 'Papír', true)}
            ${markdownCard('terminal', 'Terminál', true)}
          </div>
        </div>

        <div class="pref-row pref-pair">
          <div class="pref-field">
            <label class="pref-label" for="preview-font-setting"><span data-i18n="Písmo">Písmo</span><span class="sr-only" data-i18n=" náhledu"> náhledu</span></label>
            <span class="select">
              <select id="preview-font-setting">
                <option value="default" data-i18n="Podle stylu">Podle stylu</option>
                <option value="sans" data-i18n="Bezpatkové">Bezpatkové</option>
                <option value="serif" data-i18n="Patkové">Patkové</option>
                <option value="mono" data-i18n="Neproporcionální">Neproporcionální</option>
              </select>
            </span>
          </div>
          <div class="pref-field">
            <label class="pref-label" for="preview-size-setting"><span data-i18n="Velikost">Velikost</span><span class="sr-only" data-i18n=" písma náhledu"> písma náhledu</span></label>
            <span class="select">
              <select id="preview-size-setting">
                <option value="default" data-i18n="Podle stylu">Podle stylu</option>
                <option value="14">14 px</option>
                <option value="16">16 px</option>
                <option value="18">18 px</option>
                <option value="20">20 px</option>
                <option value="22">22 px</option>
                <option value="24">24 px</option>
              </select>
            </span>
          </div>
          <div class="font-sample preview-font-sample markdown-style-preview" data-follow-preview data-preview-theme="github" aria-hidden="true">
            <span class="sample-heading">Margin</span>
            <span class="sample-text">Aa Bb Čč Ää 0123 <code class="sample-code">x = 1</code></span>
          </div>
        </div>
      </div>
    </section>

    <section class="pref-section" aria-labelledby="pref-editor-title">
      <h3 id="pref-editor-title" class="pref-section-title" data-i18n="Editor">Editor</h3>
      <div class="pref-group">
        <div class="pref-row pref-row-cards">
          <div class="pref-text">
            <label class="pref-label" for="editor-type-setting" data-i18n="Typ editoru">Typ editoru</label>
          </div>
          <span class="select"><select id="editor-type-setting">
            <option value="code" data-i18n="Kód">Kód</option>
            <option value="prose" data-i18n="Psaní">Psaní</option>
            <option value="plain" data-i18n="Prostý text">Prostý text</option>
          </select></span>
          <div class="card-grid card-grid-editor" role="group" aria-label="Typ editoru" data-i18n-aria-label="Typ editoru">
            ${editorCard('code', 'Kód', 'Čísla řádků a zvýraznění syntaxe.')}
            ${editorCard('prose', 'Psaní', 'Klidné psaní bez čísel řádků.')}
            ${editorCard('plain', 'Prostý text', 'Prostý text bez zvýraznění syntaxe.')}
          </div>
        </div>
        <div class="pref-row pref-pair">
          <div class="pref-field">
            <label class="pref-label" for="editor-font-setting"><span data-i18n="Písmo">Písmo</span><span class="sr-only" data-i18n=" editoru"> editoru</span></label>
            <span class="select">
              <select id="editor-font-setting">
                <option value="system" data-i18n="Systémové">Systémové</option>
                <option value="cascadia">Cascadia</option>
                <option value="consolas">Consolas</option>
                <option value="sans" data-i18n="Bezpatkové">Bezpatkové</option>
                <option value="serif" data-i18n="Patkové">Patkové</option>
              </select>
            </span>
          </div>
          <div class="pref-field">
            <label class="pref-label" for="editor-size-setting"><span data-i18n="Velikost">Velikost</span><span class="sr-only" data-i18n=" písma editoru"> písma editoru</span></label>
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
          <div class="font-sample editor-font-sample" aria-hidden="true">
            <span class="sample-line"><span class="sample-mark">#</span> <span class="sample-heading">Margin</span></span>
            <span class="sample-line"><span class="sample-mark">-</span> Aa Bb Čč 0O 1lI <span class="sample-code">x = 1</span></span>
          </div>
        </div>
      </div>
    </section>

    <p class="pref-note" data-i18n="Používají se písma nainstalovaná v zařízení; chybějící nahradí podobné dostupné písmo. Nastavení se ukládá jen v tomto prohlížeči.">Používají se písma nainstalovaná v zařízení; chybějící nahradí podobné dostupné písmo. Nastavení se ukládá jen v tomto prohlížeči.</p>
   </div>
  </div>
</dialog>
`;
