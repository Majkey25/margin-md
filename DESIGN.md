# Margin design (1.1.0)

A precise writing instrument: the filename is the title, the text and its preview fill the window, and the chrome stays quiet.

## Wireframe

Desktop, 1440 px, split mode (one toolbar row from 901 px up):

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [▣] Margin │ Vítejte.md                Nový Otevřít [Uložit Ctrl+S] Uložit jako …   │
│            │ Ukázkový dokument  ○ Beze změn      [Text|Vedle sebe|Náhled]  ☀  ⚙  ⤢   │
├───────────────────────────────────────────┬──────────────────────────────────────────┤
│        ○ Markdown                         │     ○ Náhled                             │  pane heads, 36 px
├───────────────────────────────────────────┼──────────────────────────────────────────┤
│   1  # Prostor pro vaše myšlenky          │     Prostor pro vaše myšlenky            │
│   2                                       │     ─────────────────────────            │
│  …   gutter 56 px, text max 52rem         │     preset column, preset background     │
├───────────────────────────────────────────┴──────────────────────────────────────────┤
│ Otevřete soubor nebo začněte psát.            101 slov   33 ř.   Ř 1, sl 1 │ Jen lokálně│
└──────────────────────────────────────────────────────────────────────────────────────┘
```

Phone, 390 px (one pane, `Vedle sebe` hidden, pane heads hidden):

```
┌───────────────────────────────────┐
│ [▣] Vítejte.md            ☀  ⚙  ⤢ │
│     Ukázkový dok…  ○ Beze změn    │
│ [Nový][Otevřít][Uložit][Uložit jako]│
│ [      Text      |     Náhled     ]│
├───────────────────────────────────┤
│ preview or source, full width     │
├───────────────────────────────────┤
│ status…           101 slov  Ř 1, sl 1│
└───────────────────────────────────┘
```

## Signature

One mark: two corner brackets that frame a page's margin on a transparent background. The 16-unit vector in `public/icon.svg` uses dark ink and a thin white keyline for contrast on browser chrome. The inline toolbar and drop marks use `--mark-ink`, which follows the current theme. PNG icons at 16, 32, 48 and 128 px retain alpha transparency.

## Surfaces

`html[data-surface]` selects one of three styles. Each has a light and a dark palette. All three share one layout and the same controls. A surface styles the application (toolbar, source pane, footer, dialogs, pane frames); it never styles rendered Markdown. The preview pane takes its colours from the Markdown preset below.

| Surface | What it does |
| --- | --- |
| `minimal` (default) | Black on white or white on true black. Hairline dividers, 6 px radii. The only filled control is Save while there are unsaved changes. |
| `glass` | A cool ground with opaque editor and preview sheets (12 px radius, 8 px gaps). The toolbar, footer and dialogs are translucent, with a static `blur(16px) saturate(1.5)`. Blue accent. Solid colours replace the glass when `backdrop-filter` is unsupported or `prefers-reduced-transparency: reduce` is set. |
| `material` | A tonal palette inspired by Material You, from one fixed sage seed. It does not read wallpaper colours. No hairlines; tone steps separate the chrome, source and preview. Pill controls, an outlined segmented control with a tonal selection and 28 px dialogs. |

## Markdown preview presets

`html[data-preview-theme]` selects one of three presets, each with a light and a dark variant that follows `html[data-theme]`. All preset styles live in `src/preview.css`, which loads after `styles.css`. Every token (`--pv-*` for layout and colour, `--tk-*` for code) is scoped to `#preview-pane`, so the preset fills the whole pane, including its sticky head, with no inner card, and nothing leaks into the application chrome. The presets are inspired by, not copies of, GitHub's README rendering (primer/css) and the VS Code built-in Markdown preview.

| Preset | Default type | Character |
| --- | --- | --- |
| `github` (default, `GitHub`) | System sans, 16 px / 1.5, column 52em | Weight-600 headings at 2 / 1.5 / 1.25 / 1 / 0.875 / 0.85 em with a hairline under h1 and h2. Blue underlined links, tinted inline-code chips, a borderless grey code surface at 85 %, fully ruled tables with alternate rows tinted, a 0.25em muted quote bar. Dark is GitHub's neutral `#0d1117`, not black. |
| `vscode` (`VS Code`) | System sans (Segoe WPC/UI first), 14 px / 22 px, column 60em | The same heading scale and h1/h2 rules, code at 1em in a bordered 3 px block, open tables with a strong header rule and light row rules, a 5 px grey quote bar on a tinted ground. Light and dark follow the neutral default-light and default-dark editor palettes (`#ffffff` / `#1f1f1f`). |
| `reading` (`Čtení`) | Reading serif, 17 px / 1.65, column 38em | The calmer original Margin preview: weight-700 headings at 1.85 / 1.4 / 1.17 / 1 / 0.94 em with no rules, ink-coloured underlined links, a 2 px quote rule, horizontal-only table rules, clear bordered code. Off-white `#fbfbfa` and soft charcoal `#161615`. |

Shared rules: nested bullets go disc → circle → square and numbers decimal → roman → alpha. Task-list checkboxes, when the renderer emits them, replace the bullet. `pre` and tables scroll horizontally inside themselves and get a focus ring in the preset's link colour; long words, URLs and inline code wrap, so nothing widens the pane. Fenced-code tokens use the `@lezer/highlight` `classHighlighter` names (`tok-keyword`, `tok-string`, `tok-comment`, …) with colours chosen for at least 4.5:1 against each preset's code surface in both themes. Images stay blocked; `.blocked-image` names what was skipped. No preview element animates.

## Palette tokens

Core roles (light / dark):

| Token | Minimal | Glass | Material |
| --- | --- | --- | --- |
| `--ground` | `#ffffff` / `#000000` | `#e4e8ec` / `#0b0e12` | `#eef3ef` / `#171d1a` |
| `--paper` (drop overlay) | `#ffffff` / `#000000` | `#ffffff` / `#12161b` | `#f8fbf8` / `#0f1512` |
| `--source` (editor) | `#ffffff` / `#000000` | `#fbfcfd` / `#101418` | `#f3f7f4` / `#131a16` |
| `--ink` | `#000000` / `#ffffff` | `#0c1116` / `#f3f6f9` | `#171d1a` / `#dee4df` |
| `--text` | `#1a1a1a` / `#e8e8e8` | `#1b222a` / `#e1e6ec` | `#1b211e` / `#d9e0db` |
| `--muted` | `#5c5c5c` / `#a3a3a3` | `#4e5966` / `#a3aebb` | `#404944` / `#bfc9c3` |
| `--faint` (gutter, disabled) | `#6b6b6b` / `#8f8f8f` | `#5b6673` / `#8d99a7` | `#56605a` / `#9aa49e` |
| `--line` | `#e7e7e7` / `#222222` | `#e3e8ed` / `#232a33` | `#d5ddd7` / `#2a322e` |
| `--primary` | `#000000` / `#ffffff` | `#0a5cc2` / `#6aacff` | `#2f6b57` / `#9dd3bb` |
| `--focus` | ink | `#0a5cc2` / `#6aacff` | `#2f6b57` / `#9dd3bb` |
| `--danger` | `#b42318` / `#ff8a80` | `#b42318` / `#ff8a80` | `#ba1a1a` / `#ffb4ab` |

Other roles: `--chrome`, `--raised`, `--field`, `--sunken`, `--hover`, `--press`, `--track`, `--seg-active`, `--selection`, `--edit-select`, `--caret`, `--active-line`, `--backdrop`, `--shadow-pop`, `--mark-ink` and the four `--syntax-*` colours that `main.ts` reads for CodeMirror highlighting. `--paper` now only backs the drop overlay. Validation results are recorded in `QA.md`.

Shape and size tokens: `--r-control`, `--r-field`, `--r-dialog`, `--r-sheet`, `--h-control` (40 px), `--gutter-w` (56 px), `--code-lh` (23 px default, set from the editor size), `--source-max` (52rem), `--measure` / `--read-pad` (fallbacks for the preview head before a preset applies), `--pane-head-h` (36 px).

## Typography roles

| Role | Stack | Use |
| --- | --- | --- |
| UI | `system-ui, -apple-system, "Segoe UI", Roboto, …` | Chrome, dialogs, blocked-image placeholders |
| Source | `var(--editor-font, var(--font-mono))` | Editor and gutter: `--editor-size` (14 px default) on `--code-lh` (size × 1.65, rounded) |
| Reading | `Charter, "Bitstream Charter", "Iowan Old Style", "Sitka Text", Sitka, "Source Serif 4", Cambria, Georgia, serif` | Default body and headings of the `reading` preset |

UI scale: 12 / 13 / 14 / 15 / 17 px. Weight 600 marks controls; 650 dialog and section titles.

User font choices are read, never redefined, by the stylesheets. `.preview` uses `font-family: var(--preview-font, <preset>)` and `font-size: var(--preview-size, <preset>)`; headings inherit the family, code stays monospace, and the preset's column width is measured in multiples of the chosen size. Phones keep the chosen size; only vertical padding shrinks. Changing a font or size changes CSS custom properties only: the Markdown, the editor state and the saved state are untouched. All stacks are installed system fonts with fallbacks, so the app makes no font requests.

## Settings

`#preferences-dialog` (title `Vzhled`) has a fixed head with the close button and a scrolling body in three sections, each a sentence-case heading over label-left, select-right rows (select column 160–200 px, 150–184 px on phones):

1. **Aplikace**: `Režim` (`#theme-setting`) with its hint, `Styl rozhraní` (`#surface-setting`) with the note for the current surface.
2. **Náhled Markdownu**: `Styl náhledu` (`#preview-theme-setting`: GitHub, VS Code, Čtení) with a hint that it is independent of the interface style, `Písmo` (`#preview-font-setting`: Podle stylu, Bezpatkové, Patkové, Neproporcionální), `Velikost` (`#preview-size-setting`: Podle stylu, 14–24 px).
3. **Editor**: `Písmo` (`#editor-font-setting`: Systémové, Cascadia, Consolas), `Velikost` (`#editor-size-setting`: 12–20 px).

Repeated visible labels carry a visually hidden suffix (`Písmo náhledu`, `Písmo editoru`, …) so each select has a unique accessible name. A closing note says that fonts come from the device with fallbacks and that settings stay in this browser. Every select applies at once; there is no Apply or Reset. The dialog is 480 px wide, anchored under the toolbar from 901 px, and never taller than the viewport.

## Behaviour notes

- **Theme toggle.** `#theme-toggle` shows the theme in effect: a sun in light mode and a moon in dark mode, matching `aria-pressed`. The circular reveal belongs to `preferences.ts`. CSS only sets `animation: none` and `mix-blend-mode: normal` on the root snapshots, sets `pointer-events: none` on `::view-transition`, and turns off transitions under `html.theme-switch` so the new snapshot already has the final palette. There are no named view transitions and no permanent `will-change`.
- **Dirty state.** `#dirty-state` has a hollow dot while the document is clean and a filled dot while it has unsaved changes. While there are unsaved changes, `.toolbar:has(#dirty-state[data-dirty="true"])` fills Save with `--primary`. Disabled buttons use `--faint` text, so they stay readable.
- **Panes.** The two panes are flex children, and `[hidden]` hides a pane with `display: none !important`. CodeMirror is styled through `#editor .cm-*` so these rules outrank the library's base theme. In `Text` mode the gutter and text column are centred. The preview head shows only its title; blocked images explain themselves inline. Filenames are cut off with an ellipsis.
- **Dialogs.** All dialogs are native `<dialog>`. They open with a short opacity and transform change through `@starting-style`. Save As has a full-width field, a hint naming the required extension, an inline error box and a filled primary action. The confirm action in the discard and overwrite dialog uses `--danger`. Preferences is described above; it uses a light backdrop so changes stay visible behind it.
- **Responsive.** Keyboard hints hide below 1280 px and the wordmark below 960 px. From 900 px down the toolbar uses two rows. From 700 px down there is one pane, `Vedle sebe` is hidden and so is `Jen lokálně`. From 560 px down the toolbar uses three rows, pane heads and the line count hide, and the buttons in the dialogs grow to full width. Every control stays 40 px tall.
- **Motion.** The only motion is button press scaling (120 ms), dialog entry (about 200 ms) and the theme reveal. Typing, changing a preset, font or size never animates. Reduced motion removes all of it.
