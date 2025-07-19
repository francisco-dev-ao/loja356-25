import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock, CheckCircle, X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode;
}

export const ChangePasswordDialog = ({ trigger }: ChangePasswordDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return validations;
  };

  const isPasswordValid = () => {
    const validation = validatePassword(passwords.newPassword);
    return validation.length && validation.uppercase && validation.number && validation.special;
  };

  const isFormValid = () => {
    return passwords.newPassword && 
           passwords.confirmPassword && 
           passwords.newPassword === passwords.confirmPassword && 
           isPasswordValid();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso! Por segurança, você será redirecionado para fazer login novamente.');
      
      // Reset form
      setPasswords({ newPassword: '', confirmPassword: '' });
      setIsOpen(false);

      // Logout and redirect after a delay
      setTimeout(() => {
        supabase.auth.signOut();
        navigate('/cliente/login');
      }, 2000);

    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Erro ao alterar a senha');
    } finally {
      setIsLoading(false);
    }
  };

  const validation = validatePassword(passwords.newPassword);
  const passwordsMatch = passwords.newPassword === passwords.confirmPassword;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="flex items-center">
            <Lock size={16} className="mr-2" />
            Alterar Senha
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="mr-2" size={20} />
            Alterar Senha
          </DialogTitle>
          <DialogDescription>
            Crie uma nova senha forte para sua conta. Você será desconectado após a alteração.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={passwords.newPassword}
              onChange={handleChange}
              className="focus:border-blue-500 focus:ring-blue-500"
            />
            {passwords.newPassword && (
              <div className="space-y-1">
                <div className={`flex items-center text-xs ${validation.length ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.length ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                  Pelo menos 8 caracteres
                </div>
                <div className={`flex items-center text-xs ${validation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.uppercase ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                  Uma letra maiúscula
                </div>
                <div className={`flex items-center text-xs ${validation.number ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.number ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                  Um número
                </div>
                <div className={`flex items-center text-xs ${validation.special ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.special ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                  Um caractere especial
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="focus:border-blue-500 focus:ring-blue-500"
            />
            {passwords.confirmPassword && (
              <div className="mt-2">
                <div className={`flex items-center text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? <CheckCircle size={12} className="mr-1" /> : <X size={12} className="mr-1" />}
                  {passwordsMatch ? 'Senhas coincidem' : 'Senhas não coincidem'}
                </div>
              </div>
            )}
          </div>

          {(passwords.newPassword || passwords.confirmPassword) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center text-amber-800 text-sm">
                <AlertTriangle size={16} className="mr-2" />
                <span>Você será desconectado automaticamente após alterar a senha.</span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid() || isLoading}
              className="bg-microsoft-blue hover:bg-microsoft-blue/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;