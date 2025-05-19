
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { defaultSettings } from './defaultSettings';
import { fetchSettingsFromDB, saveSettingsToDB, testSmtpConnection } from './settingsUtils';
import type { CompanySettings } from './types';

export const useSettingsManager = () => {
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
      const data = await fetchSettingsFromDB();
      
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

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: value === 'true'
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
        smtp_secure: settings.smtp_secure,
        currency_locale: settings.currency_locale,
        currency_code: settings.currency_code,
        currency_min_digits: settings.currency_min_digits,
        currency_max_digits: settings.currency_max_digits,
        email_template_order: settings.email_template_order,
        // Add Multicaixa Express fields
        multicaixa_frametoken: settings.multicaixa_frametoken,
        multicaixa_callback: settings.multicaixa_callback,
        multicaixa_success: settings.multicaixa_success,
        multicaixa_error: settings.multicaixa_error,
        multicaixa_cssurl: settings.multicaixa_cssurl,
      };
      
      await saveSettingsToDB(settingsToSave);
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
      await testSmtpConnection(settings);
      toast.success('Teste de email enviado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao testar SMTP: ${error.message || 'Verifique as configurações'}`);
    } finally {
      setTestingSmtp(false);
    }
  };
  
  return {
    settings,
    setSettings,
    loading,
    saving,
    testingSmtp,
    handleInputChange,
    handleNumberInputChange,
    handleSelectChange,
    handleSaveSettings,
    handleTestSmtp
  };
};
