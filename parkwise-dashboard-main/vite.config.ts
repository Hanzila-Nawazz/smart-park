import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite"; // <-- Added Nitro

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({ preset: 'vercel' }), // <-- Explicit Vercel preset
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  server: {
    port: 3000,
    strictPort: true
  }
});