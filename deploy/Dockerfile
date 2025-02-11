FROM docker.io/library/node:22.13.1-alpine3.21 AS node
FROM docker.io/library/nginx:1.26.3-alpine3.20 AS nginx

FROM node AS deps
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci

FROM node AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx AS runner
COPY --from=builder /workspace/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
CMD /docker-entrypoint.d/20-envsubst-on-templates.sh && \
    nginx -g 'daemon off;'
EXPOSE 3000