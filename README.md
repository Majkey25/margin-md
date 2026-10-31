# Margin

Local Markdown editor and live preview for Chrome. Written in TypeScript with CodeMirror 6, markdown-it and DOMPurify. The UI is in Czech.

## Install

1. Install Node.js 22.12 or newer.
2. Run `npm ci` and `npm run build`.
3. Open `chrome://extensions` and enable Developer mode.
4. Click **Load unpacked** and select this repository's `dist` folder.
5. Pin Margin, then click its toolbar icon.

Open a `.md` or `.markdown` file with **Otevřít**, or drop it into the editor. Choose **Text**, **Vedle sebe**, or **Náhled**. **Uložit** and `Ctrl+S` save to the selected file. **Uložit jako** and `Ctrl+Shift+S` choose another destination. Save is manual.

To render Markdown opened directly through a `file:///` URL, enable **Allow access to file URLs** in Margin's extension details. This Chrome setting is optional for files opened with the picker. A file URL grants no write handle, so these documents use **Uložit jako**. Relative file links and images are not loaded.

## Privacy and limits

* No account, server, telemetry, remote code, fonts, or document uploads.
* Markdown HTML remains text. Images remain labelled placeholders. HTTP(S) links open a separate tab only after a click.
* The extension asks for `file:///*` access to read directly opened local Markdown. It requests no access to HTTP(S) pages.
* One document per tab. Files must be UTF-8 and at most 5 MiB. UTF-8 BOM and the first newline convention are preserved. Mixed line endings become consistent on save.
* Unsaved changes trigger a discard guard or the browser's close warning. There is no autosave or crash recovery.
* Save compares current file bytes with the opened/saved version. An external change stops the save. This check cannot prevent another application writing between the check and the commit.
* Save As replaces the destination you confirm in Chrome. Chrome can empty an existing destination before the write starts. If a later write fails, the editor retains your text, but the destination may already be empty.
* A dropped file provides direct saving when Chrome supplies its file handle. Otherwise use **Uložit jako**.

## Develop

`npm run dev` opens a loopback development server. Test Chrome integration with the built unpacked extension.

```sh
npm test
npm run check
npm run build
npm exec playwright install chromium
npm run test:browser
```

The tests cover file encoding, input limits, write failures and external-change detection. The browser test loads the real extension in isolated Chromium. Browser validation and measured results are recorded in `QA.md`.
