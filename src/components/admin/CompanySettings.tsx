
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Mail, Currency, MailCheck, CreditCard } from 'lucide-react';
import { SettingsProvider, useSettings } from './settings/SettingsContext';
import CompanyInfoTab from './settings/CompanyInfoTab';
import EmailSettingsTab from './settings/EmailSettingsTab';
import CurrencySettingsTab from './settings/CurrencySettingsTab';
import EmailTemplateTab from './settings/EmailTemplateTab';
import MulticaixaSettingsTab from './settings/MulticaixaSettingsTab';
import LoadingIndicator from './settings/LoadingIndicator';

const CompanySettings = () => {
  return (
    <SettingsProvider>
      <CompanySettingsContent />
    </SettingsProvider>
  );
};

const CompanySettingsContent = () => {
  const { loading } = useSettings();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Configurações do Sistema</h2>
      
      <Tabs defaultValue="company">
        <TabsList className="mb-6">
          <TabsTrigger value="company">
            <Building size={16} className="mr-2" />
            Dados da Empresa
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail size={16} className="mr-2" />
            Configurações de Email
          </TabsTrigger>
          <TabsTrigger value="currency">
            <Currency size={16} className="mr-2" />
            Configurações de Moeda
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MailCheck size={16} className="mr-2" />
            Modelos de Email
          </TabsTrigger>
          <TabsTrigger value="multicaixa">
            <CreditCard size={16} className="mr-2" />
            Multicaixa Express
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <CompanyInfoTab />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailSettingsTab />
        </TabsContent>
        
        <TabsContent value="currency">
          <CurrencySettingsTab />
        </TabsContent>
        
        <TabsContent value="templates">
          <EmailTemplateTab />
        </TabsContent>
        
        <TabsContent value="multicaixa">
          <MulticaixaSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanySettings;
