import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const source = path.join(__dirname, '..', 'public', '_headers');
const dest = path.join(__dirname, '..', 'dist', '_headers');

try {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log('✓ _headers file copied to dist/');
  } else {
    console.log('⚠ _headers file not found in public/');
  }
} catch (error) {
  console.error('✗ Error copying _headers file:', error);
}
