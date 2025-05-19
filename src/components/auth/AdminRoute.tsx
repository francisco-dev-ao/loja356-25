import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, profile, isLoading } = useAuth();
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

  // Verificar se o usuário é admin
  if (!profile?.role || profile.role !== 'admin') {
    // Redirecionar para dashboard do cliente se for cliente, ou para home se não tiver role
    return <Navigate to={profile?.role === 'customer' ? '/cliente/dashboard' : '/'} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
