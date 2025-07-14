import React from 'react';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';

export function CheckoutCancelPage() {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento Cancelado</h2>
          <p className="text-gray-400 mb-6">
            Seu pagamento foi cancelado. Nenhuma cobrança foi realizada e seus itens ainda estão no carrinho.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm">
              Não se preocupe! Seus itens foram salvos e você pode tentar novamente quando quiser.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full"
              icon={ShoppingCart}
              onClick={() => setCurrentPage('checkout')}
            >
              Tentar Novamente
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              icon={ArrowLeft}
              onClick={() => setCurrentPage('products')}
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}