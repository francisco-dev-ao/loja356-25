
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Building, Mail } from 'lucide-react';

// Define a type for the company settings that matches our database structure
type CompanySettings = {
  id: string;
  name: string;
  address: string;
  nif: string;
  phone: string;
  email: string;
  website: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
};

// Default settings to use if no settings are found in the database
const defaultSettings: CompanySettings = {
  id: 'company-settings',
  name: 'LicençasPRO, Lda',
  address: 'Rua Comandante Gika, n.º 100, Luanda, Angola',
  nif: '5417124080',
  phone: '+244 923 456 789',
  email: 'financeiro@licencaspro.ao',
  website: 'www.licencaspro.ao',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
};

const CompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Use the custom type to properly type-check our Supabase query
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'company-settings')
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Ensure the data conforms to our CompanySettings type
        setSettings(data as CompanySettings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast.error('Erro ao carregar configurações da empresa');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Check if settings exist
      const { data, error: checkError } = await supabase
        .from('settings')
        .select('id')
        .eq('id', 'company-settings')
        .maybeSingle();
      
      if (!data) {
        // No settings found, insert new record
        const { error: insertError } = await supabase
          .from('settings')
          .insert(settings);
        
        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('settings')
          .update(settings)
          .eq('id', 'company-settings');
        
        if (updateError) throw updateError;
      }
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Configurações do Sistema</h2>
      
      <Tabs defaultValue="company">
        <TabsList className="mb-6">
          <TabsTrigger value="company">
            <Building size={16} className="mr-2" />
            Dados da Empresa
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail size={16} className="mr-2" />
            Configurações de Email
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Estas informações serão utilizadas nas faturas e comunicações com clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nome da Empresa
                    <Input
                      name="name"
                      value={settings.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    NIF
                    <Input
                      name="nif"
                      value={settings.nif}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Endereço
                    <Input
                      name="address"
                      value={settings.address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Telefone
                    <Input
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email
                    <Input
                      name="email"
                      type="email"
                      value={settings.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Website
                    <Input
                      name="website"
                      value={settings.website}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="mt-6"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Configurações SMTP</CardTitle>
              <CardDescription>
                Configure o servidor de email para envio de notificações e faturas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Servidor SMTP (Host)
                    <Input
                      name="smtp_host"
                      value={settings.smtp_host}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="smtp.example.com"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Porta SMTP
                    <Input
                      name="smtp_port"
                      value={settings.smtp_port}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="587"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Usuário SMTP
                    <Input
                      name="smtp_user"
                      value={settings.smtp_user}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="user@example.com"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Senha SMTP
                    <Input
                      name="smtp_password"
                      type="password"
                      value={settings.smtp_password}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="••••••••"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Email de Envio (From)
                    <Input
                      name="smtp_from_email"
                      type="email"
                      value={settings.smtp_from_email}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="noreply@example.com"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nome de Envio (From)
                    <Input
                      name="smtp_from_name"
                      value={settings.smtp_from_name}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Minha Empresa"
                    />
                  </label>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="mt-6"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Configurações SMTP'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;
