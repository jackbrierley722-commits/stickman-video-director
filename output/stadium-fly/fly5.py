# 5-second version: Deepdale -> straight up into the clouds -> down onto Cardiff. Fixed minimap overlay. 720x1280 @30fps.
import subprocess, numpy as np
from PIL import Image, ImageFilter, ImageOps
W, H, FPS, DUR = 720, 1280, 30, 5.0
SRC = '../uk-fly/'
A = Image.open(SRC + 'deepdale_clean.png').convert('RGB'); B = Image.open(SRC + 'cardiff_clean.png').convert('RGB')
MMA = Image.open(SRC + 'deepdale_mm.png'); MMB = Image.open(SRC + 'cardiff_mm.png'); SC = W / 941
CA, CB = (470, 820), (465, 790)
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def prog(t, a, b): return min(1, max(0, (t - a) / (b - a)))
def lerp(a, b, k): return a + (b - a) * k
def surround(img):
    """3x3 mirrored copy of the image, blurred, so zooming out never shows a hard edge or made-up streets."""
    iw, ih = img.size; fx, fy, fxy = ImageOps.mirror(img), ImageOps.flip(img), ImageOps.flip(ImageOps.mirror(img)); big = Image.new('RGB', (iw * 3, ih * 3))
    for j in range(3):
        for i in range(3): big.paste([[fxy, fy, fxy], [fx, img, fx], [fxy, fy, fxy]][j][i], (i * iw, j * ih))
    return big.filter(ImageFilter.GaussianBlur(10))
SA, SB = surround(A), surround(B)
def view(img, sur, centre, z):
    iw, ih = img.size; base = W / iw; s = base * z
    if z >= 1:
        k = ease(prog(z, 1.0, 2.0)); cx = lerp(iw / 2, centre[0], k); cy = lerp(ih / 2, centre[1], k); cw, ch = min(W / s, iw), min(H / s, ih)
        x0 = max(0, min(cx - cw / 2, iw - cw)); y0 = max(0, min(cy - ch / 2, ih - ch)); return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    cw, ch = W / s, H / s; x0 = iw * 1.5 - cw / 2; y0 = ih * 1.5 - ch / 2; fr = sur.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    sw, sh = int(iw * s), int(ih * s); small = img.resize((sw, sh), Image.BICUBIC); f = max(2, int(0.08 * sw)); m = Image.new('L', (sw, sh), 0); m.paste(255, (f, f, sw - f, sh - f)); m = m.filter(ImageFilter.GaussianBlur(f * 0.6))
    fr.paste(small, ((W - sw) // 2, (H - sh) // 2), m); return fr
def fbm(w, h, seed):
    r = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for g in (4, 8, 16, 32, 64):
        n = (r.random((max(2, g * h // w), g)) * 255).astype(np.uint8); acc += np.asarray(Image.fromarray(n).resize((w, h), Image.BICUBIC), np.float32) / 255 * amp; tot += amp; amp *= 0.55
    return acc / tot
def cloud_tex(seed, thr):
    n = fbm(W * 2, H * 2, seed); a = np.clip((n - thr) * 6.0, 0, 1); sh = 190 + 65 * np.clip((n - thr) * 3.5, 0, 1)
    return Image.fromarray(np.dstack([sh, sh, np.minimum(255, sh + 6), a * 255]).astype(np.uint8), 'RGBA').filter(ImageFilter.GaussianBlur(3))
C1, C2, C3 = cloud_tex(11, 0.38), cloud_tex(23, 0.42), cloud_tex(37, 0.40)
def layer(tex, scale, dx, dy):
    tw, th = tex.size; cw, ch = W / scale, H / scale; x0 = (tw - cw) / 2 + dx; y0 = (th - ch) / 2 + dy; return tex.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', 'mix5.wav',
                       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-shortest', 'stadium-fly-5s.mp4'], stdin=subprocess.PIPE)
for f in range(int(DUR * FPS)):
    t = f / FPS
    if t < 2.5: k = ease(prog(t, 0.25, 2.2)); z = 1.0 ** (1 - k) * 0.6 ** k; fr = view(A, SA, CA, z)
    else: k = ease(prog(t, 2.6, 4.75)); z = 0.6 ** (1 - k) * 1.0 ** k; fr = view(B, SB, CB, z)
    fr = fr.convert('RGBA')
    haze = prog(t, 0.6, 2.0) if t < 2.5 else 1 - prog(t, 2.8, 4.2)
    if haze > 0: fr = Image.blend(fr, Image.new('RGBA', (W, H), (214, 226, 240, 255)), 0.45 * haze)
    c = prog(t, 0.5, 1.7) if t < 2.5 else 1 - prog(t, 3.0, 4.4)  # cloud cover: rushes in, thickest at the midpoint, parts over Cardiff
    if c > 0:
        p = prog(t, 0.5, 4.4)
        for tex, sp, dx, op in ((C1, 1.0, 140, 1.0), (C2, 1.8, -170, 0.95), (C3, 2.8, 60, 0.9)):
            lay = np.asarray(layer(tex, 1.0 + 3.0 * p * sp, dx * p, -90 * p), np.float32); lay[..., 3] *= c * op; fr = Image.alpha_composite(fr, Image.fromarray(lay.astype(np.uint8), 'RGBA'))
        wo = max(0, 1 - abs(t - 2.5) / 0.55)
        if wo > 0: fr = Image.blend(fr, Image.new('RGBA', (W, H), (238, 242, 247, 255)), 0.85 * wo)
    # fixed minimap: Deepdale's, crossfading to Cardiff's in the white-out
    mk = ease(prog(t, 2.2, 2.8)); ax, ay = (133 - 112 - 4) * SC, (1520 - 112 - 30) * SC; bx, by = (143 - 126 - 4) * SC, (1455 - 126 - 30) * SC
    for img_, x_, y_, a_ in ((MMA, ax, ay, 1 - mk), (MMB, bx, by, mk)):
        if a_ <= 0: continue
        m = img_.resize((int(img_.width * SC), int(img_.height * SC)), Image.BICUBIC); al = np.asarray(m, np.float32); al[..., 3] *= a_; fr.alpha_composite(Image.fromarray(al.astype(np.uint8), 'RGBA'), (int(x_), int(y_)))
    ff.stdin.write(fr.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done')
