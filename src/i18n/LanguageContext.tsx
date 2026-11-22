import React, { createContext, useContext, ReactNode } from 'react';
import { copy, Copy, Language } from './copy';
import { getSpeechLocale } from './languageUtils';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  locale: string;
  t: Copy;
}

const defaultContextValue: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {},
  locale: 'en-IN',
  t: copy.en,
};

export const LanguageContext = createContext<LanguageContextValue>(defaultContextValue);

export function LanguageProvider({
  language,
  setLanguage,
  children,
}: {
  language: Language;
  setLanguage: (lang: Language) => void;
  children: ReactNode;
}) {
  const t = copy[language] ?? copy.en;
  const locale = getSpeechLocale(language);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    locale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useActiveLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
