'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { resetLoginInfo } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Check if this is an authentication-related error
    const errorMessage = error?.message || '';
    if (
      errorMessage.includes('Cannot read properties of null') &&
      (errorMessage.includes('password') || 
       errorMessage.includes('token') || 
       errorMessage.includes('user') ||
       errorMessage.includes('email'))
    ) {
      // Clear local storage and redirect to login
      console.warn('Authentication error in Error Boundary, redirecting to login...');
      resetLoginInfo();
      window.location.href = '/auth/login';
    }
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      
      // Check if this is an authentication error
      if (
        errorMessage.includes('Cannot read properties of null') &&
        (errorMessage.includes('password') || 
         errorMessage.includes('token') || 
         errorMessage.includes('user') ||
         errorMessage.includes('email'))
      ) {
        // Show a brief message while redirecting
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Session expired
              </h2>
              <p className="text-gray-500">Redirecting to login...</p>
            </div>
          </div>
        );
      }
      
      // For other errors, show a generic error message
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#5F35D2] text-white rounded-lg hover:bg-[#4A2BA7] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;