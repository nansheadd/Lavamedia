'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { RichEditor } from '@/components/forms/rich-editor';
import { Button } from '@/components/ui/button';

export function EditorScreen() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 1500);
  };

  return (
    <div className="space-y-6">
      <Input label="Titre" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre de l’article" />
      <RichEditor label="Contenu" />
      <div className="flex items-center gap-4">
        <Button onClick={() => handleSave()} disabled={status === 'saving'}>
          {status === 'saving' ? 'Sauvegarde…' : 'Sauvegarder'}
        </Button>
        {status === 'saved' ? <p className="text-sm text-emerald-600">Brouillon enregistré</p> : null}
      </div>
    </div>
  );
}
