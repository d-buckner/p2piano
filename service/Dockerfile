# Base image
FROM node:24-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S p2piano -u 1001 -G nodejs

WORKDIR /app

# Install dependencies as root
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

# Copy source and build
COPY src ./src
RUN npm run build

# Change ownership to non-root user
RUN chown -R p2piano:nodejs /app

# Switch to non-root user
USER p2piano

CMD [ "node", "dist/main.js" ]
