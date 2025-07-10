import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Eye, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  content: string;
  type: 'purchase' | 'sale' | 'withdrawal' | 'system' | 'dispute';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('🔔 Carregando notificações...');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        return;
      }

      console.log('✅ Notificações carregadas:', data?.length || 0);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Erro ao marcar como lida:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Erro ao marcar todas como lidas:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Erro ao deletar notificação:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return '🛒';
      case 'sale':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'system':
        return '⚙️';
      case 'dispute':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-blue-400';
      case 'sale':
        return 'text-green-400';
      case 'withdrawal':
        return 'text-yellow-400';
      case 'system':
        return 'text-gray-400';
      case 'dispute':
        return 'text-red-400';
      default:
        return 'text-purple-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl border-l border-gray-800">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Bell className="w-6 h-6 mr-3" />
              Notificações
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="p-4 border-b border-gray-800">
              <Button
                variant="outline"
                size="sm"
                icon={Check}
                onClick={markAllAsRead}
                className="w-full"
              >
                Marcar todas como lidas
              </Button>
            </div>
          )}

          {/* Notifications */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhuma notificação</h3>
                <p className="text-gray-400">Você está em dia!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.is_read
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-800/80 border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notification.is_read ? 'text-gray-300' : 'text-white font-medium'}`}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-700 rounded text-green-400 hover:text-green-300 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}