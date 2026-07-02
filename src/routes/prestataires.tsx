import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { getAllServices, type Service as Provider } from "@/lib/services";
import { formatFCFA } from "@/lib/providers";
import { getUser, type Order } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type Coordinates = {
  lat: number;
  lng: number;
};

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
  const t = useTranslation();
  const [filter, setFilter] = useState<Filter>("Tous");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Provider | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [reservationMessage, setReservationMessage] = useState<string | null>(null);
  const user = typeof window !== 'undefined' ? getUser() : null;

  const locateUser = useCallback(() => {
    if (!navigator.geolocation || !window.isSecureContext) {
      setLocationError(t("providers_geolocation_unavailable"));
      setLocating(false);
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError(t("providers_geolocation_permission_error"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, [t]);

  const createReservation = useCallback(
    (provider: Provider) => {
      if (user?.role !== 'client') {
        setReservationMessage(t("providers_login_to_reserve"));
        setTimeout(() => setReservationMessage(null), 4000);
        return;
      }
      setReservationMessage(t("providers_reservation_created", { name: provider.name }));
      setTimeout(() => setReservationMessage(null), 4000);
    },
    [t, user],
  );

  const list = useMemo(() => {
    return getAllServices().filter((p) => {
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
          <h1 className="text-3xl font-extrabold text-secondary md:text-4xl">{t("providers_title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("providers_subtitle")}</p>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("providers_search_placeholder")}
                className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-sm text-secondary-foreground shadow-card sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-secondary">{t("providers_compare_title")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("providers_compare_desc")}</p>
              {userLocation && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("providers_position_detected", { lat: userLocation.lat.toFixed(4), lng: userLocation.lng.toFixed(4) })}
                </p>
              )}
              {locationError && (
                <p className="mt-2 text-sm text-destructive">{locationError}</p>
              )}
              {reservationMessage && (
                <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">{reservationMessage}</div>
              )}
            </div>
            <button
              onClick={locateUser}
              disabled={locating}
              className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 sm:mt-0"
            >
              {locating ? t("providers_locating") : t("providers_locate_button")}
            </button>
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
                {f === "Tous"
                  ? t("providers_filter_all")
                  : f === "BTP"
                  ? t("providers_filter_btp")
                  : f === "Réparation"
                  ? t("providers_filter_repair")
                  : t("providers_filter_home")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {list.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t("providers_no_match")}</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <ProviderCard key={p.id} p={p} userLocation={userLocation} user={user} onOpen={() => setActive(p)} onReserve={() => createReservation(p)} />
            ))}
          </div>
        )}
      </section>

      <AiAgentConsult />

      {active && <ProviderDialog p={active} user={user} userLocation={userLocation} onClose={() => setActive(null)} onReserve={() => createReservation(active)} />}
    </SiteLayout>
  );
}

function AiAgentConsult() {
  const t = useTranslation();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("https://api.dify.ai/v1/workflows/run", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: "Bearer app-I9QEqnC78UBztsFMMaPTFp7I",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { query: q },
          response_mode: "blocking",
          user: "user-galleexpress-" + Date.now(),
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(t("providers_agent_error_generic"));
      }

      const data = await res.json();
      const outputs = data?.data?.outputs ?? null;
      if (!outputs) {
        throw new Error(t("providers_agent_error_generic"));
      }
      setResult(outputs);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(t("providers_agent_error_timeout"));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t("providers_agent_error_generic"));
      }
    } finally {
      setLoading(false);
    }
  }, [question, t]);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-lg text-primary-foreground">🤖</div>
          <div>
            <h2 className="text-lg font-bold text-secondary">{t("providers_agent_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("providers_agent_desc")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("providers_agent_placeholder")}
            className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                {t("providers_agent_busy")}
              </>
            ) : (
              <>{t("providers_agent_ask")}</>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-xl bg-muted/60 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("providers_agent_response_title")}</p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {typeof result === "string"
                ? result
                : Object.entries(result).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <span className="font-semibold text-secondary">{key}:</span>{" "}
                      <span className="text-muted-foreground">
                        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusDot({ available }: { available: boolean }) {
  const t = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${available ? "bg-success" : "bg-destructive"} ${available ? "animate-pulse" : ""}`} />
      {available ? t("providers_status_available") : t("providers_status_unavailable")}
    </span>
  );
}

function ProviderCard({ p, userLocation, user, onOpen, onReserve }: { p: Provider; userLocation: Coordinates | null; user: { role: string; email: string } | null; onOpen: () => void; onReserve: () => void }) {
  const distanceKm =
    userLocation && p.lat !== undefined && p.lng !== undefined
      ? getDistanceKm(userLocation, { lat: p.lat, lng: p.lng })
      : null;
  const t = useTranslation();

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
        {distanceKm !== null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>🚗</span>
            <span>
              {formatDistance(distanceKm)} · {t("providers_card_arrival", { time: formatTravelTime(distanceKm) })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>💰</span><span>{t("providers_card_price_from", { price: formatFCFA(p.price) })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent">⭐</span>
          <span className="font-semibold text-secondary">{p.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({p.reviews} avis)</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 pt-4 border-t border-border sm:flex-row">
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-lg border border-border text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
        >
          📞 {t("providers_call")}
        </a>
        <button
          onClick={onOpen}
          className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {t("providers_view_profile")}
        </button>
        {user?.role === 'client' && (
          <button
            onClick={onReserve}
            className="flex-1 inline-flex h-10 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground transition hover:opacity-90"
          >
            {t("providers_reserve")}
          </button>
        )}
      </div>
    </article>
  );
}

function ProviderDialog({ p, userLocation, user, onClose, onReserve }: { p: Provider; userLocation: Coordinates | null; user: { role: string; email: string } | null; onClose: () => void; onReserve: () => void }) {
  const distanceKm =
    userLocation && p.lat !== undefined && p.lng !== undefined
      ? getDistanceKm(userLocation, { lat: p.lat, lng: p.lng })
      : null;
  const t = useTranslation();

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
            <Info label={t("providers_dialog_zone")} value={p.zone} icon="📍" />
            <Info label={t("providers_dialog_price_from")} value={formatFCFA(p.price)} icon="💰" />
            <Info label={t("providers_dialog_phone")} value={p.phone} icon="📞" />
            <Info label={t("providers_dialog_status")} value={p.available ? t("providers_dialog_available") : t("providers_dialog_unavailable")} icon={p.available ? "🟢" : "🔴"} />
          </div>
          {distanceKm !== null ? (
            <div className="rounded-3xl border border-border bg-muted/40 p-4">
              <div className="mb-3 grid gap-2 text-sm text-secondary sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span>📏</span>
                  <span>{formatDistance(distanceKm)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>≈ {formatTravelTime(distanceKm)}</span>
                </div>
              </div>
              <img
                src={getStaticMapUrl(userLocation!, p)}
                alt={`Carte de la position de ${p.name}`}
                className="h-56 w-full rounded-2xl border border-border object-cover"
              />
              <p className="mt-3 text-sm text-muted-foreground">{t("providers_dialog_find_distance")}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("providers_dialog_map_prompt")}</p>
          )}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              📞 {t("providers_dialog_contact_now")}
            </a>
            {user?.role === 'client' && (
              <button
                onClick={onReserve}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-secondary text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
              >
                {t("providers_dialog_reserve")}
              </button>
            )}
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

function getDistanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng), Math.sqrt(1 - (sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng)));
  return R * c;
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatTravelTime(km: number) {
  const minutes = Math.max(10, Math.round(10 + km * 4));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function getMapZoom(distanceKm: number) {
  if (distanceKm <= 1) return 15;
  if (distanceKm <= 3) return 14;
  if (distanceKm <= 6) return 13;
  if (distanceKm <= 12) return 12;
  return 11;
}

function getStaticMapUrl(userLocation: Coordinates, p: Provider) {
  if (p.lat === undefined || p.lng === undefined) return "";
  const distanceKm = getDistanceKm(userLocation, { lat: p.lat, lng: p.lng });
  const zoom = getMapZoom(distanceKm);
  const centerLat = (userLocation.lat + p.lat) / 2;
  const centerLng = (userLocation.lng + p.lng) / 2;
  const markers = `${userLocation.lat},${userLocation.lng},blue1|${p.lat},${p.lng},red1`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=${zoom}&size=600x350&markers=${markers}`;
}

