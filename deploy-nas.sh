#!/usr/bin/env sh

TAG=$(git rev-parse --short HEAD)

REGISTRY="192.168.0.65:9500"

QUIZ_SERVICE_PACKAGE="quiz-service"
QUIZ_SERVICE_REPOSITORY="emilhornlund/$QUIZ_SERVICE_PACKAGE"

QUIZ_PACKAGE="quiz"
QUIZ_REPOSITORY="emilhornlund/$QUIZ_PACKAGE"

echo "Building Docker image: $QUIZ_SERVICE_REPOSITORY:$TAG"
docker build -t $QUIZ_SERVICE_REPOSITORY:$TAG -f ./packages/$QUIZ_SERVICE_PACKAGE/Dockerfile . || exit 1

echo "Building Docker image: $QUIZ_REPOSITORY:$TAG"
docker build -t $QUIZ_REPOSITORY:$TAG -f ./packages/$QUIZ_PACKAGE/Dockerfile . || exit 1

docker image tag $QUIZ_SERVICE_REPOSITORY:$TAG $REGISTRY/$QUIZ_SERVICE_REPOSITORY:$TAG
docker image tag $QUIZ_REPOSITORY:$TAG $REGISTRY/$QUIZ_REPOSITORY:$TAG

docker image push $REGISTRY/$QUIZ_SERVICE_REPOSITORY:$TAG
docker image push $REGISTRY/$QUIZ_REPOSITORY:$TAG
