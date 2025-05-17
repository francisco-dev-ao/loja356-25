
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductGrid from '@/components/products/ProductGrid';
import products from '@/data/products';

const Index = () => {
  // Get featured products (first 3)
  const featuredProducts = products.slice(0, 3);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-microsoft-blue to-blue-700 text-white">
        <div className="absolute inset-0 bg-[url('https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4wyU9')] bg-cover bg-center opacity-10"></div>
        <div className="container-page py-20 md:py-28 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Soluções Microsoft Originais para seu Negócio
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Licenças Microsoft 365, Exchange Server e Windows para empresas de todos os tamanhos com preços acessíveis e suporte especializado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-white text-microsoft-blue hover:bg-white/90">
                <Link to="/produtos">
                  Ver Produtos
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link to="/contato">
                  Fale Conosco
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-3">Nossos Produtos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore nossa seleção de licenças Microsoft para encontrar a solução perfeita para seu negócio
            </p>
          </div>
          
          <ProductGrid products={featuredProducts} />
          
          <div className="flex justify-center mt-12">
            <Button asChild className="bg-microsoft-blue hover:bg-microsoft-blue/90">
              <Link to="/produtos">
                Ver todos os produtos
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-3">Por que escolher a LicençasPRO?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos a melhor experiência para aquisição de licenças Microsoft com preços competitivos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 text-center rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-microsoft-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-microsoft-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Produtos Originais</h3>
              <p className="text-muted-foreground">
                Todas as nossas licenças são 100% originais e autênticas, diretamente da Microsoft.
              </p>
            </div>
            
            <div className="p-6 text-center rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-microsoft-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-microsoft-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Preços Competitivos</h3>
              <p className="text-muted-foreground">
                Melhores preços do mercado com descontos especiais para compras em quantidade.
              </p>
            </div>
            
            <div className="p-6 text-center rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-microsoft-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-microsoft-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Suporte Especializado</h3>
              <p className="text-muted-foreground">
                Equipe técnica pronta para ajudar com instalação, configuração e dúvidas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-microsoft-blue text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl font-heading font-bold mb-6">Pronto para transformar seu negócio?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Entre em contato agora mesmo e descubra como nossas soluções podem ajudar sua empresa.
          </p>
          <Button asChild size="lg" className="bg-white text-microsoft-blue hover:bg-white/90">
            <Link to="/contato">
              Solicitar Orçamento
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
