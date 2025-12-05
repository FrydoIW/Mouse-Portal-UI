// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const allowedNgrokHosts = ["lightfootedly-booted-phebe.ngrok-free.dev"];

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
      },
    },
  },
});
