FROM node:18-buster

# প্রয়োজনীয় সিস্টেম টুলস ইনস্টল
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    neofetch \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# প্রথমে প্যাকেজ লিস্ট কপি করে ইনস্টল করা
COPY package.json ./
RUN npm install

# বাকি সব ফাইল কপি করা
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
