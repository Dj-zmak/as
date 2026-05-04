FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# প্রয়োজনীয় প্যাকেজ ইনস্টল
RUN apt-get update && apt-get install -y \
    openssh-server curl git wget sudo neofetch \
    build-essential cmake libjson-c-dev libwebsockets-dev \
    vim python3 nodejs npm

# ttyd ইনস্টল
RUN git clone --depth=1 https://github.com/tsl0922/ttyd.git /tmp/ttyd && \
    cd /tmp/ttyd && mkdir build && cd build && \
    cmake .. && make && make install

# SSH এবং ইউজার (Pass: Arafat)
RUN mkdir /var/run/sshd && echo 'root:Arafat' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# HTML ফাইল সেটআপ (আমরা আমাদের কাস্টম ফাইলটি /app এ রাখবো)
WORKDIR /app
COPY index.html /app/index.html

EXPOSE 8080

# ttyd এবং SSH স্টার্ট করার কমান্ড
# আপনার কাস্টম HTML ইনজেক্ট করার জন্য ttyd এর -i অপশন ব্যবহার করা হয়েছে
CMD service ssh start && ttyd -p 8080 -c root:Arafat bash
