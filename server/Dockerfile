FROM node:20-alpine

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./
RUN npm install

# Optional: install nodemon globally for dev
RUN npm install -g nodemon

# Copy all source code
COPY . .

# =============================
# RUN TESTS BEFORE BUILD SUCCEEDS
# =============================
# If tests fail, Docker build fails automatically
RUN npm test

# Expose port
EXPOSE 3000

# Start app
CMD ["nodemon", "src/server.js"]
