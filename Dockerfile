FROM ubuntu:22.04

# এনভায়রনমেন্ট সেটআপ
ENV DEBIAN_FRONTEND=noninteractive

# প্রয়োজনীয় টুলস ইনস্টল (Node.js, Python, Build Tools)
RUN apt-get update && apt-get install -y \
    curl nodejs npm python3 build-essential neofetch git sudo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# প্যাকেজ ইনস্টল
COPY package.json ./
RUN npm install

# প্রজেক্ট ফাইল কপি
COPY . .

EXPOSE 8080

# ব্যাকগ্রাউন্ড প্রসেস ম্যানেজমেন্ট
CMD ["node", "server.js"]
