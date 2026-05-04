FROM ubuntu:22.04
RUN apt-get update && apt-get install -y curl nodejs npm neofetch python3 build-essential
WORKDIR /app
COPY . .
RUN npm install express socket.io node-pty
EXPOSE 8080
CMD ["node", "server.js"]
