# HomeIT Agent Docker Image
FROM node:20-slim

# Install SSH client for remote commands
RUN apt-get update && apt-get install -y \
    openssh-client \
    openssl \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN useradd -m -s /bin/bash homeit
USER homeit

# Default command runs the scheduler
CMD ["node", "dist/index.js"]

# Alternative: run CLI mode
# CMD ["npm", "run", "chat"]
