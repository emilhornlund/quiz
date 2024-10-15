# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

COPY ../../ ./

RUN yarn install --ignore-scripts --frozen-lockfile --modules-folder ./node_modules

RUN yarn workspace @quiz/common build
RUN yarn workspace @quiz/quiz-service build

# Optimize Stage
FROM node:22-alpine AS optimize

WORKDIR /app

COPY --from=build /app/package.json /app/yarn.lock ./

COPY --from=build /app/packages/common/package.json ./packages/common/package.json
COPY --from=build /app/packages/common/dist ./packages/common/dist

COPY --from=build /app/packages/quiz-service/package.json ./packages/quiz-service/package.json
COPY --from=build /app/packages/quiz-service/.env.production ./packages/quiz-service/.env.production
COPY --from=build /app/packages/quiz-service/dist ./packages/quiz-service/dist

RUN yarn install --production --ignore-scripts --frozen-lockfile --modules-folder ./node_modules

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=optimize /app/packages/quiz-service/ ./
COPY --from=optimize /app/node_modules ./node_modules

CMD ["yarn", "serve"]

EXPOSE 8080
