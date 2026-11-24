// Tes fitur versi produk.
// Membangun situs + satu versi beku ke folder sementara, menyajikannya lewat server lokal,
// lalu memeriksa keduanya di Chrome headless (laptop dan ponsel).
//
// Pakai:  node tools/tes-versi.mjs            (butuh Node 22+, Python 3, Google Chrome)
//         CHROME=/jalur/ke/chrome node tools/tes-versi.mjs
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = process.argv[2] || 'pertemuan-12';
const TMP = mkdtempSync(join(tmpdir(), 'se-versi-'));
const SITE = join(TMP, 'SmartEmailing'); // meniru subfolder GitHub Pages: /SmartEmailing/
const SHOTS = join(TMP, 'shots');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 5300 + Math.floor(Math.random() * 400), DBG = PORT + 1000;
const W = ms => new Promise(r => setTimeout(r, ms));
let gagal = 0;
const ok = (label, cond, extra = '') => { if (!cond) gagal++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };

// 1. bangun situs + versi beku ke folder sementara
execFileSync('mkdir', ['-p', SITE, SHOTS]);
execFileSync('rsync', ['-a', '--exclude', '.DS_Store', 'index.html', 'css', 'js', 'assets', SITE + '/'], { cwd: ROOT });
execFileSync(join(ROOT, 'tools/bekukan-versi.sh'), [SLUG, '--keluar', SITE], { cwd: ROOT, stdio: 'inherit' });
let tolak = '';
try { execFileSync(join(ROOT, 'tools/bekukan-versi.sh'), [SLUG, '--keluar', SITE], { cwd: ROOT, stdio: 'pipe' }); } catch (e) { tolak = String(e.stderr); }
ok('versi yang sudah ada tidak ditimpa tanpa --timpa', /sudah ada/.test(tolak));
try { execFileSync(join(ROOT, 'tools/bekukan-versi.sh'), ['Versi_Salah', '--keluar', SITE], { cwd: ROOT, stdio: 'pipe' }); tolak = ''; } catch (e) { tolak = String(e.stderr); }
ok('slug tidak valid ditolak', /tidak valid/.test(tolak));
ok('folder versi beku ada', existsSync(join(SITE, 'versi', SLUG, 'index.html')));

// 2. server + Chrome
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: TMP, stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${DBG}`, `--user-data-dir=${join(TMP, 'prof')}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const selesai = code => { try { chrome.kill(); server.kill(); } catch {} process.exit(code); };
let ws, id = 0; const pend = {}; const errs = [];
for (let i = 0; i < 60 && !ws; i++) { try { const t = await (await fetch(`http://127.0.0.1:${DBG}/json`)).json(); const pg = t.find(x => x.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {} await W(250); }
if (!ws) { console.log('FAIL Chrome tidak bisa dijalankan'); selesai(1); }
if (ws.readyState !== WebSocket.OPEN) await new Promise(r => ws.onopen = r);
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d.result); delete pend[d.id]; }
  if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  if (d.method === 'Network.responseReceived' && d.params.response.status >= 400) errs.push(d.params.response.status + ' ' + d.params.response.url); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); return r.result && r.result.value; };
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
const size = (w, h) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
const shot = async n => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, n + '.png'), Buffer.from(r.data, 'base64')); };
const BASE = `http://127.0.0.1:${PORT}/SmartEmailing/`, BEKU = BASE + `versi/${SLUG}/`;
for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await W(150); }
const buka = async (url, hash = '#/tentang') => { await send('Page.navigate', { url: url + hash }); await W(1400); await ev(`document.body.classList.add('settled')`); };
const NAMA = `localStorage.setItem('smart-emailing:v2', JSON.stringify({ sound: false, game: { nama: 'Tes' } })); localStorage.setItem('smart-emailing:v2@${SLUG}', JSON.stringify({ sound: false, game: { nama: 'Tes' } }))`;

await size(1440, 900);
await buka(BASE, '#/'); await ev(NAMA);

// 3. versi terbaru
const e0 = errs.length;
await buka(BASE);
ok('versi terbaru terbuka tanpa error', errs.length === e0 && await ev(`!!document.querySelector('.vr-list')`), errs.slice(e0).join(' | '));
ok('versi terbaru tanpa label versi', await ev(`!document.querySelector('.ver-strip')`));
ok('versi terbaru ditandai Sedang dibuka', await ev(`document.querySelector('.vr-row.on b').textContent === 'Versi terbaru'`));
ok('tombol versi beku menuju alamat yang benar', await ev(`document.querySelector('[data-versi="${SLUG}"]').href`) === BEKU, await ev(`document.querySelector('[data-versi="${SLUG}"]').href`));

// 4. versi beku
const e1 = errs.length;
await buka(BEKU);
ok('versi beku terbuka tanpa error', errs.length === e1 && await ev(`!!document.querySelector('.vr-list')`), errs.slice(e1).join(' | '));
ok('label versi tampil di versi beku', await ev(`(s => !!s && s.getBoundingClientRect().height > 0 && /Versi /.test(s.textContent))(document.querySelector('.ver-strip'))`), await ev(`document.querySelector('.ver-strip') && document.querySelector('.ver-strip').textContent`));
ok('tautan label menuju versi terbaru', await ev(`document.querySelector('.ver-strip').href`) === BASE, await ev(`document.querySelector('.ver-strip').href`));
ok('versi beku ditandai Sedang dibuka', await ev(`document.querySelector('.vr-row.on b').textContent !== 'Versi terbaru'`));
ok('tombol Versi terbaru menuju alamat utama', await ev(`document.querySelector('[data-versi="terbaru"]').href`) === BASE);
ok('progres versi beku tersimpan terpisah', await ev(`KEY`) === `smart-emailing:v2@${SLUG}`);

// 5. klik sungguhan: label dan tombol berpindah versi
await ev(`document.querySelector('.ver-strip').click()`); await W(1400);
ok('klik label membuka versi terbaru', await ev(`location.href.split('#')[0]`) === BASE && await ev(`!document.querySelector('.ver-strip')`));
await buka(BASE); await ev(`document.querySelector('[data-versi="${SLUG}"]').click()`); await W(1400);
ok('klik "Buka versi ini" membuka versi beku', await ev(`location.href.split('#')[0]`) === BEKU && await ev(`!!document.querySelector('.ver-strip')`));

// 6. label tidak menutupi tombol penting (laptop dan ponsel)
const PENTING = ['.faq-fab', '#setBtn', '#progBtn', '#soundBtn', '.step-nav .btn', '.nav .icon-btn', '#menuBtn', '.toast'];
for (const [w, h, tag] of [[1440, 900, 'laptop'], [1280, 720, 'laptop-kecil'], [390, 844, 'ponsel'], [360, 640, 'ponsel-kecil']]) {
  await size(w, h);
  for (const hash of ['#/tentang', '#/bagian/pengantar', '#/']) {
    await buka(BEKU, hash); await ev(`scrollTo(0, document.documentElement.scrollHeight)`); await W(300);
    const tutup = await ev(`(() => { const s = document.querySelector('.ver-strip').getBoundingClientRect(), out = [];
      document.querySelectorAll(${JSON.stringify(PENTING.join(','))}).forEach(el => { const r = el.getBoundingClientRect(); if (!r.width || getComputedStyle(el).visibility === 'hidden') return;
        if (r.bottom > s.top && r.top < s.bottom && r.right > s.left && r.left < s.right) out.push(el.className || el.id); });
      if (document.documentElement.scrollWidth > innerWidth) out.push('overflow-x');
      return out; })()`);
    ok(`${tag} ${hash}: label tidak menutupi tombol`, tutup.length === 0, tutup.join(', '));
  }
  await buka(BEKU, '#/tentang'); await shot(`beku-${tag}`);
}
ok('tidak ada error JS', errs.length === 0, [...new Set(errs)].join(' | '));
console.log(`\nScreenshot: ${SHOTS}`);
console.log(gagal ? `${gagal} tes gagal` : 'Semua tes lulus');
selesai(gagal ? 1 : 0);
