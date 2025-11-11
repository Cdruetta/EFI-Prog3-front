import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite ya maneja automáticamente el history API fallback en desarrollo
  // No necesitas configurarlo explícitamente
})
