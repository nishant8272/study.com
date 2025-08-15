import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target:"https://study-com-76a1.onrender.com", // Adjust to your backend server URL,
        changeOrigin: true,
        rewrite: (path) => {
          console.log('Proxying request:', path);
          return path.replace(/^\/api/, '')
        }
      }
    }
  }
})
