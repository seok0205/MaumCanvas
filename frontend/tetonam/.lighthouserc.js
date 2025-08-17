module.exports = {
  ci: {
    collect: {
      // Chrome 플래그 설정
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox',
        // Lighthouse 설정
        skipAudits: [
          'unused-javascript', // 개발 환경에서는 스킵
          'unused-css-rules', // 개발 환경에서는 스킵
        ],
        // 성능 측정을 위한 설정
        throttlingMethod: 'devtools',
        maxWaitForLoad: 45000,
        // 폰트 로딩을 기다림
        pauseAfterLoadMs: 1000,
      },
      // 여러 번 실행하여 평균값 사용
      numberOfRuns: 3,
      // 정적 파일 디렉토리
      staticDistDir: './dist',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // LCP 최적화 목표
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        // 폰트 최적화 검증
        'font-display': 'error',
        'preload-fonts': 'warn',

        // 리소스 최적화
        'uses-rel-preload': 'warn',
        'uses-rel-preconnect': 'warn',
        'render-blocking-resources': 'warn',

        // 이미지 최적화 (현재는 경고로 설정)
        'offscreen-images': 'warn',
        'uses-webp-images': 'off', // WebP 미사용 시 꺼둠
        'uses-optimized-images': 'warn',

        // 번들 크기 관련
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn',
        'modern-image-formats': 'off',

        // 접근성은 유지
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',

        // PWA 관련 (필요시)
        'installable-manifest': 'off',
        'apple-touch-icon': 'off',
        'themed-omnibox': 'off',

        // 성능 예산
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }], // 50KB
        'resource-summary:font:count': ['warn', { maxNumericValue: 4 }], // 폰트 4개 이하
        'resource-summary:font:size': ['warn', { maxNumericValue: 150000 }], // 150KB 이하
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB 이하
        'resource-summary:stylesheet:size': [
          'warn',
          { maxNumericValue: 100000 },
        ], // 100KB 이하
        'resource-summary:third-party:count': ['warn', { maxNumericValue: 5 }], // 서드파티 5개 이하
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
