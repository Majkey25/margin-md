# Margin design (1.5.0)

A precise writing instrument. The filename is the title, the document sits on its own sheet inside a quiet window frame, and the chrome only holds what you act on.

This revision adds two application styles (Paper, Terminal), two Markdown presets (Paper, Terminal), visual cards for every style/preset/editor profile, live font samples, a wider centred settings dialog and small main-window refinements. Mermaid diagrams and math (`.markdown-diagram`, `.diagram-renderer`, `.math-inline`, `.math-block`, `[data-rich-state]`) keep their existing styles and scroll/focus/error behaviour unchanged.

Formatting uses the existing settings row grammar. A native GitHub/Strict Markdown select changes syntax independently of preview appearance and never edits the open source. New welcome pages use the selected format; Strict retains the original short sample.

The showcase demonstrates the document language rather than introducing another application layout. Details, footnotes, keyboard keys and alerts inherit preview typography and surface tokens. Alert labels carry their meaning in text; their five restrained border accents follow light/dark appearance. Images stay behind an explicit action unless they are fixed bundled demo assets. Image controls show the remote host or the relative local path.

## Design plan

- **Question the window answers:** "What am I editing, is it saved, and what does it look like?" The filename (16 px semibold) and the save state lead; the sheet that holds the text is the largest thing on screen.
- **One frame grammar for every style:** chrome (toolbar + footer) sits on the ground; the working panes sit on a sheet inset 8 px from the window edges (6 px on phones). Styles change the sheet's surface, shape and depth, never the layout.
- **Icons where they speed scanning:** file commands, view modes, pane heads and the local-only note carry one authored 20-unit outline set (1.5 stroke, round joins). Labels always stay visible on desktop.
- **Colour budget:** accent only on the current view, focus (including the head rule of the focused pane), the caret, the unsaved chip and Save while there are unsaved changes, and the selected settings card.
- **Motion:** press 150 ms, dialog entry 200 ms, the circular theme reveal. Nothing else moves; miniatures are static. Reduced motion removes all of it.
- **Show, then choose:** every visual choice in settings has a miniature drawn from the same tokens as the real window or pane, next to its native select.

Task mode: Operate for the editor and settings (familiar controls, dense but calm), Read for the rendered Markdown (measure, rhythm, complete element set).

## Wireframe

Desktop, 1440 px, split mode (one toolbar row from 961 px):

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ⌜⌟ Margin │ Vítejte.md                 [▢+ Nový][▭ Otevřít] │ [💾 Uložit ⌨][Uložit jako ⌨]  │
│           │ Ukázkový dokument (○ Beze změn)    (‹› Text | ▥ Vedle sebe | ◉ Náhled)  ☀ ⚙ ⤢   │
│ ┌───────────────────────────────────────────┬──────────────────────────────────────────┐ │
│ │ ‹› Markdown                               │ ◉ Náhled                                 │ │ pane heads 36 px, split only
│ ├───────────────────────────────────────────┼──────────────────────────────────────────┤ │
│ │  1  # Prostor pro vaše myšlenky           │   Prostor pro vaše myšlenky              │ │
│ │  …  gutter 56 px, text max 52rem          │   preset column, preset background       │ │
│ └───────────────────────────────────────────┴──────────────────────────────────────────┘ │ sheet inset 8 px
│ Otevřete soubor nebo začněte psát.            101 slov │ 33 ř. │ Ř 1, sl 1 │ ▭ Jen lokálně │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

Tablet, 961–1180 px: the wordmark and the view-mode icons hide; one row remains. 701–960 px: two rows (identity + utilities, then file actions + modes).

Phone, 390 px (one pane, `Vedle sebe` hidden, pane heads hidden, 44 px targets):

```
┌───────────────────────────────────┐
│ ⌜⌟ Vítejte.md              ☀  ⚙  ⤢ │
│    Ukázkový dok…  ○ Beze změn     │
│ [Nový][Otevřít][Uložit][Uložit jako]│
│ [  ‹› Text     |    ◉ Náhled      ]│
│ ┌───────────────────────────────┐ │
│ │ preview or source              │ │ sheet inset 6 px
│ └───────────────────────────────┘ │
│ status…           101 slov  Ř 1, sl 1│
└───────────────────────────────────┘
```

Short phone windows (≤ 520 px tall) drop controls to 40 px so the sheet keeps its height.

## Signature

One mark: the original two corner brackets, with stronger strokes and clean vector geometry on a transparent background (`public/icon.svg`, PNGs keep alpha). A white keyline keeps the browser icon legible on dark toolbars. Toolbar and drop marks share the geometry and use `--mark-ink`.

## Token grammar

`styles.css` defines every token on `:root`, then each `:root[data-surface=…]` and `…[data-theme="dark"]` block overrides values. Components read shared tokens. Conditional selectors show the current style description and provide the Glass fallbacks.

Every palette selector is a pair: `:root[data-surface=X][data-theme=Y], .theme-preview[data-surface=X][data-theme=Y]`. The base block (`:root, .theme-preview`) resets each miniature to Minimal light before its own style applies, so a card never inherits tokens from the style currently in use. The cascade is the same as on the root: base (0,1,0), dark and style (0,2,0), style-dark (0,3,0).

| Group | Tokens |
| --- | --- |
| Type | `--font-ui`, `--font-mono`, `--font-read`, `--font-title` (filename, dialog titles), `--font-meta` (doc metadata, pane titles, status bar), `--fs-xs` 12, `--fs-sm` 13, `--fs-md` 14, `--fs-lg` 16, `--fs-title` 18 |
| Size | `--h-control` 40 (44 on phones), `--gutter-w` 56, `--code-lh`, `--source-max` 52rem, `--prose-max` 42rem, `--pane-head-h` 36 |
| Shape | `--r-control`, `--r-field`, `--r-seg`, `--r-group`, `--r-dialog` |
| Frame | `--frame-pad`, `--frame-gap`, `--ws-border`, `--ws-radius`, `--ws-bg`, `--sheet-border`, `--sheet-radius`, `--split-line` |
| Surface | `--ground`, `--chrome`, `--paper`, `--source`, `--raised`, `--field`, `--sunken`, `--group-bg`, `--group-border` |
| Ink | `--ink`, `--text`, `--muted`, `--faint`, `--icon`, `--mark-ink` |
| Lines | `--line`, `--line-strong`, `--control-line` |
| State | `--hover`, `--press` (state layers painted over any fill), `--focus`, `--focus-offset`, `--accent`, `--primary`, `--on-primary`, `--danger`, `--on-danger`, `--danger-soft` |
| Controls | `--btn-std-bg`, `--btn-std-border`, `--btn-std-shadow`, `--field-edge`, `--seg-track-bg`, `--seg-track-border`, `--seg-inset`, `--seg-active-bg`, `--seg-active-fg`, `--seg-active-shadow`, `--seg-indicator`, `--seg-divider` |
| Overlay | `--dialog-border`, `--dialog-foot-bg`, `--dialog-foot-line`, `--shadow-pop`, `--backdrop`, `--backdrop-soft`, `--blur` |
| Editor | `--selection`, `--edit-select`, `--edit-select-blur`, `--caret`, `--active-line`, `--scroll-thumb`, `--syntax-heading`, `--syntax-mark`, `--syntax-link`, `--syntax-code` (read by `main.ts`) |

## Application styles

`html[data-surface]` selects one of seven styles, each with its own light and dark palette. They share layout and controls and differ in surface, shape, depth, type and interaction language. No style ever reaches rendered Markdown.

| Style | Surface | Shape | Depth | Interaction |
| --- | --- | --- | --- | --- |
| `minimal` (default) | White on white / true black. One sheet framed by a hairline. | 6 px controls, 10 px sheet | Lines only | Ink. Selected view is a white chip on a grey track. Save fills black (white in dark) only while there are unsaved changes. |
| `glass` | Cool ground, translucent toolbar, footer and dialogs (`blur(16px) saturate(1.5)`), two opaque sheets with an 8 px gutter. | 8 px controls, 12 px sheets, 16 px dialogs | Stroke on sheets; raised white chip | Blue accent. Solid colours when `backdrop-filter` is unsupported or transparency is reduced. |
| `material` | Tonal sage palette from one fixed seed (no wallpaper). Two tonal containers, no strokes. | Pills, 20 px containers, 28 px dialogs | Tone steps only | Outlined segmented control with dividers and a tonal selection; state layers on every control. |
| `fluent` | Windows-inspired Mica-like neutral ground, one content layer with an 8 px radius and a stroke. Segoe UI Variable first. | 4 px controls, 8 px layer and dialog | Strokes, control bottom edge, dialog flyout shadow | Blue accent. Selected view shows a 3 px accent pill under the label. Black/white focus ring. Dialog actions sit on a footer band. |
| `nord` | Arctic layers: Snow Storm in light, Polar Night in dark (darker frame, nord0 sheet). One sheet, panes divided by a layer line. | 4 px controls, 6 px sheet | Layer tone, no shadows at rest | Selected view is a Frost `#88c0d0` chip with Polar Night text in both modes. Frost focus. |
| `paper` (`Papír`) | Warm paper ground, a lighter sheet framed by a warm hairline; umber layers by lamplight in dark. Filename and dialog titles in the reading serif (`--font-title: var(--font-read)`). | 6 px controls, 8 px sheet | Lines only; warm-tinted dialog shadow | Ink chip on a paper track. Save fills with ink. Sienna caret, focus and unsaved chip (`#93361a` / `#e5a07a`). |
| `terminal` (`Terminál`) | Cool green-grey ground, one square sheet with a crisp line; green-black in dark. Filename, metadata, pane titles and status in the mono stack (`--font-title`, `--font-meta`); buttons and labels keep the UI sans for width and legibility. | 0 px everywhere | Lines; one offset dialog shadow; no glow | Outlined tab strip with dividers; the selected view is a tinted cell with a 2 px green underline. Save fills green. Dialog actions on a footer band. |

### Palettes (light / dark)

| Token | Minimal | Glass | Material | Fluent | Nord |
| --- | --- | --- | --- | --- | --- |
| `--ground` | `#ffffff` / `#000000` | `#e4e8ec` / `#0b0e12` | `#eef3ef` / `#171d1a` | `#f3f3f3` / `#202020` | `#e5e9f0` / `#272c36` |
| `--source` | `#ffffff` / `#000000` | `#fbfcfd` / `#101418` | `#f8fbf8` / `#0f1512` | `#ffffff` / `#272727` | `#eceff4` / `#2e3440` |
| `--text` | `#1a1a1a` / `#e8e8e8` | `#1b222a` / `#e1e6ec` | `#1b211e` / `#d9e0db` | `#1a1a1a` / `#f0f0f0` | `#2e3440` / `#d8dee9` |
| `--muted` | `#595959` / `#a6a6a6` | `#4e5966` / `#a3aebb` | `#404944` / `#bfc9c3` | `#5c5c5c` / `#c5c5c5` | `#4c566a` / `#aab4c4` |
| `--faint` | `#6b6b6b` / `#8f8f8f` | `#5b6673` / `#8d99a7` | `#56605a` / `#9aa49e` | `#6e6e6e` / `#9e9e9e` | `#5b6579` / `#9aa4b6` |
| `--accent` | `#000000` / `#ffffff` | `#0a5cc2` / `#6aacff` | `#2f6b57` / `#9dd3bb` | `#005fb8` / `#60cdff` | `#3e6a9b` / `#88c0d0` |
| `--danger` | `#b42318` / `#ff8a80` | `#b42318` / `#ff8a80` | `#ba1a1a` / `#ffb4ab` | `#c42b1c` / `#ff99a4` | `#a3434d` / `#f2b6bd` |

| Token | Paper | Terminal |
| --- | --- | --- |
| `--ground` | `#f3efe6` / `#191714` | `#eef1ed` / `#0b0e0c` |
| `--source` | `#fbf8f2` / `#211e1a` | `#fafbf9` / `#101411` |
| `--text` | `#2b251e` / `#e6dfd3` | `#18231b` / `#d0d9d2` |
| `--muted` | `#5e5547` / `#b4aa99` | `#46524a` / `#9eaaa1` |
| `--faint` | `#6c6253` / `#9d9382` | `#59655c` / `#828f85` |
| `--accent` | `#93361a` / `#e5a07a` | `#1b6935` / `#7fc493` |
| `--danger` | `#a1261b` / `#ff9a8a` | `#b3261e` / `#ff8f85` |
| Syntax heading / mark / link / code | `#8a3216` `#6c6253` `#245a73` `#6b4a12` / `#f0b48a` `#9d9382` `#9cc7d9` `#dcc27e` | `#1b6935` `#59655c` `#1f5b8f` `#7a4a00` / `#8fd4a3` `#828f85` `#8ab8e6` `#e0c27a` |

Nord muted and faint were lifted from the canonical `#4c566a` so they hold 4.5:1 on Polar Night (`#aab4c4` ≈ 6.0:1 and `#9aa4b6` ≈ 5.0:1 on `#2e3440`). The light accent `#3e6a9b` is a darkened Frost because `#5e81ac` is only about 3.5:1 on `#eceff4`.

Paper and Terminal were chosen so text, muted, faint (gutter numbers and Markdown marks), syntax and danger colours hold at least about 4.5:1 on `--source`, on `--sunken`, on `--raised` and on the source with `--active-line` painted over it. Hand estimates: the weakest are Paper-light faint on sunken ≈ 4.7:1, Paper-dark faint on raised ≈ 5.0:1, Terminal-light faint on sunken ≈ 4.9:1 and Terminal-dark faint on raised ≈ 5.2:1; accents are 6.5:1 or more. These are approximate hand calculations; root's contrast run is authoritative.

## Markdown preview presets

`html[data-preview-theme]` selects one of six presets, each with light and dark variants that follow `html[data-theme]`. All preset styling is in `src/preview.css`. Every token (`--pv-*` for layout and colour, `--tk-*` for code) is scoped to `#preview-pane`, so the preset fills the whole pane, including its sticky head, and never leaks into the chrome. Presets are inspired by, not copies of, their sources.

Each preset selector is paired with `.markdown-style-preview[data-preview-theme=X][data-theme=Y]`; the GitHub base block (`#preview-pane, .markdown-style-preview`) resets miniatures. Miniatures and the font sample have their own element rules (`.mini-doc`, `.preview-font-sample`). They never use `.preview`, so neither side styles the other.

| Preset | Default type | Character |
| --- | --- | --- |
| `github` (default) | System sans 16 px / 1.5, column 52em | Weight-600 headings at 2 / 1.5 / 1.25 / 1 / 0.875 / 0.85 em, hairline under h1 and h2, muted h6. Blue underlined links, tinted inline-code chips, borderless grey code at 85 %, fully ruled tables with alternate rows tinted, a 0.25em muted quote bar, a 0.25em rule. Dark is `#0d1117`. |
| `vscode` | Segoe WPC/UI first, 14 px / 22 px, column 60em | Same heading scale and rules; 1em code in a bordered 3 px block; open tables with a strong header rule and light row rules; a 5 px quote bar on a tinted ground. `#ffffff` / `#1f1f1f`. |
| `reading` (`Čtení`) | Reading serif 17 px / 1.65, column 38em | Weight-700 headings at 1.85 / 1.4 / 1.17 / 1 / 0.94 em with no rules, ink links, a 2 px quote rule, horizontal-only tables flush to the column, italic comments. `#fbfbfa` / `#161615`. |
| `nord` (`Nord`) | System sans 16 px / 1.7, column 44em | Snow Storm page `#eceff4` or Polar Night `#2e3440`. h1 tight with no rule, h2 over a soft rule, h3 in Frost. Frost links. Code blocks are always Polar Night `#292e39` with calm Frost-led syntax (keywords and operators `#81a1c1`, properties `#88c0d0`, types `#8fbcbb`, strings `#a3be8c`, numbers `#b48ead`, comments `#9099ad` italic), each at least about 4.8:1. Quotes have a Frost bar on a layer tint with rounded trailing corners. Tables have a layer-tinted header band and soft row rules. |

| `paper` (`Papír`) | Old-style book serif (`Iowan Old Style`, `Palatino Linotype`, Palatino, Book Antiqua, …) 18 px / 1.6, column 34em, wide page margins, old-style numerals | A printed page, not a screen column. Light 400-weight h1 at 2.1em, 600 h2, italic h3 and h5, small-caps letter-spaced h4 and h6. Oxblood links on warm paper `#f7f3ea` / umber `#1c1915`. Booktabs tables: 1.5 px ink rules above the head and below the body, a thin head rule, no grid, small-caps head cells, tabular figures. Quotes are italic and indented with no bar. The rule is a short centred 6em line. Code is a quiet bordered block with italic comments. |
| `terminal` (`Terminál`) | Mono (`Cascadia Mono` first) 14 px / 1.6 for everything, column 46em (about 76 characters) | One face, one size. Headings differ by weight 700, colour (h3 green, h6 muted) and muted `#`…`######` markers with empty alt text, so they are not announced. h1 has a solid underline and h2 a dashed one. Vertical space moves in half-line steps: one empty line between blocks. Lists use `-`, `*`, `+` markers with no extra gap. Square code and task boxes, tables ruled as a grid with a tinted head, a 2 px quote bar, and blocked-image chips in mono. `#f7f9f6` / `#0f1310`, restrained green `#1b6935` / `#8fd4a3`, no glow. |

Paper and Terminal colour pairs follow the same rule as the app palettes: body, muted, link and every syntax token were chosen to hold about 4.5:1 or more on their own page, code and table-head grounds (hand estimates; root's run is authoritative).

New optional tokens, read with a `var()` fallback equal to the previous fixed value so GitHub, VS Code, Čtení and Nord render exactly as before: `--pv-h1-weight`, `--pv-h3-weight`, `--pv-h5-weight`, `--pv-h3-style`, `--pv-h5-style`, `--pv-h4-caps`, `--pv-h6-caps`, `--pv-h4-track`, `--pv-h6-track`, `--pv-h1-marker` … `--pv-h6-marker`, `--pv-quote-style`, `--pv-hr-width`, `--pv-table-top`, `--pv-th-caps`, `--pv-th-track`, `--pv-ul-1/2/3`, `--pv-check-radius`, `--pv-chip-font`, `--pv-chip-radius`, `--pv-numeric`. Alerts reset `font-style` so an italic quote style never reaches them.

Shared rules: one set of `--pv-*` tokens drives headings (`--pv-h1-rule`, `--pv-h2-rule`, `--pv-h-mt`, `--pv-h-mt-minor`, `--pv-h-stack`), code (`--pv-code-border`, `--pv-pre-border`), tables (`--pv-cell-pad`, `--pv-cell-edge`, `--pv-cell-border`, `--pv-row-rule`, `--pv-head-rule`, `--pv-table-foot`, `--pv-th-bg`, `--pv-row-alt`), rules (`--pv-hr-size`, `--pv-hr-margin`, `--pv-hr-color`) and task boxes (`--pv-check-line`, `--pv-check-bg`, `--pv-check-ink`). Presets override values, not selectors.

Nested bullets go disc → circle → square and numbers decimal → roman → alpha. Task checkboxes replace the bullet in both tight lists and loose-list paragraphs. They stay disabled and non-interactive, but they are drawn with `appearance: none`: a muted 1.5 px outline and, when checked, a filled box in the link colour with a CSS border check mark. Forced colors use the native checkbox. No inline image URL is needed, keeping the extension's existing image policy intact. `pre` and tables scroll inside themselves and get a focus ring in the link colour. Long words, URLs and inline code wrap. Blocked images show a dashed text chip. No preview element animates.

## Typography

| Role | Stack | Use |
| --- | --- | --- |
| UI | `system-ui, -apple-system, "Segoe UI", Roboto, …` (Fluent puts `"Segoe UI Variable Text"` first) | Chrome, dialogs |
| Title / meta | `--font-title`, `--font-meta`: UI by default; Paper titles use Reading; Terminal titles and metadata use Mono | Filename, dialog titles / doc metadata, pane titles, status bar |
| Source | `var(--editor-font, var(--font-mono))` | Editor and gutter at `--editor-size` on `--code-lh` |
| Reading | `Charter, "Bitstream Charter", "Iowan Old Style", "Sitka Text", …, Georgia, serif` | `reading` preset, Paper titles |
| Book | `"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", …, Georgia, serif` | `paper` preset |
| Terminal | `"Cascadia Mono", "Cascadia Code", ui-monospace, …, monospace` | `terminal` preset |

UI scale 12 / 13 / 14 / 16 / 18 px. Filename 16/600, metadata 12/400, buttons 14/500, pane heads 12/600 (+0.01em), section titles 14/600, card labels 13/500, card hints 12/400, dialog titles 18/600. All are installed fonts; no font requests.

User font choices are read, never redefined: `.preview` uses `font-family: var(--preview-font, var(--pv-font))` and `font-size: var(--preview-size, var(--pv-size))`; headings inherit the family, code stays monospace, the column is measured in multiples of the chosen size. No font requests are made.

## Settings

`#preferences-dialog` (`Vzhled`) is a native modal: `inset: 0; margin: auto` centres it at every width and height (no edge anchor). Width is `min(960px, 100vw − 32px)` (`100vw − 24px` at ≤ 560 px), height at most the viewport minus the same margin. The head (title + close) stays fixed; only the body scrolls. Short windows (≤ 520 px tall) tighten the head to 48 px.

Layout is driven by container queries, not the viewport:

- `.prefs-body` is the `prefs` container. From 820 px of body width, `.prefs-layout` has two columns: **Aplikace** spans both columns, with `Jazyk` and `Režim` side by side, then `Styl rozhraní`. **Náhled Markdownu** and **Editor** sit side by side, and the storage note spans the bottom. Below 820 px, everything is one column.
- Each `.pref-group` is a `group` container. Single rows (label + hint left, select 160–200 px right) stack when the group is ≤ 420 px; font/size pairs stack at ≤ 360 px, so the long monospace label gets the full row (≈ 300 px at a 390 px window).

Sections:

1. **Aplikace:** `Jazyk` (Podle zařízení, English, Čeština, Deutsch); `Režim`; `Styl rozhraní` (Minimal, Glass, Material You, Fluent, Nord, Papír, Terminál) with the note for the current style, then seven theme cards.
2. **Náhled Markdownu:** `Formát Markdownu` (GitHub, Strict Markdown) with its hint; `Styl náhledu` (GitHub, VS Code, Čtení, Nord, Papír, Terminál) with its hint, then six preset cards; `Písmo` + `Velikost`, then the live preview sample.
3. **Editor:** `Typ editoru` (Kód, Psaní, Prostý text), then three profile cards; `Písmo` (Systémové, Cascadia, Consolas, Bezpatkové, Patkové) + `Velikost`, then the live editor sample.

### Cards

`<button type="button" class="setting-card" data-setting="<select id>" data-value="<option value>" aria-pressed="false">`. Root dispatches the select's `change` and mirrors `aria-pressed`; CSS only styles it. Native selects stay visible as the direct keyboard and assistive-technology control; cards are a visual shortcut after their select in tab order. Each gallery is a `role="group"` named by the existing translated label (`Styl rozhraní`, `Styl náhledu`, `Typ editoru`). The visible card label is the accessible name, plus the hint on editor cards. The miniature is `aria-hidden` and uses only language-neutral glyphs (`Aa`, `#`, `-`, digits).

- Rest: 1 px `--line-strong` edge on `--field`. Hover adds the `--hover` layer and a `--control-line` edge. Press scales to 0.985 (none under reduced motion). Focus uses the global 2 px ring. Pressed shows a 2 px `--accent` edge (border + inset) and a drawn check mark after the label, so the state never depends on colour alone. Forced colours add a `Highlight` outline.
- Grids: theme 3 → 4 (group ≥ 421 px) → 7 (≥ 760 px) columns; Markdown 2 → 3 → 6; editor 1 → 3. Narrow editor cards are rows (96 px picture, label and hint beside it).
- **Theme card** (`.theme-preview[data-surface]`, 70 px): ground, chrome bar with the bracket mark, `Aa` in `--font-title`, a three-cell segmented control in `--seg-*`, a `--primary` Save chip, the workspace in `--ws-*` with two panes in `--sheet-*` divided by `--split-line`, a source pane with a heading in `--syntax-heading`, active line and caret, a document pane in `--paper`, and the status strip with the accent dot. Radii and frame gaps are halved to scale.
- **Markdown card** (`.mini-doc.markdown-style-preview[data-preview-theme]`, 86 px): `Aa` heading in the preset face, h1 weight, rule and marker; text, link and inline-code chip; quote bar; a code block with keyword, string and comment colours; a two-column table with the preset's head band and rules.
- **Editor card** (`.editor-preview[data-type]`, 64 px, drawn in the current app style and editor font): Code has the gutter with an active number, active line and syntax colours; Writing has a centred narrow column with syntax colours; Plain text has a full-width column in text colour only.

### Live font samples

`.editor-font-sample` reads `--editor-font`, `--editor-size` and `--code-lh` on `--source`, with `#` / `-` marks, heading and code in syntax colours. `0O 1lI` shows letterform clarity. `.preview-font-sample` is a `.markdown-style-preview` with `data-follow-preview`. Root sets its `data-preview-theme` to the selected preset and its `data-theme` to the effective theme. It reads `--preview-font` and `--preview-size`, so the heading inherits the chosen family while the code chip stays in the preset's monospace. Neither sample redefines the four user override variables. Both are `aria-hidden`.

### Editor profiles

`html[data-editor-type]` shapes the column only; root swaps CodeMirror extensions. **Code** keeps the gutter layout and `--source-max`. **Prose** centres a `--prose-max` (42rem) column with 32 px line padding and 28 px top air. **Plain** removes the max width, using 24 px padding. Phones use 16 px. Pane heads align to each column. Font family and size are never changed by a profile.

Language defaults to browser preferences, with explicit English, Czech and German choices. Profile and language changes preserve the editor state and chosen typography.

## Behaviour notes

- **Theme toggle.** `#theme-toggle` shows the theme in effect (sun in light, moon in dark), matching `aria-pressed`. CSS sets `animation: none` and `mix-blend-mode: normal` on the root snapshots, `pointer-events: none` on `::view-transition`, and turns transitions off under `html.theme-switch`.
- **Dirty state.** A quiet chip with constant padding (`--r-control` radius, so it is square in Terminal and a pill in Material): a hollow dot while clean; while dirty, a filled `--accent` dot, ink text and a 13 % accent tint. `.toolbar:has(#dirty-state[data-dirty="true"])` fills Save with `--primary`. Disabled buttons use `--faint`.
- **Panes.** Panes are flex children; `[hidden]` hides with `display: none !important`. Pane heads show only in split mode (they stay in the accessibility tree otherwise). The focused pane's head rule takes the accent (`--accent` for source, `--pv-focus` for preview), its title turns ink and its icon takes the accent. CodeMirror is styled through `#editor .cm-*`. Source-only mode centres gutter and text.
- **Status bar.** `--font-meta`, tabular figures. Word count, line count, cursor and `Jen lokálně` form one group separated by `--line-strong` hairlines (12 px, 10 px on phones). The status message takes the remaining width and ellipsizes; errors wrap in `--danger`.
- **Dialogs.** Native `<dialog>`, entry through `@starting-style` (opacity + 6 px rise, 200 ms). Save As keeps its field, hint, inline error and filled primary action; discard and overwrite confirm in `--danger`.
- **Responsive.** Keyboard hints from 1360 px. Wordmark and view icons from 1181 px. Two toolbar rows at ≤ 960 px, one pane and no `Jen lokálně` at ≤ 700 px, three rows and 44 px targets at ≤ 560 px, file-action icons hidden at ≤ 480 px.
- **Motion.** Only press feedback, dialog entry and the theme reveal. Reduced motion removes durations and press scaling.

## References

* [Fluent 2 principles](https://fluent2.microsoft.design/design-principles) and [elevation](https://fluent2.microsoft.design/elevation/): familiar controls, clear hierarchy and restrained layers.
* [Radix Themes](https://www.radix-ui.com/themes/docs/theme/overview): consistent component variants and shared tokens. No Radix runtime is used.
* [Nord colors and palettes](https://www.nordtheme.com/docs/colors-and-palettes/): the arctic palette, adapted where contrast needs it. Its MIT notice is included in `public/THIRD_PARTY_NOTICES.txt`.
