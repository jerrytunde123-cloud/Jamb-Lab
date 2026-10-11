import { defineConfig } from 'vite';

export default defineConfig({
  // Keep the historic :8000 so existing bookmarks and docs keep working.
  // (Vite's own default is 5173.)
  server: { port: 8000 },
  preview: { port: 8000 },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
  },
});
