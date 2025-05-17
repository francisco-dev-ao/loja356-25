
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingNif, setIsCheckingNif] = useState(false);
  const [nifError, setNifError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNifBlur = async () => {
    if (!nif) return;
    
    setIsCheckingNif(true);
    setNifError('');
    
    try {
      // Call the API to check the NIF/BI
      const response = await fetch(`https://consulta.edgarsingui.ao/public/consultar-por-nif/${nif}`);
      const data = await response.json();
      
      if (data.data && data.data.success) {
        // Auto-fill fields with data from API
        setCompanyName(data.data.nome || '');
        setAddress(data.data.endereco || '');
        toast.success('Dados encontrados e preenchidos automaticamente!');
      } else {
        setNifError('NIF ou BI não encontrado. Verifique se está correto.');
      }
    } catch (error) {
      console.error('Error fetching NIF data:', error);
      setNifError('Erro ao consultar o NIF ou BI. Por favor, tente novamente.');
    } finally {
      setIsCheckingNif(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) {
      setPhone(value.slice(0, 9));
    } else {
      setPhone(value);
    }
  };

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
      // Here you would normally send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Conta criada com sucesso!');
      navigate('/cliente/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateNifFormat = (value: string) => {
    // Check if it's a potential NIF (numbers only, up to 10 digits)
    const nifRegex = /^\d{1,10}$/;
    // Check if it's a potential BI (alphanumeric, typical format like 006887386BE049)
    const biRegex = /^[0-9A-Z]{1,15}$/;
    
    return nifRegex.test(value) || biRegex.test(value);
  };

  const handleNifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || validateNifFormat(value)) {
      setNif(value.toUpperCase());
      setNifError('');
    }
  };

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-microsoft-blue p-8 text-white hidden md:flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Bem-vindo à LicençasPRO</h2>
                <p className="mb-6">Crie sua conta para acessar licenças Microsoft originais com os melhores preços.</p>
                <img 
                  src="/placeholder.svg" 
                  alt="Register" 
                  className="w-4/5 mx-auto"
                />
              </div>
              
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">Criar nova conta</h3>
                  <p className="text-muted-foreground">Preencha o formulário com seus dados</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* NIF/BI Field */}
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF ou B.I</Label>
                      <Input
                        id="nif"
                        type="text"
                        value={nif}
                        onChange={handleNifChange}
                        onBlur={handleNifBlur}
                        placeholder="NIF ou B.I"
                        className={nifError ? "border-red-500" : ""}
                        disabled={isCheckingNif}
                        required
                      />
                      {isCheckingNif && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <div className="animate-spin h-4 w-4 border-2 border-microsoft-blue border-t-transparent rounded-full mr-2"></div>
                          <span>Consultando seus dados...</span>
                        </div>
                      )}
                      {nifError && <p className="text-red-500 text-sm">{nifError}</p>}
                      <p className="text-xs text-muted-foreground">
                        Ao informar o NIF, preencheremos alguns campos automaticamente.
                      </p>
                    </div>
                    
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
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crie uma senha segura"
                            className="pr-10"
                            required
                          />
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={handlePhoneInput}
                            placeholder="9XXXXXXXX"
                            pattern="9[0-9]{8}"
                            maxLength={9}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          O número deve ter 9 dígitos e começar com 9.
                        </p>
                      </div>
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
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
