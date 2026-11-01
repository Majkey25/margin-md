# Margin design (1.3.0)

A precise writing instrument. The filename is the title, the document sits on its own sheet inside a quiet window frame, and the chrome only holds what you act on.

## Design plan

- **Question the window answers:** "What am I editing, is it saved, and what does it look like?" The filename (16 px semibold) and the save state lead; the sheet that holds the text is the largest thing on screen.
- **One frame grammar for every style:** chrome (toolbar + footer) sits on the ground; the working panes sit on a sheet inset 8 px from the window edges (6 px on phones). Styles change the sheet's surface, shape and depth, never the layout.
- **Icons where they speed scanning:** file commands, view modes, pane heads and the local-only note carry one authored 20-unit outline set (1.5 stroke, round joins). Labels always stay visible on desktop.
- **Colour budget:** accent only on the current view, focus, the caret, the unsaved dot and Save while there are unsaved changes.
- **Motion:** press 150 ms, dialog entry 200 ms, the circular theme reveal. Nothing else moves. Reduced motion removes all of it.

Task mode: Operate for the editor and settings (familiar controls, dense but calm), Read for the rendered Markdown (measure, rhythm, complete element set).

## Wireframe

Desktop, 1440 px, split mode (one toolbar row from 961 px):

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ⌜⌟ Margin │ Vítejte.md                 [▢+ Nový][▭ Otevřít] │ [💾 Uložit ⌨][Uložit jako ⌨]  │
│           │ Ukázkový dokument ○ Beze změn      (‹› Text | ▥ Vedle sebe | ◉ Náhled)  ☀ ⚙ ⤢   │
│ ┌───────────────────────────────────────────┬──────────────────────────────────────────┐ │
│ │ ‹› Markdown                               │ ◉ Náhled                                 │ │ pane heads 36 px, split only
│ ├───────────────────────────────────────────┼──────────────────────────────────────────┤ │
│ │  1  # Prostor pro vaše myšlenky           │   Prostor pro vaše myšlenky              │ │
│ │  …  gutter 56 px, text max 52rem          │   preset column, preset background       │ │
│ └───────────────────────────────────────────┴──────────────────────────────────────────┘ │ sheet inset 8 px
│ Otevřete soubor nebo začněte psát.                 101 slov  33 ř.  Ř 1, sl 1 │ ▭ Jen lokálně │
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

One mark: a geometric M with a folded center and rounded outer shoulders on a transparent background (`public/icon.svg`, PNGs keep alpha). A white keyline keeps the browser icon legible on dark toolbars. Toolbar and drop marks share the geometry and use `--mark-ink`.

## Token grammar

`styles.css` defines every token on `:root`, then each `:root[data-surface=…]` and `…[data-theme="dark"]` block overrides values. Components read shared tokens. Conditional selectors show the current style description and provide the Glass fallbacks.

| Group | Tokens |
| --- | --- |
| Type | `--font-ui`, `--font-mono`, `--font-read`, `--fs-xs` 12, `--fs-sm` 13, `--fs-md` 14, `--fs-lg` 16, `--fs-title` 18 |
| Size | `--h-control` 40 (44 on phones), `--gutter-w` 56, `--code-lh`, `--source-max` 52rem, `--pane-head-h` 36 |
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

`html[data-surface]` selects one of five styles, each with its own light and dark palette. They share layout and controls and differ in surface, shape, depth and interaction language. No style ever reaches rendered Markdown.

| Style | Surface | Shape | Depth | Interaction |
| --- | --- | --- | --- | --- |
| `minimal` (default) | White on white / true black. One sheet framed by a hairline. | 6 px controls, 10 px sheet | Lines only | Ink. Selected view is a white chip on a grey track. Save fills black (white in dark) only while there are unsaved changes. |
| `glass` | Cool ground, translucent toolbar, footer and dialogs (`blur(16px) saturate(1.5)`), two opaque sheets with an 8 px gutter. | 8 px controls, 12 px sheets, 16 px dialogs | Stroke on sheets; raised white chip | Blue accent. Solid colours when `backdrop-filter` is unsupported or transparency is reduced. |
| `material` | Tonal sage palette from one fixed seed (no wallpaper). Two tonal containers, no strokes. | Pills, 20 px containers, 28 px dialogs | Tone steps only | Outlined segmented control with dividers and a tonal selection; state layers on every control. |
| `fluent` | Windows-inspired Mica-like neutral ground, one content layer with an 8 px radius and a stroke. Segoe UI Variable first. | 4 px controls, 8 px layer and dialog | Strokes, control bottom edge, dialog flyout shadow | Blue accent. Selected view shows a 3 px accent pill under the label. Black/white focus ring. Dialog actions sit on a footer band. |
| `nord` | Arctic layers: Snow Storm in light, Polar Night in dark (darker frame, nord0 sheet). One sheet, panes divided by a layer line. | 4 px controls, 6 px sheet | Layer tone, no shadows at rest | Selected view is a Frost `#88c0d0` chip with Polar Night text in both modes. Frost focus. |

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

Nord muted and faint were lifted from the canonical `#4c566a` so they hold 4.5:1 on Polar Night (`#aab4c4` ≈ 6.0:1 and `#9aa4b6` ≈ 5.0:1 on `#2e3440`). The light accent `#3e6a9b` is a darkened Frost because `#5e81ac` is only about 3.5:1 on `#eceff4`. These are approximate hand calculations; root's contrast run is authoritative.

## Markdown preview presets

`html[data-preview-theme]` selects one of four presets, each with light and dark variants that follow `html[data-theme]`. All preset styling is in `src/preview.css`. Every token (`--pv-*` for layout and colour, `--tk-*` for code) is scoped to `#preview-pane`, so the preset fills the whole pane, including its sticky head, and never leaks into the chrome. Presets are inspired by, not copies of, their sources.

| Preset | Default type | Character |
| --- | --- | --- |
| `github` (default) | System sans 16 px / 1.5, column 52em | Weight-600 headings at 2 / 1.5 / 1.25 / 1 / 0.875 / 0.85 em, hairline under h1 and h2, muted h6. Blue underlined links, tinted inline-code chips, borderless grey code at 85 %, fully ruled tables with alternate rows tinted, a 0.25em muted quote bar, a 0.25em rule. Dark is `#0d1117`. |
| `vscode` | Segoe WPC/UI first, 14 px / 22 px, column 60em | Same heading scale and rules; 1em code in a bordered 3 px block; open tables with a strong header rule and light row rules; a 5 px quote bar on a tinted ground. `#ffffff` / `#1f1f1f`. |
| `reading` (`Čtení`) | Reading serif 17 px / 1.65, column 38em | Weight-700 headings at 1.85 / 1.4 / 1.17 / 1 / 0.94 em with no rules, ink links, a 2 px quote rule, horizontal-only tables flush to the column, italic comments. `#fbfbfa` / `#161615`. |
| `nord` (`Nord`) | System sans 16 px / 1.7, column 44em | Snow Storm page `#eceff4` or Polar Night `#2e3440`. h1 tight with no rule, h2 over a soft rule, h3 in Frost. Frost links. Code blocks are always Polar Night `#292e39` with calm Frost-led syntax (keywords and operators `#81a1c1`, properties `#88c0d0`, types `#8fbcbb`, strings `#a3be8c`, numbers `#b48ead`, comments `#9099ad` italic), each at least about 4.8:1. Quotes have a Frost bar on a layer tint with rounded trailing corners. Tables have a layer-tinted header band and soft row rules. |

Shared rules: one set of `--pv-*` tokens drives headings (`--pv-h1-rule`, `--pv-h2-rule`, `--pv-h-mt`, `--pv-h-mt-minor`, `--pv-h-stack`), code (`--pv-code-border`, `--pv-pre-border`), tables (`--pv-cell-pad`, `--pv-cell-edge`, `--pv-cell-border`, `--pv-row-rule`, `--pv-head-rule`, `--pv-table-foot`, `--pv-th-bg`, `--pv-row-alt`), rules (`--pv-hr-size`, `--pv-hr-margin`, `--pv-hr-color`) and task boxes (`--pv-check-line`, `--pv-check-bg`, `--pv-check-ink`). Presets override values, not selectors.

Nested bullets go disc → circle → square and numbers decimal → roman → alpha. Task checkboxes replace the bullet in both tight lists and loose-list paragraphs. They stay disabled and non-interactive, but they are drawn with `appearance: none`: a muted 1.5 px outline and, when checked, a filled box in the link colour with a CSS border check mark. Forced colors use the native checkbox. No inline image URL is needed, keeping the extension's existing image policy intact. `pre` and tables scroll inside themselves and get a focus ring in the link colour. Long words, URLs and inline code wrap. Blocked images show a dashed text chip. No preview element animates.

## Typography

| Role | Stack | Use |
| --- | --- | --- |
| UI | `system-ui, -apple-system, "Segoe UI", Roboto, …` (Fluent puts `"Segoe UI Variable Text"` first) | Chrome, dialogs |
| Source | `var(--editor-font, var(--font-mono))` | Editor and gutter at `--editor-size` on `--code-lh` |
| Reading | `Charter, "Bitstream Charter", "Iowan Old Style", "Sitka Text", …, Georgia, serif` | `reading` preset |

UI scale 12 / 13 / 14 / 16 / 18 px. Filename 16/600, metadata 12/400, buttons 14/500, pane heads 12/600, section titles 14/600, dialog titles 18/600.

User font choices are read, never redefined: `.preview` uses `font-family: var(--preview-font, var(--pv-font))` and `font-size: var(--preview-size, var(--pv-size))`; headings inherit the family, code stays monospace, the column is measured in multiples of the chosen size. No font requests are made.

## Settings

`#preferences-dialog` (`Vzhled`) has a fixed head with the close button and a scrolling body. Each section is a sentence-case title over a grouped container whose rows are split by hairlines:

1. **Aplikace:** `Jazyk`; `Režim` with its hint; `Styl rozhraní` (Minimal, Glass, Material You, Fluent, Nord) with the note for the current style.
2. **Náhled Markdownu:** `Styl náhledu` (GitHub, VS Code, Čtení, Nord) with its hint; then one paired row of `Písmo` and `Velikost`.
3. **Editor:** `Typ editoru`; then one paired row of `Písmo` and `Velikost`.

Single rows put the label and hint left and the select right (select 160–200 px). Paired rows put two labelled selects side by side; they stack below 360 px, and single rows stack below 480 px. Visually hidden suffixes keep each accessible name unique. Keyboard order is close, then every select top to bottom. The dialog is 520 px wide, centered at every viewport size, and never taller than the viewport.

Language defaults to browser preferences, with explicit English, Czech and German choices. Code keeps line numbers, the active line and syntax colors; Writing keeps syntax colors without line numbers or the active line; Plain text removes all three. Profile and language changes preserve the editor state and chosen typography.

## Behaviour notes

- **Theme toggle.** `#theme-toggle` shows the theme in effect (sun in light, moon in dark), matching `aria-pressed`. CSS sets `animation: none` and `mix-blend-mode: normal` on the root snapshots, `pointer-events: none` on `::view-transition`, and turns transitions off under `html.theme-switch`.
- **Dirty state.** The dot is hollow while clean and filled in `--accent` with ink text while dirty. `.toolbar:has(#dirty-state[data-dirty="true"])` fills Save with `--primary`. Disabled buttons use `--faint`.
- **Panes.** Panes are flex children; `[hidden]` hides with `display: none !important`. Pane heads show only in split mode (they stay in the accessibility tree otherwise); the focused pane's head turns ink and its icon takes the accent. CodeMirror is styled through `#editor .cm-*`. Source-only mode centres gutter and text.
- **Dialogs.** Native `<dialog>`, entry through `@starting-style` (opacity + 6 px rise, 200 ms). Save As keeps its field, hint, inline error and filled primary action; discard and overwrite confirm in `--danger`.
- **Responsive.** Keyboard hints from 1360 px. Wordmark and view icons from 1181 px. Two toolbar rows at ≤ 960 px, one pane and no `Jen lokálně` at ≤ 700 px, three rows and 44 px targets at ≤ 560 px, file-action icons hidden at ≤ 480 px.
- **Motion.** Only press feedback, dialog entry and the theme reveal. Reduced motion removes durations and press scaling.

## References

* [Fluent 2 principles](https://fluent2.microsoft.design/design-principles) and [elevation](https://fluent2.microsoft.design/elevation/): familiar controls, clear hierarchy and restrained layers.
* [Radix Themes](https://www.radix-ui.com/themes/docs/theme/overview): consistent component variants and shared tokens. No Radix runtime is used.
* [Nord colors and palettes](https://www.nordtheme.com/docs/colors-and-palettes/): the arctic palette, adapted where contrast needs it. Its MIT notice is included in `public/THIRD_PARTY_NOTICES.txt`.
