FROM node:16

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY server.js ./
ADD build ./build

CMD node server.js
