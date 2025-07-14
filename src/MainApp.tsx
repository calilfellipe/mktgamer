import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameCategories } from './components/GameCategories';
import { FeaturedProducts } from './components/FeaturedProducts';
import { PricingPlans } from './components/PricingPlans';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { LoginModal } from './components/LoginModal';
import { ProductsPage } from './pages/ProductsPage';
import { SupportPage } from './pages/SupportPage';
import { ProfileSettings } from './components/ProfileSettings';
import { CreateProductForm } from './components/CreateProductForm';
import { MyProducts } from './components/MyProducts';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionSuccessPage } from './pages/SubscriptionSuccessPage';
import { useCart } from './hooks/useCart';
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

export function MainApp() {
  const { user, isLoading } = useAuth();
  const {
    items,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart,
    checkout,
    total,
    itemCount
  } = useCart();

  const { currentPage } = useApp();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Controlar modal de login
  React.useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsLoginOpen(false);
    }
  }, [user, isLoading]);

  const renderPage = () => {
    switch (currentPage) {
      case 'accounts':
      case 'skins':
      case 'giftcards':
      case 'services':
      case 'products':
        return <ProductsPage onAddToCart={addToCart} />;
      case 'admin':
        return <AdminDashboard />;
      case 'support':
        return <SupportPage />;
      case 'profile':
        return <ProfileSettings />;
      case 'my-products':
        return <MyProducts />;
      case 'create-product':
        return <CreateProductForm />;
      case 'checkout':
        return <CheckoutPage onCheckout={checkout} />;
      case 'subscription-success':
        return <SubscriptionSuccessPage />;
      default:
        return (
          <main>
            <Hero />
            <GameCategories />
            <FeaturedProducts onAddToCart={addToCart} />
            <PricingPlans />
            <Testimonials />
          </main>
        );
    }
  };

  // Loading screen otimizado
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">GG Sync Market</h2>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header sempre visível quando logado */}
      {user && (
        <Header 
          onToggleCart={toggleCart} 
          cartItemCount={itemCount}
          onOpenLogin={() => setIsLoginOpen(true)}
        />
      )}
      
      {renderPage()}
      
      {/* Footer na home */}
      {user && currentPage === 'home' && <Footer />}
      
      {/* Carrinho */}
      {user && (
        <Cart
          isOpen={isOpen}
          items={items}
          onClose={toggleCart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          total={total}
        />
      )}

      {/* Modal de login */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}