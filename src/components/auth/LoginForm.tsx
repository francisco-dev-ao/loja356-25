
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';

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
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/cliente/esqueci-senha" className="text-xs text-microsoft-blue hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Entrando...
            </span>
          ) : (
            <span className="flex items-center">
              <LogIn size={16} className="mr-2" />
              Entrar
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
