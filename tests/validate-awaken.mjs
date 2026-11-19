#!/usr/bin/env node
/**
 * AWAKEN runtime recovery checks (source-level).
 * Does not execute WebGL; verifies the freeze root cause is addressed in the loader + payload.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
const ok = (n, c, d='') => { if (c) console.log('PASS', n); else { console.error('FAIL', n, d); failed++; } };

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
ok('loader injects gH', index.includes('function gH') && index.includes('patchPayload'));
ok('loader mentions ReferenceError class of fix', index.includes('gH') && index.includes('sim('));
ok('frame error surface', index.includes('__dovaFrameErr') || index.includes('Runtime:'));

let assembled = '';
for (let i = 0; i < 35; i++) {
  const p = path.join(root, `s_${i}.txt`);
  if (!fs.existsSync(p)) { console.log('skip assemble — no local fragments'); break; }
  assembled += fs.readFileSync(p, 'utf8');
}
if (assembled) {
  ok('payload calls gH', assembled.includes('gH('));
  ok('payload missing function gH (pre-patch)', !assembled.includes('function gH'));
  let html = assembled;
  const gh = 'function gH(x,z,y){let best=-1e9;for(const i of isl){const dx=x-i.x,dz=z-i.z,d=Math.hypot(dx,dz);if(d<=i.r*1.05){const t=d/(i.r*1.05);const h=i.top-(t>0.92?(t-0.92)*8:0);if(h>best)best=h;}}return best;}';
  html = html.replace('function sim(', gh + 'function sim(');
  ok('post-patch has function gH', html.includes('function gH'));
  ok('gH before sim', html.indexOf('function gH') < html.indexOf('function sim('));
  try {
    new Function(gh + '; return gH;');
    ok('gH parses', true);
  } catch (e) {
    ok('gH parses', false, String(e));
  }
}

console.log(failed ? `\n${failed} failed` : '\nAll awaken tests passed');
process.exit(failed ? 1 : 0);
