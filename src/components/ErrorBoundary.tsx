
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("UI error captured:", error, errorInfo);
    // Show user-friendly toast notification
    if (typeof window !== 'undefined' && (window as any).toast) {
      (window as any).toast.error("Ops! Algo deu errado.", {
        description: "Recarregue a página ou tente novamente mais tarde.",
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold">Algo deu errado</h1>
            <p className="text-sm opacity-80">Atualize a página ou tente novamente em instantes.</p>
            <button onClick={this.handleReload} className="btn-primary px-4 py-2 rounded-md">Recarregar</button>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;
