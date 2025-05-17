
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { RegisterForm } from '@/components/register/RegisterForm';

const Register = () => {
  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-microsoft-blue p-8 text-white hidden md:flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Bem-vindo à LicençasPRO</h2>
                <p className="mb-6">Crie sua conta para acessar licenças Microsoft originais com os melhores preços.</p>
                <img 
                  src="/placeholder.svg" 
                  alt="Register" 
                  className="w-4/5 mx-auto"
                />
              </div>
              
              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">Criar nova conta</h3>
                  <p className="text-muted-foreground">Preencha o formulário com seus dados</p>
                </div>
                
                <RegisterForm />
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
