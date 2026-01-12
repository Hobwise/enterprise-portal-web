"use client";
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary for SelectBusinessForm
 * Catches errors during rendering, in lifecycle methods, and in constructors
 * of the whole tree below them.
 */
class SelectBusinessErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('[SelectBusinessErrorBoundary] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Clear error state and attempt recovery
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optionally navigate back or reload
    // window.location.reload();
  };

  handleGoBack = () => {
    // Navigate back to login page
    window.location.href = '/auth/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>

              {/* Error Message */}
              <p className="text-sm text-gray-600 mb-6">
                An unexpected error occurred while loading the business selection page.
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <span className="block mt-2 text-xs text-red-600 font-mono">
                    {this.state.error.message}
                  </span>
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleGoBack}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Login
                </button>
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6 w-full text-left">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    Show error details (Development only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-48">
                    <div className="mb-2">
                      <strong>Error:</strong>
                      <pre className="mt-1 text-red-600">{this.state.error?.stack}</pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SelectBusinessErrorBoundary;
