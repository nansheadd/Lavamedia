'use client';

import { Fragment, useMemo } from 'react';
import clsx from 'clsx';
import {
  Bars3BottomLeftIcon,
  Bars3CenterLeftIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ListBulletIcon,
  MusicalNoteIcon,
  NumberedListIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
  Squares2X2Icon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

import type {
  EditorAudioBlock,
  EditorBlock,
  EditorFootnote,
  EditorGalleryBlock,
  EditorGalleryImage,
  EditorImageBlock,
  EditorListBlock,
  EditorMediaAlignment,
  EditorMediaFormat,
  EditorTextBlock,
  EditorTextStyle,
  EditorVideoBlock
} from '../types';

interface BlockComposerProps {
  blocks: EditorBlock[];
  footnotes: EditorFootnote[];
  onInsert: (block: EditorBlock, position?: number) => void;
  onUpdate: (id: string, patch: Partial<EditorBlock>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onDuplicate: (id: string) => void;
}

const iconClass = 'h-4 w-4';

const createId = () => `blk_${Math.random().toString(36).slice(2, 10)}`;

const createTextBlock = (style: EditorTextStyle): EditorTextBlock => ({
  id: createId(),
  type: 'text',
  style,
  content: ''
});

const createListBlock = (ordered: boolean): EditorListBlock => ({
  id: createId(),
  type: 'list',
  style: ordered ? 'ordered' : 'unordered',
  items: ['', '']
});

const createImageBlock = (): EditorImageBlock => ({
  id: createId(),
  type: 'image',
  url: '',
  caption: '',
  credit: '',
  alignment: 'center',
  format: 'wide'
});

const createGalleryBlock = (): EditorGalleryBlock => ({
  id: createId(),
  type: 'gallery',
  layout: 'grid',
  images: [
    { id: createId(), url: '', caption: '', credit: '' },
    { id: createId(), url: '', caption: '', credit: '' }
  ]
});

const createVideoBlock = (): EditorVideoBlock => ({
  id: createId(),
  type: 'video',
  url: '',
  title: '',
  poster: '',
  provider: 'file'
});

const createAudioBlock = (): EditorAudioBlock => ({
  id: createId(),
  type: 'audio',
  url: '',
  title: '',
  transcript: ''
});

const BLOCKS_PALETTE: Array<{
  id: string;
  label: string;
  description: string;
  icon: JSX.Element;
  create: () => EditorBlock;
}> = [
  {
    id: 'paragraph',
    label: 'Paragraphe',
    description: 'Texte riche classique',
    icon: <DocumentTextIcon className={iconClass} />,
    create: () => createTextBlock('paragraph')
  },
  {
    id: 'lead',
    label: 'Chapô',
    description: 'Introduction ou accroche',
    icon: <SparklesIcon className={iconClass} />,
    create: () => createTextBlock('lead')
  },
  {
    id: 'h1',
    label: 'Titre H1',
    description: 'Titre principal de section',
    icon: <Bars3BottomLeftIcon className={iconClass} />,
    create: () => createTextBlock('heading1')
  },
  {
    id: 'h2',
    label: 'Intertitre',
    description: 'Titre secondaire',
    icon: <Bars3CenterLeftIcon className={iconClass} />,
    create: () => createTextBlock('heading2')
  },
  {
    id: 'quote',
    label: 'Citation',
    description: 'Bloc citation ou extrait',
    icon: <ChatBubbleLeftRightIcon className={iconClass} />,
    create: () => createTextBlock('blockquote')
  },
  {
    id: 'unordered-list',
    label: 'Liste à puces',
    description: 'Éléments non ordonnés',
    icon: <ListBulletIcon className={iconClass} />,
    create: () => createListBlock(false)
  },
  {
    id: 'ordered-list',
    label: 'Liste numérotée',
    description: 'Étapes ou chronologie',
    icon: <NumberedListIcon className={iconClass} />,
    create: () => createListBlock(true)
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Photo dans le corps du texte',
    icon: <PhotoIcon className={iconClass} />,
    create: () => createImageBlock()
  },
  {
    id: 'gallery',
    label: 'Galerie',
    description: 'Galerie photo multi-images',
    icon: <Squares2X2Icon className={iconClass} />,
    create: () => createGalleryBlock()
  },
  {
    id: 'video',
    label: 'Vidéo',
    description: 'Lien YouTube, Vimeo ou fichier',
    icon: <VideoCameraIcon className={iconClass} />,
    create: () => createVideoBlock()
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Podcast ou extrait sonore',
    icon: <MusicalNoteIcon className={iconClass} />,
    create: () => createAudioBlock()
  }
];

const alignmentOptions: { value: EditorMediaAlignment; label: string }[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centré' },
  { value: 'right', label: 'Droite' }
];

const formatOptions: { value: EditorMediaFormat; label: string }[] = [
  { value: 'inline', label: 'Encadré' },
  { value: 'wide', label: 'Large' },
  { value: 'full', label: 'Plein écran' }
];

const textStyleLabels: Record<EditorTextStyle, string> = {
  paragraph: 'Paragraphe',
  lead: 'Chapô',
  heading1: 'Titre niveau 1',
  heading2: 'Titre niveau 2',
  blockquote: 'Citation'
};

const getBlockTitle = (block: EditorBlock): string => {
  switch (block.type) {
    case 'text':
      return textStyleLabels[block.style];
    case 'list':
      return block.style === 'ordered' ? 'Liste numérotée' : 'Liste à puces';
    case 'image':
      return 'Image';
    case 'gallery':
      return 'Galerie';
    case 'video':
      return 'Bloc vidéo';
    case 'audio':
      return 'Bloc audio';
    default:
      return 'Bloc';
  }
};

const footnoteMarker = (id: string, footnotes: EditorFootnote[]): string | null =>
  footnotes.find((note) => note.id === id)?.marker ?? null;

export const BlockComposer = ({
  blocks,
  footnotes,
  onInsert,
  onUpdate,
  onRemove,
  onMove,
  onDuplicate
}: BlockComposerProps) => {
  const usedMarkers = useMemo(
    () =>
      new Map(
        footnotes.map((note) => [note.id, note.marker])
      ),
    [footnotes]
  );

  return (
    <section className="editor-section space-y-6" aria-label="Corps de l’article">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <p className="editor-label">Corps modulable</p>
          <p className="text-sm text-slate-500">
            Composez votre article par blocs. Glissez, dupliquez et agencez texte, médias et citations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLOCKS_PALETTE.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-500 hover:text-primary-600"
              onClick={() => onInsert(item.create())}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <article
            key={block.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary-200"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Bloc {index + 1}</p>
                <h3 className="text-lg font-semibold text-slate-900">{getBlockTitle(block)}</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                  onClick={() => onMove(block.id, 'up')}
                >
                  Monter
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                  onClick={() => onMove(block.id, 'down')}
                >
                  Descendre
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                  onClick={() => onDuplicate(block.id)}
                >
                  Dupliquer
                </button>
                <button
                  type="button"
                  className="rounded-full border border-danger-200 px-3 py-1.5 font-semibold uppercase tracking-wide text-danger-600 transition hover:border-danger-500 hover:text-danger-700"
                  onClick={() => onRemove(block.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              {block.type === 'text' && (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Style
                    <select
                      value={block.style}
                      className="editor-input"
                      onChange={(event) =>
                        onUpdate(block.id, { style: event.target.value as EditorTextBlock['style'] })
                      }
                    >
                      {Object.entries(textStyleLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Contenu
                    <textarea
                      value={block.content}
                      onChange={(event) => onUpdate(block.id, { content: event.target.value })}
                      className={clsx('editor-textarea', {
                        'min-h-[6rem]': block.style !== 'blockquote',
                        'font-serif italic text-lg': block.style === 'blockquote',
                        'text-2xl font-semibold': block.style === 'heading1',
                        'text-xl font-semibold': block.style === 'heading2',
                        'text-lg text-slate-700': block.style === 'lead'
                      })}
                      placeholder="Rédigez votre contenu…"
                    />
                  </label>
                  {footnotes.length > 0 && (
                    <fieldset className="space-y-2 text-sm text-slate-600">
                      <legend className="font-medium">Notes associées</legend>
                      <p className="text-xs text-slate-500">
                        Sélectionnez les notes de bas de page mentionnées dans ce bloc. Elles seront numérotées automatiquement.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {footnotes.map((note) => {
                          const marker = usedMarkers.get(note.id) ?? note.marker;
                          const selected = block.footnoteIds?.includes(note.id) ?? false;
                          return (
                            <label
                              key={note.id}
                              className={clsx(
                                'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
                                selected
                                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(event) => {
                                  const nextIds = new Set(block.footnoteIds ?? []);
                                  if (event.target.checked) {
                                    nextIds.add(note.id);
                                  } else {
                                    nextIds.delete(note.id);
                                  }
                                  onUpdate(block.id, { footnoteIds: Array.from(nextIds) });
                                }}
                                className="hidden"
                              />
                              <span>Note {marker}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}
                </div>
              )}
              {block.type === 'list' && (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Type de liste
                    <select
                      value={block.style}
                      className="editor-input"
                      onChange={(event) =>
                        onUpdate(block.id, { style: event.target.value as EditorListBlock['style'] })
                      }
                    >
                      <option value="unordered">À puces</option>
                      <option value="ordered">Numérotée</option>
                    </select>
                  </label>
                  <div className="space-y-3">
                    {block.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-2">
                        <span className="mt-2 w-6 text-xs font-semibold text-slate-500">
                          {block.style === 'ordered' ? itemIndex + 1 : '•'}
                        </span>
                        <textarea
                          value={item}
                          onChange={(event) => {
                            const nextItems = [...block.items];
                            nextItems[itemIndex] = event.target.value;
                            onUpdate(block.id, { items: nextItems } as Partial<EditorBlock>);
                          }}
                          className="editor-textarea min-h-[4rem]"
                          placeholder="Élément de liste…"
                        />
                        <button
                          type="button"
                          className="mt-1 rounded-full border border-slate-200 px-2 py-1 text-xs uppercase tracking-wide text-danger-500 transition hover:border-danger-400 hover:text-danger-600"
                          onClick={() => {
                            const nextItems = block.items.filter((_, idx) => idx !== itemIndex);
                            onUpdate(block.id, { items: nextItems } as Partial<EditorBlock>);
                          }}
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                    onClick={() => onUpdate(block.id, { items: [...block.items, ''] } as Partial<EditorBlock>)}
                  >
                    <PlusIcon className="h-4 w-4" /> Ajouter un élément
                  </button>
                </div>
              )}
              {block.type === 'image' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      URL de l’image
                      <input
                        value={block.url}
                        onChange={(event) => onUpdate(block.id, { url: event.target.value })}
                        placeholder="https://cdn.lavamedia.example/visuel.jpg"
                        className="editor-input"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      Légende
                      <textarea
                        value={block.caption ?? ''}
                        onChange={(event) => onUpdate(block.id, { caption: event.target.value })}
                        className="editor-textarea"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      Crédit
                      <input
                        value={block.credit ?? ''}
                        onChange={(event) => onUpdate(block.id, { credit: event.target.value })}
                        className="editor-input"
                      />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      Alignement
                      <select
                        value={block.alignment}
                        className="editor-input"
                        onChange={(event) =>
                          onUpdate(block.id, { alignment: event.target.value as EditorMediaAlignment })
                        }
                      >
                        {alignmentOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      Format
                      <select
                        value={block.format}
                        className="editor-input"
                        onChange={(event) =>
                          onUpdate(block.id, { format: event.target.value as EditorMediaFormat })
                        }
                      >
                        {formatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                      Prévoyez une largeur minimale de 1600px pour les formats « plein écran ».
                    </div>
                  </div>
                </div>
              )}
              {block.type === 'gallery' && (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Disposition
                    <select
                      value={block.layout}
                      className="editor-input"
                      onChange={(event) => onUpdate(block.id, { layout: event.target.value as EditorGalleryBlock['layout'] })}
                    >
                      <option value="grid">Grille responsive</option>
                      <option value="carousel">Carrousel plein écran</option>
                    </select>
                  </label>
                  <div className="space-y-5">
                    {block.images.map((image) => (
                      <Fragment key={image.id}>
                        <div className="grid gap-4 md:grid-cols-3">
                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                            URL
                            <input
                              value={image.url}
                              onChange={(event) => {
                                const nextImages: EditorGalleryImage[] = block.images.map((item) =>
                                  item.id === image.id ? { ...item, url: event.target.value } : item
                                );
                                onUpdate(block.id, { images: nextImages } as Partial<EditorBlock>);
                              }}
                              className="editor-input"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                            Légende
                            <input
                              value={image.caption ?? ''}
                              onChange={(event) => {
                                const nextImages: EditorGalleryImage[] = block.images.map((item) =>
                                  item.id === image.id ? { ...item, caption: event.target.value } : item
                                );
                                onUpdate(block.id, { images: nextImages } as Partial<EditorBlock>);
                              }}
                              className="editor-input"
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                            Crédit
                            <input
                              value={image.credit ?? ''}
                              onChange={(event) => {
                                const nextImages: EditorGalleryImage[] = block.images.map((item) =>
                                  item.id === image.id ? { ...item, credit: event.target.value } : item
                                );
                                onUpdate(block.id, { images: nextImages } as Partial<EditorBlock>);
                              }}
                              className="editor-input"
                            />
                          </label>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-full border border-danger-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-danger-600 transition hover:border-danger-400 hover:text-danger-700"
                            onClick={() => {
                              const nextImages = block.images.filter((item) => item.id !== image.id);
                              onUpdate(block.id, { images: nextImages } as Partial<EditorBlock>);
                            }}
                          >
                            Supprimer l’image
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                    onClick={() =>
                      onUpdate(block.id, {
                        images: [
                          ...block.images,
                          { id: createId(), url: '', caption: '', credit: '' }
                        ]
                      } as Partial<EditorBlock>)
                    }
                  >
                    <PlusIcon className="h-4 w-4" /> Ajouter une image
                  </button>
                </div>
              )}
              {block.type === 'video' && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      URL de la vidéo
                      <input
                        value={block.url}
                        onChange={(event) => onUpdate(block.id, { url: event.target.value })}
                        className="editor-input"
                        placeholder="https://youtu.be/..."
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                      Image de couverture
                      <input
                        value={block.poster ?? ''}
                        onChange={(event) => onUpdate(block.id, { poster: event.target.value })}
                        className="editor-input"
                        placeholder="https://cdn.lavamedia.example/poster.jpg"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Titre accessible
                    <input
                      value={block.title ?? ''}
                      onChange={(event) => onUpdate(block.id, { title: event.target.value })}
                      className="editor-input"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Plateforme
                    <select
                      value={block.provider ?? 'file'}
                      className="editor-input"
                      onChange={(event) =>
                        onUpdate(block.id, {
                          provider: event.target.value as EditorVideoBlock['provider']
                        })
                      }
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="dailymotion">Dailymotion</option>
                      <option value="file">Fichier hébergé</option>
                    </select>
                  </label>
                </div>
              )}
              {block.type === 'audio' && (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    URL de l’audio
                    <input
                      value={block.url}
                      onChange={(event) => onUpdate(block.id, { url: event.target.value })}
                      className="editor-input"
                      placeholder="https://cdn.lavamedia.example/extrait.mp3"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Titre / description
                    <input
                      value={block.title ?? ''}
                      onChange={(event) => onUpdate(block.id, { title: event.target.value })}
                      className="editor-input"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                    Transcription ou notes
                    <textarea
                      value={block.transcript ?? ''}
                      onChange={(event) => onUpdate(block.id, { transcript: event.target.value })}
                      className="editor-textarea"
                    />
                  </label>
                </div>
              )}
            </div>
          </article>
        ))}
        {blocks.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Ajoutez un premier bloc pour démarrer votre article.
          </div>
        )}
      </div>
    </section>
  );
};
