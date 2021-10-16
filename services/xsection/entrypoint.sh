#!/bin/sh
# Copied from the lambda_entrypoint.sh script in Amazon's
# public.ecr.aws/lambda/python:3.9 Docker image

if [ $# -ne 1 ]; then
  echo "entrypoint requires the handler name to be the first argument" 1>&2
  exit 142
fi

RUNTIME_ENTRYPOINT="/usr/local/bin/python -m awslambdaric $1"
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/local/bin/aws-lambda-rie $RUNTIME_ENTRYPOINT
else
  exec $RUNTIME_ENTRYPOINT
fi
