import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // @ts-expect-error because @vitejs/plugin-react doesn't use .js import extensions as of 2022-11-08
    react(),
  ],
  server: {
    proxy: {
      "/api": { target: { port: 8126, host: "localhost" } },
    },
  },
});
