# ============================================
# Dockerfile - Arafat Pro Terminal (FIXED)
# ============================================

FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Build dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake git libjson-c-dev libwebsockets-dev \
    ca-certificates pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Build ttyd from source
RUN git clone --depth=1 https://github.com/tsl0922/ttyd.git /tmp/ttyd \
    && cd /tmp/ttyd \
    && mkdir build && cd build \
    && cmake .. \
    && make -j$(nproc) \
    && make install

# ============================================
# Production Stage
# ============================================
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    TERM=xterm-256color \
    PORT=8080

# Install runtime packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server curl wget git vim nano htop neofetch \
    tree unzip zip python3 python3-pip nodejs npm \
    libjson-c5 libwebsockets16 locales sudo \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy ttyd binary
COPY --from=builder /usr/local/bin/ttyd /usr/local/bin/ttyd

WORKDIR /app

# Copy ONLY the files that exist in your project
COPY package*.json ./
COPY server.js ./
COPY index.html ./

# Install Node dependencies
RUN npm install --production && npm cache clean --force

# SSH setup
RUN mkdir -p /var/run/sshd \
    && echo 'root:Arafat' | chpasswd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

EXPOSE 8080 22

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start script inline (no external file needed)
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting Arafat Pro Terminal..."\n\
service ssh start\n\
echo "✅ SSH started on port 22"\n\
exec node server.js\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
