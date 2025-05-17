
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Download } from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('orderId') || 'N/A';
  const [seconds, setSeconds] = useState(5);
  
  useEffect(() => {
    // Simulate generating invoice
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
        }
        return prevSeconds - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="container-page py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="text-3xl font-heading font-bold mb-3">Pedido Confirmado!</h1>
              <p className="text-lg text-muted-foreground mb-0">
                Seu pedido foi recebido e está sendo processado.
              </p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-lg font-medium mb-3">Informações do Pedido</h2>
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número do Pedido:</span>
                      <span className="font-medium">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Processando</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Método de Pagamento:</span>
                      <span className="font-medium">Multicaixa Express</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-3">Fatura</h2>
                  <div className="border rounded-md p-4 text-center">
                    {seconds > 0 ? (
                      <div className="p-4">
                        <div className="animate-pulse flex flex-col items-center justify-center">
                          <div className="h-10 w-10 mb-3 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-24 mb-2 rounded bg-gray-200"></div>
                          <div className="h-3 w-32 rounded bg-gray-200"></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Gerando fatura... {seconds}s
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4 text-sm">Sua fatura está pronta para download</p>
                        <Button className="bg-microsoft-blue hover:bg-microsoft-blue/90">
                          <Download size={16} className="mr-2" />
                          Baixar Fatura PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-6 mb-8">
                <h2 className="text-lg font-medium mb-4">Próximos Passos</h2>
                <div className="space-y-3">
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      1
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Verificação do Pagamento</h3>
                      <p className="text-sm text-muted-foreground">
                        Nosso sistema irá verificar o pagamento e confirmar a transação.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      2
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Entrega Digital</h3>
                      <p className="text-sm text-muted-foreground">
                        Você receberá um e-mail com as licenças e instruções de ativação.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                      3
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-medium">Suporte Técnico</h3>
                      <p className="text-sm text-muted-foreground">
                        Nossa equipe está disponível para ajudar com a instalação e configuração.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => navigate('/cliente/login')}>
                  Área do Cliente
                </Button>
                <Button 
                  className="bg-microsoft-blue hover:bg-microsoft-blue/90"
                  onClick={() => navigate('/')}
                >
                  Voltar à Página Inicial
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
