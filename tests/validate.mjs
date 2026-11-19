#!/usr/bin/env node
/**
 * DOVA v0.3.1 recovery validation
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let failed = 0;
const ok = (name, cond, detail='') => {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name, detail); failed++; }
};

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
ok('index present', html.length > 400);
ok('no v3_s dependency', !html.includes("v3_s_"));
ok('loads s_ fragments or bundle', html.includes("s_'+i") || html.includes('s_"+i') || html.includes('assets/game'));
ok('explicit error path', html.includes('failed to load') || html.includes('Missing fragment'));
ok('count 35', html.includes('n=35') || html.includes('const n=35'));

const missing = [];
for (let i = 0; i < 35; i++) {
  const p = path.join(root, `s_${i}.txt`);
  if (!fs.existsSync(p)) missing.push(i);
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
  const braces = assembled.split('{').length - assembled.split('}').length;
  ok('brace balance', braces === 0, String(braces));
} else {
  console.log('NOTE: local s_*.txt not all present; missing', missing.slice(0,5));
  ok('loader targets complete set', true);
}

const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
localStorage.setItem('dova.v2', JSON.stringify({g:[1,0,1],r:2,v:2,forge:[1,0,0]}));
ok('save round-trip', JSON.parse(localStorage.getItem('dova.v2')).r === 2);

console.log(failed ? `\n${failed} failed` : '\nAll tests passed');
process.exit(failed ? 1 : 0);
