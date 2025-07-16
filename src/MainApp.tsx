import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameCategories } from './components/GameCategories';
import { FeaturedProducts } from './components/FeaturedProducts';
import { PricingPlans } from './components/PricingPlans';
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
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutCancelPage } from './pages/CheckoutCancelPage';
import { useCart } from './hooks/useCart';
import { useApp } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';

export function MainApp() {
  const { user } = useAuth();
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

  // Função para ações que requerem login
  const handleProtectedAction = (action: () => void) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    action();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <ProductsPage onAddToCart={(product) => handleProtectedAction(() => addToCart(product))} />;
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
      case 'checkout-success':
        return <CheckoutSuccessPage />;
      case 'checkout-cancel':
        return <CheckoutCancelPage />;
      default:
        return (
          <main>
            <Hero />
            <GameCategories />
            <FeaturedProducts onAddToCart={(product) => handleProtectedAction(() => addToCart(product))} />
            <PricingPlans />
          </main>
        );
    }
  };

  // A home é sempre acessível, mesmo sem login

  return (
    <div className="min-h-screen bg-black">
      {/* Header sempre visível quando logado */}
      <Header 
        onToggleCart={toggleCart} 
        cartItemCount={itemCount}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
      
      {renderPage()}
      
      {/* Footer na home */}
      {currentPage === 'home' && <Footer />}
      
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
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
      )}
    </div>
  );
}