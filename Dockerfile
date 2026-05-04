FROM ubuntu:22.04

# এনভায়রনমেন্ট সেটআপ
ENV DEBIAN_FRONTEND=noninteractive
ENV PASSWORD=Arafat

# প্রয়োজনীয় প্যাকেজ ও ttyd (Web Terminal) এর জন্য ডিপেন্ডেন্সি ইনস্টল
RUN apt-get update && apt-get install -y \
    openssh-server \
    curl \
    git \
    wget \
    sudo \
    neofetch \
    build-essential \
    cmake \
    libjson-c-dev \
    libwebsockets-dev \
    vim

# ttyd (Web Terminal) ইনস্টল করা
RUN git clone https://github.com/tsl0922/ttyd.git /tmp/ttyd && \
    cd /tmp/ttyd && mkdir build && cd build && \
    cmake .. && make && make install

# SSH এবং ইউজার কনফিগারেশন (User: root, Pass: Arafat)
RUN mkdir /var/run/sshd && \
    echo "root:$PASSWORD" | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# Railway এর জন্য ৮০৮০ পোর্ট এক্সপোজ করা
EXPOSE 8080

# সার্ভার স্টার্ট স্ক্রিপ্ট
# ttyd -c user:pass (এখানে ওয়েব টার্মিনালে ঢোকার সময়ও ইউজার: root এবং পাস: Arafat চাইবে)
CMD service ssh start && ttyd -p 8080 -c root:Arafat bash
