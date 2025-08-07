#!/bin/sh

set -xe : "${QUIZ_SERVICE_PROXY?missing quiz service proxy}"
set -xe : "${QUIZ_SERVICE_IMAGES_PROXY?missing quiz service image proxy}"

set -xe : "${BASE_URL?missing base url}"
set -xe : "${GOOGLE_CLIENT_ID?missing google client id}"
set -xe : "${GOOGLE_REDIRECT_URI?missing google redirect uri}"

envsubst \
  '
    ${QUIZ_SERVICE_PROXY}
    ${QUIZ_SERVICE_IMAGES_PROXY}
  ' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf

find /usr/share/nginx/html/assets -type f -name '*.js' -exec \
  sed -i \
    -e "s|__SUBSTITUTE_BASE_URL__|${BASE_URL}|g" \
    -e "s|__SUBSTITUTE_GOOGLE_CLIENT_ID__|${GOOGLE_CLIENT_ID}|g" \
    -e "s|__SUBSTITUTE_GOOGLE_REDIRECT_URI__|${GOOGLE_REDIRECT_URI}|g" \
    {} +
