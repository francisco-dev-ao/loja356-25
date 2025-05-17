
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from './SettingsContext';

const CompanyInfoTab = () => {
  const { settings, handleInputChange, saving, handleSaveSettings } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Empresa</CardTitle>
        <CardDescription>
          Estas informações serão utilizadas nas faturas e comunicações com clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nome da Empresa
              <Input
                name="name"
                value={settings.name || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              NIF
              <Input
                name="nif"
                value={settings.nif || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">
              Endereço
              <Input
                name="address"
                value={settings.address || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Telefone
              <Input
                name="phone"
                value={settings.phone || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email
              <Input
                name="email"
                type="email"
                value={settings.email || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Website
              <Input
                name="website"
                value={settings.website || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            </label>
          </div>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          className="mt-6"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoTab;
