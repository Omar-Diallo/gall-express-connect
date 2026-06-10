export type Provider = {
  id: string;
  name: string;
  category: "BTP" | "Réparation" | "Services à domicile";
  zone: string;
  price: number;
  available: boolean;
  phone: string;
  rating: number;
  reviews: number;
  description: string;
  emoji: string;
};

export const providers: Provider[] = [
  {
    id: "mamadou-plomberie",
    name: "Mamadou Plomberie",
    category: "BTP",
    zone: "Parcelles Assainies, Dakar",
    price: 15000,
    available: true,
    phone: "+221 77 234 56 78",
    rating: 4.8,
    reviews: 124,
    description: "Plombier expérimenté, dépannage urgent, installation sanitaire et réparation de fuites.",
    emoji: "🔧",
  },
  {
    id: "awa-electricite",
    name: "Awa Électricité",
    category: "BTP",
    zone: "Pikine, Dakar",
    price: 20000,
    available: true,
    phone: "+221 76 345 67 89",
    rating: 4.9,
    reviews: 87,
    description: "Électricienne certifiée, installation, mise aux normes et dépannage 7j/7.",
    emoji: "⚡",
  },
  {
    id: "cheikh-climatisation",
    name: "Cheikh Climatisation",
    category: "Réparation",
    zone: "Guédiawaye, Dakar",
    price: 25000,
    available: false,
    phone: "+221 78 456 78 90",
    rating: 4.6,
    reviews: 56,
    description: "Installation, entretien et réparation de climatiseurs split et centralisés.",
    emoji: "❄️",
  },
  {
    id: "sokhna-menage-pro",
    name: "Sokhna Ménage Pro",
    category: "Services à domicile",
    zone: "Ouakam, Dakar",
    price: 10000,
    available: true,
    phone: "+221 70 567 89 01",
    rating: 5.0,
    reviews: 213,
    description: "Service de ménage professionnel : nettoyage en profondeur, repassage et entretien.",
    emoji: "🧹",
  },
  {
    id: "abdou-peinture",
    name: "Abdou Peinture Bâtiment",
    category: "BTP",
    zone: "Rufisque, Dakar",
    price: 30000,
    available: true,
    phone: "+221 77 678 90 12",
    rating: 4.7,
    reviews: 92,
    description: "Peinture intérieure et extérieure, finitions décoratives et rénovation complète.",
    emoji: "🎨",
  },
  {
    id: "ibrahima-informatique",
    name: "Ibrahima Réparation Informatique",
    category: "Réparation",
    zone: "Liberté 6, Dakar",
    price: 12000,
    available: true,
    phone: "+221 78 789 01 23",
    rating: 4.9,
    reviews: 178,
    description: "Réparation PC et Mac, récupération de données, installation logicielle et formation.",
    emoji: "💻",
  },
];

export const formatFCFA = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;
