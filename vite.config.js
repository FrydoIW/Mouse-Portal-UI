// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const allowedNgrokHosts = ["lightfootedly-booted-phebe.ngrok-free.dev", "localhost", "127.0.0.1", "192.168.0.105"];

// Kalau kamu akses lewat IP LAN (contoh: 192.168.x.x), tambahin juga IP itu di array di atas.


export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: allowedNgrokHosts,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Spring Boot
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // prevent Spring from treating this as a CORS request
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("Origin");
          });
        },
      },
    },
  },
});
