# platform tag is there for unraid.
FROM --platform=linux/amd64 oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Build the app
FROM base AS build
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN bun run build

# Run the app
FROM base AS runtime
ENV NODE_ENV=production
ENV BUN_PORT=7284

# Create directory for credentials
RUN mkdir -p /etc/sms-accountant

# Copy built app and production dependencies
COPY --from=build /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 7284

CMD ["bun", "dist/index.js"]
