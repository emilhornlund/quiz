#!/bin/sh

set -xe : "${QUIZ_SERVICE_PROXY?missing quiz service proxy}"
envsubst '${QUIZ_SERVICE_PROXY}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
