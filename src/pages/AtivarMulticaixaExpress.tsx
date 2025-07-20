import React from 'react';
import Layout from '@/components/layout/Layout';
import AtivarMulticaixaExpress from '@/components/admin/AtivarMulticaixaExpress';

const AtivarMulticaixaExpressPage = () => {
  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-4">
              Ativar Multicaixa Express
            </h1>
            <p className="text-muted-foreground">
              Configure e ative o gateway de pagamento Multicaixa Express para seu site.
            </p>
          </div>
          
          <AtivarMulticaixaExpress />
        </div>
      </div>
    </Layout>
  );
};

export default AtivarMulticaixaExpressPage; 