const { exec, spawn } = require('child_process');
const express = require('express');
const app = express();
const fs = require('fs');

// ১. SSH সার্ভিস স্টার্ট
exec('service ssh start');

// ২. Cloudflare Tunnel স্টার্ট করা (SSH Port 22 এর জন্য)
const tunnel = spawn('cloudflared', ['tunnel', '--url', 'tcp://localhost:22', '--no-autoupdate']);

let tunnelUrl = "Generating URL...";

tunnel.stderr.on('data', (data) => {
    const msg = data.toString();
    const match = msg.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
        tunnelUrl = match[0].replace("https://", ""); // SSH এর জন্য শুধু ডোমেইন লাগে
        console.log("Cloudflare Proxy URL: " + tunnelUrl);
    }
});

// ৩. Web UI (Cool UI Box)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Arafat Proxy Status</title>
            <style>
                body { background: #06090f; color: #00ff88; font-family: 'Segoe UI', sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .box { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; border: 1px solid #00ff88; text-align: center; box-shadow: 0 0 20px #00ff8844; }
                h1 { font-size: 18px; text-transform: uppercase; letter-spacing: 2px; }
                .url-box { background: #000; padding: 15px; border-radius: 8px; margin-top: 20px; font-family: monospace; border: 1px dashed #00ff88; cursor: pointer; }
                .cmd { color: #888; font-size: 12px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>● VPS PROXY ACTIVE</h1>
                <div class="url-box" id="url">${tunnelUrl}</div>
                <p class="cmd">Termux: ssh root@${tunnelUrl} -p 22</p>
                <p style="font-size: 10px; color: #444;">Pass: Arafat | Status: 24/7 PM2 Online</p>
            </div>
            <script>setTimeout(() => location.reload(), 10000);</script>
        </body>
        </html>
    `);
});

app.listen(8080, () => console.log('Web UI running on port 8080'));
