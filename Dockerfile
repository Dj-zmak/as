// ============================================
// server.js - FIXED (no assets folder needed)
// ============================================

const { spawn } = require('child_process');
const express = require('express');
const path = require('path');
const app = express();

const CONFIG = {
    PORT: process.env.PORT || 8080,
    TTYD_PORT: process.env.TTYD_PORT || 7681,
    USERNAME: process.env.TTYD_USER || 'root',
    PASSWORD: process.env.TTYD_PASS || 'Arafat'
};

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// Main route - serve the terminal UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check (Railway requires this)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: Date.now() });
});

// Start ttyd in background
function startTtyd() {
    const args = [
        '-p', CONFIG.TTYD_PORT.toString(),
        '-c', `${CONFIG.USERNAME}:${CONFIG.PASSWORD}`,
        '-W',
        '-t', 'titleFixed=Arafat Pro',
        '-t', 'fontSize=16',
        'bash'
    ];

    console.log(`[TTYD] Starting on port ${CONFIG.TTYD_PORT}...`);
    
    const ttyd = spawn('ttyd', args, {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    ttyd.stdout.on('data', d => console.log(`[TTYD] ${d.toString().trim()}`));
    ttyd.stderr.on('data', d => console.error(`[TTYD-ERR] ${d.toString().trim()}`));
    
    ttyd.on('close', code => {
        console.warn(`[TTYD] exited ${code}, restarting...`);
        setTimeout(startTtyd, 3000);
    });

    return ttyd;
}

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// Start everything
startTtyd();

app.listen(CONFIG.PORT, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   ⚡ ARAFAT PRO TERMINAL ACTIVE      ║
    ║   Port: ${CONFIG.PORT}                        ║
    ║   http://0.0.0.0:${CONFIG.PORT}             ║
    ╚══════════════════════════════════════╝
    `);
});
