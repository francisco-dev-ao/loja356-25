
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { useState } from "react";
import AdminRoute from "@/components/auth/AdminRoute";
import CustomerRoute from "@/components/auth/CustomerRoute";
import DatabaseConnection from "@/components/database/DatabaseConnection";
import { db, DatabaseConfig } from "@/lib/database";

// Pages
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/customer/Login";
import ForgotPassword from "./pages/customer/ForgotPassword";
import ResetPassword from "./pages/customer/ResetPassword";
import CustomerDashboard from "./pages/customer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AtivarMulticaixaExpressPage from "./pages/AtivarMulticaixaExpress";
import NotFound from "./pages/NotFound";

const AppWithProviders = () => {
  // Use useState to create the QueryClient instance
  const [queryClient] = useState(() => new QueryClient());
  const [dbConnected, setDbConnected] = useState(false);

  const handleDatabaseConfig = (config: DatabaseConfig | null) => {
    if (config) {
      db.setConfig(config);
      setDbConnected(true);
    } else {
      setDbConnected(false);
    }
  };

  // Show database connection screen if not connected
  if (!dbConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <DatabaseConnection onConfigChange={handleDatabaseConfig} />
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/produtos" element={<Products />} />
                <Route path="/produtos/:id" element={<ProductDetail />} />
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/cadastro" element={<Register />} />
                  {/* Customer Routes */}
                <Route path="/cliente/login" element={<Login />} />
                <Route path="/cliente/esqueci-senha" element={<ForgotPassword />} />
                <Route path="/cliente/redefinir-senha" element={<ResetPassword />} />
                <Route path="/cliente/dashboard" element={
                  <CustomerRoute>
                    <CustomerDashboard />
                  </CustomerRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/ativar-multicaixa-express" element={
                  <AdminRoute>
                    <AtivarMulticaixaExpressPage />
                  </AdminRoute>
                } />

                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default AppWithProviders;
