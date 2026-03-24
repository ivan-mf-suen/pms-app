'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load language preference from localStorage after hydration
  useEffect(() => {
    const storedLanguage = localStorage.getItem('pms_language') as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'zh-Hant')) {
      setLanguageState(storedLanguage);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pms_language', lang);
  };

  const t = (key: string, defaultValue?: string) => {
    return getTranslation(language, key, defaultValue);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isHydrated,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
