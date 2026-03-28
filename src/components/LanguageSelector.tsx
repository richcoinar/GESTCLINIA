"use client";

import { useTranslation, Locale } from "../lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLocale(lang.code)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
            locale === lang.code
              ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
          }`}
          title={lang.label}
        >
          {lang.flag} <span className="ml-1 uppercase">{lang.code}</span>
        </button>
      ))}
    </div>
  );
}
