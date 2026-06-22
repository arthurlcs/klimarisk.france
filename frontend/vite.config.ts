import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // INDISPENSABLE POUR GITHUB PAGES : correspond au nom de ton dépôt GitHub
  base: '/klimarisk.france/',

  // Indique à Vite de traiter l'extension .gz comme un fichier statique brut
  assetsInclude: ['**/*.gz'],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("leaflet")) return "vendor-leaflet";
            if (id.includes("recharts")) return "vendor-recharts";
            return "vendor";
          }
        }
      }
    }
  }
})