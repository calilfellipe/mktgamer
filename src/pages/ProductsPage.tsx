import React, { useState, useEffect } from 'react';
import { Star, Shield, Eye, Filter, Grid, List } from 'lucide-react';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../contexts/AppContext';
import { ProductService } from '../services/productService';
import { games } from '../data/mockData';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
}

export function ProductsPage({ onAddToCart }: ProductsPageProps) {
  const { searchQuery, selectedGame, selectedCategory } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Carregando produtos (público)...');
        
        const data = await ProductService.getActiveProducts({
          category: selectedCategory || undefined,
          game: selectedGame || undefined,
          search: searchQuery || undefined,
          minPrice: priceRange.min > 0 ? priceRange.min : undefined,
          maxPrice: priceRange.max < 1000 ? priceRange.max : undefined
        });

        if (!isMounted) return;

        const formattedProducts = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          game: item.game,
          images: Array.isArray(item.images) ? item.images : [],
          seller: {
            id: item.seller?.id || '',
            username: item.seller?.username || 'Vendedor',
            email: '',
            avatar: item.seller?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
            reputation: 4.8,
            verified: item.seller?.is_verified || false,
            plan: 'pro',
            totalSales: 0,
            joinDate: new Date().toISOString()
          },
          featured: item.highlighted || false,
          condition: 'excellent' as const,
          tags: [],
          createdAt: item.created_at
        }));

        // Aplicar ordenação local
        let sortedProducts = [...formattedProducts];
        switch (sortBy) {
          case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
          case 'popular':
            sortedProducts.sort((a, b) => b.seller.reputation - a.seller.reputation);
            break;
          default:
            sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setProducts(sortedProducts);
        console.log('✅ Produtos carregados:', sortedProducts.length);
      } catch (error) {
        if (isMounted) {
          console.error('❌ Erro ao carregar produtos:', error);
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedGame, selectedCategory, sortBy, priceRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="h-8 bg-gray-800 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 animate-pulse">
                <div className="h-48 bg-gray-800 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded mb-4"></div>
                  <div className="h-6 bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'account', name: '🎮 Contas' },
    { id: 'skin', name: '✨ Skins' },
    { id: 'giftcard', name: '🎁 Gift Cards' },
    { id: 'service', name: '🚀 Serviços' }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Produtos {searchQuery && `para "${searchQuery}"`}
          </h1>
          <p className="text-gray-400">
            {products.length} produtos encontrados
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-gray-300 font-medium mb-3">Categorias</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Games */}
              <div className="mb-6">
                <h4 className="text-gray-300 font-medium mb-3">Jogos</h4>
                <div className="space-y-2">
                  {games.map(game => (
                    <button
                      key={game.name}
                      className="w-full text-left px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      {game.icon} {game.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-gray-300 font-medium mb-3">Preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Mínimo</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Máximo</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Filter}
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  Filtros
                </Button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                  <option value="popular">Mais populares</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-400">Tente ajustar os filtros ou aguarde novos anúncios</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.images[0] || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1'}
                        alt={product.title}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                        }`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1';
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="success">{product.condition}</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="primary">{product.game}</Badge>
                      </div>
                      {product.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="warning">⭐ DESTAQUE</Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-300 transition-colors">
                        {product.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={product.seller.avatar}
                            alt={product.seller.username}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1';
                            }}
                          />
                          <span className="text-sm text-gray-400">{product.seller.username}</span>
                          {product.seller.verified && (
                            <Shield className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-400">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{product.seller.reputation}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-400">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {}}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onAddToCart(product)}
                          >
                            Comprar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}