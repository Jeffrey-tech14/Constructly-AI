const fs = require('fs');
const path = require('path');

const historyDir = path.join(process.env.APPDATA, 'Code/User/History');
const workspaceName = 'Constructly-AI-main'.toLowerCase();
const targetDir = path.join(process.cwd(), 'RECOVERED_FILES');

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

try {
    const dirs = fs.readdirSync(historyDir);
    for (const dir of dirs) {
        const dirPath = path.join(historyDir, dir);
        const entriesFile = path.join(dirPath, 'entries.json');
        if (fs.existsSync(entriesFile)) {
            let data;
            try { data = JSON.parse(fs.readFileSync(entriesFile, 'utf8')); } catch(e) { continue; }
            
            if (data.resource && data.resource.toLowerCase().includes(workspaceName)) {
                // Extract relative path after Constructly-AI-main
                const idx = data.resource.toLowerCase().indexOf(workspaceName);
                let relativePath = data.resource.substring(idx + workspaceName.length + 1);
                relativePath = decodeURI(relativePath);
                
                if (data.entries && data.entries.length > 0) {
                    const sorted = data.entries.sort((a, b) => b.timestamp - a.timestamp);
                    const now = Date.now();
                    const recent = sorted.filter(e => (now - e.timestamp) < 1000 * 60 * 60 * 4); // last 4 hours
                    
                    if (recent.length > 0) {
                        console.log('Recovering ' + relativePath);
                        try {
                            const destSubFolder = path.join(targetDir, path.dirname(relativePath));
                            fs.mkdirSync(destSubFolder, { recursive: true });
                            let count = 0;
                            for (let e of recent.slice(0, 5)) {
                                const backupPath = path.join(dirPath, e.id);
                                if (fs.existsSync(backupPath)) {
                                    fs.copyFileSync(backupPath, path.join(destSubFolder, path.basename(relativePath) + '.recover-' + count + '.txt'));
                                    count++;
                                }
                            }
                        } catch(err) { console.error('Error copying ' + relativePath, err); }
                    }
                }
            }
        }
    }
    console.log('\n--- Recovery Complete ---');
    console.log('Check the RECOVERED_FILES directory in your workspace root!');
} catch(e) {
    console.error(e);
}

