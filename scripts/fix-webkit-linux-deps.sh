#!/usr/bin/env bash
# Fixes Playwright WebKit on Linux distros Playwright doesn't officially
# support (e.g. Fedora), where the system's ICU/libjpeg versions don't match
# the sonames WebKit's prebuilt binaries expect. This does NOT touch any
# system files - it only downloads the exact Ubuntu .deb libraries Playwright
# was built against into a local shim directory, and points WebKit's bundled
# launcher scripts at that directory via LD_LIBRARY_PATH.
#
# Safe to re-run. Only needed once per `playwright install` of webkit.
set -euo pipefail

SHIM_DIR="${CMAIL_WEBKIT_LIBSHIM:-$HOME/.cache/cmail/webkit-libshim}"
mkdir -p "$SHIM_DIR"

WEBKIT_DIR="$(find "$HOME/.cache/ms-playwright" -maxdepth 1 -iname "webkit-*" | head -1)"
if [[ -z "$WEBKIT_DIR" ]]; then
  echo "No Playwright webkit install found. Run: npx playwright install webkit" >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Fetching compatible libicu74 and libjpeg-turbo8 from Ubuntu archive..."
curl -sL -o "$WORK/libicu74.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu74_74.2-1ubuntu3.1_amd64.deb"
curl -sL -o "$WORK/libjpeg-turbo8.deb" \
  "http://archive.ubuntu.com/ubuntu/pool/main/libj/libjpeg-turbo/libjpeg-turbo8_2.1.5-4ubuntu4_amd64.deb"

pushd "$WORK" >/dev/null
ar x libicu74.deb && tar xf data.tar.* --wildcards '*.so.*'
ar x libjpeg-turbo8.deb && tar xf data.tar.* --wildcards '*.so.*' -C . 2>/dev/null || true
popd >/dev/null

cp "$WORK/usr/lib/x86_64-linux-gnu/libicudata.so.74.2" "$SHIM_DIR/libicudata.so.74"
cp "$WORK/usr/lib/x86_64-linux-gnu/libicui18n.so.74.2" "$SHIM_DIR/libicui18n.so.74"
cp "$WORK/usr/lib/x86_64-linux-gnu/libicuuc.so.74.2" "$SHIM_DIR/libicuuc.so.74"
cp "$WORK/usr/lib/x86_64-linux-gnu/libjpeg.so.8.2.2" "$SHIM_DIR/libjpeg.so.8"

for wrapper in "$WEBKIT_DIR/minibrowser-gtk/MiniBrowser" "$WEBKIT_DIR/minibrowser-wpe/MiniBrowser"; do
  if [[ -f "$wrapper" ]] && ! grep -q "$SHIM_DIR" "$wrapper"; then
    sed -i "s|^export LD_LIBRARY_PATH=\"\${MYDIR}/lib:\${MYDIR}/sys/lib\"\$|export LD_LIBRARY_PATH=\"\${MYDIR}/lib:\${MYDIR}/sys/lib:$SHIM_DIR\"|" "$wrapper"
  fi
done

echo "Done. WebKit library shim installed at $SHIM_DIR"
