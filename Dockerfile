FROM node:18-slim

# Install dependencies for node-pty
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create directories for terminal
RUN mkdir -p /home/terminal
ENV HOME=/home/terminal

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
