import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',       // Vercel expects this — explicit is safer than relying on default
    sourcemap: false,     // Never expose sourcemaps in production (hides the source code)
  },
  server: {
    port: 5173,           // Matches the localhost URL in Supabase Auth redirect allowlist
  },
})