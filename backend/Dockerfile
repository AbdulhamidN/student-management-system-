FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
USER appuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/live || exit 1
CMD ["node", "src/server.js"]
