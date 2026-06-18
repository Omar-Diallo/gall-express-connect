import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { setUser, initSeedData } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Connexion — GalléExpress" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [role, setRole] = useState<'client' | 'prestataire'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [providerId, setProviderId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ role, name: name || (email.split('@')[0] ?? 'User'), email, providerId: role === 'prestataire' ? providerId : undefined });
    initSeedData();
    // Redirect client to home, prestataire to dashboard
    window.location.href = role === 'client' ? '/' : '/dashboard';
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-secondary">Connexion</h1>
        <p className="mt-2 text-sm text-muted-foreground">Connectez-vous en tant que client ou prestataire.</p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-2">
            <label className="inline-flex items-center gap-2"><input type="radio" name="role" checked={role === 'client'} onChange={() => setRole('client')} /> Client</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="role" checked={role === 'prestataire'} onChange={() => setRole('prestataire')} /> Prestataire</label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-secondary">Nom</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder="Votre nom" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-secondary">E-mail</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder="email@exemple.sn" />
          </label>

          {role === 'prestataire' && (
            <label className="block">
              <span className="text-sm font-medium text-secondary">Identifiant du prestataire (provider id)</span>
              <input value={providerId} onChange={(e) => setProviderId(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder="Ex : mamadou-plomberie" />
              <p className="mt-1 text-xs text-muted-foreground">Remplissez ceci pour lier votre compte au profil prestataire existant.</p>
            </label>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground">Se connecter</button>
            <Link to="/" className="text-sm text-muted-foreground">Retour</Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
