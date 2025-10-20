'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextArea } from '@/components/forms/textarea';

const formattingOptions = [
  { label: 'Gras', command: '**' },
  { label: 'Italique', command: '_' },
  { label: 'Citation', command: '> ' }
];

type Props = {
  label: string;
  defaultValue?: string;
};

export function RichEditor({ label, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue);

  const applyCommand = (command: string) => {
    setValue((current) => `${current}\n${command}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {formattingOptions.map((option) => (
          <Button key={option.label} type="button" variant="secondary" onClick={() => applyCommand(option.command)}>
            {option.label}
          </Button>
        ))}
      </div>
      <TextArea
        label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={12}
        hint="Supporte une syntaxe markdown simplifiée."
      />
    </div>
  );
}
