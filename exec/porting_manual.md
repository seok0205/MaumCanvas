# Deployment Guide

## 개요

- 서비스명 : 마음 캔버스
- 팀명 : 테토남 (E108)
- 주요 구성
  - React(FE)
  - Springboot(BE)
  - FastAPI(AI)
  - MySQL, Redis(DB)
  - AWS EC2, Docker, Jenkins, Gerrit, Nginx, SonarQube(Infra)

## 서버 환경

- OS : Ubuntu 22.04.5 LTS (Jammy)
- CPU : Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz, 4 vCPU
- 메모리: 15 GiB RAM
- 가상화: Xen (AWS EC2)

### UFW 설정 및 포트

|포트|연결 서비스|비고|
|---|---|---|
|22|SSH||
|80|HTTP|Nginx Reverse Proxy|
|443|HTTPS|Nginx Reverse Proxy|
|8080|Springboot|Backend|
|8000|FastAPI|AI|
|3307|MySQL|DB|
|6379|Redis|DB|
|8989|Gerrit Web||
|29418|Gerrit SSH||
|8180|Jenkins|Docker|
|9000|SonarQube|Docker|

> `sudo ufw deny <포트 번호>`를 통해 차단하거나 혹은 `sudo ufw delete allow <포트 번호>`로 규칙 삭제, 도커 컴포즈 파일 ports 부분 수정 가능

### 도메인 및 SSL 설정

- 도메인 : i13e108.p.ssafy.io
- SSL 인증서 : Let's Encrypt (Certbot 활용)
  - `fullchain.pem`
  - `privkey.pem`
- 적용 범위 : Nginx Reverse Proxy를 통해 HTTPS(443) 적용, HTTP(80) 요청은 HTTPS로 리다이렉트
- 만료 주기 : 90일(2025.10.26 만료)

### 주요 외부 서비스

|서비스|용도|키 위치|연결 정보|발급|
|---|---|---|---|---|
|Kakao OAuth|소셜 로그인 및 알림 서비스|`deploy/.env`|REST API(Redirect URI)|kakao developers|
|Agora|실시간 화상|`deploy/.env`|App ID, Token, 채널명|Agora|
|AWS S3|파일 저장|`deploy/.env`|버킷: `tetonam`, 리전:`ap-northeast-2`|AWS
|OpenAI|그림 해석(RAG)|`AI/.env`|API key, base URL|OpenAI|

## 사전 설치 도구 및 버전

> docker compose 활용하므로 docker와 docker compose를 제외한 것들은 EC2 환경에 설치할 필요 없음

### Backend

- JVM : OpenJDK 17.0.2
- Framwork : Spring Boot 3.3.1

### Frontend

- Build : Node.js 22 (node:22-alpine)
- Package Manager : pnpm 10.13.1
- Framework : React 19.1.0

### AI

- Framework : FastAPI (Python 3.10.12)
- ASGI server : uvicorn

### Database

- MySQL : 8.0.x (mysql:8.0 tag)
- Redis : 7.x.x (redis:7 tag)

### Reverse Proxy

- Nginx : nginx:stable(docker container)
- Configuration filepath : `S13P11E108/nginx/conf.d/default.conf`
- 80 -> HTTPS redirect
- 443에서 프록시:
  - `/` -> `tetonam-frontend:3000`
  - `/api/` -> `backend:8080`
  - `/ai/` -> `ai-fastapi:8000`
- ssl 인증서 경로
  - `/etc/letsencrypt/live/i13e108.p.ssafy.io/{fullchain.pem,privkey.pem}`

### Docker, Docker Compose

- Docker : 28.3.2 (build 578ccf6)
- Docker Compose : v2.24.4

```bash
# 1. 시스템 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# 2. 필수 유틸리티 설치
sudo apt install -y git curl ca-certificates gnupg lsb-release

# 3. Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. 현재 사용자에 Docker 권한 부여
sudo usermod -aG docker $USER
newgrp docker

# 5. Docker Compose 설치
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) \
    -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# 6. 설치 확인
docker --version
docker compose version
```

## 프로젝트 다운로드

```bash
# GitLab 프로젝트 클론
git clone https://lab.ssafy.com/s13-webmobile1-sub1/S13P11E108.git

# 디렉터리 이동
cd S13P11E108
```

## EC2 구조도

```
S13P11E108/
├─ backend/
│  ├─ Dockerfile
│  ├─ build.gradle
│  └─ src/...
│
├─ frontend/
│  └─ tetonam/
│     ├─ Dockerfile
│     ├─ .dockerignore
│     ├─ package.json
│     └─ src/...
│
├─ AI/
│  ├─ Dockerfile
│  ├─ requirements.txt
│  └─ app/...
│
└─ deploy/
   ├─ docker-compose.yml
   ├─ docker-compose.back.yml
   ├─ docker-compose.front.yml
   ├─ docker-compose.ai.yml
   ├─ mysql/init/
   │  └─ school_dump.sql
   └─ nginx/conf.d/
      └─ default.conf
```

## 환경 변수 설정

1. `.env.example` - AI
    ```bash
    # AI 서버 용 환경 변수 파일 생성
    touch S13P11E108/AI/.env
    vi S13P11E108/AI/.env
    ```

    - `.env`

    ```
    OPENAI_API_KEY=your-openai-api-key
    OPENAI_API_BASE=your-openai-api-base
    ```

2. `.env.example` - back, front
    ```bash
    # back, front용
    touch S13P11E108/deploy/.env
    vi S13P11E108/deploy/.env
    ```

    - `.env`

    ```text
    # mysql
    MYSQL_DATABASE=tetonam
    SPRING_DATASOURCE_USERNAME=root_name
    SPRING_DATASOURCE_PASSWORD=root_password

    # JWT
    JWT_SECRET=jwt_secret_key

    # aws S3
    CLOUD_AWS_CREDENTIALS_ACCESS_KEY=access-key
    CLOUD_AWS_CREDENTIALS_SECRET_KEY=secret-key
    CLOUD_AWS_REGION_STATIC=region
    S3_URL=s3_url

    # ai
    AI_SERVER_URL=ai-server-url

    # mail
    MAIL_USERNAME=mail-username
    MAIL_PASSWORD=mail-password

    # agora
    AGORA_APP_ID=agoraappid
    AGORA_APP_CERTIFICATE=agoraappcertificate

    # kakao
    KAKAO_CLIENT_ID=kakao-client-id
    KAKAO_REDIRECT_URL=kakao-redirect-url
    KAKAO_RECEIVER_UUID=kakao-receiver-uuid
    KAKAO_TEMPLATE_ID=kakao-template-id

    # front
    VITE_API_URL=vite-api-url
    VITE_API_TIMEOUT=vite-api-timeout
    VITE_AGORA_APP_ID=vite-agora-app-id
    ```

## 빌드 및 실행 방법 및 배포

- 배포하기 전에 `.env` 파일과 docker, docker-compose 설치 필수
- 포트 80 / 443 / 22 포트는 개방
- ssl 인증서 생성 후 도커 볼륨 마운트 준비

```bash
# 1. Certbot 설치
sudo apt install -y certbot python3-cert-nginx

# 2. 인증서 발급
# -d 옵션 뒤에 발급받을 도메인 입력
sudo certbot --nginx -d <domain>

# 3. 발급 확인
sudo certbot certificates
```

- docker compose file 실행

```bash
# 배포 디렉터리 이동
cd deploy

# 네트워크 생성
docker network create tetonam-network || true

# 볼륨 생성(DB)
docker volume create mysql_data
docker volume create redis_data

# 배포(백그라운드 실행, 빌드 포함)
docker-compose -f docker-compose.yml -d --build

# 백엔드, 프론트엔드, mysql, redis, fastapi, nginx 띄워져있는지 확인 (UP 확인!)
docker ps -a

# 덤프 파일 적용
cat mysql/init/school_dump.sql | docker exec -i mysql \ mysql -u root -p tetonam
```

## 사연 시나리오

1. 회원가입 / 로그인
2. 설문 및 그림 그리기
3. 상담 예약(그림 그리지 않으면 예약 불가)
4. 상담 하기(Web RTC)
5. 후기 및 고민 내용 커뮤니티 게시