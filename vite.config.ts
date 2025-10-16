import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
      $routes: path.resolve("./src/routes"),
    },
  },
  base: "./",
  plugins: [tailwindcss(), svelte()],
});
