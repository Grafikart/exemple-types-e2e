import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5177, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), viteReact()],
})
