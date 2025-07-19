import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cliente/redefinir-senha`,
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast.success('Email de recuperação enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast.error('Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Recuperar Senha
              </h1>
              <p className="text-gray-600">
                Digite seu email para receber as instruções de recuperação
              </p>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Mail className="h-6 w-6 text-primary" />
                  Esqueceu sua senha?
                </CardTitle>
                <CardDescription className="text-center">
                  {emailSent 
                    ? 'Verifique seu email e siga as instruções para redefinir sua senha.'
                    : 'Não se preocupe! Digite seu email abaixo e enviaremos um link para redefinir sua senha.'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!emailSent ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Link de Recuperação
                        </span>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email Enviado!</h3>
                      <p className="text-sm text-gray-600">
                        Enviamos um link de recuperação para <strong>{email}</strong>
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Enviar para outro email
                    </Button>
                  </div>
                )}

                {/* Links de navegação */}
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link 
                    to="/cliente/login"
                    className="flex items-center justify-center text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Login
                  </Link>
                  
                  <div className="text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link 
                      to="/cadastro" 
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Cadastre-se aqui
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;