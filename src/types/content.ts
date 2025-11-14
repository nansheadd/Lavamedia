export type ArticleSummary = {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  body: string;
  heroImage?: string;
  updatedAt?: string;
  isPayWhatYouWant?: boolean;
};

export type CategorySummary = {
  slug: string;
  title: string;
  description: string;
};
