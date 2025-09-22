FROM node:20-alpine

WORKDIR /app

# Install deps separately for caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy rest
COPY frontend .

EXPOSE 3000
