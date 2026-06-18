import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";

type FormState = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  zone: string;
  phone: string;
  email: string;
  available: boolean;
};

export const Route = createFileRoute("/proposer")({
  head: () => ({
    meta: [
      { title: "Proposer un service — GalléExpress" },
      { name: "description", content: "Proposez un nouveau service sur GalléExpress et rejoignez notre réseau de prestataires vérifiés." },
    ],
  }),
  component: ProposerPage,
});

function ProposerPage() {
  const [form, setForm] = useState<FormState>({
    serviceName: "",
    category: "",
    description: "",
    price: "",
    zone: "",
    phone: "",
    email: "",
    available: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value } as unknown as FormState));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.serviceName.trim() || form.serviceName.length > 150) e.serviceName = "Nom du service requis (max 150).";
    if (!form.category) e.category = "Catégorie requise.";
    if (!form.description.trim() || form.description.length > 2000) e.description = "Description requise (max 2000).";
    if (!/^[0-9]+(?:[.,][0-9]+)?$/.test(form.price) || form.price.length > 15) e.price = "Prix invalide.";
    if (!form.zone.trim() || form.zone.length > 100) e.zone = "Zone requise (max 100).";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || form.email.length > 255) e.email = "E-mail invalide.";
    if (!/^[+0-9\s]{8,20}$/.test(form.phone)) e.phone = "Téléphone invalide.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('proposedServices') || '[]');
      existing.push({
        id: Date.now(),
        serviceName: form.serviceName,
        category: form.category,
        description: form.description,
        price: form.price,
        zone: form.zone,
        phone: form.phone,
        email: form.email,
        available: form.available,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('proposedServices', JSON.stringify(existing));
    } catch {
      // ignore localStorage errors
    }

    setSent(true);
    setForm({ serviceName: "", category: "", description: "", price: "", zone: "", phone: "", email: "", available: true });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-extrabold text-secondary md:text-4xl">Proposer un service</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Remplissez ce formulaire si vous êtes prestataire et souhaitez proposer un service ou un nouveau service sur GalléExpress.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <form onSubmit={onSubmit} className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            {sent && (
              <div className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                ✓ Votre service a bien été proposé. Il sera visible après validation.
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom du service" error={errors.serviceName}>
                <input value={form.serviceName} onChange={update("serviceName")} maxLength={150} className={inputCls(errors.serviceName)} placeholder="Ex : Réparation de climatiseur" />
              </Field>

              <Field label="Catégorie" error={errors.category}>
                <select value={form.category} onChange={update("category")} className={inputCls(errors.category)}>
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="BTP">BTP</option>
                  <option value="Réparation">Réparation</option>
                  <option value="Services à domicile">Services à domicile</option>
                </select>
              </Field>

              <Field label="Prix (FCFA)" error={errors.price} className="md:col-span-2">
                <input value={form.price} onChange={update("price")} maxLength={15} className={inputCls(errors.price)} placeholder="Ex : 15000" />
              </Field>

              <Field label="Zone" error={errors.zone}>
                <input value={form.zone} onChange={update("zone")} maxLength={100} className={inputCls(errors.zone)} placeholder="Ex : Dakar, Pikine" />
              </Field>

              <Field label="Téléphone" error={errors.phone}>
                <input value={form.phone} onChange={update("phone")} maxLength={20} className={inputCls(errors.phone)} placeholder="+221 77 123 45 67" />
              </Field>

              <Field label="E-mail" error={errors.email}>
                <input type="email" value={form.email} onChange={update("email")} maxLength={255} className={inputCls(errors.email)} placeholder="contact@monservice.sn" />
              </Field>

              <label className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" checked={form.available} onChange={update('available' as keyof FormState)} className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Disponible immédiatement</span>
              </label>

              <Field label="Description" error={errors.description} className="md:col-span-2">
                <textarea value={form.description} onChange={update("description")} maxLength={2000} rows={6} className={inputCls(errors.description)} placeholder="Décrivez votre service, vos compétences et votre expérience." />
              </Field>
            </div>
            <button type="submit" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 sm:w-auto">
              Ajouter le service →
            </button>
          </form>

          <aside className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-elegant">
              <h3 className="text-lg font-bold">GalléExpress</h3>
              <p className="mt-1 text-sm text-secondary-foreground/70">Notre siège</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3"><span className="text-accent text-lg">📍</span><span>Dakar, Sénégal</span></li>
                <li className="flex items-start gap-3"><span className="text-accent text-lg">✉️</span><span className="break-words">contact@galleexpress.sn</span></li>
                <li className="flex items-start gap-3"><span className="text-accent text-lg">📞</span><span>+221 77 123 45 67</span></li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h4 className="font-semibold text-secondary">Horaires</h4>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex justify-between"><span>Lun – Ven</span><span className="font-medium text-secondary">8h – 19h</span></li>
                <li className="flex justify-between"><span>Samedi</span><span className="font-medium text-secondary">9h – 17h</span></li>
                <li className="flex justify-between"><span>Dimanche</span><span className="font-medium text-secondary">Fermé</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    error ? "border-destructive focus:ring-destructive/20" : "border-border focus:border-primary focus:ring-primary/20"
  }`;
}

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-secondary">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}
