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
        selfHandleResponse: false,
        rewrite: (path) => path.replace(/^\/api-nest/, "/api/v1"),
        configure: (proxy, options) => {
          console.log("🔧 Proxy /api-nest →", options.target);
        },
      },

      // 🔹 Проксируем доступ к статическим файлам uploads
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
