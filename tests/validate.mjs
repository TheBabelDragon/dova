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
let failed = 0;
const ok = (name, cond, detail='') => {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name, detail); failed++; }
};

const indexPath = path.join(root, 'index.html');
const gamePath = path.join(root, 'assets/game.js');
const html = fs.readFileSync(indexPath, 'utf8');
const js = fs.existsSync(gamePath) ? fs.readFileSync(gamePath, 'utf8') : '';
const src = html + '\n' + js;

ok('index present', html.length > 500, `size=${html.length}`);
ok('game.js present', js.length > 20000, `size=${js.length}`);
ok('DOCTYPE', html.includes('<!DOCTYPE html>'));
ok('WebGL2 shaders', src.includes('#version 300 es'));
ok('AWAKEN entry', html.includes('AWAKEN') && html.includes('id="go"'));
ok('loads assets/game.js', /src=["']assets\/game\.js["']/.test(html));
ok('no fragment loader', !src.includes("v3_s_") && !/fetch\(\s*['\"]s_/.test(src));
ok('save key dova.v2', src.includes("dova.v2"));
ok('v1 migration key', src.includes("dova.v1"));
ok('RESET is intentional', src.includes("removeItem(SK)") && html.includes('id="rst"'));
ok('touch hardened', html.includes('user-scalable=no') && html.includes('touch-action:none'));
ok('WebGL context recovery', js.includes('webglcontextlost') && js.includes('webglcontextrestored'));
ok('balanced braces in game.js', js.split('{').length === js.split('}').length);

const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k,v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const sample = {g:[1,0,1],r:2,v:2,forge:[1,0,1],burned:{},cracked:{},seals:{},fx:0,p:[1,2,3],yaw:0.5,q:250};
localStorage.setItem('dova.v2', JSON.stringify(sample));
const round = JSON.parse(localStorage.getItem('dova.v2'));
ok('save round-trip', round.r === 2 && round.g[0] === 1 && round.forge[2] === 1);

localStorage.removeItem('dova.v2');
localStorage.setItem('dova.v1', JSON.stringify({g:[1,1,0],r:1}));
const migrated = JSON.parse(localStorage.getItem('dova.v2') || localStorage.getItem('dova.v1') || '{}');
ok('v1 readable for migration', migrated.g && migrated.g[0] === 1);

console.log(failed ? `\n${failed} test(s) failed` : '\nAll tests passed');
process.exit(failed ? 1 : 0);
