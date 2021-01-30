FROM node:lts-alpine
RUN apk add --update git

ENV USER=p2pMiner
ENV UID=12345
ENV GID=23456

RUN adduser \
    --disabled-password \
    "$USER"

USER p2pMiner
RUN mkdir -p /home/p2pMiner/api
WORKDIR /home/p2pMiner/api
COPY --chown=p2pMiner package*.json ./
COPY --chown=p2pMiner scripts scripts
COPY --chown=p2pMiner .env.example .
RUN ls -la
RUN npm install -y
COPY --chown=p2pMiner . .

ENV NODE_ENV production
CMD npm run start
