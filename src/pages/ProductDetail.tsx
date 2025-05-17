
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import products from '@/data/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // Find the product
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return (
      <Layout>
        <div className="container-page py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="mb-6">O produto que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/produtos')}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar para produtos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-12">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-gray-100" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-microsoft-light rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain" 
              style={{ maxHeight: '400px' }}
            />
          </div>
          
          {/* Product Info */}
          <div>
            <span className="inline-block bg-microsoft-light text-microsoft-blue px-3 py-1 rounded-full text-sm mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-heading font-bold mb-3">{product.name}</h1>
            <div className="mb-6">
              <span className="text-3xl font-bold text-microsoft-blue">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-sm text-muted-foreground ml-2">por licença</span>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Licença perpétua (pagamento único)</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Entrega digital imediata</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Garantia de autenticidade</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Suporte técnico por 30 dias</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-microsoft-blue hover:bg-microsoft-blue/90"
                onClick={() => addItem(product)}
              >
                <ShoppingCart size={18} className="mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  addItem(product);
                  navigate('/carrinho');
                }}
              >
                Comprar Agora
              </Button>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-semibold mb-6">Informações Adicionais</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-medium mb-4">Requisitos do Sistema</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Sistema operacional: Windows 10 ou posterior</li>
                  <li>• Processador: 1.6 GHz ou superior</li>
                  <li>• RAM: 4 GB mínimo</li>
                  <li>• Espaço em disco: 4 GB</li>
                  <li>• Resolução: 1280 x 768</li>
                </ul>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Detalhes da Licença</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Tipo: Licença digital</li>
                  <li>• Usuários: 1 por licença</li>
                  <li>• Ativação: Online</li>
                  <li>• Garantia: 30 dias</li>
                  <li>• Suporte: Email e telefone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
