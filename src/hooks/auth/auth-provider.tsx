
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './auth-context';
import { Profile } from './types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Configurar o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Buscar o perfil do usuário após autenticação
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();

              if (error) {
                console.error('Erro ao buscar perfil:', error);
              } else {
                setProfile(data as Profile);
              }
            } catch (error) {
              console.error('Erro inesperado:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Buscar o perfil do usuário se estiver autenticado
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Erro ao buscar perfil:', error);
            } else {
              setProfile(data as Profile);
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }

      toast.success('Login bem-sucedido!');
      
      // Redirecionamento será feito automaticamente pelo onAuthStateChange
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
      // Registrar o usuário
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Configurar o papel do usuário como 'customer' por padrão
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name,
            role: 'customer' 
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          throw new Error(profileError.message);
        }
      }
      
      toast.success('Registro completo! Verifique seu email para confirmar sua conta.');
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
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Atualiza o perfil localmente
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Falha ao atualizar perfil.');
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
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
      session,
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
