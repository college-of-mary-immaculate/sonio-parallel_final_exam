FROM node:20-alpine

WORKDIR /app

# Copy package files from server/
COPY server/package*.json ./
RUN npm install

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy server source
COPY server/ .

# ✅ Bake pre-built client dist directly into the image
# No volume mount needed — avoids Windows path issues
COPY client/dist /client/dist

# Run tests
RUN npm test

EXPOSE 3000

CMD ["node", "src/server.js"]