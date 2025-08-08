import react from '@vitejs/plugin-react';
import { FontaineTransform } from 'fontaine';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 3000,
  },
  plugins: [
    react(),
    FontaineTransform.vite({
      // Prefer local Korean sans as fallbacks, applies to all fonts
      fallbacks: [
        'Noto Sans KR',
        'Malgun Gothic',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Helvetica Neue',
        'Arial',
      ],
      // Resolve font files served from Vite public dir
      resolvePath: (id: string) => new URL(`./public${id}`, import.meta.url),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.woff2', '**/*.woff'],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: assetInfo => {
          if (
            assetInfo.name?.endsWith('.woff2') ||
            assetInfo.name?.endsWith('.woff')
          ) {
            return 'fonts/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
}));
