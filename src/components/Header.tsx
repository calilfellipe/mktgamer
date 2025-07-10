import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  Shield, 
  Gamepad2,
  Sparkles,
  Gift,
  Zap,
  HeadphonesIcon,
  LogOut,
  Settings,
  Plus,
  Bell
} from 'lucide-react';
import { Button } from './ui/Button';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onToggleCart: () => void;
  cartItemCount: number;
  onOpenLogin: () => void;
}

export function Header({ onToggleCart, cartItemCount, onOpenLogin }: HeaderProps) {
  const { user, logout } = useAuth();
  const { setCurrentPage, setSearchQuery, searchQuery } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage('products');
  };

  // Load unread notifications count
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadUnreadCount();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Erro ao carregar contagem:', error);
        return;
      }

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar contagem:', error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    GG Sync
                  </span>
                  <span className="text-xl font-bold text-white ml-1">Market</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleNavClick('home')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <Gamepad2 className="w-4 h-4" />
                <span>Início</span>
              </button>
              <button onClick={() => handleNavClick('accounts')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Contas</span>
              </button>
              <button onClick={() => handleNavClick('skins')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Skins</span>
              </button>
              <button onClick={() => handleNavClick('giftcards')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <Gift className="w-4 h-4" />
                <span>Gift Cards</span>
              </button>
              <button onClick={() => handleNavClick('services')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>Serviços</span>
              </button>
              <button onClick={() => handleNavClick('support')} className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
                <HeadphonesIcon className="w-4 h-4" />
                <span>Suporte</span>
              </button>
            </nav>

            {/* Search */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar contas, skins, gift cards..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => handleNavClick('create-product')}
                    className="hidden md:flex"
                  >
                    Anunciar
                  </Button>
                  
                  <button 
                    className="relative p-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setShowNotifications(true)}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
              
              <button
                onClick={onToggleCart}
                className="relative p-2 text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-medium hidden md:block">{user.username}</span>
                    {user.is_verified && <Shield className="w-4 h-4 text-green-400" />}
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Meu Perfil</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleNavClick('my-products');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Meus Anúncios</span>
                      </button>
                      
                      {(user.role === 'admin' || user.role === 'moderator') && (
                        <button
                          onClick={() => {
                            handleNavClick('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </button>
                      )}
                      
                      <hr className="border-gray-800 my-2" />
                      
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="outline" size="sm" icon={Shield} onClick={onOpenLogin}>
                    Login
                  </Button>
                  
                  <Button variant="primary" size="sm" onClick={onOpenLogin}>
                    Cadastrar
                  </Button>
                </>
              )}
              
              <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}