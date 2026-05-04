FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install all packages
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    wget \
    procps \
    nano \
    vim \
    htop \
    neofetch \
    git \
    python3 \
    python3-pip \
    sudo \
    openssh-server \
    net-tools \
    iputils-ping \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install ttyd
RUN wget -qO /usr/local/bin/ttyd https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

WORKDIR /app

# Copy all files
COPY package.json .
COPY server.js .
COPY index.html .

# Install npm dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]
