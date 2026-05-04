FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# প্রয়োজনীয় প্যাকেজ ইনস্টল
RUN apt-get update && apt-get install -y \
    curl openssh-server python3 nodejs npm neofetch git \
    && npm install -g pm2 \
    && curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared \
    && chmod +x /usr/local/bin/cloudflared \
    && rm -rf /var/lib/apt/lists/*

# SSH কনফিগারেশন (User: root, Pass: Arafat)
RUN mkdir /var/run/sshd && \
    echo 'root:Arafat' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

WORKDIR /app
COPY . .
RUN npm install express

EXPOSE 8080 22

# স্টার্টআপ স্ক্রিপ্ট
CMD service ssh start && node server.js
