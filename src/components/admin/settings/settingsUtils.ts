
import { supabase } from '@/integrations/supabase/client';
import { saveCurrencySettings } from '@/lib/formatters';
import { toast } from 'sonner';
import { CompanySettings } from './types';

export const fetchSettingsFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'company-settings')
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    toast.error('Erro ao carregar configurações da empresa');
    return null;
  }
};

export const saveSettingsToDB = async (settings: CompanySettings) => {
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
    
    // Update currency settings in localStorage for immediate use
    const currencySettings = {
      locale: settings.currency_locale,
      currency: settings.currency_code,
      minDigits: settings.currency_min_digits,
      maxDigits: settings.currency_max_digits
    };
    localStorage.setItem('currencySettings', JSON.stringify(currencySettings));
    saveCurrencySettings(currencySettings);
    
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const testSmtpConnection = async (settings: CompanySettings) => {
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
        secure: settings.smtp_secure
      }
    });
    
    if (response.error) {
      console.error("SMTP test error:", response.error);
      throw new Error(response.error.message || "Erro ao conectar com o servidor SMTP");
    }
    
    const data = response.data;
    
    if (!data.success) {
      console.error("SMTP test failed:", data);
      throw new Error(data.message || 'Falha no teste de conexão SMTP');
    }
    
    return true;
  } catch (error) {
    console.error('Error testing SMTP:', error);
    throw error;
  }
};
