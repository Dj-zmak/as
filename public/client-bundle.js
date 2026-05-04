// Arafat Pro Terminal Client
(function() {
    let term;
    let socket;
    let currentTerminal;

    function initTerminal() {
        // Create xterm.js terminal
        const terminalContainer = document.getElementById('terminal');
        
        // Remove gesture area if it exists
        const gestureArea = document.getElementById('gestureArea');
        if (gestureArea) gestureArea.remove();

        // Create terminal div
        const termDiv = document.createElement('div');
        termDiv.id = 'xterm-container';
        termDiv.style.cssText = `
            width: 100%;
            height: 100%;
            padding: 5px;
        `;
        terminalContainer.appendChild(termDiv);

        // Initialize xterm
        term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'bar',
            fontSize: 14,
            fontFamily: "'Courier New', 'DejaVu Sans Mono', monospace",
            theme: {
                background: '#0a0a0a',
                foreground: '#00ff88',
                cursor: '#00ff88',
                selection: 'rgba(0, 255, 136, 0.3)',
                black: '#000000',
                red: '#cc0000',
                green: '#00cc00',
                yellow: '#cccc00',
                blue: '#0000cc',
                magenta: '#cc00cc',
                cyan: '#00cccc',
                white: '#cccccc',
                brightBlack: '#555555',
                brightRed: '#ff0000',
                brightGreen: '#00ff00',
                brightYellow: '#ffff00',
                brightBlue: '#0000ff',
                brightMagenta: '#ff00ff',
                brightCyan: '#00ffff',
                brightWhite: '#ffffff'
            },
            allowProposedApi: true
        });

        // Open terminal
        term.open(termDiv);

        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('Connected to terminal server');
            // Initialize addon
            if (typeof FitAddon !== 'undefined') {
                const fitAddon = new FitAddon.FitAddon();
                term.loadAddon(fitAddon);
                fitAddon.fit();
                
                window.addEventListener('resize', () => {
                    fitAddon.fit();
                });
            }
        };

        socket.onmessage = (event) => {
            if (term) {
                term.write(event.data);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            if (term) {
                term.write('\r\n\x1b[31mConnection error. Please refresh.\x1b[0m\r\n');
            }
        };

        socket.onclose = () => {
            if (term) {
                term.write('\r\n\x1b[31mConnection closed. Refresh to reconnect.\x1b[0m\r\n');
            }
        };

        // Terminal input
        term.onData((data) => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(data);
            }
        });

        // Make terminal globally accessible
        window.term = term;
        currentTerminal = term;

        // Re-add gesture area for mobile
        const newGestureArea = document.createElement('div');
        newGestureArea.className = 'gesture-area';
        newGestureArea.id = 'gestureArea';
        newGestureArea.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 50;
            touch-action: pan-y;
        `;
        terminalContainer.appendChild(newGestureArea);
        
        // Re-initialize gestures
        if (typeof initGestures === 'function') {
            initGestures();
        }
    }

    // Wait for DOM and xterm.js to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTerminal);
    } else {
        initTerminal();
    }
})();
