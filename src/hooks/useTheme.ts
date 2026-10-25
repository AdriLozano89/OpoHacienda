import { useEffect } from 'react';

/**
 * Ensures the entire application remains strictly in pure white institutional theme,
 * removing any leftover dark classes and locking light mode.
 */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    try {
      localStorage.setItem('opohacienda_theme', 'light');
    } catch {}
  }, []);

  return { theme: 'light' as const, isDark: false };
}
