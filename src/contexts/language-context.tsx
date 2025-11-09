'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { availableLanguages, fallbackLanguage, getList, getTranslation, type Language } from '@/i18n/translations';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  list: <T>(key: string) => T;
  languages: Array<{ code: Language; label: string }>;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: fallbackLanguage,
  setLanguage: () => undefined,
  t: (key: string) => getTranslation(fallbackLanguage, key),
  list: <T,>(key: string) => getList<T>(fallbackLanguage, key),
  languages: availableLanguages
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(fallbackLanguage);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('lavamedia.language') as Language | null;
    if (stored && ['fr', 'nl'].includes(stored)) {
      setLanguageState(stored);
      return;
    }
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith('nl')) {
      setLanguageState('nl');
    } else {
      setLanguageState(fallbackLanguage);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lavamedia.language', next);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, replacements) => getTranslation(language, key, replacements),
    list: (key) => getList(language, key),
    languages: availableLanguages
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslations() {
  const { t } = useContext(LanguageContext);
  return t;
}

export function useTranslationList() {
  const { list } = useContext(LanguageContext);
  return list;
}
