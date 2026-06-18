export type User = {
  role: 'client' | 'prestataire';
  name: string;
  email: string;
  providerId?: string;
};

export type Order = {
  id: number;
  clientEmail: string;
  providerId: string;
  serviceName: string;
  price: string;
  status: 'pending' | 'reserved' | 'on_the_way' | 'paid' | 'completed';
  etaMinutes?: number;
  reservedAt?: string;
  createdAt: string;
};

export function getUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (e) {
    return null;
  }
}

export function setUser(user: User) {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    // ignore
  }
}

export function logout() {
  try {
    localStorage.removeItem('user');
  } catch (e) {
    // ignore
  }
  // simple navigation after logout
  window.location.href = '/';
}

// Seed fake orders on first load
export function initSeedData() {
  try {
    const existing = JSON.parse(localStorage.getItem('orders') || 'null');
    if (existing !== null) return; // already seeded
    
    const now = new Date();
    const orders: Order[] = [];
    const providerIds = ['mamadou-plomberie', 'awa-electricite', 'cheikh-climatisation', 'sokhna-menage-pro', 'abdou-peinture', 'ibrahima-informatique'];
    const serviceNames = ['Réparation rapide', 'Installation complète', 'Dépannage urgent', 'Maintenance', 'Nettoyage en profondeur', 'Révision technique'];
    
    // Generate 100+ orders spread over last 6 months
    for (let i = 0; i < 120; i++) {
      const providerId = providerIds[Math.floor(Math.random() * providerIds.length)];
      const daysAgo = Math.floor(Math.random() * 180); // up to 6 months
      const price = String(Math.floor(Math.random() * 80000 + 5000)); // 5k-85k FCFA
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const status = Math.random() > 0.3 ? 'paid' : (Math.random() > 0.5 ? 'completed' : 'pending');
      
      orders.push({
        id: Date.now() + i,
        clientEmail: `client${Math.floor(Math.random() * 20)}@example.sn`,
        providerId,
        serviceName: serviceNames[Math.floor(Math.random() * serviceNames.length)],
        price,
        status: status as any,
        createdAt: date.toISOString(),
      });
    }
    
    localStorage.setItem('orders', JSON.stringify(orders));
  } catch (e) {
    // ignore
  }
}
