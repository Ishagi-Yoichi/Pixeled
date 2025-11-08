import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const targets = [
    { url: 'https://unpkg.com/@ffmpeg/ffmpeg/dist/ffmpeg-core.worker.js', filename: 'ffmpeg-core.worker.js' },
    { url: 'https://unpkg.com/@ffmpeg/ffmpeg/dist/ffmpeg-core.js', filename: 'ffmpeg-core.js' },
    { url: 'https://unpkg.com/@ffmpeg/ffmpeg/dist/ffmpeg-core.wasm', filename: 'ffmpeg-core.wasm' }
  ];

// Save files into public/
const outDir = path.join(__dirname, 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

targets.forEach(async ({ url, filename }) => {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to download ${url}: ${res.statusText}`);
    return;
  }
  const arrayBuf = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  fs.writeFileSync(path.join(outDir, filename), buf);
  console.log(`Downloaded ${filename} successfully`);
});
