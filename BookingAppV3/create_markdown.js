const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src', 'app');
const outDir = path.resolve(__dirname, 'public');
const outFile = path.join(outDir, 'codebase.md');

// Ensure output directory exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function isBinary(filePath) {
  const binaryExt = ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip'];
  return binaryExt.includes(path.extname(filePath).toLowerCase());
}

function escapeBackticks(str) {
  // Escape triple backticks in content to avoid breaking markdown code fences
  return str.replace(/```/g, '\\\`\\\\`\\\\`');
}

function processFile(filePath) {
  const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const escaped = escapeBackticks(content);
  return `## ${relPath}\n\n\`
\`\`\`\n${escaped}\n\`
\`\`\`\n`;
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (!isBinary(filePath)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
let markdown = `# Project Codebase (src/app)\n\nGenerated on ${new Date().toISOString()}\n\n`;
files.forEach((file) => {
  markdown += processFile(file) + '\n';
});

fs.writeFileSync(outFile, markdown, 'utf8');
console.log('Markdown file generated at', outFile);
