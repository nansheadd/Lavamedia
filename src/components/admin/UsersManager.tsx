'use client';

import { useState } from 'react';
import { Card, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialUsers = [
  { id: '1', name: 'Jeanne Auteur', email: 'jeanne@lavamedia.fr', role: 'author' },
  { id: '2', name: 'Alex Admin', email: 'alex@lavamedia.fr', role: 'admin' },
  { id: '3', name: 'Émile Éditeur', email: 'emile@lavamedia.fr', role: 'editor' },
  { id: '4', name: 'Noé Contributeur', email: 'noe@lavamedia.fr', role: 'contributor' },
  { id: '5', name: 'Sofia Abonnée', email: 'sofia@lavamedia.fr', role: 'subscriber' },
  { id: '6', name: 'Maya Cliente', email: 'maya@lavamedia.fr', role: 'client' },
  { id: '7', name: 'Lina Lectrice', email: 'lina@lavamedia.fr', role: 'user' }
];

type Role = 'user' | 'author' | 'editor' | 'contributor' | 'subscriber' | 'client' | 'admin';

export function UsersManager() {
  const [users, setUsers] = useState(initialUsers);

  const cycleRole = (id: string) => {
    setUsers((current) =>
      current.map((user) => {
        if (user.id !== id) return user;
        const roles: Role[] = ['user', 'author', 'editor', 'contributor', 'subscriber', 'client', 'admin'];
        const nextIndex = (roles.indexOf(user.role as Role) + 1) % roles.length;
        return { ...user, role: roles[nextIndex] };
      })
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {users.map((user) => (
        <Card key={user.id}>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <CardFooter>
            <span className="text-xs uppercase tracking-wide text-primary-300">{user.role}</span>
            <Button variant="secondary" onClick={() => cycleRole(user.id)}>
              Changer de rôle
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
