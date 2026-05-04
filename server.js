const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

io.on('connection', (socket) => {
    // Termux-এর মতো রিয়েল ইমুলেশন
    const shell = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    shell.onData((data) => socket.emit('output', data));
    socket.on('input', (data) => shell.write(data));

    // মোবাইলে কিবোর্ড ওপেন হলে অটো-রিসাইজ হ্যান্ডলার
    socket.on('resize', (size) => {
        if (shell.writable) {
            shell.resize(size.cols, size.rows);
        }
    });

    socket.on('disconnect', () => shell.kill());
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Professional Terminal Active on Port ${PORT}`);
});
