
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-page py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-microsoft-blue rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-heading font-semibold text-xl hidden sm:inline-block">LicençasPRO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="font-medium hover:text-microsoft-blue transition-colors">Home</Link>
            <Link to="/produtos" className="font-medium hover:text-microsoft-blue transition-colors">Produtos</Link>
            <Link to="/sobre" className="font-medium hover:text-microsoft-blue transition-colors">Sobre</Link>
            <Link to="/contato" className="font-medium hover:text-microsoft-blue transition-colors">Contato</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/cliente/login" className="hidden sm:flex items-center text-sm font-medium hover:text-microsoft-blue transition-colors">
              <User size={18} className="mr-1" />
              <span>Área Cliente</span>
            </Link>
            <Link to="/carrinho" className="relative">
              <ShoppingCart size={22} className="text-gray-700 hover:text-microsoft-blue transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-energy text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-6">
                <span className="font-heading font-bold text-xl">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X size={24} />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/produtos" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Produtos</Link>
                <Link to="/sobre" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Sobre</Link>
                <Link to="/contato" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>Contato</Link>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/cliente/login" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Área do Cliente
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
