import React, { useState } from 'react';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string;
  features: string[];
  badge: string;
  color: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    stripePriceId: '',
    features: ['5 anúncios ativos', 'Taxa de 15%', 'Suporte básico'],
    badge: 'Starter',
    color: 'gray'
  },
  {
    id: 'gamer',
    name: 'Gamer',
    price: 29,
    stripePriceId: 'price_gamer_monthly', // Replace with actual Stripe price ID
    features: ['+50% visibilidade', 'Taxa de 10%', 'Suporte prioritário', 'Selo Premium'],
    badge: 'Popular',
    color: 'purple',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro Player',
    price: 59,
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: ['Anúncios em destaque', 'Taxa de 5%', 'Relatórios avançados', 'Selo Pro'],
    badge: 'Recomendado',
    color: 'cyan'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    stripePriceId: 'price_elite_monthly', // Replace with actual Stripe price ID
    features: ['Sempre no topo', 'Taxa zero', 'Selo Top Seller', 'Cashback'],
    badge: 'Premium',
    color: 'green'
  }
];

export function SubscriptionPlans() {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      alert('Você precisa estar logado para assinar um plano');
      return;
    }

    if (plan.price === 0) {
      // Handle free plan
      try {
        // Update user plan in database
        alert('Plano gratuito ativado!');
      } catch (error) {
        console.error('Error activating free plan:', error);
      }
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // Create checkout session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
          planId: plan.id,
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/pricing`
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setLoadingPlan(null);
    }
  };

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
            const isLoading = loadingPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-cyan-500 shadow-lg shadow-cyan-500/25' 
                    : 'border-gray-700 hover:border-purple-500/50'
                }`}
              >
                {plan.popular && (
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
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  icon={isLoading ? Loader2 : undefined}
                >
                  {isLoading ? 'Processando...' : 
                   plan.price === 0 ? 'Começar Grátis' : 'Assinar Plano'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}