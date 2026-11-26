# Builds every texture for the Preston -> Cardiff flight from the two user-supplied aerials (plus a drawn UK map).
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
rng = np.random.default_rng(3)
def fbm(w, h, seed, oct=(4, 8, 16, 32, 64, 128)):
    r = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for g in oct:
        n = (r.random((max(2, g * h // w), g)) * 255).astype(np.uint8); acc += np.asarray(Image.fromarray(n).resize((w, h), Image.BICUBIC), np.float32) / 255 * amp; tot += amp; amp *= 0.55
    return acc / tot
def circle_mask(size, cx, cy, r, feather):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255); return m.filter(ImageFilter.GaussianBlur(feather))
# 1) pull the baked-in minimaps out as overlays, patch the holes in the ground images
MM = {'deepdale': (133, 1520, 112), 'cardiff': (143, 1455, 126)}
for name, (cx, cy, r) in MM.items():
    im = Image.open(name + '.png').convert('RGB'); W_, H_ = im.size
    mm = im.crop((cx - r - 4, cy - r - 30, cx + r + 4, cy + r + 4)).convert('RGBA'); mk = Image.new('L', mm.size, 0); d = ImageDraw.Draw(mk); d.ellipse((4, 30, 4 + 2 * r, 30 + 2 * r), fill=255); d.ellipse((r + 4 - 22, 30 - 26, r + 4 + 22, 30 + 18), fill=255); mm.putalpha(mk.filter(ImageFilter.GaussianBlur(1.2))); mm.save(name + '_mm.png')
    patch = im.crop((cx - r - 40 + 300, cy - r - 60, cx + r + 40 + 300, cy + r + 40)); clean = im.copy(); m = circle_mask(patch.size, r + 40, r + 60, r + 22, 10); clean.paste(patch, (cx - r - 40, cy - r - 60), m); clean.save(name + '_clean.png')
# 2) street mosaics (3.2 km square) built from each image's own houses, rotated/flipped so it reads as more town
def mosaic(name, stad_box, seed, size=2048, km=3.2, mpp=0.34):
    src = Image.open(name + '_clean.png').convert('RGB'); W_, H_ = src.size; r = np.random.default_rng(seed); out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    TS = 420; tile_m = TS * mpp; tpx = int(size * tile_m / (km * 1000)) + 2; n = size // (tpx - 6) + 2
    for gy in range(n):
        for gx in range(n):
            if r.random() < 0.5: x0, y0 = int(r.integers(0, W_ - TS)), int(r.integers(0, max(1, stad_box[1] - TS)))
            else: x0, y0 = int(r.integers(0, W_ - TS)), int(r.integers(stad_box[3], H_ - TS))
            t = src.crop((x0, y0, x0 + TS, y0 + TS)).rotate(90 * int(r.integers(0, 4))); t = t.transpose(Image.FLIP_LEFT_RIGHT) if r.random() < 0.5 else t
            t = t.resize((tpx, tpx), Image.BILINEAR); a = Image.new('L', (tpx, tpx), 255).filter(ImageFilter.GaussianBlur(0)); out.paste(t.convert('RGBA'), (gx * (tpx - 6) - 3, gy * (tpx - 6) - 3))
    arr = np.asarray(out, np.float32); arr[..., :3] = np.clip(arr[..., :3] * 1.12 + 6, 0, 255); yy, xx = np.mgrid[0:size, 0:size]; d = np.hypot(xx - size / 2, yy - size / 2) / (size / 2); arr[..., 3] = 255 * np.clip((1 - d) * 3, 0, 1)
    Image.fromarray(arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).save(name + '_city.png')
mosaic('deepdale', (250, 540, 700, 1080), 1); mosaic('cardiff', (240, 560, 700, 1030), 2)
# 3) the wider region (40 km): fields, town sprawl, roads; Cardiff gets the Bristol Channel to the south
def region(name, seed, sea_south=False, size=2048):
    r = np.random.default_rng(seed); img = Image.new('RGB', (size, size), '#5a7a3a'); d = ImageDraw.Draw(img); cols = ['#5a7a3a', '#6a8a42', '#7a8a4a', '#4a6a32', '#8a8a5a', '#6a7a3a', '#5a6a30']
    for _ in range(4200):
        x, y, w, h = r.integers(0, size), r.integers(0, size), r.integers(14, 60), r.integers(14, 60); d.rectangle((x, y, x + w, y + h), fill=cols[r.integers(0, len(cols))])
    arr = np.asarray(img, np.float32); n = fbm(size, size, seed + 5); yy, xx = np.mgrid[0:size, 0:size]; dist = np.hypot(xx - size / 2, yy - size / 2) / size
    urban = np.clip((0.2 - dist + (n - 0.5) * 0.18) * 9, 0, 1)[..., None]; speck = fbm(size, size, seed + 9, (64, 128, 256, 512))[..., None]
    ct = Image.open(name + '_city.png').convert('RGB').resize((164, 164), Image.BILINEAR); tile = Image.new('RGB', (size, size)); [tile.paste(ct.rotate(90 * ((i + j) % 4)), (i * 164, j * 164)) for i in range(size // 164 + 1) for j in range(size // 164 + 1)]
    town = np.asarray(tile, np.float32); arr = arr * (1 - urban) + town * urban
    for blob in range(40):  # villages
        cx, cy, rr = r.integers(0, size), r.integers(0, size), r.integers(8, 26); m = (xx - cx) ** 2 + (yy - cy) ** 2 < rr ** 2; arr[m] = arr[m] * 0.3 + np.array([120, 110, 100]) * 0.7
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    if sea_south:
        sea = np.asarray(img, np.float32); coast = size * 0.62 + (fbm(size, 1, seed + 11, (4, 8, 16))[0] - 0.5) * 900; m = yy > coast[None, :].repeat(size, 0) if False else yy > coast[xx]
        sea[m] = np.array([42, 72, 98]); img = Image.fromarray(sea.astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(1.0)).convert('RGBA'); a = np.asarray(img).copy(); dd = np.hypot(xx - size / 2, yy - size / 2) / (size / 2); a[..., 3] = (255 * np.clip((1 - dd) * 2.5, 0, 1)).astype(np.uint8); Image.fromarray(a).save(name + '_region.png')
region('deepdale', 21); region('cardiff', 22, sea_south=True)
# 4) a drawn UK & Ireland map (simplified coastline), painted like a satellite view
LON0, LAT0, KX, KY = -2.688, 53.772, 65.2, 111.0
GB = [(-5.70,50.06),(-5.2,49.96),(-4.20,50.35),(-3.64,50.22),(-3.40,50.62),(-2.45,50.55),(-1.95,50.70),(-1.30,50.78),(-0.80,50.73),(-0.10,50.80),(0.25,50.73),(0.97,50.92),(1.40,51.15),(1.44,51.38),(0.70,51.45),(0.50,51.52),(0.90,51.60),(1.27,51.85),(1.75,52.47),(1.73,52.70),(1.30,52.95),(0.50,52.97),(0.20,52.80),(0.35,53.10),(0.15,53.45),(0.13,53.60),(-0.08,54.12),(-0.40,54.28),(-0.61,54.49),(-1.20,54.62),(-1.38,54.90),(-1.45,55.05),(-1.60,55.60),(-2.00,55.80),(-2.50,56.00),(-3.00,55.98),(-3.70,56.03),(-2.90,56.15),(-2.60,56.30),(-2.80,56.45),(-2.50,56.55),(-2.10,57.15),(-1.80,57.50),(-2.00,57.68),(-3.10,57.70),(-4.10,57.55),(-4.10,57.85),(-3.40,58.30),(-3.05,58.64),(-3.60,58.62),(-5.00,58.62),(-5.15,58.30),(-5.40,57.90),(-5.70,57.55),(-5.70,57.20),(-6.20,56.70),(-5.60,56.40),(-5.70,55.80),(-5.60,55.30),(-4.90,55.70),(-4.65,55.40),(-5.00,55.00),(-4.86,54.64),(-4.40,54.80),(-3.60,54.95),(-3.40,54.70),(-3.60,54.40),(-3.20,54.10),(-2.90,54.00),(-3.05,53.82),(-3.00,53.60),(-3.10,53.40),(-3.30,53.35),(-3.83,53.33),(-4.60,53.40),(-4.70,53.20),(-4.50,52.90),(-4.20,52.75),(-4.05,52.40),(-4.65,52.12),(-5.30,51.88),(-5.10,51.70),(-4.70,51.65),(-4.20,51.55),(-3.90,51.60),(-3.60,51.45),(-3.18,51.43),(-2.90,51.55),(-2.60,51.62),(-2.95,51.38),(-3.30,51.20),(-4.20,51.20),(-4.55,50.95),(-4.75,50.55),(-5.50,50.20)]
IE = [(-6.30,52.20),(-6.10,53.35),(-6.20,54.00),(-5.50,54.30),(-5.70,54.75),(-6.20,55.25),(-7.30,55.35),(-8.30,55.20),(-8.60,54.60),(-10.00,54.20),(-9.90,53.40),(-9.00,53.20),(-9.90,52.60),(-10.40,52.10),(-9.80,51.50),(-8.40,51.60),(-7.00,52.10)]
CITIES = {'London': (-0.12, 51.5, 14), 'Birmingham': (-1.9, 52.48, 8), 'Manchester': (-2.24, 53.48, 9), 'Liverpool': (-2.98, 53.41, 6), 'Leeds': (-1.55, 53.8, 6), 'Glasgow': (-4.25, 55.86, 7), 'Edinburgh': (-3.19, 55.95, 5), 'Bristol': (-2.59, 51.45, 6), 'Cardiff': (-3.18, 51.48, 5), 'Preston': (-2.70, 53.76, 4), 'Newcastle': (-1.6, 54.97, 6), 'Sheffield': (-1.47, 53.38, 6), 'Belfast': (-5.93, 54.6, 5), 'Dublin': (-6.26, 53.35, 7), 'Swansea': (-3.94, 51.62, 4)}
X0K, X1K, Z0K, Z1K = (-11.0 - LON0) * KX, (2.6 - LON0) * KX, -(59.5 - LAT0) * KY, -(49.6 - LAT0) * KY  # map extent in km (x east, z south)
S = 4096
def tex(lon, lat): return ((lon - LON0) * KX - X0K) / (X1K - X0K) * S, (-(lat - LAT0) * KY - Z0K) / (Z1K - Z0K) * S
land = Image.new('L', (S, S), 0); dl = ImageDraw.Draw(land); dl.polygon([tex(*p) for p in GB], fill=255); dl.polygon([tex(*p) for p in IE], fill=255)
for (lo, la, rr) in [(-4.5, 54.25, 0.17), (-1.3, 50.68, 0.12)]: x, y = tex(lo, la); rp = rr * KY / (Z1K - Z0K) * S; dl.ellipse((x - rp * 1.3, y - rp, x + rp * 1.3, y + rp), fill=255)  # Isle of Man, Isle of Wight
L = np.asarray(land.filter(ImageFilter.GaussianBlur(2)), np.float32)[..., None] / 255
n1 = fbm(S, S, 41)[..., None]; n2 = fbm(S, S, 42, (32, 64, 128, 256, 512))[..., None]; yy, xx = np.mgrid[0:S, 0:S]
high = np.clip((n1 - 0.52) * 5, 0, 1); north = np.clip((S * 0.42 - yy) / (S * 0.3), 0, 1)[..., None]
green = np.concatenate([70 + 40 * n2, 100 + 40 * n2, 50 + 25 * n2], 2); brown = np.concatenate([110 + 30 * n2, 105 + 25 * n2, 75 + 20 * n2], 2)
landc = green * (1 - high * (0.4 + 0.5 * north)) + brown * high * (0.4 + 0.5 * north)
shelf = np.asarray(land.filter(ImageFilter.GaussianBlur(40)), np.float32)[..., None] / 255
seac = np.concatenate([18 + 30 * shelf, 48 + 45 * shelf, 78 + 45 * shelf], 2) + (n2 - 0.5) * 8
img = landc * L + seac * (1 - L)
for name, (lo, la, rr) in CITIES.items():
    x, y = tex(lo, la); rp = rr / (Z1K - Z0K) * S; m = ((xx - x) ** 2 + (yy - y) ** 2 < (rp * (0.8 + 0.4 * n1[..., 0])) ** 2)
    img[m] = img[m] * 0.35 + np.array([128, 122, 116]) * 0.65
Image.fromarray(img.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)).save('uk.png')
import json; json.dump({'X0': X0K, 'X1': X1K, 'Z0': Z0K, 'Z1': Z1K, 'GB': [[(lo - LON0) * KX, -(la - LAT0) * KY] for lo, la in GB], 'IE': [[(lo - LON0) * KX, -(la - LAT0) * KY] for lo, la in IE],
           'cities': {k: [(v[0] - LON0) * KX, -(v[1] - LAT0) * KY] for k, v in CITIES.items()}}, open('geo.json', 'w'))
# 5) cloud puffs
for k in range(4):
    n = fbm(512, 512, 70 + k, (4, 8, 16, 32, 64)); yy, xx = np.mgrid[0:512, 0:512]; d = np.hypot(xx - 256, yy - 256) / 256
    a = np.clip((n - 0.35 - d * 0.55) * 5, 0, 1); sh = 200 + 55 * np.clip((n - 0.3) * 3, 0, 1)
    Image.fromarray(np.dstack([sh, sh, np.minimum(255, sh + 6), a * 255]).astype(np.uint8), 'RGBA').filter(ImageFilter.GaussianBlur(2)).save(f'cloud{k}.png')
print('prep ok')
