
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { NifInput } from '../register/NifInput';
import { PhoneInput } from '../register/PhoneInput';
import { PasswordInput } from '../register/PasswordInput';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface RegisterFormProps {
  redirectAfter?: boolean;
}

const RegisterForm = ({ redirectAfter = true }: RegisterFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [nifError, setNifError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isNomeFiscalBloqueado, setIsNomeFiscalBloqueado] = useState(false);
  const [isAutoFilledPhone, setIsAutoFilledPhone] = useState(false);
  const [isAutoFilledAddress, setIsAutoFilledAddress] = useState(false);
  const isCartPage = location.pathname === '/carrinho';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate phone
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('Número de telefone inválido. Deve ter 9 dígitos e começar com 9.');
      return;
    }
    
    // Validate NIF/BI
    if (!nif) {
      setNifError('O NIF/BI é obrigatório para criar uma conta.');
      return;
    }
    
    try {
      // Register with auth
      await register(companyName, email, password);
      
      // Get the user ID from the newly created account
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')          .update({
            name: companyName,
            nif: nif,
            phone: phone,
            address: address,
            role: 'customer'
          })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
        
        // Only redirect if redirectAfter is true AND we're not on the cart page
        if (redirectAfter && !isCartPage) {
          navigate('/cliente/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
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
        
        {/* NIF/BI Field */}
        <NifInput 
          nif={nif}
          setNif={(v) => {
            setNif(v);
            if (!v) {
              setCompanyName('');
              setIsNomeFiscalBloqueado(false);
              setIsAutoFilledPhone(false);
              setIsAutoFilledAddress(false);
            }
          }}
          setCompanyName={(v) => {
            setCompanyName(v);
            setIsNomeFiscalBloqueado(true);
          }}
          setAddress={(v) => { setAddress(v); setIsAutoFilledAddress(true); }}
          setPhone={(v) => { setPhone(v); setIsAutoFilledPhone(true); }}
          setNifError={setNifError}
          nifError={nifError}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              required
            />
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
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => {
                // Não permite edição se foi preenchido automaticamente
                if (!isNomeFiscalBloqueado) {
                  setCompanyName(e.target.value);
                }
              }}
              placeholder="Nome Fiscal"
              className={isNomeFiscalBloqueado ? 'bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40' : ''}
              readOnly={isNomeFiscalBloqueado}
              required
            />
          </div>
          
          {/* Phone Field */}
          <PhoneInput
            phone={phone}
            setPhone={(v) => { setPhone(v); setIsAutoFilledPhone(false); }}
            isAutoFilled={isAutoFilledPhone}
          />
        </div>
        
        {/* Address Field */}
        <div className="space-y-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setIsAutoFilledAddress(false); }}
            placeholder="Seu endereço completo"
            className={isAutoFilledAddress ? 'bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40' : ''}
            readOnly={isAutoFilledAddress}
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
      </div>
    </form>
  );
};

export default RegisterForm;
