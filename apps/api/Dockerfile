FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
COPY apps/api/package.json apps/api/package-lock.json* ./
RUN npm ci

# Copy source
COPY apps/api/ .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY apps/api/package.json apps/api/package-lock.json* ./
RUN npm ci --omit=dev

COPY apps/api/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
