const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    // সরাসরি Root (/) থেকে শুরু হবে
    const ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: '/', 
        env: process.env
    });

    socket.on('input', (data) => ptyProcess.write(data));
    
    socket.on('resize', (size) => {
        if (size) ptyProcess.resize(size.cols, size.rows);
    });

    ptyProcess.onData((data) => socket.emit('output', data));

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Terminal on port ${PORT}`);
});
