import type { Metadata } from 'next';

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'article' | 'website' | 'collection';
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata({ title, description, path, image, type = 'website', publishedTime, modifiedTime }: BuildMetadataOptions): Metadata {
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
      type,
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
        : undefined,
      publishedTime,
      modifiedTime
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
