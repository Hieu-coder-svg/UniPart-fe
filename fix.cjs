const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

let count = 0;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            if (content.includes('import.meta.env.VITE_API_URL as string')) {
                content = content.replace(/import\.meta\.env\.VITE_API_URL as string/g, "(import.meta.env.VITE_API_URL as string || '/api')");
                modified = true;
            } else if (content.includes('import.meta.env.VITE_API_URL')) {
                content = content.replace(/import\.meta\.env\.VITE_API_URL/g, "(import.meta.env.VITE_API_URL || '/api')");
                modified = true;
            }

            // Cleanup redundant fallbacks if script runs multiple times
            if (modified) {
                content = content.replace(/\(\(import\.meta\.env\.VITE_API_URL(?: as string)? \|\| '\/api'\)(?: as string)? \|\| '\/api'\)/g, "(import.meta.env.VITE_API_URL as string || '/api')");
                fs.writeFileSync(fullPath, content, 'utf8');
                count++;
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir(srcDir);
console.log(`Replaced in ${count} files`);
