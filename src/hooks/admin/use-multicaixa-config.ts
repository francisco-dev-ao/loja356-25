
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MulticaixaConfig } from '@/types/database';

export const useMulticaixaConfig = () => {
  const [config, setConfig] = useState<MulticaixaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('multicaixa_express_config')
        .select('*')
        .order('is_active', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // If no config exists, create a default one
      if (!data) {
        const defaultConfig: Omit<MulticaixaConfig, 'id' | 'created_at' | 'updated_at'> = {
          frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
          callback_url: `${window.location.origin}/api/payment-callback`,
          success_url: `${window.location.origin}/checkout/success`,
          error_url: `${window.location.origin}/checkout/failed`,
          css_url: `${window.location.origin}/multicaixa-express.css`,
          commission_rate: 0,
          is_active: true
        };

        const { data: newConfig, error: insertError } = await supabase
          .from('multicaixa_express_config')
          .insert(defaultConfig)
          .select('*')
          .single();

        if (insertError) {
          throw insertError;
        }

        setConfig(newConfig);
      } else {
        setConfig(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch Multicaixa Express config:', err);
      setError(err.message || 'Failed to fetch configuration');
      toast.error('Erro ao carregar configuração do Multicaixa Express');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!config) {
        throw new Error('No config to save');
      }

      // If we have an existing config
      if (config.id) {
        const { error } = await supabase
          .from('multicaixa_express_config')
          .update({
            frame_token: config.frame_token,
            callback_url: config.callback_url,
            success_url: config.success_url,
            error_url: config.error_url,
            css_url: config.css_url,
            commission_rate: config.commission_rate,
            is_active: config.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create a new config
        const { error } = await supabase
          .from('multicaixa_express_config')
          .insert({
            frame_token: config.frame_token,
            callback_url: config.callback_url,
            success_url: config.success_url,
            error_url: config.error_url,
            css_url: config.css_url,
            commission_rate: config.commission_rate,
            is_active: config.is_active
          });

        if (error) throw error;
      }

      // Refresh data
      fetchConfig();
      return true;
    } catch (err: any) {
      console.error('Failed to save Multicaixa Express config:', err);
      setError(err.message || 'Failed to save configuration');
      toast.error('Erro ao salvar configuração do Multicaixa Express');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    config,
    setConfig,
    isLoading,
    isSaving,
    error,
    fetchConfig,
    saveConfig
  };
};
