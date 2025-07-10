import React from 'react';
import { X, Minus, Plus, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './ui/Button';
import { useApp } from '../contexts/AppContext';

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  total: number;
}

export function Cart({ isOpen, items, onClose, onUpdateQuantity, onRemoveItem, total }: CartProps) {
  const { setCurrentPage } = useApp();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setCurrentPage('checkout');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl border-l border-gray-800">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ShoppingBag className="w-6 h-6 mr-3" />
              Carrinho ({items.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-white mb-2">Carrinho Vazio</h3>
                <p className="text-gray-400 mb-6">Adicione alguns produtos incríveis!</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCurrentPage('products');
                    onClose();
                  }}
                >
                  Explorar Produtos
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                        {item.product.title}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">
                        {item.product.game}
                      </p>
                      <p className="text-green-400 font-bold">
                        R$ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2 bg-gray-700 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-600 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-white w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-600 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-medium">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Taxa da plataforma (incluída):</span>
                  <span className="text-gray-400">Já incluída no preço</span>
                </div>
                <hr className="border-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total:</span>
                  <span className="text-2xl font-bold text-green-400">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="primary"
                className="w-full text-lg py-4"
                icon={ArrowRight}
                onClick={handleCheckout}
              >
                Finalizar Compra
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                🔒 Pagamento 100% seguro com sistema de escrow
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}