import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Garante que o Vite escute todas as interfaces de rede do container
    hmr: {
      clientPort: 5173, // Força o navegador a falar com a porta exposta física
    },
  },
})