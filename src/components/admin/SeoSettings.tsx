'use client';

import { useState } from 'react';
import { Input } from '@/components/forms/input';
import { TextArea } from '@/components/forms/textarea';
import { Button } from '@/components/ui/button';

export function SeoSettings() {
  const [title, setTitle] = useState('Lavamedia — Média de solutions');
  const [description, setDescription] = useState('Des récits engagés et des outils pour les journalistes innovants.');

  return (
    <div className="space-y-6">
      <Input label="Titre par défaut" value={title} onChange={(event) => setTitle(event.target.value)} />
      <TextArea label="Description par défaut" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Button type="button">Sauvegarder</Button>
    </div>
  );
}
