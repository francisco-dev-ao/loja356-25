
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsTable from '@/components/admin/ProductsTable';
import CompanySettings from '@/components/admin/CompanySettings';
import CustomersTable from '@/components/admin/CustomersTable';
import OrdersTable from '@/components/admin/OrdersTable';
import CouponsTable from '@/components/admin/CouponsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, Users, ShoppingCart, Settings, Tag } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="container-page py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Painel Administrativo</h1>
        
        <div className="dashboard-section">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`mb-6 ${isMobile ? 'w-full grid grid-cols-5' : ''}`}>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Gerenciar Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Gerenciar Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Gerenciar Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Gerenciar Cupons</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <ProductsTable />
            </TabsContent>
            
            <TabsContent value="customers">
              <CustomersTable />
            </TabsContent>
            
            <TabsContent value="orders">
              <OrdersTable />
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
