# Build Stage
FROM node:22-slim AS build

WORKDIR /app

RUN corepack enable

COPY ../../ ./

RUN yarn install --immutable

RUN yarn workspace @quiz/common build
RUN yarn workspace @quiz/quiz-service build

# Optimize Stage
FROM node:22-slim AS optimize

WORKDIR /app

# Copy only necessary files
COPY --from=build /app/package.json /app/yarn.lock ./

# Copy node_modules directly, bypassing workspace issues
COPY --from=build /app/node_modules ./node_modules

# Replace symlink with the actual files for @quiz/common
RUN rm -rf ./node_modules/@quiz/common
COPY --from=build /app/packages/common ./node_modules/@quiz/common

# Copy quiz-service files
COPY --from=build /app/packages/quiz-service/package.json ./packages/quiz-service/package.json
COPY --from=build /app/packages/quiz-service/.env.production ./packages/quiz-service/.env.production
COPY --from=build /app/packages/quiz-service/dist ./packages/quiz-service/dist

# Production Stage
FROM node:22-slim

WORKDIR /app

COPY --from=optimize /app/packages/quiz-service/ ./
COPY --from=optimize /app/node_modules ./node_modules

CMD ["yarn", "serve"]

EXPOSE 8080
