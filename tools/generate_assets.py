"""
Generates every raster asset the site needs:
  * interior / architecture photographs (downloaded from Unsplash, converted to WebP)
  * procedurally generated tile textures (marble, stone, concrete, wood, terrazzo, metal)

Run:  python tools/generate_assets.py
Output: src/images/
"""
import io
import math
import os
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "images")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- photographs
PHOTOS = {
    "scene-living-oak": "1618221195710-dd6b41faaea6",
    "scene-living-cream": "1631679706909-1844bbd07221",
    "scene-living-modern": "1600607687939-ce8a6c25118c",
    "scene-bedroom": "1512918728675-ed5a9ecdebfd",
    "scene-kitchen": "1556911220-bff31c812dba",
    "scene-bathroom": "1584622650111-993a426fbf0a",
    "scene-bathroom-white": "1620626011761-996317b8d101",
    "scene-bathroom-dark": "1600566752355-35792bedcfea",
    "scene-commercial": "1497366216548-37526070297c",
    "scene-office": "1497215728101-856f4ea42174",
    "scene-outdoor": "1600566753190-17f0baa2a6c3",
    "scene-exterior-night": "1600585154340-be6161a56a0c",
}


def fetch(photo_id, width):
    url = f"https://images.unsplash.com/photo-{photo_id}?w={width}&q=80&auto=format&fit=max"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGB")


def save_webp(img, name, q=78):
    path = os.path.join(OUT, name)
    img.save(path, "WEBP", quality=q, method=6)
    return os.path.getsize(path) // 1024


def do_photos():
    for name, pid in PHOTOS.items():
        if os.path.exists(os.path.join(OUT, name + "-lg.webp")):
            continue
        try:
            big = fetch(pid, 2880)
            q = 82 if name == "scene-exterior-night" else 76
            kb = save_webp(big, name + "-lg.webp", q)
            md = big.copy()
            md.thumbnail((1920, 1920), Image.LANCZOS)
            save_webp(md, name + ".webp", q)
            sm = big.copy()
            sm.thumbnail((900, 900), Image.LANCZOS)
            save_webp(sm, name + "-sm.webp", 74)
            print(f"photo {name}: {big.size} lg={kb}KB")
        except Exception as e:  # noqa: BLE001
            print("FAILED", name, e)


def do_hero_mobile():
    """Portrait hero for phones (landscape photos crop badly on a tall screen)."""
    if os.path.exists(os.path.join(OUT, "hero-mobile-lg.webp")):
        return
    big = fetch("1600585154526-990dced4db0d", 1800)
    save_webp(big, "hero-mobile-lg.webp", 80)
    for name, w in (("hero-mobile", 1200), ("hero-mobile-sm", 800)):
        im = big.copy()
        im.thumbnail((w, w * 3), Image.LANCZOS)
        save_webp(im, name + ".webp", 78)
    print("hero-mobile", big.size)


# ------------------------------------------------------------------- textures
def noise(h, w, ch, cw, rng):
    a = rng.random((max(ch, 2), max(cw, 2))).astype("float32")
    im = Image.fromarray(a, mode="F").resize((w, h), Image.BICUBIC)
    return np.asarray(im)


def fbm(h, w, base, octaves, rng, pers=0.5, aspect=1.0):
    total = np.zeros((h, w), "float32")
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        c = base * (2 ** o)
        total += amp * noise(h, w, int(c), int(c * aspect), rng)
        norm += amp
        amp *= pers
    return total / norm


def hexc(s):
    s = s.lstrip("#")
    return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], "float32")


def lerp(a, b, t):
    return a[None, None, :] * (1 - t[..., None]) + b[None, None, :] * t[..., None]


def finish(img, rng, grain=0.018, gloss=0.0):
    h, w, _ = img.shape
    img = img + (rng.random((h, w, 1)).astype("float32") - 0.5) * 255 * grain
    if gloss:
        yy, xx = np.mgrid[0:h, 0:w].astype("float32")
        d = (xx + yy) / (w + h)
        sheen = np.clip(1 - np.abs(d - 0.38) * 3.2, 0, 1) ** 2
        img = img + sheen[..., None] * 255 * gloss
    return Image.fromarray(np.clip(img, 0, 255).astype("uint8"))


def coords(h, w):
    yy, xx = np.mgrid[0:h, 0:w].astype("float32")
    return xx / w, yy / h


def marble(S, rng, base, vein, vein2=None, strength=0.85, turb=2.6, freq=3.2, angle=0.55, cloud=0.14):
    h = w = S
    xx, yy = coords(h, w)
    n = fbm(h, w, 2, 3, rng, 0.45)
    n2 = fbm(h, w, 6, 3, rng, 0.4)
    fade = np.clip((fbm(h, w, 2, 3, rng, 0.6) - 0.35) * 3.2, 0.35, 1)
    t = (xx * (1 - angle) + yy * angle) * freq + (n - 0.5) * turb * 0.85 + (n2 - 0.5) * 0.1
    v = (1 - np.abs(np.sin(t * math.pi))) ** 9 * fade
    t2 = (xx * (1 - angle) * 0.9 + yy * angle * 1.2) * (freq * 1.9) + (n2 - 0.5) * turb * 0.7 + (n - 0.5) * 0.5
    fade2 = np.clip((fbm(h, w, 3, 3, rng, 0.6) - 0.45) * 4, 0, 1)
    v2 = (1 - np.abs(np.sin(t2 * math.pi))) ** 22 * fade2
    cl = fbm(h, w, 2, 4, rng, 0.6)
    b, vc = hexc(base), hexc(vein)
    img = lerp(b, b * (1 - cloud * 1.6), cl)
    img = lerp_img(img, vc, np.clip(v * strength, 0, 1))
    img = lerp_img(img, hexc(vein2) if vein2 else vc, np.clip(v2 * strength * 0.7, 0, 1))
    return img


def lerp_img(img, col, t):
    return img * (1 - t[..., None]) + col[None, None, :] * t[..., None]


def wood(S, rng, light, dark, planks=5, contrast=1.0, smoke=0.0):
    h = w = S
    k = S / 1100
    xx, yy = coords(h, w)
    warp = fbm(h, w, 2, 5, rng, 0.55, aspect=0.4)
    streak = noise(h, w, 6, 260, rng)
    streak2 = noise(h, w, 10, 520, rng)
    pw = w / planks
    idx = (np.arange(w) // pw).astype(int)
    ptone = rng.random(planks) * 0.5 - 0.25
    poff = rng.random(planks) * 400
    tone_c = ptone[idx][None, :].repeat(h, 0)
    off_c = poff[idx][None, :].repeat(h, 0)
    u = np.arange(w)[None, :].repeat(h, 0) + off_c
    rings = np.sin((u * 0.045 / k) + (warp - 0.5) * 22 + yy * 3)
    rings2 = np.sin((u * 0.11 / k) + (warp - 0.5) * 30)
    t = 0.5 + tone_c * 0.6 + rings * 0.09 * contrast + rings2 * 0.04 * contrast
    t += (streak - 0.5) * 0.28 * contrast + (streak2 - 0.5) * 0.14
    t = np.clip(t, 0, 1)
    img = lerp(hexc(light), hexc(dark), t)
    if smoke:
        img = img * (1 - smoke) + np.array([40, 34, 30], "float32") * smoke
    # plank gaps
    lx = (np.arange(w) % pw)
    gap = np.exp(-np.minimum(lx, pw - lx) / (1.3 * k))
    img = img * (1 - 0.35 * gap[None, :, None])
    # end-joints (staggered)
    for p in range(planks):
        y = int(rng.random() * h * 0.8 + h * 0.1)
        x0, x1 = int(p * pw), int((p + 1) * pw)
        img[max(y - int(k), 0):y + int(k), x0:x1] *= 0.72
    return img


def concrete(S, rng, base, dark, mottle=0.35):
    h = w = S
    k = S / 1100
    big = fbm(h, w, 2, 6, rng, 0.62)
    mid = fbm(h, w, 8, 4, rng, 0.5)
    img = lerp(hexc(base), hexc(dark), np.clip((big - 0.5) * 1.6 + 0.5 + (mid - 0.5) * mottle, 0, 1))
    pores = (rng.random((h, w)) > 0.9985).astype("float32")
    pores = np.asarray(Image.fromarray((pores * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.1 * k))).astype("float32") / 255
    img = img * (1 - np.clip(pores * 5, 0, 0.5)[..., None])
    return img


def stone(S, rng, base, dark, bands=11, pit=0.5, rough=False):
    h = w = S
    xx, yy = coords(h, w)
    warp = fbm(h, w, 3, 4, rng, 0.55)
    if rough:
        r = fbm(h, w, 16, 4, rng, 0.6)
        r = 1 - np.abs(r - 0.5) * 2
        t = np.clip(r * 1.1 + (warp - 0.5) * 0.5, 0, 1)
    else:
        t = 0.5 + 0.28 * np.sin(yy * math.pi * bands + (warp - 0.5) * 10) + (warp - 0.5) * 0.5
        t = np.clip(t, 0, 1)
    img = lerp(hexc(base), hexc(dark), t * 0.8)
    pits = noise(h, w, 420, 110, rng)
    p = np.clip((pits - (1 - 0.1 * pit)) * 28, 0, 1)
    p = np.asarray(Image.fromarray((p * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))).astype("float32") / 255
    img = img * (1 - 0.45 * p[..., None])
    return img


def terrazzo(S, rng, base, chips, count=900, rmin=4, rmax=30, base_dark=None):
    h = w = S
    k = S / 1100
    count, rmin, rmax = int(count * k * k), rmin * k, rmax * k
    cl = fbm(h, w, 3, 4, rng, 0.5)
    img = lerp(hexc(base), hexc(base_dark or base) * 0.93, cl)
    im = Image.fromarray(np.clip(img, 0, 255).astype("uint8")).convert("RGBA")
    d = ImageDraw.Draw(im)
    cols = [hexc(c) for c in chips]
    for _ in range(count):
        cx, cy = rng.random() * w, rng.random() * h
        r = rmin + (rmax - rmin) * (rng.random() ** 2.4)
        n = int(rng.integers(6, 10))
        ang0 = rng.random() * 6.28
        pts = []
        for k in range(n):
            a = ang0 + k * 6.283 / n
            rr = r * (0.55 + rng.random() * 0.6)
            pts.append((cx + math.cos(a) * rr * 1.2, cy + math.sin(a) * rr * 0.8))
        c = cols[int(rng.integers(0, len(cols)))] * (0.88 + rng.random() * 0.24)
        d.polygon(pts, fill=tuple(int(np.clip(v, 0, 255)) for v in c) + (255,))
    return np.asarray(im.convert("RGB")).astype("float32")


def metal(S, rng, base, dark, patina=0.0, patina_col="#6f8a7c"):
    h = w = S
    xx, yy = coords(h, w)
    s1 = noise(h, w, 520, 3, rng)
    s2 = noise(h, w, 180, 2, rng)
    sheen = 0.5 + 0.22 * np.sin(xx * 5.4 + yy * 1.2)
    t = np.clip(sheen + (s1 - 0.5) * 0.45 + (s2 - 0.5) * 0.25, 0, 1)
    img = lerp(hexc(dark), hexc(base), t)
    if patina:
        m = fbm(h, w, 3, 5, rng, 0.6)
        m = np.clip((m - 0.52) * 3.2, 0, 1) * patina
        img = lerp_img(img, hexc(patina_col), m)
    return img


# id -> (kind, params, gloss)
TILES = {
    "M01": ("marble", dict(base="#f3f0ea", vein="#9a968f", vein2="#c7a98a", strength=0.9, freq=2.6, turb=2.4), 0.10),
    "M02": ("marble", dict(base="#f6f4f0", vein="#b9b5ae", strength=0.55, freq=3.8, turb=3.2, cloud=0.1), 0.0),
    "M03": ("marble", dict(base="#17171a", vein="#d8d3c8", vein2="#8d8a84", strength=0.8, freq=2.4, turb=2.8, cloud=0.35), 0.12),
    "M04": ("marble", dict(base="#2f4a3c", vein="#e1ddcf", vein2="#8aa293", strength=0.75, freq=3.0, turb=3.0, cloud=0.3), 0.10),
    "M05": ("marble", dict(base="#8da3b4", vein="#f1f2f0", vein2="#566b7c", strength=0.8, freq=2.8, turb=3.4, cloud=0.25), 0.04),
    "M06": ("marble", dict(base="#e9ddc9", vein="#c4a98a", vein2="#f8f2e6", strength=0.7, freq=3.2, turb=2.6, cloud=0.18), 0.05),
    "S01": ("stone", dict(base="#e3d5bd", dark="#bba88a", bands=13, pit=0.8), 0.0),
    "S02": ("stone", dict(base="#3d3d3f", dark="#18181a", rough=True), 0.0),
    "S03": ("stone", dict(base="#d6c3a4", dark="#a58f6d", rough=True), 0.0),
    "S04": ("stone", dict(base="#8e8d89", dark="#4a4a48", rough=True), 0.0),
    "C01": ("concrete", dict(base="#b4b2ad", dark="#8b8984"), 0.0),
    "C02": ("concrete", dict(base="#dcdad5", dark="#bdbbb5", mottle=0.25), 0.0),
    "C03": ("concrete", dict(base="#4b4a48", dark="#2a2928"), 0.0),
    "C04": ("concrete", dict(base="#cfc4b0", dark="#a99c84"), 0.0),
    "W01": ("wood", dict(light="#dcbd8c", dark="#b88f55", planks=5), 0.0),
    "W02": ("wood", dict(light="#a98660", dark="#6c4f33", planks=5, smoke=0.18), 0.0),
    "W03": ("wood", dict(light="#7d5538", dark="#3f2a1b", planks=5, contrast=1.2), 0.0),
    "W04": ("wood", dict(light="#ece3d3", dark="#cdbfa6", planks=5, contrast=0.7), 0.0),
    "T01": ("terrazzo", dict(base="#ebe6dc", chips=["#c9b79a", "#9b9488", "#d8cfc0", "#6b6258", "#b99a76"], base_dark="#dcd5c8"), 0.1),
    "T02": ("terrazzo", dict(base="#cdb89a", chips=["#f2ebde", "#8a6b4d", "#b8996f", "#5d4a3a", "#e5d6bc"], base_dark="#bfa684"), 0.1),
    "T03": ("terrazzo", dict(base="#26262a", chips=["#e8e2d4", "#9c9689", "#5b5b60", "#c4a982", "#f4efe4"], base_dark="#1a1a1d"), 0.12),
    "T04": ("terrazzo", dict(base="#b7c4cc", chips=["#f2f1ee", "#6f8696", "#d0cbbf", "#3f5668", "#e0d4bd"], base_dark="#a6b5bf"), 0.1),
    "X01": ("metal", dict(base="#b6b4af", dark="#6f6e6a"), 0.0),
    "X02": ("metal", dict(base="#9a7a55", dark="#4d3b28", patina=0.55), 0.0),
}


def do_tiles():
    for i, (tid, (kind, params, gloss)) in enumerate(TILES.items()):
        name = f"tile-{tid.lower()}.webp"
        if os.path.exists(os.path.join(OUT, name)):
            continue
        rng = np.random.default_rng(1000 + i * 17)
        S = 2000
        fn = dict(marble=marble, stone=stone, concrete=concrete, wood=wood, terrazzo=terrazzo, metal=metal)[kind]
        arr = fn(S, rng, **params)
        img = finish(arr, rng, gloss=gloss)
        kb = save_webp(img, name, 82)
        sm = img.resize((640, 640), Image.LANCZOS)
        save_webp(sm, f"tile-{tid.lower()}-sm.webp", 78)
        print(f"tile {tid} {kind} {kb}KB")


def do_macro():
    path = os.path.join(OUT, "macro-marble.webp")
    if os.path.exists(path):
        return
    rng = np.random.default_rng(7)
    arr = marble(2800, rng, base="#f1ede5", vein="#8f8b83", vein2="#c9a27a", strength=0.95, freq=2.2, turb=2.2)
    img = finish(arr, rng, gloss=0.08).crop((0, 400, 2800, 2100))
    print("macro", save_webp(img, "macro-marble.webp", 80), "KB")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "photos"):
        do_photos()
        do_hero_mobile()
    if which in ("all", "tiles"):
        do_tiles()
        do_macro()
