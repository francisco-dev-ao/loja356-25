
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { NifInput } from './NifInput';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import { supabase } from '@/integrations/supabase/client';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nifError, setNifError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Número de telefone inválido. Deve ter 9 dígitos e começar com 9.');
      return;
    }
    
    // Validate NIF/BI
    if (!nif) {
      setNifError('O NIF/BI é obrigatório para criar uma conta.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Update profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: companyName,
            nif: nif,
            phone: phone,
            address: address
          })
          .eq('id', data.user.id);
        
        if (profileError) throw profileError;
      }
      
      toast.success('Conta criada com sucesso! Por favor, verifique seu email para confirmar o registro.');
      navigate('/cliente/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* NIF/BI Field */}
        <NifInput 
          nif={nif}
          setNif={setNif}
          setCompanyName={setCompanyName}
          setAddress={setAddress}
          setNifError={setNifError}
          nifError={nifError}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          {/* Password Field */}
          <PasswordInput
            password={password}
            setPassword={setPassword}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name Field */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome Fiscal</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome Fiscal"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          {/* Phone Field */}
          <PhoneInput
            phone={phone}
            setPhone={setPhone}
          />
        </div>
        
        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Seu endereço completo"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Criando conta...
            </span>
          ) : (
            "Criar nova conta"
          )}
        </Button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/cliente/login" className="text-microsoft-blue hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};
