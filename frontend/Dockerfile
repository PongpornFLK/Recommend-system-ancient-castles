# Stage 1: Install dependencies
FROM oven/bun:1.1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install

# Stage 2: Build the application
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
RUN bun run build

# Stage 3: Production runner
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy standalone build and static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# Next.js standalone server uses node to run
CMD ["bun", "server.js"]
