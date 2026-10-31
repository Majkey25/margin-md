type Theme = 'system' | 'light' | 'dark';
type Surface = 'minimal' | 'glass' | 'material';

export function setupPreferences(onStorageError: () => void): HTMLDialogElement {
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
    if (savedSurface === 'glass' || savedSurface === 'material') surface = savedSurface;
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
  const stopTransition = (): void => {
    revision++;
    transition?.skipTransition();
    transition = undefined;
    root.classList.remove('theme-switch');
  };
  applyTheme();
  root.dataset.surface = surface;
  surfaceSetting.value = surface;

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
    if (value !== 'minimal' && value !== 'glass' && value !== 'material') return;
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
