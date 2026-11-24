#!/bin/bash
# Bekukan versi produk saat ini ke versi/<slug>/ supaya bisa dibuka di <alamat utama>/versi/<slug>/.
#
# Pakai:
#   ./tools/bekukan-versi.sh <slug>                 bekukan, commit, buat tag git <slug>, lalu unggah
#   ./tools/bekukan-versi.sh <slug> --timpa         izinkan menimpa folder versi yang sudah ada
#   ./tools/bekukan-versi.sh <slug> --keluar DIR    tulis ke DIR/versi/<slug>/ (untuk tes; tanpa git)
#
# Syarat:
#   - slug hanya huruf kecil, angka, dan tanda hubung (contoh: pertemuan-12)
#   - slug sudah ada di daftar VERSI di js/app.js (nama, tanggal, keterangan)
#   - tanpa --keluar: semua perubahan sudah di-commit, karena tag <slug> menunjuk ke commit yang dibekukan
set -euo pipefail
cd "$(dirname "$0")/.."

SLUG="" ; TIMPA=0 ; KELUAR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --timpa) TIMPA=1 ;;
    --keluar) KELUAR="${2:?--keluar butuh nama folder}"; shift ;;
    -*) echo "Opsi tidak dikenal: $1" >&2; exit 2 ;;
    *) [ -z "$SLUG" ] || { echo "Hanya satu slug." >&2; exit 2; }; SLUG="$1" ;;
  esac
  shift
done

[ -n "$SLUG" ] || { echo "Pakai: $0 <slug> [--timpa] [--keluar DIR]" >&2; exit 2; }
if ! [[ "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Slug tidak valid: '$SLUG'. Hanya huruf kecil, angka, dan tanda hubung." >&2; exit 2
fi
if ! grep -q "slug: '$SLUG'" js/app.js; then
  echo "Slug '$SLUG' belum ada di daftar VERSI di js/app.js. Tambahkan dulu (slug, nama, tanggal, ket), lalu commit." >&2; exit 2
fi

GIT=1
SITE="."
if [ -n "$KELUAR" ]; then GIT=0; SITE="$KELUAR"; fi
DEST="$SITE/versi/$SLUG"

if [ "$GIT" = 1 ]; then
  if [ -n "$(git status --porcelain -- index.html css js assets)" ]; then
    echo "Masih ada perubahan yang belum di-commit di index.html/css/js/assets. Commit dulu (misalnya lewat tools/publish.sh)." >&2; exit 1
  fi
  if git rev-parse -q --verify "refs/tags/$SLUG" >/dev/null && [ "$TIMPA" = 0 ]; then
    echo "Tag git '$SLUG' sudah ada. Pakai --timpa kalau memang ingin membekukan ulang." >&2; exit 1
  fi
  # Ambil perubahan dari GitHub dulu, supaya commit yang ditag tidak berubah lagi karena rebase
  git pull -q --rebase origin main
fi

if [ -e "$DEST" ]; then
  if [ "$TIMPA" = 0 ]; then
    echo "Folder $DEST sudah ada. Versi beku tidak ditimpa kecuali pakai --timpa." >&2; exit 1
  fi
  case "$DEST" in */versi/"$SLUG") rm -rf -- "$DEST" ;; *) echo "Jalur tidak aman: $DEST" >&2; exit 1 ;; esac
fi

mkdir -p "$DEST"
rsync -a --exclude '.DS_Store' index.html css js assets "$DEST/"

# Tandai salinan ini sebagai versi beku (label versi + penyimpanan progres terpisah)
python3 - "$DEST/index.html" "$SLUG" <<'PY'
import re, sys
p, slug = sys.argv[1], sys.argv[2]
h = open(p, encoding='utf-8').read()
tag = '<script src="js/app.js'
assert h.count(tag) == 1, 'index.html harus memuat tepat satu js/app.js'
h = h.replace(tag, f'<script>window.SE_VERSI = "{slug}";</script>\n  {tag}')
h = h.replace('<head>', '<head>\n  <meta name="robots" content="noindex">', 1)
# Semua aset harus relatif supaya jalan di subfolder
bad = re.findall(r'(?:src|href)="(/[^"]*)"', h)
assert not bad, f'Tautan absolut tidak boleh ada: {bad}'
open(p, 'w', encoding='utf-8').write(h)
PY

echo "Versi '$SLUG' dibekukan ke $DEST"
[ "$GIT" = 1 ] || exit 0

SRC=$(git rev-parse --short HEAD)
git tag -f "$SLUG" HEAD >/dev/null
git add -- "versi/$SLUG"
git commit -q -m "Bekukan versi $SLUG (dari commit $SRC)"
git push -q origin main
git push -q -f origin "refs/tags/$SLUG"
echo "Terunggah. Tag '$SLUG' menunjuk ke commit $SRC. Versi beku terbuka di https://syahladfa.github.io/SmartEmailing/versi/$SLUG/ dalam 1–2 menit."
