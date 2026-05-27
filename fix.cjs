const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pattern = /\s*\|\|\s*['"`]http:\/\/localhost:8080(?:\/api)?['"`]/g;

let count = 0;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
                // We add " as string" to maintain TypeScript types
                const newContent = content.replace(pattern, ' as string');
                fs.writeFileSync(fullPath, newContent, 'utf8');
                count++;
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir(srcDir);
console.log(`Replaced in ${count} files`);
