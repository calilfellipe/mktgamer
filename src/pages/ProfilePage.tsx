import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard,
  Upload,
  Save,
  Eye,
  EyeOff,
  Star,
  Award,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    discord: '',
    steam: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sales: true,
    messages: true
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'kyc', label: 'Verificação', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'billing', label: 'Faturamento', icon: CreditCard }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-purple-500"
              />
              <button className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                {user.verified && <Shield className="w-6 h-6 text-green-400" />}
                <Badge variant="primary">{user.plan}</Badge>
              </div>
              <div className="flex items-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{user.reputation.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span>{user.totalSales} vendas</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Membro desde {user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Informações do Perfil</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome de usuário
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Biografia
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                        placeholder="Conte um pouco sobre você..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Discord
                        </label>
                        <input
                          type="text"
                          name="discord"
                          value={formData.discord}
                          onChange={handleInputChange}
                          placeholder="usuario#1234"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Steam
                        </label>
                        <input
                          type="text"
                          name="steam"
                          value={formData.steam}
                          onChange={handleInputChange}
                          placeholder="steamcommunity.com/id/usuario"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <Button variant="primary" icon={Save}>
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Segurança</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Senha Atual
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nova Senha
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <Button variant="primary" icon={Save}>
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Verificação de Identidade</h2>
                  
                  <div className="space-y-6">
                    {user.verified ? (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-8 h-8 text-green-400" />
                          <div>
                            <h3 className="text-xl font-bold text-green-300">Conta Verificada</h3>
                            <p className="text-green-400/70">Sua identidade foi verificada com sucesso</p>
                          </div>
                        </div>
                        <Badge variant="success">Vendedor Verificado</Badge>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
                          <h3 className="text-xl font-bold text-yellow-300 mb-2">Verificação Pendente</h3>
                          <p className="text-yellow-400/70">
                            Complete a verificação para ganhar o selo de "Vendedor Verificado" e aumentar sua credibilidade
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-white font-medium mb-2">Documento com Foto</h4>
                            <p className="text-gray-400 text-sm">RG, CNH ou Passaporte</p>
                          </div>
                          
                          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-white font-medium mb-2">Comprovante de Residência</h4>
                            <p className="text-gray-400 text-sm">Conta de luz, água ou telefone</p>
                          </div>
                        </div>

                        <Button variant="primary" icon={Upload}>
                          Enviar Documentos
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Preferências de Notificação</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Notificações por Email</h4>
                          <p className="text-gray-400 text-sm">Receber atualizações importantes por email</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('email')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.email ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.email ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Notificações Push</h4>
                          <p className="text-gray-400 text-sm">Receber notificações no navegador</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('push')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.push ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.push ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Notificações de Vendas</h4>
                          <p className="text-gray-400 text-sm">Ser notificado sobre novas vendas</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('sales')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.sales ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.sales ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">Mensagens</h4>
                          <p className="text-gray-400 text-sm">Notificações de novas mensagens</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange('messages')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notifications.messages ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notifications.messages ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <Button variant="primary" icon={Save}>
                      Salvar Preferências
                    </Button>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Faturamento e Saldo</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <DollarSign className="w-6 h-6 text-green-400" />
                          <h3 className="text-white font-medium">Saldo Disponível</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-400">R$ 1.247,50</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <TrendingUp className="w-6 h-6 text-blue-400" />
                          <h3 className="text-white font-medium">Vendas Este Mês</h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">R$ 3.890,00</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <Award className="w-6 h-6 text-purple-400" />
                          <h3 className="text-white font-medium">Total de Vendas</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">R$ 28.450,00</p>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">Histórico de Transações</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Venda - Conta Free Fire Elite</p>
                            <p className="text-gray-400 text-sm">15 de Janeiro, 2024</p>
                          </div>
                          <span className="text-green-400 font-bold">+R$ 89,99</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Saque para conta bancária</p>
                            <p className="text-gray-400 text-sm">12 de Janeiro, 2024</p>
                          </div>
                          <span className="text-red-400 font-bold">-R$ 500,00</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-white font-medium">Venda - Skin Valorant Dragon</p>
                            <p className="text-gray-400 text-sm">10 de Janeiro, 2024</p>
                          </div>
                          <span className="text-green-400 font-bold">+R$ 45,00</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="primary" icon={DollarSign}>
                      Solicitar Saque
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}