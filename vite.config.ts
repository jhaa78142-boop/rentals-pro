import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunks so users cache React separately from your code
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":   ["react", "react-dom", "react-router-dom"],
          "vendor-motion":  ["framer-motion"],
          "vendor-form":    ["react-hook-form", "@hookform/resolvers", "zod"],
          "vendor-ui":      ["lucide-react", "sonner", "clsx", "tailwind-merge"],
        },
      },
    },
    // Warn if any chunk > 600kb
    chunkSizeWarningLimit: 600,
    // Minify with esbuild (default, fast)
    minify: "esbuild",
    // Generate source maps for production debugging (optional — remove if you don't need)
    sourcemap: false,
    // Ensure assets are cache-busted
    assetsDir: "assets",
  },
  // Pre-bundle large deps to avoid dev-mode waterfalls
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "react-hook-form", "zod"],
  },
});
