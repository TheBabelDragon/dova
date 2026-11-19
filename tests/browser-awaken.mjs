#!/usr/bin/env node
/**
 * Real browser startup test for DOVA.
 * 1) Assemble s_0…s_34 using the same patchPayload rules as index.html
 * 2) Parse resulting JavaScript (node --check)
 * 3) Load in headless Chrome, click AWAKEN, wait for st==='play'
 * 4) Assert WebGL, frames, no fatal errors
 * 5) Assert mobile zoom-lock meta/CSS present
 *
 * Usage: node tests/browser-awaken.mjs
 */
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let failed = 0;
const ok = (name, cond, detail = '') => {
  if (cond) console.log('PASS', name);
  else { console.error('FAIL', name, detail); failed++; }
};

function patchPayload(html) {
  if (!html.includes('function gH')) {
    const gh = 'function gH(x,z,y){let best=-1e9;for(const i of isl){const dx=x-i.x,dz=z-i.z,d=Math.hypot(dx,dz);if(d<=i.r*1.05){const t=d/(i.r*1.05);const h=i.top-(t>0.92?(t-0.92)*8:0);if(h>best)best=h;}}return best;}';
    if (!html.includes('function sim(')) throw new Error('sim() missing');
    html = html.replace('function sim(', gh + 'function sim(', 1);
  }
  if (!html.includes('__dovaFrameErr')) {
    if (html.includes('function frame(ms2){requestAnimationFrame(frame);') &&
        html.includes('cam(dt);render();hud();audU()}')) {
      html = html.replace(
        'function frame(ms2){requestAnimationFrame(frame);',
        'function frame(ms2){requestAnimationFrame(frame);try{',
        1
      );
      html = html.replace(
        'cam(dt);render();hud();audU()}',
        "cam(dt);render();hud();audU()}catch(err){if(!window.__dovaFrameErr){window.__dovaFrameErr=1;console.error('DOVA frame',err);const e=document.getElementById('err');if(e)e.textContent='Runtime: '+err;}}}",
        1
      );
    }
  }
  const oldBoot = "try{initGL();rs();requestAnimationFrame(frame)}catch(e){$('err').textContent=String(e);$('go').classList.add('hide')}";
  if (html.includes(oldBoot)) {
    html = html.replace(oldBoot,
      "try{if(!window.WebGL2RenderingContext)throw new Error('WebGL2 API missing');initGL();if(!gl)throw new Error('WebGL2 context null');rs();cam(0);render();requestAnimationFrame(frame);console.info('DOVA boot OK');window.__dovaBoot='ok'}catch(e){console.error('DOVA boot',e);window.__dovaBoot=String(e);const er=$('err');if(er)er.textContent='Boot: '+e;const go=$('go');if(go)go.classList.add('hide')}"
    );
  }
  if (!html.includes('data-dova-zoom-lock')) {
    const zoomCss = '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" data-dova-zoom-lock="1">' +
      '<style data-dova-zoom-lock="1">html,body{touch-action:none;-ms-touch-action:none;overscroll-behavior:none;overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}' +
      'canvas,#tc,#ui{touch-action:none;-ms-touch-action:none}</style>';
    html = html.replace(/<head([^>]*)>/, (m) => m + zoomCss, 1);
  }
  return html;
}

function assemble() {
  let html = '';
  for (let i = 0; i < 35; i++) {
    const p = path.join(root, `s_${i}.txt`);
    if (!fs.existsSync(p)) throw new Error('missing ' + p);
    html += fs.readFileSync(p, 'utf8');
  }
  return patchPayload(html);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function chromeEval(htmlPath) {
  let WebSocket;
  try { WebSocket = (await import('ws')).default; }
  catch {
    spawnSync('npm', ['install', 'ws', '--no-save'], { cwd: '/tmp', stdio: 'inherit' });
    WebSocket = (await import('/tmp/node_modules/ws/wrapper.mjs')).default;
  }

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/game.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(htmlPath));
      return;
    }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/game.html`;

  const chrome2 = spawn('google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--remote-debugging-port=9333',
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let wsUrl;
  for (let i = 0; i < 40; i++) {
    try {
      const ver = await new Promise((res, rej) => {
        http.get('http://127.0.0.1:9333/json/version', (r) => {
          let b = ''; r.on('data', (d) => b += d); r.on('end', () => res(JSON.parse(b)));
        }).on('error', rej);
      });
      wsUrl = ver.webSocketDebuggerUrl;
      break;
    } catch { await sleep(150); }
  }
  if (!wsUrl) { chrome2.kill(); server.close(); throw new Error('Chrome CDP not available'); }

  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      logs.push(msg.params?.exceptionDetails?.exception?.description || 'exception');
    }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });

  const { targetId } = await send('Target.createTarget', { url });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const session = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, sessionId, params }));
  });
  await session('Runtime.enable');
  await session('Page.enable');
  await sleep(3500);

  const before = (await session('Runtime.evaluate', {
    expression: `({boot:window.__dovaBoot||null,st:typeof st!=='undefined'?st:null,err:(document.getElementById('err')||{}).textContent||'',go:(document.getElementById('go')||{}).textContent||'',goVisible:!!(document.getElementById('go')&&!document.getElementById('go').classList.contains('hide')),hasGl:typeof gl!=='undefined'&&!!gl,canvas:(()=>{const c=document.getElementById('gl');return c?[c.width,c.height]:null})(),zoomMeta:!!document.querySelector('meta[data-dova-zoom-lock],meta[name=viewport][content*="user-scalable=no"]'),touchAction:getComputedStyle(document.documentElement).touchAction})`,
    returnByValue: true,
  })).result.value;

  await session('Runtime.evaluate', { expression: `document.getElementById('go').click();'ok'`, returnByValue: true });
  await sleep(5500);

  const after = (await session('Runtime.evaluate', {
    expression: `({st:typeof st!=='undefined'?st:null,aw:typeof aw!=='undefined'?aw:null,err:(document.getElementById('err')||{}).textContent||'',frameErr:window.__dovaFrameErr||null,P:typeof P!=='undefined'?{x:P.x,y:P.y,z:P.z}:null,core:typeof D!=='undefined'?D.core:null,framesApprox:typeof tm!=='undefined'?tm:null})`,
    returnByValue: true,
  })).result.value;

  ws.close(); chrome2.kill(); server.close();
  return { before, after, logs };
}

console.log('=== 1) Assemble via loader rules ===');
let html;
try {
  html = assemble();
  ok('assembled size', html.length > 30000, String(html.length));
  ok('contains gH', html.includes('function gH'));
  ok('contains AWAKEN', html.includes('AWAKEN'));
  ok('contains dragon fn', html.includes('function dragon'));
  ok('zoom lock markers', html.includes('user-scalable=no'));
} catch (e) {
  ok('assemble', false, String(e));
  process.exit(1);
}

console.log('\n=== 2) Parse JavaScript ===');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
ok('brace balance', script.split('{').length === script.split('}').length);
const tmpJs = '/tmp/dova-assemble-check.js';
fs.writeFileSync(tmpJs, script);
const chk = spawnSync('node', ['--check', tmpJs], { encoding: 'utf8' });
ok('node --check', chk.status === 0, chk.stderr || '');

console.log('\n=== 3-5) Headless Chrome: load, AWAKEN, play ===');
fs.writeFileSync('/tmp/dova-browser-test.html', html);
try {
  const { before, after, logs } = await chromeEval('/tmp/dova-browser-test.html');
  console.log('before', before);
  console.log('after', after);
  ok('boot has AWAKEN button', before.goVisible && before.go === 'AWAKEN');
  ok('WebGL context', before.hasGl === true);
  ok('canvas sized', before.canvas && before.canvas[0] > 0);
  ok('boot no err text', !before.err);
  ok('zoom meta present', before.zoomMeta === true);
  ok('touch-action none-ish', !before.touchAction || before.touchAction === 'none');
  ok('AWAKEN reached play', after.st === 'play', String(after.st));
  ok('awaken timer completed', after.aw == null || after.aw >= 4.0, String(after.aw));
  ok('player position finite', after.P && Number.isFinite(after.P.x));
  ok('no runtime err banner', !after.err, after.err);
  ok('no frameErr flag', !after.frameErr);
  ok('no fatal exceptions', logs.length === 0, JSON.stringify(logs));
} catch (e) {
  ok('browser test ran', false, String(e));
}

console.log(failed ? `\n${failed} FAILED` : '\nAll browser-awaken checks PASSED');
process.exit(failed ? 1 : 0);
