import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppearanceContext = createContext(undefined);
const STORAGE_KEY = 'rallyhub-appearance';
const MODES = ['auto', 'light', 'hall', 'dark'];

function systemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function AppearanceProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : 'dark';
  });
  const [system, setSystem] = useState(systemTheme);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!query) return undefined;
    const update = () => setSystem(query.matches ? 'light' : 'dark');
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  const resolvedMode = mode === 'auto' ? system : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedMode;
    root.dataset.appearance = mode;
    root.classList.toggle('dark', resolvedMode === 'dark');
    root.style.colorScheme = resolvedMode === 'dark' ? 'dark' : 'light';
  }, [mode, resolvedMode]);

  const setMode = (next) => {
    if (!MODES.includes(next)) return;
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const cycleMode = () => {
    const quickModes = ['light', 'hall', 'dark'];
    const current = quickModes.includes(resolvedMode) ? resolvedMode : 'dark';
    const next = quickModes[(quickModes.indexOf(current) + 1) % quickModes.length];
    setMode(next);
  };

  const value = useMemo(() => ({ mode, resolvedMode, setMode, cycleMode, modes: MODES }), [mode, resolvedMode]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used within AppearanceProvider');
  return value;
}
