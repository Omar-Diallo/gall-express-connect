import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { getUser } from "@/lib/auth";
import { formatFCFA } from "@/lib/providers";
import { getAllServices, saveService, deleteService, type Service } from "@/lib/services";
import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import type { Order } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — GalléExpress" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const t = useTranslation();
  const user = typeof window !== 'undefined' ? getUser() : null;
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('orders') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [services, setServices] = useState<Service[]>(() => getAllServices());

  if (!user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-xl font-bold">{t("dashboard_not_authenticated_title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("dashboard_not_authenticated_description")}</p>
          <div className="mt-6">
            <Link to="/login" className="inline-flex rounded-xl bg-primary px-6 py-3 text-white">{t("dashboard_login_button")}</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">{t("dashboard_title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(user.role === 'client' ? "dashboard_welcome_client" : "dashboard_welcome_provider", { name: user.name })}
          </p>
        </div>

        {user.role === 'client' ? (
          <ClientView userEmail={user.email} orders={orders} setOrders={setOrders} />
        ) : (
          <PrestataireView user={user} orders={orders} setOrders={setOrders} services={services} setServices={setServices} />
        )}
      </div>
    </SiteLayout>
  );
}

function ClientView({ userEmail, orders, setOrders }: { userEmail: string; orders: Order[]; setOrders: (o: Order[]) => void }) {
  const [providerId, setProviderId] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');

  const createOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const ord: Order = { id: Date.now(), clientEmail: userEmail, providerId, serviceName, price, status: 'pending', createdAt: new Date().toISOString() };
    const updated = [...orders, ord];
    try {
      localStorage.setItem('orders', JSON.stringify(updated));
    } catch (e) {}
    setOrders(updated);
    setProviderId(''); setServiceName(''); setPrice('');
  };

  const myOrders = orders.filter((o) => o.clientEmail === userEmail);
  const totalSpent = myOrders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + Number(o.price || 0), 0);

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'reserved':
        return 'Réservé';
      case 'on_the_way':
        return 'En route';
      case 'pending':
        return 'En attente';
      case 'paid':
        return 'Payée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'reserved':
      case 'on_the_way':
        return 'text-primary';
      case 'pending':
        return 'text-muted-foreground';
      case 'paid':
        return 'text-success';
      case 'completed':
        return 'text-secondary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getProviderName = (providerId: string) => {
    return getAllServices().find((p) => p.id === providerId)?.name || providerId;
  };

  const formatEta = (etaMinutes?: number) => {
    if (!etaMinutes) return null;
    if (etaMinutes < 60) return `${etaMinutes} min`;
    const hours = Math.floor(etaMinutes / 60);
    const rest = etaMinutes % 60;
    return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t("dashboard_create_order_title")}</h2>
          <form onSubmit={createOrder} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-secondary mb-2 block">{t("dashboard_create_order_provider")}</span>
                <select value={providerId} onChange={(e)=>setProviderId(e.target.value)} required className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="">{t("dashboard_select_provider_placeholder")}</option>
                  {getAllServices().map((p)=> <option key={p.id} value={p.id}>{p.name} — {p.zone}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-secondary mb-2 block">{t("dashboard_create_order_service")}</span>
                <input value={serviceName} onChange={(e)=>setServiceName(e.target.value)} required className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_order_service_placeholder")} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-secondary mb-2 block">{t("dashboard_create_order_price")}</span>
              <input value={price} onChange={(e)=>setPrice(e.target.value)} required className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_order_price_placeholder")} />
            </label>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">{t("dashboard_create_order_submit")}</button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">{t("dashboard_my_orders_title", { count: myOrders.length })}</h2>
          <div className="space-y-3">
            {myOrders.length === 0 ? 
              <div className="text-sm text-muted-foreground py-6 text-center">{t("dashboard_no_orders")}</div> 
              : myOrders.slice().reverse().map(o=> (
              <div key={o.id} className="rounded-xl border border-border bg-muted/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{o.serviceName}</div>
                  <div className="text-xs text-muted-foreground">{t("dashboard_prestataire", { name: getProviderName(o.providerId) })}</div>
                  {o.etaMinutes && (
                    <div className="mt-2 text-xs text-secondary">
                      {t("dashboard_order_eta", { eta: formatEta(o.etaMinutes) })}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold">{o.price} FCFA</div>
                  <div className={`text-xs font-medium ${getStatusClass(o.status)}`}>
                    {getStatusLabel(o.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">{t("dashboard_total_spent")}</div>
          <div className="mt-3 text-3xl font-bold text-secondary">{formatFCFA(totalSpent)}</div>
          <div className="mt-2 text-xs text-muted-foreground">{t("dashboard_paid_orders", { count: myOrders.filter(o=>o.status==='paid').length })}</div>
        </div>
      </div>
    </div>
  );
}

function PrestataireView({ user, orders, setOrders, services, setServices }: { user: any; orders: Order[]; setOrders: (o: Order[]) => void; services: Service[]; setServices: (s: Service[]) => void }) {
  const t = useTranslation();
  const myOrders = useMemo(() => orders.filter((o)=> o.providerId === (user.providerId || '')), [orders, user.providerId]);
  const myServices = useMemo(() => services.filter((s)=> s.ownerId === user.providerId || s.id === user.providerId), [services, user.providerId]);
  const paidOrders = useMemo(() => myOrders.filter(o=>o.status === 'paid'), [myOrders]);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyOrders = useMemo(() => 
    paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [paidOrders, currentMonth, currentYear]);
  
  const yearlyOrders = useMemo(() =>
    paidOrders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear;
    }), [paidOrders, currentYear]);

  const totalPaid = useMemo(() => paidOrders.reduce((s, o)=> s + Number(o.price || 0), 0), [paidOrders]);
  const monthlyRevenue = useMemo(() => monthlyOrders.reduce((s, o)=> s + Number(o.price || 0), 0), [monthlyOrders]);
  const yearlyRevenue = useMemo(() => yearlyOrders.reduce((s, o)=> s + Number(o.price || 0), 0), [yearlyOrders]);
  const pendingOrders = useMemo(() => myOrders.filter(o=>o.status === 'pending'), [myOrders]);

  const serviceCount = myServices.length;
  const activeServices = myServices.filter((s)=> s.available && !s.disabled).length;
  const inactiveServices = serviceCount - activeServices;
  const serviceRevenue = useMemo(() => myServices.map((service) => {
    const serviceOrders = myOrders.filter((o)=> o.serviceName === service.name && o.status === 'paid');
    return {
      service,
      revenue: serviceOrders.reduce((sum, order) => sum + Number(order.price || 0), 0),
      orders: serviceOrders.length,
    };
  }).sort((a, b) => b.revenue - a.revenue), [myOrders, myServices]);
  const topService = serviceRevenue[0];

  const [serviceId, setServiceId] = useState<string>("");
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<"BTP" | "Réparation" | "Services à domicile">("BTP");
  const [zone, setZone] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [servicePhone, setServicePhone] = useState(user.email);
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(true);
  const [message, setMessage] = useState("");

  const markPaid = (orderId: number) => {
    const updated = orders.map((order) => order.id === orderId ? { ...order, status: 'paid' } : order);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const markCompleted = (orderId: number) => {
    const updated = orders.map((order) => order.id === orderId ? { ...order, status: 'completed' } : order);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const emojiMap: Record<string, string> = {
    BTP: "🛠️",
    Réparation: "🔧",
    "Services à domicile": "🧹",
  };

  const beginEdit = (service: Service) => {
    setServiceId(service.id);
    setServiceName(service.name);
    setCategory(service.category);
    setZone(service.zone);
    setServicePrice(String(service.price));
    setServicePhone(service.phone);
    setDescription(service.description);
    setAvailable(service.available);
    setMessage("Édition du service en cours.");
  };

  const clearForm = () => {
    setServiceId("");
    setServiceName("");
    setCategory("BTP");
    setZone("");
    setServicePrice("");
    setServicePhone(user.email);
    setDescription("");
    setAvailable(true);
    setMessage("");
  };

  const saveServiceHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (!serviceName.trim() || !zone.trim() || !servicePrice.trim()) {
      setMessage("Veillez compléter le nom du service, la zone et le prix.");
      return;
    }

    const service: Service = {
      id: serviceId || `${user.providerId}-${Date.now()}`,
      ownerId: user.providerId,
      name: serviceName,
      category,
      zone,
      price: Number(servicePrice.replace(/[^0-9.]/g, "")) || 0,
      available,
      phone: servicePhone,
      rating: 4.8,
      reviews: 0,
      description,
      emoji: emojiMap[category] || "🛠️",
    };

    saveService(service);
    const updated = getAllServices();
    setServices(updated);
    setMessage("Service enregistré avec succès.");
    clearForm();
  };

  const removeService = (service: Service) => {
    deleteService(service.id, user.providerId);
    const updated = getAllServices();
    setServices(updated);
    setMessage(service.id === user.providerId ? "Service principal désactivé." : "Service supprimé.");
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Revenu total" value={formatFCFA(totalPaid)} icon="💰" />
        <StatCard label="Revenu mensuel" value={formatFCFA(monthlyRevenue)} icon="📅" />
        <StatCard label="Revenu annuel" value={formatFCFA(yearlyRevenue)} icon="📊" />
        <StatCard label="Services actifs" value={String(activeServices)} icon="✅" />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Commandes reçues ({myOrders.length})</h2>
                <p className="text-sm text-muted-foreground">Visualisez et suivez les commandes de vos services.</p>
              </div>
              <div className="text-xs text-muted-foreground">Prestataire: {user.name}</div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {myOrders.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">Aucune commande pour le moment.</div>
              ) : myOrders.slice().reverse().map((o) => (
                <div key={o.id} className={`rounded-xl border p-4 ${o.status === 'paid' ? 'border-success/30 bg-success/5' : o.status === 'completed' ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{o.serviceName}</div>
                      <div className="text-xs text-muted-foreground mt-1">Client: {o.clientEmail}</div>
                      <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString('fr-FR')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{o.price} FCFA</div>
                      <div className={`text-xs font-medium mt-2 ${o.status === 'paid' ? 'text-success' : o.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {o.status === 'paid' ? t("dashboard_order_status_paid") : o.status === 'completed' ? t("dashboard_order_status_completed") : t("dashboard_order_status_pending")}
                      </div>
                    </div>
                  </div>
                  {o.status !== 'completed' && (
                    <div className="mt-3 flex gap-2">
                      {o.status === 'pending' && <button onClick={() => markPaid(o.id)} className="text-xs rounded-md bg-primary/10 px-3 py-1 text-primary hover:bg-primary/20">{t("dashboard_order_mark_paid")}</button>}
                      {o.status === 'paid' && <button onClick={() => markCompleted(o.id)} className="text-xs rounded-md bg-success/10 px-3 py-1 text-success hover:bg-success/20">{t("dashboard_order_mark_completed")}</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">{t("dashboard_manage_services_title")}</h2>
                <p className="text-sm text-muted-foreground">{t("dashboard_manage_services_desc")}</p>
              </div>
              <div className="text-xs text-muted-foreground">{t("dashboard_services_count", { count: serviceCount })}</div>
            </div>

            <div className="space-y-3">
              {myServices.length === 0 ? (
                <div className="text-sm text-muted-foreground rounded-xl border border-border bg-muted/40 p-4">{t("dashboard_no_services_empty")}</div>
              ) : myServices.map((service) => (
                <div key={service.id} className="rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold">{service.name}</div>
                      <div className="text-xs text-muted-foreground">{service.category} • {service.zone}</div>
                      <div className="text-xs text-muted-foreground">{service.available ? t("dashboard_provider_available") : t("dashboard_provider_unavailable")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatFCFA(service.price)}</div>
                      <div className="text-xs text-muted-foreground">{service.reviews} avis</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => beginEdit(service)} className="rounded-md border border-border bg-card px-3 py-1 text-xs text-secondary hover:bg-primary/5">{t("dashboard_service_button_edit")}</button>
                    <button onClick={() => removeService(service)} className="rounded-md border border-destructive bg-destructive/10 px-3 py-1 text-xs text-destructive hover:bg-destructive/20">{service.id === user.providerId ? t("dashboard_service_button_disable") : t("dashboard_service_button_delete")}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">{t("dashboard_add_service_title")}</h3>
            {message && <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div>}
            <form onSubmit={saveServiceHandler} className="space-y-4">
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_name")}</span>
                <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_service_form_name_placeholder")} />
              </label>
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_category")}</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="BTP">BTP</option>
                  <option value="Réparation">Réparation</option>
                  <option value="Services à domicile">Services à domicile</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_zone")}</span>
                <input value={zone} onChange={(e) => setZone(e.target.value)} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_service_form_zone_placeholder")} />
              </label>
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_price")}</span>
                <input value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_service_form_price_placeholder")} />
              </label>
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_phone")}</span>
                <input value={servicePhone} onChange={(e) => setServicePhone(e.target.value)} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_service_form_phone_placeholder")} />
              </label>
              <label className="block text-sm">
                <span className="text-sm font-medium text-secondary">{t("dashboard_service_form_description")}</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder={t("dashboard_service_form_description_placeholder")} ></textarea>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="h-4 w-4 rounded border border-border text-primary focus:ring-primary" />
                {t("dashboard_service_form_available")}
              </label>
              <button type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90">{t("dashboard_service_form_save")}</button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">{t("dashboard_services_report_title")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("dashboard_services_report_active")}</span><span className="font-medium">{activeServices}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("dashboard_services_report_inactive")}</span><span className="font-medium">{inactiveServices}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("dashboard_services_report_top")}</span><span className="font-medium">{topService ? topService.service.name : '--'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("dashboard_services_report_top_revenue")}</span><span className="font-medium">{topService ? formatFCFA(topService.revenue) : '--'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold text-secondary">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
