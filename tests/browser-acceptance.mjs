#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
let failed = 0;
function record(name, pass, detail = '') {
  if (pass) console.log('PASS', name, detail || '');
  else { console.error('FAIL', name, detail); failed++; }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function assemble() {
  const parts = [];
  for (let i = 0; i < 35; i++) {
    const p = path.join(root, `s_${i}.txt`);
    if (!fs.existsSync(p)) throw new Error('missing ' + p);
    const t = fs.readFileSync(p, 'utf8');
    if (t.length < 20) throw new Error('short ' + p);
    parts.push(t);
  }
  return parts.join('');
}

async function withChrome(html, fn) {
  const WebSocket = createRequire('/tmp/ws_pkg/package/package.json')('/tmp/ws_pkg/package');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const chrome = spawn('google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--enable-unsafe-swiftshader', '--use-gl=angle',
    '--remote-debugging-port=9340', 'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  let wsUrl;
  for (let i = 0; i < 40; i++) {
    try {
      const ver = await new Promise((res, rej) => {
        http.get('http://127.0.0.1:9340/json/version', (r) => {
          let b = ''; r.on('data', (d) => b += d); r.on('end', () => res(JSON.parse(b)));
        }).on('error', rej);
      });
      wsUrl = ver.webSocketDebuggerUrl; break;
    } catch { await sleep(150); }
  }
  if (!wsUrl) { chrome.kill(); server.close(); throw new Error('CDP unavailable'); }
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
  let id = 0;
  const pending = new Map();
  const exceptions = [];
  ws.on('message', (raw) => {
    const msg = JSON.parse(raw.toString());
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params?.exceptionDetails?.exception?.description || msg.params?.exceptionDetails?.text);
    }
  });
  const send = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${port}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const session = (method, params = {}) => new Promise((res, rej) => {
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, sessionId, params }));
  });
  await session('Runtime.enable');
  await session('Page.enable');
  await sleep(3500);
  const evalV = async (expression) =>
    (await session('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  try {
    await fn({ session, evalV, exceptions });
  } finally {
    try { ws.close(); } catch {}
    chrome.kill();
    server.close();
  }
}

console.log('\n=== Fragment integrity ===');
let html;
try {
  html = assemble();
  record('35 fragments assemble', html.length > 20000, String(html.length));
  record('starts with DOCTYPE', /^<!DOCTYPE/i.test(html));
  record('has gH', html.includes('function gH'));
  record('has initGL', html.includes('function initGL'));
  record('has frame', html.includes('function frame'));
  record('has AWAKEN', html.includes('AWAKEN'));
  record('has dragon', html.includes('function dragon'));
  record('has world', html.includes('function world'));
  record('has pause', html.includes('function pause'));
  record('has save', html.includes('const save='));
  record('shader compile checks', html.includes('COMPILE_STATUS') && html.includes('LINK_STATUS'));
  record('context loss handlers', html.includes('webglcontextlost') && html.includes('webglcontextrestored'));
  record('mobile viewport lock', html.includes('user-scalable=no'));
} catch (e) {
  record('assemble', false, String(e));
  process.exit(1);
}

console.log('\n=== JavaScript syntax ===');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
record('brace balance', script.split('{').length === script.split('}').length);
const tmp = '/tmp/dova-accept-check.js';
fs.writeFileSync(tmp, script);
const chk = spawnSync('node', ['--check', tmp], { encoding: 'utf8' });
record('node --check', chk.status === 0, chk.stderr || '');

console.log('\n=== Browser integration (Chrome + WebGL) ===');
try {
  await withChrome(html, async ({ evalV, exceptions }) => {
    const boot = await evalV(`({
      hasGo: !!document.getElementById('go'),
      go: document.getElementById('go') && document.getElementById('go').textContent,
      st: typeof st !== 'undefined' ? st : null,
      gl: typeof gl !== 'undefined' && !!gl,
      gH: typeof gH,
      err: (document.getElementById('err') || {}).textContent || '',
      canvas: (() => { const c = document.getElementById('gl'); return c ? [c.width, c.height] : null; })(),
      zoom: !!(document.querySelector('meta[name=viewport][content*="user-scalable=no"]')),
      touch: getComputedStyle(document.documentElement).touchAction
    })`);
    record('title screen AWAKEN', boot.hasGo && boot.go === 'AWAKEN');
    record('state title', boot.st === 'title', String(boot.st));
    record('WebGL context', boot.gl === true);
    record('gH defined', boot.gH === 'function');
    record('canvas sized', !!(boot.canvas && boot.canvas[0] > 0));
    record('no boot err', !boot.err, boot.err);
    record('viewport no-zoom', boot.zoom === true);
    record('touch-action', boot.touch === 'none' || boot.touch === 'manipulation', String(boot.touch));

    await evalV(`document.getElementById('go').click()`);
    await sleep(5500);

    const play = await evalV(`({
      st: typeof st !== 'undefined' ? st : null,
      aw: typeof aw !== 'undefined' ? aw : null,
      err: (document.getElementById('err') || {}).textContent || '',
      frameErr: window.__dovaFrameErr || null,
      P: typeof P !== 'undefined' ? { x: P.x, y: P.y, z: P.z } : null,
      core: typeof D !== 'undefined' ? D.core : null,
      tm: typeof tm !== 'undefined' ? tm : null
    })`);
    record('AWAKEN → play', play.st === 'play', String(play.st));
    record('awaken duration', play.aw == null || play.aw >= 4.0, String(play.aw));
    record('player position', !!(play.P && Number.isFinite(play.P.y)));
    record('no runtime err', !play.err, play.err);
    record('no frameErr', !play.frameErr);
    record('sim time advanced', play.tm > 1, String(play.tm));

    await evalV(`K.Space=1; K.KeyW=1;`);
    await sleep(800);
    const moved = await evalV(`({y:P.y, sp:D.sp, flap:D.flap})`);
    record('keyboard affects state', moved.flap === 1 || moved.sp > 0 || moved.y !== play.P.y, JSON.stringify(moved));
    await evalV(`K.Space=0; K.KeyW=0;`);

    await evalV(`pause()`);
    const paused = await evalV(`({st, go: document.getElementById('go').textContent})`);
    record('pause', paused.st === 'pause' && paused.go === 'RESUME', JSON.stringify(paused));

    await evalV(`document.getElementById('go').click()`);
    await sleep(400);
    const resumed = await evalV(`st`);
    record('resume', resumed === 'play', String(resumed));

    const touch = await evalV(`!!document.getElementById('tc')`);
    record('touch UI exists', touch === true);

    record('no uncaught exceptions', exceptions.length === 0, JSON.stringify(exceptions));
  });
} catch (e) {
  record('browser suite ran', false, String(e));
}

console.log(failed ? `\n${failed} FAILED` : '\nAll acceptance checks PASSED');
process.exit(failed ? 1 : 0);
