import React from 'react';
import { Shield, Zap, TrendingUp, Star, Users, Award } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../contexts/AppContext';

export function Hero() {
  const { setCurrentPage } = useApp();

  return (
    <section className="relative pt-24 pb-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-4">
              🎮 O Marketplace Gamer Mais Confiável do Brasil
            </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Xandy
            </span>
            <br />
            <span className="text-white">Gamer Market</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            🔒 <span className="text-green-400 font-semibold">100% Seguro</span> com sistema de escrow • 
            ⚡ <span className="text-yellow-400 font-semibold">Entrega instantânea</span> • 
            🏆 <span className="text-blue-400 font-semibold">+100.000 gamers</span> confiam em nós
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Button 
              variant="primary" 
              size="lg" 
              icon={Zap}
              onClick={() => setCurrentPage('products')}
              className="text-lg px-8 py-4"
            >
              🛍️ Explorar Loja
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              icon={TrendingUp}
              onClick={() => setCurrentPage('create-product')}
              className="text-lg px-8 py-4"
            >
              💰 Vender Agora
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">100K+</div>
              <div className="text-gray-400 flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                Usuários Ativos
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">R$ 2M+</div>
              <div className="text-gray-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Transacionado
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">50K+</div>
              <div className="text-gray-400 flex items-center justify-center">
                <Award className="w-4 h-4 mr-1" />
                Produtos Vendidos
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">4.9★</div>
              <div className="text-gray-400 flex items-center justify-center">
                <Star className="w-4 h-4 mr-1" />
                Avaliação Média
              </div>
            </div>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Sistema Escrow</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Entrega Automática</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Suporte 24/7</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Taxa Flexível</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}