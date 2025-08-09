import react from '@vitejs/plugin-react';
import { FontaineTransform } from 'fontaine';
import path from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import { constants } from 'zlib';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 3000,
  },
  plugins: [
    react(),
    FontaineTransform.vite({
      // 한국어 폰트를 우선으로 하는 폴백 설정, 모든 폰트에 적용
      fallbacks: [
        'Noto Sans KR',
        'Malgun Gothic',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Helvetica Neue',
        'Arial',
      ],
      // Vite public 디렉토리에서 제공되는 폰트 파일 경로 해석
      resolvePath: (id: string) => new URL(`./public${id}`, import.meta.url),
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['MaumCanvasLogo.png', 'fonts/*.woff2'],
      manifest: {
        name: '마음캔버스 - MaumCanvas',
        short_name: 'MaumCanvas',
        description: 'AI 기반 심리 진단 및 상담 서비스',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'MaumCanvasLogo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'MaumCanvasLogo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1일
              },
            },
          },
        ],
      },
    }),
    // Gzip 압축 플러그인
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'gzip',
      ext: '.gz',
      compressionOptions: {
        level: 9,
      },
      filter: /\.(js|mjs|json|css|html)$/i,
    }),
    // Brotli 압축 플러그인
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 1024,
      algorithm: 'brotliCompress',
      ext: '.br',
      compressionOptions: {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      filter: /\.(js|mjs|json|css|html)$/i,
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
        manualChunks: {
          // 벤더 라이브러리
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
            'lucide-react',
          ],
          'vendor-canvas': ['konva', 'react-konva'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': [
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'date-fns',
            'zustand',
            'sonner',
          ],
        },
      },
    },
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
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
