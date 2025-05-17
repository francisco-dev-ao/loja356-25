
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/products/ProductGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: products, isLoading, error } = useProducts();

  // Get unique categories
  const categories = products ? ['all', ...new Set(products.map((product) => product.category))] : ['all'];

  // Filter products based on search term and category
  const filteredProducts = products ? products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) : [];

  return (
    <Layout>
      {/* Header */}
      <section className="bg-microsoft-blue py-12">
        <div className="container-page">
          <h1 className="text-4xl font-heading font-bold text-white mb-3">Nossos Produtos</h1>
          <p className="text-white/80 max-w-3xl">
            Explore nossa completa linha de licenças Microsoft para empresas e profissionais. 
            Soluções para produtividade, comunicação e gerenciamento de TI.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="bg-gray-50 py-6 border-b">
        <div className="container-page">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar produtos..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={selectedCategory === category ? "bg-microsoft-blue" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Todos' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="container-page">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-microsoft-blue border-t-transparent rounded-full mb-4"></div>
              <p>Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">Tente outro termo de pesquisa ou categoria.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
