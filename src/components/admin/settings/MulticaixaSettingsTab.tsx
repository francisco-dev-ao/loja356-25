
import React from 'react';
import { useSettings } from './SettingsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMulticaixaConfig } from '@/hooks/admin/use-multicaixa-config';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const MulticaixaSettingsTab = () => {
  const { 
    settings,
    handleInputChange,
    handleSaveSettings,
    saving 
  } = useSettings();
  
  const { 
    config, 
    loading, 
    saveConfig
  } = useMulticaixaConfig();

  const handleSave = async () => {
    try {
      await handleSaveSettings();
      toast.success('Configurações do Multicaixa Express salvas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar as configurações: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleSaveConfig = async () => {
    try {
      await saveConfig(config);
      toast.success('Configurações avançadas do Multicaixa Express salvas com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar as configurações avançadas: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Configurações do Multicaixa Express</h3>
          <p className="text-sm text-muted-foreground">
            Configure o serviço de pagamento Multicaixa Express
          </p>
        </div>
        <CreditCard size={32} className="text-microsoft-blue" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="multicaixa_frametoken">Token do Frame</Label>
              <Input
                id="multicaixa_frametoken"
                name="multicaixa_frametoken"
                value={settings.multicaixa_frametoken || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Insira o token fornecido pelo EMIS"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Token de acesso fornecido pelo portal EMIS
              </p>
            </div>

            <div>
              <Label htmlFor="multicaixa_callback">URL de Callback</Label>
              <Input
                id="multicaixa_callback"
                name="multicaixa_callback"
                value={settings.multicaixa_callback || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder={`${window.location.origin}/api/payment-callback`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL para receber notificações de pagamento
              </p>
            </div>

            <div>
              <Label htmlFor="multicaixa_success">URL de Sucesso</Label>
              <Input
                id="multicaixa_success"
                name="multicaixa_success"
                value={settings.multicaixa_success || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder={`${window.location.origin}/checkout/success`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL para redirecionamento após pagamento bem-sucedido
              </p>
            </div>

            <div>
              <Label htmlFor="multicaixa_error">URL de Erro</Label>
              <Input
                id="multicaixa_error"
                name="multicaixa_error"
                value={settings.multicaixa_error || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder={`${window.location.origin}/checkout/failed`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL para redirecionamento após falha no pagamento
              </p>
            </div>

            <div>
              <Label htmlFor="multicaixa_cssurl">URL do CSS</Label>
              <Input
                id="multicaixa_cssurl"
                name="multicaixa_cssurl"
                value={settings.multicaixa_cssurl || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder={`${window.location.origin}/multicaixa-express.css`}
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL do arquivo CSS para personalização da página de pagamento
              </p>
            </div>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Advanced configuration section - directly from multicaixa_express_config table */}
      <div>
        <h3 className="text-lg font-medium">Configurações Avançadas</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configurações avançadas para o Multicaixa Express
        </p>

        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-microsoft-blue border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frame_token">Token do Frame (Configuração Avançada)</Label>
                  <Input
                    id="frame_token"
                    name="frame_token"
                    value={config?.frame_token || ''}
                    onChange={(e) => {
                      if (config) {
                        config.frame_token = e.target.value;
                      }
                    }}
                    className="mt-1"
                    placeholder="Token EMIS para configuração avançada"
                  />
                </div>

                <div>
                  <Label htmlFor="callback_url">URL de Callback (Configuração Avançada)</Label>
                  <Input
                    id="callback_url"
                    name="callback_url"
                    value={config?.callback_url || ''}
                    onChange={(e) => {
                      if (config) {
                        config.callback_url = e.target.value;
                      }
                    }}
                    className="mt-1"
                    placeholder={`${window.location.origin}/api/payment-callback`}
                  />
                </div>

                <div>
                  <Label htmlFor="success_url">URL de Sucesso (Configuração Avançada)</Label>
                  <Input
                    id="success_url"
                    name="success_url"
                    value={config?.success_url || ''}
                    onChange={(e) => {
                      if (config) {
                        config.success_url = e.target.value;
                      }
                    }}
                    className="mt-1"
                    placeholder={`${window.location.origin}/checkout/success`}
                  />
                </div>

                <div>
                  <Label htmlFor="error_url">URL de Erro (Configuração Avançada)</Label>
                  <Input
                    id="error_url"
                    name="error_url"
                    value={config?.error_url || ''}
                    onChange={(e) => {
                      if (config) {
                        config.error_url = e.target.value;
                      }
                    }}
                    className="mt-1"
                    placeholder={`${window.location.origin}/checkout/failed`}
                  />
                </div>

                <div>
                  <Label htmlFor="css_url">URL do CSS (Configuração Avançada)</Label>
                  <Input
                    id="css_url"
                    name="css_url"
                    value={config?.css_url || ''}
                    onChange={(e) => {
                      if (config) {
                        config.css_url = e.target.value;
                      }
                    }}
                    className="mt-1"
                    placeholder={`${window.location.origin}/multicaixa-express.css`}
                  />
                </div>

                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
                    <Input
                      id="commission_rate"
                      name="commission_rate"
                      type="number"
                      value={config?.commission_rate || 0}
                      onChange={(e) => {
                        if (config) {
                          config.commission_rate = parseFloat(e.target.value) || 0;
                        }
                      }}
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="is_active">Status</Label>
                    <select
                      id="is_active"
                      name="is_active"
                      value={config?.is_active ? 'true' : 'false'}
                      onChange={(e) => {
                        if (config) {
                          config.is_active = e.target.value === 'true';
                        }
                      }}
                      className="w-full mt-1 border-input bg-background px-3 py-2 text-sm ring-offset-background rounded-md border"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações Avançadas'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MulticaixaSettingsTab;
