# Build Stage
FROM node:22 AS build

WORKDIR /app

RUN corepack enable

COPY ../../ ./

RUN yarn install --immutable

RUN yarn workspace @quiz/common build
RUN yarn workspace @quiz/quiz build --mode production

# Production Stage
FROM nginx:alpine

WORKDIR /app

COPY --from=build /app/packages/quiz/dist /usr/share/nginx/html
COPY --from=build /app/packages/quiz/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --from=build /app/packages/quiz/configure-environment.sh /docker-entrypoint.d/configure-environment.sh

RUN chmod +x /docker-entrypoint.d/configure-environment.sh

CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
