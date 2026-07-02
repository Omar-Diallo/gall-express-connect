import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GalléExpress" },
      { name: "description", content: "Contactez l'équipe GalléExpress pour toute question, partenariat ou support client." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const t = useTranslation();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-extrabold text-secondary md:text-4xl">{t("contact_title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("contact_subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="text-xl font-semibold text-secondary">{t("contact_write_us_title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("contact_write_us_desc")}</p>
            <ul className="mt-6 space-y-4 text-sm text-secondary-foreground">
              <li className="flex items-start gap-3"><span className="text-accent text-lg">✉️</span><a href="mailto:contact@galleexpress.sn" className="hover:text-accent">contact@galleexpress.sn</a></li>
              <li className="flex items-start gap-3"><span className="text-accent text-lg">📞</span><a href="tel:+221771234567" className="hover:text-accent">+221 77 123 45 67</a></li>
              <li className="flex items-start gap-3"><span className="text-accent text-lg">📍</span><span>Dakar, Sénégal</span></li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="text-xl font-semibold text-secondary">{t("contact_social_title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("contact_social_desc")}</p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="https://facebook.com/galleexpress" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary hover:text-primary">
                <span className="text-lg">f</span>
                <span>Facebook</span>
              </a>
              <a href="https://instagram.com/galleexpress" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary hover:text-primary">
                <span className="text-lg">◎</span>
                <span>Instagram</span>
              </a>
              <a href="https://linkedin.com/company/galleexpress" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border p-4 transition hover:border-primary hover:text-primary">
                <span className="text-lg">in</span>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-secondary p-8 shadow-card">
            <h2 className="text-xl font-semibold text-secondary">{t("contact_provider_title")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("contact_provider_desc")}</p>
            <Link
              to="/proposer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              {t("contact_provider_cta")}
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
