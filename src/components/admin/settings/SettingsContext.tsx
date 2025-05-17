
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { saveCurrencySettings } from '@/lib/formatters';

// Define a type for the company settings that matches our database structure
export type CompanySettings = {
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
export const defaultSettings: CompanySettings = {
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

type SettingsContextType = {
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  loading: boolean;
  saving: boolean;
  testingSmtp: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveSettings: () => Promise<void>;
  handleTestSmtp: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'company-settings')
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Merge the returned data with default settings to ensure all required fields exist
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
  
  const value = {
    settings,
    setSettings,
    loading,
    saving,
    testingSmtp,
    handleInputChange,
    handleNumberInputChange,
    handleSaveSettings,
    handleTestSmtp
  };
  
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
