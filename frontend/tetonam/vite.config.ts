import react from '@vitejs/plugin-react';
import { FontaineTransform } from 'fontaine';
import path from 'path';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

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
    // 안전한 gzip 압축 (빌드 시점)
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 1KB 이상 파일만 압축
      deleteOriginFile: false, // 원본 파일 유지
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'fonts/*.woff2'],
      manifest: {
        name: '마음캔버스 - MaumCanvas',
        short_name: 'MaumCanvas',
        description: 'AI 기반 심리 진단 및 상담 서비스',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any', // 태블릿 회전 지원
        scope: '/',
        start_url: '/',
        // 태블릿 최적화 설정
        categories: ['productivity', 'health'],
        prefer_related_applications: false,
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          // 태블릿용 추가 아이콘 크기
          {
            src: 'logo.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '256x256',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // 캐시할 파일 크기 제한 (태블릿 메모리 고려)
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // 메모리 효율적인 런타임 캐싱
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 5, // 메모리 절약을 위해 제한
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50, // API 응답 캐시 제한
                maxAgeSeconds: 60 * 60 * 24, // 1일
              },
              networkTimeoutSeconds: 3, // 빠른 타임아웃
            },
          },
          // 드로잉 데이터 캐싱 (메모리 효율적)
          {
            urlPattern: /\/api\/drawings\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'drawing-cache',
              expiration: {
                maxEntries: 20, // 최근 그림 20개만 캐시
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1주일
              },
            },
          },
        ],
        // 네비게이션 캐싱 최적화
        navigateFallback: '/',
        navigateFallbackDenylist: [
          /^\/_/,
          /\/api\//,
          /\.(?:png|jpg|jpeg|svg)$/,
        ],
        // 청크 크기 최적화
        skipWaiting: true,
        clientsClaim: true,
      },
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
          // 핵심 React 라이브러리 (초기 로딩에 필요) - router 다시 포함
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 필수 UI 컴포넌트 (LCP에 영향)
          'vendor-ui-critical': [
            '@radix-ui/react-slot',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
          ],
          // 비필수 UI 컴포넌트 (지연 로딩 가능)
          'vendor-ui-secondary': [
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
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // 아이콘 (초기 로딩에 영향)
          'vendor-icons': ['lucide-react'],
          // 캔버스 관련 라이브러리들을 분리하여 동적 로딩 최적화
          'vendor-canvas-core': ['konva'],
          'vendor-canvas-react': ['react-konva'],
          // 차트는 필요할 때만 로딩
          'vendor-charts': ['recharts'],
          // 네트워크 관련
          'vendor-query': ['@tanstack/react-query', 'axios'],
          // 폼 관련 (페이지별로 필요할 때만)
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 유틸리티
          'vendor-utils': ['date-fns', 'zustand', 'sonner'],
        },
      },
    },
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // 프로덕션에서만 콘솔 로그 제거
        drop_debugger: true,
        pure_funcs:
          mode === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 750, // 적당한 크기로 조정
    cssCodeSplit: true,
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
