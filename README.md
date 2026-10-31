# Margin

A local Markdown editor for Chrome. Write the source, see a live preview, and save the file on your computer.

[![Checks](https://github.com/Majkey25/margin-md/actions/workflows/ci.yml/badge.svg)](https://github.com/Majkey25/margin-md/actions/workflows/ci.yml)
[![Stable release](https://img.shields.io/badge/release-v1.0.0-black?style=flat-square&logo=github&logoColor=white)](https://github.com/Majkey25/margin-md/releases/latest)
![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest_V3-black?style=flat-square&logo=googlechrome&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-black?style=flat-square&logo=typescript&logoColor=white)
![Local files](https://img.shields.io/badge/files-local_only-black?style=flat-square)

[![Download latest ZIP](https://img.shields.io/badge/DOWNLOAD-LATEST_ZIP-black?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Majkey25/margin-md/releases/latest/download/margin-md.zip)

![Margin editor with source and preview](docs/images/editor.png)

## Install

1. [Download the latest extension ZIP](https://github.com/Majkey25/margin-md/releases/latest/download/margin-md.zip) and extract it into a folder you will keep.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Pin Margin and click its toolbar icon.

No build tools are needed for the release ZIP. The release also includes `SHA256SUMS.txt` for verifying the download. This repository is private, so GitHub downloads require repository access.

Chrome desktop is the supported installation target. Margin is distributed as an unpacked extension and is not published in the Chrome Web Store.

Updates are manual. Save open documents, replace the extracted extension files with a newer ZIP, and click **Reload** in `chrome://extensions`.

## Read and edit

Open a `.md` or `.markdown` file with **Otevřít**, or drop it into the editor. Choose **Text**, **Vedle sebe**, or **Náhled**. Preview-only mode gives the document the full application area, and the fullscreen control expands the browser view.

**Uložit** writes to the opened file. **Uložit jako** asks for a filename and destination folder, then asks before replacing an existing file. Choosing a destination does not empty an existing file. Save is manual; text remains in the editor if a write fails.

The theme button shows the current light or dark appearance. First open follows your device; clicking the button switches it with the circular reveal used on Init. Reduced motion disables the reveal. **Nastavení** offers System, Light and Dark appearance, plus **Minimal**, **Glass** and **Material You** visual styles. These preferences stay on this device; document contents are not stored with them. Material You uses a bundled tonal palette, not wallpaper colors from the operating system.

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+S` / `Cmd+S` | Save |
| `Ctrl+Shift+S` / `Cmd+Shift+S` | Save As |
| `Ctrl+Z` / `Cmd+Z` | Undo |

To render Markdown opened directly through a `file:///` URL, enable **Allow access to file URLs** in Margin's extension details. Files opened this way do not provide a writable file handle. Use **Uložit jako** to choose a save destination.

## Privacy and permissions

* Documents stay on your computer. There is no account, server, telemetry, or document upload.
* Dependencies, styles and icons are bundled. The extension loads no remote code or fonts.
* Markdown HTML is shown as text. Images are labelled placeholders, so opening a document does not contact image servers.
* HTTP(S) and email links open only after a click. Relative file links and images are not loaded.
* The `file:///*` permission supports directly opened local Markdown. The extension requests no access to HTTP(S) pages.
* Save As asks Chrome for access to the folder you select. Margin uses only the named target and does not enumerate the folder.

## File handling

One document is open per tab. Files must be UTF-8 and at most 5 MiB. UTF-8 BOM and the first newline convention are preserved; mixed line endings become consistent on save.

Unsaved changes trigger a discard guard or the browser's close warning. There is no autosave or crash recovery.

Save checks the destination's bytes before and after opening the temporary writable stream. A detected external change stops the write. This is not an atomic lock against another application changing the file afterward. A failed save to a newly created destination may leave a new empty file; it does not erase an existing destination through a save picker.

## Development

Use Node.js 24. Install dependencies with `npm ci`. `npm run dev` starts the local development server; Chrome extension integration uses the production build.

```sh
npm ci
npm test
npm run check
npm exec -- playwright install chromium
npm run test:browser
```

`npm run build` produces `dist/`. Load that folder as an unpacked extension when developing. The browser test also runs the type check and production build.

See [validation evidence](QA.md), [release changes](CHANGELOG.md), and [third-party notices](public/THIRD_PARTY_NOTICES.txt).
