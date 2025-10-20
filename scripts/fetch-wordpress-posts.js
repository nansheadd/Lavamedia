#!/usr/bin/env node

/**
 * Fetches posts, categories, and media metadata from the legacy WordPress site
 * and saves a consolidated JSON snapshot to content/wordpress/posts.json.
 *
 * Usage:
 *   node scripts/fetch-wordpress-posts.js [--per-page <number>] [--pages <number>] [--output <path>]
 */

const fs = require('fs/promises');
const path = require('path');

const API_BASE = 'https://lavamedia.be/wp-json/wp/v2';
const DEFAULT_OUTPUT = path.join(__dirname, '..', 'content', 'wordpress', 'posts.json');

const ARGUMENTS = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];

  if (!key.startsWith('--')) {
    continue;
  }

  if (value && !value.startsWith('--')) {
    ARGUMENTS.set(key.slice(2), value);
    i += 1;
  } else {
    ARGUMENTS.set(key.slice(2), true);
  }
}

const PER_PAGE = Number(ARGUMENTS.get('per-page')) || 20;
const requestedPages = ARGUMENTS.get('pages');
const TOTAL_PAGES =
  requestedPages === undefined || requestedPages === 'all'
    ? 0
    : Number(requestedPages) > 0
      ? Number(requestedPages)
      : 0;
const OUTPUT_PATH = ARGUMENTS.get('output')
  ? path.resolve(process.cwd(), ARGUMENTS.get('output'))
  : DEFAULT_OUTPUT;

function buildUrl(resource, params = {}) {
  const url = new URL(resource, API_BASE + '/');
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  url.search = searchParams.toString();
  return url.toString();
}

async function fetchJson(resource, params = {}) {
  const url = buildUrl(resource, params);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status} ${response.statusText}): ${body}`);
  }

  const data = await response.json();
  const totalPages = Number(response.headers.get('X-WP-TotalPages')) || undefined;

  return { data, totalPages };
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

function normalizeTitle(title) {
  if (!title || typeof title.rendered !== 'string') return '';
  return stripHtml(title.rendered);
}

function normalizeExcerpt(excerpt) {
  if (!excerpt || typeof excerpt.rendered !== 'string') return '';
  return stripHtml(excerpt.rendered);
}

function normalizeContent(content) {
  if (!content || typeof content.rendered !== 'string') return '';
  return content.rendered.trim();
}

async function fetchCollection(resource, ids) {
  if (!ids.length) return new Map();

  const uniqueIds = Array.from(new Set(ids));
  const result = new Map();
  const chunkSize = 50;

  for (let i = 0; i < uniqueIds.length; i += chunkSize) {
    const chunk = uniqueIds.slice(i, i + chunkSize);
    const { data } = await fetchJson(resource, {
      include: chunk.join(','),
      per_page: chunk.length,
    });

    data.forEach((item) => {
      result.set(item.id, item);
    });
  }

  return result;
}

async function collectPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    if (TOTAL_PAGES && page > TOTAL_PAGES) {
      break;
    }

    const { data, totalPages } = await fetchJson('posts', {
      per_page: PER_PAGE,
      page,
      _embed: false,
      orderby: 'date',
      order: 'desc',
      status: 'publish',
    });

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    posts.push(...data);

    if (!TOTAL_PAGES && totalPages && page >= totalPages) {
      break;
    }

    page += 1;
  }

  return posts;
}

async function main() {
  try {
    const posts = await collectPosts();

    const categoryIds = posts.flatMap((post) => post.categories || []);
    const tagIds = posts.flatMap((post) => post.tags || []);
    const mediaIds = posts
      .map((post) => post.featured_media)
      .filter((id) => typeof id === 'number' && id > 0);

    const [categories, tags, media] = await Promise.all([
      fetchCollection('categories', categoryIds),
      fetchCollection('tags', tagIds),
      fetchCollection('media', mediaIds),
    ]);

    const snapshot = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      link: post.link,
      date: post.date,
      modified: post.modified,
      title: normalizeTitle(post.title),
      excerpt: normalizeExcerpt(post.excerpt),
      content: normalizeContent(post.content),
      categories: (post.categories || []).map((id) => {
        const category = categories.get(id);
        return category
          ? { id: category.id, name: category.name, slug: category.slug }
          : { id, name: null, slug: null };
      }),
      tags: (post.tags || []).map((id) => {
        const tag = tags.get(id);
        return tag
          ? { id: tag.id, name: tag.name, slug: tag.slug }
          : { id, name: null, slug: null };
      }),
      featuredImage: (() => {
        const asset = media.get(post.featured_media);
        if (!asset) return null;

        const sizes = asset.media_details && asset.media_details.sizes
          ? Object.fromEntries(
              Object.entries(asset.media_details.sizes).map(([sizeKey, value]) => [
                sizeKey,
                {
                  url: value.source_url,
                  width: value.width,
                  height: value.height,
                },
              ]),
            )
          : undefined;

        return {
          id: asset.id,
          alt: asset.alt_text,
          url: asset.source_url,
          mimeType: asset.mime_type,
          title: asset.title?.rendered ? stripHtml(asset.title.rendered) : null,
          sizes,
        };
      })(),
    }));

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(
      OUTPUT_PATH,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: API_BASE,
          total: snapshot.length,
          posts: snapshot,
        },
        null,
        2,
      ),
      'utf-8',
    );

    console.log(`Saved ${snapshot.length} posts to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Failed to fetch WordPress content.');
    console.error(error.message);
    if (error.cause) {
      console.error(error.cause);
    }
    process.exitCode = 1;
  }
}

main();
