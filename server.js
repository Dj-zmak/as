const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

// Terminal setup
const shell = 'bash';

io.on('connection', (socket) => {
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    socket.on('input', (data) => {
        ptyProcess.write(data);
    });

    ptyProcess.onData((data) => {
        socket.emit('output', data);
    });

    socket.on('disconnect', () => {
        ptyProcess.kill();
    });
});

// Serve frontend (Create an index.html in the same folder)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
