import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, loadEnv } from "vite";
import ssrPlugin from "vite-ssr-components/plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [cloudflare(), ssrPlugin()],
    define: {
      "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL),
      "process.env.DATABASE_AUTH_TOKEN": JSON.stringify(
        env.DATABASE_AUTH_TOKEN
      ),
    },
  };
});
