#!/bin/sh

set -xe : "${QUIZ_SERVICE_PROXY?missing quiz service proxy}"
set -xe : "${QUIZ_SERVICE_IMAGES_PROXY?missing quiz service image proxy}"

envsubst \
  '
    ${QUIZ_SERVICE_PROXY}
    ${QUIZ_SERVICE_IMAGES_PROXY}
  ' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf
