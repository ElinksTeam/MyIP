# Build stage
FROM node:24-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Production stage
FROM node:24-alpine AS production-stage
WORKDIR /app
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/package.json ./
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/backend-server.js ./
COPY --from=build-stage /app/frontend-server.js ./
COPY --from=build-stage /app/api ./api
COPY --from=build-stage /app/common ./common

RUN mkdir -p logs common/maxmind-db \
    && chown -R node:node logs common/maxmind-db

EXPOSE 18966

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:18966/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

# Start application
CMD ["npm", "start"]
