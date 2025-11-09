'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, ShieldExclamationIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import { computeSpellcheck } from './spellcheck';

interface SpellcheckPanelProps {
  text: string;
}

export const SpellcheckPanel = ({ text }: SpellcheckPanelProps) => {
  const [scanTrigger, setScanTrigger] = useState(0);
  const [results, setResults] = useState(() => computeSpellcheck(text));
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setResults(computeSpellcheck(text));
  }, [text, scanTrigger]);

  const totalOccurrences = useMemo(
    () => results.reduce((sum, entry) => sum + entry.occurrences, 0),
    [results]
  );

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label="Correcteur orthographique">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="editor-label">Correcteur</p>
          <p className="text-sm text-slate-500">
            Analyse lexicale locale sur dictionnaire interne. Relancez pour rafraîchir les suggestions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setScanTrigger((value) => value + 1)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
          >
            <ArrowPathIcon className="h-4 w-4" /> Relancer l’analyse
          </button>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-primary-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary-600 transition hover:bg-primary-50"
            >
              {collapsed ? (
                <>
                  <ChevronDownIcon className="h-4 w-4" /> Afficher les occurrences
                </>
              ) : (
                <>
                  <ChevronUpIcon className="h-4 w-4" /> Masquer les occurrences
                </>
              )}
            </button>
          )}
        </div>
      </header>
      {results.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircleIcon className="h-5 w-5" />
          <p>Aucune anomalie détectée sur le dictionnaire interne.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <ShieldExclamationIcon className="h-5 w-5" />
            <p>
              {results.length} mot{results.length > 1 ? 's' : ''} atypique{results.length > 1 ? 's' : ''} · {totalOccurrences}{' '}
              occurrence{totalOccurrences > 1 ? 's' : ''}
            </p>
          </div>
          {!collapsed && (
            <ul className="space-y-3 text-sm text-slate-600">
              {results.map((entry) => (
                <li key={entry.word} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="font-semibold text-slate-900">
                      {entry.word}
                      <span className="ml-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {entry.occurrences} occurrence{entry.occurrences > 1 ? 's' : ''}
                      </span>
                    </p>
                    {entry.suggestions.length > 0 ? (
                      <p className="text-xs text-slate-500">
                        Suggestions : {entry.suggestions.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Aucune suggestion disponible</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};
