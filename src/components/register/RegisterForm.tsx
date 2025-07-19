
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NifInput } from './NifInput';
import { PhoneInput } from './PhoneInput';
import { PasswordInput } from './PasswordInput';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface RegisterFormProps {
  redirectAfter?: boolean;
}

export const RegisterForm = ({ redirectAfter = true }: RegisterFormProps) => {
  const navigate = useNavigate();
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nifError, setNifError] = useState('');
  const [isAutoFilledName, setIsAutoFilledName] = useState(false);
  const [isAutoFilledNif, setIsAutoFilledNif] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const nifRef = useRef<HTMLInputElement>(null);
  const [isAutoFilledAddress, setIsAutoFilledAddress] = useState(false);
  const [isAutoFilledPhone, setIsAutoFilledPhone] = useState(false);
  const [isNomeFiscalBloqueado, setIsNomeFiscalBloqueado] = useState(false);
  const [isNifBloqueado, setIsNifBloqueado] = useState(false);

  // Remover o useEffect do listener de telefone preenchido

  // Novo: bloquear edição de nome e endereço se preenchidos
  const isLockedName = companyName.length > 0;
  const isLockedAddress = address.length > 0;

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
          .from('profiles')          .update({
            name: companyName,
            nif: nif,
            phone: phone,
            address: address,
            role: 'customer'
          })
          .eq('id', data.user.id);
        
        if (profileError) throw profileError;
      }
      
      toast.success('Conta criada com sucesso! Por favor, verifique seu email para confirmar o registro.');
      if (redirectAfter) {
        navigate('/cliente/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validação de senha forte
  const isStrongPassword = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  // Validação de e-mail
  const isValidEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  // Validação de telefone
  const isValidPhone = /^9\d{8}$/.test(phone);
  // Validação de NIF
  const isValidNif = nif.length > 0 && !nifError;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-10 space-y-10 border border-microsoft-blue/20 relative overflow-hidden">
      <TooltipProvider>
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-microsoft-blue/10 rounded-full blur-2xl z-0" />
      <h2 className="text-3xl font-extrabold text-microsoft-blue mb-2 tracking-tight drop-shadow">Criar Conta</h2>
      <p className="text-muted-foreground mb-6">Preencha seus dados para acessar a plataforma.</p>

      {/* Bloco: Dados Fiscais */}
      <fieldset className="space-y-2 border-b pb-6">
        <legend className="font-semibold text-lg text-microsoft-blue">Dados Fiscais</legend>
        <NifInput 
          nif={nif}
          setNif={(v) => {
            setNif(v);
            if (!v) {
              setCompanyName('');
              setIsNomeFiscalBloqueado(false);
              setIsNifBloqueado(false);
              setIsAutoFilledPhone(false);
              setIsAutoFilledAddress(false);
            } else {
              setIsNomeFiscalBloqueado(false);
              setIsNifBloqueado(false);
            }
          }}
          setCompanyName={(v) => {
            setCompanyName(v);
            setIsNomeFiscalBloqueado(true);
            setIsNifBloqueado(true);
          }}
          setAddress={(v) => { setAddress(v); setIsAutoFilledAddress(true); }}
          setPhone={(v) => { setPhone(v); setIsAutoFilledPhone(true); }}
          setNifError={setNifError}
          nifError={nifError}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome Fiscal</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setIsNomeFiscalBloqueado(false); }}
                    placeholder="Nome Fiscal"
                    className={`pl-10 ${isNomeFiscalBloqueado ? 'bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40' : ''}`}
                    required
                    readOnly={isNomeFiscalBloqueado}
                  />
                </div>
              </TooltipTrigger>
              {isNomeFiscalBloqueado && (
                <TooltipContent side="top">Campo preenchido automaticamente e não pode ser editado</TooltipContent>
              )}
            </Tooltip>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setIsAutoFilledAddress(false); }}
                  placeholder="Seu endereço completo"
                  className={isAutoFilledAddress ? 'bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40' : ''}
                  required
                  readOnly={isAutoFilledAddress}
                />
              </TooltipTrigger>
              {isAutoFilledAddress && (
                <TooltipContent side="top">Campo preenchido automaticamente e não pode ser editado</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </fieldset>

      {/* Bloco: Contato */}
      <fieldset className="space-y-2 border-b pb-4">
        <legend className="font-semibold text-lg text-microsoft-blue">Contato</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <PhoneInput 
                  phone={phone} 
                  setPhone={(v) => { setPhone(v); setIsAutoFilledPhone(false); }}
                  isAutoFilled={isAutoFilledPhone}
                />
              </TooltipTrigger>
              {isAutoFilledPhone && (
                <TooltipContent side="top">Campo preenchido automaticamente e não pode ser editado</TooltipContent>
              )}
            </Tooltip>
            {!isValidPhone && phone && (
              <div className="flex items-center text-red-500 text-xs mt-1"><AlertCircle size={14} className="mr-1" />Telefone inválido</div>
            )}
          </div>
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
            {!isValidEmail && email && (
              <div className="flex items-center text-red-500 text-xs mt-1"><AlertCircle size={14} className="mr-1" />Email inválido</div>
            )}
          </div>
        </div>
      </fieldset>

      {/* Bloco: Segurança */}
      <fieldset className="space-y-2">
        <legend className="font-semibold text-lg text-microsoft-blue">Segurança</legend>
        <PasswordInput password={password} setPassword={setPassword} />
        <div className="flex items-center text-xs mt-1">
          {isStrongPassword ? (
            <span className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1" />Senha forte</span>
          ) : (
            <span className="flex items-center text-yellow-600"><AlertCircle size={14} className="mr-1" />Use pelo menos 8 caracteres, 1 letra maiúscula e 1 número</span>
          )}
        </div>
      </fieldset>

      <Button
        type="submit"
        className="w-full bg-microsoft-blue hover:bg-microsoft-blue/90 text-lg py-3 mt-4 flex items-center justify-center"
        disabled={isLoading || !isValidNif || !isValidPhone || !isValidEmail || !isStrongPassword}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Criando conta...
          </>
        ) : (
          <>
            <User className="mr-2" /> Criar nova conta
          </>
        )}
      </Button>
      </TooltipProvider>
    </form>
  );
};

export default RegisterForm;
