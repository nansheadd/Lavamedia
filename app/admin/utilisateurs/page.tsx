import { SectionHeading } from '@/components/ui/section-heading';
import { UsersManager } from '@/components/admin/UsersManager';

export const metadata = {
  title: 'Gestion des utilisateurs',
  description: 'Attribuez rôles et permissions pour la rédaction et l’équipe produit.'
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Utilisateurs"
        title="Attribuez les bons droits en temps réel"
        description="Une gouvernance claire pour les journalistes, admins et contributeurs invités."
      />
      <UsersManager />
    </div>
  );
}
