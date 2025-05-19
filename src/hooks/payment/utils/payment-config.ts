
import { supabase } from '@/integrations/supabase/client';
import { MulticaixaConfig, Settings } from '@/types/database';

/**
 * Utility functions for payment configuration
 */

/**
 * Get active Multicaixa Express configuration from config table
 */
export const getActiveMulticaixaConfig = async (): Promise<MulticaixaConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('multicaixa_express_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Multicaixa Express config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getActiveMulticaixaConfig:', error);
    return null;
  }
};

/**
 * Get Multicaixa settings from the settings table
 */
export const getMulticaixaSettings = async (): Promise<Settings | null> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select()
      .eq('id', 'company-settings')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getMulticaixaSettings:', error);
    return null;
  }
};
