import React from 'react';
import { useApp } from '../contexts/AppContext';

// Updated games list with more variety
const games = [
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

export function GameCategories() {
  const { setCurrentPage, setSelectedGame } = useApp();

  const handleGameClick = (gameName: string) => {
    setSelectedGame(gameName);
    setCurrentPage('products');
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Escolha seu <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Jogo</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Encontre as melhores ofertas para seus games favoritos
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {games.map((game) => (
            <div
              key={game.name}
              onClick={() => handleGameClick(game.name)}
              className="group relative bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-purple-500/50 hover:scale-105 min-h-[100px]"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
              
              <div className="text-center">
                <div className="text-3xl mb-2">{game.icon}</div>
                <h3 className="text-white font-semibold text-xs group-hover:text-purple-300 transition-colors leading-tight">
                  {game.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}