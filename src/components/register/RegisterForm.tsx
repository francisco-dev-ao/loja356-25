
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <TooltipProvider>
      
      {/* Header elegante */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Criar Nova Conta</h2>
        <p className="text-gray-600">Preencha seus dados para acessar a plataforma</p>
      </div>

      {/* Bloco: Dados Fiscais */}
      <fieldset className="space-y-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/50 rounded-2xl p-6">
        <legend className="font-semibold text-lg text-microsoft-blue px-3">📋 Dados Fiscais</legend>
        <NifInput 
          nif={nif}
          setNif={(v) => {
            setNif(v);
            if (!v) {
              // Limpar todos os dados quando NIF é apagado
              setCompanyName('');
              setAddress('');
              setPhone('');
              setIsNomeFiscalBloqueado(false);
              setIsAutoFilledPhone(false);
              setIsAutoFilledAddress(false);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Nome Fiscal</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      // Nome Fiscal nunca pode ser editado manualmente
                      // Apenas preenchimento automático via NIF
                    }}
                    placeholder="Nome Fiscal (preenchido automaticamente)"
                    className="pl-10 h-12 bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40 rounded-xl"
                    required
                    readOnly={true}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Nome fiscal obtido automaticamente via consulta de NIF</TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Endereço</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setIsAutoFilledAddress(false); }}
                  placeholder="Endereço (preenchido automaticamente)"
                  className="h-12 bg-gray-100 cursor-not-allowed border-dashed border-microsoft-blue/40 rounded-xl"
                  required
                  readOnly={true}
                />
              </TooltipTrigger>
              <TooltipContent side="top">Endereço obtido automaticamente via consulta de NIF</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </fieldset>

      {/* Bloco: Contato */}
      <fieldset className="space-y-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-200/50 rounded-2xl p-6">
        <legend className="font-semibold text-lg text-microsoft-blue px-3">📞 Contato</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefone</Label>
            <PhoneInput 
              phone={phone} 
              setPhone={setPhone}
              isAutoFilled={false}
            />
            {!isValidPhone && phone && (
              <div className="flex items-center text-red-500 text-xs mt-1"><AlertCircle size={14} className="mr-1" />Telefone inválido</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="pl-10 h-12 border-gray-300 focus:border-microsoft-blue focus:ring-microsoft-blue/20 rounded-xl transition-all duration-300"
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
      <fieldset className="space-y-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-200/50 rounded-2xl p-6">
        <legend className="font-semibold text-lg text-microsoft-blue px-3">🔒 Segurança</legend>
        <PasswordInput password={password} setPassword={setPassword} />
        <div className="flex items-center text-xs mt-1">
          {isStrongPassword ? (
            <span className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1" />Senha forte</span>
          ) : (
            <span className="flex items-center text-yellow-600"><AlertCircle size={14} className="mr-1" />Use pelo menos 8 caracteres, 1 letra maiúscula e 1 número</span>
          )}
        </div>
      </fieldset>

      <div className="pt-6">
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-microsoft-blue to-blue-600 hover:from-microsoft-blue/90 hover:to-blue-600/90 text-white font-semibold text-lg rounded-xl shadow-lg hover-scale transition-all duration-300 disabled:opacity-50"
          disabled={isLoading || !isValidNif || !isValidPhone || !isValidEmail || !isStrongPassword}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Criando conta...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <User className="mr-2 h-5 w-5" />
              Criar Nova Conta
            </div>
          )}
        </Button>
        
        {/* Link para login */}
        <div className="text-center pt-6">
          <p className="text-sm text-gray-600">
            Já possui uma conta?{' '}
            <Link 
              to="/cliente/login" 
              className="text-microsoft-blue hover:text-blue-600 font-semibold transition-colors duration-300 hover:underline"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
      </TooltipProvider>
    </form>
  );
};

export default RegisterForm;
