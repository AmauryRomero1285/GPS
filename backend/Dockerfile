FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
