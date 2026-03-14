// ═══════════════════════════════════════════════════════════════
// Adds QueryClientProvider, Toaster, ErrorBoundary, and useAuthInit
// ═══════════════════════════════════════════════════════════════

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes/global.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { queryClient } from './core/queryClient'
import ErrorBoundary from './core/errorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            success: { duration: 4000 },
            error:   { duration: 6000 },
            style: { fontFamily: 'var(--font-poppins)', fontSize: '14px' },
          }}
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)