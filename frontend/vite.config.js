// vite.config.js — Vite configuration for React + Tailwind
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Enables Tailwind CSS via Vite plugin
  ],
  resolve: {
    alias: {
      // "@" means "src/" — lets us write import from "@/components/..."
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy API calls to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})