import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { MainApp } from './MainApp';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;