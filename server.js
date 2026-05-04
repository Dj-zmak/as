// ============================================
// server.js - Arafat Pro Terminal Server
// ============================================

const { spawn } = require('child_process');
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('ws');

const app = express();
const server = http.createServer(app);

// Configuration
const CONFIG = {
    PORT: process.env.PORT || 8080,
    TTYD_PORT: process.env.TTYD_PORT || 7681,
    USERNAME: process.env.TTYD_USER || 'root',
    PASSWORD: process.env.TTYD_PASS || 'Arafat',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

// Security: Basic middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Static files (CSS, JS assets)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve custom UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint (required for Railway/Docker)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Proxy WebSocket upgrade to ttyd
const wss = new Server({ server, path: '/ws' });

// Start ttyd process
function startTtyd() {
    const ttydArgs = [
        '-p', CONFIG.TTYD_PORT.toString(),
        '-c', `${CONFIG.USERNAME}:${CONFIG.PASSWORD}`,
        '-O', // Check origin
        '-W', // Writable
        '-t', 'titleFixed=Arafat Pro Terminal',
        '-t', 'fontSize=16',
        '-t', 'fontFamily=Courier New',
        '-t', 'theme={"background":"#0a0a0a","foreground":"#00ff88"}',
        'bash'
    ];

    // Add SSL if certificates exist
    if (process.env.SSL_CERT && process.env.SSL_KEY) {
        ttydArgs.push('-S', '-C', process.env.SSL_CERT, '-K', process.env.SSL_KEY);
    }

    console.log(`[TTYD] Starting on port ${CONFIG.TTYD_PORT}...`);
    
    const ttyd = spawn('ttyd', ttydArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, TERM: 'xterm-256color' }
    });

    ttyd.stdout.on('data', (data) => {
        console.log(`[TTYD] ${data.toString().trim()}`);
    });

    ttyd.stderr.on('data', (data) => {
        console.error(`[TTYD-ERR] ${data.toString().trim()}`);
    });

    ttyd.on('close', (code) => {
        console.warn(`[TTYD] Process exited with code ${code}. Restarting in 3s...`);
        setTimeout(startTtyd, 3000);
    });

    ttyd.on('error', (err) => {
        console.error(`[TTYD] Failed to start: ${err.message}`);
        process.exit(1);
    });

    return ttyd;
}

// Graceful shutdown
function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start services
const ttydProcess = startTtyd();

server.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║     ⚡ ARAFAT PRO TERMINAL SERVER       ║
    ╠══════════════════════════════════════════╣
    ║  UI Server:  http://0.0.0.0:${CONFIG.PORT}      ║
    ║  TTYD Port:  ${CONFIG.TTYD_PORT}                    ║
    ║  Mode:       ${CONFIG.NODE_ENV}               ║
    ╚══════════════════════════════════════════╝
    `);
});

// Export for testing
module.exports = { app, CONFIG };
