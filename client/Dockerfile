FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

ADD public ./public
ADD index.html .
ADD vite.config.ts .
ADD eslint.config.js .
ADD src ./src

RUN npm run build

FROM caddy:2.8.4-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /app/dist /www
