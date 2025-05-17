
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { isAuthenticated, logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada com sucesso');
    navigate('/');
  };

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
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center">
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center text-sm font-medium hover:text-microsoft-blue transition-colors">
                    <User size={18} className="mr-1" />
                    <span>{profile?.name || 'Minha Conta'}</span>
                  </Button>
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link 
                        to="/cliente/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-microsoft-blue"
                      >
                        Minha Conta
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/cliente/login" className="hidden sm:flex items-center text-sm font-medium hover:text-microsoft-blue transition-colors">
                <User size={18} className="mr-1" />
                <span>Área Cliente</span>
              </Link>
            )}
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
                {isAuthenticated ? (
                  <>
                    <Link to="/cliente/dashboard" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Minha Conta
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }} 
                      className="py-2 text-left text-red-600 hover:text-red-700 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </>
                ) : (
                  <Link to="/cliente/login" className="py-2 hover:text-microsoft-blue transition-colors" onClick={() => setIsMenuOpen(false)}>
                    Área do Cliente
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
