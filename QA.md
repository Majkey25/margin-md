# Validation

## Icon update | 1.0.1

The corner-bracket icon now has a transparent background. SVG, favicon, toolbar icons and inline app marks share the same geometry. PNG alpha was checked at 16, 32, 48 and 128 px; each image has clear background pixels and zero alpha at its corner. Light and dark desktop and mobile checks found no opaque icon backdrop, accessibility violations or browser errors.

`npm run test:browser` passed, including TypeScript and the production build. The 190,807-byte release ZIP was extracted and loaded as an extension. Its manifest reports 1.0.1, and its mapped 16 px toolbar icon decoded with transparent corner pixels.

Archive SHA-256: `26d45fec2420464335f0d2891d8ded79422d706bfe7464f6873ad4814fac9409`.

The complete 1.0.0 validation record follows. Its performance and disk-write measurements were not repeated for this icon-only update.

Checked on 31 October 2026, Windows, Chromium 156.0.8078.4. Measurements below are local laboratory observations.

## Execution

* `npm test`: 16 file-handling tests passed.
* `npm run test:browser`: TypeScript check, production build and the loaded-extension browser scenario passed.
* `npm audit --omit=dev`: 0 vulnerabilities reported.

The browser scenario checks editing, undo during a pending save, all view modes, fullscreen, discard cancellation, a real browser close warning, blocked active Markdown, table alignment and zero document-triggered HTTP(S) requests. Save tests inspect genuine OPFS bytes after successful writes, cancelled overwrites, failed writes and failed closes. An assertion forbids the old truncating save-file picker.

Appearance checks cover the initial device theme, live device changes, explicit overrides, reload persistence, all three visual styles, rapid theme clicks, the circular reveal and reduced motion. Opening settings and changing styles preserves the document. Ctrl+S inside settings does not open a save dialog. System changes use browser media emulation; Windows settings are not changed.

## Actual disk files

The final build opened a real `final-real.md` through Chromium's native file-drop path, edited it and saved it through a genuine external file handle. The real Chrome write-permission prompt was approved. Exact bytes matched the expected UTF-8 BOM and CRLF content. Reloading and reopening the disk file displayed the saved text.

Save As was tested against real external files using a genuine directory handle obtained from a native directory drop. The test supplied only the directory-picker result; reads, buffered writable streams, aborts and commits used Chromium's actual disk implementation. The real folder write-permission prompt was approved.

* `final-target.md` kept its exact original bytes before overwrite confirmation and after cancellation.
* Injected `write()` and `close()` failures preserved those bytes and the unsaved editor state.
* Confirmed overwrite produced the exact expected bytes, including BOM and CRLF, while the original source file stayed unchanged.
* Creating `final-new.md` produced the same expected bytes.

These injected failures do not simulate power loss or hardware failure. Earlier checks also covered Czech filenames containing spaces, `%` and `#`, and automatic rendering of a real Markdown `file:///` URL.

## Interface

Fresh screenshots were inspected at 1440 × 900 and 390 × 844 for Minimal, Glass and Material You, each in light and dark mode. Forty axe and layout checks passed with zero violations and zero outer horizontal overflow: the six appearances at desktop and mobile widths, their settings and save-validation dialogs, and long-content checks at 390, 700, 1024 and 1920 px.

The audit found a CodeMirror scroll region without an explicit keyboard entry point. Adding `tabindex="0"` to its editable content resolved the finding; the complete matrix was rerun. Wide tables and code scroll inside their own regions.

Source-only mode was tested with a short file and 10,001 lines. Typing, undo and cursor visibility passed. At 1440 px, the content starts at x=332 with 16 px line padding; its heading starts at x=348. The gutter remained 56 px wide in both cases.

## Performance

No network or CPU throttling was used except for the separately labelled animation probe. Import timings include browser automation, file input, parsing and preview insertion. They are observations, not a performance guarantee.

| Check | Before redesign | Final |
| :--- | ---: | ---: |
| Local load event | 400.2 ms | 369.9 ms |
| Largest contentful paint | 548 ms | 504 ms |
| Cumulative layout shift | 0 | 0 |
| 102,400-byte import and preview, median of 5 | 410.7 ms | 384.0 ms |
| Main JavaScript bytes | 469,846 | 475,780 |
| Main JavaScript gzip bytes, Node zlib defaults | 163,127 | 164,857 |

Final import runs: 402.7, 339.2, 401.9, 384.0 and 372.9 ms. A small difference between two local runs does not establish a statistically significant speed improvement.

During the theme reveal, requestAnimationFrame intervals on this 144 Hz test setup had a 6.9 ms median and 13.9 ms maximum. With 4× CPU throttling, the median stayed 6.9 ms and the maximum was 34.7 ms; one interval exceeded 34 ms. This does not measure a physical mobile GPU. Field INP, field Core Web Vitals and worst-case 5 MiB rendering latency were not measured.

## Release archive

The 191,573-byte `margin-md.zip` was extracted into a separate folder and loaded as an unpacked extension. Version 1.0.0 opened the real Markdown fixture, rendered its heading, and applied Glass and dark appearance. Its JavaScript matched the production build byte for byte. The archive contains the extension, icons and third-party notices; no source workspace, dependencies or test profiles are included.

SHA-256: `3be4e8345bc96e50423c6bc05839c4730416c0b02d2441d163a7bc78238d42f2`.

## Independent review

Claude Opus 5.5 created the final shell, styles, design document and vector icon using frontend-design, Taste, Impeccable and Emil guidance. GPT-6 Astra at xhigh reviewed architecture, permission boundaries and screenshots. GPT-6.1 Terra at xhigh implemented file helpers, preference behavior and focused regressions. GPT-6.1 Sol at max reviewed saving and transition cancellation. The main agent inspected their output and ran the checks above. Model agreement was not treated as proof.

## Limits

Native Windows file and folder chooser selection remains unverified. Computer Use captured the chooser but rejected clicks with `point ... is over margin-test.exe "Cancel", not target window ...`. Real disk read and write were verified through native drop handles. This proves disk write-back, not automated OS chooser selection.

Byte comparisons before and after opening the temporary writer do not lock out another application writing afterward. Save As avoids the native save-file picker's early truncation. A failed save to a new destination may leave a new empty file. There is no autosave or crash recovery.

Chrome Web Store publication, signed CRX installation, other Chrome versions and physical mobile devices were not tested or published.
