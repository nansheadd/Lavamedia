import type { ArticleSummary, CategorySummary } from '@/types/content';
import { fallbackLanguage, getList } from '@/i18n/translations';

export const categories: CategorySummary[] = getList<CategorySummary[]>(fallbackLanguage, 'categories');

export const articles: ArticleSummary[] = getList<ArticleSummary[]>(fallbackLanguage, 'articles');
