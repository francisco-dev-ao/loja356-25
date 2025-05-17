
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductsTable from '@/components/admin/ProductsTable';
import CouponsTable from '@/components/admin/CouponsTable';
import CompanySettings from '@/components/admin/CompanySettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, Users, ShoppingCart, Settings } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="container-page py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Painel Administrativo</h1>
        
        <div className="dashboard-section">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`mb-6 ${isMobile ? 'w-full grid grid-cols-4' : ''}`}>
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
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <ProductsTable />
            </TabsContent>
            
            <TabsContent value="customers">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-medium mb-4">Gerenciamento de Clientes</h2>
                <p className="text-gray-500">Lista de clientes registrados será implementada aqui.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="orders">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-medium mb-4">Gerenciamento de Pedidos</h2>
                <p className="text-gray-500">Lista de pedidos será implementada aqui.</p>
              </div>
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
