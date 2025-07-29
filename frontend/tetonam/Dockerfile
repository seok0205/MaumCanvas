# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (with cache mount)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (with cache mount)
RUN --mount=type=cache,id=build,target=/app/.cache \
    pnpm run build

# Production stage
FROM nginx:alpine AS production

# Create SSL directories
# RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy SSL certificates (will be mounted at runtime)
# COPY ssl/i13e108.p.ssafy.io.crt /etc/ssl/certs/
# COPY ssl/i13e108.p.ssafy.io.key /etc/ssl/private/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Validate nginx configuration syntax
RUN nginx -t

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose ports
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]