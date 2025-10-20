import { SectionHeading } from '@/components/ui/section-heading';
import { EditorScreen } from '@/components/journalist/EditorScreen';

export const metadata = {
  title: 'Éditeur WYSIWYG',
  description: 'Rédigez, structurez et sauvegardez vos contenus en toute simplicité.'
};

export default function JournalistEditorPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Éditeur riche"
        title="Composez vos articles en toute sérénité"
        description="Prévisualisation en temps réel, gestion des métadonnées et validations intégrées."
      />
      <EditorScreen />
    </div>
  );
}
