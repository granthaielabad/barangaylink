// ═══════════════════════════════════════════════════════════════
// src/core/errorBoundary.jsx
// Global React Error Boundary — catches unhandled render errors.
// ═══════════════════════════════════════════════════════════════
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production: send to an error monitoring service
    console.error('[BarangayLink ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4 px-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-gray-600 text-sm mb-6">
              An unexpected error occurred. Please refresh the page or contact your system administrator.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#005F02] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#004A01] transition-colors"
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