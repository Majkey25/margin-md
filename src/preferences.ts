type Theme = 'system' | 'light' | 'dark';
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
  const themeButton = document.getElementById('theme-toggle') as HTMLButtonElement;
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let appearance: Theme = 'system';
  let transition: ViewTransition | undefined;
  let revision = 0;

  try {
    const savedTheme = localStorage.getItem('margin.theme');
    if (savedTheme === 'light' || savedTheme === 'dark') appearance = savedTheme;
  } catch { /* Default settings remain usable without storage. */ }

  const effectiveTheme = (): 'light' | 'dark' => appearance === 'system'
    ? (systemTheme.matches ? 'dark' : 'light') : appearance;
  const syncPreviews = (): void => {
    for (const preview of dialog.querySelectorAll<HTMLElement>('.theme-preview, .markdown-style-preview')) {
      preview.dataset.theme = effectiveTheme();
      if (preview.hasAttribute('data-follow-preview')) preview.dataset.previewTheme = root.dataset.previewTheme ?? 'github';
    }
  };
  const applyTheme = (): void => {
    const theme = effectiveTheme();
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    themeSetting.value = appearance;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    syncPreviews();
  };
  const save = (key: string, value: string): void => {
    try { localStorage.setItem(key, value); } catch { onStorageError(); }
  };
  const setting = <T extends string>(
    id: string, key: string, values: readonly T[], fallback: T, apply: (value: T) => void, onChange?: (value: T) => void,
  ): void => {
    const select = document.getElementById(id) as HTMLSelectElement;
    const cards = dialog.querySelectorAll<HTMLButtonElement>(`button.setting-card[data-setting="${id}"]`);
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { /* Use the default when storage is unavailable. */ }
    let selected = values.find((value) => value === stored) ?? fallback;
    select.value = selected;
    const applySelected = (): void => {
      apply(selected);
      for (const card of cards) card.setAttribute('aria-pressed', String(card.dataset.value === selected));
    };
    applySelected();
    select.addEventListener('change', () => {
      const next = values.find((value) => value === select.value);
      if (!next) { select.value = selected; return; }
      selected = next;
      applySelected();
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
  setting('surface-setting', 'margin.surface', ['minimal', 'glass', 'material', 'fluent', 'nord', 'paper', 'terminal'] as const, 'minimal',
    (value) => { root.dataset.surface = value; });

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
  setting('preview-theme-setting', 'margin.previewTheme', ['github', 'vscode', 'reading', 'nord', 'paper', 'terminal'] as const, 'github',
    (value) => { root.dataset.previewTheme = value; syncPreviews(); });
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
  dialog.addEventListener('click', (event) => {
    const card = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button.setting-card') : null;
    const id = card?.dataset.setting;
    if (!card || !id || !['surface-setting', 'preview-theme-setting', 'editor-type-setting'].includes(id)) return;
    const select = document.getElementById(id) as HTMLSelectElement;
    const value = card.dataset.value;
    if (!value || !Array.from(select.options).some((option) => option.value === value && !option.disabled)) return;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
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
