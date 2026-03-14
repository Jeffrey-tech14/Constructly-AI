import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron" || process.env.ELECTRON === "true";

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
    },
    plugins: [react()],
    build: {
      minify: "esbuild",
      // For Electron, build to dist; for web, same
      outDir: "dist",
    },
    base: isElectron ? "./" : "/", // Use relative path for Electron
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
