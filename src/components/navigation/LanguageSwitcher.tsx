"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useLanguage } from "@/contexts/language-context";

const SUPPORTED_LOCALES = ["fr", "nl"] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={clsx("flex items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300", className)}>
      {SUPPORTED_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={clsx(
            "rounded-full px-2 py-1 transition",
            language === code ? "bg-primary-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
