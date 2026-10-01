#!/usr/bin/env python3
"""
generate-og.py — renders 1200x630 Open Graph card images, one per threat
unit, so links unfurl with unit art in Discord. Rerun after data changes:

    python3 scripts/generate-og.py
"""
import json, re, os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
W, H = 1200, 630
BG = (11, 4, 24)
GRID = (168, 85, 247)
MAGENTA = (255, 43, 214)
CYAN = (34, 211, 238)
TEXT = (242, 234, 255)
MUTED = (176, 158, 212)

def font(size, bold=True):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def load_matchups():
    src = open(os.path.join(ROOT, 'js/data/data-matchups.js'), encoding='utf8').read()
    src = src[src.index('{', src.index('DSA_MATCHUP_DATA')):]
    depth = 0
    for i, ch in enumerate(src):
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return json.loads(src[:i + 1])
    raise SystemExit('could not parse data-matchups.js')

def unit_img(slug, size):
    p = os.path.join(ROOT, 'assets/units', slug + '.png')
    if not os.path.exists(p):
        p = os.path.join(ROOT, 'assets/units/unknown.png')
    im = Image.open(p).convert('RGBA')
    ratio = size / max(im.width, im.height)
    im = im.resize((max(1, int(im.width * ratio)), max(1, int(im.height * ratio))), Image.LANCZOS)
    return im

def base_card():
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im, 'RGBA')
    for y in range(420, H, 30):
        d.line([(0, y), (W, y)], fill=GRID + (34,), width=2)
    cx = W // 2
    for i in range(-14, 15):
        d.line([(cx + i * 60, 420), (cx + i * 170, H)], fill=GRID + (26,), width=2)
    d.rectangle([(0, 0), (W - 1, H - 1)], outline=MAGENTA + (140,), width=3)
    return im, d

def draw_card(row):
    im, d = base_card()
    art = unit_img(row['enemySlug'], 300)
    im.paste(art, (70, 90, 70 + art.width, 90 + art.height), art)

    d.text((430, 84), 'DIRECT STRIKE THREAT', font=font(30), fill=MAGENTA)
    name = row['enemyThreat'].upper()
    d.text((424, 124), name, font=font(84 if len(name) < 15 else 62), fill=TEXT)

    d.text((430, 250), 'THE COUNTER  [%s]' % row['myRace'].upper(), font=font(30), fill=CYAN)
    x = 430
    for cu in (row.get('counterImages') or [])[:4]:
        ci = unit_img(cu['slug'], 110)
        d.rectangle([(x - 6, 294), (x + 116, 416)], outline=CYAN + (150,), width=2)
        im.paste(ci, (x + (110 - ci.width) // 2, 300 + (110 - ci.height) // 2), ci)
        label = cu['unit'][:12]
        d.text((x + 55 - d.textlength(label, font=font(20)) / 2, 420), label, font=font(20), fill=MUTED)
        x += 150

    d.text((70, 470), 'Watch it play out  ▶', font=font(38), fill=TEXT)
    brand = 'dgreat.guide'
    bf = font(46)
    d.text((W - 80 - d.textlength(brand, font=bf), 540), brand, font=bf, fill=CYAN)
    return im

def draw_default():
    im, d = base_card()
    d.text((80, 150), 'DGREAT.GUIDE', font=font(110), fill=TEXT)
    d.text((84, 290), 'Direct Strike counters, replays & academy', font=font(44), fill=MUTED)
    d.text((84, 370), 'Pick what’s killing you. Watch the counter play out.', font=font(36), fill=CYAN)
    return im

def main():
    out = os.path.join(ROOT, 'assets/og')
    os.makedirs(out, exist_ok=True)
    data = load_matchups()
    seen, n = set(), 0
    best = {}
    for r in data['threatResponses']:
        if not r.get('hasResponse'):
            continue
        s = r['enemySlug']
        if s not in best or (r.get('sortScore', 0) > best[s].get('sortScore', 0)):
            best[s] = r
    for s, r in best.items():
        draw_card(r).save(os.path.join(out, s + '.png'), optimize=True)
        n += 1
    draw_default().save(os.path.join(out, 'default.png'), optimize=True)
    print("wrote %d threat cards + default.png to assets/og/" % n)

if __name__ == "__main__":
    main()
