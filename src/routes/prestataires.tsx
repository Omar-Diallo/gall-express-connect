import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { providers, formatFCFA, type Provider } from "@/lib/providers";

export const Route = createFileRoute("/prestataires")({
  head: () => ({
    meta: [
      { title: "Prestataires — GalléExpress" },
      { name: "description", content: "Découvrez les prestataires vérifiés de GalléExpress à Dakar : BTP, réparation, services à domicile." },
    ],
  }),
  component: ProvidersPage,
});

const filters = ["Tous", "BTP", "Réparation", "Services à domicile"] as const;
type Filter = (typeof filters)[number];

function ProvidersPage() {
  const [filter, setFilter] = useState<Filter>("Tous");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Provider | null>(null);

  const list = useMemo(() => {
    return providers.filter((p) => {
      const matchFilter = filter === "Tous" || p.category === filter;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || p.name.toLowerCase().includes(q) || p.zone.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query]);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-extrabold text-secondary md:text-4xl">Nos prestataires</h1>
          <p className="mt-2 text-muted-foreground">Professionnels vérifiés et notés par la communauté.</p>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un prestataire ou une zone…"
                className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "border border-border bg-card text-foreground/70 hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {list.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Aucun prestataire ne correspond à votre recherche.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProviderCard key={p.id} p={p} onOpen={() => setActive(p)} />
            ))}
          </div>
        )}
      </section>

      {active && <ProviderDialog p={active} onClose={() => setActive(null)} />}
    </SiteLayout>
  );
}

function StatusDot({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${available ? "bg-success" : "bg-destructive"} ${available ? "animate-pulse" : ""}`} />
      {available ? "Disponible" : "Indisponible"}
    </span>
  );
}

function ProviderCard({ p, onOpen }: { p: Provider; onOpen: () => void }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-2xl">
            {p.emoji}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-secondary">{p.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{p.category}</p>
          </div>
        </div>
        <StatusDot available={p.available} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>📍</span><span className="truncate">{p.zone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>💰</span><span>À partir de <strong className="text-secondary">{formatFCFA(p.price)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent">⭐</span>
          <span className="font-semibold text-secondary">{p.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({p.reviews} avis)</span>
        </div>
      </div>

      <div className="mt-5 flex gap-2 pt-4 border-t border-border">
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-lg border border-border text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
        >
          📞 Appeler
        </a>
        <button
          onClick={onOpen}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Voir profil
        </button>
      </div>
    </article>
  );
}

function ProviderDialog({ p, onClose }: { p: Provider; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-secondary/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-primary to-secondary p-6 text-primary-foreground">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-3xl">{p.emoji}</div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{p.name}</h2>
              <p className="text-sm text-primary-foreground/80">{p.category}</p>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="text-accent">⭐</span>
                <span className="font-semibold">{p.rating.toFixed(1)}</span>
                <span className="text-primary-foreground/70">({p.reviews} avis)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{p.description}</p>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Zone" value={p.zone} icon="📍" />
            <Info label="Tarif de départ" value={formatFCFA(p.price)} icon="💰" />
            <Info label="Téléphone" value={p.phone} icon="📞" />
            <Info label="Statut" value={p.available ? "Disponible" : "Indisponible"} icon={p.available ? "🟢" : "🔴"} />
          </div>
          <div className="flex gap-2 pt-2">
            <a
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              📞 Contacter maintenant
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{icon} {label}</div>
      <div className="mt-0.5 text-sm font-semibold text-secondary">{value}</div>
    </div>
  );
}
