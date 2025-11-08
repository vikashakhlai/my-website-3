import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 🔹 Проксируем API-запросы
      "/api-nest": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket support
        configure: (proxy, options) => {
          proxy.on("error", (err, req, res) => {
            console.error("❌ Proxy error:", err.message);
            if (!res.headersSent) {
              res.writeHead(500, {
                "Content-Type": "text/plain",
              });
              res.end(
                "Backend server is not running. Please start the NestJS server on port 3001."
              );
            }
          });

          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("🔹 Proxying:", req.method, req.url);
          });

          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("✅ Response:", proxyRes.statusCode, req.url);
          });
        },
        rewrite: (path) => {
          const rewritten = path.replace(/^\/api-nest/, "/api/v1");
          return rewritten;
        },
      },

      // 🔹 Проксируем доступ к статическим файлам uploads
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.error("❌ Uploads proxy error:", err.message);
          });
        },
      },
    },
  },
});
