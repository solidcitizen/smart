# HomeIT Agent Docker Image
FROM node:20-alpine

# Alpine already includes curl, openssl
# No apt-get needed - avoids DNS issues during build

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
RUN adduser -D -s /bin/sh homeit
USER homeit

# Default command runs the CLI (scheduler will be added later)
CMD ["node", "dist/cli.js"]
