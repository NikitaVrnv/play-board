// vite.config.ts - CORRECTED
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 5173, // Your port
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your backend
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    // --- ADD THIS PLUGIN BACK ---
    {
      name: 'spa-fallback-middleware',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            if (
              req.url &&
              (req.url.includes('.') ||
               req.url.startsWith('/api') ||
               req.url.startsWith('/@') ||
               req.url.startsWith('/node_modules'))
            ) {
              return next(); // Skip assets, API, internal Vite requests
            }
            // Rewrite non-asset URLs to '/' for React Router
            req.url = '/';
            next();
          });
        };
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});