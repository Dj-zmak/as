const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Start ttyd in background
exec('ttyd -p 7681 -W -c terminal:terminal bash', (err, stdout, stderr) => {
    if (err) {
        console.error('ttyd start error:', err);
        return;
    }
    console.log('[TTYD] Started on port 7681');
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        server: 'Ubuntu 22.04',
        terminal: 'ttyd',
        time: new Date().toISOString()
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  ⚡ Arafat Pro Terminal');
    console.log('  🐧 Ubuntu 22.04');
    console.log(`  🌐 Web Server: http://0.0.0.0:${PORT}`);
    console.log(`  💻 Terminal:   ws://0.0.0.0:7681`);
    console.log('========================================');
});
