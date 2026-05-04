const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // সরাসরি bash ওপেন হবে root হিসেবে
    const ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: '/app',
        env: process.env
    });

    socket.on('input', (data) => {
        ptyProcess.write(data);
    });

    // টার্মিনাল উইন্ডো রিসাইজ হ্যান্ডলার (যাতে টেক্সট না কাটে)
    socket.on('resize', (size) => {
        ptyProcess.resize(size.cols, size.rows);
    });

    ptyProcess.onData((data) => {
        socket.emit('output', data);
    });

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`VPS Terminal running on port ${PORT}`);
});
