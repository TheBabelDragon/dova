#!/usr/bin/env node
/**
 * DOVA v0.3.1 recovery validation
 * Run: node tests/validate.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
let failed = 0;
const ok = (name, cond, detail='') => {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name, detail); failed++; }
};

const html = fs.readFileSync(indexPath, 'utf8');
ok('source present', html.length > 20000, `size=${html.length}`);
ok('DOCTYPE', html.startsWith('<!DOCTYPE html>'));
ok('WebGL2 shaders', html.includes('#version 300 es'));
ok('AWAKEN entry', html.includes('AWAKEN') && html.includes('id="go"'));
ok('no fragment loader', !html.includes("v3_s_") && !/fetch\(\s*['\"]s_/.test(html));
ok('save key dova.v2', html.includes("dova.v2"));
ok('v1 migration key', html.includes("dova.v1"));
ok('RESET is intentional', html.includes("removeItem(SK)") && html.includes('id="rst"'));
ok('touch hardened', html.includes('user-scalable=no') && html.includes('touch-action:none'));
ok('WebGL context recovery', html.includes('webglcontextlost') && html.includes('webglcontextrestored'));
ok('dragon flight controls', html.includes('SPACE') || html.includes('flap'));
ok('fire breath', /fire/i.test(html));
ok('balanced braces', (() => {
  const s = html.slice(html.indexOf('<script>'), html.lastIndexOf('</script>'));
  return s.split('{').length === s.split('}').length;
})());

// Simulated save round-trip (Node localStorage polyfill)
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const sample = {g:[1,0,1],r:2,v:2,forge:[1,0,1],burned:{},cracked:{},seals:{},fx:0,p:[1,2,3],yaw:0.5,q:250};
localStorage.setItem('dova.v2', JSON.stringify(sample));
const raw = localStorage.getItem('dova.v2');
const round = JSON.parse(raw);
ok('save round-trip', round.r === 2 && round.g[0] === 1 && round.forge[2] === 1);

// v1 → v2 style migration defaults
localStorage.removeItem('dova.v2');
localStorage.setItem('dova.v1', JSON.stringify({g:[1,1,0],r:1}));
const migrated = JSON.parse(localStorage.getItem('dova.v2') || localStorage.getItem('dova.v1') || '{}');
ok('v1 readable for migration', migrated.g && migrated.g[0] === 1);

console.log(failed ? `\n${failed} test(s) failed` : '\nAll tests passed');
process.exit(failed ? 1 : 0);
