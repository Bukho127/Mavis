import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/chat": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/documents": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/interviews": {
        target: "http://localhost:3000", // or 5000, whichever port is actually active
        changeOrigin: true,
      },
    },
  },
});
