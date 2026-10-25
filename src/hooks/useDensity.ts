import { useState, useEffect } from 'react';

export type ViewDensity = 'clean' | 'compact';

export function useDensity() {
  const [density, setDensity] = useState<ViewDensity>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_density');
      if (saved === 'clean' || saved === 'compact') return saved;
      // Default to 'clean' (Modo Limpio) as requested by the user
      return 'clean';
    } catch {
      return 'clean';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_density', density);
    } catch {}
  }, [density]);

  const toggleDensity = () => {
    setDensity((prev) => (prev === 'clean' ? 'compact' : 'clean'));
  };

  return { density, setDensity, toggleDensity, isClean: density === 'clean' };
}
