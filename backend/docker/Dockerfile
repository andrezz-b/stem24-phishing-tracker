# syntax=docker/dockerfile:experimental
FROM golang:alpine3.18 AS builder

LABEL maintainer="Asseco SEE HR"

RUN apk update && apk upgrade && apk add --no-cache --update \
    openssh-client \
    bash \
    git \
    ca-certificates

WORKDIR /app

COPY . .

ENV GOPRIVATE=git.asseco-see.hr/asseco-hr-voice/evil/go-chassis/v2

RUN mkdir -p -m 0600 /root/.ssh && echo "StrictHostKeyChecking no" >> /root/.ssh/config
RUN --mount=type=ssh GO111MODULE=on go mod download -x \
    && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o agent-management cmd/agent-management/main.go

RUN --mount=type=ssh GO111MODULE=on CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o tools cmd/tools/main.go

FROM alpine:3.18

ENV APP_PATH=/app

# Add default user
RUN adduser -u 1001 -S -G root -h /tmp -s /sbin/nologin \
        -D -H -g "Default Application User" default

RUN apk update && apk upgrade --update-cache --purge && \
    apk add --no-cache bash ca-certificates dumb-init gettext tzdata && \
    rm -rf /var/cache/apk/* && \
    # update certificates
    update-ca-certificates && \
    # create app folder
    mkdir -p -m 755 ${APP_PATH} && chown -R 1001:0 ${APP_PATH}

WORKDIR ${APP_PATH}

COPY --chown=1001:0 --from=builder /app/agent-management .
COPY --chown=1001:0 --from=builder /app/tools .

COPY ./docker/wait-for.sh /
COPY ./docker/wait-for-url.sh /

EXPOSE 8080
EXPOSE 6061

# In order to drop the root user, we have to make some directories world
# writable as OpenShift default security model is to run the container under
# random UID.
RUN chown -R 1001:0 ${APP_PATH}

ENTRYPOINT ["./agent-management"]

# Run container by default as user with id 1001 (default)
USER 1001
