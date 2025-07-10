import React from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { plans } from '../data/mockData';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export function PricingPlans() {
  const iconMap = {
    gray: Star,
    purple: Zap,
    cyan: Crown,
    green: Crown
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Planos <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Premium</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Escolha o plano ideal para maximizar suas vendas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const Icon = iconMap[plan.color as keyof typeof iconMap];
            const isPopular = plan.id === 'pro';
            
            return (
              <div
                key={plan.id}
                className={`relative bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                  isPopular 
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/25' 
                    : 'border-gray-700 hover:border-purple-500/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary">{plan.badge}</Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${
                    plan.color === 'gray' ? 'from-gray-600 to-gray-500' :
                    plan.color === 'purple' ? 'from-purple-600 to-purple-500' :
                    plan.color === 'cyan' ? 'from-cyan-600 to-cyan-500' :
                    'from-green-600 to-green-500'
                  } flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-white">
                    R$ {plan.price}
                    <span className="text-sm text-gray-400 font-normal">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => {}}
                >
                  {plan.price === 0 ? 'Começar Grátis' : 'Assinar Plano'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}