
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from './SettingsContext';

const EmailSettingsTab = () => {
  const { 
    settings, 
    handleInputChange, 
    saving, 
    testingSmtp, 
    handleSaveSettings, 
    handleTestSmtp 
  } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações SMTP</CardTitle>
        <CardDescription>
          Configure o servidor de email para envio de notificações e faturas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Servidor SMTP (Host)
              <Input
                name="smtp_host"
                value={settings.smtp_host || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="smtp.example.com"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Porta SMTP
              <Input
                name="smtp_port"
                value={settings.smtp_port || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="587"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Usuário SMTP
              <Input
                name="smtp_user"
                value={settings.smtp_user || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="user@example.com"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Senha SMTP
              <Input
                name="smtp_password"
                type="password"
                value={settings.smtp_password || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="••••••••"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email de Envio (From)
              <Input
                name="smtp_from_email"
                type="email"
                value={settings.smtp_from_email || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="noreply@example.com"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nome de Envio (From)
              <Input
                name="smtp_from_name"
                value={settings.smtp_from_name || ''}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="Minha Empresa"
              />
            </label>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-6">
          <Button 
            onClick={handleTestSmtp} 
            variant="outline"
            disabled={testingSmtp || !settings.smtp_host || !settings.smtp_user || !settings.smtp_password}
          >
            {testingSmtp ? 'Testando...' : 'Testar Conexão SMTP'}
          </Button>
          
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações SMTP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettingsTab;
