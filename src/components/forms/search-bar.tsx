'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { useTranslations } from '@/contexts/language-context';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const t = useTranslations();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form className="flex w-full max-w-3xl items-end gap-3" onSubmit={handleSubmit} role="search">
      <Input
        label={t('search.label')}
        name="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('searchBar.aria')}
      />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary-600 px-5 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <MagnifyingGlassIcon className="mr-2 h-4 w-4" aria-hidden="true" />
        {t('search.button')}
      </button>
    </form>
  );
}
