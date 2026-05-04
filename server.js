const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route - serve your HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket terminal handling
wss.on('connection', (ws) => {
    console.log('New terminal connection');
    
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME || '/',
        env: process.env
    });

    ptyProcess.on('data', (data) => {
        try {
            ws.send(data);
        } catch (e) {
            console.error('Send error:', e);
        }
    });

    ws.on('message', (msg) => {
        try {
            ptyProcess.write(msg);
        } catch (e) {
            console.error('Write error:', e);
        }
    });

    ws.on('close', () => {
        ptyProcess.kill();
        console.log('Terminal connection closed');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Arafat Pro Terminal running on port ${PORT}`);
});
