import React from 'react';
import { Info, TrendingUp } from 'lucide-react';

export function PricingPlans() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sistema de <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Destaque</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Escolha a taxa ideal para maximizar a visibilidade dos seus anúncios
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Taxa Básica */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center">
                <span className="text-2xl">🥉</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
              <div className="text-3xl font-bold text-white">
                5-9%
                <span className="text-sm text-gray-400 font-normal"> taxa</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-300">Visibilidade padrão</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-gray-300">Listagem normal</span>
              </li>
            </ul>
          </div>

          {/* Taxa Padrão */}
          <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/50">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Padrão</h3>
              <div className="text-3xl font-bold text-white">
                10-14%
                <span className="text-sm text-gray-400 font-normal"> taxa</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-gray-300">Boa visibilidade</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-gray-300">Posição melhorada</span>
              </li>
            </ul>
          </div>

          {/* Taxa Destaque */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/50">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Destaque</h3>
              <div className="text-3xl font-bold text-white">
                15-19%
                <span className="text-sm text-gray-400 font-normal"> taxa</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span className="text-gray-300">+200% visibilidade</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span className="text-gray-300">Posição privilegiada</span>
              </li>
            </ul>
          </div>

          {/* Taxa Premium */}
          <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/50 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                DESTAQUE DO DIA
              </span>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <div className="text-3xl font-bold text-white">
                20%+
                <span className="text-sm text-gray-400 font-normal"> taxa</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-gray-300">Sempre no topo</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-gray-300">Aparece em "Destaques do Dia"</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-gray-300">Máxima visibilidade</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-start space-x-4">
            <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-bold mb-2">Como funciona o sistema de destaque?</h3>
              <div className="text-gray-300 space-y-2">
                <p>• <strong>Taxa flexível:</strong> Você escolhe a taxa ao criar cada anúncio</p>
                <p>• <strong>Sem mensalidade:</strong> Pague apenas quando vender</p>
                <p>• <strong>Destaque automático:</strong> Taxa 20%+ aparece em "Destaques do Dia"</p>
                <p>• <strong>Visibilidade proporcional:</strong> Maior taxa = melhor posicionamento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}