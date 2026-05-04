FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install System Tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    nano \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install PM2
RUN npm install pm2 -g

WORKDIR /app

# Copy project files
COPY package.json .
RUN npm install

COPY . .

# Railway Port
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
