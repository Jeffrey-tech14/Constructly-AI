import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Sanitize VITE_ env vars before Vite reads them.
// Strips extra key=value pairs accidentally appended to a single env var
// (e.g. when an entire .env file was pasted into one value field).
for (const key of Object.keys(process.env)) {
    if (key.startsWith("VITE_") && process.env[key]) {
        const value = process.env[key];
        const extraKeyIndex = value.indexOf(" VITE_");
        if (extraKeyIndex > 0) {
            process.env[key] = value.substring(0, extraKeyIndex);
        }
    }
}

export default defineConfig(({ mode }) => {
    const isElectron = mode === "electron" || process.env.ELECTRON === "true";
    return {
        server: {
            host: "::",
            port: 8080,
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
