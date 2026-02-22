# HomeIT Agent Docker Image
# Build with: docker build --network=host -t homeit-agent:latest .

FROM node:20-alpine

# Install docker CLI for container management
RUN apk add --no-cache docker-cli curl openssl

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (use --network=host during build for DNS on Synology)
# Include dev deps for tsx runtime
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Run as root to access docker socket
# (Synology docker socket requires root access)

# Run the daemon (scheduler mode) by default
# For interactive CLI, use: docker exec -it homeit-agent npx tsx src/cli.ts
CMD ["npx", "tsx", "src/daemon.ts"]
