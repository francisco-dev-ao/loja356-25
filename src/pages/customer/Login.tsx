import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <div className="container-page py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-microsoft-blue border-t-transparent rounded-full"></div>
              <p>Verificando autenticação...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // If not authenticated, show login/register tabs
  return (
    <Layout hideFooter>
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
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
