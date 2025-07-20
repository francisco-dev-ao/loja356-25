import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/emis-api': {
        target: 'https://pagamentonline.emis.co.ao',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/emis-api/, ''),
        secure: true,
        headers: {
          'Origin': 'https://pagamentonline.emis.co.ao',
          'Referer': 'https://pagamentonline.emis.co.ao/'
        }
      },
      '/api/emis-proxy': {
        target: 'https://pagamentonline.emis.co.ao',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/emis-proxy/, '/online-payment-gateway/portal/frameToken'),
        secure: true,
        headers: {
          'Origin': 'https://pagamentonline.emis.co.ao',
          'Referer': 'https://pagamentonline.emis.co.ao/',
          'Content-Type': 'application/json'
        }
      }
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
