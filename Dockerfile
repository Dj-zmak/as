# ============================================
# Dockerfile - Arafat Pro Terminal
# Multi-stage build for production optimization
# ============================================

# Stage 1: Builder (compile ttyd from source)
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    libjson-c-dev \
    libwebsockets-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Build ttyd from source (latest stable)
RUN git clone --depth=1 --branch=1.7.3 https://github.com/tsl0922/ttyd.git /tmp/ttyd \
    && cd /tmp/ttyd \
    && mkdir build && cd build \
    && cmake .. \
    && make -j$(nproc) \
    && make install

# Stage 2: Production runtime
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    TERM=xterm-256color \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    # System tools
    openssh-server \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    neofetch \
    tree \
    unzip \
    zip \
    # Development tools
    python3 \
    python3-pip \
    nodejs \
    npm \
    build-essential \
    # Libraries
    libjson-c5 \
    libwebsockets16 \
    locales \
    # Security
    sudo \
    fail2ban \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy ttyd binary from builder
COPY --from=builder /usr/local/bin/ttyd /usr/local/bin/ttyd

# Create app directory
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY server.js ./
COPY index.html ./
COPY assets/ ./assets/

# Create non-root user for security (optional, comment out if you need root)
# RUN useradd -m -s /bin/bash -G sudo arafat \
#     && echo 'arafat:Arafat' | chpasswd \
#     && echo 'arafat ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# SSH Configuration
RUN mkdir -p /var/run/sshd \
    && echo 'root:Arafat' | chpasswd \
    && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && echo "AllowUsers root" >> /etc/ssh/sshd_config

# Security: Restrict permissions
RUN chmod 644 /app/index.html \
    && chmod 755 /app/server.js

# Expose ports
# 8080: Main web UI (Railway/Heroku compatible)
# 22: SSH access
EXPOSE 8080 22

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start script
COPY <<'EOF' /app/start.sh
#!/bin/bash
set -e

echo "🚀 Starting Arafat Pro Terminal..."

# Start SSH service
service ssh start
echo "✅ SSH service started on port 22"

# Start the Node.js server (which manages ttyd)
exec node server.js
EOF

RUN chmod +x /app/start.sh

# Use non-root user if created above
# USER arafat

CMD ["/app/start.sh"]
