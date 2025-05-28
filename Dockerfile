# syntax=docker/dockerfile:experimental
# BUILD IMAGE
FROM node:22-alpine as build
RUN apk add --no-cache git
WORKDIR /blueprints
COPY . .
RUN --mount=type=cache,target=/blueprints/node_modules corepack enable && yarn && yarn build:blueprints

# DEPLOY IMAGE
FROM alpine
RUN apk add --no-cache curl
COPY --from=build /blueprints/packages/blueprints/dist/bundle*.json /blueprints/
COPY docker-entrypoint.sh /
WORKDIR /blueprints

ENTRYPOINT ["/docker-entrypoint.sh"]