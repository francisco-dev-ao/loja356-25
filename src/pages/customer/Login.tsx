import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Lock } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/use-auth';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/cliente/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // If still checking authentication status, show loading
  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
          <div className="container-page py-12">
            <div className="max-w-md mx-auto text-center animate-fade-in">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-microsoft-blue/10">
                <div className="flex justify-center items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="animate-spin h-6 w-6 border-3 border-microsoft-blue border-t-transparent rounded-full"></div>
                </div>
                <p className="text-microsoft-blue font-semibold">Verificando autenticação...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If not authenticated, show login/register tabs
  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="container-page py-12">
          <div className="max-w-lg mx-auto animate-fade-in">
            {/* Header com animação */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl hover-scale">
                <div className="bg-white/20 p-3 rounded-xl">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-microsoft-blue to-blue-600 bg-clip-text text-transparent">
                Área do Cliente
              </h1>
              <p className="text-muted-foreground text-lg">
                Acesse sua conta para gerenciar pedidos e faturas
              </p>
            </div>
            
            {/* Card principal com design moderno */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-microsoft-blue/20 shadow-2xl overflow-hidden hover-scale">
              {/* Header do card */}
              <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-6">
                <div className="flex items-center justify-center text-white">
                  <Lock className="mr-3" size={24} />
                  <h2 className="text-xl font-semibold">Autenticação Segura</h2>
                </div>
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-8">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-8 bg-microsoft-blue/10 border border-microsoft-blue/20 rounded-xl h-12">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-lg data-[state=active]:bg-microsoft-blue data-[state=active]:text-white font-semibold transition-all duration-300"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="rounded-lg data-[state=active]:bg-microsoft-blue data-[state=active]:text-white font-semibold transition-all duration-300"
                    >
                      Cadastro
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="animate-fade-in">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-microsoft-blue/10">
                      <LoginForm />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register" className="animate-fade-in">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-microsoft-blue/10">
                      <RegisterForm />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Footer do card */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 border-t border-microsoft-blue/10">
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Shield className="mr-2" size={16} />
                  <span>Seus dados estão protegidos com criptografia de ponta</span>
                </div>
              </div>
            </div>
            
            {/* Links adicionais */}
            <div className="text-center mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <Link 
                  to="/produtos" 
                  className="text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  Ver Produtos
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  to="/contato" 
                  className="text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  Contato
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
