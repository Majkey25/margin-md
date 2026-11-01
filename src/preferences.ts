type Theme = 'system' | 'light' | 'dark';
type Surface = 'minimal' | 'glass' | 'material' | 'fluent' | 'nord';
export type EditorType = 'code' | 'prose' | 'plain';
export type MarkdownFormat = 'github' | 'strict';

export function setupPreferences(
  onStorageError: () => void,
  onEditorTypographyChange: () => void,
  onEditorTypeChange: (value: EditorType) => void,
  onMarkdownFormatChange: (value: MarkdownFormat) => void,
): HTMLDialogElement {
  const root = document.documentElement;
  const dialog = document.getElementById('preferences-dialog') as HTMLDialogElement;
  const themeSetting = document.getElementById('theme-setting') as HTMLSelectElement;
  const surfaceSetting = document.getElementById('surface-setting') as HTMLSelectElement;
  const themeButton = document.getElementById('theme-toggle') as HTMLButtonElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let appearance: Theme = 'system';
  let surface: Surface = 'minimal';
  let transition: ViewTransition | undefined;
  let revision = 0;

  try {
    const savedTheme = localStorage.getItem('margin.theme');
    const savedSurface = localStorage.getItem('margin.surface');
    if (savedTheme === 'light' || savedTheme === 'dark') appearance = savedTheme;
    if (savedSurface === 'glass' || savedSurface === 'material' || savedSurface === 'fluent' || savedSurface === 'nord') surface = savedSurface;
  } catch { /* Default settings remain usable without storage. */ }

  const effectiveTheme = (): 'light' | 'dark' => appearance === 'system'
    ? (systemTheme.matches ? 'dark' : 'light') : appearance;
  const applyTheme = (): void => {
    const theme = effectiveTheme();
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    themeSetting.value = appearance;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  const save = (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch { onStorageError(); }
  };
  const setting = <T extends string>(
    id: string, key: string, values: readonly T[], fallback: T, apply: (value: T) => void, onChange?: (value: T) => void,
  ): void => {
    const select = document.getElementById(id) as HTMLSelectElement;
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* Use the default when storage is unavailable. */ }
    let selected = values.find((value) => value === stored) ?? fallback;
    select.value = selected;
    apply(selected);
    select.addEventListener('change', () => {
      const next = values.find((value) => value === select.value);
      if (!next) { select.value = selected; return; }
      selected = next;
      apply(selected);
      save(key, selected);
      onChange?.(selected);
    });
  };
  const stopTransition = (): void => {
    revision++;
    transition?.skipTransition();
    transition = undefined;
    root.classList.remove('theme-switch');
  };
  applyTheme();
  root.dataset.surface = surface;
  surfaceSetting.value = surface;

  const previewFonts = {
    sans: '"Segoe UI", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'Consolas, "Courier New", monospace',
  };
  const editorFonts = {
    system: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace',
    cascadia: '"Cascadia Code", "Cascadia Mono", Consolas, monospace',
    consolas: 'Consolas, "Courier New", monospace',
    sans: '"Segoe UI", Arial, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
  };
  setting('editor-type-setting', 'margin.editorType', ['code', 'prose', 'plain'] as const, 'code',
    (value) => { root.dataset.editorType = value; }, onEditorTypeChange);
  setting('markdown-format-setting', 'margin.markdownFormat', ['github', 'strict'] as const, 'github',
    (value) => { root.dataset.markdownFormat = value; }, onMarkdownFormatChange);
  setting('preview-theme-setting', 'margin.previewTheme', ['github', 'vscode', 'reading', 'nord'] as const, 'github',
    (value) => { root.dataset.previewTheme = value; });
  setting('preview-font-setting', 'margin.previewFont', ['default', 'sans', 'serif', 'mono'] as const, 'default',
    (value) => {
      if (value === 'default') root.style.removeProperty('--preview-font');
      else root.style.setProperty('--preview-font', previewFonts[value]);
    });
  setting('preview-size-setting', 'margin.previewSize', ['default', '14', '16', '18', '20', '22', '24'] as const, 'default',
    (value) => {
      if (value === 'default') root.style.removeProperty('--preview-size');
      else root.style.setProperty('--preview-size', `${value}px`);
    });
  setting('editor-font-setting', 'margin.editorFont', ['system', 'cascadia', 'consolas', 'sans', 'serif'] as const, 'system',
    (value) => root.style.setProperty('--editor-font', editorFonts[value]), onEditorTypographyChange);
  setting('editor-size-setting', 'margin.editorSize', ['12', '13', '14', '15', '16', '18', '20'] as const, '14',
    (value) => {
      root.style.setProperty('--editor-size', `${value}px`);
      root.style.setProperty('--code-lh', `${Math.round(Number(value) * 1.65)}px`);
    }, onEditorTypographyChange);

  document.getElementById('preferences-open')!.addEventListener('click', () => dialog.showModal());
  document.getElementById('preferences-close')!.addEventListener('click', () => dialog.close());
  themeSetting.addEventListener('change', () => {
    const value = themeSetting.value;
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    stopTransition();
    appearance = value;
    applyTheme();
    save('margin.theme', value);
  });
  surfaceSetting.addEventListener('change', () => {
    const value = surfaceSetting.value;
    if (value !== 'minimal' && value !== 'glass' && value !== 'material' && value !== 'fluent' && value !== 'nord') return;
    surface = value;
    root.dataset.surface = surface;
    save('margin.surface', surface);
  });
  systemTheme.addEventListener('change', () => { if (appearance === 'system') applyTheme(); });
  themeButton.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    stopTransition();
    appearance = next;
    save('margin.theme', next);
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme();
      return;
    }
    const box = themeButton.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const current = revision;
    root.classList.add('theme-switch');
    try {
      const view = document.startViewTransition(() => { if (current === revision) applyTheme(); });
      transition = view;
      const finished = view.finished.catch(() => {});
      void (async () => {
        try {
          await view.ready;
          if (current === revision) root.animate(
            { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 560, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
          );
        } catch {
          if (current === revision) applyTheme();
        } finally {
          await finished;
          if (current === revision) {
            applyTheme();
            transition = undefined;
            root.classList.remove('theme-switch');
          }
        }
      })();
    } catch {
      root.classList.remove('theme-switch');
      applyTheme();
    }
  });
  return dialog;
}
