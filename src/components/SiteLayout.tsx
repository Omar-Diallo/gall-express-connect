import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const linkBase = "px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-lg font-extrabold tracking-tight text-secondary">
            Gallé<span className="text-primary">Express</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }} activeOptions={{ exact: true }}>Accueil</Link>
          <Link to="/prestataires" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }}>Prestataires</Link>
          <Link to="/contact" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }}>Contact</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-extrabold">GalléExpress</span>
          </div>
          <p className="mt-3 text-sm text-secondary-foreground/70">
            La plateforme qui connecte clients et prestataires de confiance au Sénégal.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Liens</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            <li><a href="#" className="hover:text-accent">Mentions légales</a></li>
            <li><a href="#" className="hover:text-accent">Politique de confidentialité</a></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">Suivez-nous</h4>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">f</a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">◎</a>
            <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">in</a>
          </div>
          <p className="mt-4 text-xs text-secondary-foreground/60">© {new Date().getFullYear()} GalléExpress. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
