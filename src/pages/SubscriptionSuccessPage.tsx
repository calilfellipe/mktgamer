import React, { useEffect } from 'react';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

export function SubscriptionSuccessPage() {
  const { setCurrentPage } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    // You could refresh user data here to get updated plan info
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Assinatura Ativada!</h2>
          <p className="text-gray-400 mb-6">
            Seu plano premium foi ativado com sucesso. Agora você tem acesso a todos os benefícios!
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Plano Premium Ativo</span>
            </div>
            <p className="text-gray-400 text-sm">
              Aproveite taxas reduzidas e maior visibilidade para seus produtos
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full"
              icon={ArrowRight}
              onClick={() => setCurrentPage('create-product')}
            >
              Criar Primeiro Anúncio
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setCurrentPage('home')}
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}