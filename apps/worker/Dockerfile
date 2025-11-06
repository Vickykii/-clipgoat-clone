FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm --filter web prisma generate
RUN pnpm --filter worker build

CMD ["pnpm", "--filter", "worker", "start"]
