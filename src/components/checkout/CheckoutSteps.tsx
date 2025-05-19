
import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepsProps {
  activeTab: string;
  isAuthenticated: boolean;
  profile?: { name?: string } | null;
  userEmail?: string;
}

const CheckoutSteps = ({ activeTab, isAuthenticated, profile, userEmail }: CheckoutStepsProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'account' || isAuthenticated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} mr-2`}>
          {isAuthenticated ? <Check size={16} /> : 1}
        </div>
        <div>
          <h2 className="font-medium">Conta</h2>
          {isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              Logado como {profile?.name || userEmail}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Login ou cadastro
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'payment' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} mr-2`}>
          2
        </div>
        <div>
          <h2 className="font-medium">Pagamento</h2>
          <p className="text-sm text-muted-foreground">
            Escolha o método de pagamento
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
