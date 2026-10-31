# Validation

Checked on 31 October 2026, Windows, Chromium 156.0.0.0. Measurements are local laboratory observations without CPU or network throttling.

## Execution

* `npm test`: 9 file-core tests passed.
* `npm run test:browser`: TypeScript check, production build and the loaded-extension browser scenario passed.
* `npm audit --omit=dev`: 0 vulnerabilities reported.
* `git diff --cached --check`: checked before commit.

The browser scenario covers live preview, source/split/preview modes, dark theme, fullscreen, mobile overflow, discard cancellation, a real browser close warning and dismissal, blocked Markdown HTML/images, and zero document-triggered HTTP(S) requests. It checks the file-drop fallback with a synthetic DataTransfer, actual OPFS file bytes after writes, a Save As picker that truncates the existing destination, an aborted write, and edits/undo during a pending save.

A genuine disk file named `český test % #.Md` was opened through a `file:///` URL and automatically displayed by the extension. Czech text, UTF-8 BOM and CRLF input were read correctly.

The final ZIP was extracted and loaded as a separate unpacked extension. Its editor and Markdown preview loaded successfully.

## Interface and performance

| Check | Observed result |
| :--- | :--- |
| axe, light desktop 1440 × 900 | 0 violations |
| axe, dark desktop 1440 × 900 | 0 violations |
| axe, mobile 390 × 844 | 0 violations |
| Initial local load event | 88.8 ms |
| Largest contentful paint | 100 ms |
| Cumulative layout shift | 0 |
| Sample typing event durations | 16 ms, browser-rounded values |
| Import and preview of 102,503 UTF-8 bytes | Median 206.7 ms across 5 runs |
| Import and preview runs | 316.2, 208.9, 206.7, 193.8, 194.0 ms |
| Main JavaScript bundle | 467.42 kB, 164.00 kB gzip |
| Main JavaScript before removing unused HTML language support | 652.95 kB, 234.95 kB gzip |

The import measurement includes browser automation, file input, parsing and preview insertion. The typing probe is not a field INP measurement. No field Core Web Vitals or 5 MiB worst-case latency claim is made.

Fresh desktop, dark and mobile screenshots were visually inspected. The Impeccable detector reported one warning for the Markdown blockquote's 3px border. This is the conventional quote marker, not a decorative card accent; it was retained.

## Independent review

* Opus 4.6 through Antigravity created `src/shell.ts`, `src/styles.css` and the initial design document using frontend-design, Taste, Impeccable and Emil guidance. Claude Code's Opus 5.5 probe had reached its subscription limit; the separately authenticated Antigravity Opus probe succeeded.
* GPT-6 Astra at xhigh checked architecture and local-file permission boundaries, then inspected screenshots. Its dark gutter finding was fixed and scored resolved on a fresh screenshot.
* GPT-6.1 Terra at xhigh implemented the file helpers and focused tests. The main agent inspected the files and reran checks.
* GPT-6.1 Sol at max reviewed save and rendering risks. Its three confirmed save-state findings were fixed, independently rechecked and covered by browser regressions.

Model responses were treated as advice. Checked code, execution and rendered output determine the claims above.

## Verification limits

Native Windows picker automation failed in both Computer Use routes with `window id 1641926 no longer belongs to Chrome; current owner is Chrome`. Therefore native picker selection and write-back to a user-selected OS file were not completed in this run. The fallback evidence is actual extension execution with genuine OPFS handles and a genuine disk-file read. OPFS writes do not prove native disk write-back.

Save conflict detection is a byte comparison before writing, not an atomic lock against another application. Native Save As can truncate an existing confirmed destination before a later write fails. Text remains in the editor on a failed save. There is no crash recovery or autosave.

Chrome Web Store publication, a signed CRX, other Chrome versions and physical mobile devices were not tested or published.
