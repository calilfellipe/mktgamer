// This file now only contains type definitions and static data - all mock data removed
import { Product, User, Plan } from '../types';

// Static games list for UI (not mock data)
export const games = [
  { name: 'Free Fire', icon: '🔥', color: 'from-orange-500 to-red-500' },
  { name: 'Valorant', icon: '🎯', color: 'from-red-500 to-pink-500' },
  { name: 'Fortnite', icon: '🏆', color: 'from-blue-500 to-cyan-500' },
  { name: 'Roblox', icon: '🎮', color: 'from-green-500 to-emerald-500' },
  { name: 'CS:GO', icon: '💎', color: 'from-yellow-500 to-orange-500' },
  { name: 'League of Legends', icon: '⚡', color: 'from-purple-500 to-indigo-500' },
  { name: 'Minecraft', icon: '🧱', color: 'from-green-600 to-lime-500' },
  { name: 'Apex Legends', icon: '🎪', color: 'from-orange-600 to-red-600' },
  { name: 'Call of Duty', icon: '🔫', color: 'from-gray-600 to-gray-800' },
  { name: 'FIFA', icon: '⚽', color: 'from-green-400 to-blue-500' },
  { name: 'GTA V', icon: '🚗', color: 'from-yellow-400 to-orange-500' },
  { name: 'Among Us', icon: '👾', color: 'from-red-400 to-pink-500' }
];

// All mock data removed - only real data from Supabase is used
export const mockProducts: Product[] = [];
export const mockUser: User = {} as User;
export const plans: Plan[] = [];