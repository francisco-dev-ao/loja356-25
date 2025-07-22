import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export const useMulticaixaConfig = () => {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getMulticaixaExpressConfig();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: any) => {
    setLoading(true);
    try {
      await apiClient.saveMulticaixaExpressConfig(newConfig);
      setConfig(newConfig);
      toast.success('Configuração salva com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return { config, loading, saveConfig, loadConfig };
};