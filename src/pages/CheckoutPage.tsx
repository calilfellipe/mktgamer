import React, { useState } from 'react';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  QrCode,
  Smartphone,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../hooks/useCart';
import { useApp } from '../contexts/AppContext';

interface CheckoutPageProps {
  onCheckout: () => Promise<boolean>;
}

export function CheckoutPage({ onCheckout }: CheckoutPageProps) {
  const { items, total } = useCart();
  const { setCurrentPage } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [showPixQR, setShowPixQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const finalTotal = total;

  const paymentMethods = [
    {
      id: 'pix',
      name: 'PIX',
      icon: QrCode,
      description: 'Pagamento instantâneo',
      fee: 0,
      time: 'Imediato'
    },
    {
      id: 'card',
      name: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Parcelamento disponível',
      fee: 0,
      time: 'Imediato'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Smartphone,
      description: 'Conta PayPal',
      fee: 0,
      time: 'Imediato'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'pix') {
        // Generate PIX code
        const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Date.now()}520400005303986540${finalTotal.toFixed(2)}5802BR5925GG Sync Market6009SAO PAULO62070503***6304`;
        setPixCode(pixCode);
        setShowPixQR(true);
        
        // Simulate PIX payment confirmation after 10 seconds
        setTimeout(async () => {
          const success = await onCheckout();
          if (success) {
            setIsProcessing(false);
            setIsCompleted(true);
          }
        }, 10000);
      } else {
        // Simulate other payment methods
        setTimeout(async () => {
          const success = await onCheckout();
          if (success) {
            setIsProcessing(false);
            setIsCompleted(true);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setIsProcessing(false);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  if (showPixQR && paymentMethod === 'pix') {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <QrCode className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Pagamento PIX</h2>
            
            <div className="bg-white p-4 rounded-lg mb-6">
              <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-sm">QR Code PIX</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Código PIX:</p>
              <p className="text-white font-mono text-xs break-all">{pixCode}</p>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-green-400 mb-2">R$ {finalTotal.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Aguardando pagamento...</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-yellow-400">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processando pagamento...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Carrinho Vazio</h2>
          <p className="text-gray-400 mb-6">Adicione alguns produtos para continuar</p>
          <Button variant="primary" onClick={() => setCurrentPage('products')}>
            Explorar Produtos
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Realizado!</h2>
            <p className="text-gray-400 mb-6">
              Seu pagamento foi processado com sucesso. Os vendedores foram notificados e você receberá os produtos em breve.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2">ID da Transação</h3>
              <p className="text-purple-400 font-mono">#GGS-{Date.now().toString().slice(-8)}</p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => setCurrentPage('my-purchases')}
              >
                Ver Minhas Compras
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
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

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <button
            onClick={() => setCurrentPage('products')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às compras</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white">
            🛒 Finalizar <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Compra</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.product.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="primary">{item.product.game}</Badge>
                        <span className="text-gray-400 text-sm">Qtd: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Método de Pagamento</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const methodTotal = finalTotal + method.fee;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6 text-purple-400" />
                          <div>
                            <h3 className="text-white font-medium">{method.name}</h3>
                            <p className="text-gray-400 text-sm">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            R$ {methodTotal.toFixed(2)}
                          </div>
                          {method.fee > 0 && (
                            <div className="text-gray-400 text-sm">
                              +R$ {method.fee.toFixed(2)} taxa
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pagamento</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa da plataforma:</span>
                  <span className="text-gray-400">Incluída no preço</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">
                    R$ {finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Entrega automática após confirmação</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Garantia de reembolso</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                icon={isProcessing ? Clock : DollarSign}
                onClick={handlePayment}
                disabled={!paymentMethod || isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Finalizar Pagamento'}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Ao finalizar a compra, você concorda com nossos Termos de Uso e Política de Privacidade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}