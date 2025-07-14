import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  refreshProducts: () => void;
  setRefreshProducts: (fn: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshProducts, setRefreshProducts] = useState<() => void>(() => () => {});

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      searchQuery,
      setSearchQuery,
      selectedGame,
      setSelectedGame,
      selectedCategory,
      setSelectedCategory,
      refreshProducts,
      setRefreshProducts
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}