import { providers, type Provider } from "@/lib/providers";

const STORAGE_KEY = "galleexpress_services";

export type Service = Provider & {
  ownerId?: string;
  disabled?: boolean;
};

export function getLocalServices(): Service[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

export function setLocalServices(services: Service[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (e) {
    // ignore
  }
}

export function getAllServices(): Service[] {
  const localServices = getLocalServices();
  const merged = providers.map((staticProvider) => {
    const override = localServices.find((service) => service.id === staticProvider.id);
    return override || staticProvider;
  });
  const extra = localServices.filter((service) => !providers.some((staticProvider) => staticProvider.id === service.id));
  return [...merged, ...extra];
}

export function getServicesByOwner(ownerId: string): Service[] {
  if (!ownerId) return [];
  return getAllServices().filter((service) => service.ownerId === ownerId || service.id === ownerId);
}

export function saveService(service: Service) {
  const services = getLocalServices();
  const next = services.filter((item) => item.id !== service.id);
  next.push(service);
  setLocalServices(next);
}

export function deleteService(serviceId: string, ownerId?: string) {
  const services = getLocalServices();
  const isStatic = providers.some((provider) => provider.id === serviceId);
  if (isStatic) {
    const existing = services.find((item) => item.id === serviceId);
    const disabledService: Service = {
      ...providers.find((p) => p.id === serviceId)!,
      ownerId,
      available: false,
      disabled: true,
    };
    const next = services.filter((item) => item.id !== serviceId);
    next.push(disabledService);
    setLocalServices(next);
  } else {
    const next = services.filter((item) => item.id !== serviceId);
    setLocalServices(next);
  }
}

export function ensureOwnerId(service: Service, ownerId: string) {
  return { ...service, ownerId };
}
