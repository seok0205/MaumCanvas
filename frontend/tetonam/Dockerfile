# 빌드 전용 Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# 환경변수를 ARG로 받기 (빌드 시점에 전달)
ARG VITE_API_URL
ARG VITE_AGORA_APP_ID

# ARG를 ENV로 변환하여 빌드 과정에서 사용 가능하게 함
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AGORA_APP_ID=$VITE_AGORA_APP_ID

# pnpm 설치 (corepack 사용 가능)
RUN corepack enable

# 종속성 설치
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 복사 및 빌드 (이 시점에 환경변수가 사용됨)
COPY . .
RUN pnpm run build

FROM nginx:stable-alpine

# Nginx 기본 index.html 경로로 빌드 결과 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택) Nginx 커스텀 설정 사용 시
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 실행 (기본값으로 CMD 설정되어 있음)
