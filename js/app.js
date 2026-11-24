'use strict';
/* =========================================================================
   SMART EMAILING — modul pelatihan interaktif (Kelompok 7)
   Tampilan modul 16:9: sampul → menu → bagian pengantar–penutup (materi, latihan, aktivitas interaktif, evaluasi),
   evaluasi tanpa pilihan ganda. Semua progres tersimpan di browser.
   ========================================================================= */

/* ---------- Utilitas ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $('#app');
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cleanups = [];
const onLeave = fn => cleanups.push(fn);
const later = (fn, ms) => { const id = setTimeout(fn, ms); onLeave(() => clearTimeout(id)); return id; };

/* ---------- Ikon (garis + bidang warna bergeser, gaya cap) ---------- */
const P = {
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  panel: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18"/>',
  clipcheck: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="m9 14 2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-9"/>',
  signpost: '<path d="M12 3v18"/><path d="M5 6h12l3 3-3 3H5z"/><path d="M19 14H8l-3 3 3 3h11"/>',
  more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  vol: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  mute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  right: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  left: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  up: '<polyline points="18 15 12 9 6 15"/>',
  down: '<polyline points="6 9 12 15 18 9"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  branch: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  grip: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  pointer: '<path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 8-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>',
  list: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
};
const F = {
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/>', clip: '<circle cx="12" cy="12" r="6.5"/>', send: '<path d="m22 2-7 20-4-9-9-4Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/>', users: '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2z"/>',
  file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/>', briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14z"/>', target: '<circle cx="12" cy="12" r="10"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>', help: '<circle cx="12" cy="12" r="10"/>',
  branch: '<circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>', chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pen: '<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>', search: '<circle cx="11" cy="11" r="8"/>',
  inbox: '<path d="M2 12h6l2 3h4l2-3h6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>', grip: '<rect x="5.5" y="2" width="13" height="20" rx="4"/>',
  pointer: '<path d="m9 9 5 12 1.8-5.2L21 14Z"/>', list: '<rect x="1.5" y="3" width="9" height="18" rx="2"/>', award: '<circle cx="12" cy="8" r="6"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  type: '<rect x="3" y="3" width="18" height="5" rx="1.5"/>', layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/>', play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', eye: '<circle cx="12" cy="12" r="5"/>', eyeoff: '<circle cx="12" cy="12" r="5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>', printer: '<rect x="6" y="14" width="12" height="8"/>',
};
const icon = (n, cls = '') => `<svg class="ic i-${n} ${F[n] ? 'duo' : ''} ${cls}" viewBox="-1 -1 26 26" aria-hidden="true">${F[n] ? `<g class="f">${F[n]}</g>` : ''}<g class="s">${P[n] || ''}</g></svg>`;

/* Logo: amplop yang tutupnya membentuk centang + kilau */
const LOGO = `<svg class="logo" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#7a1f2e"/><rect x="8" y="14" width="31" height="22" rx="4.5" fill="#fbf5ec"/><path class="logo-ck" d="M12 18.5 21.5 26 35.5 15.5" fill="none" stroke="#3b1119" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path class="logo-sp" d="M38 3.5 39.8 8.2 44.5 10 39.8 11.8 38 16.5 36.2 11.8 31.5 10 36.2 8.2Z" fill="#e2b04a" stroke="#7a1f2e" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

/* ---------- Versi produk ----------
   Setiap tahap pengumpulan dibekukan ke folder versi/<slug>/ dengan tools/bekukan-versi.sh <slug>.
   Salinan beku menyetel window.SE_VERSI = '<slug>' di index.html-nya; versi terbaru tidak. */
const VERSI = [
  { slug: 'pertemuan-12', nama: 'Pertemuan 12', tanggal: '2026-11-24', ket: 'Produk yang dikumpulkan di kolom SPS Pertemuan 12' },
];
const SITUS = 'https://syahladfa.github.io/SmartEmailing/';
const VERSI_INI = VERSI.find(v => v.slug === window.SE_VERSI) || null;
const tglID = d => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
/* Alamat sebuah versi (slug kosong = versi terbaru). Relatif supaya jalan di subfolder dan di server lokal;
   absolut ke situs bila dibuka sebagai file offline atau di dalam LMS (iframe). */
function urlVersi(slug) {
  const path = slug ? 'versi/' + slug + '/' : '';
  if (location.protocol === 'file:' || window.top !== window.self) return SITUS + path;
  return (VERSI_INI ? '../../' : './') + path;
}

/* ---------- Penyimpanan progres ---------- */
/* Tiap versi beku punya kunci sendiri supaya progresnya tidak tercampur dengan versi terbaru */
const KEY = 'smart-emailing:v2' + (VERSI_INI ? '@' + VERSI_INI.slug : '');
const fresh = () => ({ done: {}, act: {}, lat: null, akt: null, ev: null, feedback: null, sound: true, last: null, v2: true, log: [], resume: null, ui: {} });
let state = (() => { try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return fresh(); } })();
/* Migrasi ID lama (S01–S16) ke ID bernama, supaya progres peserta lama tetap terbaca */
const ID_LAMA = { S01: 'pengantar', S02: 'kegunaan-email', S03: 'bagian-email', S04: 'subject-dan-salam', S05: 'susunan-email', S06: 'perkenalan-dan-cv', S07: 'kesalahan-email', S08: 'praktik-email', S09: 'cc-bcc-waktu', S10: 'follow-up', S11: 'bahasa-formal', S12: 'latihan-soal', S13: 'aktivitas-interaktif', S14: 'awal-evaluasi', S15: 'evaluasi-akhir', S16: 'penutup' };
(() => {
  ['done', 'act'].forEach(k => { const o = state[k]; if (!o) return; Object.keys(ID_LAMA).forEach(old => { if (old in o) { if (!(ID_LAMA[old] in o)) o[ID_LAMA[old]] = o[old]; delete o[old]; } }); });
  if (state.last && ID_LAMA[state.last]) state.last = ID_LAMA[state.last];
  if (state.resume) { if (state.resume.id && ID_LAMA[state.resume.id]) state.resume.id = ID_LAMA[state.resume.id]; if (state.resume.kind === 'scene') state.resume.kind = 'bagian'; if (state.resume.href) state.resume.href = state.resume.href.replace(/#\/scene\/(S\d\d)/, (m, id) => '#/bagian/' + (ID_LAMA[id] || id)); }
  (state.log || []).forEach(e => { if (e.id && ID_LAMA[e.id]) e.id = ID_LAMA[e.id]; });
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* mode privat */ }
})();
let gameOn = false;
function save() { if (gameOn) gameCheck(); try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* mode privat */ } SCORM.sync(); }

/* ---------- Koneksi LMS (SCORM 1.2) ----------
   Bila dibuka di dalam LMS, status belajar dan nilai evaluasi dikirim ke LMS.
   Bila dibuka biasa (offline / GitHub Pages), bagian ini diam saja. */
const SCORM = (() => {
  let api = null, last = '';
  try {
    let w = window;
    for (let i = 0; i < 12 && w; i++) { if (w.API) { api = w.API; break; } if (w === w.parent) break; w = w.parent; }
    if (!api && window.opener && window.opener.API) api = window.opener.API;
    if (api && String(api.LMSInitialize('')) !== 'true') api = null;
  } catch (e) { api = null; }
  const set = (k, v) => { try { api.LMSSetValue(k, String(v)); } catch (e) { /* abaikan */ } };
  if (api) window.addEventListener('beforeunload', () => { try { api.LMSCommit(''); api.LMSFinish(''); } catch (e) { /* abaikan */ } });
  return {
    on: !!api,
    sync() {
      if (!api) return;
      const ev = state.ev && state.ev.done ? state.ev.score : null;
      const status = ev === null ? 'incomplete' : ev >= KKM ? 'passed' : 'failed';
      const key = status + '|' + ev + '|' + (state.last || '');
      if (key === last) return; last = key;
      set('cmi.core.lesson_status', status);
      if (ev !== null) { set('cmi.core.score.min', 0); set('cmi.core.score.max', 100); set('cmi.core.score.raw', ev); }
      if (state.last) set('cmi.core.lesson_location', state.last);
      try { api.LMSCommit(''); } catch (e) { /* abaikan */ }
    },
  };
})();
const A = id => (state.act[id] = state.act[id] || {});
/* Migrasi ke storyboard v2: latihan jadi 15 soal PG, evaluasi jadi 4 soal, penutup pindah ke penutup */
if (state.lat && state.lat.v !== 3) state.lat = null;
if (state.ev && state.ev.v !== 3) state.ev = null;
if (!state.v2) { delete state.done['latihan-soal']; delete state.done['aktivitas-interaktif']; delete state.act['latihan-soal']; delete state.act['aktivitas-interaktif']; state.v2 = true; }

/* ---------- Suara ---------- */
let actx;
function sfx(type = 'click') {
  if (!state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    const c = { click: [700, 700, .05, 'sine'], ok: [740, 1180, .2, 'sine'], hint: [560, 900, .16, 'sine'], no: [260, 150, .24, 'triangle'] }[type];
    o.type = c[3]; o.frequency.setValueAtTime(c[0], t); o.frequency.linearRampToValueAtTime(c[1], t + c[2]);
    g.gain.setValueAtTime(.07, t); g.gain.exponentialRampToValueAtTime(.0001, t + c[2] + .05);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + c[2] + .08);
  } catch (e) { /* tidak ada audio */ }
}
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function celebrate() {
  if (document.body.classList.contains('calm')) return;
  if (reduced) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const colors = ['#7a1f2e', '#e2b04a', '#f4d9cf', '#c4553f', '#fbf5ec', '#3b1119'];
  for (let i = 0; i < 44; i++) {
    const s = document.createElement('i');
    s.style.cssText = `--dx:${((Math.random() - .5) * 520).toFixed(0)}px;--dy:${-(160 + Math.random() * 240).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 140).toFixed(0)}ms;width:${(6 + Math.random() * 6).toFixed(0)}px;height:${(10 + Math.random() * 8).toFixed(0)}px`;
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2000);
}

/* =========================================================================
   DATA MATERI
   ========================================================================= */
const NAMA = 'Syarifudin', NAMAF = 'Syarifudin';
const ORDER = ['pengantar', 'kegunaan-email', 'bagian-email', 'subject-dan-salam', 'susunan-email', 'perkenalan-dan-cv', 'kesalahan-email', 'praktik-email', 'cc-bcc-waktu', 'follow-up', 'bahasa-formal', 'latihan-soal', 'aktivitas-interaktif', 'awal-evaluasi', 'evaluasi-akhir', 'penutup'];
const MATERI_BAGIAN = ['kegunaan-email', 'bagian-email', 'subject-dan-salam', 'susunan-email', 'perkenalan-dan-cv', 'kesalahan-email', 'praktik-email', 'cc-bcc-waktu', 'follow-up', 'bahasa-formal'];
const KKM = 75;

const MATERI = [
  { id: 'intro', no: '00', short: 'Pembuka', title: 'Pembuka', icon: 'inbox', bagian: ['pengantar'] },
  { id: 'm1', no: '01', short: 'Materi 1', title: 'Dasar Komunikasi lewat Email', icon: 'mail', bagian: ['kegunaan-email', 'bagian-email', 'subject-dan-salam'],
    desc: 'Kegunaan email di dunia kerja, bagian-bagian email, subject, serta salam pembuka dan penutup.' },
  { id: 'm2', no: '02', short: 'Materi 2', title: 'Menulis Email Lamaran Kerja', icon: 'briefcase', bagian: ['susunan-email', 'perkenalan-dan-cv', 'kesalahan-email', 'praktik-email'],
    desc: 'Susunan email lamaran, cara memperkenalkan diri, melampirkan CV, dan kesalahan yang sering terjadi.' },
  { id: 'm3', no: '03', short: 'Materi 3', title: 'Etika Berkirim Email', icon: 'send', bagian: ['cc-bcc-waktu', 'follow-up', 'bahasa-formal'],
    desc: 'Kapan pakai CC dan BCC, jam yang pas untuk mengirim, cara follow-up ke HR, dan bahasa yang sopan.' },
  { id: 'latihan', no: '04', short: 'Latihan', title: 'Latihan', icon: 'pen', bagian: ['latihan-soal', 'aktivitas-interaktif'],
    desc: '15 soal pilihan ganda dengan pembahasan, lalu tiga aktivitas interaktif.' },
  { id: 'akhir', no: '05', short: 'Evaluasi', title: 'Evaluasi & Penutup', icon: 'flag', bagian: ['awal-evaluasi', 'evaluasi-akhir', 'penutup'],
    desc: 'Cek syarat evaluasi, kerjakan evaluasi akhir, lalu penutup.' },
];
const materiOf = id => MATERI.find(m => m.bagian.includes(id));

const BAGIAN = {
  'pengantar': { title: 'Selamat Datang', type: 'Pengantar', wide: true,
    tujuan: 'Kenalan dulu dengan pelatihan ini: buat apa, dan apa saja isinya.',
    narasi: 'Halo, selamat datang di Smart Emailing. Pernah kirim lamaran kerja tapi nggak ada balasan sama sekali? Kadang masalahnya bukan di CV, tapi di email pengantarnya. Di sini kamu akan belajar menulis email lamaran yang rapi, dan cara membalas email HR tanpa canggung. Ada tiga materi: dasar komunikasi lewat email, menulis email lamaran, dan etika berkirim email. Setelah itu ada latihan soal, lalu evaluasi. Kita mulai dari yang paling dasar.' },
  'kegunaan-email': { title: 'Kegunaan Email di Dunia Kerja', type: 'Klik informasi',
    tujuan: 'Kamu bisa menjelaskan untuk apa email dipakai di dunia kerja, dan kenapa nadanya perlu tetap profesional.',
    uraian: [{ h: 'Kenapa Email Masih Penting?', p: [
      'Di kantor, email masih jadi jalur komunikasi resmi. Orang memakainya untuk menyampaikan informasi, mengirim dokumen, melamar kerja, berkoordinasi dengan rekan, sampai menghubungi klien.',
      'Beda dengan chat, email lebih formal, tersimpan rapi, dan bisa jadi bukti kalau suatu saat dibutuhkan. Makanya, bisa menulis email dengan baik itu bekal penting, apalagi buat fresh graduate yang sedang cari kerja.'] }],
    narasi: 'Di dunia kerja, email masih jadi jalur komunikasi resmi. Klik keempat ikon di layar laptop untuk melihat apa saja kegunaannya. Dibanding chat, email lebih formal, tersimpan rapi, dan bisa jadi bukti. Itu sebabnya kemampuan menulis email cukup menentukan, terutama waktu kamu baru mulai cari kerja.' },
  'bagian-email': { title: 'Bagian-Bagian Email', type: 'Seret & letakkan',
    tujuan: 'Kamu bisa mengenali bagian-bagian email profesional.',
    uraian: [{ h: 'Lima Bagian Email Profesional', p: [
      'Email profesional punya lima bagian: <b>subject</b> (judul email), <b>salam pembuka</b>, <b>isi email</b>, <b>salam penutup</b>, dan <b>tanda tangan</b>.',
      'Masing-masing punya fungsi. Subject memberi gambaran singkat soal isi email. Isi email memuat pesan utamamu, ditulis jelas dan tidak bertele-tele.'] }],
    narasi: 'Email profesional punya lima bagian. Subject memberi gambaran singkat soal isi email. Salam pembuka menunjukkan rasa hormat. Isi email memuat pesan utama. Salam penutup mengakhiri email dengan sopan, lalu ada tanda tangan di paling bawah. Coba pasang kartu-kartu ini ke tempatnya masing-masing.' },
  'subject-dan-salam': { title: 'Subject, Salam Pembuka, dan Penutup', type: 'Studi kasus + kuis',
    tujuan: 'Kamu bisa menulis subject yang jelas, dan memilih salam pembuka serta penutup yang pas.',
    uraian: [
      { h: 'Menulis Subject yang Efektif', p: [
        'Subject adalah hal pertama yang dibaca penerima. Buat singkat dan spesifik, supaya dari judulnya saja orang sudah tahu email ini soal apa.',
        `Contoh yang tepat: <q>Application for Graphic Designer Position – ${NAMA}</q>. Contoh yang kurang tepat: <q>Lamaran</q>, <q>Halo Kak</q>, atau <q>Penting</q>.`,
        'Subject yang jelas bikin emailmu lebih mungkin dibuka HR, bukan cuma lewat di kotak masuk.'] },
      { h: 'Membuka dan Menutup Email dengan Sopan', p: [
        'Salam pembuka menunjukkan rasa hormat ke penerima, misalnya <q>Yth. Tim Rekrutmen PT ABC,</q> atau <q>Dear Hiring Manager,</q>.',
        'Salam penutup mengakhiri email dengan sopan, misalnya <q>Hormat saya,</q> atau <q>Best regards,</q>, lalu tulis namamu di bawahnya. Hal kecil seperti ini menunjukkan kamu paham etika berkomunikasi.'] }],
    narasi: 'Subject adalah hal pertama yang dilihat HR. Buat singkat, spesifik, dan sesuai tujuan email. Coba bandingkan dua kotak masuk ini, mana yang lebih ingin kamu buka? Untuk pembuka, kamu bisa pakai "Yth. Tim Rekrutmen PT ABC," atau "Dear Hiring Manager,". Untuk penutup, pakai "Hormat saya," atau "Best regards," lalu tulis namamu.' },
  'susunan-email': { title: 'Susunan Email Lamaran Kerja', type: 'Klik bagian email',
    tujuan: 'Kamu bisa menjelaskan fungsi email lamaran dan menyusunnya dengan urutan yang benar.',
    uraian: [
      { h: 'Apa Itu Email Lamaran Kerja?', p: [
        'Email lamaran adalah email yang kamu kirim ke perusahaan untuk memperkenalkan diri, menyampaikan minat pada posisi tertentu, sekaligus mengirim CV dan portofolio.',
        'Email ini jadi kesan pertama. Dari sini perekrut mulai menilai apakah kamu layak dipanggil.'] },
      { h: 'Urutan Email Lamaran', p: [
        'Susun email lamaran dengan urutan berikut:',
        '<ol class="ol"><li>subject yang jelas</li><li>salam pembuka</li><li>perkenalan diri singkat</li><li>tujuan mengirim email</li><li>keterangan lampiran CV dan portofolio</li><li>salam penutup</li></ol>',
        'Tulis seperlunya saja. Perekrut membaca banyak email setiap hari, jadi yang singkat dan relevan lebih mudah diingat.'] }],
    narasi: 'Email lamaran adalah caramu memperkenalkan diri, menunjukkan minat pada posisi tertentu, dan mengirim CV serta portofolio. Ini kesan pertamamu di mata perekrut. Urutannya: subject, salam pembuka, perkenalan singkat, tujuan email, keterangan lampiran, lalu salam penutup. Klik tiap bagian untuk melihat fungsinya.' },
  'perkenalan-dan-cv': { title: 'Memperkenalkan Diri dan Mengirim CV', type: 'Simulasi',
    tujuan: 'Kamu bisa memperkenalkan diri secara profesional, dan melampirkan CV serta portofolio dengan benar.',
    uraian: [
      { h: 'Memperkenalkan Diri ke HR', p: [
        'Waktu memperkenalkan diri, cukup sebutkan nama, latar belakang pendidikan, dan posisi yang kamu lamar. Singkat saja.',
        'Cerita pribadi yang tidak berhubungan dengan pekerjaan tidak perlu dimasukkan. Lebih baik sebutkan kemampuan atau pengalaman yang mendukung posisi itu.'] },
      { h: 'Melampirkan Dokumen Pendukung', p: [
        `Lampirkan CV dan portofolio dalam format yang umum dipakai, misalnya PDF. Beri nama file yang rapi dan mudah dikenali, seperti <code>CV_${NAMAF}.pdf</code> atau <code>Portfolio_${NAMAF}.pdf</code>.`,
        'Sebelum menekan kirim, cek lagi apakah semua lampiran sudah terunggah dan bisa dibuka.'] }],
    narasi: `Waktu memperkenalkan diri, cukup sebutkan nama, latar belakang pendidikan, dan posisi yang kamu lamar. Fokus ke kemampuan yang mendukung posisi itu, cerita pribadi bisa disimpan untuk wawancara nanti. Untuk lampiran, pakai PDF dengan nama file yang rapi, misalnya CV_${NAMAF}.pdf dan Portfolio_${NAMAF}.pdf. Sebelum mengirim, cek lagi semua lampiran sudah terunggah dan bisa dibuka.` },
  'kesalahan-email': { title: 'Kesalahan yang Sering Terjadi', type: 'Temukan kesalahan', uraianAfter: true,
    tujuan: 'Kamu bisa menemukan kesalahan yang sering muncul di email lamaran.',
    uraian: [{ h: 'Hindari Kesalahan Ini', p: [
      'Beberapa kesalahan yang sering dilakukan fresh graduate: alamat email yang tidak profesional, subject yang tidak jelas, salah menulis nama perusahaan, bahasa yang terlalu santai, isi email yang kepanjangan, dan lupa melampirkan CV atau portofolio.',
      'Kelihatannya sepele, tapi kesalahan seperti ini bisa membuat lamaranmu langsung dilewati.'] }],
    narasi: 'Sekarang coba posisikan dirimu sebagai perekrut. Email di layar ini punya beberapa kesalahan. Klik bagian yang menurutmu salah.' },
  'praktik-email': { title: 'Praktik Menulis Email Lamaran', type: 'Praktik',
    tujuan: 'Kamu bisa menulis email lamaran sendiri untuk keperluan mencari kerja.',
    uraian: [{ h: 'Cara Mengerjakan', p: [
      'Isi setiap bagian email, lalu cocokkan tulisanmu dengan daftar periksa di samping.',
      'Praktik ini tidak dinilai otomatis. Setelah emailmu dikirim, bandingkan dengan contoh jawaban yang muncul.'] }],
    narasi: 'Sekarang giliran kamu yang menulis. Buat email lamaran untuk lowongan di samping, pakai susunan dan format yang sudah dipelajari tadi.' },
  'cc-bcc-waktu': { title: 'CC, BCC, dan Waktu Mengirim', type: 'Penjelasan visual + kuis',
    tujuan: 'Kamu bisa menjelaskan kapan memakai CC dan BCC, dan memilih waktu yang tepat untuk mengirim email.',
    uraian: [
      { h: 'Memakai CC dan BCC dengan Tepat', p: [
        '<b>CC</b> (<i>Carbon Copy</i>) dipakai untuk mengirim salinan email ke orang lain yang perlu tahu isinya.',
        '<b>BCC</b> (<i>Blind Carbon Copy</i>) juga mengirim salinan, tapi alamat penerimanya tidak terlihat oleh penerima lain.',
        'Pakai sesuai kebutuhan. Kalau penerimanya tidak saling kenal, BCC membantu menjaga privasi mereka.'] },
      { h: 'Kapan Sebaiknya Mengirim Email?', p: [
        'Waktu kirim ikut menentukan seberapa cepat emailmu dibaca. Kirim email profesional di jam kerja, sekitar pukul 08.00–17.00.',
        'Hindari mengirim larut malam atau saat hari libur, kecuali memang ada keperluan yang mendesak.'] }],
    narasi: 'CC atau Carbon Copy dipakai untuk mengirim salinan ke orang lain yang perlu tahu isi email. BCC atau Blind Carbon Copy juga mengirim salinan, tapi alamat penerimanya disembunyikan, jadi privasi mereka tetap terjaga. Soal waktu, kirim email di jam kerja, kira-kira jam delapan pagi sampai jam lima sore. Larut malam atau hari libur sebaiknya dihindari, kecuali memang mendesak.' },
  'follow-up': { title: 'Follow-up ke HR', type: 'Pilih langkahmu',
    tujuan: 'Kamu bisa menulis email follow-up ke HR dengan sopan.',
    uraian: [{ h: 'Menanyakan Kabar Lamaran', p: [
      'Follow-up adalah email untuk menanyakan perkembangan proses rekrutmen setelah lamaranmu terkirim. Tulis dengan sopan dan singkat, jangan sampai terkesan mendesak.',
      'Biasanya follow-up dikirim sekitar <b>5–7 hari kerja</b> setelah lamaran terkirim, kalau belum ada kabar dari perusahaan.'] }],
    narasi: 'Follow-up dipakai untuk menanyakan perkembangan lamaranmu. Tulis dengan sopan dan singkat, jangan sampai terkesan mendesak. Biasanya dikirim sekitar lima sampai tujuh hari kerja setelah lamaran terkirim, kalau belum ada kabar. Sekarang bantu Syarif memilih langkah yang tepat.' },
  'bahasa-formal': { title: 'Bahasa yang Formal dan Sopan', type: 'Pilih kalimat',
    tujuan: 'Kamu bisa memakai bahasa yang formal dan sopan di email.',
    uraian: [{ h: 'Menulis dengan Bahasa yang Profesional', p: [
      'Bahasa di email kerja sebaiknya jelas, sopan, dan mudah dipahami. Hindari bahasa gaul, singkatan yang tidak umum, emoji, dan huruf kapital yang berlebihan.',
      'Pakai kalimat yang efektif, dan cek lagi ejaan serta tata bahasanya. Pesanmu jadi lebih mudah ditangkap, dan kamu terlihat lebih serius.'] }],
    narasi: 'Bahasa di email kerja sebaiknya jelas, sopan, dan mudah dipahami. Bahasa gaul, singkatan yang tidak umum, emoji, dan huruf kapital berlebihan sebaiknya dihindari. Cek juga ejaan dan tata bahasanya. Di setiap kasus, pilih kalimat yang menurutmu paling pas.' },
  'latihan-soal': { title: 'Latihan Soal', type: 'Pilihan ganda', wide: true,
    tujuan: 'Mengecek pemahamanmu tentang ketiga materi lewat 15 soal pilihan ganda, lengkap dengan pembahasan.',
    narasi: 'Masuk ke latihan. Ada lima belas soal pilihan ganda, dan setiap kali menjawab, pembahasannya langsung muncul. Skor latihan ini juga jadi salah satu syarat untuk ikut evaluasi.' },
  'aktivitas-interaktif': { title: 'Aktivitas Interaktif', type: 'Cocokkan, susun, perbaiki', wide: true,
    tujuan: 'Berlatih lewat tiga aktivitas: mencocokkan istilah, menyusun email follow-up, dan memperbaiki kalimat.',
    narasi: 'Ada tiga aktivitas di sini. Pilih salah satu, kerjakan sampai selesai, lalu lanjut ke yang berikutnya. Ketiganya perlu diselesaikan sebelum kamu bisa ke tahap evaluasi.' },
  'awal-evaluasi': { title: 'Awal Evaluasi', type: 'Cek syarat', wide: true,
    tujuan: 'Memastikan semua syarat evaluasi sudah terpenuhi.',
    narasi: 'Sebelum mulai evaluasi, cek dulu syaratnya. Semua materi sudah selesai, skor latihan pilihan ganda sudah mencapai batas minimal, dan ketiga aktivitas interaktif sudah dikerjakan. Kalau semuanya sudah terpenuhi, evaluasi bisa dimulai.' },
  'evaluasi-akhir': { title: 'Evaluasi Akhir', type: 'Evaluasi akhir', wide: true,
    tujuan: 'Memakai semua yang sudah dipelajari untuk menyusun email lamaran yang efektif dan sopan.',
    narasi: 'Ini evaluasi akhir. Bentuk soalnya mirip dengan yang sudah kamu kerjakan di materi. Bedanya, kali ini tidak ada keterangan benar atau salah, dan tidak ada pembahasan. Nilaimu baru muncul setelah soal terakhir disimpan, jadi kerjakan pelan-pelan saja.' },
  'penutup': { title: 'Penutup', type: 'Rangkuman + masukan', wide: true,
    tujuan: 'Mengingat lagi isi pelatihan, dan memberi masukan untuk pelatihan ini.',
    narasi: 'Kamu sudah menyelesaikan pelatihan Smart Emailing. Setiap kali menulis email, ingat lima hal ini: subject yang jelas, susunan yang rapi, bahasa yang sopan, lampiran yang lengkap, dan waktu kirim yang tepat. Simpan infografis ini sebagai pegangan. Kalau sempat, isi juga masukan di bawah supaya pelatihan ini bisa lebih baik. Semoga lamaranmu cepat dapat balasan.' },
};

/* ---------- Status kunci ---------- */
const materiDone = () => MATERI_BAGIAN.every(id => state.done[id]);
const evalPassed = () => !!(state.ev && state.ev.done && state.ev.score >= KKM);
const LAT_MIN = 11; /* syarat evaluasi: latihan PG minimal 70% (11 dari 15 benar) */
const AKT_KEYS = ['a', 'b', 'c'];
const aktDone = () => AKT_KEYS.every(k => !!(state.akt && state.akt[k] && state.akt[k].done));
const latSkor = () => state.lat ? Object.values(state.lat.res || {}).filter(Boolean).length : 0;
const gateOk = () => materiDone() && latSkor() >= LAT_MIN && aktDone();
/* Kunci berurutan: setiap bagian baru terbuka setelah bagian sebelumnya selesai (dibaca + aktivitasnya dikerjakan) */
const locked = id => {
  if (id === 'awal-evaluasi') return !materiDone();
  if (id === 'evaluasi-akhir') return !gateOk();
  if (id === 'penutup') return !evalPassed();
  const i = ORDER.indexOf(id);
  return i > 0 && !state.done[ORDER[i - 1]];
};
const readAll = id => { const s = BAGIAN[id]; if (!s.uraian) return true; const r = A(id).read || []; return s.uraian.every((_, j) => r.includes(j)); };
const doneCount = () => ORDER.filter(id => state.done[id]).length;
const pct = () => Math.round(doneCount() / ORDER.length * 100);
const nextOf = id => id === 'penutup' ? null : '#/bagian/' + ORDER[ORDER.indexOf(id) + 1];
const prevOf = id => ORDER.indexOf(id) > 0 ? '#/bagian/' + ORDER[ORDER.indexOf(id) - 1] : '#/materi';
const resumeHref = () => {
  const id = ORDER.slice(0, 13).find(x => !state.done[x]);
  if (id) return '#/bagian/' + id;
  return '#/bagian/' + (!gateOk() ? 'awal-evaluasi' : !evalPassed() ? 'evaluasi-akhir' : 'penutup');
};

/* =========================================================================
   KOMPONEN BERSAMA
   ========================================================================= */
function showFb(fb, ok, msg) {
  fb.hidden = false;
  fb.className = 'fb ' + (ok === true ? 'fb-ok' : ok === false ? 'fb-no' : 'fb-info');
  fb.innerHTML = `${icon(ok === true ? 'check' : ok === false ? 'x' : 'bulb')}<span>${msg}</span>`;
}
const actHead = (ic, label, counter = '') => `<div class="act-head"><span class="act-tag">${icon(ic)} ${label}</span>${counter ? `<span class="counter">${counter}</span>` : ''}</div>`;

/* Pilihan ganda dengan umpan balik; riwayat pilihan disimpan supaya tidak mengulang */
function mcq(el, { q, opts, onDone, store, key }) {
  el.innerHTML = `${q ? `<p class="q">${q}</p>` : ''}
    <div class="opts">${opts.map((o, i) => `<button type="button" class="opt" data-i="${i}"><span class="opt-l">${'ABCD'[i]}</span><span class="opt-t">${o.t}</span></button>`).join('')}</div>
    <div class="fb" hidden></div>`;
  const fb = $('.fb', el), rec = store ? (store[key] = store[key] || []) : [];
  const pick = (i, silent) => {
    const o = opts[i], b = $(`.opt[data-i="${i}"]`, el);
    showFb(fb, !!o.ok, o.fb);
    if (o.ok) { b.classList.add('ok'); $$('.opt', el).forEach(x => (x.disabled = true)); silent || sfx('ok'); onDone && onDone(silent); }
    else { b.classList.add('no'); b.disabled = true; silent || sfx('no'); }
  };
  rec.forEach(i => pick(i, true));
  el.onclick = e => {
    const b = e.target.closest('.opt'); if (!b || b.disabled) return;
    rec.push(+b.dataset.i); save(); pick(+b.dataset.i, false);
  };
}

/* =========================================================================
   NAVIGASI SAMPING (halaman bagian, latihan, evaluasi)
   ========================================================================= */
/* Rute belajar: jalur bagian pengantar–penutup di atas halaman (pengganti sidebar) */
function routeRail(cur) {
  const groups = MATERI.map(m => [m.short, m.bagian]);
  const isDone = id => !!state.done[id];
  const isLock = locked;
  const total = ORDER.length, n = doneCount(), p = Math.round(n / total * 100);
  const res = resumeHref(), resId = (res.split('/').pop() || '');
  let prevFull = true, k = 0;
  const grp = ([label, ids]) => {
    const d = ids.filter(isDone).length, full = d === ids.length, anyOpen = ids.some(id => !isLock(id));
    /* garis terisi sampai titik pertama yang belum selesai di kelompok yang sedang berjalan */
    const fill = full ? 100 : (d || prevFull) && anyOpen ? (d + .5) / ids.length * 100 : 0;
    prevFull = full;
    const st = full ? 'full' : anyOpen ? 'go' : 'lock';
    return `<div class="r2-grp ${st}" style="--n:${ids.length}">
      <div class="r2-gh"><b>${label}</b><span>${full ? icon('check') : st === 'lock' ? icon('lock') : ''}${d}/${ids.length}</span></div>
      <div class="r2-stops" style="--fill:${fill.toFixed(1)}%">${ids.map(id => {
        const dn = isDone(id), lk = isLock(id), c = id === cur;
        const cls = c ? 'cur' : dn ? 'done' : lk ? 'locked' : 'open';
        const t = BAGIAN[id].title;
        return `<a class="r2-stop ${cls} ${dn ? 'is-done' : ''}" style="--i:${k++}" href="#/bagian/${id}" data-peek="${id}" aria-label="${t}${dn ? ' (selesai)' : lk ? ' (terkunci)' : ''}"${c ? ' aria-current="step"' : ''}>
          <span class="r2-dot">${dn && !c ? icon('check') : lk ? icon('lock') : icon((materiOf(id) || {}).icon || 'book')}</span>
          <span class="r2-lbl">${c ? 'Di sini' : ''}</span></a>`;
      }).join('')}</div></div>`;
  };
  return `<nav class="rail r2" aria-label="Rute belajar">
    <div class="r2-head">
      <span class="rail-ic">${icon('map')}</span>
      <div class="r2-tt"><b>Rute Belajar</b><small><b>${n}</b> dari ${total} bagian selesai</small></div>
      <div class="r2-prog" title="${p}% selesai"><span class="r2-bar"><i style="width:${p}%"></i></span><b>${p}%</b></div>
      <div class="r2-act">${resId && resId !== cur && !isLock(resId) ? `<a class="r2-go" href="${res}">${icon('right')} Lanjutkan belajar</a>` : ''}<a class="rail-all" href="#/materi">${icon('grid')}<span>Semua materi</span></a></div>
    </div>
    <div class="r2-track">${groups.map(grp).join('')}</div>
  </nav>`;
}

/* Mini preview saat kursor/fokus berada di bagian pada Rute Belajar dan daftar materi.
   Ditempel di <body> dengan posisi fixed supaya tidak terpotong oleh wadah yang bisa digulir */
const PEEK_TEKS = {
  'pengantar': 'Kenalan dulu dengan pelatihannya: mau belajar apa saja dan urutannya seperti apa.',
  'kegunaan-email': 'Kenapa email masih jadi andalan di kantor, dan kenapa nadanya harus tetap profesional.',
  'bagian-email': 'Kenali bagian email satu per satu, dari subject sampai tanda tangan.',
  'subject-dan-salam': 'Cara menulis subject yang bikin email dibuka, plus salam pembuka dan penutup yang pas.',
  'susunan-email': 'Lihat kerangka email lamaran yang rapi, lalu pahami fungsi tiap bagiannya.',
  'perkenalan-dan-cv': 'Latihan memperkenalkan diri dengan singkat dan melampirkan CV serta portofolio tanpa salah.',
  'kesalahan-email': 'Cari kesalahan kecil yang sering membuat lamaran dilewati HR.',
  'praktik-email': 'Tulis email lamaranmu sendiri sampai siap dikirim.',
  'cc-bcc-waktu': 'Kapan pakai CC, kapan BCC, dan jam berapa email sebaiknya dikirim.',
  'follow-up': 'Belum ada kabar dari HR? Di sini dibahas cara menanyakannya dengan sopan.',
  'bahasa-formal': 'Ubah kalimat santai jadi formal dan sopan, tanpa terdengar kaku.',
  'latihan-soal': '15 soal pilihan ganda dari ketiga materi. Pembahasannya langsung muncul setiap kali menjawab.',
  'aktivitas-interaktif': 'Tiga aktivitas bareng Salsa Rahma: cocokkan istilah, susun email follow-up, dan perbaiki kalimat.',
  'awal-evaluasi': 'Cek tiga syarat sebelum evaluasi: materi selesai, latihan minimal 70% benar, dan ketiga aktivitas interaktif sudah dikerjakan.',
  'evaluasi-akhir': 'Empat soal akhir tanpa tanda benar atau salah. Nilainya baru keluar di akhir.',
  'penutup': 'Rangkuman satu halaman yang bisa disimpan, ditambah tempat untuk memberi masukan.',
};
const peekInfo = id => {
  const s = BAGIAN[id], m = materiOf(id), i = ORDER.indexOf(id);
  const why = id === 'awal-evaluasi' ? 'Selesaikan semua bagian materi dulu.' : id === 'evaluasi-akhir' ? 'Penuhi tiga syarat di Awal Evaluasi dulu.' : id === 'penutup' ? `Lulus evaluasi dulu (nilai minimal ${KKM}).` : i < 1 ? '' : `Selesaikan ${BAGIAN[ORDER[i - 1]].title} dulu.`;
  return { grp: m ? m.short : '', title: s.title, type: s.type, desc: PEEK_TEKS[id] || s.tujuan, st: state.done[id] ? 'done' : locked(id) ? 'lock' : 'open', why };
};
(() => {
  const el = document.createElement('div');
  el.className = 'peek'; el.setAttribute('role', 'tooltip'); el.id = 'peek';
  document.body.appendChild(el);
  let cur = null;
  const hide = () => { cur = null; el.classList.remove('show'); };
  const show = t => {
    const p = peekInfo(t.dataset.peek); if (!p) return;
    cur = t;
    el.innerHTML = `<div class="pk-top"><small>${p.grp}</small><span class="pk-st ${p.st}">${icon(p.st === 'done' ? 'check' : p.st === 'lock' ? 'lock' : 'right')}${p.st === 'done' ? 'Selesai' : p.st === 'lock' ? 'Terkunci' : 'Bisa dibuka'}</span></div>
      <b class="pk-t">${p.title}</b><small class="pk-type">${icon('pointer')} ${p.type}</small>
      <p class="pk-d">${p.desc}</p>${p.st === 'lock' ? `<div class="pk-why">${icon('lock')} ${p.why}</div>` : ''}`;
    el.classList.add('show');
    const r = t.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, gap = 10, pad = 8;
    let x = r.left + r.width / 2 - w / 2;
    x = Math.max(pad, Math.min(x, innerWidth - w - pad));
    let y = r.bottom + gap, below = true;
    if (y + h > innerHeight - pad) { y = r.top - gap - h; below = false; }
    if (y < pad) { y = pad; }
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.setProperty('--ax', Math.max(14, Math.min(w - 14, r.left + r.width / 2 - x)) + 'px');
    el.classList.toggle('up', !below);
  };
  document.addEventListener('mouseover', e => { if (matchMedia('(hover: none)').matches) return; const t = e.target.closest('[data-peek]'); if (t && t !== cur) show(t); else if (!t && cur) hide(); });
  document.addEventListener('focusin', e => { const t = e.target.closest('[data-peek]'); if (t) show(t); else hide(); });
  document.addEventListener('focusout', e => { if (e.target.closest('[data-peek]')) hide(); });
  addEventListener('scroll', hide, true); addEventListener('hashchange', hide); addEventListener('resize', hide);
})();

/* =========================================================================
   BERANDA
   ========================================================================= */
/* =========================================================================
   KATALOG MATERI
   ========================================================================= */
function viewMateri() {
  const row = id => { const lk = locked(id), d = state.done[id]; return `<a class="srow ${d ? 'done' : ''} ${lk ? 'locked' : ''}" href="#/bagian/${id}" data-peek="${id}"><span class="srow-st">${d ? icon('check') : lk ? icon('lock') : icon('book')}</span><span class="srow-t"><b>${BAGIAN[id].title}</b><small>${BAGIAN[id].type}</small></span>${icon('right')}</a>`; };
  return `<div class="page wrap">
    <header class="page-head"><h1 class="display">Materi</h1><p class="lead-s">Kerjakan berurutan dari atas. Bagian berikutnya terbuka setelah kartu materinya dibaca dan aktivitasnya selesai.</p>
      <div class="page-prog"><span class="bar"><i style="width:${pct()}%"></i></span><b>${pct()}%</b><small>${doneCount()}/13 bagian selesai</small></div></header>
    <div class="cat">${MATERI.map(m => `<article class="cat-card">
      <header><span class="cat-no" aria-hidden="true">${m.no}</span><div><small>${m.short}</small><h2>${m.title}</h2>${m.desc ? `<p>${m.desc}</p>` : ''}</div><span class="cat-p">${m.bagian.filter(id => state.done[id]).length}/${m.bagian.length}</span></header>
      <div class="cat-list">${m.bagian.map(row).join('')}</div>
    </article>`).join('')}</div>
  </div>`;
}

/* =========================================================================
   HALAMAN Bagian (gaya halaman pelajaran)
   ========================================================================= */
const uraianSections = s => s.uraian.map((u, i) => `<section class="u-sec" id="u${i}"><h2 class="sec-title">${u.h}</h2>${u.p.map(p => p.startsWith('<ol') ? p : `<p>${p}</p>`).join('')}</section>`).join('');
const uraianHTML = uraianSections;

const ACT_HEAD = {
  _: ['pointer', 'Aktivitas', 'Coba sendiri'],
  'pengantar': ['inbox', 'Pengantar', 'Sebelum mulai'],
  'latihan-soal': ['pen', 'Latihan soal', 'Jawab dan baca pembahasannya'],
  'aktivitas-interaktif': ['grid', 'Aktivitas interaktif', 'Pilih aktivitasnya'],
  'awal-evaluasi': ['list', 'Awal evaluasi', 'Cek syarat evaluasi'],
  'evaluasi-akhir': ['flag', 'Evaluasi akhir', 'Kerjakan evaluasinya'],
  'penutup': ['award', 'Penutup', 'Rangkuman pelatihan'],
};
function viewBagian(id) {
  const s = BAGIAN[id], m = materiOf(id), i = ORDER.indexOf(id);
  const text = (s.uraian || []).map(u => u.p.join(' ')).join(' ').replace(/<[^>]+>/g, '');
  const mins = Math.max(1, Math.round(text.split(/\s+/).length / 170));
  if (id === 'awal-evaluasi' || id === 'evaluasi-akhir') return `<div class="lesson-wide wrap evx"><section id="aktivitas"><div id="activity" class="evx-act"></div></section><nav class="lesson-nav evx-nav">${lessonNav(id)}</nav></div>`;
  return `<div class="lesson-wide wrap">
    <article class="sheet mail-view">
      <div class="mv-bar">
        <a class="mv-btn" href="#/materi" title="Semua materi">${icon('left')}<span>Materi</span></a>
        <span class="mv-prog" role="progressbar" aria-label="Posisi belajar" aria-valuemin="1" aria-valuemax="${ORDER.length}" aria-valuenow="${i + 1}" title="${s.title}"><i style="width:${(i + 1) / ORDER.length * 100}%"></i></span>
      </div>
      <header class="mv-head">
        <span class="mv-av" data-to="#/" title="Beranda">${LOGO}</span>
        <div class="mv-meta">
          
          <h1 class="display">${s.title}</h1>
          <div class="mv-labels"><span class="lbl" data-to="#/materi" title="Semua materi">${m.short}</span><span class="lbl soft" data-to="aktivitas" title="Ke aktivitas">${icon('pointer')} ${s.type}</span><small class="mv-dur">± ${mins} menit</small></div>
        </div>
      </header>
      <div class="pin-note"><span class="pin" data-to="#/tujuan" title="Semua tujuan belajar"></span><b>Tujuan</b><p>${s.tujuan}</p></div>
      ${s.uraian ? `<section class="stepper" id="uraian"></section>` : ''}
      <section class="act-sec" id="aktivitas"><div class="act-label"><span class="act-num" data-to="aktivitas" title="Ke aktivitas">${icon((ACT_HEAD[id] || ACT_HEAD._)[0])}</span><div><small>${(ACT_HEAD[id] || ACT_HEAD._)[1]}</small><h2 class="sec-title">${(ACT_HEAD[id] || ACT_HEAD._)[2]}</h2></div></div><div class="act-card" id="activity"></div></section>
      <nav class="lesson-nav">${lessonNav(id)}</nav>
    </article>
  </div>`;
}

/* Materi dibaca per kartu; posisi kartu disimpan */
function renderSteps(id) {
  const box = $('#uraian'); if (!box) return;
  const s = BAGIAN[id], st = A(id);
  if (s.uraianAfter && !state.done[id] && !st.actOk) {
    box.innerHTML = `<div class="step-card locked">${icon('eyeoff')}<div><b>Nanti dulu, ya</b><p>Penjelasan ini sengaja disembunyikan supaya jawabannya tidak bocor. Temukan semua kesalahan di aktivitas bawah, nanti penjelasannya terbuka sendiri.</p><button type="button" class="btn btn-primary btn-sm" data-go-act>Ke aktivitas ${icon('down')}</button></div></div>`;
    return;
  }
  const n = s.uraian.length, k = Math.min(st.step || 0, n - 1);
  const u = s.uraian[k];
  st.read = st.read || []; if (!st.read.includes(k)) { st.read.push(k); save(); }
  const nRead = s.uraian.filter((_, j) => st.read.includes(j)).length;
  box.innerHTML = `<div class="step-tabs" role="tablist">${s.uraian.map((x, j) => `<button type="button" role="tab" class="st-tab ${j === k ? 'cur' : ''} ${j < k ? 'past' : ''} ${st.read.includes(j) ? 'read' : ''}" data-step="${j}" aria-selected="${j === k}"><span>${st.read.includes(j) && j !== k ? icon('check') : j + 1}</span>${x.h}</button>`).join('')}</div>
    <div class="step-card" key="${k}">${n > 1 ? `<small class="sc-k">Bagian ${k + 1} dari ${n} · ${nRead === n ? 'semua bagian sudah dibaca' : `dibaca ${nRead}/${n}`}</small>` : ''}<h2 class="sec-title">${u.h}</h2>${u.p.map(p => p.startsWith('<ol') ? p : `<p>${p}</p>`).join('')}</div>
    <div class="step-nav">
      <button type="button" class="btn btn-outline btn-sm" data-step="${k - 1}" ${k === 0 ? 'disabled' : ''}>${icon('left')} Sebelumnya</button>
      <span class="st-dots">${s.uraian.map((_, j) => `<i class="${j === k ? 'cur' : j < k ? 'past' : ''}"></i>`).join('')}</span>
      ${k < n - 1 ? `<button type="button" class="btn btn-primary btn-sm" data-step="${k + 1}">Berikutnya ${icon('right')}</button>` : `<button type="button" class="btn btn-gold btn-sm" data-go-act>Kerjakan aktivitas ${icon('down')}</button>`}
    </div>`;
}

function lessonNav(id) {
  const nx = nextOf(id);
  const label = { 'bahasa-formal': 'Ke latihan soal', 'latihan-soal': 'Ke aktivitas interaktif', 'aktivitas-interaktif': 'Ke awal evaluasi', 'awal-evaluasi': 'Mulai evaluasi', 'evaluasi-akhir': 'Ke penutup' }[id] || 'Lanjut';
  return `<a class="btn btn-outline" href="${prevOf(id)}">${icon('left')} Sebelumnya</a>
    ${nx ? `<a class="btn btn-primary ${state.done[id] ? '' : 'is-locked'}" id="nextBtn" href="${nx}">${label} ${icon('right')}</a>` : id === 'penutup' ? `<a class="btn btn-primary" href="#/">Selesai ${icon('check')}</a>` : ''}`;
}

function mountBagian(id) {
  const btn = $('#nextBtn');
  if (btn) btn.addEventListener('click', e => {
    if (!btn.classList.contains('is-locked')) return;
    e.preventDefault();
    const tahap = { 'latihan-soal': 'Jawab semua 15 soal latihan dulu, ya.', 'aktivitas-interaktif': 'Kerjakan ketiga aktivitas interaktif dulu, ya.', 'awal-evaluasi': 'Syarat evaluasi belum terpenuhi semua.', 'evaluasi-akhir': `Nilai evaluasi minimal ${KKM} untuk membuka penutup.` }[id];
    if (tahap) { toast(tahap); $('#aktivitas').scrollIntoView({ behavior: 'smooth' }); return; }
    const st = A(id), baca = !readAll(id);
    if (baca && st.actOk) { toast('Aktivitasnya sudah selesai. Tinggal baca kartu materi yang belum dibuka.'); $('#uraian').scrollIntoView({ behavior: 'smooth' }); }
    else { toast(baca ? 'Baca semua bagian materi dan selesaikan aktivitasnya dulu, ya.' : 'Selesaikan aktivitas di halaman ini dulu, ya.'); $(baca ? '#uraian' : '#aktivitas').scrollIntoView({ behavior: 'smooth' }); }
  });
  renderSteps(id);
  const ur = $('#uraian');
  if (ur) ur.addEventListener('click', e => {
    const g = e.target.closest('[data-go-act]'); if (g) { $('#aktivitas').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const b = e.target.closest('[data-step]'); if (!b || b.disabled) return;
    A(id).step = Math.max(0, +b.dataset.step); save(); sfx(); renderSteps(id); finish(false);
  });
  /* Bagian selesai = aktivitas beres + semua kartu materi sudah dibuka */
  const finish = silent => {
    if (state.done[id] || !A(id).actOk || !readAll(id)) return;
    const freshDone = true;
    state.done[id] = true; save(); updateBar(); logAct('done', id);
    if (btn) { btn.classList.remove('is-locked'); if (freshDone && !silent) btn.classList.add('glow'); }
    const rail = $('.rail'); if (rail) rail.outerHTML = routeRail(id);
    const nx = ORDER[ORDER.indexOf(id) + 1];
    if (freshDone && !silent && nx && MATERI_BAGIAN.includes(nx)) toast(`${BAGIAN[nx].title} sekarang sudah terbuka.`);
  };
  const done = silent => {
    const st = A(id), first = !st.actOk;
    st.actOk = true; save();
    if (BAGIAN[id].uraianAfter) renderSteps(id);
    if (state.done[id]) { if (btn) btn.classList.remove('is-locked'); return; }
    if (readAll(id)) finish(silent);
    else if (first && !silent) { sfx('ok'); toast('Aktivitas selesai. Bagian berikutnya terbuka setelah semua kartu materi dibaca.'); }
  };
  ACT[id]($('#activity'), done, A(id));
  if (MATERI_BAGIAN.includes(id)) hintCoach(id);
}

/* =========================================================================
   HINT ALA GAME — muncul kalau peserta diam terlalu lama di bagian materi,
   isinya menyesuaikan langkah yang masih kurang untuk membuka bagian berikutnya
   ========================================================================= */
const HINT_AKT = {
  'kegunaan-email': 'Klik setiap kotak informasi sampai semuanya terbuka.',
  'bagian-email': 'Seret setiap kartu ke bagian email yang cocok. Di HP: ketuk kartunya, lalu ketuk slotnya.',
  'subject-dan-salam': 'Baca studi kasusnya, lalu jawab pertanyaan kuisnya.',
  'susunan-email': 'Klik setiap bagian email untuk melihat penjelasannya.',
  'perkenalan-dan-cv': 'Ikuti simulasinya sampai emailnya siap dikirim.',
  'kesalahan-email': 'Klik bagian email yang menurutmu salah sampai semua kesalahannya ketemu.',
  'praktik-email': 'Isi form email lamarannya, lalu cocokkan dengan daftar periksa.',
  'cc-bcc-waktu': 'Atur jam kirim yang tepat dan jawab kuisnya.',
  'follow-up': 'Pilih langkah yang paling tepat di setiap situasi.',
  'bahasa-formal': 'Pilih kalimat yang paling formal dan sopan.',
};
function hintFor(id) {
  const s = BAGIAN[id], st = A(id), nx = ORDER[ORDER.indexOf(id) + 1];
  const sisa = s.uraian ? s.uraian.length - s.uraian.filter((_, j) => (st.read || []).includes(j)).length : 0;
  if (state.done[id]) return { t: `Bagian ini sudah selesai. Klik <b>Lanjut</b> untuk membuka ${nx === 'latihan-soal' ? 'langkah berikutnya' : 'bagian ' + BAGIAN[nx].title}.`, to: '#nextBtn' };
  if (!st.actOk && (readAll(id) || s.uraianAfter)) return { t: `${readAll(id) ? 'Semua kartu materi sudah kamu baca. ' : ''}Tinggal aktivitas di bawah: ${HINT_AKT[id] || 'selesaikan aktivitasnya.'}`, to: '#activity' };
  if (!st.actOk) return { t: `Masih ada <b>${sisa} kartu materi</b> yang belum dibaca. Klik <b>Berikutnya</b> di kartu materi, setelah itu kerjakan aktivitasnya.`, to: '#uraian .st-tab:not(.read)' };
  return { t: `Tinggal satu langkah lagi: buka <b>${sisa} kartu materi</b> yang belum dibaca supaya bagian berikutnya terbuka.`, to: '#uraian .st-tab:not(.read)' };
}
function hintCoach(id) {
  const FIRST = 30000, NEXT = 60000;
  let timer = 0, wait = FIRST, box = null, last = 0;
  const close = () => { if (!box) return; const b = box; box = null; b.classList.remove('show'); setTimeout(() => b.remove(), 300); };
  const arm = () => { clearTimeout(timer); timer = setTimeout(pop, wait); };
  const pop = () => {
    if (document.hidden || !document.body.contains($('#activity'))) { arm(); return; }
    const h = hintFor(id);
    close();
    box = document.createElement('div');
    box.className = 'hint'; box.setAttribute('role', 'status');
    box.innerHTML = `<span class="hint-ic">${icon('bulb')}</span>
      <div class="hint-b"><small>Petunjuk</small><p>${h.t}</p>
        <div class="hint-btns"><button type="button" class="btn btn-gold btn-sm" data-show>${icon('pointer')} Tunjukkan</button><button type="button" class="hint-x" data-x aria-label="Tutup petunjuk">Nanti saja</button></div></div>`;
    document.body.appendChild(box); sfx('hint');
    requestAnimationFrame(() => box && box.classList.add('show'));
    box.onclick = e => {
      if (e.target.closest('[data-show]')) {
        const t = $(h.to);
        if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.remove('hint-spot'); void t.offsetWidth; t.classList.add('hint-spot'); setTimeout(() => t.classList.remove('hint-spot'), 2600); }
        sfx(); close(); wait = NEXT; arm();
      } else if (e.target.closest('[data-x]')) { close(); wait = NEXT; arm(); }
    };
  };
  /* setiap gerakan peserta dianggap aktif: hitungan diam diulang dari nol */
  const busy = e => {
    if (box && box.contains(e.target)) return;
    const now = Date.now(); if (e.type === 'scroll' && now - last < 400) return; last = now;
    if (box) { close(); wait = NEXT; }
    arm();
  };
  const evs = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  evs.forEach(ev => addEventListener(ev, busy, { passive: true, capture: true }));
  arm();
  onLeave(() => { clearTimeout(timer); evs.forEach(ev => removeEventListener(ev, busy, { capture: true })); close(); });
}

/* =========================================================================
   AKTIVITAS PER Bagian — setiap hasil disimpan di state.act[id]
   ========================================================================= */
const ACT = {};

/* pengantar — pengantar: masalah yang sering terjadi + peta materi */
ACT['pengantar'] = (el, done, st) => {
  el.innerHTML = `<div class="intro1">
    <div class="i1-case">
      <p class="i1-q">Pernah kirim lamaran kerja tapi nggak ada balasan? Kadang masalahnya bukan di CV, tapi di email pengantarnya.</p>
      <div class="i1-mails">
        <div class="i1-mail bad"><span class="i1-tag">${icon('x')} Sebelum</span><b>syarif.keren99</b><span>lamaran!!! <em>halo kak aku mau ngelamar nih…</em></span></div>
        <div class="i1-mail good"><span class="i1-tag">${icon('check')} Sesudah</span><b>${NAMA}</b><span>Application for Graphic Designer Position – ${NAMA}</span></div>
      </div>
      <p class="muted">Di sini kamu belajar menulis email lamaran yang rapi, dan cara membalas email HR tanpa canggung.</p>
    </div>
    <div class="i1-map">
      <h3>Isinya ada tiga</h3>
      <ol>${MATERI.filter(m => /^m\d$/.test(m.id)).map(m => `<li><a href="#/bagian/${m.bagian[0]}"><span>${m.no}</span>${m.title}</a></li>`).join('')}</ol>
      <div class="i1-post">${icon('pen')} Setelah itu ada latihan soal dan aktivitas interaktif, lalu evaluasi.</div>
      <button type="button" class="btn btn-primary" data-ready>${icon('check')} Oke, aku siap</button>
    </div>
  </div>`;
  const ready = $('[data-ready]', el);
  const finish = silent => { st.ok = true; save(); ready.innerHTML = `${icon('check')} Sip. Tekan Lanjut di bawah`; ready.disabled = true; done(silent); };
  ready.onclick = () => { sfx('ok'); finish(false); };
  if (st.ok || st.played) finish(true);
};

/* kegunaan-email — klik 4 ikon di laptop */
ACT['kegunaan-email'] = (el, done, st) => {
  const items = [['megaphone', 'Menyampaikan informasi', 'Untuk pengumuman atau pesan resmi.'], ['file', 'Mengirim dokumen', 'Untuk mengirim CV, laporan, dan file lainnya.'], ['briefcase', 'Melamar kerja', 'Untuk memperkenalkan diri kepada perusahaan.'], ['users', 'Berkoordinasi', 'Untuk berkomunikasi dengan rekan kerja dan klien.']];
  st.seen = st.seen || [];
  el.innerHTML = `${actHead('pointer', 'Klik informasi', 'Dibuka <b>0</b> dari 4')}
  <div class="laptop-info">
    <div class="laptop"><div class="lscreen"><div class="lbar"><i></i><i></i><i></i><span>Email di dunia kerja</span></div>
      <div class="lgrid">${items.map(([ic, t], i) => `<button type="button" class="lico" data-i="${i}"><span class="lico-c">${icon(ic)}<span class="lico-ck">${icon('check')}</span></span><span>${t}</span></button>`).join('')}</div></div><div class="lbase"></div></div>
    <div class="info-panel" aria-live="polite"><div class="ip-empty">${icon('pointer')}<p>Klik salah satu ikon di layar laptop.</p></div></div>
  </div>
  <div class="compare" hidden><b>Dibanding aplikasi chat, email itu…</b><div class="cmp-chips"><span>${icon('briefcase')} lebih formal</span><span>${icon('file')} tersimpan rapi</span><span>${icon('shield')} bisa jadi bukti komunikasi</span></div></div>`;
  const panel = $('.info-panel', el);
  const open = (i, silent) => {
    const [ic, t, d] = items[i], b = $(`.lico[data-i="${i}"]`, el);
    $$('.lico', el).forEach(x => x.classList.toggle('active', x === b)); b.classList.add('seen');
    if (!st.seen.includes(i)) { st.seen.push(i); save(); }
    panel.innerHTML = `<div class="ip-card"><span class="ip-ic">${icon(ic)}</span><h4>${t}</h4><p>${d}</p></div>`;
    $('.counter b', el).textContent = st.seen.length;
    if (st.seen.length === 4) { $('.compare', el).hidden = false; done(silent); }
    silent || sfx();
  };
  st.seen.slice().forEach(i => open(i, true));
  el.onclick = e => { const b = e.target.closest('.lico'); if (b) open(+b.dataset.i, false); };
};

/* bagian-email — seret & letakkan 5 bagian email */
ACT['bagian-email'] = (el, done, st) => {
  const parts = [['subject', 'Subject', 'Menjelaskan isi email secara singkat.'], ['greeting', 'Salam pembuka', 'Menunjukkan rasa hormat.'], ['body', 'Isi email', 'Memuat pesan utama, jelas dan ringkas.'], ['closing', 'Salam penutup', 'Mengakhiri email dengan sopan.'], ['signature', 'Tanda tangan', 'Nama pengirim, setelah salam penutup.']];
  st.placed = st.placed || [];
  let selected = null;
  const build = () => {
    const left = parts.filter(p => !st.placed.includes(p[0])).map(p => p[0]);
    const order = st.order && st.order.length ? st.order.filter(k => left.includes(k)) : shuffle(left.slice());
    if (!st.order) { st.order = order.slice(); save(); }
    el.innerHTML = `${actHead('grip', 'Seret & letakkan', `Terpasang <b>${st.placed.length}</b> dari 5`)}
    <p class="hint">Seret kartu ke slot yang pas. Di HP: ketuk kartu, lalu ketuk slotnya.</p>
    <div class="dnd">
      <div class="dcards">${order.map(k => `<button type="button" class="dcard" draggable="true" data-k="${k}">${icon('grip')}<span>${parts.find(p => p[0] === k)[1]}</span></button>`).join('')}</div>
      <div class="mframe"><div class="mf-top"><i></i><i></i><i></i><span>Pesan baru</span></div>
        ${parts.map(([k, t, d], i) => st.placed.includes(k)
          ? `<div class="slot slot-${k} filled" data-i="${i}"><span class="slot-n">${icon('check')}</span><span class="slot-txt"><b>${t}</b><small>${d}</small></span></div>`
          : `<div class="slot slot-${k}" data-i="${i}" tabindex="0" role="button" aria-label="Slot ${i + 1}"><span class="slot-n">${i + 1}</span><span class="ghost"><i></i><i></i><i></i></span></div>`).join('')}
      </div>
    </div>
    <div class="fb" hidden></div>
    ${st.placed.length ? `<button type="button" class="btn btn-outline btn-sm" data-reset>${icon('refresh')} Ulangi dari awal</button>` : ''}`;
    if (st.placed.length === 5) { showFb($('.fb', el), true, 'Urutannya sudah benar. Email dengan susunan seperti ini enak dibaca HR.'); }
  };
  const tryPlace = (k, slot) => {
    if (!slot || slot.classList.contains('filled')) return;
    const i = +slot.dataset.i;
    if (parts[i][0] === k) {
      st.placed.push(k); save(); sfx('ok'); build();
      if (st.placed.length === 5) done(false); else showFb($('.fb', el), true, `Benar, slot ${i + 1} adalah ${parts[i][1].toLowerCase()}.`);
    } else {
      sfx('no'); slot.classList.remove('shake'); void slot.offsetWidth; slot.classList.add('shake');
      $$('.dcard', el).forEach(c => c.classList.remove('sel')); selected = null;
      showFb($('.fb', el), false, 'Belum pas. Ingat lagi, bagian mana yang pertama kali dilihat penerima?');
    }
  };
  build();
  if (st.placed.length === 5) done(true);
  el.addEventListener('click', e => {
    if (e.target.closest('[data-reset]')) { st.placed = []; st.order = null; save(); build(); return; }
    const c = e.target.closest('.dcard');
    if (c) { const on = !c.classList.contains('sel'); $$('.dcard', el).forEach(x => x.classList.remove('sel')); c.classList.toggle('sel', on); selected = on ? c.dataset.k : null; sfx(); return; }
    const s = e.target.closest('.slot');
    if (s && selected) tryPlace(selected, s); else if (s && !s.classList.contains('filled')) toast('Pilih kartunya dulu, lalu ketuk slotnya.');
  });
  el.addEventListener('keydown', e => { const s = e.target.closest('.slot'); if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); s.click(); } });
  el.addEventListener('dragstart', e => { const c = e.target.closest('.dcard'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.k); c.classList.add('dragging'); } });
  el.addEventListener('dragend', e => { const c = e.target.closest('.dcard'); c && c.classList.remove('dragging'); });
  el.addEventListener('dragover', e => { const s = e.target.closest('.slot'); if (s && !s.classList.contains('filled')) { e.preventDefault(); s.classList.add('over'); } });
  el.addEventListener('dragleave', e => { const s = e.target.closest('.slot'); s && s.classList.remove('over'); });
  el.addEventListener('drop', e => { const s = e.target.closest('.slot'); if (s) { e.preventDefault(); s.classList.remove('over'); tryPlace(e.dataTransfer.getData('text/plain'), s); } });
};

/* subject-dan-salam — bandingkan kotak masuk + kuis subject */
ACT['subject-dan-salam'] = (el, done, st) => {
  const row = (s, g) => `<div class="cmp-row ${g ? 'good' : ''}"><span class="iav">${g ? 'SU' : ''}</span><span>${s}</span></div>`;
  el.innerHTML = `${actHead('search', 'Studi kasus')}
  <div class="ibx-compare">
    <div class="ibx bad"><div class="ibx-h">${icon('x')} Kurang tepat</div>${['Lamaran', 'Halo Kak', 'Penting'].map(s => row(s)).join('')}</div>
    <div class="ibx good"><div class="ibx-h">${icon('check')} Tepat</div>${row(`Application for Graphic Designer Position – ${NAMA}`, true)}<p class="ibx-note">Singkat, jelas, spesifik, dan sesuai tujuan email.</p></div>
  </div>
  <div class="salam-grid">
    <div class="salam"><h4>Salam pembuka</h4><div class="code">Yth. Tim Rekrutmen PT ABC,</div><div class="code">Dear Hiring Manager,</div></div>
    <div class="salam"><h4>Salam penutup</h4><div class="code">Hormat saya,<br>${NAMA}</div><div class="code">Best regards,<br>${NAMA}</div></div>
  </div>
  <div class="quiz-box">${actHead('help', 'Kuis')}<div class="mcq"></div></div>`;
  mcq($('.mcq', el), { store: st, key: 'q', onDone: done, q: 'Kamu mau melamar posisi Marketing Staff. Subject mana yang paling pas?', opts: [
    { t: 'Lamaran', fb: 'Kurang pas. Subject ini terlalu umum, HR tidak tahu posisi apa yang kamu lamar.' },
    { t: 'Penting!!', fb: 'Kurang pas. Tidak spesifik, dan tanda serunya terkesan tidak formal.' },
    { t: 'Application for Marketing Staff – Nama Kamu', ok: true, fb: 'Tepat. Dari subject ini saja HR langsung tahu posisi yang kamu lamar.' },
    { t: 'Halo Kak', fb: 'Kurang pas. Ini sapaan santai, bukan subject, dan tidak menjelaskan isi email.' }] });
};

/* susunan-email — hotspot email lamaran */
ACT['susunan-email'] = (el, done, st) => {
  const hs = [['Subject yang jelas', 'Bagian pertama yang dilihat perekrut. Tulis posisi yang dilamar, lalu namamu.'], ['Salam pembuka', 'Menunjukkan rasa hormat kepada penerima.'], ['Perkenalan diri singkat', 'Sebutkan nama dan latar belakang pendidikan secara singkat.'], ['Tujuan mengirim email', 'Sampaikan posisi yang kamu lamar.'], ['Keterangan lampiran', 'Sebutkan CV dan portofolio yang dilampirkan dalam format PDF.'], ['Salam penutup', 'Akhiri email dengan sopan, lalu tulis namamu.']];
  st.seen = st.seen || [];
  el.innerHTML = `${actHead('pointer', 'Klik bagian email', 'Dibuka <b>0</b> dari 6')}
  <div class="hs-wrap">
    <div class="mail">
      <div class="mail-meta"><span>Kepada</span>Tim Rekrutmen PT ABC</div>
      <button type="button" class="hs hs-subject" data-i="0"><span class="hs-dot">1</span><span><small>Subject</small>Application for Graphic Designer Position – ${NAMA}</span></button>
      <div class="mail-body">
        <button type="button" class="hs" data-i="1"><span class="hs-dot">2</span><span>Yth. Tim Rekrutmen PT ABC,</span></button>
        <button type="button" class="hs" data-i="2"><span class="hs-dot">3</span><span>Saya ${NAMA}, lulusan S1 Desain Komunikasi Visual.</span></button>
        <button type="button" class="hs" data-i="3"><span class="hs-dot">4</span><span>Melalui email ini, saya bermaksud melamar posisi Graphic Designer di PT ABC.</span></button>
        <button type="button" class="hs" data-i="4"><span class="hs-dot">5</span><span>Bersama email ini saya lampirkan CV dan portofolio saya sebagai bahan pertimbangan.<span class="attach-row"><span class="attach">${icon('clip')} CV_${NAMAF}.pdf</span><span class="attach">${icon('clip')} Portfolio_${NAMAF}.pdf</span></span></span></button>
        <button type="button" class="hs" data-i="5"><span class="hs-dot">6</span><span>Terima kasih atas waktu dan perhatian Bapak/Ibu.<br>Hormat saya,<br>${NAMA}</span></button>
      </div>
    </div>
    <aside class="hs-card" aria-live="polite"><div class="ip-empty">${icon('pointer')}<p>Klik titik bernomor untuk melihat fungsi tiap bagian.</p></div></aside>
  </div>`;
  const card = $('.hs-card', el);
  const open = (i, silent, showCard = true) => {
    const b = $(`.hs[data-i="${i}"]`, el); b.classList.add('seen');
    if (!st.seen.includes(i)) { st.seen.push(i); save(); }
    if (showCard) { $$('.hs', el).forEach(x => x.classList.toggle('active', x === b)); card.innerHTML = `<div class="ip-card"><span class="hs-num">${i + 1}</span><h4>${hs[i][0]}</h4><p>${hs[i][1]}</p></div><ol class="hs-list">${hs.map(([t], j) => `<li class="${st.seen.includes(j) ? 'on' : ''}">${st.seen.includes(j) ? icon('check') : '<span></span>'}${t}</li>`).join('')}</ol>`; }
    $('.counter b', el).textContent = st.seen.length;
    if (st.seen.length === 6) done(silent);
    silent || sfx();
  };
  st.seen.slice().forEach((i, k, arr) => open(i, true, k === arr.length - 1));
  el.onclick = e => { const b = e.target.closest('.hs'); if (b) open(+b.dataset.i, false); };
};

/* perkenalan-dan-cv — simulasi menulis email: pilih perkenalan + nama file */
ACT['perkenalan-dan-cv'] = (el, done, st) => {
  el.innerHTML = `${actHead('pen', 'Simulasi', '<b>0</b> dari 2 tepat')}
  <div class="compose">
    <div class="compose-top">${icon('pen')} Tulis Email</div>
    <div class="cf"><span>Kepada</span>Tim Rekrutmen PT ABC</div>
    <div class="cf"><span>Subject</span>Application for Graphic Designer Position – ${NAMA}</div>
    <div class="compose-body"><p>Yth. Tim Rekrutmen PT ABC,</p><p class="fill" id="fillIntro">[ pilih kalimat perkenalan di bawah ]</p><p>Bersama email ini saya lampirkan CV dan portofolio saya sebagai bahan pertimbangan.</p><p>Hormat saya,<br>${NAMA}</p></div>
    <div class="compose-attach"><span>${icon('clip')} Lampiran</span><span class="fill" id="fillFile">[ pilih file lampiran ]</span></div>
  </div>
  <div class="choice-group"><h4>1. Kalimat perkenalan yang tepat</h4><div class="mcq" id="mIntro"></div></div>
  <div class="choice-group"><h4>2. Nama file lampiran yang tepat</h4><div class="mcq" id="mFile"></div></div>
  <div class="fb" id="composeFb" hidden></div>`;
  let ok = 0;
  const hit = silent => { ok++; $('.counter b', el).textContent = ok; if (ok === 2) { showFb($('#composeFb', el), null, 'Emailmu siap dikirim. Jangan lupa cek lagi, pastikan lampirannya sudah terunggah dan bisa dibuka.'); done(silent); } };
  mcq($('#mIntro', el), { store: st, key: 'intro', opts: [
    { t: `“Saya ${NAMA}, lulusan S1 Desain Komunikasi Visual, bermaksud melamar posisi Graphic Designer.”`, ok: true, fb: 'Tepat. Singkat dan relevan: ada nama, latar belakang pendidikan, dan posisi yang dilamar.' },
    { t: '“Halo kak, aku Syarif, hobi main game, lagi nganggur nih.”', fb: 'Kurang pas. Bahasanya santai, dan isinya cerita pribadi yang tidak berhubungan dengan pekerjaan.' },
    { t: '“Saya anak pertama dari tiga bersaudara dan tinggal bersama orang tua.”', fb: 'Kurang pas. Info keluarga tidak ada hubungannya dengan pekerjaan. Fokus ke kemampuan yang mendukung posisi.' }],
    onDone: silent => { const f = $('#fillIntro', el); f.textContent = `Saya ${NAMA}, lulusan S1 Desain Komunikasi Visual, bermaksud melamar posisi Graphic Designer.`; f.classList.add('filled'); hit(silent); } });
  mcq($('#mFile', el), { store: st, key: 'file', opts: [
    { t: `CV_${NAMAF}.pdf`, ok: true, fb: 'Tepat. Formatnya PDF dan namanya rapi, mudah dikenali.' },
    { t: 'cv baru final.docx', fb: 'Kurang pas. Nama filenya tidak rapi dan formatnya bukan PDF.' },
    { t: 'scan0001.jpg', fb: 'Kurang pas. Nama file ini sulit dikenali dan formatnya bukan PDF.' }],
    onDone: silent => { const f = $('#fillFile', el); f.innerHTML = `<span class="attach">${icon('file')} CV_${NAMAF}.pdf</span>`; f.classList.add('filled'); hit(silent); } });
};

/* kesalahan-email — temukan 6 kesalahan */
ACT['kesalahan-email'] = (el, done, st) => {
  const segs = {
    from: ['Alamat email tidak profesional', 'Pakai alamat email yang memuat nama aslimu, bukan julukan.'],
    subject: ['Subject tidak jelas', `Subject yang baik itu spesifik, misalnya “Application for Graphic Designer Position – ${NAMA}”.`],
    company: ['Nama perusahaan salah tulis', 'Email ini untuk PT ABC, tapi di salam pembuka tertulis “PT ABD”.'],
    informal: ['Bahasa tidak formal', 'Hindari bahasa gaul, singkatan tidak resmi, dan emoji.'],
    long: ['Isi terlalu panjang', 'Isi email cukup singkat, padat, dan relevan. Cerita pribadi yang tidak berkaitan sebaiknya dibuang.'],
    attach: ['CV/portofolio tidak dilampirkan', 'Lampirkan CV dan portofolio, lalu pastikan sudah terunggah sebelum mengirim.'],
  };
  st.found = st.found || [];
  el.innerHTML = `${actHead('search', 'Temukan kesalahan', 'Ditemukan <b>0</b> dari 6')}
  <div class="spot-wrap">
    <div class="mail spot">
      <div class="mail-meta"><span>Dari</span><button type="button" class="sp" data-e="from">syarif.kerenabis99@email.com</button></div>
      <div class="mail-meta"><span>Kepada</span><button type="button" class="sp" data-ok>Tim Rekrutmen PT ABC</button></div>
      <div class="mail-meta"><span>Subject</span><button type="button" class="sp" data-e="subject">Lamaran</button></div>
      <div class="mail-body">
        <button type="button" class="sp" data-e="company">Yth. Tim Rekrutmen PT ABD,</button>
        <button type="button" class="sp" data-e="informal">Halo kak, aku Syarif nih, mau ngelamar jadi graphic designer yaa 😁</button>
        <button type="button" class="sp" data-e="long">Jadi gini, dari kecil aku memang suka gambar, terus pas sekolah sering ikut lomba, terus kuliah ambil desain, terus sempat bingung mau kerja di mana, terus temanku bilang coba saja daftar ke sini, jadi ya sudah aku coba kirim, soalnya aku juga lagi butuh kerjaan dan kantornya dekat rumah…</button>
        <button type="button" class="sp" data-ok>Terima kasih atas waktu dan perhatian Bapak/Ibu.</button>
        <button type="button" class="sp" data-ok>Hormat saya,<br>${NAMA}</button>
      </div>
      <div class="mail-attach"><span>${icon('clip')} Lampiran</span><button type="button" class="sp" data-e="attach">(tidak ada lampiran)</button></div>
    </div>
    <aside class="spot-side"><div class="fb" hidden></div><h4>Temuanmu</h4><ol class="found-list"><li class="empty">Belum ada yang ditemukan.</li></ol></aside>
  </div>`;
  const fb = $('.fb', el), list = $('.found-list', el);
  const mark = (k, silent) => {
    const b = $(`.sp[data-e="${k}"]`, el);
    if (!st.found.includes(k)) { st.found.push(k); save(); }
    const n = st.found.indexOf(k) + 1;
    b.classList.add('found'); b.insertAdjacentHTML('afterbegin', `<span class="sp-mark">${n}</span>`);
    if (n === 1) list.innerHTML = '';
    list.insertAdjacentHTML('beforeend', `<li><b>${segs[k][0]}</b><small>${segs[k][1]}</small></li>`);
    $('.counter b', el).textContent = st.found.length;
    if (!silent) { sfx('ok'); showFb(fb, true, `<b>${segs[k][0]}.</b> ${segs[k][1]}`); }
    if (st.found.length === 6) { showFb(fb, true, 'Semua kesalahan sudah ketemu. Kesalahan kecil seperti ini sering membuat lamaran tidak diproses.'); done(silent); }
  };
  st.found.slice().forEach(k => mark(k, true));
  el.onclick = e => {
    const b = e.target.closest('.sp'); if (!b) return;
    if (b.hasAttribute('data-ok')) { showFb(fb, null, 'Bagian ini sudah benar.'); sfx(); b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
    if (!st.found.includes(b.dataset.e)) mark(b.dataset.e, false);
  };
};

/* praktik-email — praktik menulis email (draf & hasil disimpan) */
ACT['praktik-email'] = (el, done, st) => {
  const d = st.draft || {};
  const checks = ['Subject jelas', 'Salam sudah sesuai', 'Perkenalan singkat', 'Lampiran disebutkan', 'Bahasa formal'];
  el.innerHTML = `${actHead('pen', 'Praktik')}
  <div class="practice">
    <aside class="vacancy"><small>Lowongan</small><h4>Graphic Designer</h4><p>PT ABC</p>
      <div class="chk-h">${icon('list')} Daftar periksa</div>
      ${checks.map((c, i) => `<label class="chk"><input type="checkbox" data-c="${i}" ${d.c && d.c[i] ? 'checked' : ''}><span>${c}</span></label>`).join('')}
    </aside>
    <form class="pform" id="pform">
      <label>Subject<input name="subject" value="${esc(d.subject || '')}" placeholder="Tulis subject email…"></label>
      <label>Salam pembuka<input name="greeting" value="${esc(d.greeting || '')}" placeholder="Tulis salam pembuka…"></label>
      <label>Isi email<textarea name="body" rows="4" placeholder="Perkenalan singkat, tujuan email, dan keterangan lampiran…">${esc(d.body || '')}</textarea></label>
      <label>Salam penutup<input name="closing" value="${esc(d.closing || '')}" placeholder="Salam penutup dan nama…"></label>
      <div class="pform-foot"><span class="muted small" id="pHint"></span><button class="btn btn-primary" type="submit" id="pSend" disabled>${icon('send')} Kirim</button></div>
    </form>
  </div>
  <div class="pcompare" hidden></div>`;
  const form = $('#pform', el), send = $('#pSend', el), box = $('.pcompare', el);
  const read = () => ({ subject: form.subject.value.trim(), greeting: form.greeting.value.trim(), body: form.body.value.trim(), closing: form.closing.value.trim(), c: $$('[data-c]', el).map(x => x.checked) });
  const check = () => {
    const v = read(); st.draft = v; save();
    const filled = v.subject && v.greeting && v.body && v.closing, allc = v.c.every(Boolean);
    send.disabled = !(filled && allc);
    $('#pHint', el).textContent = !filled ? 'Isi semua bagian emailnya dulu.' : !allc ? 'Centang daftar periksa setelah kamu mengecek emailmu.' : 'Siap dikirim.';
  };
  const showCompare = v => {
    box.hidden = false;
    box.innerHTML = `<div class="pc-col"><h4>${icon('pen')} Emailmu</h4><div class="pc-mail"><p><small>Subject</small>${esc(v.subject)}</p><p>${esc(v.greeting)}</p><p>${esc(v.body).replace(/\n/g, '<br>')}</p><p>${esc(v.closing)}</p></div></div>
      <div class="pc-col model"><h4>${icon('check')} Contoh jawaban</h4><div class="pc-mail"><p><small>Subject</small>Application for Graphic Designer Position – ${NAMA}</p><p>Yth. Tim Rekrutmen PT ABC,</p><p>Saya ${NAMA}, lulusan S1 Desain Komunikasi Visual, bermaksud melamar posisi Graphic Designer di PT ABC. Bersama email ini saya lampirkan CV dan portofolio saya (CV_${NAMAF}.pdf dan Portfolio_${NAMAF}.pdf) sebagai bahan pertimbangan. Terima kasih atas waktu dan perhatian Bapak/Ibu.</p><p>Hormat saya,<br>${NAMA}</p></div></div>
      <p class="pc-note">${icon('bulb')} Bandingkan emailmu dengan contoh di atas memakai daftar periksa. Kamu boleh memperbaiki lalu mengirim ulang.</p>`;
  };
  el.addEventListener('input', check); check();
  if (st.sent) { showCompare(st.sent); done(true); }
  form.onsubmit = e => { e.preventDefault(); const v = read(); st.sent = v; save(); sfx('ok'); showCompare(v); box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); done(false); };
};

/* cc-bcc-waktu — CC/BCC + jam (angka 12 di atas) + 2 kuis */
ACT['cc-bcc-waktu'] = (el, done, st) => {
  const R = 84;
  const pt = (h, r) => { const a = (h % 12) / 12 * 2 * Math.PI - Math.PI / 2; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
  /* Busur jam kerja 08.00 → 17.00 (searah jarum jam melewati angka 12) */
  const [x1, y1] = pt(8, R), [x2, y2] = pt(17, R);
  el.innerHTML = `${actHead('users', 'Penjelasan visual')}
  <div class="cc-wrap">
    <div class="cc-diagram" id="ccd">
      <svg viewBox="0 0 520 300" role="img" aria-label="Satu email dikirim ke penerima utama, CC, dan BCC">
        <path class="ln to" d="M110 150 C 250 150, 260 45, 380 45"/><path class="ln cc" d="M110 150 C 250 150, 260 110, 380 110"/><path class="ln cc" d="M110 150 C 250 150, 260 165, 380 165"/><path class="ln bcc" d="M110 150 C 250 150, 260 220, 380 220"/><path class="ln bcc" d="M110 150 C 250 150, 260 275, 380 275"/>
        <g class="node sender"><circle cx="70" cy="150" r="40"/><text x="70" y="146">Email</text><text x="70" y="164" class="sm">kamu</text></g>
        <g class="node to"><rect x="380" y="25" width="130" height="40" rx="20"/><text x="445" y="50">Kepada</text></g>
        <g class="node cc"><rect x="380" y="90" width="130" height="40" rx="20"/><text x="445" y="115">CC</text></g>
        <g class="node cc"><rect x="380" y="145" width="130" height="40" rx="20"/><text x="445" y="170">CC</text></g>
        <g class="node bcc"><rect x="380" y="200" width="130" height="40" rx="20"/><text x="445" y="225">BCC</text></g>
        <g class="node bcc"><rect x="380" y="255" width="130" height="40" rx="20"/><text x="445" y="280">BCC</text></g>
      </svg>
      <button type="button" class="btn btn-primary btn-sm" id="ccPlay">${icon('play')} Putar animasi</button>
    </div>
    <div class="cc-cards">
      <div class="cc-card"><span class="tag cc">CC</span><b>Carbon Copy</b><p>Salinan untuk orang lain yang perlu tahu isi email.</p></div>
      <div class="cc-card"><span class="tag bcc">BCC</span><b>Blind Carbon Copy</b><p>Salinan yang alamat penerimanya disembunyikan, jadi privasi tetap terjaga.</p></div>
      <div class="cc-seen" ${st.cc ? '' : 'hidden'}>${icon('eye')} Semua penerima bisa melihat <b>Kepada</b> dan <b>CC</b>. Penerima <b>BCC</b> tidak terlihat.</div>
    </div>
  </div>
  <div class="time-wrap">
    <div class="clock">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="92" class="c-bg"/>
        <path d="M ${x1} ${y1} A ${R} ${R} 0 1 1 ${x2} ${y2}" class="c-work"/>
        ${Array.from({ length: 12 }, (_, i) => { const h = i + 1, [x, y] = pt(h, 66); const [a1, b1] = pt(h, 76), [a2, b2] = pt(h, 84); return `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" class="tick"/><text x="${x}" y="${y + 4.5}" class="c-num">${h}</text>`; }).join('')}
        <line x1="100" y1="100" x2="100" y2="52" class="hand h-hour" id="hHour"/>
        <line x1="100" y1="100" x2="100" y2="34" class="hand h-min"/>
        <circle cx="100" cy="100" r="5" class="c-pin"/>
      </svg>
      <div class="clock-dig" id="hourTxt">10.00</div>
    </div>
    <div class="time-ctl">
      <h4>${icon('clock')} Kapan sebaiknya mengirim email?</h4>
      <p class="muted small">Garis merah di jam menandai jam kerja, pukul 08.00–17.00. Geser untuk mencoba jam kirim yang lain.</p>
      <label class="range"><input type="range" min="0" max="23" value="${st.hour ?? 10}" id="hour" aria-label="Jam kirim"><span class="range-scale"><i>00</i><i>06</i><i>12</i><i>18</i><i>23</i></span></label>
      <div class="fb" id="hourFb" hidden></div>
      <div class="days">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d, i) => `<span class="${i > 4 ? 'off' : ''}">${d}</span>`).join('')}<small>Sabtu–Minggu libur</small></div>
    </div>
  </div>
  <div class="quiz-box">${actHead('help', 'Kuis 1')}<div class="mcq" id="q1"></div></div>
  <div class="quiz-box">${actHead('help', 'Kuis 2')}<div class="mcq" id="q2"></div></div>`;
  $('#ccPlay', el).onclick = () => { const d = $('#ccd', el); d.classList.remove('play'); void d.offsetWidth; d.classList.add('play'); $('.cc-seen', el).hidden = false; st.cc = true; save(); sfx(); };
  const hour = $('#hour', el);
  const upd = () => {
    const h = +hour.value; st.hour = h; save();
    $('#hourTxt', el).textContent = String(h).padStart(2, '0') + '.00';
    $('#hHour', el).setAttribute('transform', `rotate(${(h % 12) / 12 * 360} 100 100)`);
    const ok = h >= 8 && h <= 17;
    showFb($('#hourFb', el), ok, ok ? 'Pas, ini masih jam kerja.' : h < 8 ? 'Terlalu pagi. Tunggu jam kerja dimulai, ya.' : 'Sudah lewat jam kerja. Hindari mengirim larut malam, kecuali ada keperluan mendesak.');
  };
  hour.oninput = upd; upd();
  let solved = 0; const hit = silent => { if (++solved === 2) done(silent); };
  mcq($('#q1', el), { store: st, key: 'q1', onDone: hit, q: 'Kamu mengirim pengumuman ke 20 orang yang tidak saling kenal. Fitur apa yang tepat?', opts: [
    { t: 'CC', fb: 'Kurang pas. Kalau pakai CC, semua penerima bisa melihat alamat penerima lain.' },
    { t: 'BCC', ok: true, fb: 'Tepat! Dengan BCC, alamat penerima lain tidak terlihat, jadi privasi tetap aman.' },
    { t: 'Forward', fb: 'Kurang pas. Forward itu meneruskan email, bukan menyembunyikan daftar penerima.' }] });
  mcq($('#q2', el), { store: st, key: 'q2', onDone: hit, q: 'Kapan waktu terbaik mengirim email lamaran?', opts: [
    { t: 'Jam kerja (08.00–17.00)', ok: true, fb: 'Tepat. Di jam kerja, HR biasanya sedang memeriksa email.' },
    { t: 'Tengah malam', fb: 'Kurang pas. Hindari mengirim email larut malam.' },
    { t: 'Hari libur', fb: 'Kurang pas. Hindari hari libur, kecuali memang mendesak.' }] });
};

/* follow-up — pilih langkah follow-up */
ACT['follow-up'] = (el, done, st) => {
  const choices = [
    { k: 'A', t: 'Kirim email follow-up yang sopan dan singkat.', ok: true },
    { k: 'B', t: 'Kirim email setiap hari sampai dibalas.', fb: 'Kurang tepat. HR bisa merasa terganggu. Follow-up cukup sekali, sopan, dan tidak memaksa.' },
    { k: 'C', t: 'Diam saja dan menunggu.', fb: 'Kurang tepat. Kamu jadi kehilangan kesempatan untuk menunjukkan minatmu.' },
  ];
  st.tried = st.tried || [];
  el.innerHTML = `${actHead('branch', 'Pilih langkahmu')}
  <div class="sc-chat"><span class="sc-av">SU</span><div class="bubble"><b>${NAMA}</b><p>Aku sudah kirim lamaran Graphic Designer ke PT ABC <b>6 hari kerja lalu</b>, tapi belum ada balasan. Sebaiknya aku ngapain, ya?</p></div></div>
  <div class="dayline">${Array.from({ length: 8 }, (_, d) => `<span class="${d >= 5 ? 'win' : ''} ${d === 6 ? 'today' : ''}">${d === 0 ? 'Kirim' : 'H+' + d}${d === 6 ? '<em>hari ini</em>' : ''}</span>`).join('')}<small>${icon('calendar')} Waktu follow-up: sekitar 5–7 hari kerja</small></div>
  <div class="branch">${choices.map(c => `<button type="button" class="bcard" data-k="${c.k}"><span class="bk">${c.k}</span><span>${c.t}</span></button>`).join('')}</div>
  <div class="bresult" aria-live="polite"></div>`;
  const res = $('.bresult', el);
  const choose = (k, silent) => {
    const c = choices.find(x => x.k === k), b = $(`.bcard[data-k="${k}"]`, el);
    if (c.ok) {
      $$('.bcard', el).forEach(x => (x.disabled = true)); b.classList.add('ok'); silent || sfx('ok');
      res.innerHTML = `<div class="fb fb-ok">${icon('check')}<span><b>Langkah yang tepat.</b> Begini contoh email follow-up-nya:</span></div>
      <div class="mail followup"><div class="mail-meta"><span>Subject</span><b>Follow-up Application for Graphic Designer – ${NAMA}</b></div>
      <div class="mail-body plain"><p>Yth. Tim Rekrutmen PT ABC,</p><p>Saya ${NAMA}, pelamar posisi Graphic Designer. Pada (tanggal) saya telah mengirimkan lamaran beserta CV dan portofolio. Mohon informasi mengenai perkembangan proses seleksi.</p><p>Terima kasih atas waktu dan perhatian Bapak/Ibu.</p><p>Hormat saya,<br>${NAMA}</p></div></div>`;
      done(silent);
    } else {
      b.classList.add('no'); b.disabled = true; silent || sfx('no');
      res.innerHTML = `<div class="fb fb-no">${icon('x')}<span>${c.fb} Coba pilih langkah lain.</span></div>`;
    }
  };
  st.tried.forEach(k => choose(k, true));
  el.onclick = e => { const b = e.target.closest('.bcard'); if (!b || b.disabled) return; st.tried.push(b.dataset.k); save(); choose(b.dataset.k, false); };
};

/* bahasa-formal — 3 kasus pilih kalimat */
ACT['bahasa-formal'] = (el, done, st) => {
  const cases = [
    { bad: 'Mohon info lanjutannya ya Kak, makasih 🙏', good: 'Mohon informasi mengenai perkembangan proses seleksi. Terima kasih.', wb: 'Kurang pas: ada bahasa gaul (“info”, “ya Kak”, “makasih”) dan emoji.', wg: 'Tepat: jelas, sopan, dan mudah dipahami.' },
    { bad: 'Sy kirim lamaran ya, tolong dicek!!!', good: 'Saya telah mengirimkan lamaran. Mohon dapat diperiksa. Terima kasih.', wb: 'Kurang pas: ada singkatan tidak resmi (“Sy”) dan tanda seru berlebihan.', wg: 'Tepat: kalimatnya efektif, ejaannya benar.' },
    { bad: 'SELAMAT PAGI PAK, SAYA MAU DAFTAR KERJA', good: 'Selamat pagi, Bapak/Ibu. Saya bermaksud melamar posisi Graphic Designer.', wb: 'Kurang pas: semuanya huruf kapital, dan bahasanya kurang formal.', wg: 'Tepat: sopan, formal, dan menyebut posisi yang dilamar.' },
  ];
  st.picks = st.picks || [];
  st.order = st.order || cases.map(() => Math.random() < .5 ? ['good', 'bad'] : ['bad', 'good']); save();
  let idx = Math.min(st.picks.length, 2);
  const render = () => {
    const c = cases[idx], picked = st.picks[idx];
    el.innerHTML = `${actHead('type', 'Pilih kalimat', `Kasus <b>${idx + 1}</b> dari 3`)}
    <div class="steps">${cases.map((_, i) => `<button type="button" class="step ${i < st.picks.length ? 'past' : ''} ${i === idx ? 'cur' : ''}" data-go="${i}" ${i > st.picks.length ? 'disabled' : ''} aria-label="Kasus ${i + 1}"></button>`).join('')}</div>
    <p class="q">Kalimat mana yang paling pas untuk email profesional?</p>
    <div class="vs">${st.order[idx].map(k => `<button type="button" class="vs-card ${picked ? (k === 'good' ? 'ok' : 'no') : ''}" data-k="${k}" ${picked ? 'disabled' : ''}>${icon('mail')}<span>“${k === 'good' ? c.good : c.bad}”</span></button>`).join('<span class="vs-or">atau</span>')}</div>
    <div class="fb" hidden></div><div class="vs-next"></div>`;
    if (picked) after(picked === 'good', true);
  };
  const after = (good, silent) => {
    const c = cases[idx];
    showFb($('.fb', el), good, good ? c.wg : `${c.wb} Yang lebih pas: “${c.good}”`);
    const score = st.picks.filter(p => p === 'good').length;
    $('.vs-next', el).innerHTML = idx < 2 ? `<button type="button" class="btn btn-primary btn-sm" data-next>Kasus berikutnya ${icon('right')}</button>` : `<div class="fb fb-info">${icon('award')}<span>Selesai. Kamu memilih <b>${score} dari 3</b> kalimat dengan tepat.</span></div>`;
    if (st.picks.length === 3) done(silent);
  };
  render();
  el.onclick = e => {
    const go = e.target.closest('[data-go]'); if (go && !go.disabled) { idx = +go.dataset.go; render(); return; }
    if (e.target.closest('[data-next]')) { idx = Math.min(idx + 1, 2); render(); sfx(); return; }
    const b = e.target.closest('.vs-card'); if (!b || b.disabled) return;
    const good = b.dataset.k === 'good';
    st.picks[idx] = b.dataset.k; save(); sfx(good ? 'ok' : 'no');
    $$('.vs-card', el).forEach(x => { x.disabled = true; x.classList.add(x.dataset.k === 'good' ? 'ok' : 'no'); });
    after(good, false);
  };
};

/* =========================================================================
   MESIN SOAL (dipakai latihan & evaluasi)
   Tipe: mcq, match, order, sort, spot, hour, slots (seret kartu ke tempatnya)
   ========================================================================= */
function qInit(q, ans) {
  if (ans !== undefined && ans !== null) return ans;
  if (q.type === 'order') { let o; do { o = shuffle(q.items.map((_, i) => i)); } while (o.every((v, i) => v === i)); return o; }
  if (q.type === 'match') return q.pairs.map(() => '');
  if (q.type === 'sort') return q.items.map(() => -1);
  if (q.type === 'spot') return q.segs.map(() => false);
  if (q.type === 'hour') return 12;
  if (q.type === 'slots') return q.slots.map(() => -1);
  return null;
}
function qScore(q, a) {
  if (a === null || a === undefined) return 0;
  switch (q.type) {
    case 'mcq': return a === q.a ? 1 : 0;
    case 'order': return a.filter((v, i) => v === i).length / a.length;
    case 'match': return q.pairs.filter((p, i) => a[i] === p[1]).length / q.pairs.length;
    case 'sort': return q.items.filter((it, i) => a[i] === it[1]).length / q.items.length;
    case 'spot': { const tot = q.segs.filter(sg => sg[1]).length, hit = q.segs.filter((sg, i) => sg[1] && a[i]).length, fp = q.segs.filter((sg, i) => !sg[1] && a[i]).length; return Math.max(0, hit - fp) / tot; }
    case 'hour': return a >= 8 && a <= 17 ? 1 : 0;
    case 'slots': return a.filter((v, i) => v === i).length / a.length;
  }
  return 0;
}
function qAnswered(q, a) {
  if (a === null || a === undefined) return false;
  if (q.type === 'match') return a.every(Boolean);
  if (q.type === 'sort' || q.type === 'slots') return a.every(v => v >= 0);
  if (q.type === 'spot') return a.some(Boolean);
  return true;
}
/* Render satu soal. mode: 'latihan' (ada pemeriksaan & pembahasan) atau 'ujian' (tanpa umpan balik) */
function qRender(box, q, a, { mode, checked, onChange }) {
  const lock = mode === 'latihan' && checked;
  let body = '';
  if (q.type === 'mcq') body = `<div class="opts">${q.opts.map((t, i) => `<button type="button" class="opt ${a === i ? 'picked' : ''} ${lock ? (i === q.a ? 'ok' : a === i ? 'no' : '') : ''}" data-i="${i}" ${lock ? 'disabled' : ''}><span class="opt-l">${'ABCD'[i]}</span><span class="opt-t">${t}</span></button>`).join('')}</div>`;
  if (q.type === 'order') body = `<ol class="olist">${a.map((v, pos) => `<li class="${lock ? (v === pos ? 'ok' : 'no') : ''}"><span class="o-n">${pos + 1}</span><span class="o-t">${q.items[v]}</span>${lock ? '' : `<span class="o-btn"><button type="button" data-up="${pos}" ${pos === 0 ? 'disabled' : ''} aria-label="Naikkan">${icon('up')}</button><button type="button" data-down="${pos}" ${pos === a.length - 1 ? 'disabled' : ''} aria-label="Turunkan">${icon('down')}</button></span>`}</li>`).join('')}</ol>`;
  if (q.type === 'match') { const opts = [...new Set(q.pairs.map(p => p[1]))].sort(); body = `<div class="mlist">${q.pairs.map((p, i) => `<label class="mrow ${lock ? (a[i] === p[1] ? 'ok' : 'no') : ''}"><span>${p[0]}</span><select data-m="${i}" ${lock ? 'disabled' : ''}><option value="">— pilih —</option>${opts.map(o => `<option ${a[i] === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`).join('')}</div>`; }
  if (q.type === 'sort') body = `<div class="slist">${q.items.map((it, i) => `<div class="srow2 ${lock ? (a[i] === it[1] ? 'ok' : 'no') : ''}"><span class="s-t">${it[0]}</span><span class="seg2">${q.buckets.map((bk, b) => `<button type="button" data-s="${i}" data-b="${b}" class="${a[i] === b ? 'on' : ''}" ${lock ? 'disabled' : ''}>${bk}</button>`).join('')}</span></div>`).join('')}</div>`;
  if (q.type === 'spot') body = `<div class="mail spot spot-q">${q.segs.map((sg, i) => `<button type="button" class="sp ${a[i] ? 'marked' : ''}" data-sp="${i}">${sg[0]}</button>`).join('')}</div><p class="muted small">Ketuk bagian yang menurutmu salah. Ketuk lagi untuk membatalkan.</p>`;
  if (q.type === 'hour') body = `<div class="hour-q"><div class="clock-dig big">${String(a).padStart(2, '0')}.00</div><label class="range"><input type="range" min="0" max="23" value="${a}" data-hour aria-label="Jam kirim"><span class="range-scale"><i>00</i><i>06</i><i>12</i><i>18</i><i>23</i></span></label></div>`;
  if (q.type === 'slots') {
    q._ord = q._ord || shuffle(q.cards.map((_, i) => i));
    const used = new Set(a.filter(v => v >= 0)), pick = box._pick;
    body = `<div class="dz ${lock ? 'lock' : ''} ${q.slots.every(l => l.length <= 10) ? 'dz-num' : ''}">
      <div class="dz-pool" data-pool>${q._ord.filter(c => !used.has(c)).map(c => `<button type="button" class="dz-card ${pick === c ? 'on' : ''}" draggable="true" data-card="${c}">${q.cards[c]}</button>`).join('') || '<small class="muted">Semua kartu sudah ditempatkan.</small>'}</div>
      <ol class="dz-slots">${q.slots.map((lb, i) => `<li class="dz-slot ${a[i] >= 0 ? 'full' : ''} ${lock ? (a[i] === i ? 'ok' : 'no') : ''}" data-slot="${i}" ${lock ? '' : `tabindex="0" role="button" aria-label="Tempat ${lb}"`}><span class="dz-lb">${lb}</span><span class="dz-in">${a[i] >= 0 ? `<span class="dz-card in" ${lock ? '' : 'draggable="true" tabindex="0" role="button"'} data-card="${a[i]}" data-from="${i}">${q.cards[a[i]]}</span>` : '<i>Taruh kartu di sini</i>'}</span></li>`).join('')}</ol></div>
      ${lock || mode === 'ujian' ? '' : '<p class="muted small">Seret kartu ke tempatnya. Di HP: ketuk kartu, lalu ketuk tempatnya. Ketuk kartu yang sudah terpasang untuk mengembalikannya.</p>'}`;
  }
  box.innerHTML = `<p class="q">${q.q}</p>${body}`;
  if (q.type === 'slots' && !lock) {
    const place = (c, i) => { const n = a.map(v => (v === c ? -1 : v)); n[i] = c; box._pick = undefined; onChange(n); };
    const unplace = i => { const n = a.slice(); n[i] = -1; box._pick = undefined; onChange(n); };
    box.ondragstart = e => { const c = e.target.closest('[data-card]'); if (!c) return; e.dataTransfer.setData('text/plain', c.dataset.card); e.dataTransfer.effectAllowed = 'move'; c.classList.add('drag'); };
    box.ondragend = e => { const c = e.target.closest('[data-card]'); if (c) c.classList.remove('drag'); $$('.dz-slot.over', box).forEach(x => x.classList.remove('over')); };
    box.ondragover = e => { const t = e.target.closest('[data-slot], [data-pool]'); if (!t) return; e.preventDefault(); $$('.dz-slot.over', box).forEach(x => x !== t && x.classList.remove('over')); t.classList.add('over'); };
    box.ondrop = e => {
      e.preventDefault(); const c = parseInt(e.dataTransfer.getData('text/plain'), 10); if (Number.isNaN(c)) return;
      const sl = e.target.closest('[data-slot]'); if (sl) { sfx(); place(c, +sl.dataset.slot); return; }
      if (e.target.closest('[data-pool]')) { const i = a.indexOf(c); if (i >= 0) unplace(i); }
    };
    box.onkeydown = e => { if (e.key !== 'Enter' && e.key !== ' ') return; const t = e.target.closest('.dz-card.in, [data-slot]'); if (!t || e.target.tagName === 'BUTTON') return; e.preventDefault(); t.click(); };
  }
  const set = v => { onChange(v); };
  box.onclick = e => {
    if (q.type === 'slots') {
      if (lock) return;
      const card = e.target.closest('[data-card]'), sl = e.target.closest('[data-slot]');
      if (card && card.dataset.from !== undefined && box._pick === undefined) { const n = a.slice(); n[+card.dataset.from] = -1; sfx(); onChange(n); return; }
      if (card && card.dataset.from === undefined) { box._pick = box._pick === +card.dataset.card ? undefined : +card.dataset.card; $$('.dz-pool .dz-card', box).forEach(x => x.classList.toggle('on', +x.dataset.card === box._pick)); sfx(); return; }
      if (sl && box._pick !== undefined) { const c = box._pick, n = a.map(v => (v === c ? -1 : v)); n[+sl.dataset.slot] = c; box._pick = undefined; sfx(); onChange(n); }
      return;
    }
    const o = e.target.closest('.opt'); if (o && !o.disabled) { set(+o.dataset.i); return; }
    const up = e.target.closest('[data-up]'); if (up) { const p = +up.dataset.up, n = a.slice(); [n[p - 1], n[p]] = [n[p], n[p - 1]]; set(n); return; }
    const dn = e.target.closest('[data-down]'); if (dn) { const p = +dn.dataset.down, n = a.slice(); [n[p + 1], n[p]] = [n[p], n[p + 1]]; set(n); return; }
    const s = e.target.closest('[data-s]'); if (s && !s.disabled) { const n = a.slice(); n[+s.dataset.s] = +s.dataset.b; set(n); return; }
    const sp = e.target.closest('[data-sp]'); if (sp) { const n = a.slice(); n[+sp.dataset.sp] = !n[+sp.dataset.sp]; set(n); }
  };
  box.onchange = e => { const m = e.target.closest('[data-m]'); if (m) { const n = a.slice(); n[+m.dataset.m] = m.value; set(n); } };
  box.oninput = e => { const h = e.target.closest('[data-hour]'); if (h) { $('.clock-dig', box).textContent = String(h.value).padStart(2, '0') + '.00'; onChange(+h.value, true); } };
}

/* ---------- Bank soal LATIHAN latihan-soal (storyboard: 15 soal PG, 5 per materi) ---------- */
const LATIHAN = [
  { type: 'mcq', topic: 'Materi 1 · Fungsi email', q: 'Mengapa email lebih cocok daripada chat untuk urusan resmi?', opts: ['Selalu lebih cepat dibalas', 'Lebih formal dan tersimpan sebagai bukti', 'Tidak butuh internet', 'Boleh pakai emoji'], a: 1, why: 'Email lebih formal, terdokumentasi, dan bisa menjadi bukti komunikasi profesional.' },
  { type: 'mcq', topic: 'Materi 1 · Struktur email', q: 'Bagian email yang merangkum isi email secara singkat adalah…', opts: ['Tanda tangan', 'Salam pembuka', 'Subject line', 'Salam penutup'], a: 2, why: 'Subject line menjelaskan isi email secara singkat dan jadi hal pertama yang dilihat penerima.' },
  { type: 'mcq', topic: 'Materi 1 · Salam pembuka', q: 'Salam pembuka yang tepat untuk email ke tim rekrutmen PT Maju Jaya:', opts: ['Hai min', 'Yth. Tim Rekrutmen PT Maju Jaya,', 'Halo kak', 'Permisi'], a: 1, why: 'Salam pembuka menunjukkan rasa hormat. “Yth. Tim Rekrutmen PT Maju Jaya,” sopan dan menyebut penerimanya dengan jelas.' },
  { type: 'mcq', topic: 'Materi 1 · Subject line', q: 'Subject yang paling tepat untuk Salsa Rahma yang melamar posisi Staf Administrasi adalah?', opts: ['Lamaran Kerja', 'Tolong dibaca ya', 'Application for Administrative Staff – Salsa Rahma', 'Penting banget'], a: 2, why: 'Subject yang baik singkat, jelas, spesifik, dan mencerminkan tujuan email: posisi yang dilamar dan nama pelamar.' },
  { type: 'mcq', topic: 'Materi 1 · Tanda tangan', q: 'Apa isi bagian tanda tangan email?', opts: ['Nama lengkap dan kontak', 'Isi lamaran', 'Daftar kelebihan diri', 'Alasan keluar dari kerja lama'], a: 0, why: 'Tanda tangan menutup email dengan nama lengkap dan kontak pengirim.' },
  { type: 'mcq', topic: 'Materi 2 · Email lamaran', q: 'Tujuan utama email lamaran kerja yaitu?', opts: ['Meminta gaji sebesar mungkin', 'Memperkenalkan diri, menyatakan minat pada posisi, dan mengirim dokumen', 'Bercerita tentang pengalaman hidup', 'Mengundang HR wawancara'], a: 1, why: 'Email lamaran dipakai untuk memperkenalkan diri, menyatakan minat pada posisi tertentu, dan mengirim CV serta portofolio.' },
  { type: 'mcq', topic: 'Materi 2 · Isi email', q: 'Isi email lamaran sebaiknya…', opts: ['Sepanjang CV', 'Berisi seluruh riwayat hidup', 'Singkat dan relevan dengan posisi', 'Dikosongkan karena semua ada di lampiran'], a: 2, why: 'Isi email lamaran harus singkat, padat, dan relevan dengan posisi yang dilamar.' },
  { type: 'mcq', topic: 'Materi 2 · Lampiran', q: 'Nama file lampiran yang paling profesional:', opts: ['final-final-baru.pdf', 'IMG_2031.jpg', 'cv terbaru banget.docx', 'CV_SalsaRahma.pdf'], a: 3, why: 'Gunakan format PDF dengan nama file yang profesional, misalnya CV_NamaLengkap.pdf.' },
  { type: 'mcq', topic: 'Materi 2 · Sebelum kirim', q: 'Apa yang perlu dicek tepat sebelum menekan “Kirim”?', opts: ['Lampiran sudah terunggah dan bisa dibuka', 'Jumlah teman yang sedang online', 'Warna huruf', 'Lamanya waktu menulis'], a: 0, why: 'Sebelum mengirim, pastikan semua lampiran sudah terunggah dan bisa dibuka.' },
  { type: 'mcq', topic: 'Materi 2 · Alamat email', q: 'Alamat email yang paling pantas untuk melamar kerja:', opts: ['kucing_imut99@…', 'si_galau@…', 'salsa.rahma@…', 'anak_gaul@…'], a: 2, why: 'Alamat email yang tidak profesional termasuk kesalahan umum. Pakai alamat berisi nama asli.' },
  { type: 'mcq', topic: 'Materi 3 · CC dan BCC', q: 'Atasanmu perlu tahu isi emailmu ke klien, tapi tidak perlu ikut membalas. Fitur yang tepat adalah?', opts: ['CC', 'BCC', 'Forward', 'Reply all'], a: 0, why: 'CC dipakai untuk mengirim salinan ke pihak lain yang perlu mengetahui isi email.' },
  { type: 'mcq', topic: 'Materi 3 · Waktu kirim', q: 'Email lamaran selesai ditulis pukul 23.30. Sebaiknya kamu melakukan…', opts: ['Langsung kirim', 'Kirim ulang tiap jam', 'Jadwalkan kirim besok pagi di jam kerja', 'Tunggu sampai hari libur'], a: 2, why: 'Kirim email pada jam kerja (08.00–17.00) dan hindari mengirim larut malam atau hari libur.' },
  { type: 'mcq', topic: 'Materi 3 · Follow-up', q: 'Baru 3 hari kerja sejak kamu mengirim lamaran dan belum ada kabar. Langkah terbaik yang kamu lakukan yaitu:', opts: ['Kirim email tiap jam', 'Telepon tengah malam', 'Melamar ulang ke posisi yang sama', 'Tunggu dulu sampai sekitar 5–7 hari kerja'], a: 3, why: 'Umumnya follow-up dilakukan sekitar 5–7 hari kerja setelah lamaran dikirim jika belum ada respons.' },
  { type: 'mcq', topic: 'Materi 3 · Follow-up', q: 'Penutup email follow-up yang benar adalah?', opts: ['Cepetan dibalas dong', 'Ditunggu kabarnya ya', 'Terima kasih atas waktu dan perhatian Bapak/Ibu.', 'Bales ya!'], a: 2, why: 'Email follow-up disampaikan dengan sopan, singkat, dan tidak memaksa.' },
  { type: 'mcq', topic: 'Materi 3 · Bahasa', q: 'Pernyataan yang benar tentang bahasa email profesional:', opts: ['Emoji boleh banyak supaya ramah', 'Huruf kapital semua menunjukkan penekanan', 'Singkatan seperti “sy” tidak masalah', 'Hindari bahasa gaul dan singkatan tidak baku'], a: 3, why: 'Bahasa email profesional harus jelas dan sopan, tanpa bahasa gaul, singkatan informal, emoji, dan huruf kapital semua.' },
];

/* ---------- Bank soal evaluasi lama (dipakai ulang: soal tandai kesalahan) ---------- */
const EVAL_LAMA = [
  { type: 'order', q: 'Susun bagian-bagian email profesional dari atas ke bawah.', items: ['Subject', 'Salam pembuka', 'Isi email', 'Salam penutup', 'Tanda tangan'] },
  { type: 'match', q: 'Pasangkan bagian email lamaran dengan fungsinya.', pairs: [['Perkenalan diri', 'Menyebut nama dan pendidikan'], ['Tujuan email', 'Menyebut posisi yang dilamar'], ['Keterangan lampiran', 'Menyebut CV dan portofolio'], ['Salam penutup', 'Mengakhiri email dengan sopan']] },
  { type: 'sort', q: 'Kelompokkan file berikut: mana yang layak dilampirkan?', buckets: ['Layak', 'Tidak layak'], items: [[`CV_${NAMAF}.pdf`, 0], ['cv baru final.docx', 1], [`Portfolio_${NAMAF}.pdf`, 0], ['scan0001.jpg', 1]] },
  { type: 'spot', q: 'Tandai bagian email ini yang salah.', segs: [['Dari: syarif.kerenabis99@email.com', true], ['Kepada: Tim Rekrutmen PT ABC', false], ['Subject: Lamaran', true], ['Yth. Tim Rekrutmen PT ABC,', false], ['Halo kak, aku mau ngelamar yaa 😁', true], ['Hormat saya, Syarifudin', false]] },
  { type: 'match', q: 'Pilih fitur yang tepat untuk setiap situasi.', pairs: [['Atasanmu perlu tahu isi email yang kamu kirim ke klien', 'CC'], ['Pengumuman ke 20 orang yang tidak saling kenal', 'BCC'], ['Penerima utama email lamaranmu', 'Kepada']] },
  { type: 'hour', q: 'Atur jam yang tepat untuk mengirim email lamaran.' },
  { type: 'order', q: 'Lamaran belum dibalas. Urutkan langkah yang tepat.', items: ['Kirim lamaran di jam kerja', 'Tunggu sekitar 5–7 hari kerja', 'Belum ada kabar dari perusahaan', 'Kirim satu email follow-up yang sopan dan singkat'] },
  { type: 'sort', q: 'Kelompokkan kalimat berikut: formal atau tidak formal?', buckets: ['Formal', 'Tidak formal'], items: [['Mohon informasi mengenai perkembangan proses seleksi.', 0], ['Sy kirim lamaran ya, tolong dicek!!!', 1], ['Selamat pagi, Bapak/Ibu.', 0], ['Mohon info lanjutannya ya Kak 🙏', 1], ['SAYA MAU DAFTAR KERJA', 1], ['Terima kasih atas waktu dan perhatian Bapak/Ibu.', 0]] },
];

/* ---------- Bank soal EVALUASI AKHIR evaluasi-akhir (4 soal dari interaksi di materi) ---------- */
const EVALUASI = [
  { type: 'slots', tag: 'Seret & letakkan', q: 'Seret setiap kartu ke urutan bagian email profesional yang benar.', slots: ['Bagian 1', 'Bagian 2', 'Bagian 3', 'Bagian 4', 'Bagian 5'], cards: ['Subject line', 'Salam pembuka', 'Isi email', 'Salam penutup', 'Tanda tangan'] },
  { type: 'mcq', tag: 'Pilih jawaban', q: 'Salsa Rahma melamar posisi Content Writer. Subject email mana yang paling tepat?', opts: ['Lamaran kerja', 'Tolong dibaca ya kak', 'Application for Content Writer – Salsa Rahma', 'PENTING!!!'], a: 2 },
  { ...EVAL_LAMA[3], tag: 'Tandai kesalahan' },
  { type: 'mcq', tag: 'Pilih kalimat', q: 'Pilih kalimat yang paling tepat untuk email follow-up ke HR.', opts: ['Kak, lamaran aku gimana ya? 🙏', 'Mohon informasi mengenai perkembangan proses seleksi. Terima kasih.', 'TOLONG SEGERA DIBALAS!!!'], a: 1 },
];

/* =========================================================================
   latihan-soal — LATIHAN SOAL: 15 soal PG, pembahasan langsung muncul
   ========================================================================= */
ACT['latihan-soal'] = (el, done) => {
  el.innerHTML = `<p class="muted">Latihan dibagi per materi. Setiap soal langsung dicek dan ada pembahasannya. Untuk syarat evaluasi, total benar minimal ${LAT_MIN} dari ${LATIHAN.length}.</p>
    <div class="ex-grid">${LAT_SETS.map(exCard).join('')}</div>
    <p class="akt-sum">${icon('pen')} ${latDijawab()} dari ${LATIHAN.length} soal dijawab · ${latSkor()} benar</p>`;
  if (latDijawab() === LATIHAN.length) done(true);
};

/* =========================================================================
   aktivitas-interaktif — AKTIVITAS INTERAKTIF: A cocokkan istilah, B susun follow-up, C perbaiki kalimat
   Tokoh: Salsa Rahma, pelamar posisi Content Writer
   ========================================================================= */
const AKT_A = { type: 'slots', q: 'Seret setiap istilah ke definisi yang sesuai.',
  slots: ['Ringkasan singkat isi email yang pertama kali dilihat penerima', 'Mengirim salinan ke pihak lain yang perlu tahu isi email', 'Mengirim salinan tanpa memperlihatkan identitas penerima lain', 'Email untuk menanyakan perkembangan proses rekrutmen', 'Nama lengkap dan kontak pengirim di akhir email'],
  cards: ['Subject line', 'CC', 'BCC', 'Follow-up', 'Signature'] };
const AKT_B = { type: 'slots', q: 'Susun kalimat email follow-up Salsa dari atas ke bawah.',
  slots: ['1', '2', '3', '4', '5'],
  cards: ['Yth. Tim Rekrutmen PT Maju Jaya,', 'Saya Salsa Rahma, pelamar posisi Content Writer.', 'Pada (tanggal) saya telah mengirimkan lamaran beserta CV dan portofolio. Mohon informasi mengenai perkembangan proses seleksi.', 'Terima kasih atas waktu dan perhatian Bapak/Ibu.', 'Hormat saya, Salsa Rahma'] };
const AKT_C = [
  { segs: ['Halo kak,', 'saya Salsa Rahma, pelamar posisi Content Writer.'], bad: 0, opts: ['Yth. Tim Rekrutmen,', 'Hai min,', 'Halo kakak,'], a: 0, why: 'Email resmi dibuka dengan sapaan yang hormat, misalnya “Yth. Tim Rekrutmen,”.' },
  { segs: ['Saya sudah mengirimkan CV dan portofolio,', 'tolong dicek ya!!!'], bad: 1, opts: ['cek dong!!', 'mohon dapat diperiksa.', 'buruan dicek 🙏'], a: 1, why: 'Hindari tanda seru berlebihan dan nada memerintah. Pakai kalimat permohonan yang sopan.' },
  { segs: ['Mohon informasi mengenai perkembangan proses seleksi.', 'Thx 🙏'], bad: 1, opts: ['Makasih kak 😊', 'TERIMA KASIH!!!', 'Terima kasih atas waktu dan perhatian Bapak/Ibu.'], a: 2, why: 'Hindari singkatan, emoji, dan huruf kapital semua. Tulis ucapan terima kasih yang lengkap.' },
];
const AKT_INFO = {
  a: ['A', 'branch', 'Cocokkan istilah', 'Seret 5 istilah ke definisinya. 1 poin per pasangan.', 5],
  b: ['B', 'list', 'Susun email follow-up', 'Urutkan 5 kalimat email follow-up Salsa. 1 poin kalau urutannya benar semua.', 1],
  c: ['C', 'type', 'Perbaiki kalimat', 'Ketuk bagian kalimat yang tidak pantas, lalu pilih penggantinya. 1 poin per kalimat.', 3],
};
ACT['aktivitas-interaktif'] = (el, done) => {
  const K = state.akt = state.akt || {}; save();
  const st = k => (K[k] = K[k] || {});
  const finishAll = silent => { if (aktDone()) done(silent); };
  const menu = () => {
    el.innerHTML = `<p class="muted">Kerjakan ketiga aktivitas. Urutannya bebas, dan semuanya harus selesai sebelum lanjut.</p>
      <div class="akt-grid">${AKT_KEYS.map(k => { const [L, ic, t, d, max] = AKT_INFO[k], s = K[k] || {}; return `<button type="button" class="akt-card ${s.done ? 'done' : ''}" data-open="${k}">
        <span class="akt-l">${s.done ? icon('check') : L}</span><span class="akt-ic">${icon(ic)}</span>
        <b>${t}</b><small>${d}</small>
        <span class="akt-st">${s.done ? `Skor ${s.score}/${max} · kerjakan lagi` : 'Belum dikerjakan'}</span></button>`; }).join('')}</div>
      <p class="akt-sum">${icon('check')} ${AKT_KEYS.filter(k => K[k] && K[k].done).length} dari 3 aktivitas selesai</p>`;
  };
  const frame = (k, inner) => `<div class="akt-frame"><div class="akt-top"><button type="button" class="btn btn-outline btn-sm" data-menu>${icon('left')} Daftar aktivitas</button><b>Aktivitas ${AKT_INFO[k][0]} · ${AKT_INFO[k][2]}</b></div>${inner}</div>`;
  /* A dan B: seret kartu, lalu periksa */
  const slotAct = (k, q, scoreOf, msg) => {
    const s = st(k), checked = !!s.checked, a = s.ans || qInit(q);
    el.innerHTML = frame(k, `<div id="qbox"></div><div class="fb" id="qfb" hidden></div>
      <div class="quiz-foot">${checked ? `<button type="button" class="btn btn-outline btn-sm" data-redo>${icon('refresh')} Coba lagi</button><button type="button" class="btn btn-primary btn-sm" data-menu>Kembali ke daftar ${icon('right')}</button>` : `<button type="button" class="btn btn-primary btn-sm" data-cek ${qAnswered(q, a) ? '' : 'disabled'}>Periksa</button>`}</div>`);
    qRender($('#qbox', el), q, a, { mode: 'latihan', checked, onChange: v => { s.ans = v; save(); slotAct(k, q, scoreOf, msg); } });
    if (checked) showFb($('#qfb', el), s.score === AKT_INFO[k][4], msg(s.score));
    el.querySelector('[data-cek]') && (el.querySelector('[data-cek]').onclick = () => {
      s.checked = true; s.score = scoreOf(s.ans); s.done = true; save(); logAct('akt', k, { s: s.score }); sfx(s.score === AKT_INFO[k][4] ? 'ok' : 'no'); updateBar(); slotAct(k, q, scoreOf, msg); finishAll(false);
    });
    el.querySelector('[data-redo]') && (el.querySelector('[data-redo]').onclick = () => { s.checked = false; s.ans = null; q._ord = null; save(); slotAct(k, q, scoreOf, msg); });
  };
  const actA = () => slotAct('a', AKT_A, a => a.filter((v, i) => v === i).length,
    sc => sc === 5 ? 'Semua istilah sudah cocok dengan definisinya.' : `Skormu ${sc}/5. Pasangan yang benar: Subject line = ringkasan isi email, CC = salinan untuk pihak yang perlu tahu, BCC = salinan tanpa memperlihatkan penerima lain, Follow-up = menanyakan perkembangan rekrutmen, Signature = nama dan kontak.`);
  const actB = () => slotAct('b', AKT_B, a => (a.every((v, i) => v === i) ? 1 : 0),
    sc => sc === 1 ? 'Urutan email follow-up Salsa sudah benar.' : 'Belum tepat. Urutan yang benar: salam pembuka → perkenalan → tujuan → ucapan terima kasih → penutup.');
  /* C: ketuk bagian yang tidak pantas, lalu pilih penggantinya */
  const actC = () => {
    const s = st('c'); s.i = s.i || 0; s.pts = s.pts || {};
    if (s.i >= AKT_C.length) {
      el.innerHTML = frame('c', `<div class="akt-end">${icon('check')}<h3>Ketiga kalimat sudah diperbaiki</h3><p class="muted">Skor ${s.score}/3.</p>
        <div class="row-btns"><button type="button" class="btn btn-outline btn-sm" data-redo>${icon('refresh')} Coba lagi</button><button type="button" class="btn btn-primary btn-sm" data-menu>Kembali ke daftar ${icon('right')}</button></div></div>`);
      el.querySelector('[data-redo]').onclick = () => { K.c = { done: s.done, score: s.score }; save(); actC(); };
      return;
    }
    const c = AKT_C[s.i], found = !!s.found, fixed = s.fixed;
    el.innerHTML = frame('c', `<div class="act-head"><span class="act-tag">${icon('type')} Kalimat ${s.i + 1} dari ${AKT_C.length}</span></div>
      <p class="q">${found ? 'Pilih pengganti yang paling tepat.' : 'Ketuk bagian kalimat yang tidak pantas untuk email profesional.'}</p>
      <div class="fix-line">${c.segs.map((t, j) => `<button type="button" class="fix-seg ${found && j === c.bad ? (fixed ? 'fixed' : 'bad') : ''}" data-seg="${j}" ${found ? 'disabled' : ''}>${j === c.bad && fixed ? c.opts[c.a] : t}</button>`).join(' ')}</div>
      ${found && !fixed ? `<div class="opts">${c.opts.map((t, j) => `<button type="button" class="opt" data-rep="${j}"><span class="opt-l">${'ABC'[j]}</span><span class="opt-t">${t}</span></button>`).join('')}</div>` : ''}
      <div class="fb" id="qfb" hidden></div>
      ${fixed ? `<div class="quiz-foot"><button type="button" class="btn btn-primary btn-sm" data-nextc>${s.i === AKT_C.length - 1 ? 'Selesai' : 'Kalimat berikutnya'} ${icon('right')}</button></div>` : ''}`);
    if (fixed) showFb($('#qfb', el), true, `Tepat! ${c.why}`);
    el.querySelectorAll('[data-seg]').forEach(b => b.onclick = () => {
      if (+b.dataset.seg === c.bad) { s.found = true; save(); sfx('ok'); actC(); }
      else { sfx('no'); showFb($('#qfb', el), false, 'Bagian ini sudah tepat. Cari bagian lain yang kurang pantas.'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    });
    el.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => {
      const j = +b.dataset.rep;
      if (s.pts[s.i] === undefined) s.pts[s.i] = j === c.a ? 1 : 0;
      if (j === c.a) { s.fixed = true; save(); sfx('ok'); actC(); }
      else { save(); sfx('no'); b.classList.add('no'); b.disabled = true; showFb($('#qfb', el), false, 'Belum tepat. Pilih pengganti yang lebih sopan dan formal.'); }
    });
    const nx = el.querySelector('[data-nextc]');
    if (nx) nx.onclick = () => {
      s.i++; s.found = false; s.fixed = false;
      if (s.i >= AKT_C.length) { s.score = Object.values(s.pts).reduce((t, v) => t + v, 0); s.done = true; logAct('akt', 'c', { s: s.score }); updateBar(); finishAll(false); }
      save(); sfx(); actC();
    };
  };
  const open = { a: actA, b: actB, c: () => { const s = st('c'); if (s.done && s.i >= AKT_C.length) { actC(); return; } if (!s.i || s.i >= AKT_C.length) { K.c = { done: s.done, score: s.score, i: 0, pts: {} }; save(); } actC(); } };
  menu();
  finishAll(true);
  if (state.aktOpen && open[state.aktOpen]) { const k = state.aktOpen; delete state.aktOpen; save(); open[k](); }
  el.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) { sfx(); open[o.dataset.open](); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.closest('[data-menu]')) { sfx(); menu(); }
  });
};

/* =========================================================================
   awal-evaluasi — AWAL EVALUASI: pos pemeriksaan tiga syarat sebelum evaluasi
   ========================================================================= */
ACT['awal-evaluasi'] = (el, done) => {
  const kurang = MATERI_BAGIAN.find(id => !state.done[id]);
  const mDone = MATERI_BAGIAN.filter(id => state.done[id]).length, aDone = AKT_KEYS.filter(k => state.akt && state.akt[k] && state.akt[k].done).length;
  const syarat = [
    [materiDone(), 'book', 'Selesaikan semua materi', 'Semua bagian materi dibaca dan aktivitasnya dikerjakan.', mDone, MATERI_BAGIAN.length, kurang ? '#/bagian/' + kurang : '#/bagian/kegunaan-email'],
    [latSkor() >= LAT_MIN, 'clipcheck', `Latihan soal minimal ${LAT_MIN} benar`, `70% dari ${LATIHAN.length} soal pilihan ganda di halaman Latihan.`, Math.min(latSkor(), LAT_MIN), LAT_MIN, '#/latihan'],
    [aktDone(), 'grid', 'Kerjakan 3 aktivitas interaktif', 'Cocokkan istilah, susun email follow-up, dan perbaiki kalimat.', aDone, 3, '#/bagian/aktivitas-interaktif'],
  ];
  const ok = gateOk(), n = syarat.filter(s => s[0]).length, firstTodo = syarat.find(s => !s[0]);
  el.innerHTML = `<section class="cp">
    <div class="cp-hero">
      <div class="cp-ring" style="--p:${n / 3 * 100}"><b>${n}<small>/3</small></b><span>syarat</span></div>
      <div class="cp-t"><small class="ph-k">Awal evaluasi</small>
        <h1>${ok ? 'Syarat evaluasi terpenuhi' : 'Cek syarat evaluasi'}</h1>
        <p>${ok ? `Ketiga syarat sudah terpenuhi. Evaluasi berisi ${EVALUASI.length} soal, dan nilai minimal ${KKM} untuk lulus.` : `Penuhi ${3 - n} syarat lagi untuk membuka evaluasi akhir. Klik <b>Kerjakan</b> untuk langsung ke bagian yang kurang.`}</p></div>
    </div>
    <ol class="cp-steps">${syarat.map(([y, ic, t, d, cur, max, h], i) => `<li class="cp-step ${y ? 'ok' : ''}" style="--i:${i}">
      <span class="cp-n">${y ? icon('check') : i + 1}</span>
      <span class="cp-ic">${icon(ic)}</span>
      <div class="cp-b"><b>${t}</b><small>${d}</small>
        <div class="cp-bar"><span class="bar"><i style="width:${cur / max * 100}%"></i></span><em>${cur}/${max}</em></div></div>
      ${y ? `<span class="cp-ok">${icon('check')} Terpenuhi</span>` : `<a class="btn btn-primary btn-sm" href="${h}">Kerjakan ${icon('right')}</a>`}
    </li>`).join('')}</ol>
    <div class="cp-go">${ok ? `<a class="gbtn y lg" href="#/bagian/evaluasi-akhir">${icon('flag')} Mulai evaluasi</a><small>Kamu bisa membaca aturannya dulu sebelum soal pertama.</small>`
      : `<span class="gbtn lg cp-off" aria-disabled="true">${icon('lock')} Mulai evaluasi</span><small>Terbuka setelah ketiga syarat terpenuhi. Berikutnya: <a href="${firstTodo[6]}">${firstTodo[2].toLowerCase()}</a>.</small>`}</div>
  </section>`;
  if (ok) done(!!state.done['awal-evaluasi']);
};

/* =========================================================================
   evaluasi-akhir — EVALUASI AKHIR: mode ujian layar penuh, 4 soal, jawaban dikunci setelah disimpan
   ========================================================================= */
const EV_CARA = {
  slots: 'Seret setiap kartu ke kotak bagian yang tepat. Di HP: ketuk kartunya, lalu ketuk kotaknya. Ketuk kartu yang sudah terpasang untuk mengembalikannya.',
  mcq: 'Pilih satu jawaban yang menurutmu paling tepat.',
  spot: 'Ketuk setiap bagian email yang menurutmu salah. Ketuk lagi untuk membatalkan.',
};
const evFocus = on => document.body.classList.toggle('focus-mode', on);
ACT['evaluasi-akhir'] = (el, done) => {
  const E = state.ev = state.ev || { v: 3, i: 0, ans: {}, done: false }; save();
  const N = EVALUASI.length;
  const anim = (sel, frames, ms) => { const c = $(sel, el); if (!c || reduced) return; try { c.animate(frames, { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)' }); } catch (e) { /* tanpa animasi */ } };
  onLeave(() => evFocus(false));
  const rules = [
    ['list', `${N} soal`, 'Bentuknya mirip aktivitas di materi: seret kartu, pilih jawaban, dan tandai kesalahan.'],
    ['eyeoff', 'Tanpa tanda benar/salah', 'Tidak ada pembahasan selama evaluasi. Kerjakan dengan teliti.'],
    ['lock', 'Jawaban dikunci', 'Setelah kamu tekan Simpan jawaban, jawaban soal itu tidak bisa diubah lagi.'],
    ['award', `Lulus kalau nilai ≥ ${KKM}`, 'Nilai akhir muncul setelah soal terakhir disimpan.'],
  ];
  const intro = () => {
    evFocus(false);
    el.innerHTML = `<section class="exm-intro">
      <div class="exm-hero"><small class="ph-k">Evaluasi akhir</small><h1>Aturan main</h1><p>Baca dulu sebentar, supaya tidak kaget di tengah jalan.</p></div>
      <ol class="exm-rules">${rules.map(([ic, t, d], k) => `<li style="--i:${k}"><span class="exm-ric">${icon(ic)}</span><b>${t}</b><small>${d}</small></li>`).join('')}</ol>
      <div class="exm-go"><button type="button" class="gbtn y lg" data-start>Mulai evaluasi ${icon('right')}</button><a class="exm-back" href="#/bagian/awal-evaluasi">${icon('left')} Kembali ke syarat</a></div>
    </section>`;
  };
  const render = () => {
    evFocus(true);
    const i = E.i, q = EVALUASI[i], a = qInit(q, E.ans[i]);
    if (E.ans[i] === undefined && q.type !== 'mcq') { E.ans[i] = a; save(); }
    const cur = E.ans[i] === undefined ? null : E.ans[i];
    el.innerHTML = `<section class="exm">
      <header class="exm-top">
        <div class="exm-tt"><small>Evaluasi akhir</small><b>Soal ${i + 1} <span>dari ${N}</span></b></div>
        <div class="exm-seg" aria-hidden="true">${EVALUASI.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'cur' : ''}"></i>`).join('')}</div>
        <a class="exm-x" href="#/bagian/awal-evaluasi" title="Keluar sementara. Jawaban yang sudah disimpan tetap aman.">${icon('x')}<span>Keluar</span></a>
      </header>
      <div class="exm-card">
        <span class="exm-tag">${icon('pointer')} ${q.tag}</span>
        <div id="qbox"></div>
        <details class="exm-help" ${i === 0 ? 'open' : ''}><summary>${icon('help')} Cara menjawab</summary><p>${EV_CARA[q.type] || 'Jawab sesuai perintah soal.'}</p></details>
      </div>
      <footer class="exm-foot"><small>${i} dari ${N} jawaban tersimpan</small><button type="button" class="gbtn y" data-save ${qAnswered(q, cur) ? '' : 'disabled'}>${icon('check')} Simpan jawaban</button></footer>
    </section>`;
    qRender($('#qbox', el), q, cur === null ? a : cur, { mode: 'ujian', onChange: (v, soft) => { E.ans[i] = v; save(); if (!soft) render(); else { const b = $('[data-save]', el); if (b) b.disabled = !qAnswered(q, v); } } });
    anim('.exm-card', [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], 380);
  };
  const result = animated => {
    evFocus(false);
    const pass = E.score >= KKM;
    el.innerHTML = `<section class="exm-res ${pass ? 'pass' : 'fail'}">
      <div class="ring big" style="--p:${animated ? 0 : E.score}"><b>${animated ? 0 : E.score}</b><small>nilai akhir</small></div>
      <div class="exm-rb"><span class="exm-badge">${pass ? icon('check') + ' Lulus' : icon('refresh') + ' Belum lulus'}</span>
        <h1>${pass ? 'Kamu lulus' : 'Belum lulus kali ini'}</h1>
        <p>${pass ? `Nilaimu ${E.score}, di atas batas lulus ${KKM}. Lanjut ke penutup untuk rangkuman, lalu cetak sertifikatmu.` : `Nilaimu ${E.score}, batas lulusnya ${KKM}. Pelajari ulang materinya mulai dari Materi 1, atau langsung coba evaluasi lagi.`}</p>
        <div class="row-btns">${pass ? `<a class="gbtn y" href="#/bagian/penutup">Ke penutup ${icon('right')}</a><a class="gbtn w" href="#/sertifikat">${icon('award')} Sertifikat</a>` : `<a class="gbtn y" href="#/bagian/kegunaan-email">${icon('book')} Pelajari ulang</a><button type="button" class="gbtn w" data-retry>${icon('refresh')} Coba evaluasi lagi</button>`}</div>
      </div></section>`;
    if (animated) {
      const ring = $('.ring', el), b = $('.ring b', el), t0 = performance.now();
      setTimeout(() => ring.style.setProperty('--p', E.score), 60);
      const step = t => { const k = Math.min(1, (t - t0) / 1200); b.textContent = Math.round(E.score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      later(() => { b.textContent = E.score; ring.style.setProperty('--p', E.score); }, 1500);
      if (pass) celebrate();
    }
  };
  const submit = () => {
    const total = EVALUASI.reduce((sum, q, k) => sum + qScore(q, E.ans[k]), 0);
    E.score = Math.round(total / N * 100); E.done = true; save(); updateBar(); logAct('ev', 'evaluasi-akhir', { s: E.score });
    evFocus(true);
    el.innerHTML = `<div class="sending"><span class="plane">${icon('send')}</span><b>Menghitung nilai…</b></div>`;
    if (E.score >= KKM) done(true);
    later(() => { sfx(E.score >= KKM ? 'ok' : 'no'); result(true); }, reduced ? 0 : 1100);
  };
  if (E.done) { result(false); if (E.score >= KKM) done(true); }
  else if (E.started) render(); else intro();
  el.onclick = e => {
    if (e.target.closest('[data-start]')) { E.started = true; save(); sfx(); render(); scrollTo({ top: 0 }); return; }
    if (e.target.closest('[data-retry]')) { EVALUASI.forEach(q => { q._ord = null; }); state.ev = { v: 3, i: 0, ans: {}, done: false, started: true }; save(); updateBar(); ACT['evaluasi-akhir'](el, done); return; }
    const sv = e.target.closest('[data-save]');
    if (sv && !sv.disabled) {
      sfx();
      const k = E.i;
      tanya({ back: sv, ic: 'lock', title: `Simpan jawaban soal ${k + 1}?`, body: 'Setelah disimpan, jawaban ini tidak bisa diubah lagi.' + (k === N - 1 ? ' Ini soal terakhir, jadi nilaimu langsung dihitung.' : ''), ok: 'Ya, simpan', cancel: 'Cek lagi' }).then(ya => {
        if (!ya || E.i !== k) return;
        sfx('ok'); E.i++; save(); if (E.i >= N) submit(); else { render(); scrollTo({ top: 0 }); }
      });
    }
  };
};

/* penutup — rangkuman + masukan */
ACT['penutup'] = (el, done) => {
  if (!evalPassed()) { el.innerHTML = `<div class="lockbox"><a href="#/bagian/evaluasi-akhir" title="Ke evaluasi">${icon('lock')}</a><h3>Penutup belum terbuka</h3><p class="muted">Lulus evaluasi dulu, baru halaman ini bisa dibuka.</p><a class="btn btn-primary" href="#/bagian/evaluasi-akhir">Ke evaluasi ${icon('right')}</a></div>`; return; }
  const fb = state.feedback;
  const thanks = f => `<div class="thanks"><a href="#/" title="Beranda">${icon('check')}</a><h3>Makasih, masukanmu sudah masuk.</h3><p class="muted">Nilai ${f.rate}/5${f.saran ? ` · “${esc(f.saran)}”` : ''}</p></div>`;
  el.innerHTML = `<div class="infog" id="infog">
    <div class="ig-head"><a class="brand-mark sm" href="#/" title="Beranda">${LOGO}</a><div><b>SMART EMAILING</b><small>Rangkuman pelatihan</small></div></div>
    <div class="ig-grid">
      <div class="ig"><h4 data-to="#/bagian/bagian-email" title="Buka bagian email">${icon('layers')} Bagian email</h4><ol><li>Subject</li><li>Salam pembuka</li><li>Isi email</li><li>Salam penutup</li><li>Tanda tangan</li></ol></div>
      <div class="ig"><h4 data-to="#/bagian/praktik-email" title="Buka praktik menulis email">${icon('list')} Cek sebelum kirim</h4><ul class="ticks"><li>Subject jelas</li><li>Salam sesuai</li><li>Perkenalan singkat</li><li>Lampiran disebutkan</li><li>Bahasa formal</li></ul></div>
      <div class="ig"><h4 data-to="#/bagian/cc-bcc-waktu" title="Buka materi CC, BCC, dan waktu mengirim">${icon('users')} CC dan BCC</h4><p><b>CC</b>: salinan, penerimanya terlihat.</p><p><b>BCC</b>: salinan, penerimanya disembunyikan.</p></div>
      <div class="ig"><h4 data-to="#/bagian/cc-bcc-waktu" title="Buka materi CC, BCC, dan waktu mengirim">${icon('clock')} Waktu kirim</h4><p class="ig-big">08.00–17.00</p><p>Di jam kerja. Hindari larut malam dan hari libur.</p></div>
      <div class="ig"><h4 data-to="#/bagian/follow-up" title="Buka materi follow-up">${icon('calendar')} Follow-up</h4><p class="ig-big">5–7 hari kerja</p><p>Kalau belum ada kabar. Sopan, singkat, tidak memaksa.</p></div>
      <div class="ig"><h4 data-to="#/bagian/bahasa-formal" title="Buka materi bahasa formal">${icon('type')} Bahasa</h4><p>Jelas dan sopan. Tanpa bahasa gaul, singkatan, emoji, atau kapital berlebihan.</p></div>
    </div>
  </div>
  <div class="row-btns"><button type="button" class="btn btn-outline btn-sm" data-print>${icon('printer')} Simpan rangkuman (PDF)</button><a class="btn btn-gold btn-sm" href="#/sertifikat">${icon('award')} Ambil sertifikat</a><a class="btn btn-outline btn-sm" href="#/progres">${icon('star')} Pencapaianku</a></div>
  <div class="feedback" id="fbBox">${fb ? thanks(fb) : `<h3>Beri masukan</h3><form id="fbForm">
    <div class="stars" role="radiogroup" aria-label="Nilai 1 sampai 5">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="rate" value="${n}"><span>${icon('star')}</span><em>${n}</em></label>`).join('')}</div>
    <label class="saran">Saran<textarea name="saran" rows="2" placeholder="Apa yang bisa diperbaiki dari pelatihan ini?"></textarea></label>
    <button class="btn btn-primary btn-sm" type="submit">${icon('send')} Kirim masukan</button></form>`}</div>`;
  $('[data-print]', el).onclick = () => { document.body.classList.add('print-infog'); window.print(); setTimeout(() => document.body.classList.remove('print-infog'), 500); };
  const form = $('#fbForm', el);
  if (form) form.onsubmit = e => { e.preventDefault(); const r = form.querySelector('input[name=rate]:checked'); if (!r) { toast('Pilih nilai 1–5 dulu, ya.'); return; } state.feedback = { rate: +r.value, saran: form.saran.value.trim() }; save(); sfx('ok'); $('#fbBox', el).innerHTML = thanks(state.feedback); };
  done(false);
};

/* =========================================================================
   LAYAR PANDUAN
   ========================================================================= */
const GLOSARIUM = [
  ['BCC (Blind Carbon Copy)', 'Mengirim salinan email dengan alamat penerima yang disembunyikan dari penerima lain.', 'cc-bcc-waktu'],
  ['CC (Carbon Copy)', 'Mengirim salinan email kepada orang lain yang perlu tahu isinya. Alamatnya terlihat oleh semua penerima.', 'cc-bcc-waktu'],
  ['CV dan portofolio', 'Dokumen pendukung lamaran. Kirim dalam format PDF dengan nama file yang rapi.', 'perkenalan-dan-cv'],
  ['Email lamaran kerja', 'Email untuk memperkenalkan diri, menyampaikan minat pada posisi tertentu, dan mengirim CV serta portofolio.', 'susunan-email'],
  ['Evaluasi akhir', 'Empat soal akhir tanpa tanda benar atau salah. Jawaban dikunci setelah disimpan, dan hanya nilai akhir yang ditampilkan.', 'evaluasi-akhir'],
  ['Follow-up', 'Email untuk menanyakan kabar proses rekrutmen, biasanya 5–7 hari kerja setelah lamaran dikirim.', 'follow-up'],
  ['Isi email', 'Bagian yang memuat pesan utama, ditulis jelas dan ringkas.', 'bagian-email'],
  ['Jam kerja', 'Waktu yang pas untuk mengirim email profesional, sekitar pukul 08.00–17.00.', 'cc-bcc-waktu'],
  ['Lampiran', 'File yang ikut dikirim bersama email, misalnya CV dan portofolio.', 'perkenalan-dan-cv'],
  ['Salam pembuka', 'Kalimat pembuka yang menunjukkan rasa hormat, misalnya “Yth. Tim Rekrutmen PT ABC,”.', 'subject-dan-salam'],
  ['Salam penutup', 'Kalimat penutup yang sopan, misalnya “Hormat saya,” lalu diikuti nama.', 'subject-dan-salam'],
  ['Subject', 'Judul email. Bagian pertama yang dilihat penerima, jadi harus singkat, jelas, dan spesifik.', 'subject-dan-salam'],
  ['Tanda tangan', 'Nama pengirim di bagian paling bawah email.', 'bagian-email'],
];
const pageWrap = (eyebrow, title, inner, grup = 'Panduan') => `<div class="page wrap"><article class="sheet wide"><div class="eyebrow">${grup} · ${eyebrow}</div><h1 class="display">${title}</h1>${inner}</article></div>`;

/* =========================================================================
   ROUTER
   ========================================================================= */
/* =========================================================================
   GAMIFIKASI — poin (XP), level, lencana, dan sertifikat.
   Semua dihitung ulang dari progres, jadi tidak bisa dobel dan ikut terhapus saat progres direset.
   ========================================================================= */
const latBenar = () => state.lat ? Object.values(state.lat.res || {}).filter(Boolean).length : 0;
const latDikerjakan = () => state.lat ? Object.keys(state.lat.res || {}).length : 0;
const evScore = () => state.ev && state.ev.done ? state.ev.score : null;
function xpParts() {
  const ev = evScore();
  return [
    ['inbox', 'Pengantar', state.done['pengantar'] ? 20 : 0, 20],
    ['book', 'Bagian materi (50/bagian)', MATERI_BAGIAN.filter(id => state.done[id]).length * 50, MATERI_BAGIAN.length * 50],
    ['pen', 'Soal latihan benar (20/soal)', latBenar() * 20, LATIHAN.length * 20],
    ['star', 'Bonus combo latihan (10 × combo terbaik)', Math.min(state.lat && state.lat.best || 0, LATIHAN.length) * 10, LATIHAN.length * 10],
    ['grid', 'Aktivitas interaktif (30/aktivitas)', AKT_KEYS.filter(k => state.akt && state.akt[k] && state.akt[k].done).length * 30, 90],
    ['flag', 'Nilai evaluasi (×3)', ev === null ? 0 : ev * 3, 300],
    ['award', 'Bonus lulus evaluasi', evalPassed() ? 100 : 0, 100],
    ['check', 'Penutup', state.done['penutup'] ? 30 : 0, 30],
  ];
}
const xpTotal = () => xpParts().reduce((t, p) => t + p[2], 0);
const xpMax = () => xpParts().reduce((t, p) => t + p[3], 0);
const LEVELS = [[0, 'Pemula'], [200, 'Pengirim Rapi'], [500, 'Penulis Lamaran'], [900, 'Komunikator Sopan'], [1300, 'Email Profesional']];
function levelOf(xp) {
  let k = 0; LEVELS.forEach(([min], i) => { if (xp >= min) k = i; });
  const nx = LEVELS[k + 1];
  return { n: k + 1, name: LEVELS[k][1], min: LEVELS[k][0], next: nx ? nx[0] : null, nextName: nx ? nx[1] : null, pct: nx ? Math.round((xp - LEVELS[k][0]) / (nx[0] - LEVELS[k][0]) * 100) : 100 };
}
const materiSelesai = mid => MATERI.find(m => m.id === mid).bagian.every(id => state.done[id]);
const BADGES = [
  { k: 'mulai', ic: 'inbox', t: 'Langkah Pertama', d: 'Menyelesaikan pengantar.', to: '#/bagian/pengantar', ok: () => !!state.done['pengantar'] },
  { k: 'm1', ic: 'mail', t: 'Paham Dasar Email', d: 'Menyelesaikan semua bagian Dasar Komunikasi lewat Email.', to: '#/bagian/kegunaan-email', ok: () => materiSelesai('m1') },
  { k: 'm2', ic: 'briefcase', t: 'Siap Melamar', d: 'Menyelesaikan semua bagian Menulis Email Lamaran Kerja.', to: '#/bagian/susunan-email', ok: () => materiSelesai('m2') },
  { k: 'm3', ic: 'shield', t: 'Beretika', d: 'Menyelesaikan semua bagian Etika Berkirim Email.', to: '#/bagian/cc-bcc-waktu', ok: () => materiSelesai('m3') },
  { k: 'rajin', ic: 'pen', t: 'Capaian Terpenuhi', d: `Latihan minimal ${LAT_MIN} dari ${LATIHAN.length} benar.`, to: '#/bagian/latihan-soal', ok: () => latBenar() >= LAT_MIN },
  { k: 'jitu', ic: 'target', t: 'Latihan Sempurna', d: 'Semua soal latihan dijawab benar.', to: '#/bagian/latihan-soal', ok: () => latBenar() === LATIHAN.length },
  { k: 'combo', ic: 'star', t: 'Tak Terbendung', d: 'Combo 5× di latihan soal.', to: '#/bagian/latihan-soal', ok: () => !!(state.lat && state.lat.best >= 5) },
  { k: 'akt', ic: 'grid', t: 'Serba Bisa', d: 'Menyelesaikan ketiga aktivitas interaktif.', to: '#/bagian/aktivitas-interaktif', ok: aktDone },
  { k: 'lulus', ic: 'flag', t: 'Lulus Evaluasi', d: `Nilai evaluasi minimal ${KKM}.`, to: '#/bagian/evaluasi-akhir', ok: evalPassed },
  { k: 'seratus', ic: 'award', t: 'Nilai Sempurna', d: 'Nilai evaluasi 100.', to: '#/bagian/evaluasi-akhir', ok: () => evScore() === 100 },
  { k: 'masukan', ic: 'chat', t: 'Memberi Masukan', d: 'Mengisi masukan di penutup.', to: '#/bagian/penutup', ok: () => !!state.feedback },
];
const badgesGot = () => BADGES.filter(b => b.ok());

/* Dipanggil setiap progres disimpan: munculkan +XP, lencana baru, dan naik level */
let popQ = Promise.resolve();
function gameCheck() {
  const xp = xpTotal(), got = badgesGot().map(b => b.k), g = state.game;
  if (!g || !Array.isArray(g.got)) { state.game = Object.assign(g || {}, { xp, got }); return; }
  const baru = got.filter(k => !g.got.includes(k)), naik = levelOf(xp).n > levelOf(g.xp).n, gain = xp - g.xp;
  g.xp = xp; g.got = got;
  if (gain > 0) xpFloat(gain);
  if (baru.length > 2) unlockPop(icon('award'), `${baru.length} lencana baru`, BADGES.filter(x => baru.includes(x.k)).map(x => x.t).join(' · '), '#/progres');
  else baru.forEach(k => { const b = BADGES.find(x => x.k === k); unlockPop(icon(b.ic), 'Lencana baru', b.t, '#/progres'); });
  if (naik) { const L = levelOf(xp); unlockPop(`<b class="lv-n">${L.n}</b>`, 'Naik level', `Level ${L.n} · ${L.name}`, '#/progres'); }
}
function comboPop(n) {
  const el = document.createElement('div'); el.className = 'combo'; el.innerHTML = `<b>Combo ${n}×</b><small>${n} jawaban benar berturut-turut</small>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1500);
}
function xpFloat(gain) {
  const chip = $('#xpChip'); if (!chip) return;
  const r = chip.getBoundingClientRect(), f = document.createElement('span');
  f.className = 'xp-float'; f.textContent = `+${gain} XP`;
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.bottom + 6) + 'px';
  document.body.appendChild(f); setTimeout(() => f.remove(), 1700);
  chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
}
function unlockPop(art, kicker, title, href) {
  popQ = popQ.then(() => new Promise(res => {
    const el = document.createElement('a');
    el.className = 'unlock'; el.href = href; el.setAttribute('role', 'status');
    el.innerHTML = `<span class="ul-art">${art}</span><span><small>${kicker}</small><b>${title}</b></span>`;
    document.body.appendChild(el); sfx('ok');
    setTimeout(() => el.classList.add('show'), 30);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => { el.remove(); res(); }, 400); }, 2800);
  }));
}
const badgeTile = b => { const on = b.ok(); return `<a class="bdg ${on ? 'on' : ''}" href="${b.to}" title="${on ? 'Didapat' : 'Belum didapat'}: ${b.d}"><span class="bdg-ic">${icon(on ? b.ic : 'lock')}</span><b>${b.t}</b><small>${b.d}</small></a>`; };
const levelCard = (cls = '') => { const xp = xpTotal(), L = levelOf(xp); return `<div class="lv-card ${cls}">
  <span class="lv-badge"><small>Level</small><b>${L.n}</b></span>
  <div class="lv-body"><small>${xp} XP dari ${xpMax()}</small><b>${L.name}</b>
    <span class="bar"><i style="width:${L.pct}%"></i></span>
    <small>${L.next !== null ? `${L.next - xp} XP lagi menuju <b>${L.nextName}</b>` : 'Kamu sudah di level tertinggi'}</small></div></div>`; };

function pencapaianBody() {
  const got = badgesGot().length;
  return `<h2 class="h2">Pencapaian</h2>
    <p class="muted">XP didapat dari bagian yang selesai, jawaban latihan yang benar, dan nilai evaluasi. Makin banyak XP, makin tinggi levelmu.</p>
    ${levelCard('big')}
    <h2 class="h2">Asal XP</h2>
    <div class="xp-list">${xpParts().map(([ic, t, v, m]) => `<div class="xp-row ${v >= m ? 'full' : ''}"><span class="xp-ic">${icon(ic)}</span><span>${t}</span><span class="bar"><i style="width:${m ? v / m * 100 : 0}%"></i></span><b>${v}/${m}</b></div>`).join('')}</div>
    <h2 class="h2">Lencana <small class="muted">${got}/${BADGES.length}</small></h2>
    <div class="bdg-grid">${BADGES.map(badgeTile).join('')}</div>
    <h2 class="h2">Tangga level</h2>
    <ol class="lv-ladder">${LEVELS.map(([min, n], i) => `<li class="${xpTotal() >= min ? 'on' : ''}"><b>${i + 1}</b><span>${n}</span><small>${min} XP</small></li>`).join('')}</ol>
    <div class="cert-cta">${icon(evalPassed() ? 'award' : 'lock')}<div><b>Sertifikat</b><p class="muted">${evalPassed() ? 'Kamu sudah lulus evaluasi. Sertifikatmu siap dicetak.' : `Terbuka setelah kamu lulus evaluasi dengan nilai minimal ${KKM}.`}</p></div><a class="btn ${evalPassed() ? 'btn-gold' : 'btn-outline'}" href="${evalPassed() ? '#/sertifikat' : gateOk() ? '#/bagian/evaluasi-akhir' : '#/bagian/awal-evaluasi'}">${evalPassed() ? 'Lihat sertifikat' : materiDone() ? 'Ke evaluasi' : 'Lanjutkan belajar'} ${icon('right')}</a></div>`;
}

function viewSertifikat() {
  if (!evalPassed()) return pageWrap('Sertifikat', 'Sertifikat belum terbuka', `<div class="lockbox"><a href="#/bagian/awal-evaluasi" title="Ke evaluasi">${icon('lock')}</a><h3>Lulus evaluasi dulu, ya</h3><p class="muted">Sertifikat terbuka setelah nilai evaluasimu minimal ${KKM}.</p><a class="btn btn-primary" href="${materiDone() ? '#/bagian/awal-evaluasi' : resumeHref()}">${materiDone() ? 'Ke evaluasi' : 'Lanjutkan belajar'} ${icon('right')}</a></div>`, 'Progres');
  const g = state.game || {};
  if (!g.tgl) { g.tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); save(); }
  const L = levelOf(xpTotal());
  return `<div class="page wrap cert-page">
    <div class="cert-tools"><label class="cert-name">Nama di sertifikat<input id="certNama" type="text" maxlength="60" placeholder="Tulis nama lengkapmu" value="${esc(g.nama || '')}"></label>
      <button type="button" class="btn btn-gold" id="certPrint">${icon('printer')} Cetak / simpan PDF</button></div>
    <div class="cert" id="cert">
      <div class="cert-in">
        <span class="cert-logo">${LOGO}</span>
        <small class="cert-k">Sertifikat penyelesaian</small>
        <h1>Smart Emailing</h1>
        <p>Diberikan kepada</p>
        <b class="cert-nm" id="certNm">${esc(g.nama || 'Nama Peserta')}</b>
        <p>atas keberhasilannya menyelesaikan pelatihan <b>Menulis Email Lamaran Kerja</b> yang rapi, sopan, dan sesuai etika komunikasi profesional.</p>
        <div class="cert-stats"><div><b>${evScore()}</b><small>Nilai evaluasi</small></div><div><b>${L.n}</b><small>${L.name}</small></div><div><b>${badgesGot().length}/${BADGES.length}</b><small>Lencana</small></div></div>
        <div class="cert-foot"><span>${g.tgl}</span><span>Kelompok 7</span></div>
      </div>
    </div>
  </div>`;
}
function mountSertifikat() {
  const inp = $('#certNama'); if (!inp) return;
  inp.oninput = () => { state.game.nama = inp.value.trim(); save(); $('#certNm').textContent = state.game.nama || 'Nama Peserta'; };
  $('#certPrint').onclick = () => { if (!state.game.nama) { toast('Tulis namamu dulu, ya.'); inp.focus(); return; } document.body.classList.add('print-cert'); window.print(); setTimeout(() => document.body.classList.remove('print-cert'), 500); };
}

/* =========================================================================
   DATA BERSAMA — riwayat aktivitas, posisi belajar terakhir, pengaturan tampilan.
   Semua halaman (beranda, latihan, progres) membaca dari state yang sama.
   ========================================================================= */
const UI = () => (state.ui = state.ui || {});
function logAct(k, id, extra = {}) {
  const L = state.log = state.log || [];
  const last = L[L.length - 1];
  /* membuka bagian yang sama berturut-turut cukup diperbarui waktunya, tidak dicatat dobel */
  if (k === 'open' && last && last.k === 'open' && last.id === id && dayKey(last.t) === dayKey(Date.now())) { last.t = Date.now(); save(); return; }
  L.push({ t: Date.now(), k, id, ...extra });
  if (L.length > 2000) L.splice(0, L.length - 2000);
  save();
}
const setResume = (href, kind, id) => { state.resume = { href, kind, id, t: Date.now() }; save(); };
const sejak = t => {
  const d = Math.max(0, Date.now() - t) / 1000;
  if (d < 60) return 'baru saja';
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  if (d < 172800) return 'kemarin';
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};
const durasi = ms => { const m = Math.round(ms / 60000); return m < 1 ? '< 1 menit' : `${m} menit`; };

/* ---------- Latihan pilihan ganda: 15 soal yang sama, dikelompokkan per materi ---------- */
const LAT_SETS = [{ id: 'm1', from: 0 }, { id: 'm2', from: 5 }, { id: 'm3', from: 10 }].map(S => {
  const m = MATERI.find(x => x.id === S.id);
  return { ...S, no: m.no, title: `Latihan ${m.short}`, topik: m.title, desc: m.desc, ix: [0, 1, 2, 3, 4].map(k => S.from + k) };
});
/* bagian materi yang dibahas setiap soal latihan (untuk pembahasan) */
const LAT_REL = ['kegunaan-email', 'bagian-email', 'subject-dan-salam', 'subject-dan-salam', 'bagian-email', 'susunan-email', 'susunan-email', 'perkenalan-dan-cv', 'perkenalan-dan-cv', 'kesalahan-email', 'cc-bcc-waktu', 'cc-bcc-waktu', 'follow-up', 'follow-up', 'bahasa-formal'];
const latState = () => (state.lat = state.lat || { v: 3, i: 0, ans: {}, res: {} });
const setInfo = id => { const L = latState(); L.sets = L.sets || {}; return (L.sets[id] = L.sets[id] || {}); };
const setOf = id => LAT_SETS.find(S => S.id === id);
function setStat(S) {
  const L = latState(), inf = (L.sets || {})[S.id] || {};
  const dijawab = S.ix.filter(g => L.res[g] !== undefined).length, benar = S.ix.filter(g => L.res[g] === true).length;
  /* data lama (sebelum ada tombol Selesai) yang sudah terjawab semua dianggap selesai */
  const status = inf.finished || dijawab === S.ix.length ? 'done' : dijawab || inf.startedAt ? 'go' : 'new';
  const last = inf.last || (dijawab === S.ix.length ? { benar, n: S.ix.length } : null);
  return { dijawab, benar, n: S.ix.length, status, last, tries: (inf.tries || []).length };
}
const STATUS_TXT = { new: 'Belum mulai', go: 'Sedang dikerjakan', done: 'Selesai' };
const aktStat = k => { const s = (state.akt || {})[k] || {}; return { status: s.done ? 'done' : s.i || s.ans ? 'go' : 'new', score: s.score }; };
const latDijawab = () => Object.keys(latState().res || {}).length;

function exCard(S) {
  const st = setStat(S), lk = locked('latihan-soal'), pctAns = Math.round(st.dijawab / st.n * 100);
  const cta = lk ? `<span class="btn btn-outline btn-sm" aria-disabled="true">${icon('lock')} Terkunci</span>`
    : st.status === 'done' ? `<a class="btn btn-outline btn-sm" href="#/latihan/${S.id}/hasil">Lihat hasil</a><a class="btn btn-primary btn-sm" href="#/latihan/${S.id}" data-retry-set="${S.id}">${icon('refresh')} Ulangi</a>`
    : `<a class="btn btn-primary btn-sm" href="#/latihan/${S.id}">${st.status === 'go' ? 'Lanjutkan' : 'Mulai latihan'} ${icon('right')}</a>`;
  return `<article class="ex-card ${st.status} ${lk ? 'locked' : ''}">
    <div class="ex-top"><span class="ex-no">${S.no}</span><span class="ex-st ${st.status}">${STATUS_TXT[st.status]}</span></div>
    <h3>${S.title}</h3><small class="ex-topik">${S.topik}</small>
    <div class="ex-meta"><span>${icon('list')} ${st.n} soal</span><span>${icon('award')} ${st.last ? `Nilai terakhir ${Math.round(st.last.benar / st.last.n * 100)}` : 'Belum ada nilai'}</span></div>
    <div class="ex-prog"><span class="bar"><i style="width:${pctAns}%"></i></span><b>${st.dijawab}/${st.n}</b></div>
    <div class="ex-cta">${cta}</div>
  </article>`;
}
function aktCard(k) {
  const [L, ic, t, d, max] = AKT_INFO[k], st = aktStat(k), lk = locked('aktivitas-interaktif');
  return `<article class="ex-card ${st.status} ${lk ? 'locked' : ''}">
    <div class="ex-top"><span class="ex-no">${icon(ic)}</span><span class="ex-st ${st.status}">${STATUS_TXT[st.status]}</span></div>
    <h3>Aktivitas ${L} · ${t}</h3><small class="ex-topik">${d}</small>
    <div class="ex-meta"><span>${icon('award')} ${st.status === 'done' ? `Skor ${st.score}/${max}` : 'Belum ada skor'}</span></div>
    <div class="ex-cta">${lk ? `<span class="btn btn-outline btn-sm" aria-disabled="true">${icon('lock')} Selesaikan latihan soal dulu</span>` : `<a class="btn ${st.status === 'done' ? 'btn-outline' : 'btn-primary'} btn-sm" href="#/bagian/aktivitas-interaktif" data-akt-open="${k}">${st.status === 'done' ? 'Kerjakan lagi' : 'Mulai aktivitas'} ${icon('right')}</a>`}</div>
  </article>`;
}
function retrySet(id) {
  const S = setOf(id), L = latState();
  S.ix.forEach(g => { delete L.ans[g]; delete L.res[g]; });
  const inf = setInfo(id); inf.finished = false; inf.i = 0; inf.startedAt = null; L.streak = 0;
  save(); updateBar();
}
/* klik tombol "Ulangi" / "Mulai aktivitas" di kartu mana pun */
document.addEventListener('click', e => {
  const r = e.target.closest('[data-retry-set]');
  if (r) {
    e.preventDefault();
    tanya({ back: r, ic: 'refresh', title: 'Ulangi latihan ini?', body: 'Jawaban dan skor latihan ini akan dihapus' + (gateOk() && !evalPassed() ? ', dan syarat evaluasi bisa belum terpenuhi lagi.' : '.'), ok: 'Ya, ulangi' }).then(ya => {
      if (!ya) return;
      retrySet(r.dataset.retrySet);
      const h = r.getAttribute('href');
      if (h && location.hash !== h) location.hash = h; else route();
    });
    return;
  }
  const a = e.target.closest('[data-akt-open]'); if (a) { state.aktOpen = a.dataset.aktOpen; save(); }
});

/* ---------- Halaman daftar latihan ---------- */
function viewLatihanList() {
  const benar = latSkor(), lk = locked('latihan-soal');
  return `<div class="page wrap lms">
    <header class="ph"><div><h1>Latihan</h1><p>Latihan soal per materi dan aktivitas interaktif. Hasilnya dipakai untuk syarat evaluasi.</p></div>
      <div class="ph-sum"><div><b>${benar}/${LATIHAN.length}</b><small>soal benar</small></div><div><b>${AKT_KEYS.filter(k => aktStat(k).status === 'done').length}/3</b><small>aktivitas selesai</small></div><div class="${benar >= LAT_MIN ? 'ok' : ''}"><b>${benar >= LAT_MIN ? icon('check') : `${LAT_MIN}`}</b><small>${benar >= LAT_MIN ? 'syarat latihan terpenuhi' : 'benar minimal untuk evaluasi'}</small></div></div></header>
    ${lk ? `<div class="note-lock">${icon('lock')}<div><b>Latihan masih terkunci</b><p>Selesaikan semua bagian materi dulu. ${MATERI_BAGIAN.filter(id => state.done[id]).length} dari ${MATERI_BAGIAN.length} bagian materi sudah selesai.</p></div><a class="btn btn-primary btn-sm" href="${resumeHref()}">Lanjutkan materi ${icon('right')}</a></div>` : ''}
    <h2 class="sec-h">Latihan soal <small>pilihan ganda · pembahasan langsung muncul</small></h2>
    <div class="ex-grid">${LAT_SETS.map(exCard).join('')}</div>
    <h2 class="sec-h">Aktivitas interaktif <small>bersama Salsa Rahma</small></h2>
    <div class="ex-grid">${AKT_KEYS.map(aktCard).join('')}</div>
  </div>`;
}

/* ---------- Layar kuis: satu soal per layar ---------- */
function quizLock() {
  return `<div class="page wrap lms"><article class="sheet"><div class="lockbox">${icon('lock')}<h3>Latihan masih terkunci</h3><p class="muted">Selesaikan semua bagian materi dulu.</p><a class="btn btn-primary" href="${resumeHref()}">Lanjutkan materi ${icon('right')}</a></div></article></div>`;
}
function viewQuiz(S) {
  if (locked('latihan-soal')) return quizLock();
  return `<div class="quiz wrap" id="quiz"></div>`;
}
function mountQuiz(S) {
  if (locked('latihan-soal')) return;
  const L = latState(), inf = setInfo(S.id), box = $('#quiz'), n = S.ix.length;
  inf.i = Math.min(inf.i || 0, n - 1);
  setResume('#/latihan/' + S.id, 'lat', S.id);
  let dir = 0;
  const render = () => {
    const k = inf.i, g = S.ix[k], q = LATIHAN[g], checked = L.res[g] !== undefined, a = L.ans[g] === undefined ? null : L.ans[g];
    const dijawab = S.ix.filter(x => L.res[x] !== undefined).length;
    box.innerHTML = `<header class="qz-head">
        <a class="qz-x" href="#/latihan" aria-label="Keluar ke daftar latihan">${icon('left')}<span>Latihan</span></a>
        <div class="qz-t"><b>${S.title}</b><small>${S.topik}</small></div>
        <span class="qz-count">Soal <b>${k + 1}</b> dari ${n}</span>
      </header>
      <div class="qz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${dijawab}"><i style="width:${dijawab / n * 100}%"></i></div>
      <nav class="qz-nav" aria-label="Navigasi soal">${S.ix.map((x, j) => `<button type="button" data-q="${j}" class="${j === k ? 'cur' : ''} ${L.res[x] === true ? 'ok' : L.res[x] === false ? 'no' : L.ans[x] !== undefined ? 'picked' : ''}" aria-label="Soal ${j + 1}${L.res[x] !== undefined ? ' (sudah dijawab)' : ''}">${j + 1}</button>`).join('')}</nav>
      <section class="qz-card"><span class="act-tag">${icon('pen')} ${q.topic}</span><div id="qbox"></div><div class="fb" id="qfb" hidden></div><div id="qrel"></div></section>
      <footer class="qz-foot">
        <button type="button" class="btn btn-outline" data-prev ${k === 0 ? 'disabled' : ''}>${icon('left')} Sebelumnya</button>
        <div class="qz-main">${checked ? '' : `<button type="button" class="btn btn-primary" data-check ${a === null ? 'disabled' : ''}>Jawab</button>`}
          <button type="button" class="btn ${dijawab === n ? 'btn-gold' : 'btn-outline'}" data-finish>${icon('flag')} Selesai</button></div>
        <button type="button" class="btn ${checked && k < n - 1 ? 'btn-primary' : 'btn-outline'}" data-next ${k === n - 1 ? 'disabled' : ''}>Berikutnya ${icon('right')}</button>
      </footer>`;
    qRender($('#qbox', box), q, a, { mode: 'latihan', checked, onChange: v => { L.ans[g] = v; save(); dir = 0; render(); } });
    if (checked) {
      showFb($('#qfb', box), L.res[g], `${L.res[g] ? 'Benar.' : `Belum tepat. Jawaban yang tepat: <b>${q.opts[q.a]}</b>.`} ${q.why}`);
      const r = LAT_REL[g];
      $('#qrel', box).innerHTML = `<a class="qz-rel" href="#/bagian/${r}">${icon('book')} Materi terkait: ${BAGIAN[r].title}</a>`;
    }
    if (dir && !reduced) { const c = $('.qz-card', box); try { c.animate([{ opacity: 0, transform: `translateX(${dir * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }); } catch (e) { /* tanpa animasi */ } }
  };
  const go = j => { if (j < 0 || j >= n || j === inf.i) return; dir = j > inf.i ? 1 : -1; inf.i = j; save(); sfx(); render(); };
  const finish = async () => {
    const sisa = S.ix.filter(x => L.res[x] === undefined).length;
    if (sisa && !(await tanya({ ic: 'flag', title: 'Selesaikan latihan?', body: `Masih ada ${sisa} soal yang belum dijawab dan akan dihitung salah.`, ok: 'Tetap selesai', cancel: 'Kembali menjawab' }))) return;
    const benar = S.ix.filter(x => L.res[x] === true).length, now = Date.now();
    const hasil = { benar, n, at: now, dur: inf.startedAt ? now - inf.startedAt : null, ok: S.ix.map(x => L.res[x] === true), ans: S.ix.map(x => (L.res[x] === undefined || L.ans[x] === undefined ? null : L.ans[x])) };
    inf.tries = inf.tries || []; inf.tries.push(hasil); if (inf.tries.length > 20) inf.tries.shift();
    inf.last = hasil; inf.finished = true; save();
    logAct('lat', S.id, { b: benar, n });
    updateBar(); sfx(benar / n >= .7 ? 'ok' : 'no');
    location.hash = `#/latihan/${S.id}/hasil`;
  };
  render();
  box.onclick = e => {
    const qb = e.target.closest('[data-q]'); if (qb) { go(+qb.dataset.q); return; }
    if (e.target.closest('[data-prev]')) { go(inf.i - 1); return; }
    if (e.target.closest('[data-next]')) { go(inf.i + 1); return; }
    if (e.target.closest('[data-finish]')) { finish(); return; }
    if (e.target.closest('[data-check]')) {
      const g = S.ix[inf.i], ok = qScore(LATIHAN[g], L.ans[g]) === 1;
      if (!inf.startedAt) inf.startedAt = Date.now();
      L.res[g] = ok; L.streak = ok ? (L.streak || 0) + 1 : 0; L.best = Math.max(L.best || 0, L.streak);
      if (L.streak >= 2) comboPop(L.streak);
      /* semua 15 soal sudah dijawab: bagian Latihan Soal ikut selesai */
      if (latDijawab() === LATIHAN.length && !state.done['latihan-soal']) { state.done['latihan-soal'] = true; logAct('done', 'latihan-soal'); }
      save(); sfx(ok ? 'ok' : 'no'); dir = 0; render(); updateBar();
    }
  };
  const onKey = e => {
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') go(inf.i + 1);
    if (e.key === 'ArrowLeft') go(inf.i - 1);
  };
  document.addEventListener('keydown', onKey);
  onLeave(() => document.removeEventListener('keydown', onKey));
}

/* ---------- Hasil dan review latihan ---------- */
function viewQuizResult(S) {
  if (locked('latihan-soal')) return quizLock();
  const st = setStat(S), r = st.last;
  if (!r) return `<div class="page wrap lms"><div class="empty">${icon('pen')}<h3>Belum ada hasil</h3><p>Kerjakan ${S.title} dulu, hasilnya akan muncul di sini.</p><a class="btn btn-primary" href="#/latihan/${S.id}">Mulai latihan ${icon('right')}</a></div></div>`;
  const p = Math.round(r.benar / r.n * 100), capai = p >= 70, L = latState();
  return `<div class="page wrap lms">
    <section class="res ${capai ? 'ok' : 'no'}">
      <div class="ring big" style="--p:${p}"><b data-count="${p}">${p}</b><small>nilai</small></div>
      <div class="res-body"><small class="ph-k">${S.title} · ${S.topik}</small>
        <h1>${capai ? 'Capaian terpenuhi' : 'Belum terpenuhi'}</h1>
        <p>${capai ? 'Pemahamanmu di materi ini sudah baik.' : 'Baca lagi materi terkait di pembahasan, lalu coba ulangi latihannya.'}</p>
        <div class="res-stats"><div><b>${r.n}</b><small>soal</small></div><div class="ok"><b>${r.benar}</b><small>benar</small></div><div class="no"><b>${r.n - r.benar}</b><small>salah</small></div><div><b>${p}%</b><small>berhasil</small></div>${r.dur ? `<div><b>${durasi(r.dur)}</b><small>waktu</small></div>` : ''}</div>
        <div class="res-dots">${S.ix.map((g, j) => { const ok = r.ok ? r.ok[j] : L.res[g] === true; return `<span class="${ok ? 'ok' : 'no'}" title="Soal ${j + 1}: ${ok ? 'benar' : 'salah'}">${j + 1}</span>`; }).join('')}</div>
        <p class="muted small">Total latihan pilihan ganda: ${latSkor()}/${LATIHAN.length} benar (syarat evaluasi minimal ${LAT_MIN}).${st.tries > 1 ? ` Ini percobaan ke-${st.tries}.` : ''}</p>
        <div class="row-btns"><a class="btn btn-primary" href="#/latihan/${S.id}/review">${icon('eye')} Review jawaban</a><a class="btn btn-outline" href="#/latihan/${S.id}" data-retry-set="${S.id}">${icon('refresh')} Ulangi latihan</a><a class="btn btn-outline" href="#/latihan">${icon('list')} Daftar latihan</a></div>
      </div>
    </section>
  </div>`;
}
function viewQuizReview(S) {
  if (locked('latihan-soal')) return quizLock();
  const L = latState(), r = setStat(S).last;
  if (!r) return viewQuizResult(S);
  return `<div class="page wrap lms">
    <header class="ph"><div><small class="ph-k">${S.title} · Review jawaban</small><h1>Review jawaban</h1><p>Jawabanmu, jawaban yang tepat, dan pembahasannya.</p></div>
      <div class="row-btns"><a class="btn btn-outline btn-sm" href="#/latihan/${S.id}/hasil">${icon('left')} Hasil</a><a class="btn btn-primary btn-sm" href="#/latihan/${S.id}" data-retry-set="${S.id}">${icon('refresh')} Ulangi</a></div></header>
    <ol class="rv">${S.ix.map((g, j) => { const q = LATIHAN[g], a = r.ans ? r.ans[j] : L.ans[g], ok = r.ok ? r.ok[j] : L.res[g] === true, rel = LAT_REL[g]; return `<li class="rv-item ${ok ? 'ok' : 'no'}">
      <div class="rv-h"><span class="rv-n">${j + 1}</span><b>${q.q}</b><span class="badge ${ok ? 'ok' : 'no'}">${icon(ok ? 'check' : 'x')} ${ok ? 'Benar' : 'Salah'}</span></div>
      <p><small>Jawabanmu</small>${a === undefined || a === null ? '<i>tidak dijawab</i>' : q.opts[a]}</p>
      ${ok ? '' : `<p><small>Jawaban tepat</small>${q.opts[q.a]}</p>`}
      <p class="rv-why">${q.why} <a href="#/bagian/${rel}">${BAGIAN[rel].title} ${icon('right')}</a></p></li>`; }).join('')}</ol>
  </div>`;
}
function viewLatihanPage() {
  const [, id, sub] = location.hash.replace(/^#\/?/, '').split('/'), S = id && setOf(id);
  if (!S) return viewLatihanList();
  if (sub === 'hasil') return viewQuizResult(S);
  if (sub === 'review') return viewQuizReview(S);
  return viewQuiz(S);
}
function mountLatihanPage() {
  const [, id, sub] = location.hash.replace(/^#\/?/, '').split('/'), S = id && setOf(id);
  if (S && !sub) mountQuiz(S);
  if (S && sub === 'hasil') countUp();
}

/* ---------- Angka statistik naik pelan saat halaman dibuka ---------- */
function countUp() {
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count; if (reduced || !to) { el.textContent = to; return; }
    const t0 = performance.now(), step = t => { const k = Math.min(1, (t - t0) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* =========================================================================
   RINGKASAN BELAJAR (status evaluasi, lanjut belajar, aktivitas terbaru)
   ========================================================================= */
function evalTxt() {
  const ev = evScore();
  if (ev !== null) return [ev >= KKM ? 'Lulus' : 'Belum lulus', `Nilai ${ev}`];
  return gateOk() ? ['Siap', 'Syarat sudah terpenuhi'] : ['Terkunci', 'Penuhi 3 syarat dulu'];
}
const ACT_TXT = {
  open: e => [icon('book'), `Membuka ${BAGIAN[e.id] ? BAGIAN[e.id].title : ''}`, '#/bagian/' + e.id],
  done: e => [icon('check'), `Menyelesaikan ${BAGIAN[e.id] ? BAGIAN[e.id].title : ''}`, '#/bagian/' + e.id],
  lat: e => [icon('pen'), `Menyelesaikan ${setOf(e.id) ? setOf(e.id).title : 'latihan'} · ${e.b}/${e.n} benar`, `#/latihan/${e.id}/hasil`],
  akt: e => [icon('grid'), `Menyelesaikan Aktivitas ${AKT_INFO[e.id] ? AKT_INFO[e.id][0] + ' · ' + AKT_INFO[e.id][2] : ''} · skor ${e.s}`, '#/bagian/aktivitas-interaktif'],
  ev: e => [icon('flag'), `Mengerjakan evaluasi akhir · nilai ${e.s} (${e.s >= KKM ? 'lulus' : 'belum lulus'})`, '#/bagian/evaluasi-akhir'],
};
function activityList(max = 6) {
  const L = (state.log || []).filter(e => ACT_TXT[e.k]).slice(-max).reverse();
  if (!L.length) return `<div class="empty sm">${icon('clock')}<h3>Belum ada aktivitas tercatat</h3><p>Setiap bagian yang dibuka, latihan, dan evaluasi akan tercatat di sini.</p></div>`;
  return `<ol class="acts">${L.map(e => { const [ic, t, h] = ACT_TXT[e.k](e); return `<li class="act-${e.k}"><span class="act-ic">${ic}</span><a href="${h}">${t}</a><time>${sejak(e.t)}</time></li>`; }).join('')}</ol>`;
}
/* =========================================================================
   PROGRES BELAJAR — ringkasan per bagian + pencapaian (XP, lencana, sertifikat)
   ========================================================================= */
/* =========================================================================
   PROGRES BELAJAR — rute pos level, tugas minggu ini, dan koleksi segel.
   Semua dari data asli.
   ========================================================================= */
const DAY = 864e5;
const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const weekStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.getTime(); };
function aktivitasBelajar() {
  const week = (state.log || []).filter(e => e.t >= weekStart(Date.now()));
  return { week, hariIni: new Set(week.map(e => dayKey(e.t))) };
}
function tugasMinggu(a) {
  return [
    ['book', 'Selesaikan 2 bagian', a.week.filter(e => e.k === 'done').length, 2],
    ['clipcheck', 'Selesaikan 1 latihan soal', a.week.filter(e => e.k === 'lat').length, 1],
    ['calendar', 'Belajar di 3 hari berbeda', a.hariIni.size, 3],
  ];
}
/* progres setiap lencana: [nilai sekarang, target] */
const BADGE_PROG = {
  mulai: () => [state.done['pengantar'] ? 1 : 0, 1],
  m1: () => [MATERI.find(m => m.id === 'm1').bagian.filter(id => state.done[id]).length, 3],
  m2: () => [MATERI.find(m => m.id === 'm2').bagian.filter(id => state.done[id]).length, 4],
  m3: () => [MATERI.find(m => m.id === 'm3').bagian.filter(id => state.done[id]).length, 3],
  rajin: () => [Math.min(latBenar(), LAT_MIN), LAT_MIN],
  jitu: () => [latBenar(), LATIHAN.length],
  combo: () => [Math.min((state.lat && state.lat.best) || 0, 5), 5],
  akt: () => [AKT_KEYS.filter(k => state.akt && state.akt[k] && state.akt[k].done).length, 3],
  lulus: () => [Math.min(evScore() || 0, KKM), KKM],
  seratus: () => [evScore() || 0, 100],
  masukan: () => [state.feedback ? 1 : 0, 1],
};
/* rute pos: 5 perangko level di sepanjang jalur surat */
const RUTE_PT = [[6, 74], [28, 34], [50, 66], [72, 28], [93, 58]];
function ruteLevel() {
  const xp = xpTotal(), L = levelOf(xp), n = LEVELS.length;
  const pos = (L.n - 1 + (L.next !== null ? L.pct / 100 : 0)) / (n - 1) * 100;
  const P = RUTE_PT.map(([x, y]) => [x * 10, y * 2]);
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let k = 1; k < P.length; k++) { const [x0, y0] = P[k - 1], [x1, y1] = P[k], mx = (x0 + x1) / 2; d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; }
  return `<div class="rute">
    <svg class="rute-svg" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><path class="rute-bg" d="${d}" pathLength="100"/><path class="rute-fg" d="${d}" pathLength="100" style="--pos:${pos.toFixed(1)}"/></svg>
    ${LEVELS.map(([min, nama], k) => { const st = k < L.n - 1 ? 'done' : k === L.n - 1 ? 'cur' : 'next', [x, y] = RUTE_PT[k];
      return `<div class="pos ${st}" style="left:${x}%;top:${y}%"><span class="perangko"><b>${k + 1}</b>${st === 'done' ? `<i class="cap">${icon('check')}</i>` : ''}</span>${st === 'cur' ? `<span class="pesawat">${icon('send')}</span>` : ''}<span class="pos-l"><b>${nama}</b><small>${min} XP</small></span></div>`; }).join('')}
  </div>`;
}
function viewProgres() {
  const xp = xpTotal(), L = levelOf(xp), a = aktivitasBelajar(), T = tugasMinggu(a), got = badgesGot().length, ev = evalTxt();
  const row = (t, d, n, h, sub = '') => `<a class="pg-row" href="${h}"><span class="pg-t"><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="bar"><i style="width:${n ? d / n * 100 : 0}%"></i></span><b class="pg-n">${d}/${n}</b></a>`;
  return `<div class="page wrap lms prg">
    <section class="prg-hero">
      <div class="prg-lv"><div class="lvring" style="--p:${L.pct}"><small>Level</small><b data-count="${L.n}">${L.n}</b></div></div>
      <div class="prg-t"><small class="ph-k">Level kamu sekarang</small><h1>${L.name}</h1>
        <p><b data-count="${xp}">${xp}</b> XP${L.next !== null ? ` · ${L.next - xp} XP lagi ke Level ${L.n + 1} (${L.nextName})` : ' · level tertinggi sudah tercapai'}</p></div>
      ${ruteLevel()}
    </section>

    <div class="prg-grid">
      <section class="card prg-card"><div class="card-h"><h2 class="prg-k">Tugas minggu ini</h2><span class="ex-st ${T.every(t => t[2] >= t[3]) ? 'done' : 'go'}">${T.filter(t => t[2] >= t[3]).length}/${T.length} selesai</span></div>
        <ul class="tugas">${T.map(([ic, t, v, m]) => `<li class="${v >= m ? 'ok' : ''}"><span class="tg-ring" style="--p:${Math.min(1, v / m) * 100}"><b>${v >= m ? icon('check') : `${Math.min(v, m)}/${m}`}</b></span><span class="tg-t"><b>${t}</b><small>${v >= m ? 'Selesai minggu ini' : `${m - Math.min(v, m)} lagi`}</small></span><span class="tg-ic">${icon(ic)}</span></li>`).join('')}</ul>
        <p class="muted small">Tugas berganti setiap Senin. Dihitung dari riwayat aktivitasmu.</p></section>

      <section class="card prg-card"><div class="card-h"><h2 class="prg-k">Koleksi segel</h2><span class="ex-st ${got === BADGES.length ? 'done' : 'go'}">${got}/${BADGES.length}</span></div>
        ${(() => {
          /* segel yang sudah didapat + 3 target berikutnya tampil; sisanya dilipat */
          const seg = b => { const on = b.ok(); return `<button type="button" class="segel ${on ? 'on' : ''}" data-seal="${b.k}" aria-label="${b.t}${on ? ' (didapat)' : ' (belum)'}"><span class="seal">${icon(on ? b.ic : 'lock')}</span><small>${b.t}</small></button>`; };
          const on = BADGES.filter(b => b.ok()), off = BADGES.filter(b => !b.ok()), tampil = [...on, ...off.slice(0, 3)], sisa = off.slice(3);
          return `<div class="segel-grid">${tampil.map(seg).join('')}</div>${sisa.length ? `<details class="seg-more"><summary>Lihat ${sisa.length} segel lainnya</summary><div class="segel-grid">${sisa.map(seg).join('')}</div></details>` : ''}`;
        })()}
        <div class="segel-info" id="sealInfo"><p class="muted small">Klik segel untuk melihat syarat dan progresnya.</p></div></section>
    </div>

    <div class="pg-grid">
      <section class="card"><div class="card-h"><h2>Materi</h2><a href="#/materi">Katalog ${icon('right')}</a></div>
        ${MATERI.filter(m => /^m\d$|intro/.test(m.id)).map(m => row(m.short === 'Pembuka' ? 'Pembuka' : `${m.short} · ${m.title}`, m.bagian.filter(id => state.done[id]).length, m.bagian.length, '#/bagian/' + (m.bagian.find(id => !state.done[id] && !locked(id)) || m.bagian[0]))).join('')}</section>
      <section class="card"><div class="card-h"><h2>Latihan</h2><a href="#/latihan">Buka latihan ${icon('right')}</a></div>
        ${LAT_SETS.map(S => { const st = setStat(S); return row(S.title, st.benar, st.n, st.status === 'done' ? `#/latihan/${S.id}/hasil` : `#/latihan/${S.id}`, `${STATUS_TXT[st.status]}${st.tries ? ` · ${st.tries}× dikerjakan` : ''}`); }).join('')}
        ${AKT_KEYS.map(k => { const st = aktStat(k), max = AKT_INFO[k][4]; return row(`Aktivitas ${AKT_INFO[k][0]} · ${AKT_INFO[k][2]}`, st.status === 'done' ? st.score : 0, max, '#/bagian/aktivitas-interaktif', STATUS_TXT[st.status]); }).join('')}</section>
      <section class="card"><div class="card-h"><h2>Evaluasi</h2><a href="#/bagian/awal-evaluasi">Cek syarat ${icon('right')}</a></div>
        ${row('Materi selesai', MATERI_BAGIAN.filter(id => state.done[id]).length, MATERI_BAGIAN.length, '#/materi')}
        ${row(`Latihan benar (minimal ${LAT_MIN})`, Math.min(latSkor(), LATIHAN.length), LATIHAN.length, '#/latihan')}
        ${row('Aktivitas interaktif', AKT_KEYS.filter(k => aktStat(k).status === 'done').length, 3, '#/bagian/aktivitas-interaktif')}
        <p class="pg-ev"><span class="ex-st ${evalPassed() ? 'done' : evScore() !== null ? 'go' : 'new'}">${ev[0]}</span> ${ev[1]}</p>
        <div class="cert-cta mini">${icon(evalPassed() ? 'award' : 'lock')}<div><b>Sertifikat</b><p class="muted">${evalPassed() ? 'Siap dicetak.' : `Terbuka setelah lulus evaluasi (nilai ≥ ${KKM}).`}</p></div>${evalPassed() ? `<a class="btn btn-gold btn-sm" href="#/sertifikat">Lihat ${icon('right')}</a>` : ''}</div></section>
      <details class="card xp-fold"><summary class="card-h"><h2>Asal XP</h2><small class="muted">rincian poin</small></summary>
        <div class="xp-list">${xpParts().map(([ic, t, v, m]) => `<div class="xp-row ${v >= m ? 'full' : ''}"><span class="xp-ic">${icon(ic)}</span><span>${t}</span><span class="bar"><i style="width:${m ? v / m * 100 : 0}%"></i></span><b>${v}/${m}</b></div>`).join('')}</div></details>
    </div>
    <section class="card"><div class="card-h"><h2>Aktivitas terbaru</h2></div>${activityList(8)}</section>
  </div>`;
}
function mountProgres() {
  countUp();
  const info = $('#sealInfo'); if (!info) return;
  $$('[data-seal]').forEach(btn => btn.onclick = () => {
    const b = BADGES.find(x => x.k === btn.dataset.seal), on = b.ok(), [v, m] = (BADGE_PROG[b.k] || (() => [on ? 1 : 0, 1]))();
    $$('[data-seal]').forEach(x => x.classList.toggle('sel', x === btn));
    info.innerHTML = `<div class="si ${on ? 'on' : ''}"><span class="seal sm">${icon(on ? b.ic : 'lock')}</span><div><b>${b.t}</b><small>${b.d}</small>
      <div class="si-bar"><span class="bar"><i style="width:${Math.min(100, v / m * 100)}%"></i></span><em>${on ? 'Didapat' : `${v}/${m}`}</em></div></div>${on ? '' : `<a class="btn btn-outline btn-sm" href="${b.to}">Kerjakan ${icon('right')}</a>`}</div>`;
    sfx();
  });
}


/* =========================================================================
   PENGATURAN
   ========================================================================= */
/* ---------- Dialog konfirmasi (pengganti confirm() bawaan browser) ----------
   tanya({ ic, title, body, ok, cancel, danger, back }) -> Promise<boolean>. back = elemen tujuan fokus setelah ditutup.
   Esc, klik latar, dan tombol batal = false. Fokus dikunci di dalam dialog lalu dikembalikan. */
function tanya({ ic = 'help', title, body = '', ok = 'Ya', cancel = 'Batal', danger = false, back = null }) {
  return new Promise(resolve => {
    const prev = back || document.activeElement;
    const wrap = document.createElement('div');
    wrap.className = 'exm-confirm dlg';
    wrap.innerHTML = `<div class="exm-cbox${danger ? ' danger' : ''}" role="${danger ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="dlgT" aria-describedby="dlgB">
      <span class="exm-cic">${icon(ic)}</span><b id="dlgT">${title}</b><p id="dlgB">${body}</p>
      <div class="row-btns"><button type="button" class="btn btn-outline" data-no>${cancel}</button><button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${ok}</button></div></div>`;
    let selesai = false;
    const tutup = hasil => {
      if (selesai) return;
      selesai = true;
      document.removeEventListener('keydown', onKey, true);
      wrap.parentNode.removeChild(wrap);
      if (prev && prev.isConnected) prev.focus();
      resolve(hasil);
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); tutup(false); return; }
      if (e.key !== 'Tab') return;
      const f = $$('button', wrap), k = f.indexOf(document.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-no]')) tutup(false);
      else if (e.target.closest('[data-yes]')) tutup(true);
    });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
    /* tindakan yang menghapus data: fokus awal di "Batal" supaya Enter tidak langsung menghapus */
    $(danger ? '[data-no]' : '[data-yes]', wrap).focus();
  });
}

let resetJalan = false;
async function resetAll(e) {
  const btn = e && e.currentTarget;
  if (resetJalan) return;
  const ya = await tanya({ ic: 'trash', danger: true, title: 'Reset progres belajar?',
    body: 'Bagian yang sudah selesai, jawaban latihan, aktivitas, nilai evaluasi, XP, lencana, dan riwayat belajar di browser ini akan dikembalikan ke awal. Nama dan pengaturan tampilanmu tetap disimpan. Tindakan ini tidak bisa dibatalkan.',
    ok: 'Ya, reset progres', back: btn });
  if (!ya || resetJalan) return;
  resetJalan = true;
  const label = btn && btn.innerHTML;
  if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Mereset…'; }
  const lama = state, nama = namaUser();
  /* yang dipertahankan: nama peserta, suara, dan setelan tampilan. Sisanya kembali ke kondisi awal. */
  state = Object.assign(fresh(), { sound: lama.sound, ui: lama.ui || {} }, nama ? { game: { nama } } : {});
  let tersimpan = false;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    tersimpan = localStorage.getItem(KEY) === JSON.stringify(state);
  } catch (err) { tersimpan = false; }
  if (btn && btn.isConnected) { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = label; }
  resetJalan = false;
  if (!tersimpan) {
    state = lama;
    toast('Progres gagal direset karena browser tidak mengizinkan penyimpanan. Coba lagi, atau keluar dari mode privat.');
    return;
  }
  editNama = false;
  save(); updateBar();
  toast('Progres sudah direset. Kamu bisa mulai belajar lagi dari awal.');
  if (location.hash === '#/' || !location.hash) route(); else location.hash = '#/';
}

/* ---------- Menu samping: lebar atau ringkas ---------- */
function applyMini() {
  const on = !!UI().mini, b = $('#sideMini');
  document.body.classList.toggle('sb-mini-on', on);
  $$('#side [data-tip]').forEach(el => { if (on) el.title = el.dataset.tip; else el.removeAttribute('title'); });
  if (b) { b.setAttribute('aria-label', on ? 'Lebarkan menu' : 'Ciutkan menu'); b.dataset.tip = on ? 'Lebarkan menu' : 'Ciutkan menu'; }
}

/* =========================================================================
   MASKOT PIXEL: amplop "Surti" (Surat Tiba) — dibuat dari peta piksel
   ========================================================================= */
const PIX_COL = { o: '#3b1119', c: '#fbf5ec', m: '#7a1f2e', g: '#e2b04a', p: '#e0636a', w: '#ffffff', s: '#f3e6d0' };
const pixelArt = (rows, cls = '', label = '') => {
  const w = rows[0].length, h = rows.length;
  let r = '';
  rows.forEach((row, y) => { [...row].forEach((ch, x) => { if (PIX_COL[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${PIX_COL[ch]}"/>`; }); });
  return `<svg class="pix ${cls}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${r}</svg>`;
};
const MASCOT = pixelArt([
  '......gg........',
  '.....gwwg.......',
  '......gg........',
  'oooooooooooooooo',
  'ommsccccccccsmmo',
  'occmmsccccsmmcco',
  'occccmmggmmcccco',
  'occcccsggsccccco',
  'occwoccccccwocco',
  'occooccccccoocco',
  'ocpccoccccoccpco',
  'occcccooooccccco',
  'oooooooooooooooo',
  '...oo......oo...',
  '...gg......gg...',
], 'mascot', 'Surti, maskot amplop Smart Emailing');

/* Ilustrasi kartu materi (gaya piksel, warna Smart Emailing) */
const ART = {
  m1: pixelArt([
    '....................',
    '..oooooooooooooo....',
    '..occccccccccccog...',
    '..ommcccccccccmmogg.',
    '..occmmccccccmmco...',
    '..occccmmggmmccco...',
    '..occccccggcccccog..',
    '..occccccccccccco.g.',
    '..oooooooooooooo....',
    '......ss..ss........',
    '..oooooooooooooo....',
    '..osssssssssssso....',
    '..oooooooooooooo....',
  ], 'art'),
  m2: pixelArt([
    '....oooooooooo......',
    '....occccccccoo.....',
    '....ocmmmmmccoco....',
    '....occccccccooo....',
    '....ocsssssssco.gg..',
    '....ocsssssccco.gg..',
    '....occccccccco.og..',
    '....ocmmmcccccc.o...',
    '....ocsssssssco.o...',
    '....ocssssscccoo....',
    '....occccccgg.co....',
    '....ooooooooooo.....',
  ], 'art'),
  m3: pixelArt([
    '..............oo....',
    '...........oooco....',
    '........ooocccmo....',
    '.....ooocccccmo.....',
    '..ooocccccccmmo.....',
    'ooccccccccmmco......',
    '..oommcccmmcco......',
    '.....oommmccco..g...',
    '.......oommco..g.g..',
    '.........ooo..g...g.',
    '...............g.g..',
    '................g...',
  ], 'art'),
};

/* =========================================================================
   MENU SAMPING: grup bisa dibuka-tutup, satu menu aktif, laci di HP
   ========================================================================= */
function setNavActive(key) {
  $$('#side [data-nav]').forEach(a => { const on = a.dataset.nav === key; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $$('#side .sb-grp').forEach(g => {
    const has = !!$('[data-nav].active', g);
    g.classList.toggle('has-active', has);
    if (has) openGrp(g, true, false);
  });
}
function openGrp(g, open, remember = true) {
  g.classList.toggle('open', open);
  $('.sb-gh', g).setAttribute('aria-expanded', String(open));
  if (remember) { UI().grp = UI().grp || {}; UI().grp[g.dataset.grp] = open; save(); }
}
const NAV_PANDUAN = { panduan: 'petunjuk', petunjuk: 'petunjuk', tujuan: 'tujuan', peta: 'peta', glosarium: 'glosarium', faq: 'faq' };
const drawer = open => { document.body.classList.toggle('sb-open', open); $('#burger').setAttribute('aria-expanded', String(open)); };
function sideInit() {
  $$('#side .sb-grp').forEach(g => {
    const saved = UI().grp && UI().grp[g.dataset.grp];
    openGrp(g, saved !== undefined ? saved : g.dataset.grp === 'panduan', false);
    $('.sb-gh', g).onclick = () => { openGrp(g, !g.classList.contains('open')); sfx(); };
  });
  $$('#side [data-px]').forEach(e => { e.innerHTML = pxi(e.dataset.px); });
  $$('#side [data-ic], #burger [data-ic]').forEach(e => { if (!e.innerHTML) e.innerHTML = icon(e.dataset.ic); });
  $('#burger').onclick = () => drawer(!document.body.classList.contains('sb-open'));
  $('#sbScrim').onclick = () => drawer(false);
  $('#side').addEventListener('click', e => { if (e.target.closest('a')) drawer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') drawer(false); });
}
function sideUpdate() {
  const mDone = MATERI_BAGIAN.filter(id => state.done[id]).length;
  const nx = state.done['pengantar'] ? (MATERI_BAGIAN.find(id => !state.done[id]) || (state.last && MATERI_BAGIAN.includes(state.last) ? state.last : 'bahasa-formal')) : 'pengantar';
  const nm = $('#navMateri'); if (nm) nm.href = '#/bagian/' + nx;
  const bm = $('#badgeMat'); if (bm) bm.textContent = `${mDone}/${MATERI_BAGIAN.length}`;
  const L = levelOf(xpTotal()), p = pct(), j = $('#sbJourney');
  if (j) j.innerHTML = `<span class="sbj-m">${MASCOT}</span><span class="sbj-t"><b>Perjalanan belajar</b><small>Lv ${L.n} · ${L.name}</small><span class="sbj-bar"><i style="width:${p}%"></i></span></span><b class="sbj-p">${p}%</b>`;
}

/* =========================================================================
   BERANDA: hero penuh + tumpukan kartu materi (carousel)
   ========================================================================= */
function homeCards() {
  return MATERI.filter(m => /^m\d$/.test(m.id)).map(m => {
    const d = m.bagian.filter(id => state.done[id]).length, n = m.bagian.length;
    const nx = m.bagian.find(id => !state.done[id]), lk = nx ? locked(nx) : false;
    const label = d === n ? `Materi ${+m.no} · semua bagian selesai` : `Materi ${+m.no} · ${d}/${n} bagian selesai`;
    const cta = d === n ? `<a class="gbtn y sm" href="#/bagian/${m.bagian[0]}">Ulas lagi ${icon('right')}</a>`
      : lk ? `<span class="gc-lock">${icon('lock')} Selesaikan bagian sebelumnya dulu</span>`
      : `<a class="gbtn y sm" href="#/bagian/${nx}">${d ? 'Lanjut belajar' : 'Mulai materi'} ${icon('right')}</a>`;
    return `<article class="gcard" data-m="${m.id}" tabindex="-1">
      <div class="gc-art">${ART[m.id]}</div>
      <div class="gc-body"><small class="gc-k">${label}</small><h3>${m.title}</h3>
        <p class="gc-next">${d === n ? 'Selesai semua. Tinggal ulas kalau perlu.' : `Berikutnya: <b>${BAGIAN[nx].title}</b>`}</p>
        <span class="gc-bar"><i style="width:${d / n * 100}%"></i></span>
        ${cta}</div>
    </article>`;
  }).join('');
}
const namaUser = () => ((state.game && state.game.nama) || '').trim();
/* sapaan sesuai jam di perangkat pengguna */
const sapaan = (h = new Date().getHours()) => h >= 4 && h < 11 ? 'Selamat pagi' : h >= 11 && h < 15 ? 'Selamat siang' : h >= 15 && h < 18 ? 'Selamat sore' : 'Selamat malam';
let editNama = false;
function viewHome() {
  const started = doneCount() > 0, res = started ? resumeHref() : '#/bagian/pengantar', nama = namaUser();
  const cta = !nama || editNama
    ? `<form class="gh-name" id="ghName" novalidate>
          <label for="ghNamaIn">${nama ? 'Ganti nama' : 'Sebelum mulai, siapa namamu?'}</label>
          <div class="ghn-row"><input id="ghNamaIn" type="text" maxlength="60" autocomplete="name" placeholder="Tulis nama lengkapmu" value="${esc(nama)}" required><button type="submit" class="gbtn y">${nama ? 'Simpan' : 'Mulai'} ${icon('right')}</button></div>
          <small id="ghNamaMsg">Namamu dipakai untuk sapaan dan sertifikat.</small>
        </form>`
    : `<div class="gh-cta">
          <a class="gbtn y lg" href="${res}">${started ? 'Lanjut belajar' : 'Mulai belajar'} ${icon('right')}</a>
        </div>`;
  return `<section class="gh">
    <div class="gh-in">
      <div class="gh-txt">
        <span class="gh-tag">${icon('mail')} Pelatihan menulis email lamaran kerja</span>
        ${nama && !editNama ? `<p class="gh-hi">${sapaan()}, <b>${esc(nama.split(/\s+/)[0])}</b><button type="button" class="gh-edit" id="ghEdit" aria-label="Ganti nama" title="Ganti nama">${icon('pen')}</button></p>` : ''}
        <h1 class="gh-h gh-brand"><span>Smart</span><span>Emailing</span></h1>
        ${cta}
      </div>
      <div class="gh-stage">
        <div class="gstack" id="gstack" role="region" aria-roledescription="carousel" aria-label="Materi pelatihan">${homeCards()}</div>
        <div class="gdots"><span id="gdots"></span><small>geser kartunya</small></div>
      </div>
    </div>
  </section>`;
}
function mountHome() {
  const form = $('#ghName');
  if (form) {
    const inp = $('#ghNamaIn');
    if (!namaUser() || editNama) setTimeout(() => inp.focus({ preventScroll: true }), 60);
    form.onsubmit = e => {
      e.preventDefault();
      const v = inp.value.trim().replace(/\s+/g, ' ');
      if (v.length < 2) { $('#ghNamaMsg').textContent = 'Tulis namamu dulu, minimal 2 huruf.'; $('#ghNamaMsg').classList.add('err'); inp.focus(); return; }
      const baru = !namaUser();
      state.game = state.game || {}; state.game.nama = v; editNama = false; save(); sfx('ok');
      toast(baru ? `Halo, ${v.split(' ')[0]}! Materi sudah bisa dibuka.` : 'Nama sudah diganti.');
      route();
    };
  }
  const ed = $('#ghEdit'); if (ed) ed.onclick = () => { editNama = true; sfx(); route(); };
  const stack = $('#gstack'); if (!stack) return;
  const cards = $$('.gcard', stack), n = cards.length;
  const cur = (resumeHref().split('/').pop() || 'kegunaan-email');
  let i = Math.max(0, cards.findIndex(c => MATERI.find(m => m.id === c.dataset.m).bagian.includes(cur)));
  const dots = $('#gdots');
  const paint = () => {
    cards.forEach((c, k) => { const pos = (k - i + n) % n; c.dataset.pos = pos; c.setAttribute('aria-hidden', String(pos !== 0)); $$('a', c).forEach(a => { a.tabIndex = pos === 0 ? 0 : -1; }); });
    dots.innerHTML = cards.map((c, k) => `<button type="button" class="${k === i ? 'on' : ''}" data-dot="${k}" aria-label="Kartu ${k + 1}"></button>`).join('');
  };
  const go = k => { i = (k + n) % n; paint(); sfx(); };
  paint();
  stack.addEventListener('click', e => { if (swiped) { swiped = false; e.preventDefault(); return; } const c = e.target.closest('.gcard'); if (c && c.dataset.pos !== '0' && !e.target.closest('a')) { e.preventDefault(); go(cards.indexOf(c)); } });
  dots.onclick = e => { const b = e.target.closest('[data-dot]'); if (b) go(+b.dataset.dot); };
  /* geser kartu dengan jari atau mouse */
  let x0 = null, swiped = false;
  stack.addEventListener('pointerdown', e => { swiped = false; if (!e.target.closest('a')) x0 = e.clientX; });
  stack.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { swiped = true; go(i + (dx < 0 ? 1 : -1)); } });
  stack.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
}

/* =========================================================================
   FAQ (tab Panduan) dan halaman Tentang
   ========================================================================= */
const FAQ = [
  ['Apa itu Smart Emailing?', 'Pelatihan singkat berbasis multimedia untuk membantu fresh graduate menulis email lamaran kerja yang rapi, sopan, dan sesuai etika komunikasi di dunia kerja.'],
  ['Untuk siapa pelatihan ini?', 'Untuk fresh graduate yang sedang bersiap melamar kerja.'],
  ['Materinya apa saja?', `Ada tiga materi: dasar komunikasi lewat email, menulis email lamaran kerja, dan etika berkirim email. Setelah itu ada ${LATIHAN.length} soal latihan, 3 aktivitas interaktif, dan evaluasi akhir.`],
  ['Harus belajar berurutan?', 'Ya. Setiap bagian baru terbuka setelah bagian sebelumnya selesai: semua kartu materinya sudah dibaca dan aktivitasnya sudah dikerjakan. Latihan terbuka setelah semua materi selesai.'],
  ['Apa syarat untuk mengerjakan evaluasi?', `Tiga hal: semua bagian materi selesai, latihan pilihan ganda minimal ${LAT_MIN} dari ${LATIHAN.length} benar, dan ketiga aktivitas interaktif sudah dikerjakan. Statusnya bisa dicek di halaman Awal Evaluasi.`],
  ['Bagaimana evaluasi dinilai?', `Evaluasi berisi ${EVALUASI.length} soal tanpa tanda benar atau salah. Jawaban dikunci setelah disimpan, dan nilai muncul di akhir. Batas lulusnya ${KKM}. Kalau belum lulus, kamu bisa mempelajari ulang materinya atau langsung mencoba lagi.`],
  ['Progresku tersimpan di mana?', 'Di browser yang kamu pakai, tanpa akun. Jawaban dan nilaimu tetap ada walau halaman ditutup. Kalau data browser dihapus, progres mulai dari awal. Kalau dibuka lewat LMS (paket SCORM), status dan nilai juga tercatat di LMS.'],
];
/* =========================================================================
   IKON PIKSEL — set ikon buatan sendiri (10×10), dipakai di menu dan judul halaman
   ========================================================================= */
const PIX_ICONS = {
  home: ['....ww....', '...wwww...', '..wwwwww..', '.wwwwwwww.', 'wwwwwwwwww', '.wwwwwwww.', '.wwwggwww.', '.wwwggwww.', '.wwwggwww.', '.wwwggwww.'],
  katalog: ['wwww..gggg', 'wwww..gggg', 'wwww..gggg', 'wwww..gggg', '..........', '..........', 'wwww..wwww', 'wwww..wwww', 'wwww..wwww', 'wwww..wwww'],
  materi: ['..........', 'ww......ww', 'wwww..wwww', 'wggwwwwggw', 'wwwwwwwwww', 'wggwwwwggw', 'wwwwwwwwww', 'wwwwwwwwww', '..wwwwww..', '....gg....'],
  latihan: ['...gggg...', '.wwwggwww.', '.wwwwwwww.', '.wwwwwwgw.', '.wwwwwggw.', '.wgwwggww.', '.wggggwww.', '.wwggwwww.', '.wwwwwwww.', '..........'],
  evaluasi: ['..........', '........gg', '........gg', '.....ww.gg', '.....ww.gg', '..ww.ww.gg', '..ww.ww.gg', '..ww.ww.gg', '..ww.ww.gg', 'wwwwwwwwww'],
  panduan: ['....ww....', '.wwwwwwww.', '.wwwwwwwww', '.wwwwwwww.', '....ww....', '.gggggggg.', 'ggggggggg.', '.gggggggg.', '....ww....', '....ww....'],
  petunjuk: ['...wwww...', '..wwwwww..', '.wwwggwww.', '.wwggggww.', '.wwwggwww.', '..wwwwww..', '...wwww...', '...gggg...', '...wwww...', '....ww....'],
  tujuan: ['..wwwwww..', '.w......w.', 'w..gggg..w', 'w.g....g.w', 'w.g.ww.g.w', 'w.g.ww.g.w', 'w.g....g.w', 'w..gggg..w', '.w......w.', '..wwwwww..'],
  peta: ['...gggg...', '..gggggg..', '..gg..gg..', '..gggggg..', '...gggg...', '....gg....', 'ww..gg..ww', 'wwww..wwww', 'wwwwwwwwww', '..wwwwww..'],
  glosarium: ['..........', '..ww......', '.wwww.....', 'ww..ww....', 'ww..ww.ggg', 'wwwwww...g', 'ww..ww.ggg', 'ww..wwg..g', 'ww..ww.ggg', '..........'],
  faq: ['.wwwwwwww.', 'wwwwwwwwww', 'wwwggggwww', 'wwwwwwggww', 'wwwwwggwww', 'wwwwggwwww', 'wwwwggwwww', '.wwwwwwww.', '..ww......', '.w........'],
  lainnya: ['..........', '..........', '..........', '..........', '.ww.gg.ww.', '.ww.gg.ww.', '..........', '..........', '..........', '..........'],
  progres: ['.ww....ww.', '..ww..ww..', '...wwww...', '...gggg...', '..gggggg..', '.gggwwggg.', '.ggwwwwgg.', '.gggwwggg.', '..gggggg..', '...gggg...'],
  pengaturan: ['....ww....', '.w.wwww.w.', '..wwwwww..', '.wwwggwww.', 'wwwg..gwww', 'wwwg..gwww', '.wwwggwww.', '..wwwwww..', '.w.wwww.w.', '....ww....'],
  tentang: ['..........', '.ww....ww.', 'wwww..wwww', 'wwgwwwwwww', 'wggwwwwwww', '.wwwwwwww.', '..wwwwww..', '...wwww...', '....ww....', '..........'],
};
const pxi = n => PIX_ICONS[n] ? pixelArt(PIX_ICONS[n], 'pxi') : '';
const GUIDE_LIST = [
  ['petunjuk', 'Petunjuk', 'petunjuk', '#e0636a'],
  ['tujuan', 'Tujuan belajar', 'tujuan', '#1f9e8f'],
  ['peta', 'Peta konsep', 'peta', '#3e7bd6'],
  ['glosarium', 'Glosarium', 'glosarium', '#d08a1e'],
];
/* FAQ dibuka dari tombol kecil di pojok kanan bawah, bukan dari urutan Panduan */
const GUIDE_FAQ = ['faq', 'FAQ', 'faq', '#c2457e'];
/* kepala halaman bersama untuk Panduan dan Lainnya */
const pageHero = (ic, color, kicker, title, sub, side = '') => `<header class="phx" style="--tc:${color}">
  <span class="phx-ic">${pxi(ic)}</span>
  <div class="phx-t"><small>${kicker}</small><h1>${title}</h1><p>${sub}</p></div>${side}
</header>`;

/* ---------- Petunjuk ---------- */
function viewPetunjuk() {
  const langkah = [
    ['home', 'Mulai dari Beranda', 'Isi namamu, lalu tekan Mulai belajar. Berikutnya, Lanjut belajar membawamu ke bagian terakhir.', '#/'],
    ['materi', 'Baca kartu materinya', 'Setiap bagian dipecah jadi kartu pendek. Pindah kartu pakai tombol Berikutnya.', '#/materi'],
    ['latihan', 'Kerjakan aktivitasnya', 'Tombol Lanjut di bawah baru menyala setelah semua kartu dibaca dan aktivitas selesai.', resumeHref()],
    ['evaluasi', 'Latihan, lalu evaluasi', `${LATIHAN.length} soal latihan dan 3 aktivitas jadi syarat evaluasi. Lulus kalau nilai minimal ${KKM}.`, '#/bagian/awal-evaluasi'],
  ];
  const kode = [
    ['normal', 'Normal', 'Tampilan awal tombol sebelum disentuh.'],
    ['hover', 'Hover', 'Arahkan kursor ke tombol. Di HP tidak ada hover.'],
    ['hit', 'Hit', 'Klik atau ketuk untuk menjalankan aksi.'],
    ['swipe', 'Swipe', 'Geser deretan kartu ke samping.'],
    ['drag', 'Seret & letakkan', 'Seret kartu ke kotaknya. Di HP: ketuk kartu, lalu ketuk kotak.'],
    ['show', 'Show', 'Penjelasan muncul setelah kamu melakukan sesuatu.'],
  ];
  const demo = {
    normal: '<span class="dm-btn">Tombol</span>',
    hover: '<span class="dm-btn dm-hover">Arahkan ke sini</span>',
    hit: '<button type="button" class="dm-btn dm-hit" data-demo="hit">Klik aku</button>',
    swipe: '<div class="dm-swipe" tabindex="0">' + ['Subject', 'Salam', 'Isi', 'Penutup', 'Tanda tangan'].map(t => `<span>${t}</span>`).join('') + '</div>',
    drag: '<div class="dm-drag"><button type="button" class="dm-chip" data-demo="drag">Subject</button><span class="dm-slot" data-demo="slot">kotak</span></div>',
    show: '<button type="button" class="dm-btn" data-demo="show">Tampilkan</button><span class="dm-show" hidden>Ini penjelasannya.</span>',
  };
  return `<ol class="steps">${langkah.map(([ic, t, d, h], k) => `<li style="--i:${k}"><a href="${h}"><span class="st-no">${k + 1}</span><span class="st-ic">${pxi(ic)}</span><b>${t}</b><small>${d}</small></a></li>`).join('')}</ol>
    <h2 class="gd-h">Cara berinteraksi <small>kode interaksi dari storyboard · coba langsung di kartunya</small></h2>
    <div class="kode-grid">${kode.map(([k, t, d]) => `<div class="kode"><div class="kode-demo">${demo[k]}</div><b>${t}</b><small>${d}</small></div>`).join('')}</div>`;
}
function mountPetunjuk() {
  const app2 = $('.kode-grid'); if (!app2) return;
  app2.onclick = e => {
    const d = e.target.closest('[data-demo]'); if (!d) return;
    sfx();
    if (d.dataset.demo === 'hit') { d.textContent = 'Berhasil'; d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); setTimeout(() => { d.textContent = 'Klik aku'; }, 1200); }
    if (d.dataset.demo === 'drag') d.classList.toggle('picked');
    if (d.dataset.demo === 'slot') { const c = $('.dm-chip', d.parentElement); if (c.classList.contains('picked') || c.parentElement === d) { const back = c.parentElement === d; (back ? d.parentElement : d).appendChild(c); c.classList.remove('picked'); d.classList.toggle('full', !back); } }
    if (d.dataset.demo === 'show') { const s = d.nextElementSibling; s.hidden = !s.hidden; d.textContent = s.hidden ? 'Tampilkan' : 'Sembunyikan'; }
  };
}

/* ---------- Tujuan belajar ---------- */
const TUJUAN_KHUSUS = ['menjelaskan fungsi email dalam dunia kerja', 'membuat email profesional untuk kebutuhan mencari kerja', 'mengidentifikasi struktur email profesional', 'menjelaskan fungsi CC dan BCC', 'menentukan waktu yang tepat mengirim email dan melakukan follow-up kepada HR', 'menyusun email follow-up yang sopan dan profesional', 'menerapkan bahasa formal dan profesional dalam email'];
function viewTujuan() {
  return `<blockquote class="goal-q"><small>Tujuan umum</small><p>Fresh graduate mampu <b>merancang email lamaran kerja</b> dengan memperhatikan struktur dan etika komunikasi profesional dalam dunia kerja.</p></blockquote>
    <h2 class="gd-h">Setelah pelatihan, kamu mampu</h2>
    <ol class="goal-grid">${TUJUAN_KHUSUS.map((t, k) => `<li style="--i:${k}"><span>${k + 1}</span>${t.charAt(0).toUpperCase() + t.slice(1)}.</li>`).join('')}</ol>
    <h2 class="gd-h">Tujuan per bagian</h2>
    <div class="goal-groups">${MATERI.map(m => `<details class="gg" ${m.bagian.includes((resumeHref().split('/').pop() || '')) ? 'open' : ''}><summary><span class="gg-no">${m.no}</span><b>${m.short === 'Pembuka' ? 'Pembuka' : `${m.short} · ${m.title}`}</b><span class="gg-c">${m.bagian.filter(id => state.done[id]).length}/${m.bagian.length}</span><span class="gg-chev">${icon('down')}</span></summary>
      <ul>${m.bagian.map(id => `<li class="${state.done[id] ? 'ok' : ''}"><a href="#/bagian/${id}"><span class="gg-k">${state.done[id] ? icon('check') : icon('book')}</span><span><b>${BAGIAN[id].title}</b><small>${BAGIAN[id].tujuan}</small></span></a></li>`).join('')}</ul></details>`).join('')}</div>`;
}

/* ---------- Peta konsep ---------- */
const PETA_TOPIK = {
  m1: [[['Kegunaan email', 'di dunia kerja'], 'kegunaan-email', 'Peran email sebagai saluran resmi di dunia kerja.'],
    [['Bagian-bagian email'], 'bagian-email', 'Subject, salam, isi, penutup, dan tanda tangan.'],
    [['Subject yang efektif'], 'subject-dan-salam', 'Subject singkat yang langsung menyebut posisi dan namamu.'],
    [['Salam pembuka', 'dan penutup'], 'subject-dan-salam', 'Sapaan dan penutup yang sopan untuk HR.']],
  m2: [[['Fungsi dan susunan', 'email lamaran'], 'susunan-email', 'Urutan isi email lamaran yang enak dibaca HR.'],
    [['Memperkenalkan diri'], 'perkenalan-dan-cv', 'Kalimat perkenalan singkat yang relevan dengan posisi.'],
    [['Melampirkan CV', 'dan portofolio'], 'perkenalan-dan-cv', 'Cara menyebut dan menamai lampiran CV dan portofolio.'],
    [['Kesalahan yang', 'sering terjadi'], 'kesalahan-email', 'Kesalahan kecil yang membuat lamaran dilewati HR.'],
    [['Praktik menulis', 'email lamaran'], 'praktik-email', 'Tulis email lamaranmu sendiri sampai siap dikirim.']],
  m3: [[['CC dan BCC'], 'cc-bcc-waktu', 'Kapan memakai CC dan kapan BCC.'],
    [['Waktu mengirim email'], 'cc-bcc-waktu', 'Kirim di jam kerja, antara 08.00 dan 17.00.'],
    [['Follow-up ke HR'], 'follow-up', 'Menanyakan kabar lamaran setelah 5–7 hari kerja tanpa balasan.'],
    [['Bahasa formal', 'dan sopan'], 'bahasa-formal', 'Pilihan kata yang formal tanpa terdengar kaku.']],
};
const PETA_UJI = [['Latihan soal', 'latihan-soal', 'Soal latihan dari ketiga materi, target minimal 70% benar.'],
  ['Aktivitas interaktif', 'aktivitas-interaktif', 'Tiga aktivitas interaktif, syarat sebelum evaluasi.'],
  ['Evaluasi akhir', 'evaluasi-akhir', `Empat soal akhir dengan nilai minimal ${KKM}.`],
  ['Sertifikat', 'penutup', 'Sertifikat dan rangkuman terbuka setelah kamu lulus evaluasi.']];
const PETA_ST = { done: 'Selesai', next: 'Berikutnya', open: 'Terbuka', lock: 'Terkunci' };

/* Susun posisi simpul dan garis. Lebar: tiga kolom. Sempit: satu kolom vertikal. */
function petaLayout(sempit) {
  const N = [], E = [], L = [];
  const node = (id, x, y, w, h, lines, o = {}) => N.push({ id, x, y, w, h, lines, ...o });
  const edge = (a, b, d, k = '') => (E.push({ a, b, d, k }), E.length - 1);
  const lab = (x, y, t, es, o = {}) => L.push({ x, y, t, es, ...o });
  const M = MATERI.filter(m => PETA_TOPIK[m.id]);
  const kid = (i, j) => `m${i}k${j}`;
  let W, H;
  if (!sempit) {
    W = 680;
    node('r', 230, 20, 220, 52, ['Smart Emailing'], { kind: 'root' });
    const rm = [];
    M.forEach((m, i) => {
      const c = 113 + 227 * i, id = 'm' + i;
      node(id, c - 106, 138, 212, 54, [m.title], { kind: 'materi', m });
      rm.push(edge('r', id, c === 340 ? 'M340 72V138' : `M340 72V108Q340 118 ${c < 340 ? 330 : 350} 118H${c < 340 ? c + 10 : c - 10}Q${c} 118 ${c} 128V138`));
      const ke = PETA_TOPIK[m.id].map(([ls, b, d], j) => {
        const y = 236 + 48 * j, mid = y + 20;
        node(kid(i, j), c - 78, y, 176, 40, ls, { b, d, m });
        return edge(id, kid(i, j), `M${c} 192V218Q${c} 228 ${c - 10} 228H${c - 80}Q${c - 90} 228 ${c - 90} 238V${mid - 10}Q${c - 90} ${mid} ${c - 80} ${mid}H${c - 78}`);
      });
      lab(c + 6, 214, 'membahas', ke, { a: 'start' });
    });
    lab(340, 99, 'terdiri atas', rm, { bg: 1 });
    lab(62, 490, 'diterapkan di', [edge(kid(0, 3), kid(1, 4), 'M123 420C123 476 200 460 258 460', 'x')], { a: 'start' });
    lab(618, 490, 'diterapkan di', [edge(kid(2, 3), kid(1, 4), 'M557 420C557 476 480 460 442 460', 'x')], { a: 'end' });
    PETA_UJI.forEach(([t, b, d], i) => node('u' + i, [18, 188, 358, 528][i], 530, i < 3 ? 124 : 134, 40, [t], { b, d, rx: 20 }));
    lab(346, 494, 'diuji melalui', [edge(kid(1, 4), 'u0', 'M340 468V502Q340 512 330 512H90Q80 512 80 522V526', 'a')], { a: 'start' });
    [['lalu', 164, 'M142 550H184'], ['syarat', 334, 'M312 550H354'], [`≥ ${KKM}`, 504, 'M482 550H524']].forEach(([t, x, d], i) => lab(x, 542, t, [edge('u' + i, 'u' + (i + 1), d, 'a')]));
    H = 590;
  } else {
    W = 372;
    node('r', 16, 16, 324, 52, ['Smart Emailing'], { kind: 'root' });
    lab(38, 86, 'terdiri atas', [], { a: 'start' });
    let y = 96;
    const rm = [], pos = {};
    M.forEach((m, i) => {
      const id = 'm' + i, mid = y + 25;
      node(id, 48, y, 292, 50, [m.title], { kind: 'materi', m });
      rm.push(edge('r', id, `M30 68V${mid - 10}Q30 ${mid} 40 ${mid}H48`));
      const ke = PETA_TOPIK[m.id].map(([ls, b, d], j) => {
        const t = y + 72 + 46 * j, km = t + 19;
        pos[kid(i, j)] = km;
        node(kid(i, j), 80, t, 250, 38, ls, { b, d, m });
        return edge(id, kid(i, j), `M66 ${y + 50}V${km - 10}Q66 ${km} 76 ${km}H80`);
      });
      lab(74, y + 64, 'membahas', ke, { a: 'start' });
      y += 72 + 46 * PETA_TOPIK[m.id].length + 14;
    });
    L[0].es = rm;
    const p = pos[kid(1, 4)], a = pos[kid(0, 3)], b = pos[kid(2, 3)];
    lab(362, (a + p) / 2, 'diterapkan di', [edge(kid(0, 3), kid(1, 4), `M330 ${a}H340Q350 ${a} 350 ${a + 10}V${p - 15}Q350 ${p - 5} 340 ${p - 5}H333`, 'x')], { rot: 1 });
    lab(362, (b + p) / 2, 'diterapkan di', [edge(kid(2, 3), kid(1, 4), `M330 ${b}H340Q350 ${b} 350 ${b - 10}V${p + 15}Q350 ${p + 5} 340 ${p + 5}H333`, 'x')], { rot: 1 });
    y += 6;
    lab(38, y + 4, 'diuji melalui', [edge('r', 'u0', `M30 68V${y + 30}Q30 ${y + 40} 40 ${y + 40}H46`, 'a')], { a: 'start' });
    PETA_UJI.forEach(([t, b, d], i) => {
      const top = y + 20 + 64 * i;
      node('u' + i, 48, top, 292, 40, [t], { b, d, rx: 20 });
      if (i) lab(202, top - 10, ['lalu', 'syarat', `≥ ${KKM}`][i - 1], [edge('u' + (i - 1), 'u' + i, `M194 ${top - 24}V${top - 2}`, 'a')], { a: 'start' });
    });
    H = y + 20 + 64 * 3 + 40 + 16;
  }
  const par = {};
  E.forEach(e => { if (e.k !== 'x') par[e.b] = e.a; });
  return { W, H, N, E, L, par };
}

function petaStatus() {
  const st = b => state.done[b] ? 'done' : locked(b) ? 'lock' : 'open';
  const next = ORDER.find(b => st(b) === 'open');
  return b => b === next ? 'next' : st(b);
}

function viewPeta() {
  return `<div class="peta" id="peta">
    <svg class="pt-svg" id="ptSvg" role="group" aria-label="Peta konsep Smart Emailing"></svg>
    <div class="pt-pan" id="ptPan" aria-live="polite"></div>
    <div class="pt-lg" aria-hidden="true"><span><i class="done"></i>Selesai</span><span><i class="next"></i>Berikutnya</span><span><i></i>Belum</span><span><i class="x"></i>Hubungan silang</span><span class="pt-lg-k">miring = kata penghubung</span></div>
  </div>`;
}

function mountPeta() {
  const box = $('#peta'), svg = $('#ptSvg'), pan = $('#ptPan');
  const stOf = petaStatus();
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const total = MATERI_BAGIAN.length, selesai = MATERI_BAGIAN.filter(b => state.done[b]).length;
  let lay, pin = null, mode = null, info = {};

  const panel = id => {
    pan.classList.toggle('on', !!id);
    if (!id) {
      const nx = ORDER.find(b => stOf(b) === 'next');
      pan.innerHTML = `<div><small>${selesai}/${total} bagian materi selesai</small><b>${nx ? 'Lanjut: ' + BAGIAN[nx].title : 'Semua bagian sudah selesai'}</b><p>Sorot atau klik sebuah konsep untuk melihat hubungannya.</p></div>${nx ? `<a class="btn btn-primary" href="#/bagian/${nx}">Lanjutkan ${icon('right')}</a>` : ''}`;
      return;
    }
    const n = info[id], s = n.st;
    const btn = id === 'r' ? `<a class="btn btn-primary" href="#/bagian/pengantar">Mulai dari pengantar ${icon('right')}</a>`
      : s === 'lock' ? '' : `<a class="btn btn-primary" href="#/bagian/${n.b}">${s === 'done' ? 'Buka lagi' : 'Buka bagian'} ${icon('right')}</a>`;
    pan.innerHTML = `<div><small>${n.kick}</small><b>${n.title}</b><p>${n.d}${s === 'lock' ? ` <em>${peekInfo(n.b).why}</em>` : ''}</p></div>${btn}`;
  };

  const sorot = id => {
    svg.classList.toggle('f', !!id);
    $$('.hi', svg).forEach(e => e.classList.remove('hi'));
    panel(id);
    if (!id) return;
    const chain = [id];
    for (let p = lay.par[id]; p; p = lay.par[p]) chain.push(p);
    const on = new Set(chain), lit = new Set();
    lay.E.forEach((e, i) => {
      if (e.a === id || e.b === id || (chain.includes(e.a) && chain.includes(e.b))) { lit.add(i); on.add(e.a); on.add(e.b); svg.querySelector(`[data-e="${i}"]`).classList.add('hi'); }
    });
    $$('.pt-lab', svg).forEach(l => { if (l.dataset.es.split(',').some(i => lit.has(+i))) l.classList.add('hi'); });
    $$('.pt-n', svg).forEach(n => { if (on.has(n.dataset.id)) n.classList.add('hi'); });
  };

  const gambar = () => {
    const sempit = box.clientWidth < 600;
    if (sempit === mode) return;
    mode = sempit; lay = petaLayout(sempit);
    svg.setAttribute('viewBox', `0 0 ${lay.W} ${lay.H}`);
    svg.innerHTML = '<defs><marker id="ptA" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L10 5L0 10z" class="pt-ah"/></marker><marker id="ptX" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L10 5L0 10z" class="pt-ah x"/></marker></defs>';
    const gE = mk('g', {}, svg), gL = mk('g', {}, svg), gN = mk('g', {}, svg);
    lay.E.forEach((e, i) => mk('path', { d: e.d, class: 'pt-e' + (e.k === 'x' ? ' x' : ''), 'data-e': i, ...(e.k ? { 'marker-end': `url(#${e.k === 'x' ? 'ptX' : 'ptA'})` } : {}) }, gE));
    lay.L.forEach(l => {
      const g = mk('g', { class: 'pt-lab', 'data-es': l.es.join(',') }, gL);
      if (l.bg) mk('rect', { x: l.x - 40, y: l.y - 13, width: 80, height: 18 }, g);
      mk('text', { x: l.x, y: l.y, 'text-anchor': l.rot ? 'middle' : l.a || 'middle', ...(l.rot ? { transform: `rotate(-90 ${l.x} ${l.y})` } : {}) }, g).textContent = l.t;
    });
    lay.N.forEach(n => {
      const kind = n.kind || 'topik';
      const st = kind === 'root' ? 'root' : kind === 'materi' ? (n.m.bagian.every(b => state.done[b]) ? 'done' : 'open') : stOf(n.b);
      const kunci = n.b === 'praktik-email' || n.b === 'evaluasi-akhir';
      const grp = kind === 'materi' ? `Materi ${n.m.no}` : n.m ? `Materi ${n.m.no}` : 'Penilaian';
      info[n.id] = kind === 'root' ? { title: 'Smart Emailing', d: 'Pelatihan menulis email lamaran kerja, dari dasar sampai siap dikirim.', kick: 'Konsep utama', st }
        : kind === 'materi' ? { title: n.m.title, d: n.m.desc, kick: `${grp} · ${n.m.bagian.filter(b => state.done[b]).length}/${n.m.bagian.length} bagian selesai`, b: n.m.bagian.find(b => !state.done[b]) || n.m.bagian[0], st: locked(n.m.bagian[0]) ? 'lock' : st }
        : { title: n.lines.join(' '), d: n.d, kick: `${grp} · ${PETA_ST[st]}`, b: n.b, st };
      const g = mk('g', { class: `pt-n ${kind} ${st}${kunci ? ' key' : ''}`, tabindex: 0, role: 'button', 'aria-label': `${info[n.id].title}, ${info[n.id].kick}`, 'data-id': n.id }, gN);
      mk('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: n.rx || (kind === 'topik' ? 7 : 9) }, g);
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      if (kind === 'root') {
        mk('text', { x: cx, y: cy - 3, class: 'pt-t1' }, g).textContent = 'Smart Emailing';
        mk('text', { x: cx, y: cy + 15, class: 'pt-t2' }, g).textContent = 'Menulis email lamaran yang profesional';
      } else if (kind === 'materi') {
        mk('text', { x: cx, y: cy - 6, class: 'pt-t2' }, g).textContent = `Materi ${n.m.no}${st === 'done' ? ' · selesai' : ''}`;
        mk('text', { x: cx, y: cy + 12, class: 'pt-t1' }, g).textContent = n.m.title;
      } else {
        const ls = n.lines.join(' ').length * 6.4 < n.w - 20 ? [n.lines.join(' ')] : n.lines;
        ls.forEach((l, i) => { mk('text', { x: cx, y: cy + 4 + (i - (ls.length - 1) / 2) * 14 }, g).textContent = l + (st === 'done' && i === ls.length - 1 ? '  ✓' : ''); });
      }
    });
    $$('.pt-n', svg).forEach(g => {
      const id = g.dataset.id;
      const pilih = () => { pin = pin === id ? null : id; $$('.pt-n.pin', svg).forEach(p => p.classList.remove('pin')); if (pin) g.classList.add('pin'); sorot(pin); };
      g.addEventListener('mouseenter', () => sorot(id));
      g.addEventListener('mouseleave', () => sorot(pin));
      g.addEventListener('focus', () => sorot(id));
      g.addEventListener('blur', () => sorot(pin));
      g.addEventListener('click', e => { e.stopPropagation(); pilih(); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pilih(); } });
    });
    pin = null; sorot(null);
    if (!reduced) {
      $$('.pt-e', svg).forEach((p, i) => {
        if (p.classList.contains('x')) { p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 800, fill: 'backwards' }); return; }
        const len = p.getTotalLength();
        p.animate([{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }], { duration: 600, delay: 100 + i * 30, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'backwards' });
      });
      $$('.pt-n', svg).forEach((n, i) => n.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 25, easing: 'ease-out', fill: 'backwards' }));
      $$('.pt-lab', svg).forEach(l => l.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 650, fill: 'backwards' }));
    }
  };
  svg.addEventListener('click', () => { pin = null; $$('.pt-n.pin', svg).forEach(p => p.classList.remove('pin')); sorot(null); });
  gambar();
  const onResize = () => { if (!document.body.contains(box)) return removeEventListener('resize', onResize); gambar(); };
  addEventListener('resize', onResize);
}

/* ---------- Glosarium ---------- */
function viewGlosarium() {
  const huruf = [...new Set(GLOSARIUM.map(g => g[0][0].toUpperCase()))];
  return `<div class="gl-tools"><label class="search">${icon('search')}<input id="gq" type="search" placeholder="Cari istilah, misalnya BCC" aria-label="Cari istilah"></label>
      <nav class="gl-az">${huruf.map(h => `<a href="#gl-${h}" data-az="${h}">${h}</a>`).join('')}</nav></div>
    <div class="gl-list">${huruf.map(h => `<section class="gl-sec" id="gl-${h}"><span class="gl-l">${h}</span><div>${GLOSARIUM.filter(g => g[0][0].toUpperCase() === h).map(([t, d, id]) => `<article class="g-item" data-t="${(t + ' ' + d).toLowerCase()}"><b>${t}</b><p>${d}</p><a href="#/bagian/${id}">${icon('book')} ${BAGIAN[id].title}</a></article>`).join('')}</div></section>`).join('')}</div>
    <p class="muted" id="gEmpty" hidden>Istilah tidak ditemukan. Coba kata lain.</p>`;
}
function mountGlosarium() {
  $('#gq').oninput = e => {
    const q = e.target.value.trim().toLowerCase(); let n = 0;
    $$('.g-item').forEach(g => { const s = !q || g.dataset.t.includes(q); g.hidden = !s; n += s; });
    $$('.gl-sec').forEach(sec => { sec.hidden = !$$('.g-item', sec).some(g => !g.hidden); });
    $('#gEmpty').hidden = n > 0;
  };
  $('.gl-az').onclick = e => { const a = e.target.closest('[data-az]'); if (!a) return; e.preventDefault(); const t = document.getElementById('gl-' + a.dataset.az); if (t) t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); };
}

/* ---------- FAQ ---------- */
const FAQ_GRUP = [['Tentang pelatihan', [0, 1, 2]], ['Cara belajar', [3, 6]], ['Evaluasi dan nilai', [4, 5]]];
function viewFaq() {
  return FAQ_GRUP.map(([g, ix]) => `<h2 class="gd-h">${g}</h2><div class="faq2">${ix.map(k => `<details><summary><span class="fq-q">Q</span>${FAQ[k][0]}<span class="fq-plus"></span></summary><p>${FAQ[k][1]}</p></details>`).join('')}</div>`).join('');
}

/* ---------- Kerangka halaman Panduan ---------- */
const GUIDE_SUB = { petunjuk: 'Empat langkah memakai Smart Emailing dan arti kode interaksi.', tujuan: 'Apa yang kamu kuasai setelah pelatihan, sampai ke tiap bagian.', peta: 'Seluruh isi pelatihan dalam satu peta. Sorot atau klik konsep untuk melihat hubungannya.', glosarium: 'Istilah penting di email lamaran, lengkap dengan bagian asalnya.', faq: 'Pertanyaan yang paling sering muncul.' };
const GUIDE_VIEW = { petunjuk: [viewPetunjuk, mountPetunjuk], tujuan: [viewTujuan], peta: [viewPeta, mountPeta], glosarium: [viewGlosarium, mountGlosarium], faq: [viewFaq] };
function viewPanduan(tab) {
  const k = NAV_PANDUAN[tab] || 'petunjuk', i = GUIDE_LIST.findIndex(g => g[0] === k), [, t, ic, c] = i >= 0 ? GUIDE_LIST[i] : GUIDE_FAQ;
  const prev = i >= 0 && GUIDE_LIST[i - 1], next = i >= 0 && GUIDE_LIST[i + 1];
  return `<div class="page wrap lms gd">
    ${pageHero(ic, c, i >= 0 ? `Panduan · ${i + 1}/${GUIDE_LIST.length}` : 'Bantuan', t, GUIDE_SUB[k])}
    <div class="gd-body">${GUIDE_VIEW[k][0]()}</div>
    ${i < 0 ? '' : `<nav class="gd-pager">${prev ? `<a href="#/${prev[0]}" style="--tc:${prev[3]}"><small>${icon('left')} Sebelumnya</small><span>${pxi(prev[2])}<b>${prev[1]}</b></span></a>` : '<span></span>'}${next ? `<a class="nx" href="#/${next[0]}" style="--tc:${next[3]}"><small>Berikutnya ${icon('right')}</small><span>${pxi(next[2])}<b>${next[1]}</b></span></a>` : ''}</nav>`}
  </div>`;
}
function mountPanduan(tab) { const k = NAV_PANDUAN[tab] || 'petunjuk'; if (GUIDE_VIEW[k][1]) GUIDE_VIEW[k][1](); }

/* =========================================================================
   LAINNYA: Pengaturan dan Tentang
   ========================================================================= */
function viewPengaturan() {
  const sw = (id, on, ic, t, d) => `<label class="set2"><span class="set2-ic">${icon(ic)}</span><span class="set2-t"><b>${t}</b><small>${d}</small></span><input type="checkbox" class="switch" id="${id}" ${on ? 'checked' : ''}></label>`;
  return `<div class="page wrap lms set">
    ${pageHero('pengaturan', '#6b7280', 'Akun', 'Pengaturan', 'Atur tampilan, suara, dan data belajarmu. Semua tersimpan di browser ini.')}
    <section class="card"><h2 class="prg-k">Tampilan dan suara</h2>
      ${sw('setSound', state.sound, 'vol', 'Efek suara', 'Bunyi klik dan nada benar/salah.')}
      ${sw('setMini', !!UI().mini, 'panel', 'Menu samping ringkas', 'Menu kiri hanya menampilkan ikon, konten jadi lebih lebar.')}
      ${sw('setCalm', !!UI().calm, 'eyeoff', 'Kurangi animasi', 'Matikan efek gerak seperti konfeti dan transisi antarhalaman.')}
    </section>
    <section class="card"><h2 class="prg-k">Data belajar</h2>
      <div class="set2"><span class="set2-ic">${icon('trash')}</span><span class="set2-t"><b>Reset progres</b><small>Kembalikan bagian selesai, jawaban, nilai, XP, dan riwayat belajar ke awal. Nama dan pengaturan tetap tersimpan. Ada konfirmasi dulu.</small></span><button type="button" class="btn btn-outline btn-sm danger" id="setReset">Reset progres</button></div>
    </section>
  </div>`;
}
function mountPengaturan() {
  $('#setSound').onchange = e => { state.sound = e.target.checked; save(); updateBar(); sfx(); };
  $('#setMini').onchange = e => { UI().mini = e.target.checked; save(); applyMini(); };
  $('#setCalm').onchange = e => { UI().calm = e.target.checked; save(); applyCalm(); };
  $('#setReset').onclick = resetAll;
}
const applyCalm = () => document.body.classList.toggle('calm', !!UI().calm);
/* Anggota tim. Foto: simpan di assets/tim/ (potret 4:5, misalnya 800x1000 px) lalu isi foto: 'assets/tim/nama.jpg'.
   Selama foto belum ada, bingkai menampilkan siluet. */
const TIM = [
  { nama: 'Joice Aurel Syalom', nim: '1101624061', foto: '' },
  { nama: 'Khairun Nisa', nim: '1101624018', foto: '' },
  { nama: 'Nadya Theresia Silalahi', nim: '1101624083', foto: '' },
  { nama: 'Syahla Adfa Adinda', nim: '1101624042', foto: '' },
];
const SILUET = '<svg class="tm-sil" viewBox="0 0 80 100" aria-hidden="true"><circle cx="40" cy="36" r="17"/><path d="M8 100c0-21 14-35 32-35s32 14 32 35z"/></svg>';
const kartuTim = a => `<li class="tm-card">
  <figure class="tm-ph${a.foto ? ' has' : ''}">${SILUET}${a.foto ? `<img src="${a.foto}" alt="Foto ${a.nama}" loading="lazy" onerror="this.parentNode.classList.remove('has'); this.parentNode.removeChild(this)">` : ''}<figcaption>Foto</figcaption></figure>
  <b class="tm-nm">${a.nama}</b><small class="tm-nim">NIM ${a.nim}</small></li>`;

function bagianVersi() {
  const baris = [{ slug: '', nama: 'Versi terbaru', tanggal: '', ket: 'Terus dikembangkan sampai versi final (9 Desember 2026).' }, ...VERSI.slice().reverse()];
  return `<section class="vr" aria-labelledby="vrH"><div class="tm-head"><h2 id="vrH">Versi produk</h2><small>${VERSI.length} versi dibekukan</small></div>
    <ul class="vr-list">${baris.map(v => {
      const ini = VERSI_INI ? VERSI_INI.slug === v.slug : !v.slug;
      return `<li class="vr-row${ini ? ' on' : ''}"><div class="vr-t"><b>${v.nama}</b>${v.tanggal ? `<small>${tglID(v.tanggal)}</small>` : ''}<p>${v.ket}</p></div>
        ${ini ? '<span class="vr-on">Sedang dibuka</span>' : `<a class="btn btn-outline btn-sm" href="${urlVersi(v.slug)}" data-versi="${v.slug || 'terbaru'}">Buka versi ini ${icon('right')}</a>`}</li>`;
    }).join('')}</ul></section>`;
}

function viewTentang() {
  const isi = [[MATERI_BAGIAN.length, 'bagian materi'], [LATIHAN.length, 'soal latihan'], [3, 'aktivitas'], [EVALUASI.length, 'soal evaluasi']];
  const interaksi = ['Seret & letakkan', 'Klik informasi', 'Temukan kesalahan', 'Simulasi email', 'Skenario bercabang', 'Kuis'];
  return `<div class="page wrap lms">
    ${pageHero('tentang', '#c2457e', 'Lainnya', 'Tentang & tim', 'Media pembelajaran interaktif buatan Kelompok 7.')}
    <section class="ab-hero"><span class="ab-m">${MASCOT}</span><div><small class="ph-k">Judul proyek</small><h2>Pengembangan Pelatihan Smart Emailing</h2><p>Membuat email profesional berbasis multimedia untuk fresh graduate.</p></div></section>
    <div class="ab-nums">${isi.map(([n, t]) => `<div><b data-count="${n}">${n}</b><small>${t}</small></div>`).join('')}</div>
    <section class="tm" aria-labelledby="tmH"><div class="tm-head"><h2 id="tmH">Tim pengembang</h2><small>Kelompok 7</small></div>
      <ul class="tm-grid">${TIM.map(kartuTim).join('')}</ul></section>
    ${bagianVersi()}
    <div class="pg-grid">
      <section class="card"><h2 class="prg-k">Tujuan umum</h2><p>Fresh graduate mampu merancang email lamaran kerja dengan memperhatikan struktur dan etika komunikasi profesional dalam dunia kerja.</p><a class="card-link" href="#/tujuan">Lihat tujuan per bagian ${icon('right')}</a></section>
      <section class="card"><h2 class="prg-k">Format media</h2><p>Multimedia interaktif non-linear untuk belajar mandiri.</p><div class="ab-chips">${interaksi.map(t => `<span>${t}</span>`).join('')}</div></section>
      <section class="card"><h2 class="prg-k">Metode</h2><p>Storyboard disusun dengan template non-linear (Imbar dkk., 2021).</p></section>
      <section class="card"><h2 class="prg-k">Teknologi</h2><p>HTML, CSS, dan JavaScript tanpa framework. Bisa dibuka tanpa internet, dan tersedia sebagai paket SCORM 1.2 untuk LMS.</p></section>
    </div>
  </div>`;
}

const PAGES = {
  '': { v: viewHome, m: mountHome, title: '', nav: 'home' },
  materi: { v: viewMateri, title: 'Katalog materi', nav: 'katalog' },
  menu: { v: viewMateri, title: 'Katalog materi', nav: 'katalog' },
  panduan: { v: () => viewPanduan('panduan'), m: () => mountPanduan('panduan'), title: 'Panduan', nav: 'petunjuk' },
  tujuan: { v: () => viewPanduan('tujuan'), m: () => mountPanduan('tujuan'), title: 'Panduan', nav: 'tujuan' },
  petunjuk: { v: () => viewPanduan('petunjuk'), m: () => mountPanduan('petunjuk'), title: 'Panduan', nav: 'petunjuk' },
  peta: { v: () => viewPanduan('peta'), m: () => mountPanduan('peta'), title: 'Panduan', nav: 'peta' },
  glosarium: { v: () => viewPanduan('glosarium'), m: () => mountPanduan('glosarium'), title: 'Panduan', nav: 'glosarium' },
  faq: { v: () => viewPanduan('faq'), m: () => mountPanduan('faq'), title: 'FAQ', nav: '' },
  tentang: { v: viewTentang, title: 'Tentang & tim', nav: 'tentang' },
  latihan: { v: viewLatihanPage, m: mountLatihanPage, title: 'Latihan', nav: 'latihan' },
  progres: { v: viewProgres, m: mountProgres, title: 'Progres belajar', nav: 'progres' },
  pencapaian: { v: viewProgres, m: mountProgres, title: 'Progres belajar', nav: 'progres' },
  pengaturan: { v: viewPengaturan, m: mountPengaturan, title: 'Pengaturan', nav: '' },
  sertifikat: { v: viewSertifikat, m: mountSertifikat, title: 'Sertifikat', nav: 'progres' },
};

let routeToken = 0, firstRoute = true, lastKey = null;

/* =========================================================================
   TRANSISI ANTAR-HALAMAN — berbeda menurut tujuan, tetap halus
   ========================================================================= */
const GUIDE = ['panduan', 'tujuan', 'petunjuk', 'peta', 'glosarium', 'faq'];
function pickTransition(from, to) {
  if (from === to) return null;
  if (to === 'evaluasi-akhir') return 'curtain';
  const fi = ORDER.indexOf(from), ti = ORDER.indexOf(to);
  if (ti >= 0 && fi >= 0) return ti > fi ? 'slideL' : 'slideR';
  return 'rise';
}
const EASE = 'cubic-bezier(.2, .8, .2, 1)';
const T_EXIT = {
  slideL: [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-90px)' }],
  slideR: [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(90px)' }],
  rise: [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-14px)' }],
};
const T_ENTER = {
  slideL: [{ opacity: 0, transform: 'translateX(140px)' }, { opacity: 1, transform: 'translateX(0)' }],
  slideR: [{ opacity: 0, transform: 'translateX(-140px)' }, { opacity: 1, transform: 'translateX(0)' }],
  rise: [{ opacity: 0, transform: 'translateY(80px)' }, { opacity: 1, transform: 'translateY(0)' }],
};
const T_DUR = { slideL: 700, slideR: 700, rise: 750 };
async function pageExit(t) {
  try {
    const an = app.animate(T_EXIT[t], { duration: 260, easing: 'ease-in', fill: 'forwards' });
    await Promise.race([an.finished, wait(320)]);
  } catch (e) { /* browser lama: tanpa animasi */ }
}
function pageEnter(t) {
  try {
    $$('.rail, .side, .sheet > *, .hero-text > *, .hero-art, .start-card, .mat-card, .cat-card').forEach(e => (e.style.animation = 'none'));
    app.getAnimations().forEach(a => a.cancel());
    const an = app.animate(T_ENTER[t], { duration: T_DUR[t], easing: EASE });
    /* Cadangan: bila timeline tertahan (tab tersembunyi/iframe), lepas animasinya agar konten tetap terlihat */
    later(() => an.cancel(), T_DUR[t] + 300);
  } catch (e) { app.getAnimations && app.getAnimations().forEach(a => a.cancel()); }
}
const NAV_OF = id => (['latihan-soal', 'aktivitas-interaktif'].includes(id) ? 'latihan' : ['awal-evaluasi', 'evaluasi-akhir', 'penutup'].includes(id) ? 'evaluasi' : 'materi');
async function route() {
  const token = ++routeToken;
  cleanups.forEach(fn => fn()); cleanups = [];
  closeMenu();
  let [page = '', arg] = location.hash.replace(/^#\/?/, '').split('/');
  if (page === 'scene') page = 'bagian';
  if (arg && ID_LAMA[arg]) arg = ID_LAMA[arg];
  const isBagian = page === 'bagian' && BAGIAN[arg];
  if (page) editNama = false;
  if (!namaUser() && (isBagian || ['latihan', 'sertifikat'].includes(page))) { toast('Isi namamu dulu di Beranda, ya.'); location.replace('#/'); return; }
  const curtain = $('#curtain');
  const key = isBagian ? arg : (PAGES[page] ? page : '');
  const tr = firstRoute || reduced ? null : pickTransition(lastKey, key);
  if (tr === 'curtain') {
    $('.cur-code', curtain).innerHTML = icon('flag');
    $('.cur-title', curtain).textContent = BAGIAN[arg].title;
    curtain.className = 'curtain cover';
    await wait(420); if (token !== routeToken) return;
  } else if (tr) {
    await pageExit(tr); if (token !== routeToken) return;
  }
  lastKey = key;
  if (app.getAnimations) app.getAnimations().forEach(a => a.cancel());
  firstRoute = false;
  let navKey = '';
  if (isBagian && locked(arg)) {
    const why = peekInfo(arg).why, back = arg === 'evaluasi-akhir' ? '#/bagian/awal-evaluasi' : resumeHref();
    app.innerHTML = `<div class="lesson-wide wrap"><article class="sheet"><div class="lockbox">${icon('lock')}<h3>${BAGIAN[arg].title} masih terkunci</h3>
      <p class="muted">${why}</p>
      <a class="btn btn-primary" href="${back}">Lanjutkan belajar ${icon('right')}</a></div></article></div>`;
    navKey = NAV_OF(arg);
    document.title = `${BAGIAN[arg].title} terkunci — Smart Emailing`;
  } else if (isBagian) {
    state.last = arg; setResume('#/bagian/' + arg, 'bagian', arg); logAct('open', arg);
    app.innerHTML = viewBagian(arg);
    mountBagian(arg);
    navKey = NAV_OF(arg);
    document.title = `${BAGIAN[arg].title} — Smart Emailing`;
  } else {
    const p = PAGES[page] || PAGES[''];
    app.innerHTML = p.v(); p.m && p.m();
    navKey = p.nav || '';
    document.title = p.title ? `${p.title} — Smart Emailing` : 'Smart Emailing — Pelatihan Menulis Email Profesional';
  }
  if (!isBagian && !page) navKey = 'home';
  $('#setBtn').classList.toggle('on', page === 'pengaturan'); $('#faqFab').classList.toggle('on', page === 'faq');
  $('#pgTitle').textContent = isBagian ? BAGIAN[arg].title : (PAGES[page] && PAGES[page].title) || '';
  /* layar kuis memakai seluruh layar: menu samping disembunyikan */
  document.body.classList.toggle('focus-mode', !!((page === 'latihan' && arg && setOf(arg) && !location.hash.split('/')[3] && !locked('latihan-soal')) || (isBagian && arg === 'evaluasi-akhir' && !locked('evaluasi-akhir') && state.ev && state.ev.started && !state.ev.done)));
  setNavActive(navKey); drawer(false);
  document.body.dataset.page = navKey;
  requestAnimationFrame(() => moveInd(activeTab()));
  /* Rute belajar: geser otomatis supaya bagian sekarang berada di tengah */
  const trk = $('.r2-track'), curStop = trk && $('.r2-stop.cur', trk);
  if (curStop && trk.scrollWidth > trk.clientWidth) trk.scrollLeft = curStop.getBoundingClientRect().left - trk.getBoundingClientRect().left + trk.scrollLeft - trk.clientWidth / 2 + curStop.offsetWidth / 2;
  $('#readLine').style.width = '0%';
  document.body.classList.toggle('is-home', !isBagian && !page);
  window.scrollTo({ top: 0, behavior: 'instant' });
  app.focus({ preventScroll: true });
  updateBar();
  /* Cadangan agar konten tetap tampil walau animasi tertahan */
  document.body.classList.remove('settled'); later(() => document.body.classList.add('settled'), 1400);
  if (tr && tr !== 'curtain') pageEnter(tr);
  if (curtain.classList.contains('cover')) { curtain.className = 'curtain cover leave'; setTimeout(() => { if (token === routeToken) curtain.className = 'curtain'; }, 600); }
}

function updateBar() {
  sideUpdate();
  const p = pct(), C = 2 * Math.PI * 16;
  const ring = $('#progRing'); ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - p / 100);
  $('#progText').textContent = p + '%';
  const sb = $('#soundBtn');
  sb.innerHTML = icon(state.sound ? 'vol' : 'mute');
  sb.setAttribute('aria-label', state.sound ? 'Matikan efek suara' : 'Nyalakan efek suara'); sb.title = sb.getAttribute('aria-label');
  /* Badge ala notifikasi email */
  const belum = LATIHAN.length - Object.keys((state.lat && state.lat.res) || {}).length;
  const bl = $('#badgeLat'); bl.textContent = belum > 0 ? belum : ''; bl.classList.toggle('on', belum > 0); bl.title = belum > 0 ? `${belum} soal latihan belum dikerjakan` : '';
  const be = $('#badgeEv'); be.className = 'tbadge ' + (evalPassed() ? 'on ok' : !gateOk() ? 'on lock' : '');
  be.innerHTML = evalPassed() ? icon('check') : !gateOk() ? icon('lock') : '';
  be.title = evalPassed() ? 'Evaluasi sudah lulus' : !gateOk() ? 'Terbuka setelah tiga syarat di Awal Evaluasi terpenuhi' : '';
  if (!$('#progPop').hidden) renderPop();
}
function renderPop() {
  const latOk = state.lat ? Object.values(state.lat.res || {}).filter(Boolean).length : 0;
  const ev = state.ev && state.ev.done ? state.ev.score : null;
  $('#progPop').innerHTML = `<div class="pp-h"><b>Progres kamu</b><small>${doneCount()} dari ${ORDER.length} bagian selesai</small></div>
    <a class="pp-lv" href="#/progres">${levelCard('mini')}<span class="pp-bdg">${BADGES.map(b => `<i class="${b.ok() ? 'on' : ''}" title="${b.t}">${icon(b.ok() ? b.ic : 'lock')}</i>`).join('')}</span></a>
    ${MATERI.map(m => { const d = m.bagian.filter(id => state.done[id]).length; return `<div class="pp-row"><span>${m.short}</span><span class="bar"><i style="width:${d / m.bagian.length * 100}%"></i></span><b>${d}/${m.bagian.length}</b></div>`; }).join('')}
    <div class="pp-sub"><span>${icon('pen')} Latihan</span><b>${latOk}/${LATIHAN.length} benar</b></div>
    <div class="pp-sub"><span>${icon('grid')} Aktivitas interaktif</span><b>${AKT_KEYS.filter(k => state.akt && state.akt[k] && state.akt[k].done).length}/3 selesai</b></div>
    <div class="pp-sub"><span>${icon('flag')} Evaluasi</span><b>${ev !== null ? 'Nilai ' + ev : gateOk() ? 'Siap dikerjakan' : 'Terkunci'}</b></div>
    <a class="btn btn-primary btn-sm" href="${doneCount() ? resumeHref() : '#/bagian/pengantar'}">${doneCount() ? 'Lanjutkan belajar' : 'Mulai belajar'} ${icon('right')}</a>`;
}
function togglePop(force) {
  const pop = $('#progPop'), open = force !== undefined ? force : pop.hidden;
  if (open) renderPop();
  pop.hidden = !open; $('#progBtn').setAttribute('aria-expanded', String(open));
}
/* Penanda tab yang meluncur mengikuti kursor */
function moveInd(el) {
  const ind = $('#tabInd'), tabs = $('#navLinks');
  if (!ind) return;
  if (!el || getComputedStyle(ind).display === 'none') { ind.style.opacity = 0; return; }
  const r = el.getBoundingClientRect(), t = tabs.getBoundingClientRect();
  ind.style.opacity = 1; ind.style.width = r.width + 'px'; ind.style.transform = `translateX(${r.left - t.left}px)`;
}
const activeTab = () => $('#navLinks a.active');
function closeMenu() { togglePop(false); }

/* ---------- Tombol FAQ: menyingkir saat menggulir ke bawah supaya tidak menutupi konten ---------- */
(() => {
  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, fab = $('#faqFab'), bottom = innerHeight + y >= document.documentElement.scrollHeight - 8;
      if (fab) fab.classList.toggle('away', y > lastY + 4 && y > 120 && !bottom);
      if (Math.abs(y - lastY) > 4 || bottom) lastY = y;
      ticking = false;
    });
  }, { passive: true });
  addEventListener('hashchange', () => { const fab = $('#faqFab'); if (fab) fab.classList.remove('away'); });
})();

/* ---------- Mulai ---------- */
$('#brandMark').innerHTML = LOGO; $('#brandMark2').innerHTML = LOGO;
$('#sideMini').onclick = () => { UI().mini = !UI().mini; save(); applyMini(); sfx(); };
applyMini();
applyCalm();
if (VERSI_INI) {
  document.body.classList.add('beku');
  document.title += ` (Versi ${VERSI_INI.nama})`;
  document.body.insertAdjacentHTML('beforeend', `<a class="ver-strip" id="verStrip" href="${urlVersi('')}"><span><b>Versi ${VERSI_INI.nama}</b> · ${tglID(VERSI_INI.tanggal)}</span><span class="vs-go">Lihat versi terbaru ${icon('right')}</span></a>`);
}
sideInit();
$$('.t-ic:not([data-px])').forEach(e => { e.innerHTML = icon(e.dataset.ic); });
$$('#navLinks a').forEach(a => { a.addEventListener('mouseenter', () => moveInd(a)); a.addEventListener('focus', () => moveInd(a)); });
$('#navLinks').addEventListener('mouseleave', () => moveInd(activeTab()));
$('#progBtn').onclick = e => { e.stopPropagation(); togglePop(); };
document.addEventListener('click', e => { if (!$('#progPop').hidden && !e.target.closest('#progPop')) togglePop(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') togglePop(false); });
window.addEventListener('resize', () => moveInd(activeTab()));
$('.curtain-in').insertAdjacentHTML('afterbegin', `<span class="cur-logo">${LOGO}</span>`);
$('#soundBtn').onclick = () => { state.sound = !state.sound; save(); updateBar(); sfx(); toast(state.sound ? 'Efek suara aktif.' : 'Efek suara dimatikan.'); };
/* Semua ikon bisa diklik: memantul + bunyi klik (ubin dekoratif juga) */
const ICON_TILE = '.sc-ic, .mat-ic, .bc-ic, .rail-ic, .act-num, .ip-ic, .how-ic, .mv-av, .env-ic, .ib-ic, .mcol-ic, .lico-c, .avatar, .pin, .tag, .brand-mark, .sc-av, .iav, .hs-num, .bk, .opt-l, .o-n, .lockbox > .ic, .thanks > .ic, .ig h4 .ic, .goal-box .ic, .narasi-h .ic, .act-tag .ic, .box-h, .tt-f .ic';
document.addEventListener('pointerdown', e => {
  const tile = e.target.closest(ICON_TILE), ic = e.target.closest('.ic') || (tile && tile.querySelector('.ic'));
  const target = tile || ic; if (!target || reduced) return;
  try { target.animate([{ transform: 'scale(1)' }, { transform: 'scale(.82) rotate(-6deg)' }, { transform: 'scale(1.12) rotate(4deg)' }, { transform: 'scale(1)' }], { duration: 480, easing: 'cubic-bezier(.3, 1.4, .5, 1)' }); } catch (err) { /* tanpa animasi */ }
  if (tile && !e.target.closest('a, button, label, input, select, textarea')) sfx();
}, { passive: true });
/* Ikon tanpa tautan tetap punya tujuan: halaman (#/...) atau bagian di halaman yang sama */
const jumpTo = t => { if (t.startsWith('#')) { location.hash = t; return; } const d = document.getElementById(t); if (d) d.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); };
const markTo = () => $$('[data-to]:not([tabindex])').forEach(e => { e.tabIndex = 0; e.setAttribute('role', 'link'); });
document.addEventListener('click', e => { const t = e.target.closest('[data-to]'); if (t && !e.target.closest('a, button')) jumpTo(t.dataset.to); });
document.addEventListener('keydown', e => { const t = e.target.closest && e.target.closest('[data-to]'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); jumpTo(t.dataset.to); } });
new MutationObserver(markTo).observe(document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', route);
window.addEventListener('scroll', () => { const max = document.documentElement.scrollHeight - innerHeight; $('#nav').classList.toggle('scrolled', scrollY > 8); $('#readLine').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'; }, { passive: true });
if (!state.game) gameCheck();
gameOn = true;
route();
