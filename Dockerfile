# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
RUN mkdir -p data
ENV NODE_ENV=production
EXPOSE 3014
CMD ["node", "server/index.js"]
