# Changelog

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
