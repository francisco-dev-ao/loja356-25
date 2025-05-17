
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from './SettingsContext';

const EmailTemplateTab = () => {
  const { settings, handleInputChange, saving, handleSaveSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo de Email para Pedidos</CardTitle>
        <CardDescription>
          Personalize o email enviado automaticamente aos clientes após a realização de um pedido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <textarea
              name="email_template_order"
              value={settings.email_template_order}
              onChange={handleInputChange}
              className="w-full h-[500px] p-4 font-mono text-sm border rounded-md"
              placeholder="Digite o HTML do modelo de email aqui..."
            />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-md border">
            <h4 className="font-medium mb-2">Variáveis Disponíveis</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Use estas variáveis para incluir dados dinâmicos no template:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-xs bg-white p-2 rounded border">{'{{company_name}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{company_tagline}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{customer_name}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{order_id}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{order_date}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{order_status}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{payment_method}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{payment_status}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{order_items}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{order_total}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{customer_dashboard_url}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{company_address}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{company_nif}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{company_phone}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{company_email}}'}</div>
              <div className="text-xs bg-white p-2 rounded border">{'{{current_year}}'}</div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          className="mt-6"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Modelo de Email'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateTab;
