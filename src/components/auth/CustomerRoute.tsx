import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface CustomerRouteProps {
  children: React.ReactNode;
}

const CustomerRoute = ({ children }: CustomerRouteProps) => {  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container-page py-12">
        <div className="flex justify-center items-center">
          <div className="animate-spin h-5 w-5 border-2 border-microsoft-blue border-t-transparent rounded-full"></div>
          <p className="ml-2">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" replace state={{ redirectAfterLogin: window.location.pathname }} />;
  }

  // Verificar se o usuário tem o papel correto (customer ou admin pode acessar área do cliente)
  if (!profile?.role || (profile.role !== 'customer' && profile.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CustomerRoute;
