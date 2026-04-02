import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong. Please try again later.';
      
      try {
        // Check if it's a Firestore error JSON
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database error during ${parsed.operationType}: ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error, use default or error.message
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Oops! Something went wrong</h2>
            <div className="bg-red-50 p-4 rounded-2xl text-red-700 text-sm font-medium mb-8 text-left overflow-auto max-h-40">
              {errorMessage}
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh Page</span>
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-gray-50 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2 border border-gray-100"
              >
                <Home className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
