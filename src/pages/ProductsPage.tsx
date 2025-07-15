import React, { useState, useMemo, useEffect } from 'react';
import { Star, Shield, Eye, Filter, Grid, List } from 'lucide-react';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../contexts/AppContext';
import { ProductService } from '../services/productService';
import { supabase } from '../lib/supabase';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
}

export function ProductsPage({ onAddToCart }: ProductsPageProps) {
  const { searchQuery, selectedGame, selectedCategory, setRefreshProducts } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);

  // Prevent infinite loading
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      loadProducts();
      loadCategoriesAndGames();
      setHasLoaded(true);
    }
    
    // Set refresh function for other components to use
    setRefreshProducts(() => loadProducts);
  }, [hasLoaded]);

  // Reload when filters change
  useEffect(() => {
    if (hasLoaded) {
      loadProducts();
    }
  }, [selectedGame, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Carregando produtos com filtros:', { selectedGame, selectedCategory, searchQuery });
      
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users(id, username, avatar_url, is_verified)
        `)
        .eq('status', 'active')
        .order('commission_rate', { ascending: false })
        .order('visibility_score', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedGame) {
        query = query.eq('game', selectedGame);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      // Only process real data
      const formattedProducts = data ? data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        game: item.game,
        images: item.images,
        seller: {
          id: item.seller.id,
          username: item.seller.username,
          email: item.seller.email || '',
          avatar: item.seller.avatar_url,
          reputation: 4.8, // Default for demo
          verified: item.seller.is_verified,
          plan: 'pro',
          totalSales: 0,
          joinDate: new Date().toISOString()
        },
        featured: item.visibility_score > 100,
        condition: 'excellent' as const,
        tags: [],
        createdAt: item.created_at
      })) : [];
      
      setProducts(formattedProducts);
      console.log('✅ Produtos carregados:', formattedProducts.length);
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setIsLoading(false);
  };

  const loadCategoriesAndGames = async () => {
    try {
      // Get unique categories
      const { data: categoriesData, error: catError } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');
      
      // Get unique games
      const { data: gamesData, error: gameError } = await supabase
        .from('products')
        .select('game')
        .eq('status', 'active');
      
      if (catError || gameError) {
        console.error('Error loading categories/games:', catError || gameError);
        return;
      }
      
      const uniqueCategories = [...new Set(categoriesData?.map(p => p.category))];
      const uniqueGames = [...new Set(gamesData?.map(p => p.game))];
      
      setCategories(uniqueCategories.map(cat => ({ id: cat, name: getCategoryName(cat) })));
      setGames(uniqueGames.map(game => ({ id: game, name: game })));
    } catch (error) {
      console.error('Error loading categories and games:', error);
    }
  };

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'account': '🎮 Contas',
      'skin': '✨ Skins', 
      'giftcard': '🎁 Gift Cards',
      'service': '🚀 Serviços'
    };
    return categoryMap[category] || category;
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.game.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Game filter
    if (selectedGame) {
      filtered = filtered.filter(product => product.game === selectedGame);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.seller.reputation - a.seller.reputation);
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [products, searchQuery, selectedGame, selectedCategory, sortBy, priceRange]);

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
  };

  const handleGameFilter = (gameId: string) => {
    setSelectedGame(gameId === selectedGame ? '' : gameId);
  };

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

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Produtos {searchQuery && `para "${searchQuery}"`}
          </h1>
          <p className="text-gray-400">
            {filteredProducts.length} produtos encontrados
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
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
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
                      key={game.id}
                      onClick={() => handleGameFilter(game.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedGame === game.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {game.name}
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
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum produto real encontrado</h3>
                <p className="text-gray-400">Apenas produtos reais do Supabase são exibidos</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                        }`}
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="success">{product.condition}</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge variant="primary">{product.game}</Badge>
                      </div>
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