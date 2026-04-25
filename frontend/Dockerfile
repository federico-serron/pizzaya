# ============================================================
# Stage 1: Dev dependencies — install deps only (for dev server)
# ============================================================
FROM node:20-alpine AS dev

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Source code will be mounted via docker-compose volumes in dev mode
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]

# ============================================================
# Stage 2: Build — compile TypeScript and bundle with Vite
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the production bundle
# tsc type-checks then vite builds to /app/dist
RUN npm run build

# ============================================================
# Stage 3: Serve — nginx serving static assets
# ============================================================
FROM nginx:stable-alpine AS serve

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create health check endpoint directory (optional: add a tiny health file)
RUN mkdir -p /usr/share/nginx/html/health \
    && echo "ok" > /usr/share/nginx/html/health/index.html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80/health || exit 1

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
