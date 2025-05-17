
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

const Login = () => {
  const { login, register } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword' && value !== registerData.password) {
        setPasswordError('As senhas não coincidem');
      } else if (name === 'password' && registerData.confirmPassword && value !== registerData.confirmPassword) {
        setPasswordError('As senhas não coincidem');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(loginData.email, loginData.password);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(registerData.name, registerData.email, registerData.password);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-heading font-bold">Área do Cliente</h1>
            <p className="text-muted-foreground mt-2">
              Acesse sua conta para gerenciar pedidos e faturas
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                          Senha
                        </label>
                        <Link to="/cliente/esqueci-senha" className="text-xs text-microsoft-blue hover:underline">
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </div>
                </form>
                
                <div className="mt-6 text-sm text-center">
                  <p className="text-muted-foreground">
                    Para testar, use:<br />
                    Cliente: cliente@example.com / cliente123<br />
                    Admin: admin@example.com / admin123
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="register-password" className="block text-sm font-medium mb-1">
                        Senha
                      </label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                        Confirmar senha
                      </label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                      />
                      {passwordError && (
                        <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90" 
                      disabled={isSubmitting || !!passwordError}
                    >
                      {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
