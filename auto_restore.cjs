const fs = require('fs');
const path = require('path');

const workspace = process.cwd();
const recoverSrc = path.join(workspace, 'RECOVERED_FILES', 'src');
const actualSrc = path.join(workspace, 'src');

function restoreDirectory(revDir, actDir) {
    if (!fs.existsSync(revDir)) return;
    const items = fs.readdirSync(revDir);
    for (const item of items) {
        const revPath = path.join(revDir, item);
        if (fs.statSync(revPath).isDirectory()) {
            restoreDirectory(revPath, path.join(actDir, item));
        } else if (item.endsWith('.recover-0.txt')) {
            const originalName = item.replace('.recover-0.txt', '');
            if (originalName.endsWith('.tsx') || originalName.endsWith('.ts')) {
                const targetPath = path.join(actDir, originalName);
                fs.copyFileSync(revPath, targetPath);
                console.log('Restored: src\\' + path.relative(actualSrc, targetPath));
            }
        }
    }
}

console.log('Starting automatic restore of your recent changes...');
restoreDirectory(recoverSrc, actualSrc);
console.log('All matched changes have been successfully restored!');

