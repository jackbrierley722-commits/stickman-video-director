# Deepdale -> clouds -> Cardiff: aerial zoom-out, fly through cloud layers, zoom back in. 720x1280 @30fps, frames piped to ffmpeg.
import subprocess, numpy as np
from PIL import Image, ImageFilter
W, H, FPS, DUR = 720, 1280, 30, 9.0
A = Image.open('deepdale.png').convert('RGB'); B = Image.open('cardiff.png').convert('RGB')
CA, CB = (470, 820), (465, 790)  # stadium centres in each image
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def prog(t, a, b): return min(1, max(0, (t - a) / (b - a)))
def lerp(a, b, k): return a + (b - a) * k
def bg_of(img): return img.resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(18))
BGA, BGB = bg_of(A), bg_of(B)
def view(img, bg, centre, z):
    """z = 1 fits the whole image to the frame; z > 1 zooms toward the stadium; z < 1 shows it smaller over a blurred surround."""
    iw, ih = img.size; base = W / iw; s = base * z; k = ease(prog(z, 1.0, 2.2))
    cx = lerp(iw / 2, centre[0], k); cy = lerp(ih / 2, centre[1], k)
    if z >= 1:
        cw, ch = min(W / s, iw), min(H / s, ih); x0 = max(0, min(cx - cw / 2, iw - cw)); y0 = max(0, min(cy - ch / 2, ih - ch))
        return img.resize((W, H), Image.BICUBIC, box=(x0, y0, x0 + cw, y0 + ch))
    frame = bg.copy(); sw, sh = int(iw * s), int(ih * s); small = img.resize((sw, sh), Image.BICUBIC)
    f = int(0.07 * sw); m = Image.new('L', (sw, sh), 0); m.paste(255, (f, f, sw - f, sh - f)); m = m.filter(ImageFilter.GaussianBlur(f * 0.6))
    frame.paste(small, ((W - sw) // 2, (H - sh) // 2), m); return frame
# procedural clouds (fbm noise, two layers)
rng = np.random.default_rng(7)
def fbm(w, h, seed):
    r = np.random.default_rng(seed); acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for g in (4, 8, 16, 32, 64):
        n = (r.random((max(2, g * h // w), g)) * 255).astype(np.uint8); up = np.asarray(Image.fromarray(n).resize((w, h), Image.BICUBIC), np.float32) / 255
        acc += up * amp; tot += amp; amp *= 0.55
    return acc / tot
def cloud_tex(seed, thr):
    n = fbm(W * 2, H * 2, seed); a = np.clip((n - thr) * 6.0, 0, 1); shade = 185 + 70 * np.clip((n - thr) * 3.5, 0, 1)
    rgba = np.dstack([shade, shade, np.minimum(255, shade + 6), a * 255]).astype(np.uint8); return Image.fromarray(rgba, 'RGBA').filter(ImageFilter.GaussianBlur(3))
C1, C2 = cloud_tex(11, 0.40), cloud_tex(23, 0.44)
def cloud_layer(tex, scale, dx, dy):
    tw, th = tex.size; cw, ch = W / scale, H / scale; x0 = (tw - cw) / 2 + dx; y0 = (th - ch) / 2 + dy
    return tex.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', 'mix.wav',
                       '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-shortest', 'stadium-fly.mp4'], stdin=subprocess.PIPE)
N = int(DUR * FPS)
for f in range(N):
    t = f / FPS
    if t < 4.2:  # zoom out of Deepdale (exponential feel)
        k = ease(prog(t, 0.4, 3.6)); z = 2.4 ** (1 - k) * 0.72 ** k; fr = view(A, BGA, CA, z)
    else:        # drop into Cardiff and zoom in
        k = ease(prog(t, 4.6, 8.3)); z = 0.72 ** (1 - k) * 2.4 ** k; fr = view(B, BGB, CB, z)
    fr = fr.convert('RGBA')
    # haze as you climb / descend
    haze = max(prog(t, 2.6, 3.9) if t < 4.2 else 1 - prog(t, 4.4, 5.4), 0)
    if haze > 0: fr = Image.blend(fr, Image.new('RGBA', (W, H), (214, 226, 240, 255)), 0.35 * haze)
    # cloud layers rush toward the camera while you pass through them
    c = max(prog(t, 2.2, 3.4) if t < 4.2 else 1 - prog(t, 4.6, 5.8), 0)
    if c > 0:
        p = prog(t, 2.6, 5.4)
        for tex, sp, dx, op in ((C1, 1.0, 120, 1.0), (C2, 1.7, -160, 0.9)):
            lay = cloud_layer(tex, 1.0 + 2.6 * p * sp, dx * p, -80 * p); a = np.asarray(lay, np.float32); a[..., 3] *= c * op; fr = Image.alpha_composite(fr, Image.fromarray(a.astype(np.uint8), 'RGBA'))
        if 3.85 < t < 4.6: fr = Image.blend(fr, Image.new('RGBA', (W, H), (236, 240, 246, 255)), 0.75 * (1 - abs(t - 4.2) / 0.4))  # white-out in the thick of it
    ff.stdin.write(fr.convert('RGB').tobytes())
ff.stdin.close(); ff.wait(); print('done', N)
