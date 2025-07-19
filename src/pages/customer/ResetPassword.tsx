import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [passwordReset, setPasswordReset] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há um token de recuperação na URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setIsValidToken(false);
      toast.error('Link de recuperação inválido ou expirado');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setPasswordReset(true);
      toast.success('Senha redefinida com sucesso!');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/cliente/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg border-0">
                <CardContent className="text-center p-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Link Inválido
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Este link de recuperação é inválido ou já expirou.
                  </p>
                  <Button 
                    onClick={() => navigate('/cliente/esqueci-senha')}
                    className="w-full"
                  >
                    Solicitar Novo Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Redefinir Senha
              </h1>
              <p className="text-gray-600">
                Digite sua nova senha
              </p>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                  <Lock className="h-6 w-6 text-primary" />
                  Nova Senha
                </CardTitle>
                <CardDescription className="text-center">
                  {passwordReset 
                    ? 'Sua senha foi redefinida com sucesso! Você será redirecionado para a página de login.'
                    : 'Escolha uma senha forte para proteger sua conta.'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!passwordReset ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nova Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Nova Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua nova senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Mínimo de 6 caracteres
                      </p>
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua nova senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 border-gray-300 focus:border-primary focus:ring-primary"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
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
                          Redefinindo...
                        </span>
                      ) : (
                        'Redefinir Senha'
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Senha Redefinida!</h3>
                      <p className="text-sm text-gray-600">
                        Sua senha foi atualizada com sucesso.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Redirecionando para o login...
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;