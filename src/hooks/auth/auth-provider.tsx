
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { AuthContext } from './auth-context';
import { Profile } from './types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se já existe token de autenticação
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.getMe().then(({ data, error }) => {
        if (data && !error) {
          setUser(data as User);
          setProfile(data as Profile);
        } else {
          localStorage.removeItem('auth_token');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.login(email, password);
      
      if (error) {
        throw new Error(error);
      }

      localStorage.setItem('auth_token', (data as any).token);
      setUser((data as any).user);
      setProfile((data as any).user);
      toast.success('Login bem-sucedido!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Falha no login. Verifique suas credenciais.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.register(name, email, password);
      
      if (error) {
        throw new Error(error);
      }

      localStorage.setItem('auth_token', (data as any).token);
      setUser((data as any).user);
      setProfile((data as any).user);
      toast.success('Registro realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Falha no registro. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    
    try {
      const { error } = await apiClient.updateProfile({ name: data.name || '' });
      
      if (error) {
        throw new Error(error);
      }
      
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Falha ao atualizar perfil.');
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
      setProfile(null);
      toast.info('Você foi desconectado');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      session: null,
      isLoading, 
      isAuthenticated: !!user,
      login,
      logout,
      register,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
