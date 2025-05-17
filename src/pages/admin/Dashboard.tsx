
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsTable from '@/components/admin/ProductsTable';
import CouponsTable from '@/components/admin/CouponsTable';
import CompanySettings from '@/components/admin/CompanySettings';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="container-page py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Painel Administrativo</h1>
        
        <div className="dashboard-section">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`mb-6 ${isMobile ? 'w-full grid grid-cols-3' : ''}`}>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="coupons">Cupons</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <ProductsTable />
            </TabsContent>
            
            <TabsContent value="coupons">
              <CouponsTable />
            </TabsContent>
            
            <TabsContent value="settings">
              <CompanySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
