FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

RUN npm ci

FROM deps AS build

WORKDIR /app

COPY client ./client
COPY server ./server
COPY shared ./shared

RUN npm run build
RUN node server/dist/strategy/adapters/ssg.js

FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/data/db.sqlite

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/static ./server/static
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/src/admin/admin.html ./server/src/admin/admin.html

RUN mkdir -p /data /app/server/src/admin && chown -R node:node /data /app

WORKDIR /app/server
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
