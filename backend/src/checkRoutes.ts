// Simple route checker script
// Add this to your server.ts file temporarily to debug route registration issues

import { Express } from "express";

export function listRoutes(app: Express) {
  console.log("\n🛣️  API ROUTES REGISTERED:");
  console.log("==============================");
  
  const routes: { method: string; path: string }[] = [];
  
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods)
        .filter((method) => middleware.route.methods[method])
        .map((method) => method.toUpperCase());
      
      methods.forEach((method) => {
        routes.push({ method, path });
      });
    } else if (middleware.name === "router") {
      // Router middleware
      const path = middleware.regexp.toString()
        .replace("\\/?(?=\\/|$)", "")
        .replace(/^\^\\/, "")
        .replace(/\\\/\?\(\?=\\\/\|\$\)\/i$/, "")
        .replace(/\\\//g, "/");
      
      // Check if this is a router with a base path
      const basePathMatch = path.match(/^\/([^\/]+)/);
      const basePath = basePathMatch ? basePathMatch[0] : "";
      
      // Extract the mounted middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const routePath = handler.route.path;
          const fullPath = basePath + (routePath === "/" ? "" : routePath);
          
          const methods = Object.keys(handler.route.methods)
            .filter((method) => handler.route.methods[method])
            .map((method) => method.toUpperCase());
          
          methods.forEach((method) => {
            routes.push({ method, path: fullPath });
          });
        }
      });
    }
  });
  
  // Sort routes by path for easier reading
  routes.sort((a, b) => a.path.localeCompare(b.path));
  
  // Print routes in a formatted way
  routes.forEach(({ method, path }) => {
    console.log(`${method.padEnd(7)} ${path}`);
  });
  
  console.log("\n");
}