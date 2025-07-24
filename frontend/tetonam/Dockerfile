# 1단계: Base 이미지 정의 (보안 강화: digest 고정)
FROM node:22-alpine@sha256:5539840ce9d013fa13e3b9814c9353024be7ac75aca5db6d039504a56c04ea59 AS base

# 보안 업데이트 적용
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# non-root 사용자 생성 (보안 강화)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2단계: 의존성 설치 (캐싱 최적화)
FROM base AS deps
WORKDIR /app

# pnpm cache 디렉토리를 root로 생성하고 nextjs 사용자에게 권한 부여
RUN mkdir -p /pnpm/store && chown -R nextjs:nodejs /pnpm
RUN chown nextjs:nodejs /app

# nextjs 사용자로 전환
USER nextjs

COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml ./

# 캐시를 활용하여 의존성 설치하되, 실제 node_modules도 이미지에 보존
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1001,gid=1001 \
    pnpm install --frozen-lockfile

# 3단계: 개발 환경
FROM deps AS development
COPY --chown=nextjs:nodejs . .
CMD ["pnpm", "dev"]

# 4단계: 빌드 단계
FROM deps AS build
COPY --chown=nextjs:nodejs . .
RUN pnpm run build

# 5단계: Nginx 기반 프로덕션 (보안 강화)
FROM nginx:alpine@sha256:d67ea0d64d518b1bb04acde3b00f722ac3e9764b3209a9b0a98924ba35e4b779 AS production

# 보안 업데이트 적용
RUN apk update && apk upgrade && \
    rm -rf /var/cache/apk/*

# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# nginx 사용자로 실행하기 위한 권한 설정
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 기본 nginx 설정 최적화 (보안 강화)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # 보안 헤더 추가 \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer-when-downgrade" always; \
    add_header Content-Security-Policy "default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''" always; \
    \
    # SPA를 위한 fallback 설정 \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # 정적 자산 캐싱 \
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Gzip 압축 \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_proxied expired no-cache no-store private; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}' > /etc/nginx/conf.d/default.conf

# 로그 포워딩 (Docker 공식 권장사항)
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# non-root 사용자로 실행
USER nginx

# 포트 노출
EXPOSE 80

# 헬스체크 추가 (보안 모범 사례)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 프로세스 시작
CMD ["nginx", "-g", "daemon off;"]