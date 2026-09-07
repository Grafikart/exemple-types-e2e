import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: true,
    proxy: { '/graphql': 'http://localhost:3300' },
  },
  preview: { proxy: { '/graphql': 'http://localhost:3300' } },
})
