import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { RegisterForm } from '@/components/register/RegisterForm';

const Register = () => {
  return (
    <Layout hideFooter>
      <div className="container-page py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-heading font-bold">Cadastro</h1>
            <p className="text-muted-foreground mt-2">
              Crie sua conta para começar a gerenciar seus pedidos e faturas
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
