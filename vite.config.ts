import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "https://gleeful-backlog-justifier.ngrok-free.dev";
const proxy = { target, changeOrigin: true, headers: { "ngrok-skip-browser-warning": "true" } };

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/dna/analyze": proxy,
      "/dna/result": proxy,
      "/dna/donate": proxy,
      "/quiz": proxy,
      "/community": proxy,
      "/health": proxy,
    },
  },
});
