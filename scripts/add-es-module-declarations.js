import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiDir = join(__dirname, '..', 'api');
const apiFiles = readdirSync(apiDir).filter((file) => file.endsWith('.ts'));

console.log('Adding ES module declarations to API files...');

apiFiles.forEach((file) => {
  const filePath = join(apiDir, file);
  const content = readFileSync(filePath, 'utf8');

  // Add ES module declaration if not already present
  if (!content.includes('// @ts-check')) {
    const newContent = '// @ts-check\n' + content;
    writeFileSync(filePath, newContent);
    console.log(`Added ES module declaration to ${file}`);
  } else {
    console.log(`${file} already has ES module declaration`);
  }
});

console.log('ES module declarations added!');
