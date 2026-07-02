import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getUser, logout } from "@/lib/auth";
import { LocaleProvider, useLocale, useTranslation, locales } from "@/lib/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}

function Header() {
  const linkBase = "px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
  const user = typeof window !== 'undefined' ? getUser() : null;
  const { locale, setLocale } = useLocale();
  const t = useTranslation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-lg font-extrabold tracking-tight text-secondary">
            Gallé<span className="text-primary">Express</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            <Link to="/" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }} activeOptions={{ exact: true }}>{t("nav_home")}</Link>
            <Link to="/prestataires" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }}>{t("nav_providers")}</Link>
            <Link to="/contact" className={linkBase} activeProps={{ className: `${linkBase} text-primary` }}>{t("nav_contact")}</Link>
            {user ? (
              <>
                <Link to="/dashboard" className={linkBase}>{user.name} ({user.role})</Link>
                <button onClick={() => logout()} className="ml-2 rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10">{t("nav_logout")}</button>
              </>
            ) : (
              <Link to="/login" className={`${linkBase} border border-border bg-card`}>{t("nav_login")}</Link>
            )}
          </nav>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${locale === loc ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-primary/10"}`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const t = useTranslation();
  return (
    <footer className="mt-16 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-extrabold">GalléExpress</span>
          </div>
          <p className="mt-3 text-sm text-secondary-foreground/70">
            {t("footer_description")}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">{t("footer_links")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            <li><a href="#" className="hover:text-accent">{t("footer_legal")}</a></li>
            <li><a href="#" className="hover:text-accent">{t("footer_privacy")}</a></li>
            <li><Link to="/contact" className="hover:text-accent">{t("nav_contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">{t("footer_follow")}</h4>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">f</a>
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">◎</a>
            <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-secondary transition">in</a>
          </div>
          <p className="mt-4 text-xs text-secondary-foreground/60">{t("footer_rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
