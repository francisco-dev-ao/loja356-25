import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

// Adicionar uma propriedade para controlar a exibição do footer
interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout = ({ children, hideFooter }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="mx-auto w-full max-w-full">
          {children}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
