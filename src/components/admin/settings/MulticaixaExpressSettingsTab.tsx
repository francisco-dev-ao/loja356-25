import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Save, 
  TestTube, 
  CreditCard, 
  Settings, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useMulticaixaExpressConfig } from '@/hooks/admin/use-multicaixa-express-config';
import { toast } from 'sonner';

const MulticaixaExpressSettingsTab = () => {
  const {
    config,
    loading,
    saving,
    saveConfig,
    toggleActive,
    testConfig,
    getPaymentStats
  } = useMulticaixaExpressConfig();

  const [formData, setFormData] = useState({
    frame_token: '',
    callback_url: '',
    success_url: '',
    error_url: '',
    css_url: '',
    commission_rate: 0
  });

  const [stats, setStats] = useState<any>(null);

  // Update form data when config loads
  React.useEffect(() => {
    if (config) {
      setFormData({
        frame_token: config.frame_token || '',
        callback_url: config.callback_url || '',
        success_url: config.success_url || '',
        error_url: config.error_url || '',
        css_url: config.css_url || '',
        commission_rate: config.commission_rate || 0
      });
    }
  }, [config]);

  // Load stats on mount
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const paymentStats = await getPaymentStats();
    setStats(paymentStats);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const result = await saveConfig(formData);
    if (result) {
      await loadStats(); // Reload stats after save
    }
  };

  const handleTest = async () => {
    const success = await testConfig();
    if (success) {
      await loadStats(); // Reload stats after test
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multicaixa Express</h2>
          <p className="text-muted-foreground">
            Configure o gateway de pagamento Multicaixa Express
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config?.is_active ? "default" : "secondary"}>
            {config?.is_active ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Inativo
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleActive}
            disabled={saving}
          >
            {config?.is_active ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {!config?.is_active && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            O Multicaixa Express está desativado. Ative-o para permitir pagamentos.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Estatísticas de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Falhados</div>
              </div>
            </div>
            {stats.totalAmount > 0 && (
              <div className="mt-4 text-center">
                <div className="text-lg font-bold text-green-600">
                  {stats.totalAmount.toLocaleString('pt-AO')} AOA
                </div>
                <div className="text-sm text-muted-foreground">Valor Total Processado</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frame_token">Frame Token *</Label>
              <Input
                id="frame_token"
                value={formData.frame_token}
                onChange={(e) => handleInputChange('frame_token', e.target.value)}
                placeholder="Token de autenticação EMIS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">URLs de Callback</h4>
            
            <div className="space-y-2">
              <Label htmlFor="callback_url">URL de Callback *</Label>
              <Input
                id="callback_url"
                value={formData.callback_url}
                onChange={(e) => handleInputChange('callback_url', e.target.value)}
                placeholder="https://seu-dominio.com/api/multicaixa-callback"
              />
              <p className="text-xs text-muted-foreground">
                URL onde o Multicaixa Express enviará notificações de pagamento
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="success_url">URL de Sucesso *</Label>
                <Input
                  id="success_url"
                  value={formData.success_url}
                  onChange={(e) => handleInputChange('success_url', e.target.value)}
                  placeholder="https://seu-dominio.com/success"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="error_url">URL de Erro *</Label>
                <Input
                  id="error_url"
                  value={formData.error_url}
                  onChange={(e) => handleInputChange('error_url', e.target.value)}
                  placeholder="https://seu-dominio.com/error"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="css_url">URL do CSS (Opcional)</Label>
              <Input
                id="css_url"
                value={formData.css_url}
                onChange={(e) => handleInputChange('css_url', e.target.value)}
                placeholder="https://seu-dominio.com/custom-styles.css"
              />
              <p className="text-xs text-muted-foreground">
                URL para estilos personalizados do formulário de pagamento
              </p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleTest}
              disabled={saving || !config?.is_active}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Como Configurar:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Obtenha seu Frame Token junto ao EMIS (Empresa Interbancária de Serviços)</li>
              <li>Configure as URLs de callback para receber notificações de pagamento</li>
              <li>Teste a conexão antes de ativar em produção</li>
              <li>Monitore os logs de callback para verificar o funcionamento</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">URLs de Callback Recomendadas:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Callback:</strong> https://seu-dominio.com/api/multicaixa-callback</p>
              <p><strong>Sucesso:</strong> https://seu-dominio.com/checkout/success</p>
              <p><strong>Erro:</strong> https://seu-dominio.com/checkout/error</p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Nota:</strong> Certifique-se de que as URLs de callback sejam acessíveis publicamente 
              e que o servidor possa receber requisições POST do Multicaixa Express.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default MulticaixaExpressSettingsTab; 