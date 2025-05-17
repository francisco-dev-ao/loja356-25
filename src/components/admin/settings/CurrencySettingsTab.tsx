
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from './SettingsContext';
import CurrencyPreview from './CurrencyPreview';

const CurrencySettingsTab = () => {
  const { 
    settings, 
    handleInputChange, 
    handleNumberInputChange, 
    saving, 
    handleSaveSettings 
  } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Moeda</CardTitle>
        <CardDescription>
          Defina como os valores monetários serão exibidos em todo o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Código da Moeda
              <Input
                name="currency_code"
                value={settings.currency_code}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="AOA"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use o código internacional da moeda (Ex: AOA, USD, EUR).
              </p>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Localização para Formatação
              <Input
                name="currency_locale"
                value={settings.currency_locale}
                onChange={handleInputChange}
                className="mt-1"
                placeholder="pt-AO"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define como separadores e decimais serão exibidos (Ex: pt-AO, pt-BR, en-US).
              </p>
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mínimo de Casas Decimais
              <Input
                name="currency_min_digits"
                type="number"
                min="0"
                max="10"
                value={settings.currency_min_digits}
                onChange={handleNumberInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Máximo de Casas Decimais
              <Input
                name="currency_max_digits"
                type="number"
                min="0"
                max="10"
                value={settings.currency_max_digits}
                onChange={handleNumberInputChange}
                className="mt-1"
              />
            </label>
          </div>
        </div>
        
        <CurrencyPreview />
        
        <Button 
          onClick={handleSaveSettings} 
          className="mt-6"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Configurações de Moeda'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrencySettingsTab;
