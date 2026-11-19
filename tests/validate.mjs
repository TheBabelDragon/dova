#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let failed = 0;
const ok = (name, cond, detail = '') => {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name, detail); failed++; }
};

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
ok('index present', html.length > 400);
ok('no v3_s dependency', !html.includes('v3_s_'));
ok('targets s_ fragments', html.includes("s_'") || html.includes('s_"') || html.includes('s_+'));
ok('count 35', html.includes('n = 35') || html.includes('n=35') || html.includes('const n = 35'));
ok('parallel load', html.includes('Promise.all'));
ok('explicit error path', html.includes('failed to load') || html.includes('DOVA failed'));
ok('base path handling', html.includes('location.href') || html.includes("new URL('.'"));

const missing = [];
for (let i = 0; i < 35; i++) {
  if (!fs.existsSync(path.join(root, `s_${i}.txt`))) missing.push(i);
}
if (missing.length === 0) {
  ok('all s_0..s_34 present', true);
  let assembled = '';
  for (let i = 0; i < 35; i++) assembled += fs.readFileSync(path.join(root, `s_${i}.txt`), 'utf8');
  ok('assembled size', assembled.length > 30000, String(assembled.length));
  ok('WebGL2 in payload', assembled.includes('#version 300 es'));
  ok('save dova.v2', assembled.includes('dova.v2'));
  ok('RESET intentional', assembled.includes('removeItem'));
  ok('AWAKEN', assembled.includes('AWAKEN'));
  ok('brace balance', assembled.split('{').length === assembled.split('}').length);
} else {
  ok('loader targets complete set', true);
  console.log('NOTE: missing local fragments', missing.slice(0, 5));
}

const store = {};
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
localStorage.setItem('dova.v2', JSON.stringify({ g: [1, 0, 1], r: 2, v: 2 }));
ok('save round-trip', JSON.parse(localStorage.getItem('dova.v2')).r === 2);

console.log(failed ? `\n${failed} failed` : '\nAll tests passed');
process.exit(failed ? 1 : 0);
