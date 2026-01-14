// =============================================================================
// ALPHATIC - ERROR BOUNDARY COMPONENT
// =============================================================================
// Catches React errors and prevents full app crashes
// Provides graceful fallback UI
// =============================================================================

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });

    // Log to error reporting service (if available)
    if (window.logError) {
      window.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 rounded-lg p-8">
              {/* Header */}
              <div className="flex items-center mb-6">
                <div className="text-6xl mr-4">⚠️</div>
                <div>
                  <h1 className="text-3xl font-bold text-red-300 mb-2">
                    Something Went Wrong
                  </h1>
                  <p className="text-slate-300">
                    {this.props.errorMessage || 'An unexpected error occurred'}
                  </p>
                </div>
              </div>

              {/* Error Details */}
              {this.state.error && (
                <div className="bg-red-900/20 rounded-lg p-4 mb-6">
                  <div className="font-semibold text-red-300 mb-2">Error Details:</div>
                  <div className="text-sm text-slate-300 font-mono break-words">
                    {this.state.error.toString()}
                  </div>
                </div>
              )}

              {/* Stack Trace (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-slate-800/50 rounded-lg p-4 mb-6">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-300 mb-2">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs text-slate-400 overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Reload Page
                </button>
                
                {this.props.onReset && (
                  <button
                    onClick={() => {
                      this.handleReset();
                      this.props.onReset();
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Reset Dashboard
                  </button>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="text-sm text-slate-300">
                  <div className="font-semibold text-blue-300 mb-2">💡 What to do:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Try clicking "Try Again" to continue</li>
                    <li>• If error persists, reload the page</li>
                    <li>• Check browser console (F12) for more details</li>
                    <li>• Report persistent issues to support</li>
                  </ul>
                </div>
              </div>

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <div className="mt-4 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                  <div className="text-sm text-amber-200">
                    <strong>⚠️ Multiple errors detected ({this.state.errorCount})</strong>
                    <div className="text-xs mt-1">
                      Consider reloading the page or clearing your browser cache.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// CONVENIENCE ERROR BOUNDARIES
// =============================================================================

/**
 * Lightweight error boundary for small sections
 */
export class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SimpleErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
          <div className="text-red-300 font-semibold mb-2">
            ⚠️ Error loading this section
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// HOC for wrapping components with error boundaries
// =============================================================================

export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;
