export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  verified: boolean;
  plan: 'free' | 'gamer' | 'pro' | 'elite';
  totalSales: number;
  joinDate: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'accounts' | 'skins' | 'giftcards' | 'services';
  game: string;
  images: string[];
  seller: User;
  featured: boolean;
  condition: 'new' | 'used' | 'excellent';
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  badge: string;
  color: string;
}