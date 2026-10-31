# Margin design (1.0.0)

A precise writing instrument: the filename is the title, the text and its preview fill the window, and the chrome stays quiet.

## Wireframe

Desktop, 1440 px, split mode (one toolbar row from 901 px up):

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [▣] Margin │ Vítejte.md                Nový Otevřít [Uložit Ctrl+S] Uložit jako …   │
│            │ Ukázkový dokument  ○ Beze změn      [Text|Vedle sebe|Náhled]  ☀  ⚙  ⤢   │
├───────────────────────────────────────────┬──────────────────────────────────────────┤
│        ○ Markdown                         │        ○ Náhled   HTML a obrázky se nevy… │  pane heads, 36 px
├───────────────────────────────────────────┼──────────────────────────────────────────┤
│   1  # Prostor pro vaše myšlenky          │        Prostor pro vaše myšlenky         │
│   2                                       │        Markdown je jen text. …           │
│  …   gutter 56 px, text max 52rem         │        reading column 40rem, centred     │
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

One mark: two corner brackets (crop marks) that frame a page's margin, white on a solid badge. It is drawn on a 16-unit grid in `public/icon.svg` (black badge, white glyph, so it shows on light and dark browser chrome) and repeated inline in the toolbar. In the toolbar the badge uses `--mark-bg` (ink in Minimal and Glass, sage in Material) and the glyph uses `--mark-fg`. Nothing else is decorative.

## Surfaces

`html[data-surface]` selects one of three styles. Each has a light and a dark palette. All three share one layout and the same controls.

| Surface | What it does |
| --- | --- |
| `minimal` (default) | Black on white or white on true black. Hairline dividers, 6 px radii. The only filled control is Save while there are unsaved changes. |
| `glass` | A cool ground with opaque editor and preview sheets (12 px radius, 8 px gaps). The toolbar, footer, sticky preview head and dialogs are translucent, with a static `blur(16px) saturate(1.5)`. Blue accent. Solid colours replace the glass when `backdrop-filter` is unsupported or `prefers-reduced-transparency: reduce` is set. |
| `material` | A tonal palette inspired by Material You, from one fixed sage seed. It does not read wallpaper colours. No hairlines; tone steps separate the chrome, source and preview. Pill controls, an outlined segmented control with a tonal selection, 28 px dialogs and tinted blockquotes. |

## Palette tokens

Core roles (light / dark):

| Token | Minimal | Glass | Material |
| --- | --- | --- | --- |
| `--ground` | `#ffffff` / `#000000` | `#e4e8ec` / `#0b0e12` | `#eef3ef` / `#171d1a` |
| `--paper` (preview) | `#ffffff` / `#000000` | `#ffffff` / `#12161b` | `#f8fbf8` / `#0f1512` |
| `--source` (editor) | `#ffffff` / `#000000` | `#fbfcfd` / `#101418` | `#f3f7f4` / `#131a16` |
| `--ink` | `#000000` / `#ffffff` | `#0c1116` / `#f3f6f9` | `#171d1a` / `#dee4df` |
| `--text` | `#1a1a1a` / `#e8e8e8` | `#1b222a` / `#e1e6ec` | `#1b211e` / `#d9e0db` |
| `--muted` | `#5c5c5c` / `#a3a3a3` | `#4e5966` / `#a3aebb` | `#404944` / `#bfc9c3` |
| `--faint` (gutter, disabled) | `#6b6b6b` / `#8f8f8f` | `#5b6673` / `#8d99a7` | `#56605a` / `#9aa49e` |
| `--line` | `#e7e7e7` / `#222222` | `#e3e8ed` / `#232a33` | `#d5ddd7` / `#2a322e` |
| `--primary` | `#000000` / `#ffffff` | `#0a5cc2` / `#6aacff` | `#2f6b57` / `#9dd3bb` |
| `--focus` | ink | `#0a5cc2` / `#6aacff` | `#2f6b57` / `#9dd3bb` |
| `--danger` | `#b42318` / `#ff8a80` | `#b42318` / `#ff8a80` | `#ba1a1a` / `#ffb4ab` |

Other roles: `--chrome`, `--raised`, `--field`, `--sunken`, `--hover`, `--press`, `--track`, `--seg-active`, `--selection`, `--edit-select`, `--caret`, `--active-line`, `--code-bg`, `--quote-rule` / `--quote-bg`, `--backdrop`, `--shadow-pop`, `--mark-bg` / `--mark-fg` and the four `--syntax-*` colours that `main.ts` reads for CodeMirror highlighting. The text tiers were chosen to target 4.5:1 or better on their surfaces. I estimated those ratios by hand; axe has not measured them yet.

Shape and size tokens: `--r-control`, `--r-field`, `--r-dialog`, `--r-code`, `--r-sheet`, `--h-control` (40 px), `--gutter-w` (56 px), `--code-lh` (23 px), `--source-max` (52rem), `--measure` (40rem), `--read-pad`, `--pane-head-h` (36 px).

## Typography roles

| Role | Stack | Use |
| --- | --- | --- |
| UI | `system-ui, -apple-system, "Segoe UI", Roboto, …` | Chrome, dialogs, tables in the preview |
| Source | `ui-monospace, "Cascadia Code", "Cascadia Mono", "SF Mono", Menlo, Consolas, …` | Editor and code, 14 px on a 23 px line |
| Reading | `Charter, "Bitstream Charter", "Iowan Old Style", "Sitka Text", Sitka, "Source Serif 4", Cambria, Georgia, serif` | Preview body and headings |

UI scale: 12 / 13 / 14 / 15 / 17 px. Preview: 17 px body (16 px on phones) at 1.65 line height. Headings are 1.85, 1.4, 1.17, 1 and 0.94 em at weight 700, with no borders. Weight 600 marks controls and labels; 700 is for headings. All of these are system fonts, so the app makes no font requests.

## Behaviour notes

- **Theme toggle.** `#theme-toggle` shows the theme in effect: a sun in light mode and a moon in dark mode, matching `aria-pressed`. The circular reveal belongs to `preferences.ts`. CSS only sets `animation: none` and `mix-blend-mode: normal` on the root snapshots, sets `pointer-events: none` on `::view-transition`, and turns off transitions under `html.theme-switch` so the new snapshot already has the final palette. There are no named view transitions and no permanent `will-change`.
- **Dirty state.** `#dirty-state` has a hollow dot while the document is clean and a filled dot while it has unsaved changes. While there are unsaved changes, `.toolbar:has(#dirty-state[data-dirty="true"])` fills Save with `--primary`. Disabled buttons use `--faint` text, so they stay readable.
- **Panes.** The two panes are flex children, and `[hidden]` hides a pane with `display: none !important`. CodeMirror is styled through `#editor .cm-*` so these rules outrank the library's base theme. In `Text` mode the gutter and text column are centred. Preview tables use `display: block` with `max-width: 100%`, so they scroll on their own. `pre` scrolls horizontally. Filenames are cut off with an ellipsis.
- **Dialogs.** All dialogs are native `<dialog>`. They open with a short opacity and transform change through `@starting-style`. Save As has a full-width field, a hint naming the required extension, an inline error box and a filled primary action. The confirm action in the discard and overwrite dialog uses `--danger`. Preferences has two labelled selects, and a note under the style select changes with `data-surface`. On wide screens it is anchored under the toolbar, with a light backdrop so the change stays visible.
- **Responsive.** Keyboard hints hide below 1280 px and the wordmark below 960 px. From 900 px down the toolbar uses two rows. From 700 px down there is one pane, `Vedle sebe` is hidden and so is `Jen lokálně`. From 560 px down the toolbar uses three rows, pane heads and the line count hide, and the buttons in the dialogs grow to full width. Every control stays 40 px tall.
- **Motion.** The only motion is button press scaling (120 ms), dialog entry (about 200 ms) and the theme reveal. Reduced motion removes all of it.
