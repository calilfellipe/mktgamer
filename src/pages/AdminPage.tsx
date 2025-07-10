import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Eye,
  Ban,
  CheckCircle,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Usuários Ativos', value: '2,847', change: '+12%', icon: Users, color: 'text-blue-400' },
    { label: 'Produtos Ativos', value: '1,234', change: '+8%', icon: Package, color: 'text-green-400' },
    { label: 'Receita Mensal', value: 'R$ 45,678', change: '+23%', icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Transações', value: '892', change: '+15%', icon: TrendingUp, color: 'text-purple-400' }
  ];

  const recentUsers = [
    { id: 1, username: 'GamerPro123', email: 'gamer@example.com', status: 'active', verified: true, joinDate: '2024-01-15' },
    { id: 2, username: 'SkinMaster', email: 'skins@example.com', status: 'active', verified: false, joinDate: '2024-01-14' },
    { id: 3, username: 'AccountDealer', email: 'dealer@example.com', status: 'banned', verified: true, joinDate: '2024-01-13' }
  ];

  const recentProducts = [
    { id: 1, title: 'Conta Free Fire Diamante', seller: 'GamerPro123', price: 89.99, status: 'active', category: 'accounts' },
    { id: 2, title: 'Skin Valorant Dragon', seller: 'SkinMaster', price: 45.00, status: 'pending', category: 'skins' },
    { id: 3, title: 'Gift Card Steam R$50', seller: 'AccountDealer', price: 50.00, status: 'sold', category: 'giftcards' }
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400">Gerencie sua plataforma Pro Gamer Market</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                      <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Usuários Recentes</h3>
                <div className="space-y-4">
                  {recentUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{user.username[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.verified && <Shield className="w-4 h-4 text-green-400" />}
                        <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-4">Produtos Recentes</h3>
                <div className="space-y-4">
                  {recentProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{product.title}</p>
                        <p className="text-gray-400 text-sm">por {product.seller}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">R$ {product.price.toFixed(2)}</p>
                        <Badge variant={
                          product.status === 'active' ? 'success' :
                          product.status === 'pending' ? 'warning' : 'secondary'
                        }>
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Gerenciar Usuários</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{user.username[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">Membro desde {user.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {user.verified && <Shield className="w-4 h-4 text-green-400" />}
                      <Badge variant={user.status === 'active' ? 'success' : 'error'}>
                        {user.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          Ver
                        </Button>
                        {user.status === 'active' ? (
                          <Button variant="outline" size="sm" icon={Ban}>
                            Banir
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" icon={CheckCircle}>
                            Desbanir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Gerenciar Produtos</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{product.title}</p>
                      <p className="text-gray-400 text-sm">Vendedor: {product.seller}</p>
                      <p className="text-gray-500 text-xs">Categoria: {product.category}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-green-400 font-bold">R$ {product.price.toFixed(2)}</p>
                        <Badge variant={
                          product.status === 'active' ? 'success' :
                          product.status === 'pending' ? 'warning' : 'secondary'
                        }>
                          {product.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" icon={Eye}>
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" icon={AlertTriangle}>
                          Moderar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Configurações da Plataforma</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-medium mb-3">Taxas de Comissão</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Taxa Plano Grátis (%)</label>
                      <input
                        type="number"
                        defaultValue="15"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Taxa Plano Gamer (%)</label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Configurações de Segurança</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Verificação obrigatória para vendedores</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300">Moderação automática de produtos</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <span className="text-gray-300">Notificações de atividade suspeita</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary">
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}