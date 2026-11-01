# Changelog

## 1.5.0 | 2026-11-01

* Add Paper and Terminal application themes and Markdown presets, with light and dark palettes.
* Add clickable previews for every application theme, Markdown preset and editor profile, using the same palettes as the real window.
* Show live font samples and keep native selects, device appearance, language and document history intact.
* Refine the main window's save-state chip, focused pane and status bar; widen the centered settings dialog with a responsive layout.
* Render Mermaid diagrams and KaTeX math only in GitHub format, with localized welcome examples and unchanged Strict Markdown.
* Load rich previews on demand, isolate diagram rendering from network and extension APIs, bound complexity and preserve source on errors.

## 1.4.0 | 2026-11-01

* Add GitHub and Strict Markdown formatting independently of preview appearance; preserve open text, cursor, saved state and undo when switching.
* Expand the localized welcome into a formatting showcase, keeping the original short welcome for new Strict Markdown pages.
* Support safe HTML layouts, alignment, collapsible details, keyboard keys, subscripts, superscripts and text highlighting.
* Add GitHub alerts, footnotes, emoji shortcodes, automatic links, heading anchors and bounded diff highlighting.
* Display bundled sample images offline; load HTTPS images only after a click and local images through a selected read-only document folder.
* Bound retained image sources and local image bytes, clear image consent on document replacement, and reject stale picker results.
* Preserve the fast block-update path for ordinary Markdown; sanitize mixed HTML as a complete tree with isolated document IDs and no active content.

## 1.3.1 | 2026-11-01

* Refine the original transparent corner-bracket icon with stronger vector geometry and fresh PNG exports.
* Preserve unchanged preview blocks while editing; reparse the full Markdown so references and syntax budgets stay correct.
* Open the editor from a small action launcher instead of waiting for a background-worker click handler.
* Reuse an existing editor without reloading its text or history; create a new tab only when needed.
* Prefer the current window and keep private and normal editor contexts separate.
* Keep a native link available if automatic opening fails and omit the unnecessary modulepreload polyfill.

## 1.3.0 | 2026-11-01

* Replace the corner brackets with a geometric M monogram, transparent browser icons and matching in-app marks.
* Follow the device's browser language by default, with persistent English, Czech and German overrides.
* Translate controls, accessible labels, dialogs, errors and counters without changing open documents.
* Add Code, Writing and Plain text editor profiles that preserve text, cursor, saved state and undo history.
* Add installed sans-serif and serif source fonts and center the scrollable settings dialog.

## 1.2.0 | 2026-11-01

* Refresh the whole window with an inset writing surface, clearer document identity and consistent command icons.
* Add Fluent and Nord application styles, each with light and dark palettes and distinct controls.
* Add a Nord Markdown preset and refine headings, tables, quotes, code and task styling across all four presets.
* Pair font and size controls in grouped settings while keeping the close control visible in short windows.
* Draw readable task marks with CSS and use native checkboxes in forced colors, preserving the existing image policy.
* Improve Nord source and error-state contrast while retaining device appearance, font preferences, undo and safe saving.

## 1.1.0 | 2026-10-31

* Add independent GitHub, VS Code and reading presets for the Markdown preview, each in light and dark mode.
* Add separate preview and source font and size settings, with local persistence and installed-font fallbacks.
* Group appearance settings in a scrollable dialog that keeps its close control visible in small windows.
* Highlight common fenced code languages with a bounded rendering budget and display Markdown task checkboxes.
* Preserve document content, undo history and existing safe-save behavior when appearance changes.

## 1.0.1 | 2026-10-31

* Replace the solid icon badge with a transparent corner-bracket mark.
* Update browser icons, favicon and in-app marks while preserving light and dark contrast.

## 1.0.0 | 2026-10-31

* First stable release of the local Markdown editor and live preview.
* Source, split and preview modes, fullscreen, keyboard shortcuts and a responsive interface.
* Device-aware light and dark appearance, a circular theme switch, and Minimal, Glass and Material You styles.
* Markdown table alignment preserved through safe CSS classes.
* Safe Save As with a folder picker, filename validation and explicit overwrite confirmation.
* Exact byte checks before writing and after write permission is granted.
* UTF-8 BOM and newline preservation, unsaved-change guards, and blocked active Markdown content.
* Installable ZIP with third-party notices and SHA-256 checksums.
