FROM ubuntu:latest
LABEL authors="sam"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node","server.js"]