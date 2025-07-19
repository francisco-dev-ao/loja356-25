import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps {
  redirectAfter?: boolean;
}

const LoginForm = ({ redirectAfter = true }: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Verificar se existe um redirecionamento na navegação
  const redirectPath = location.state?.redirectAfterLogin || '/cliente/dashboard';
  const isCartPage = location.pathname === '/carrinho';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      await login(email, password);
      
      // Only redirect if redirectAfter is true AND we're not on the cart page
      if (redirectAfter && !isCartPage) {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header elegante */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo de volta</h2>
        <p className="text-gray-600">Entre com suas credenciais para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="animate-fade-in border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Campo Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
            Endereço de Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="pl-10 h-12 border-gray-300 focus:border-microsoft-blue focus:ring-microsoft-blue/20 rounded-xl transition-all duration-300"
              required
            />
          </div>
        </div>
        
        {/* Campo Senha */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Senha
            </Label>
            <Link 
              to="/cliente/esqueci-senha" 
              className="text-sm text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="pl-10 pr-10 h-12 border-gray-300 focus:border-microsoft-blue focus:ring-microsoft-blue/20 rounded-xl transition-all duration-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Botão de Login */}
        <Button 
          type="submit" 
          disabled={isLoading || !email || !password}
          className="w-full h-12 bg-gradient-to-r from-microsoft-blue to-blue-600 hover:from-microsoft-blue/90 hover:to-blue-600/90 text-white font-semibold rounded-xl shadow-lg hover-scale transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Entrando...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <LogIn className="mr-2 h-5 w-5" />
              Entrar na Conta
            </div>
          )}
        </Button>
        
        {/* Link para cadastro */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link 
              to="/register" 
              className="text-microsoft-blue hover:text-blue-600 font-semibold transition-colors duration-300 hover:underline"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;