import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Oops! Algo deu errado</h2>
            <p className="text-gray-400 mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                icon={RefreshCw}
                onClick={this.handleReload}
              >
                Recarregar Página
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={this.handleReset}
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}