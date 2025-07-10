import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  Bell, 
  CreditCard,
  Upload,
  Save,
  Eye,
  EyeOff,
  Star,
  Award,
  TrendingUp,
  DollarSign,
  Download,
  Check,
  X
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function ProfileSettings() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    discord: user?.discord || '',
    steam: user?.steam || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    method: 'pix' as 'pix' | 'bank_transfer',
    pix_key: '',
    bank_data: {
      bank: '',
      agency: '',
      account: '',
      account_type: 'corrente'
    }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsLoading(true);
    try {
      await uploadAvatar(file);
      setMessage('✅ Foto alterada com sucesso!');
    } catch (error) {
      setMessage('❌ Erro ao alterar foto.');
    }
    setIsLoading(false);
  };

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      const success = await updateProfile({
        username: formData.username,
        bio: formData.bio,
        discord: formData.discord,
        steam: formData.steam
      });

      if (success) {
        setMessage('✅ Alterações salvas com sucesso!');
      } else {
        setMessage('❌ Erro ao salvar alterações.');
      }
    } catch (error) {
      setMessage('❌ Erro ao salvar alterações.');
    }
    setIsLoading(false);
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalData.amount || parseFloat(withdrawalData.amount) < 10) {
      setMessage('❌ Valor mínimo de saque é R$ 10,00');
      return;
    }

    if (parseFloat(withdrawalData.amount) > (user.balance || 0)) {
      setMessage('❌ Saldo insuficiente');
      return;
    }

    if (!user.is_verified) {
      setMessage('❌ Conta não verificada. Complete a verificação KYC primeiro.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💸 Solicitando saque...');
      
      const { data, error } = await supabase
        .from('withdrawals')
        .insert([{
          user_id: user.id,
          amount: parseFloat(withdrawalData.amount),
          method: withdrawalData.method,
          pix_key: withdrawalData.method === 'pix' ? withdrawalData.pix_key : null,
          bank_data: withdrawalData.method === 'bank_transfer' ? withdrawalData.bank_data : null,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao solicitar saque:', error);
        throw new Error(error.message);
      }

      console.log('✅ Saque solicitado:', data);

      // Criar notificação
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          content: `Solicitação de saque de R$ ${withdrawalData.amount} enviada. Aguarde aprovação.`,
          type: 'withdrawal',
          is_read: false
        }]);

      setMessage('✅ Solicitação de saque enviada! Aguarde aprovação.');
      setShowWithdrawalForm(false);
      setWithdrawalData({
        amount: '',
        method: 'pix',
        pix_key: '',
        bank_data: { bank: '', agency: '', account: '', account_type: 'corrente' }
      });
      loadWithdrawals();
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      loadWithdrawals();
    }
  }, [activeTab]);

  const loadWithdrawals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar saques:', error);
        return;
      }

      setWithdrawals(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar saques:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-purple-500"
              />
              <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                {user.is_verified && <Shield className="w-6 h-6 text-green-400" />}
                <Badge variant="primary">{user.role}</Badge>
              </div>
              <div className="flex items-center space-x-6 text-gray-400">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span>R$ {(user.balance || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Membro desde 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <p className="text-white">{message}</p>
          </div>
        )}

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
                          disabled
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
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

                    <Button 
                      variant="primary" 
                      icon={Save}
                      onClick={handleProfileSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
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
                        <p className="text-2xl font-bold text-green-400">R$ {(user.balance || 0).toFixed(2)}</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <TrendingUp className="w-6 h-6 text-blue-400" />
                          <h3 className="text-white font-medium">Vendas Este Mês</h3>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">R$ 0,00</p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <Award className="w-6 h-6 text-purple-400" />
                          <h3 className="text-white font-medium">Total de Vendas</h3>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">R$ 0,00</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <h3 className="text-white font-medium">Histórico de Saques</h3>
                      <Button
                        variant="primary"
                        icon={Download}
                        onClick={() => setShowWithdrawalForm(true)}
                        disabled={(user.balance || 0) < 10 || !user.is_verified}
                      >
                        Solicitar Saque
                      </Button>
                    </div>

                    {!user.is_verified && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ Você precisa verificar sua conta para solicitar saques. Vá para a aba "Verificação".
                        </p>
                      </div>
                    )}

                    {showWithdrawalForm && (
                      <div className="bg-gray-800 rounded-lg p-6">
                        <h4 className="text-white font-medium mb-4">Solicitar Saque</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Valor (mín. R$ 10,00)</label>
                            <input
                              type="number"
                              min="10"
                              max={user.balance || 0}
                              step="0.01"
                              value={withdrawalData.amount}
                              onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Método</label>
                            <select
                              value={withdrawalData.method}
                              onChange={(e) => setWithdrawalData(prev => ({ ...prev, method: e.target.value as 'pix' | 'bank_transfer' }))}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            >
                              <option value="pix">PIX</option>
                              <option value="bank_transfer">Transferência Bancária</option>
                            </select>
                          </div>

                          {withdrawalData.method === 'pix' && (
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Chave PIX</label>
                              <input
                                type="text"
                                value={withdrawalData.pix_key}
                                onChange={(e) => setWithdrawalData(prev => ({ ...prev, pix_key: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                placeholder="CPF, email, telefone ou chave aleatória"
                              />
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <Button
                              variant="primary"
                              onClick={handleWithdrawalRequest}
                              disabled={isLoading}
                            >
                              {isLoading ? 'Processando...' : 'Solicitar'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowWithdrawalForm(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="space-y-3">
                        {withdrawals.length === 0 ? (
                          <p className="text-gray-400 text-center py-8">Nenhum saque solicitado ainda</p>
                        ) : (
                          withdrawals.map((withdrawal) => (
                            <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                              <div>
                                <p className="text-white font-medium">
                                  Saque - {withdrawal.method === 'pix' ? 'PIX' : 'Transferência'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(withdrawal.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">R$ {withdrawal.amount.toFixed(2)}</p>
                                <Badge variant={
                                  withdrawal.status === 'approved' ? 'success' :
                                  withdrawal.status === 'rejected' ? 'error' : 'warning'
                                }>
                                  {withdrawal.status === 'approved' ? 'Aprovado' :
                                   withdrawal.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Tab */}
              {activeTab === 'kyc' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Verificação de Identidade</h2>
                  
                  <div className="space-y-6">
                    {user.is_verified ? (
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
                            Complete a verificação para ganhar o selo de "Vendedor Verificado" e poder solicitar saques
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
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div>
                            <h4 className="text-white font-medium">
                              {key === 'email' ? 'Notificações por Email' :
                               key === 'push' ? 'Notificações Push' :
                               key === 'sales' ? 'Notificações de Vendas' :
                               'Mensagens'}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {key === 'email' ? 'Receber atualizações importantes por email' :
                               key === 'push' ? 'Receber notificações no navegador' :
                               key === 'sales' ? 'Ser notificado sobre novas vendas' :
                               'Notificações de novas mensagens'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button variant="primary" icon={Save}>
                      Salvar Preferências
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