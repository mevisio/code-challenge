import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      "/api": { target: { port: 8126, host: "localhost" } },
    },
  },
});
