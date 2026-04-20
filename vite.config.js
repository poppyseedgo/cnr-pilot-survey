import { defineConfig } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  // Cloudflare Workers Builds 요구사항: plugins 배열 필수 (빈 배열이어도 OK)
  // → Vanilla JS라 현재는 비어있지만, 이 선언이 없으면 빌드가 거부됨
  plugins: [cloudflare()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});