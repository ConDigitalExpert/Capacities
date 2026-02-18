export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'capacities_theme';

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'dark';
}

export function saveTheme(t: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, t);
}

export function applyTheme(t: Theme): void {
  document.documentElement.setAttribute('data-theme', t);
}
