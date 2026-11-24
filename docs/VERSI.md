# Versi produk

Smart Emailing dikumpulkan bertahap. Setiap tahap punya alamat sendiri yang dibekukan (tidak berubah lagi),
sedangkan alamat utama terus dikembangkan sampai versi final.

| Versi | Alamat | Status |
|---|---|---|
| Versi terbaru | https://syahladfa.github.io/SmartEmailing/ | Terus dikembangkan sampai final (9 Desember 2026) |
| Pertemuan 12 | https://syahladfa.github.io/SmartEmailing/versi/pertemuan-12/ | Beku, 24 November 2026 |

Rencana tahap berikutnya: **After Konsultasi Ahli Media** (misalnya slug `ahli-media`) dan **Final** (slug `final`, 9 Desember 2026).

## Cara kerjanya

- Situs ini statis (HTML, CSS, JavaScript tanpa framework) dan diterbitkan GitHub Pages langsung dari branch `main`, folder root.
- Versi beku adalah salinan `index.html`, `css/`, `js/`, dan `assets/` di folder `versi/<slug>/`. Semua tautan aset relatif, jadi salinan itu jalan di subfolder.
- `index.html` salinan beku memuat `window.SE_VERSI = "<slug>"`. Karena itu salinan beku:
  - menampilkan pita label "Versi … · tanggal · Lihat versi terbaru" di bawah layar,
  - menyimpan progres peserta dengan kunci sendiri (`smart-emailing:v2@<slug>`), sehingga tidak tercampur dengan versi terbaru.
- Daftar versi ada di `js/app.js`, konstanta `VERSI`. Halaman **Tentang & tim → Versi produk** menampilkan semua versi beserta tombol "Buka versi ini".
- Tidak ada service worker/PWA, jadi tidak ada cache yang perlu dipisahkan per versi.
- `tools/publish.sh` dan sinkron otomatis tidak menyentuh folder `versi/`. Folder itu hanya berubah lewat `tools/bekukan-versi.sh`.
- Setiap versi beku punya tag git bernama sama dengan slug, menunjuk ke commit kode yang dibekukan.

## Membekukan versi berikutnya

1. Pastikan semua perubahan sudah diunggah: `./tools/publish.sh "pesan perubahan"`.
2. Tambahkan versi baru ke daftar `VERSI` di `js/app.js`, misalnya:
   ```js
   { slug: 'ahli-media', nama: 'After Konsultasi Ahli Media', tanggal: '2026-12-02', ket: 'Produk setelah revisi dari ahli media' },
   ```
   Slug hanya boleh huruf kecil, angka, dan tanda hubung.
3. Unggah perubahan daftar itu: `./tools/publish.sh "Tambah versi ahli-media ke daftar"`.
4. Jalankan tes: `node tools/tes-versi.mjs ahli-media`. Hasilnya harus "Semua tes lulus".
5. Bekukan: `./tools/bekukan-versi.sh ahli-media`.
   Skrip ini menyalin situs ke `versi/ahli-media/`, membuat tag git `ahli-media`, lalu commit dan unggah.
6. Tunggu 1–2 menit, lalu buka `https://syahladfa.github.io/SmartEmailing/versi/ahli-media/` dan alamat utama untuk memastikan keduanya jalan.
7. Tambahkan alamat baru ke tabel di README dan di dokumen ini.

Folder versi yang sudah ada tidak akan ditimpa. Kalau memang perlu membekukan ulang, pakai `--timpa`:
`./tools/bekukan-versi.sh ahli-media --timpa`.

Catatan: salinan beku hanya mengenal versi yang sudah ada saat ia dibekukan. Versi yang lebih baru selalu bisa dibuka lewat tautan "Lihat versi terbaru".
