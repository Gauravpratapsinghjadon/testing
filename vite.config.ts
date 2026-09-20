import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  define: {
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 6000,
  },
  optimizeDeps: {
    include: [
      'botframework-webchat',
      'botframework-webchat-fluent-theme',
      '@microsoft/agents-copilotstudio-client',
      '@azure/msal-browser',
    ],
  },
})
