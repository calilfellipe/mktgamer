import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';

export function CheckoutSuccessPage() {
  const { setCurrentPage } = useApp();

  useEffect(() => {
    // You could verify the checkout session here if needed
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      console.log('✅ Checkout session completed:', sessionId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento Realizado!</h2>
          <p className="text-gray-400 mb-6">
            Seu pagamento foi processado com sucesso. O dinheiro está em escrow e será liberado após a confirmação da entrega.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-2">🔒 Sistema de Escrow</h3>
            <p className="text-gray-400 text-sm">
              Seu pagamento está seguro! O vendedor foi notificado e entrará em contato para coordenar a entrega. 
              O dinheiro só será liberado após você confirmar o recebimento.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="primary" 
              className="w-full"
              icon={MessageCircle}
              onClick={() => setCurrentPage('my-purchases')}
            >
              Ver Minhas Compras
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              icon={ArrowRight}
              onClick={() => setCurrentPage('products')}
            >
              Continuar Comprando
            </Button>
          </div>

          <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              💬 Use o chat integrado para se comunicar com os vendedores e coordenar a entrega dos produtos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}