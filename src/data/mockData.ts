// This file now serves as type definitions and will be replaced by Supabase data
import { Product, User, Plan } from '../types';

// These are now just for TypeScript types - actual data comes from Supabase
export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    features: ['5 anúncios ativos', 'Taxa de 15%', 'Suporte básico'],
    badge: 'Starter',
    color: 'gray'
  },
  {
    id: 'gamer',
    name: 'Gamer',
    price: 29,
    features: ['+50% visibilidade', 'Taxa de 10%', 'Suporte prioritário', 'Selo Premium'],
    badge: 'Popular',
    color: 'purple'
  },
  {
    id: 'pro',
    name: 'Pro Player',
    price: 59,
    features: ['Anúncios em destaque', 'Taxa de 5%', 'Relatórios avançados', 'Selo Pro'],
    badge: 'Recomendado',
    color: 'cyan'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    features: ['Sempre no topo', 'Taxa zero', 'Selo Top Seller', 'Cashback'],
    badge: 'Premium',
    color: 'green'
  }
];

export const games = [
  { name: 'Free Fire', icon: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Valorant', icon: '🎯', color: 'from-red-500 to-pink-500' },
  { name: 'Fortnite', icon: '🏆', color: 'from-blue-500 to-cyan-500' },
  { name: 'Roblox', icon: '🎮', color: 'from-green-500 to-emerald-500' },
  { name: 'CS:GO', icon: '💎', color: 'from-yellow-500 to-orange-500' },
  { name: 'League of Legends', icon: '⚡', color: 'from-purple-500 to-indigo-500' },
  { name: 'Minecraft', icon: '🧱', color: 'from-green-600 to-lime-500' },
  { name: 'Apex Legends', icon: '🎪', color: 'from-orange-600 to-red-600' }
];

// Mock data is now replaced by Supabase - these are just for reference
export const mockProducts: Product[] = [];
export const mockUser: User = {} as User;