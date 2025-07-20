import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [cloudflare()],
    build: {
      lib: {
        entry: "src/index.ts",
        formats: ["es"],
        fileName: "index",
      },
    },
    define: {
      "c.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL),
      "c.env.DATABASE_AUTH_TOKEN": JSON.stringify(env.DATABASE_AUTH_TOKEN),
    },
  };
});
