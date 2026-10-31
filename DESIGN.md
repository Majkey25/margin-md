# Margin design

## Wireframe (1440px, split mode)

```
┌──────────────────────────────────────────────────────────────────────┐
│ toolbar                                                              │
│ ⌜M⌝  doc-name · doc-location   [Nový][Otevřít][Uložit][Uložit jako]│
│      dirty-state                [Text][Vedle][Náhled] [◐][⛶]       │
├────────────────────────────┬─────────────────────────────────────────┤
│ #source-pane               │ #preview-pane                          │
│                            │                                        │
│   CodeMirror #editor       │   article #preview                     │
│   (line numbers, gutters,  │   (rendered markdown,                  │
│    full-height scroll)     │    independent scroll)                 │
│                            │                                        │
│                            │                                        │
├────────────────────────────┴─────────────────────────────────────────┤
│ footer                                                               │
│ status-message          word-count  line-count  cursor   Jen lokálně │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile (390px)

One pane visible at a time. Toolbar wraps: file controls on one line,
view mode + utilities on a second. Footer wraps naturally. Touch targets
≥ 40px tall.

## Tokens

| Name          | Light       | Dark        | Role                            |
| :------------ | :---------- | :---------- | :------------------------------ |
| `--bg`        | `#ffffff`   | `#1a1a1a`  | Page and editor background       |
| `--surface`   | `#f5f5f4`   | `#252525`  | Toolbar, footer, raised chrome   |
| `--border`    | `#e0ddd8`   | `#333333`  | Separator lines, input borders   |
| `--text`      | `#1c1917`   | `#e7e5e0`  | Primary body text                |
| `--muted`     | `#68615d`   | `#a8a29e`  | Secondary text, placeholders     |
| `--accent`    | `#256478`   | `#5ba3ba`  | Links, heading syntax, focus     |

Text contrast is verified in the rendered interface with axe.

## Typography roles

| Role     | Family                              | Use                        |
| :------- | :---------------------------------- | :------------------------- |
| UI       | system-ui, sans-serif               | Toolbar, footer, controls  |
| Source   | ui-monospace, "Cascadia Mono", mono | CodeMirror editor pane     |
| Reading  | Charter, "Iowan Old Style", Georgia, serif | Preview rendered markdown |

System font stacks: no external requests, no downloads. The serif choice
gives the preview a distinct reading texture without conflicting with
the monospace source or the neutral UI sans.

## Key decisions

- **Flat chrome.** Toolbar and footer use `--surface` as a single step from
  `--bg`. No shadows on resting surfaces; one 1px `--border` separator only.
- **Content-first split.** Source and preview divide the available height
  below the toolbar, each scrolling independently. No sidebar, no tabs,
  no recents panel.
- **Compact toolbar.** File actions left, view mode centre-right, theme and
  fullscreen at the far right. All buttons have visible text labels (no
  icon-only controls except theme toggle and fullscreen, which have
  aria-label). Optional keyboard hint spans at small size.
- **CSS-only theme.** `[data-theme="dark"]` on `<html>` flips all six tokens.
  Transition on `background-color` and `color` only, 150ms, with
  `prefers-reduced-motion: reduce` disabling it.
- **Responsive at 700px.** Below this breakpoint the workspace shows one pane.
  Text and preview controls remain visible. The split control is hidden.
  Toolbar wraps to keep every action available.
- **Native dialog for discard.** `#discard-dialog` uses `<dialog>` with
  `showModal()`. Focus lands on the cancel button (non-destructive default).
- **Drop overlay.** `#drop-overlay` is `hidden` by default, shown by main
  during drag-enter, full-viewport with a clear border and label.
- **No autosave language.** Footer reads "Jen lokálně" (local only), never
  implying automatic persistence. Save button says "Uložit", not "Sync".
- **Signature mark.** A small `⌜M⌝` monogram in the toolbar, drawn from the
  idea of a margin annotation bracket. CSS-only, no image.
