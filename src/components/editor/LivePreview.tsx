'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { FC } from 'react';

import type { EditorBlock, EditorState, EditorTextBlock, EditorListBlock, EditorImageBlock, EditorGalleryBlock, EditorVideoBlock, EditorAudioBlock } from './types';

export interface LivePreviewProps {
  state: EditorState;
  viewport?: 'desktop' | 'mobile';
}

const getFootnoteMarker = (id: string, state: EditorState): string | null =>
  state.footnotes.find((note) => note.id === id)?.marker ?? null;

const renderText = (block: EditorTextBlock, state: EditorState) => {
  const baseClass =
    block.style === 'heading1'
      ? 'text-3xl font-semibold'
      : block.style === 'heading2'
        ? 'text-2xl font-semibold'
        : block.style === 'lead'
          ? 'text-lg text-slate-600'
          : block.style === 'blockquote'
            ? 'border-l-4 border-slate-200 pl-4 italic text-lg'
            : 'text-base';
  const markers = (block.footnoteIds ?? [])
    .map((id) => getFootnoteMarker(id, state))
    .filter(Boolean)
    .map((marker) => <sup key={marker} className="ml-1 text-xs text-primary-600">[{marker}]</sup>);
  const paragraphs = block.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) {
    return <p className="text-sm text-slate-400">Bloc vide</p>;
  }
  return paragraphs.map((paragraph, index) => (
    <p key={index} className={baseClass}>
      {paragraph}
      {index === paragraphs.length - 1 && markers}
    </p>
  ));
};

const renderList = (block: EditorListBlock) => {
  if (block.items.length === 0) {
    return <p className="text-sm text-slate-400">Liste à compléter</p>;
  }
  const ListTag = block.style === 'ordered' ? 'ol' : 'ul';
  return (
    <ListTag className="ml-6 space-y-2">
      {block.items.map((item, index) => (
        <li key={index}>{item || <span className="text-xs text-slate-400">Élément vide</span>}</li>
      ))}
    </ListTag>
  );
};

const renderImage = (block: EditorImageBlock) => (
  <figure
    className={
      block.format === 'full'
        ? 'w-full overflow-hidden rounded-3xl'
        : block.format === 'wide'
          ? 'mx-auto w-full max-w-4xl overflow-hidden rounded-3xl'
          : 'mx-auto w-full max-w-2xl overflow-hidden rounded-2xl'
    }
    data-align={block.alignment}
  >
    {block.url ? (
      <div className="relative h-64 w-full">
        <Image src={block.url} alt={block.caption || 'Illustration'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />
      </div>
    ) : (
      <div className="flex h-32 items-center justify-center bg-slate-100 text-sm text-slate-500">
        Ajouter une image
      </div>
    )}
    {(block.caption || block.credit) && (
      <figcaption className="flex justify-between bg-slate-50 px-4 py-2 text-xs text-slate-500">
        <span>{block.caption}</span>
        {block.credit && <span>© {block.credit}</span>}
      </figcaption>
    )}
  </figure>
);

const renderGallery = (block: EditorGalleryBlock) => (
  <div className="space-y-3" data-layout={block.layout}>
    <div
      className={
        block.layout === 'grid'
          ? 'grid gap-3 sm:grid-cols-2'
          : 'flex snap-x snap-mandatory gap-3 overflow-x-auto'
      }
    >
      {block.images.map((image) => (
        <figure
          key={image.id}
          className={
            block.layout === 'grid'
              ? 'relative h-48 w-full overflow-hidden rounded-2xl'
              : 'relative h-52 w-72 shrink-0 snap-center overflow-hidden rounded-2xl'
          }
        >
          {image.url ? (
            <Image src={image.url} alt={image.caption || 'Visuel galerie'} fill className="object-cover" sizes="(max-width: 768px) 80vw, 30vw" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100 text-xs text-slate-500">
              Image manquante
            </div>
          )}
        </figure>
      ))}
    </div>
    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
      {block.images.map((image) => (
        <span key={`${image.id}-meta`} className="rounded-full bg-slate-100 px-3 py-1">
          {image.caption || 'Légende à compléter'}
        </span>
      ))}
    </div>
  </div>
);

const renderVideo = (block: EditorVideoBlock) => {
  if (!block.url) {
    return <p className="text-sm text-slate-400">Ajoutez une URL vidéo pour afficher l’intégration.</p>;
  }
  if (block.provider && block.provider !== 'file') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-3xl">
        <iframe
          src={block.url}
          title={block.title ?? 'Lecteur vidéo'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  return (
    <video
      controls
      poster={block.poster}
      className="w-full overflow-hidden rounded-3xl"
    >
      <source src={block.url} />
      Votre navigateur ne supporte pas la vidéo HTML5.
    </video>
  );
};

const renderAudio = (block: EditorAudioBlock) => (
  <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4">
    <p className="text-sm font-medium text-slate-700">{block.title || 'Titre de l’extrait'}</p>
    {block.url ? (
      <audio controls className="w-full">
        <source src={block.url} />
        Votre navigateur ne supporte pas l’audio HTML5.
      </audio>
    ) : (
      <p className="text-xs text-slate-400">Fournissez un lien audio accessible.</p>
    )}
    {block.transcript && (
      <details className="rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-600">
        <summary className="cursor-pointer font-semibold">Transcription</summary>
        <p className="mt-2 whitespace-pre-wrap">{block.transcript}</p>
      </details>
    )}
  </div>
);

const renderBlock = (block: EditorBlock, state: EditorState) => {
  switch (block.type) {
    case 'text':
      return renderText(block, state);
    case 'list':
      return renderList(block);
    case 'image':
      return renderImage(block);
    case 'gallery':
      return renderGallery(block);
    case 'video':
      return renderVideo(block);
    case 'audio':
      return renderAudio(block);
    default:
      return null;
  }
};

export const LivePreview: FC<LivePreviewProps> = ({ state, viewport = 'desktop' }) => {
  const isMobile = viewport === 'mobile';
  return (
    <section
      aria-label="Aperçu en direct"
      className={clsx(
        'editor-section space-y-10 w-full',
        isMobile && 'max-w-sm mx-auto'
      )}
    >
      <header className={clsx('space-y-4', isMobile && 'text-center')}>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          Aperçu instantané
        </p>
        <h1
          className={clsx(
            'font-editorial text-slate-900 dark:text-slate-100',
            isMobile ? 'text-3xl' : 'text-4xl'
          )}
        >
          {state.title || 'Titre en attente'}
        </h1>
        {state.chapeau && (
          <p
            className={clsx(
              'text-slate-600 dark:text-slate-200',
              isMobile ? 'text-base' : 'max-w-2xl text-lg'
            )}
          >
            {state.chapeau}
          </p>
        )}
      </header>
      {state.lead && (
        <figure
          className={clsx(
            'overflow-hidden rounded-3xl border border-slate-200 shadow-sm',
            isMobile && 'rounded-2xl'
          )}
        >
          <div className={clsx('relative w-full', isMobile ? 'h-56' : 'h-72')}>
            {state.lead.imageUrl ? (
              <Image
                key={`${state.lead.imageUrl}-${viewport}`}
                src={state.lead.imageUrl}
                alt={state.lead.caption || 'Illustration de l’article'}
                fill
                className="object-cover"
                sizes={isMobile ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                priority={isMobile}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                Ajoutez une image de une
              </div>
            )}
          </div>
          {(state.lead.caption || state.lead.credit) && (
            <figcaption
              className={clsx(
                'bg-slate-50 text-sm text-slate-600',
                isMobile ? 'px-4 py-2 text-xs' : 'flex items-center justify-between px-6 py-3'
              )}
            >
              <span>{state.lead.caption}</span>
              {state.lead.credit && <span className="font-medium">© {state.lead.credit}</span>}
            </figcaption>
          )}
        </figure>
      )}
      <article
        className={clsx(
          'border border-slate-200 bg-white shadow-sm',
          isMobile ? 'rounded-2xl p-4' : 'rounded-3xl p-10'
        )}
      >
        <div className="space-y-6">
          {state.blocks.length === 0 ? (
            <p className="text-sm text-slate-400">Ajoutez des blocs pour alimenter l’aperçu.</p>
          ) : (
            state.blocks.map((block) => (
              <div key={block.id} className="space-y-4">
                {renderBlock(block, state)}
              </div>
            ))
          )}
        </div>
      </article>
      {state.callouts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Encadrés
          </h2>
          <div className={clsx('grid gap-4', isMobile ? 'grid-cols-1' : 'md:grid-cols-2')}>
            {state.callouts.map((callout) => (
              <div key={callout.id} className="editor-callout" data-tone={callout.tone}>
                <p className="font-semibold text-slate-900">{callout.title}</p>
                <p className="text-slate-700">{callout.body || 'Contenu à compléter.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {state.footnotes.length > 0 && (
        <aside
          className={clsx(
            'editor-footnotes',
            isMobile && 'px-4 py-3 text-xs'
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes de bas de page
          </p>
          <ol className="space-y-2">
            {state.footnotes.map((note) => (
              <li key={note.id}>
                <span className="font-semibold text-primary-700">[{note.marker}]</span>{' '}
                <span>{note.content}</span>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </section>
  );
};
