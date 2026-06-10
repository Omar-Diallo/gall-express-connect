import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GalléExpress" },
      { name: "description", content: "Contactez l'équipe GalléExpress à Dakar pour toute question ou partenariat." },
    ],
  }),
  component: ContactPage,
});

type FormState = { name: string; email: string; phone: string; message: string };

function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim() || form.name.length > 100) e.name = "Nom requis (max 100).";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || form.email.length > 255) e.email = "E-mail invalide.";
    if (!/^[+0-9\s]{8,20}$/.test(form.phone)) e.phone = "Téléphone invalide.";
    if (!form.message.trim() || form.message.length > 1000) e.message = "Message requis (max 1000).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-extrabold text-secondary md:text-4xl">Contactez-nous</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Une question, un partenariat ou besoin d'assistance ? Notre équipe vous répond rapidement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <form onSubmit={onSubmit} className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            {sent && (
              <div className="mb-5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                ✓ Votre message a bien été envoyé. Nous vous recontacterons sous 24h.
              </div>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom complet" error={errors.name}>
                <input value={form.name} onChange={update("name")} maxLength={100} className={inputCls(errors.name)} placeholder="Awa Diop" />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <input type="email" value={form.email} onChange={update("email")} maxLength={255} className={inputCls(errors.email)} placeholder="awa@exemple.sn" />
              </Field>
              <Field label="Téléphone" error={errors.phone} className="md:col-span-2">
                <input value={form.phone} onChange={update("phone")} maxLength={20} className={inputCls(errors.phone)} placeholder="+221 77 123 45 67" />
              </Field>
              <Field label="Message" error={errors.message} className="md:col-span-2">
                <textarea value={form.message} onChange={update("message")} maxLength={1000} rows={5} className={inputCls(errors.message)} placeholder="Comment pouvons-nous vous aider ?" />
              </Field>
            </div>
            <button type="submit" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 sm:w-auto">
              Envoyer le message →
            </button>
          </form>

          <aside className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-elegant">
              <h3 className="text-lg font-bold">GalléExpress</h3>
              <p className="mt-1 text-sm text-secondary-foreground/70">Notre siège</p>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3"><span className="text-accent text-lg">📍</span><span>Dakar, Sénégal</span></li>
                <li className="flex items-start gap-3"><span className="text-accent text-lg">✉️</span><a href="mailto:contact@galleexpress.sn" className="hover:text-accent">contact@galleexpress.sn</a></li>
                <li className="flex items-start gap-3"><span className="text-accent text-lg">📞</span><a href="tel:+221771234567" className="hover:text-accent">+221 77 123 45 67</a></li>
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
