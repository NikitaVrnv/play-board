// vite-spa-fallback.js
export default function viteSpaFallback() {
    return {
      name: 'vite-spa-fallback',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            // If URL has file extension, let Vite handle it
            if (req.url && req.url.match(/\.\w+$/)) {
              return next();
            }
            
            // For all routes without extensions, treat as SPA route
            req.url = '/';
            next();
          });
        };
      }
    };
  }