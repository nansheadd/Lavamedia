import type { Metadata } from 'next';

export function buildMetadata({
  title,
  description,
  path,
  image
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = `https://www.lavamedia.example${path}`;
  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title
            }
          ]
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
