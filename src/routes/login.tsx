import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { setUser, initSeedData } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Connexion — GalléExpress" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const t = useTranslation();
  const [role, setRole] = useState<'client' | 'prestataire'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [providerId, setProviderId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ role, name: name || (email.split('@')[0] ?? 'User'), email, providerId: role === 'prestataire' ? providerId : undefined });
    initSeedData();
    window.location.href = role === 'client' ? '/' : '/dashboard';
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-secondary">{t("login_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("login_subtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex gap-2">
            <label className="inline-flex items-center gap-2"><input type="radio" name="role" checked={role === 'client'} onChange={() => setRole('client')} /> {t("login_role_client")}</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="role" checked={role === 'prestataire'} onChange={() => setRole('prestataire')} /> {t("login_role_provider")}</label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-secondary">{t("login_name")}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder={t("login_name")} />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-secondary">{t("login_email")}</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder="email@exemple.sn" />
          </label>

          {role === 'prestataire' && (
            <label className="block">
              <span className="text-sm font-medium text-secondary">{t("login_provider_id")}</span>
              <input value={providerId} onChange={(e) => setProviderId(e.target.value)} className="mt-1 w-full rounded-xl border border-border px-4 py-3" placeholder="Ex : mamadou-plomberie" />
              <p className="mt-1 text-xs text-muted-foreground">{t("login_provider_help")}</p>
            </label>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground">{t("login_submit")}</button>
            <Link to="/" className="text-sm text-muted-foreground">{t("login_back")}</Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
