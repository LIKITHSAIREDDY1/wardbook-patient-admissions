import { defineConfig } from 'vite'
export default defineConfig({
  server: { proxy: { '/api': process.env.API_ORIGIN || 'http://localhost:8080' } }
})
