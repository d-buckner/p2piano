FROM node:24-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

ADD public ./public
ADD index.html .
ADD about.html .
ADD donate.html .
ADD vite.config.ts .
ADD eslint.config.js .
ADD src ./src

RUN npm run build

FROM caddy:2.10.0-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build-stage /app/dist /www
