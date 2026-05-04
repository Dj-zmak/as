const { spawn } = require('child_process');
const express = require('express');
const app = express();

let proxyUrl = "লিঙ্ক তৈরি হচ্ছে, দয়া করে অপেক্ষা করুন...";

// Cloudflare Tunnel চালু করা (Port 22 এর জন্য)
const tunnel = spawn('cloudflared', ['tunnel', '--url', 'tcp://localhost:22']);

tunnel.stderr.on('data', (data) => {
    const output = data.toString();
    const match = output.match(/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
        proxyUrl = match[0];
        console.log("Your Proxy URL: " + proxyUrl);
    }
});

// Web Interface (Cool UI)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ARAFAT PROXY V2</title>
            <style>
                body { background: #0b0e14; color: #39ff14; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { border: 2px solid #39ff14; padding: 25px; border-radius: 15px; background: rgba(0,0,0,0.8); box-shadow: 0 0 20px #39ff1488; text-align: center; max-width: 90%; }
                .status { font-size: 12px; margin-bottom: 10px; color: #fff; }
                .url-box { background: #161b22; padding: 15px; border: 1px dashed #39ff14; border-radius: 8px; font-weight: bold; word-break: break-all; margin: 15px 0; font-size: 14px; }
                .guide { font-size: 11px; color: #8b949e; text-align: left; }
                .neon { text-shadow: 0 0 10px #39ff14; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status">● SERVER 24/7 ONLINE (PM2)</div>
                <h1 class="neon">VPS PROXY ACTIVE</h1>
                <div class="url-box">${proxyUrl}</div>
                <div class="guide">
                    <p><strong>Termux কমান্ড:</strong></p>
                    <code>ssh root@${proxyUrl}</code><br><br>
                    <p><strong>Password:</strong> Arafat</p>
                </div>
            </div>
            <script>setTimeout(() => { if("${proxyUrl}".includes("অপেক্ষা")) location.reload(); }, 5000);</script>
        </body>
        </html>
    `);
});

app.listen(8080, () => console.log('UI is running on port 8080'));
