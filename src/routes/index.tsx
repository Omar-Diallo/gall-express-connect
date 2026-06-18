import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { getUser, initSeedData } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GalléExpress — Trouvez rapidement le prestataire qu'il vous faut" },
      { name: "description", content: "Plateforme sénégalaise de mise en relation entre clients et prestataires de services qualifiés." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  useEffect(() => {
    initSeedData();
  }, []);

  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <Categories />
    </SiteLayout>
  );
}

function Hero() {
  const user = typeof window !== 'undefined' ? getUser() : null;
  const isClientLoggedIn = user?.role === 'client';
  const fallingItems = [
    { icon: '🔑', label: 'Clés' },
    { icon: '🔨', label: 'Marteau' },
    { icon: '🪛', label: 'Tournevis' },
    { icon: '🧰', label: 'Trousse' },
    { icon: '🪚', label: 'Scie' },
    { icon: '🔩', label: 'Boulon' },
    { icon: '🧲', label: 'Aimant' },
    { icon: '🪝', label: 'Crochet' },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="hero-fall absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {fallingItems.map((item, index) => (
          <span
            key={`${item.label}-${index}`}
            className="hero-fall-item"
            style={{
              left: `${6 + (index % 5) * 18}%`,
              animationDelay: `${index * 0.3}s`,
              animationDuration: `${5 + (index % 4) * 0.8}s`,
              opacity: 0.95 - index * 0.06,
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> 500+ prestataires disponibles maintenant
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-secondary md:text-6xl">
            Trouvez rapidement le <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">prestataire</span> qu'il vous faut
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            GalléExpress connecte les clients aux meilleurs professionnels près de chez eux en quelques clics.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/prestataires"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 hover:-translate-y-0.5"
            >
              Trouver un prestataire →
            </Link>
            {!isClientLoggedIn && (
              <Link
                to="/proposer"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
              >
                Proposer mes services
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function useCount(target: number, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const n = useCount(value);
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="text-4xl font-extrabold text-primary md:text-5xl">
        {n.toLocaleString("fr-FR")}{suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-5 md:grid-cols-3">
        <Stat value={500} suffix="+" label="Prestataires actifs" />
        <Stat value={2000} suffix="+" label="Missions réalisées" />
        <Stat value={98} suffix="%" label="Satisfaction client" />
      </div>
    </section>
  );
}

function Categories() {
  const items = [
    { emoji: "🏗️", title: "BTP", desc: "Plomberie, électricité, peinture, maçonnerie." },
    { emoji: "🛠️", title: "Réparation", desc: "Climatisation, électroménager, informatique." },
    { emoji: "🏠", title: "Services à domicile", desc: "Ménage, jardinage, garde d'enfants." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-secondary md:text-4xl">Nos catégories phares</h2>
        <p className="mt-3 text-muted-foreground">Des professionnels qualifiés pour tous vos besoins.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl">{it.emoji}</div>
            <h3 className="mt-4 text-lg font-semibold text-secondary">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            <Link to="/prestataires" className="mt-4 inline-flex text-sm font-semibold text-primary group-hover:underline">Découvrir →</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
