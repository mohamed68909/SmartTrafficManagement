// ═══ LANGUAGE CONTEXT ═══
// Persists current language to localStorage.
// Applies <html lang> and <html dir> based on current language.
// Exposes: { lang, setLang, toggle, t, dir }.
// `t('path.to.key')` — safe dotted lookup; falls back to the key itself if missing.

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'lang';
const SUPPORTED = ['ar', 'en'];
const DEFAULT_LANG = 'ar';

const resolveInitialLang = () => {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) return saved;
  return DEFAULT_LANG;
};

const lookup = (dict, path) => {
  const parts = path.split('.');
  let node = dict;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = node[part];
    } else {
      return undefined;
    }
  }
  return node;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(resolveInitialLang);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', dir);
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = useCallback((next) => {
    if (SUPPORTED.includes(next)) setLangState(next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = translations[lang] || translations[DEFAULT_LANG];
      const value = lookup(dict, key);
      if (value !== undefined) return value;
      const fallbackDict = translations[DEFAULT_LANG];
      const fallbackValue = lookup(fallbackDict, key);
      if (fallbackValue !== undefined) return fallbackValue;
      return fallback !== undefined ? fallback : key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t, dir }), [lang, setLang, toggle, t, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within <LanguageProvider>');
  }
  return ctx;
};
