#!/usr/bin/env python3
"""
Añade a cada imagen de ./images/ una versión basada en su contenido:
    ./images/foto.jpg  ->  ./images/foto.jpg?v=1a2b3c4d

Si la imagen cambia, cambia la versión y los navegadores descargan la nueva
en lugar de usar la que tenían en caché. Es seguro ejecutarlo varias veces:
solo modifica las páginas cuya versión ha cambiado.

Uso (desde la raíz del repo):  python3 tools/cache-bust.py
Se ejecuta solo en cada push mediante .github/workflows/cache-bust.yml.
"""
import glob
import hashlib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_REF = re.compile(
    r"(\./images/[^\"'()?<>]+?\.(?:jpe?g|png|webp|gif|svg|avif))(\?v=[0-9a-f]+)?",
    re.IGNORECASE,
)

_hashes = {}


def version(rel_path):
    if rel_path not in _hashes:
        path = os.path.join(ROOT, rel_path)
        if not os.path.isfile(path):
            _hashes[rel_path] = None
        else:
            with open(path, "rb") as f:
                _hashes[rel_path] = hashlib.md5(f.read()).hexdigest()[:8]
    return _hashes[rel_path]


missing = set()
changed = []
for page in sorted(glob.glob(os.path.join(ROOT, "*.html"))):
    with open(page, encoding="utf-8") as f:
        html = f.read()

    def bump(m):
        v = version(m.group(1)[2:])
        if v is None:
            missing.add(m.group(1))
            return m.group(0)
        return f"{m.group(1)}?v={v}"

    new = IMG_REF.sub(bump, html)
    if new != html:
        with open(page, "w", encoding="utf-8") as f:
            f.write(new)
        changed.append(os.path.basename(page))

print(f"Páginas actualizadas: {len(changed)}")
for p in changed:
    print("  " + p)
if missing:
    print("AVISO: imágenes referenciadas que no existen:", file=sys.stderr)
    for m in sorted(missing):
        print("  " + m, file=sys.stderr)
