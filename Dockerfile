# Stage 1: Build environment
FROM node:22.14.0-alpine AS builder

WORKDIR /app

# Copy root configurations and workspace lockfiles
COPY package.json package-lock.json ./

# Copy packages and apps metadata to bootstrap dependencies
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api/package.json ./packages/api/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/admin/package.json ./apps/admin/

# Install dependencies (workspaces support is native in npm)
RUN npm ci --workspace=@raza-stationers/api-server --include-workspace-deps

# Copy the rest of the source code (except what is ignored in .dockerignore)
COPY . .

# Generate Prisma Client
RUN DIRECT_URL=postgresql://prisma@127.0.0.1:5432/phase8_build npm run db:generate

# Build the workspaces needed for the API server
RUN npm run build --workspace=@raza-stationers/types && \
    npm run build --workspace=@raza-stationers/validation && \
    npm run build --workspace=@raza-stationers/db && \
    npm run build --workspace=@raza-stationers/api-server

# Prune development dependencies (npm prune will keep production modules)
RUN npm prune --production --workspace=@raza-stationers/api-server --include-workspace-deps

# Stage 2: Runtime environment
FROM node:22.14.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only the built output and required runtime files
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/db ./packages/db
COPY --from=builder --chown=nestjs:nodejs /app/packages/types ./packages/types
COPY --from=builder --chown=nestjs:nodejs /app/packages/validation ./packages/validation
COPY --from=builder --chown=nestjs:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=nestjs:nodejs /app/supabase-ca.crt ./supabase-ca.crt

# Expose NestJS API port
EXPOSE 4000

USER nestjs

# Set working directory to the API application workspace
WORKDIR /app/apps/api

# Startup command (runs NestJS API built main script)
CMD ["node", "dist/main"]
