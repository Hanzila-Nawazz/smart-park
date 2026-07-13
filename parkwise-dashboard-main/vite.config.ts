import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite"; // <-- Added Nitro

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({ 
      preset: 'vercel',
      routeRules: {
        '/api/**': { proxy: 'http://80.225.229.45/api/**' }
      }
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  server: {
    port: 3000,
    strictPort: true
  }
});