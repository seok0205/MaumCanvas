# ARG들을 FROM 앞에 선언 (global scope)
ARG NODE_IMAGE_DIGEST=sha256:5539840ce9d013fa13e3b9814c9353024be7ac75aca5db6d039504a56c04ea59
ARG NGINX_IMAGE_DIGEST=sha256:d67ea0d64d518b1bb04acde3b00f722ac3e9764b3209a9b0a98924ba35e4b779

# 1단계: Base 이미지 정의 (보안 강화: digest 고정)
FROM node:22-alpine@${NODE_IMAGE_DIGEST} AS base

# 사용자 권한 관련 ARG
ARG USER_ID
ARG GROUP_ID
ARG USERNAME

# 보안 업데이트 적용
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# non-root 사용자 생성 (보안 강화)
RUN addgroup -g ${GROUP_ID} -S nodejs && \
    adduser -S ${USERNAME} -u ${USER_ID}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 2단계: 의존성 설치 (캐싱 최적화)
FROM base AS deps
WORKDIR /app

# ARG를 재선언 (multi-stage build에서 필요)
ARG USER_ID
ARG GROUP_ID
ARG USERNAME

# pnpm cache 디렉토리 생성 및 권한 설정
RUN mkdir -p /pnpm/store && chown -R ${USERNAME}:nodejs /pnpm
RUN chown ${USERNAME}:nodejs /app

# 사용자로 전환
USER ${USERNAME}

COPY --chown=${USERNAME}:nodejs package.json pnpm-lock.yaml ./

# 캐시를 활용하되 node_modules 권한 문제 해결
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=${USER_ID},gid=${GROUP_ID},mode=0755 \
    mkdir -p /app/node_modules && pnpm install --frozen-lockfile

# 3단계: 개발 환경
FROM deps AS development

# ARG를 재선언 (개발환경에서도 Vite 변수 필요)
ARG USERNAME
ARG VITE_API_URL
ARG VITE_ENV
ARG VITE_NODE_ENV
ARG VITE_APP_PORT
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# 개발 시 환경변수로 설정 (Vite Dev Server가 인식할 수 있도록)
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ENV=${VITE_ENV}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}
ENV VITE_APP_PORT=${VITE_APP_PORT}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

COPY --chown=${USERNAME}:nodejs . .
CMD ["pnpm", "dev"]

# 4단계: 빌드 단계
FROM deps AS build

# ARG를 재선언 (빌드에 필요한 변수들)
ARG USER_ID
ARG GROUP_ID
ARG USERNAME
ARG VITE_API_URL
ARG VITE_ENV
ARG VITE_NODE_ENV
ARG VITE_APP_PORT
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# 빌드 시 환경변수로 설정 (Vite가 인식할 수 있도록)
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ENV=${VITE_ENV}
ENV VITE_NODE_ENV=${VITE_NODE_ENV}
ENV VITE_APP_PORT=${VITE_APP_PORT}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

COPY --chown=${USERNAME}:nodejs . .

# 빌드 시에도 node_modules 캐시 마운트 사용
RUN --mount=type=cache,id=node_modules,target=/app/node_modules,uid=${USER_ID},gid=${GROUP_ID},mode=0755 \
    --mount=type=cache,id=build,target=/app/.cache,uid=${USER_ID},gid=${GROUP_ID},mode=0755 \
    pnpm run build

# 5단계: Nginx 기반 프로덕션 (보안 강화)
FROM nginx:alpine@${NGINX_IMAGE_DIGEST} AS production

# 프로덕션 전용 ARG들
ARG PORT
ARG SERVER_NAME
ARG CSP_POLICY

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
RUN echo "server { \
    listen ${PORT}; \
    server_name ${SERVER_NAME}; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # 보안 헤더 추가 \
    add_header X-Frame-Options \"SAMEORIGIN\" always; \
    add_header X-XSS-Protection \"1; mode=block\" always; \
    add_header X-Content-Type-Options \"nosniff\" always; \
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always; \
    add_header Content-Security-Policy \"${CSP_POLICY}\" always; \
    \
    # SPA를 위한 fallback 설정 \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
    \
    # 정적 자산 캐싱 \
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ { \
        expires 1y; \
        add_header Cache-Control \"public, immutable\"; \
    } \
    \
    # Gzip 압축 \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_proxied expired no-cache no-store private; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
}" > /etc/nginx/conf.d/default.conf

# 로그 포워딩 (Docker 공식 권장사항)
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# non-root 사용자로 실행
USER nginx

# 포트 노출
EXPOSE ${PORT}

# 헬스체크 추가 (보안 모범 사례 적용)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# 프로세스 시작
CMD ["nginx", "-g", "daemon off;"]