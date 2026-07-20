// Build target changed from Cloudflare to Node.js for EC2 deployment
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  nitro: {
    preset: "node-server",
  },
});
