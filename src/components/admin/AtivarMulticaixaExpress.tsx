import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Play, 
  Settings,
  TestTube,
  Database,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AtivarMulticaixaExpress = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  // Verificar status atual
  const verificarStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('multicaixa_express_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar status:', error);
        setIsActive(false);
        setConfig(null);
        return;
      }

      if (data) {
        setIsActive(true);
        setConfig(data);
        toast.success('Multicaixa Express está ativo!');
      } else {
        setIsActive(false);
        setConfig(null);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setIsActive(false);
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Ativar Multicaixa Express
  const ativarMulticaixaExpress = async () => {
    try {
      setIsLoading(true);
      
      // 1. Criar configuração
      const configData = {
        frame_token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
        callback_url: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback',
        success_url: 'https://angohost.co.ao/pay/successful',
        error_url: 'https://angohost.co.ao/pay/unsuccessful',
        css_url: null,
        commission_rate: 0,
        is_active: true
      };

      const { data: configResult, error: configError } = await supabase
        .from('multicaixa_express_config')
        .insert(configData)
        .select()
        .single();

      if (configError) {
        console.error('Erro ao criar configuração:', configError);
        toast.error('Erro ao criar configuração');
        return;
      }

      // 2. Criar método de pagamento
      const paymentMethodData = {
        name: 'Multicaixa Express',
        description: 'Pagamento via Multicaixa Express Online',
        is_active: true
      };

      const { error: paymentError } = await supabase
        .from('payment_methods')
        .upsert(paymentMethodData, { onConflict: 'name' });

      if (paymentError) {
        console.error('Erro ao criar método de pagamento:', paymentError);
        // Não falhar se já existir
      }

      setConfig(configResult);
      setIsActive(true);
      toast.success('Multicaixa Express ativado com sucesso!');
      
    } catch (error) {
      console.error('Erro durante ativação:', error);
      toast.error('Erro durante ativação');
    } finally {
      setIsLoading(false);
    }
  };

  // Testar conexão com EMIS
  const testarConexao = async () => {
    try {
      setIsLoading(true);
      setTestResult(null);
      
      const testData = {
        reference: 'TEST-' + Date.now(),
        amount: 100,
        token: 'a53787fd-b49e-4469-a6ab-fa6acf19db48',
        mobile: 'PAYMENT',
        card: 'DISABLED',
        qrCode: 'PAYMENT',
        callbackUrl: 'https://angohost.co.ao/pay/MulticaixaExpress/02e7e7694cea3a9b472271420efb0029/callback'
      };

      const response = await fetch('https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frameToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, data });
        toast.success('Conexão com EMIS bem-sucedida!');
      } else {
        setTestResult({ success: false, error: data, status: response.status });
        toast.error('Erro na conexão com EMIS');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setTestResult({ success: false, error: error.message });
      toast.error('Erro ao testar conexão');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status ao carregar
  React.useEffect(() => {
    verificarStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ativar Multicaixa Express</h2>
          <p className="text-muted-foreground">
            Configure e ative o gateway de pagamento Multicaixa Express
          </p>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? (
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
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Status do Multicaixa Express:</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Configuração:</span>
            <Badge variant={config ? "default" : "secondary"}>
              {config ? "Configurado" : "Não configurado"}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={verificarStatus}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Verificar Status
                </>
              )}
            </Button>

            {!isActive && (
              <Button
                onClick={ativarMulticaixaExpress}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Ativar Multicaixa Express
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Frame Token:</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {config.frame_token}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Taxa de Comissão:</label>
                <p className="text-sm text-muted-foreground">
                  {config.commission_rate}%
                </p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">URL de Callback:</label>
              <p className="text-sm text-muted-foreground font-mono">
                {config.callback_url}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">URL de Sucesso:</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {config.success_url}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">URL de Erro:</label>
                <p className="text-sm text-muted-foreground font-mono">
                  {config.error_url}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Testar Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Teste a conexão com o gateway EMIS para verificar se está funcionando corretamente.
          </p>

          <Button
            onClick={testarConexao}
            disabled={isLoading || !isActive}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Testar Conexão com EMIS
              </>
            )}
          </Button>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertDescription>
                {testResult.success ? (
                  <>
                    <strong>✅ Conexão bem-sucedida!</strong>
                    <br />
                    <code className="text-xs">
                      {JSON.stringify(testResult.data, null, 2)}
                    </code>
                  </>
                ) : (
                  <>
                    <strong>❌ Erro na conexão</strong>
                    <br />
                    Status: {testResult.status}
                    <br />
                    <code className="text-xs">
                      {JSON.stringify(testResult.error, null, 2)}
                    </code>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Instruções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Próximos Passos:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Verifique se o Multicaixa Express está ativo</li>
              <li>Teste a conexão com o gateway EMIS</li>
              <li>Acesse o checkout para ver o método de pagamento</li>
              <li>Configure URLs de callback se necessário</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Nota:</strong> O método de pagamento Multicaixa Express estará disponível 
              no checkout assim que for ativado. Certifique-se de que as URLs de callback 
              sejam acessíveis publicamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtivarMulticaixaExpress; 