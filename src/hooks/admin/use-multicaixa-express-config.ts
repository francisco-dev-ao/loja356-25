import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MulticaixaExpressConfig } from '@/services/payment/multicaixa-express';
import { toast } from 'sonner';

export const useMulticaixaExpressConfig = () => {
  const [config, setConfig] = useState<MulticaixaExpressConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('multicaixa_express_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao carregar configuração:', error);
        toast.error('Erro ao carregar configuração do Multicaixa Express');
        return null;
      }

      setConfig(data);
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
      
      let result;
      
      if (config?.id) {
        // Update existing config
        const { data, error } = await supabase
          .from('multicaixa_express_config')
          .update({
            ...newConfig,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('multicaixa_express_config')
          .insert({
            ...newConfig,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setConfig(result);
      toast.success('Configuração salva com sucesso!');
      return result;
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
      
      const { data, error } = await supabase
        .from('multicaixa_express_config')
        .update({
          is_active: newActiveStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id)
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
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
        cssUrl: config.css_url,
        callbackUrl: config.callback_url,
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

  // Get payment statistics
  const getPaymentStats = async () => {
    try {
      const { data: payments, error } = await supabase
        .from('multicaixa_express_payments')
        .select('*');

      if (error) throw error;

      const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'pending').length,
        completed: payments.filter(p => p.status === 'completed').length,
        failed: payments.filter(p => p.status === 'failed').length,
        totalAmount: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0)
      };

      return stats;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
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