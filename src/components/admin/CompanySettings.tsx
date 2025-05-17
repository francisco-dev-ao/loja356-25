import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Building, Mail, Currency, MailCheck } from 'lucide-react';
import { formatCurrency, saveCurrencySettings } from '@/lib/formatters';

// Define a type for the company settings that matches our database structure
type CompanySettings = {
  id: string;
  name: string | null;
  address: string | null;
  nif: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  smtp_host: string | null;
  smtp_port: string | null;
  smtp_user: string | null;
  smtp_password: string | null;
  smtp_from_email: string | null;
  smtp_from_name: string | null;
  currency_locale: string;
  currency_code: string;
  currency_min_digits: number;
  currency_max_digits: number;
  email_template_order: string;
  created_at?: string | null;
  updated_at?: string | null;
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
  currency_locale: 'pt-AO',
  currency_code: 'AOA',
  currency_min_digits: 2,
  currency_max_digits: 2,
  email_template_order: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmação de Pedido - {{company_name}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0072CE; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f8f9fa; padding: 20px; }
    .footer { background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background-color: #f1f1f1; padding: 10px; text-align: left; }
    .button { background-color: #0072CE; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{company_name}}</h1>
      <p>{{company_tagline}}</p>
    </div>
    
    <div class="content">
      <h2>Confirmação de Pedido</h2>
      <p>Olá {{customer_name}},</p>
      <p>Seu pedido foi recebido e está sendo processado. Abaixo seguem os detalhes do seu pedido:</p>
      
      <h3>Informações do Pedido:</h3>
      <p><strong>Número do Pedido:</strong> {{order_id}}</p>
      <p><strong>Data:</strong> {{order_date}}</p>
      <p><strong>Status:</strong> {{order_status}}</p>
      <p><strong>Método de Pagamento:</strong> {{payment_method}}</p>
      <p><strong>Status de Pagamento:</strong> {{payment_status}}</p>
      
      <h3>Itens do Pedido:</h3>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th style="text-align: center;">Quantidade</th>
            <th style="text-align: right;">Preço</th>
          </tr>
        </thead>
        <tbody>
          {{order_items}}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>{{order_total}}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <p>Após a confirmação do pagamento, você receberá suas licenças por email.</p>
      
      <p style="text-align: center; margin: 20px 0;">
        <a href="{{customer_dashboard_url}}" class="button">Acessar Área do Cliente</a>
      </p>
    </div>
    
    <div class="footer">
      <p>{{company_name}} | {{company_address}}</p>
      <p>NIF: {{company_nif}} | Tel: {{company_phone}} | Email: {{company_email}}</p>
      <p>&copy; {{current_year}} {{company_name}}. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `
};

const CompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [previewAmount, setPreviewAmount] = useState(1000);
  const [formattedPreview, setFormattedPreview] = useState('');
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  useEffect(() => {
    // Update currency preview when settings change
    try {
      const preview = new Intl.NumberFormat(settings.currency_locale, {
        style: 'currency',
        currency: settings.currency_code,
        minimumFractionDigits: settings.currency_min_digits,
        maximumFractionDigits: settings.currency_max_digits
      }).format(previewAmount);
      
      setFormattedPreview(preview);
    } catch (error) {
      console.error('Error formatting currency preview:', error);
      setFormattedPreview('Formato inválido');
    }
  }, [settings.currency_locale, settings.currency_code, settings.currency_min_digits, settings.currency_max_digits, previewAmount]);
  
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
        // Fix: Merge the returned data with default settings to ensure all required fields exist
        // This ensures we handle missing fields in the database while preserving existing values
        const mergedSettings: CompanySettings = {
          ...defaultSettings,
          ...data as any
        };
        
        setSettings(mergedSettings);
        
        // Save currency settings to localStorage
        const currencySettings = {
          locale: mergedSettings.currency_locale || 'pt-AO',
          currency: mergedSettings.currency_code || 'AOA',
          minDigits: mergedSettings.currency_min_digits || 2,
          maxDigits: mergedSettings.currency_max_digits || 2
        };
        localStorage.setItem('currencySettings', JSON.stringify(currencySettings));
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
      toast.error('Erro ao carregar configurações da empresa');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };
  
  const handlePreviewAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Convert to a proper number regardless of whether it uses . or , as decimal separator
    const cleanedValue = rawValue.replace(/,/g, '.');
    const numValue = parseFloat(cleanedValue);
    
    if (!isNaN(numValue)) {
      setPreviewAmount(numValue);
    } else if (rawValue === '' || rawValue === '.' || rawValue === ',') {
      // Allow empty input or just a decimal separator
      setPreviewAmount(0);
    }
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Create a clean version of settings to send to Supabase
      const settingsToSave = {
        id: settings.id,
        name: settings.name,
        address: settings.address,
        nif: settings.nif,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_user: settings.smtp_user,
        smtp_password: settings.smtp_password,
        smtp_from_email: settings.smtp_from_email,
        smtp_from_name: settings.smtp_from_name,
        currency_locale: settings.currency_locale,
        currency_code: settings.currency_code,
        currency_min_digits: settings.currency_min_digits,
        currency_max_digits: settings.currency_max_digits,
        email_template_order: settings.email_template_order,
      };
      
      console.log('Saving settings:', settingsToSave);
      
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
          .insert(settingsToSave);
        
        if (insertError) throw insertError;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('settings')
          .update(settingsToSave)
          .eq('id', 'company-settings');
        
        if (updateError) throw updateError;
      }
      
      // Update currency settings in localStorage for immediate use
      const currencySettings = {
        locale: settings.currency_locale,
        currency: settings.currency_code,
        minDigits: settings.currency_min_digits,
        maxDigits: settings.currency_max_digits
      };
      localStorage.setItem('currencySettings', JSON.stringify(currencySettings));
      saveCurrencySettings(currencySettings);
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const response = await supabase.functions.invoke('test-smtp', {
        body: {
          host: settings.smtp_host,
          port: settings.smtp_port,
          user: settings.smtp_user,
          password: settings.smtp_password,
          from_email: settings.smtp_from_email,
          from_name: settings.smtp_from_name,
          to_email: settings.email, // Send test email to company email
        }
      });
      
      console.log("SMTP test response:", response);
      
      if (response.error) {
        console.error("SMTP test error:", response.error);
        throw new Error(response.error.message || "Erro ao conectar com o servidor SMTP");
      }
      
      const data = response.data;
      
      if (!data.success) {
        console.error("SMTP test failed:", data);
        throw new Error(data.message || 'Falha no teste de conexão SMTP');
      }
      
      toast.success('Teste de email enviado com sucesso!');
    } catch (error: any) {
      console.error('Error testing SMTP:', error);
      toast.error(`Erro ao testar SMTP: ${error.message || 'Verifique as configurações'}`);
    } finally {
      setTestingSmtp(false);
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
          <TabsTrigger value="currency">
            <Currency size={16} className="mr-2" />
            Configurações de Moeda
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MailCheck size={16} className="mr-2" />
            Modelos de Email
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
                      value={settings.name || ''}
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
                      value={settings.nif || ''}
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
                      value={settings.address || ''}
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
                      value={settings.phone || ''}
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
                      value={settings.email || ''}
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
                      value={settings.website || ''}
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
                      value={settings.smtp_host || ''}
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
                      value={settings.smtp_port || ''}
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
                      value={settings.smtp_user || ''}
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
                      value={settings.smtp_password || ''}
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
                      value={settings.smtp_from_email || ''}
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
                      value={settings.smtp_from_name || ''}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Minha Empresa"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <Button 
                  onClick={handleTestSmtp} 
                  variant="outline"
                  disabled={testingSmtp || !settings.smtp_host || !settings.smtp_user || !settings.smtp_password}
                >
                  {testingSmtp ? 'Testando...' : 'Testar Conexão SMTP'}
                </Button>
                
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações SMTP'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Moeda</CardTitle>
              <CardDescription>
                Defina como os valores monetários serão exibidos em todo o sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Código da Moeda
                    <Input
                      name="currency_code"
                      value={settings.currency_code}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="AOA"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use o código internacional da moeda (Ex: AOA, USD, EUR).
                    </p>
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Localização para Formatação
                    <Input
                      name="currency_locale"
                      value={settings.currency_locale}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="pt-AO"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Define como separadores e decimais serão exibidos (Ex: pt-AO, pt-BR, en-US).
                    </p>
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mínimo de Casas Decimais
                    <Input
                      name="currency_min_digits"
                      type="number"
                      min="0"
                      max="10"
                      value={settings.currency_min_digits}
                      onChange={handleNumberInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Máximo de Casas Decimais
                    <Input
                      name="currency_max_digits"
                      type="number"
                      min="0"
                      max="10"
                      value={settings.currency_max_digits}
                      onChange={handleNumberInputChange}
                      className="mt-1"
                    />
                  </label>
                </div>
              </div>
              
              <div className="mt-6 bg-slate-50 p-4 rounded-md border">
                <h3 className="text-sm font-medium mb-2">Visualização da Formatação</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <Input
                      type="text"
                      value={previewAmount.toString().replace('.', ',')}
                      onChange={handlePreviewAmountChange}
                      placeholder="Valor (ex: 1000,00)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Insira o valor usando vírgula ou ponto como separador decimal
                    </p>
                  </div>
                  <div className="text-2xl font-semibold">→</div>
                  <div className="bg-white px-4 py-2 border rounded-md text-lg font-semibold min-w-[200px] text-right">
                    {formattedPreview}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="mt-6"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Configurações de Moeda'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Modelo de Email para Pedidos</CardTitle>
              <CardDescription>
                Personalize o email enviado automaticamente aos clientes após a realização de um pedido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <textarea
                    name="email_template_order"
                    value={settings.email_template_order}
                    onChange={handleInputChange}
                    className="w-full h-[500px] p-4 font-mono text-sm border rounded-md"
                    placeholder="Digite o HTML do modelo de email aqui..."
                  />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-md border">
                  <h4 className="font-medium mb-2">Variáveis Disponíveis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use estas variáveis para incluir dados dinâmicos no template:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_name}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_tagline}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{customer_name}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{order_id}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{order_date}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{order_status}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{payment_method}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{payment_status}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{order_items}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{order_total}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{customer_dashboard_url}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_address}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_nif}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_phone}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{company_email}}'}</div>
                    <div className="text-xs bg-white p-2 rounded border">{'{{current_year}}'}</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                className="mt-6"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Modelo de Email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;
