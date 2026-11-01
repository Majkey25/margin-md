# Validation

## Themes, live previews and main window | 1.5.0

Claude Code's authenticated runtime picker and a successful probe confirmed Opus 5.5 after the quota reset. Opus implemented the main-window and settings design at medium effort, with access limited to four design files. No fallback model, overage, top-up or billing change was used. The primary agent completed preference wiring and verified the result independently. Astra reviewed that wiring and found no confirmed P1/P2 defect; source review did not replace execution.

Paper and Terminal bring the application to seven styles and Markdown to six presets, each with light/dark palettes. All 16 theme, Markdown and editor-profile cards use the validated native-select path and preserve source, cursor, dirty state and undo. Inactive miniature previews share the real palette declarations. The centered settings window has a fixed close control, a scrollable body and live font samples. The original bracket icon, Minimal default, device language and appearance remain.

Final `npm test` passed 19 tests. `npm run test:browser` passed TypeScript, the production build and all seven scenarios. `npm audit --omit=dev` reported zero vulnerabilities. A card regression caught an explicit click on an already-selected default failing to persist that choice; the shared handler now processes it through the same validated change path.

Real Chromium checks compared all inactive application/Markdown miniatures against their actual palettes in 14 light/dark contexts, with no mismatches. All 84 application/Markdown/mode combinations passed axe. Thirty main-window/settings cases across EN/CS/DE, 1440/768/390/320 px and a short 390 × 460 viewport passed axe, centering, containment, overflow, keyboard traversal and Escape focus restoration. Dirty, error and discard states passed another 42 axe scans. A Nord dirty-save hint contrast defect was fixed. Fourteen actual hovered Save paints were also composited and measured against WCAG AA 4.5:1, including their keyboard hints; all passed after reducing the hover overlay. Axe alone could not establish the gradient's exact contrast.

Fresh desktop/mobile and 320 px screenshots were inspected after the dialog's opening transition settled. Source/preview/split, fullscreen, keyboard card selection, normal circular theme reveal, reduced motion and forced colors worked without console errors or document HTTP(S) requests. Browser accessibility snapshots omitted decorative Terminal heading markers. This does not establish physical screen-reader speech.

Three runs of the pre-Opus feature build and final build used isolated Chromium 156 profiles on the same host, without throttling or concurrent test browsers. Actual 100 KiB/1 MiB disk files were imported. Timings end two frames after preview mutation; edits include the existing 120 ms debounce. All six final Undo checks restored the full source hash through genuine disposable OPFS saves; the imported disk fixtures were unchanged.

| Check | Before UI | 1.5.0 |
| :--- | ---: | ---: |
| Local load event | 330.1 ms | 383.8 ms |
| Largest contentful paint | 588 ms | 592 ms |
| Cumulative layout shift | 0 | 0 |
| 100 KiB open and preview | 153.2 ms | 160 ms |
| 100 KiB edit and preview | 169.8 ms | 175.5 ms |
| 1 MiB open and preview | 1,195.2 ms | 1,286.2 ms |
| 1 MiB edit and preview | 546.5 ms | 612.7 ms |

These local samples show modest regressions, not a universal speedup. Ordinary startup still avoids both rich engines and their sandbox frame. Field INP, cold OS caches, physical mobile behavior, native external-disk chooser/write behavior for this version and worst-case 5 MiB latency remain unmeasured. Existing file-save failure/cancellation/overwrite regressions passed; OPFS validation is not a native external-disk write test.

The final 1,877,110-byte ZIP was extracted separately. All 115 files match `dist/` byte for byte and its manifest reports 1.5.0. That extracted extension opened a real local Czech Markdown file, rendered and edited it, preserved an existing destination through overwrite cancellation, then saved exact UTF-8 BOM/CRLF bytes to genuine OPFS after confirmation. The original disk fixture remained unchanged, with no console errors or HTTP(S) requests. SHA-256: `5b6c99ba30df8589c09f9394c840c816b12faee99f278e0b6f3a86fb906f025a`. This archive smoke test did not repeat a native external-disk picker/write.

## Mermaid and mathematical expressions | 1.5.0

GitHub format now supports fenced Mermaid diagrams, dollar-delimited inline/display math, fenced `math` blocks and GitHub's inline backtick form. The English, Czech and German welcome examples include two diagrams and three expressions. The original `sample` and `initialSample` source is unchanged. Strict keeps its previous sanitized output, literal fences/dollars and original welcome. Switching format preserves the source, dirty state and undo history.

`npm test` passed all 19 tests. The production build and TypeScript check passed. All six loaded-extension browser scenarios passed; the rich-preview scenario was rerun after final lifecycle guards. That scenario verifies offline image decoding, native MathML and TeX annotations, accessible diagram titles, unchanged-block reuse, malformed input, disabled URL/HTML commands, bounded input, document replacement and Strict switching. It delays the first real MessagePort response to reproduce a theme change during the first render, then requires a completed result. The actual sandbox reports an opaque origin, rejects parent-document access and has no extension runtime ID. The production dependency audit reports zero vulnerabilities. Runtime license notices are bundled.

The real Chromium build rendered actual disk Markdown fixtures at 1440 and 390 px in EN/CS/DE, light and dark. All 12 cases had zero axe violations, console errors, HTTP(S) requests or outer overflow. Very long inline and display expressions also scroll inside their own containers without widening the preview pane. Fresh desktop/mobile screenshots were inspected. Diagram output is sanitized SVG displayed only as a blob image; raw authored SVG/MathML still does not bypass the existing HTML sanitizer. The diagram sandbox denies network, frames, external images, fonts and extension APIs. Renderers and diagram definitions load locally only when rich content approaches the viewport. Host permissions and main-page script policy are unchanged.

Performance preflight used three alternating runs of the extracted 1.4.0 release and the feature build, Chromium 156, 1440×900, light, reduced motion and no CPU throttling. A genuine 1,092,018-byte disk Markdown file was opened and edited, with timings including browser automation and two animation frames. Medians were 2247/2219 ms for open and 1066/1029 ms for edit, baseline/feature. Initial load was 317/363 ms, LCP 476/532 ms and CLS 0/0. Preflight startup JavaScript was 713,700/727,308 bytes, or 253,814/259,283 bytes with Node gzip. Neither build loaded Mermaid or KaTeX during ordinary startup. These are local samples with host variation, not a general speedup claim. The final uncompressed distribution is 6,385,182 bytes across 115 files because diagram engines ship locally, although they are loaded on demand.

Independent Astra source review found a first-render theme race, fixed before the deterministic browser regression passed. Self-review also guarded late iframe-load callbacks after abort, restored retry state after render failure and retained MathML semantics/annotations. Release and installed-Brave checks are recorded separately after their execution. Physical-mobile behavior, screen-reader speech, field INP, every Mermaid diagram grammar and the worst permitted complexity remain unverified. Mathematical syntax follows KaTeX's supported subset; diagram interactions and external diagram resources are intentionally disabled.

The development-server probe confirmed that an opaque iframe cannot import Vite modules under the default CORS policy. Mermaid therefore keeps literal source with an explanatory tooltip outside the loaded Chrome extension; math remains functional. The guarded development page produced zero console errors. The production extension scenario and all 19 unit tests passed again after this final guard. Neither development CORS nor sandbox permissions were broadened. The final source prefix containing the original Strict samples was compared byte-for-byte against `HEAD` and matched.

## GitHub formatting and welcome showcase | 1.4.0

GitHub formatting is the new default, independent of preview appearance. Strict Markdown retains the previous renderer and exact original welcome source on new editor pages. The new English, Czech and German showcase covers the supported Markdown and safe HTML features. Format changes rerender only; they preserve raw text, cursor, dirty state and undo. The supplied profile README was also rendered locally with its aligned header, mixed HTML/Markdown tables, image placeholders and three alerts.

`npm test` passed 19 tests. TypeScript, the production build and all five loaded-extension browser scenarios passed. The new scenario verifies the complete welcome saved to genuine OPFS bytes, the unchanged Strict welcome, setting persistence and invalid-value fallback, format switching, keyboard details and image actions, heading/footnote links and duplicate-ID isolation. It also checks HTML-to-plain replacement, image-state reset between files, cancelled and stale directory pickers, and actual OPFS image decoding. Existing save conflict, overwrite cancellation and failure tests remain intact. The production dependency audit reported zero vulnerabilities; the two added Markdown plugins are bundled with their MIT notices.

### HTML and image boundaries

Raw HTML and footnotes render and sanitize as a complete tree because their tags can span Markdown token groups. Ordinary Markdown keeps the existing prefix/suffix block update path. DOMPurify retains its clobbering protection; document IDs/names and matching fragment links are isolated from application IDs. Arbitrary authored classes, styles, handlers, controls, embeds, SVG markup and resource attributes are removed. GPT-6 Astra at xhigh independently reviewed the HTML/image trust boundaries and asynchronous state transitions. That source review found and the primary agent fixed two cache-transition defects and a namespace collision; the final source review found no remaining confirmed P1/P2 issue. The primary agent executed the browser checks rather than treating model agreement as proof.

Images are neutralized in an inert template before sanitization/import and recreated only from fixed bundled aliases or explicit image consent. The adversarial browser fixture triggered no automatic HTTP(S) requests and did not execute its scripts or handlers. One clicked HTTPS image used an intercepted real browser image request; the read-only folder flow decoded genuine OPFS SVG bytes. A script and external-image reference inside that SVG did not execute or issue another request. Folder cancellation leaves a usable control, and a folder result arriving after a new document cannot populate the new document's image state. Local blobs are capped at 10 MiB each and 64 MiB total, with 128 approved sources, and revoked on document replacement or non-cached page exit.

Chromium 156 reports enforced inline-handler CSP rejections while parsing even an inert template, detached HTML document or DOMParser document. A focused native-browser probe established this before the test was adjusted. The malicious-fixture test accepts only that specific enforced rejection during parsing; other console errors still fail. It separately requires no handler attributes, no execution marker and zero automatic document HTTP(S) requests. Benign showcase/profile checks reported zero browser errors. Script policy and host permissions are unchanged; `img-src` additionally permits `blob:` and HTTPS for explicit image display. Remote images use no referrer and normal browser image/cookie policy.

### Appearance and performance

Twenty-four axe checks passed without violations: the main window and settings in EN/CS/DE, light/dark, at 1440 × 900 and 390 × 844. No outer horizontal overflow was found. Fresh screenshots of the showcase, safe HTML, alerts, settings and supplied profile were inspected. At 390 × 460, the settings close button and focused last control remain visible; Escape restores focus. No main-window redesign or new theme palette is included in this release.

The extracted 1.3.1 release and new build opened the same real 100 KiB/1 MiB Markdown fixtures three times each in isolated Chromium 156.0.8078.4 at 1440 × 900, without throttling. Timings start at file-input change or typing and end two frames after preview mutation; typing includes the existing 120 ms debounce. Undo's preview was flushed before the next import. Medians follow; host variation prevents a universal speed claim.

| Check | 1.3.1 | 1.4.0 preflight |
| :--- | ---: | ---: |
| 100 KiB open and preview | 444.3 ms | 412.9 ms |
| 100 KiB edit and preview | 230.1 ms | 253.3 ms |
| 1 MiB open and preview | 2,354.7 ms | 2,401.6 ms |
| 1 MiB edit and preview | 628.2 ms | 665.5 ms |
| Local load event | 322.2 ms | 298.1 ms |
| Largest contentful paint | 408 ms | 540 ms |
| Cumulative layout shift | 0 | 0 |

The final main JavaScript is 711,160 bytes, gzip 252,648 bytes using Node defaults, compared with 1.3.1's 643,316/225,684 bytes. The new welcome is substantially longer than the previous sample, and the extended parser adds bundle weight. This is not an across-the-board speed improvement. Large mixed-HTML documents use a full-tree update and can be slower than plain Markdown. Field INP, worst-case 5 MiB latency and physical mobile behavior remain unmeasured. The native image-folder chooser remains unverified. The new file/image checks use genuine OPFS handles, not a new external-disk/native-chooser validation. Earlier external-disk evidence and its limits remain below.

### Release archive

The 287,406-byte archive was extracted separately. All 18 files match the final build, the manifest reports 1.4.0, and its three bundled images decoded successfully. The extracted extension opened a real local Czech Markdown file, rendered safe HTML, edited it and saved exact BOM/CRLF bytes to genuine OPFS; the original disk fixture stayed unchanged. It reported no browser errors or HTTP(S) requests. SHA-256: `2e8297086d135d3536f5c319d883384d990178ff2d841c78dbe76936fde59da1`.

The first Linux CI run exposed a test synchronization race: filling the editor immediately after discard confirmation could run before the native dialog's close event completed the new-document operation. The test now waits for the enabled New control and empty preview before entering the next fixture. Production code and archive bytes did not change.

## Pinned action startup | 1.3.1

The toolbar action now runs a small launcher directly instead of dispatching its opening through the background service worker. It activates an existing editor without navigating or rebuilding its document, preferring the current window and matching its private-browsing mode. It creates a new editor only when none is open. Successful activation closes the launcher; failure keeps a native link available. No permission, keepalive, polling or document persistence was added. The worker retains the existing validated local-file message handler.

`npm test` passed all 19 tests. The complete local browser command passed all four scenarios, covering editor/file-save regressions, language/preferences, the launcher and incremental preview updates. TypeScript and the production build passed; the production dependency audit reported zero vulnerabilities. The launcher scenario checks first opening, repeated reuse with one editor tab, unchanged unsaved text, undo, and the real fallback link after an injected context-lookup failure. The regular launcher document is used in this test; it does not establish native popup lifecycle or private-window behavior.

Claude Opus reviewed the initial launcher and found no blocking defect. Its follow-up review was unavailable after quota exhaustion. Astra reviewed the final context-selection and success-close route and found no confirmed blocking defect; its review did not execute browser tests. The primary agent verified the browser API calls and preserved the file-safety and CSP boundaries. Chrome's [runtime API](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-getContexts) provides the extension's own contexts from Chrome 116; Margin retains its Chrome 120 minimum.

An isolated Chromium measurement timed real Chrome API work after launcher document initialization. First creation took 65.8 ms; reuse took 37.1, 38.1 and 35.9 ms, while the editor-tab count stayed at one. These figures exclude toolbar dispatch, popup creation and HTML loading. Earlier end-to-end native-action probes varied substantially and some timed out, so they do not support a reliable before/after latency claim. Physical Brave latency, native popup behavior and private-window behavior remain unverified.

### Preview rendering and original icon

Editing now preserves unchanged top-level preview blocks instead of rebuilding the entire DOM. Full-document Markdown parsing and rendering remain, preserving reference resolution and the shared highlighting budget. Only the changed range is sanitized and inserted. Previously sanitized blocks remain unchanged. The one-document in-memory HTML comparison cache is capped at 32 × 1,024 × 1,024 characters and rebuilt on language changes; it is not persisted.

The new real-browser regression verifies DOM identity for unchanged headings, quotes, tables and code, changed reference definitions, insertion/deletion, an empty document and recovery. Existing tests also cover localized task labels, the aggregate code budget, blocked active content, zero automatic document HTTP(S) requests and genuine OPFS save bytes. Astra independently checked the renderer and compared 13 token-group fixtures with markdown-it's full output without finding a confirmed defect. The primary agent executed the DOM regressions.

An initial paired test used real synthetic 100 KiB and 1 MiB files in isolated Chromium at 1440 × 900. Browser timings started at file-input change or typing and ended two frames after preview mutation, including the 120 ms typing debounce. The 100 KiB edit changed from 386.1 to 176.1 ms; the 1 MiB edit changed from 2,686.8 to 523.4 ms. Full 1 MiB opening remained around 2.7 seconds. These local observations do not establish a universal speedup; large single-block documents still require replacing their whole block.

The user-preferred opposing corner-bracket icon replaces the M, with stronger vector geometry and new 16/32/48/128 px exports. Browser PNG decoding verified each dimension, visible pixels, transparent background pixels and transparent corners. Fresh light/dark screenshots at 1440 × 900 and 390 × 844 were inspected; all four axe checks reported zero violations and no outer horizontal overflow. The final main JavaScript is 643,316 bytes, gzip 225,684 bytes using Node defaults, close to 1.3.0's 643,285/225,681 bytes. One local load measured 362.5 ms, LCP 584 ms and CLS 0. Field INP, physical mobile devices and worst-case 5 MiB latency remain unmeasured.

A second comparison loaded the extracted 1.3.0 release and final build in separate isolated Chromium sessions, with three runs for each file size. Medians are below. Host load varied substantially, so these support the reduced DOM work without establishing a guaranteed speed ratio.

| Check | 1.3.0 | 1.3.1 |
| :--- | ---: | ---: |
| 100 KiB open and preview | 575.1 ms | 431 ms |
| 100 KiB edit and preview | 541.5 ms | 168.3 ms |
| 1 MiB open and preview | 3,796.9 ms | 2,852 ms |
| 1 MiB edit and preview | 4,709.1 ms | 605.3 ms |

The final 258,475-byte ZIP was extracted separately. All 15 files match `dist/` byte for byte and its manifest reports 1.3.1. The extracted extension opened a real local Czech Markdown fixture, edited and rendered it, then wrote a genuine OPFS target with exact UTF-8 BOM/CRLF bytes; the original disk fixture stayed unchanged. No browser error occurred. This archive check does not repeat the native external-disk write/chooser tests described below. SHA-256: `91487ed90af5983df0e1229e4f29799b29df12d16e112ab5431340d7e31208f7`.

## Language, editor profiles and icon | 1.3.0

Checked on 1 November 2026 on Windows. `npm test` passed 19 tests. `npm run test:browser` passed TypeScript, the production build and both loaded-extension scenarios. `npm audit --omit=dev` reported zero vulnerabilities. No runtime dependency or permission was added.

Device-language resolution covers regional English, Czech and German, ordered language preferences and an unsupported-language fallback. Browser checks cover manual persistence, device language changes, invalid stored choices, translated labels/errors/dialogs, and unchanged document names, raw text, cursor, dirty state and undo. All three editor profiles reconfigure the existing CodeMirror state. A focused independent source review found no confirmed substantive defect.

Twelve final axe checks of the window and settings in Czech, English and German passed without violations at 1440 × 900 and 390 × 844. No outer horizontal overflow was found. Settings center exactly in the viewport; at 390 × 460 both Close and the focused last control remain visible. German device and monospace labels were shortened after screenshot and text-width inspection. Fresh desktop and mobile images were inspected. The settings close action restores keyboard focus.

The SVG and four PNG icons share a geometric M. Actual PNG decoding confirmed the expected 16, 32, 48 and 128 px dimensions, transparent corner pixels and clear background pixels. The source and Markdown palettes remain those validated for 1.2.0.

### Local performance

The extracted 1.2.0 release and final 1.3.0 build ran on the same machine in Chromium 156.0.8078.4 at 1440 × 900, in light mode with reduced motion and no throttling. Both imported the same 102,400-byte Markdown fixture five times. Timings include browser automation and two animation frames after insertion.

| Check | 1.2.0 | 1.3.0 |
| :--- | ---: | ---: |
| Local load event | 373 ms | 357.2 ms |
| Largest contentful paint | 496 ms | 476 ms |
| Cumulative layout shift | 0 | 0 |
| Import and preview, median of 5 | 336 ms | 295.7 ms |
| Main JavaScript bytes | 619,429 | 643,285 |
| Main JavaScript gzip bytes, Node zlib defaults | 219,309 | 225,681 |

Final import runs were 357.1, 278.7, 287.7, 295.7 and 299.7 ms. Repeated local preflight runs varied, so these results do not establish a statistically significant speed improvement or a universal latency guarantee. Field INP, physical mobile behavior and worst-case 5 MiB rendering remain unmeasured.

### Archive and Brave update

The final ZIP contains 259,642 bytes. Its separately extracted manifest reports 1.3.0 and its main JavaScript matches the final production build byte for byte. The release smoke check opened a real local Markdown fixture and preserved its text while switching language and profile; it reported no browser errors or axe violations.

The existing Brave unpacked-extension folder was backed up before replacing its files. All 13 release files match the installed files byte for byte. Brave's Reload action confirmed version 1.3.0 under the existing extension ID, and the toolbar action opened the translated editor. Browser permissions were not changed. Native Windows file/folder chooser automation and real external disk-write tests were not repeated; the earlier disk evidence and its limits remain below.

Archive SHA-256: `91a227e405de7c1f6a5216dac2c10dbe5be405814e28675fd9c8bedad5cb830b`.

## Modern window and Nord | 1.2.0

Checked on 1 November 2026 in Chromium 156.0.8078.4 on Windows. `npm test` passed all 16 file tests. `npm run test:browser` passed TypeScript, the production build and the loaded-extension scenario, including persistence of Fluent/Nord and the Nord preview. `npm audit --omit=dev` reported zero vulnerabilities. Impeccable's static scan of the shell and both stylesheets returned no findings.

Claude Opus 5.5 authored the refreshed shell, application styles, Markdown styles and design document. Astra independently reviewed the rendered Fluent/Nord windows and settings and found no material visual defect. The primary agent tested the result and corrected image-policy incompatibilities, clipped font selection text and source/error contrast. File-handling code and permissions are unchanged.

The new checkbox images initially violated `img-src 'self'`. CSS border check marks replaced them, and the optional blocked-image glyph was removed. The existing image policy remains intact. No browser error or document-triggered HTTP(S) request was observed in the repaired build.

### Rendered checks

Eighty-two ordinary-color axe and layout checks passed with zero violations and no outer horizontal overflow. They cover all five application styles in light/dark at 1440 × 900 and 390 × 844, their settings, all four Markdown presets, new-style discard dialogs and save validation in every application style. Layout checks also cover 320, 560, 700, 701, 960, 961, 1024 and 1920 px, large fonts, and short settings windows. Wide table/code fixtures have scrollable widths of 4,033/7,493 px while staying within their pane.

All seven settings are keyboard reachable. Escape closes settings and restores focus to its opening button. At 390 × 460, the settings body scrolls and both the close button and focused last select remain visible. The 390 px font field now has 110 px of text space for its measured 108.2 px longest option. Font and size stack below 360 px. Source size 20 px uses matching 33 px code and gutter line heights; typing and undo restore the clean document state.

Numerical checks of 104 preview syntax/background pairs have a minimum ratio of 4.71:1. All 40 source syntax colors pass against their active-line backgrounds, with a minimum of 4.66:1. Checkbox outline and check pairs exceed 3:1 in all eight preview palettes. These measurements supplement fixture-based audits; they are not a certification for every document or assistive technology.

A separate forced-colors capture uses native disabled checkboxes and a readable browser-forced black/white palette. Axe reported author text colors against the forced white background, so this case is not counted as an automated contrast pass. The screenshot was inspected directly. The distinction between computed author colors and forced used colors is described by the [CSS Color Adjustment specification](https://drafts.csswg.org/css-color-adjust/#forced-colors-mode). Physical Windows high-contrast mode was not changed or tested.

The persistence test starts at 1200 px height while comparing the complete sample at larger source fonts, then returns to 900 px. This avoids mistaking CodeMirror's unmounted offscreen rows for changed document content.

### Local performance

The extracted 1.1.0 release and 1.2.0 build ran on the same machine and browser at 1440 × 900 with light appearance and reduced motion, without throttling. Both imported the same 102,400-byte Markdown fixture five times. Timings include browser automation and two animation frames after insertion.

| Check | 1.1.0 | 1.2.0 |
| :--- | ---: | ---: |
| Local load event | 584.1 ms | 285.1 ms |
| Largest contentful paint | 648 ms | 468 ms |
| Cumulative layout shift | 0 | 0 |
| Import and preview, median of 5 | 484.5 ms | 524.3 ms |
| Main JavaScript bytes | 616,833 | 619,429 |
| Main JavaScript gzip bytes, Node zlib defaults | 218,508 | 219,309 |

New import runs: 507.9, 426.0, 572.8, 524.3 and 652.5 ms. The interface adds no runtime dependency or font download. These few local runs do not establish a statistically significant startup improvement or universal latency guarantee. Field INP, physical mobile GPU behavior and worst-case 5 MiB rendering remain unmeasured. Native Windows file/folder chooser automation was not repeated; the earlier real-disk evidence and its limits remain below.

### Release archive

The 250,648-byte ZIP was extracted into a separate folder and loaded as an unpacked extension. Its manifest reports 1.2.0 and its JavaScript matches the production build byte for byte. The extracted build opened the disk Markdown fixture, applied Nord to both application and preview, rendered syntax colors and four disabled tasks, and passed an additional axe audit without browser errors. The archive includes the Nord MIT notice and contains no source workspace or test files.

Archive SHA-256: `092a883ff3c96f5c5a075bd57329c451b3a8be750fa0182d0a190c6bd31fa685`.

## Preview and typography | 1.1.0

Checked on 31 October 2026 in Chromium 156.0.8078.4 on Windows. `npm test` passed all 16 file tests. `npm run test:browser` passed the TypeScript check, production build and loaded-extension regression scenario. `npm audit --omit=dev` reported zero vulnerabilities.

The browser scenario verifies default and persisted preview/font/size settings, rejection of invalid stored and DOM values, preset independence from application appearance, unchanged document and dirty state, undo and the existing safe-save failure cases. Renderer checks cover nested and loose tasks, escaped markers, reference links, literal HTML inside colored fences, unknown language names, exact code text and the aggregate 20,000-character highlighting budget. No document-triggered HTTP(S) request or browser error was observed.

Fresh screenshots and axe audits covered GitHub, VS Code and reading presets in light and dark mode at 1440 × 900 and 390 × 844. Settings were checked in all six application appearances, at 390 × 844 and at 390 × 460. The close control stays visible while the settings body scrolls; Escape closes the dialog. Large 24 px monospace preview and 20 px source checks passed without outer horizontal overflow. All seven source sizes have matching code and gutter line heights. Typing and undo returned the document to its clean state after font changes.

Twenty-four axe checks reported zero violations. A separate numerical check of all 78 syntax token/background pairs found a minimum contrast ratio of 4.71:1. These checks cover the rendered fixtures, not every possible document or assistive-technology combination. Astra's independent screenshot review found no material clipping or legibility issue. Sol's source review found no confirmed P1/P2 defect in renderer escaping, checkbox creation, setting allowlists or the editor measurement callback. Claude Opus 5.5 authored the settings layout and Markdown styles; the primary agent integrated and verified them.

### Local performance comparison

The published 1.0.1 ZIP and the new build ran on the same browser and machine at 1440 × 900 without throttling. Both imported the same 102,400-byte Markdown fixture. Timings include browser automation, file input and two animation frames after insertion.

| Check | 1.0.1 | 1.1.0 |
| :--- | ---: | ---: |
| Local load event | 297.1 ms | 251.8 ms |
| Largest contentful paint | 348 ms | 312 ms |
| Cumulative layout shift | 0 | 0 |
| Import and preview, median of 5 | 298.8 ms | 333.4 ms |
| Main JavaScript bytes | 475,594 | 616,833 |
| Main JavaScript gzip bytes, Node zlib defaults | 164,822 | 218,508 |

The new import runs were 338.5, 340.9, 319.2, 333.4 and 312.5 ms. Syntax parsers add bundle weight; their per-render color budget is bounded and larger fences fall back to plain code. These few local runs do not establish a statistically significant startup improvement or a universal latency guarantee. Field INP, physical mobile GPU behavior and worst-case 5 MiB rendering remain unmeasured.

Real-disk save behavior was verified for 1.0.0 as recorded below. This update leaves file handling unchanged and repeats browser-backed OPFS save regressions; it does not repeat native Windows chooser automation.

### Release archive

The 247,242-byte 1.1.0 ZIP was extracted into a separate folder and loaded as an unpacked extension. Its manifest reports 1.1.0 and its JavaScript matches the production build byte for byte. The extracted extension rendered colored code and disabled tasks, applied independent preview and application styles, retained font/size preferences after reload and passed an additional axe audit with no browser errors.

Archive SHA-256: `dbae340f0681392fe84260310de953ec024b77b3da33759d3ced3c794d9896da`.

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
