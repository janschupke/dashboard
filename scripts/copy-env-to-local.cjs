/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

if (!fs.existsSync(envPath)) {
  console.error('.env file not found.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const lines = envContent.split(/\r?\n/);
const viteLines = [];

for (const line of lines) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  const [key, ...rest] = line.split('=');
  if (!key) continue;
  const value = rest.join('=');
  const viteKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
  viteLines.push(`${viteKey}=${value}`);
}

let existing = '';
if (fs.existsSync(envLocalPath)) {
  existing = fs.readFileSync(envLocalPath, 'utf-8');
}

const header =
  '# This file is auto-generated. Do not modify manually. Run `npm run env` instead.\n';
const newContent = header + viteLines.join('\n') + '\n';
if (existing !== newContent) {
  fs.writeFileSync(envLocalPath, newContent, 'utf-8');
  console.log('.env.local created/updated with VITE_ keys from .env');
} else {
  console.log('.env.local already up to date.');
}
