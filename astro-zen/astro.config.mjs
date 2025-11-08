// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    // @ts-ignore - TailwindCSS v4 Vite plugin compatibility
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: (id) => {
          // Exclude admin routes and write APIs from production bundle
          if (process.env.NODE_ENV === 'production') {
            return id.includes('/admin/') || 
                   id.includes('/api/blog/save') ||
                   id.includes('/api/upload/');
          }
          return false;
        },
      },
    },
  },
});