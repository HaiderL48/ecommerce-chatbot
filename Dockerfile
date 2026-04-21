# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for better-sqlite3 native build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Build Next.js
RUN npm run build

# ── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install runtime deps for better-sqlite3
RUN apk add --no-cache libc6-compat

# Copy only what's needed
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/products.sqlite ./products.sqlite

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
