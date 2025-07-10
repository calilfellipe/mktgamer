import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  balance: number;
  role: 'user' | 'admin' | 'moderator';
  is_verified: boolean;
  bio?: string;
  discord?: string;
  steam?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  updateProfile: (updates: any) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('📥 Carregando perfil do usuário:', authUser.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist in users table, create profile
          console.log('👤 Criando perfil do usuário...');
          await createUserProfile(authUser);
          return;
        }
        throw error;
      }

      console.log('✅ Perfil carregado:', data);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        balance: data.balance || 0,
        role: data.role || 'user',
        is_verified: data.is_verified || false,
        bio: data.bio,
        discord: data.discord,
        steam: data.steam
      });
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
    }
    setIsLoading(false);
  };

  const createUserProfile = async (authUser: User) => {
    try {
      const username = authUser.user_metadata?.username || 
                      authUser.email?.split('@')[0] || 
                      'user' + Math.random().toString(36).substr(2, 9);

      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          username,
          email: authUser.email!,
          avatar_url: authUser.user_metadata?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
          role: authUser.email === 'califellipee@outlook.com' ? 'admin' : 'user',
          is_verified: false,
          balance: 0
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Perfil criado:', data);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url,
        balance: data.balance,
        role: data.role,
        is_verified: data.is_verified,
        bio: data.bio,
        discord: data.discord,
        steam: data.steam
      });
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Fazendo login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        return false;
      }

      console.log('✅ Login bem-sucedido');
      return true;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      console.log('📝 Registrando usuário...');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username
          }
        }
      });

      if (error) {
        console.error('❌ Erro no registro:', error);
        return false;
      }

      console.log('✅ Registro bem-sucedido');
      return true;
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return false;
    }
  };

  const updateProfile = async (updates: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuário não logado');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      await updateProfile({ avatar_url: urlData.publicUrl });

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateProfile,
      uploadAvatar,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}