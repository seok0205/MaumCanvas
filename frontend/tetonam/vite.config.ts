import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: parseInt(process.env.VITE_DEV_PORT || "3000"),
    strictPort: true,
  },
  preview: {
    host: true,
    port: parseInt(process.env.VITE_DEV_PORT || "3000"),
    strictPort: true,
  },
});