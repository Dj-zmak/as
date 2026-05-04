FROM ubuntu:22.04

# প্রয়োজনীয় প্যাকেজ ইনস্টল
RUN apt-get update && apt-get install -y \
    curl \
    make \
    g++ \
    python3 \
    neofetch \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# প্যাকেজ ইনস্টল
COPY package.json ./
RUN npm install

# সব ফাইল কপি
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
