const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code/User/History');
const targetFile = 'UserGuide.tsx';

try {
    const dirs = fs.readdirSync(historyDir);
    for (const dir of dirs) {
        const dirPath = path.join(historyDir, dir);
        const entriesFile = path.join(dirPath, 'entries.json');
        if (fs.existsSync(entriesFile)) {
            const data = JSON.parse(fs.readFileSync(entriesFile, 'utf8'));
            if (data.resource && data.resource.endsWith(targetFile)) {
                console.log('Found history for: ' + data.resource + ' in dir ' + dir);
                if (data.entries && data.entries.length > 0) {
                    const sorted = data.entries.sort((a, b) => b.timestamp - a.timestamp);
                    const now = Date.now();
                    const recent = sorted.filter(e => (now - e.timestamp) < 1000 * 60 * 60); // Last hour
                    console.log('Recent entries:');
                    recent.forEach(e => console.log('  ' + e.id + ' at ' + new Date(e.timestamp).toISOString()));
                }
            }
        }
    }
} catch(e) {}

