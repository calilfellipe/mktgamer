import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Play
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useApp } from '../contexts/AppContext';

export function MyProducts() {
  const { user } = useAuth();
  const { setCurrentPage } = useApp();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyProducts();
    }
  }, [user]);

  const loadMyProducts = async () => {
    if (!user) return;
    
    try {
      console.log('📦 Carregando produtos do usuário:', user.id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        return;
      }

      console.log('✅ Produtos carregados:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
    }
    setIsLoading(false);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      console.log('🗑️ Removendo produto:', selectedProduct.id);
      
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'removed',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProduct.id);

      if (error) {
        console.error('❌ Erro ao remover produto:', error);
        return;
      }

      console.log('✅ Produto removido');
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('❌ Erro ao remover produto:', error);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      console.log('🔄 Alterando status do produto:', productId, 'para', newStatus);
      
      const { error } = await supabase
        .from('products')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('❌ Erro ao alterar status:', error);
        return;
      }

      console.log('✅ Status alterado');
      loadMyProducts(); // Recarregar lista
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending_approval':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-400" />;
      case 'removed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending_approval':
        return 'Pendente';
      case 'paused':
        return 'Pausado';
      case 'removed':
        return 'Removido';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'paused':
        return 'secondary';
      case 'removed':
        return 'error';
      default:
        return 'secondary';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você precisa estar logado para ver seus anúncios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meus Anúncios</h1>
              <p className="text-gray-400">Gerencie seus produtos e vendas</p>
            </div>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => setCurrentPage('create-product')}
            >
              Novo Anúncio
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <Package className="w-6 h-6 text-blue-400" />
              <h3 className="text-white font-medium">Total de Anúncios</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">{products.length}</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-white font-medium">Ativos</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {products.filter(p => p.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-medium">Pendentes</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              {products.filter(p => p.status === 'pending_approval').length}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-medium">Valor Total</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              R$ {products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-gray-900 rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-xl font-bold text-white">Seus Produtos</h3>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando seus anúncios...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Nenhum anúncio ainda</h3>
                <p className="text-gray-400 mb-6">Crie seu primeiro anúncio e comece a vender!</p>
                <Button 
                  variant="primary" 
                  icon={Plus}
                  onClick={() => setCurrentPage('create-product')}
                >
                  Criar Primeiro Anúncio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <img
                      src={product.images?.[0] || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
                      }}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium">{product.title}</h3>
                        {getStatusIcon(product.status)}
                        <Badge variant={getStatusVariant(product.status) as any}>
                          {getStatusText(product.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-1">{product.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{product.game}</span>
                        <span>{product.category}</span>
                        <span>Taxa: {product.commission_rate}%</span>
                        <span>Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        R$ {product.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Você recebe: R$ {(product.price * (1 - product.commission_rate / 100)).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        Ver
                      </Button>
                      {product.status !== 'removed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            icon={Edit}
                            onClick={() => handleEdit(product)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={product.status === 'active' ? Pause : Play}
                            onClick={() => toggleProductStatus(product.id, product.status)}
                            className={product.status === 'active' ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}
                          >
                            {product.status === 'active' ? 'Pausar' : 'Ativar'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Trash2}
                            onClick={() => handleDelete(product)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl p-6">
                <div className="text-center">
                  <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Excluir Anúncio</h3>
                  <p className="text-gray-400 mb-6">
                    Tem certeza que deseja excluir "{selectedProduct.title}"? Esta ação não pode ser desfeita.
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={confirmDelete}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}