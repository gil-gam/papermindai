FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

CMD ["node", "--env-file", ".env", "--experimental-strip-types", "src/index.ts"]