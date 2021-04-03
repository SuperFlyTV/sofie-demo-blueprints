# syntax=docker/dockerfile:experimental
# BUILD IMAGE
FROM node:12-alpine
RUN apk add --no-cache git
WORKDIR /blueprints
COPY . .
RUN --mount=type=cache,target=/blueprints/node_modules yarn && yarn dist

# DEPLOY IMAGE
FROM alpine
RUN apk add --no-cache curl
COPY --from=0 /blueprints/dist/bundle*.json /blueprints/
WORKDIR /blueprints
