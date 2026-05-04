FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 python3-pip nano curl git sudo build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

RUN npm install pm2 -g

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
