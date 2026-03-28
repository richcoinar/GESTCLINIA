import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "es" | "en" | "pt";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: "es",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "gestclinia-locale",
    }
  )
);

import es from "../locales/es.json";
import en from "../locales/en.json";
import pt from "../locales/pt.json";

const translations = { es, en, pt };

export function useTranslation() {
  const { locale, setLocale } = useI18nStore();
  
  const t = (key: string, section?: string) => {
    const dict = translations[locale] as any;
    
    // Support dot notation for nested keys (e.g., "landing.hero.badge")
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : undefined;
      }, obj);
    };

    if (section) {
      const sectionValue = dict[section];
      if (sectionValue) {
        const value = getNestedValue(sectionValue, key);
        if (value) return value;
      }
    }

    const value = getNestedValue(dict, key);
    return (typeof value === 'string') ? value : key;
  };

  return { t, locale, setLocale };
}
