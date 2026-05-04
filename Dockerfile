FROM ubuntu:22.04

# এনভায়রনমেন্ট সেটআপ
ENV DEBIAN_FRONTEND=noninteractive

# প্রয়োজনীয় টুলস ইনস্টল (Node.js, Python, Build Tools, Neofetch)
RUN apt-get update && apt-get install -y \
    openssh-server curl git wget sudo neofetch \
    build-essential cmake libjson-c-dev libwebsockets-dev \
    vim python3 nodejs npm && \
    rm -rf /var/lib/apt/lists/*

# ttyd (Web Terminal) সোর্স থেকে বিল্ড ও ইনস্টল
RUN git clone --depth=1 https://github.com/tsl0922/ttyd.git /tmp/ttyd && \
    cd /tmp/ttyd && mkdir build && cd build && \
    cmake .. && make && make install

# ভিপিএস পাসওয়ার্ড কনফিগার (User: root, Pass: Arafat)
RUN mkdir /var/run/sshd && \
    echo 'root:Arafat' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

WORKDIR /app
COPY index.html /app/index.html

EXPOSE 8080

# --index ফ্ল্যাগ দিয়ে আপনার কাস্টম UI কে মেইন পেজ হিসেবে রান করা
CMD service ssh start && ttyd -p 8080 -c root:Arafat --index /app/index.html bash
