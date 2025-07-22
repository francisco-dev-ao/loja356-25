import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Shield, CheckCircle } from 'lucide-react';
import RegisterForm from '@/components/register/RegisterForm';

const Register = () => {
  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="container-page py-12">
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header com animação */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl hover-scale">
                <div className="bg-white/20 p-3 rounded-xl">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-microsoft-blue to-blue-600 bg-clip-text text-transparent">
                Criar Conta
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Junte-se a milhares de empresas que confiam em nossos serviços Microsoft
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Benefícios da conta */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-microsoft-blue/10 hover-scale">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Licenças Originais</h3>
                  <p className="text-gray-600 text-sm">
                    Garantia de licenças Microsoft 100% originais e atualizadas
                  </p>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-microsoft-blue/10 hover-scale">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Suporte Dedicado</h3>
                  <p className="text-gray-600 text-sm">
                    Equipe especializada para te ajudar em todo o processo
                  </p>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-microsoft-blue/10 hover-scale">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Gestão Simplificada</h3>
                  <p className="text-gray-600 text-sm">
                    Painel intuitivo para gerenciar todos seus produtos Microsoft
                  </p>
                </div>
              </div>

              {/* Formulário de cadastro */}
              <div className="lg:col-span-2">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-microsoft-blue/20 shadow-2xl overflow-hidden hover-scale">
                  {/* Header do formulário */}
                  <div className="bg-gradient-to-r from-microsoft-blue to-blue-600 p-6">
                    <div className="flex items-center text-white">
                      <div className="bg-white/20 p-3 rounded-full mr-4">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Cadastro de Nova Conta</h2>
                        <p className="text-blue-100 mt-1">Preencha os dados para começar</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Conteúdo do formulário */}
                  <div className="p-8">
                    <RegisterForm />
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-6 border-t border-microsoft-blue/10">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Já possui uma conta?
                      </p>
                      <Link 
                        to="/cliente/login" 
                        className="inline-flex items-center justify-center px-6 py-2 bg-white border border-microsoft-blue text-microsoft-blue rounded-lg hover:bg-microsoft-blue hover:text-white transition-all duration-300 font-medium"
                      >
                        Fazer Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Links adicionais */}
            <div className="text-center mt-8 space-y-4">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <Link 
                  to="/produtos" 
                  className="text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  Ver Produtos
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  to="/contato" 
                  className="text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  Contato
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  to="/cliente/login" 
                  className="text-microsoft-blue hover:text-blue-600 transition-colors duration-300 hover:underline"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
