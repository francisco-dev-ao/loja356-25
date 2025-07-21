import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface MulticaixaExpressConfig {
  id?: string;
  frame_token: string;
  pos_id: string;
  return_url: string;
  callback_url?: string;
  success_url?: string;
  error_url?: string;
  css_url?: string;
  commission_rate?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useMulticaixaExpressConfig = () => {
  const [config, setConfig] = useState<MulticaixaExpressConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await apiClient.getMulticaixaExpressConfig();

      if (error) {
        console.error('Erro ao carregar configuração:', error);
        toast.error('Erro ao carregar configuração do Multicaixa Express');
        return null;
      }

      setConfig(data as MulticaixaExpressConfig);
      return data;
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração do Multicaixa Express');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfig = async (newConfig: Partial<MulticaixaExpressConfig>) => {
    try {
      setSaving(true);
      
      const { data, error } = await apiClient.saveMulticaixaExpressConfig(newConfig);

      if (error) {
        throw new Error(error);
      }

      setConfig(data as MulticaixaExpressConfig);
      toast.success('Configuração salva com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      toast.error(`Erro ao salvar configuração: ${error.message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const toggleActive = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const newActiveStatus = !config.is_active;
      
      const { data, error } = await apiClient.saveMulticaixaExpressConfig({
        ...config,
        is_active: newActiveStatus
      });

      if (error) throw new Error(error);

      setConfig(data as MulticaixaExpressConfig);
      toast.success(
        newActiveStatus 
          ? 'Multicaixa Express ativado com sucesso!' 
          : 'Multicaixa Express desativado com sucesso!'
      );
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast.error(`Erro ao alterar status: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Test configuration
  const testConfig = async () => {
    if (!config) {
      toast.error('Nenhuma configuração encontrada');
      return false;
    }

    try {
      setSaving(true);
      
      // Test EMIS API connection
      const testData = {
        reference: 'TEST-' + Date.now(),
        amount: 100,
        token: config.frame_token,
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        callbackUrl: config.callback_url || config.return_url,
      };

      const response = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Teste de configuração bem-sucedido:', data);
        toast.success('Configuração testada com sucesso!');
        return true;
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error: any) {
      console.error('❌ Erro no teste de configuração:', error);
      toast.error(`Erro no teste: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Get payment statistics (disabled for now - would need API endpoint)
  const getPaymentStats = async () => {
    return {
      total: 0,
      pending: 0,
      completed: 0,
      failed: 0,
      totalAmount: 0
    };
  };

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    saving,
    loadConfig,
    saveConfig,
    toggleActive,
    testConfig,
    getPaymentStats
  };
}; 