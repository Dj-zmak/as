const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pty = require('node-pty');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

// index.html ফাইল লোড করার মেইন লজিক
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User Connected to Terminal');

    // সরাসরি রুট শেল ওপেন হবে
    const ptyProcess = pty.spawn('bash', [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    });

    // ইনপুট হ্যান্ডলিং
    socket.on('input', (data) => {
        ptyProcess.write(data);
    });

    // ফোনের স্ক্রিন অনুযায়ী রিসাইজ ফিক্স
    socket.on('resize', (size) => {
        if (size && size.cols && size.rows) {
            ptyProcess.resize(size.cols, size.rows);
        }
    });

    // আউটপুট পাঠানো
    ptyProcess.onData((data) => {
        socket.emit('output', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
        ptyProcess.kill();
    });
});

// ০.০.০.০ বাইন্ডিং যাতে Railway-তে পোর্ট সমস্যা না হয়
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is live at http://0.0.0.0:${PORT}`);
});
