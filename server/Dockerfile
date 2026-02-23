FROM node:20-alpine

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./
RUN npm install

# Install curl (needed for healthcheck)
RUN apk add --no-cache curl

# Copy all source code
COPY . .

# =============================
# RUN TESTS BEFORE BUILD SUCCEEDS
# =============================
# If tests fail, Docker build fails automatically
RUN npm test

# Expose port
EXPOSE 3000

# Start app in production mode
CMD ["node", "src/server.js"]