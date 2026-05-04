FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# প্রয়োজনীয় সব টুলস
RUN apt-get update && apt-get install -y \
    python3 python3-pip nano curl git sudo build-essential \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 ইনস্টল
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# PM2 ইনস্টল
RUN npm install pm2 -g

WORKDIR /app

# ফাইল কপি ও ডিপেন্ডেন্সি ইনস্টল
COPY package.json .
RUN npm install

COPY . .

# সরাসরি Root হিসেবে কাজ করার পারমিশন
RUN chmod -R 777 /app

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
