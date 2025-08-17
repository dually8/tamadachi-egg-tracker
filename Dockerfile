FROM node:22-slim

# Create app directory
WORKDIR /app

# Copy only package.json and lockfile first (for caching)
COPY package.json pnpm-lock.yaml ./

RUN corepack enable pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Ensure the SQLite DB file exists (you may prefer to mount this instead of COPY)
# If you want the DB outside of the container for persistence, don't COPY it.
# COPY local.db ./local.db

# Build Next.js app
RUN pnpm run build

# Expose the Next.js port
ENV PORT=3000
EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Run in production
CMD ["pnpm", "run", "start:nobuild"]
