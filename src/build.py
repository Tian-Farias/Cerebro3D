#!/usr/bin/env python3
"""Genera ../cerebro.html: un único archivo autocontenido (Three.js incrustado, funciona sin internet).

Fuentes (en este directorio):
  index.html        esqueleto HTML con marcadores <!-- @css --> y <!-- @scripts -->
  css/style.css     estilos
  vendor/*.js       Three.js r147 y OrbitControls (licencia MIT)
  js/*.js           código de la app; se concatenan en orden dentro de una única IIFE
"""
import pathlib, re, sys

here = pathlib.Path(__file__).resolve().parent
JS_ORDER = ['content.js', 'info1.js', 'info2.js', 'info3.js', 'tours.js', 'geometry.js', 'scene.js', 'ui.js', 'study.js', 'main.js']
VENDOR = ['three.min.js', 'OrbitControls.js']

def read(p):
    return (here / p).read_text(encoding='utf-8')

html = read('index.html')
css = read('css/style.css')
vendor = '\n'.join(f'<script>\n{read("vendor/" + v)}\n</script>' for v in VENDOR)
parts = []
for name in JS_ORDER:
    code = read('js/' + name)
    assert '</script' not in code.lower(), f'{name} contiene </script>'
    parts.append(f'/* ===== {name} ===== */\n{code}')
app = "<script>\n(function(){\n'use strict';\n" + '\n'.join(parts) + "\n})();\n</script>"

assert '<!-- @css -->' in html and '<!-- @scripts -->' in html
html = html.replace('<!-- @css -->', '<style>\n' + css + '</style>')
html = html.replace('<!-- @scripts -->', vendor + '\n' + app)

# versión: fecha de generación, visible en "Acerca de"
import datetime
html = html.replace('@@BUILD@@', datetime.date.today().isoformat())

out = here.parent / 'cerebro.html'
out.write_text(html, encoding='utf-8')
print(f'{out} ({out.stat().st_size/1024:.0f} KB)')
