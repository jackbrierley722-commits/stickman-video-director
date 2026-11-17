# Escape the rings: bounce notes, ring shatters, escape fanfare, plus a low music bed. No narration.
import json, numpy as np, soundfile as sf
SR = 44100; EV = json.load(open('events.json')); D = EV['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(5)
sfx = np.zeros(N); mus = np.zeros(N)
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
def put(buf, at, y, g=1.0):
    i = int(at * SR)
    if 0 <= i < N: buf[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.002, d=6.0): x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def marimba(f, dur=0.6, amp=0.3):
    n = int(dur * SR); x = np.arange(n) / SR
    return amp * (np.sin(2 * np.pi * f * x) * np.exp(-x * 7) + 0.35 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x * 30) + 0.15 * np.sin(2 * np.pi * f * 10 * x) * np.exp(-x * 60)) * env(n, 0.001, 0)
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
PENT = [0, 2, 4, 7, 9]
def pent(k, base=72): return base + 12 * (k // 5) + PENT[k % 5]
# melody walk: up and down the pentatonic scale, a bit higher for outer rings
walk = [0, 1, 2, 3, 4, 5, 4, 3, 2, 3, 4, 5, 6, 5, 4, 2]
bi = 0
for e in EV['ev']:
    if e['type'] == 'bounce':
        k = walk[bi % len(walk)] + (e['ring'] // 4); f = mf(pent(k, 67)); put(sfx, e['t'], marimba(f, 0.55, 0.28)); put(sfx, e['t'], np.sin(2 * np.pi * 90 * np.arange(int(0.05 * SR)) / SR) * env(int(0.05 * SR), 0.001, 70) * 0.25); bi += 1
    else:
        n = int(0.7 * SR); x = np.arange(n) / SR; nz = rng.normal(0, 1, n); hi = nz - ma(nz, 6)
        glass = hi * np.exp(-x * 9) * 0.35;
        for _ in range(9): fq = 2500 + rng.random() * 5000; glass += np.sin(2 * np.pi * fq * x + rng.random() * 6) * np.exp(-x * (12 + rng.random() * 20)) * 0.05
        put(sfx, e['t'], glass); put(sfx, e['t'], np.sin(2 * np.pi * 60 * x[:int(0.3 * SR)]) * np.exp(-x[:int(0.3 * SR)] * 14) * 0.5)
        for j, st in enumerate([0, 4, 7]): put(sfx, e['t'] + 0.04 + j * 0.05, marimba(mf(pent(e['ring'], 79) + st), 0.8, 0.12))
# last-ring tension: a low pulse that speeds up
br = [e['t'] for e in EV['ev'] if e['type'] == 'break']
if len(br) >= 2:
    a, b = br[-2], br[-1]; tt = a + 0.5
    while tt < b:
        put(sfx, tt, np.sin(2 * np.pi * 50 * np.arange(int(0.25 * SR)) / SR) * env(int(0.25 * SR), 0.003, 16) * 0.35); tt += max(0.25, 0.75 - 0.5 * (tt - a) / (b - a))
# escape fanfare
dn = EV['done']
for j, st in enumerate([0, 4, 7, 12, 16]): put(sfx, dn + j * 0.07, marimba(mf(72 + st), 1.6, 0.18))
n = int(1.2 * SR); x = np.arange(n) / SR; w = rng.normal(0, 1, n); put(sfx, dn, (ma(w, 4) - ma(w, 40)) * np.sin(np.pi * x / 1.2) ** 2 * 0.25)
# ---------- low music bed: soft pad + gentle beat, original ----------
BPM = 96; beat = 60 / BPM; chords = [(57, [60, 64, 69]), (53, [60, 65, 69]), (48, [55, 60, 64]), (55, [59, 62, 67])]  # Am F C G
bar = 0; t0 = 0.0
while t0 < D:
    root, ch = chords[bar % 4]; n = int(4 * beat * SR); x = np.arange(n) / SR; pad = np.zeros(n)
    for m in ch: pad += np.sin(2 * np.pi * mf(m) * x) + 0.3 * np.sin(2 * np.pi * mf(m) * 2.003 * x)
    pad *= np.minimum(1, x / 0.6) * np.minimum(1, (4 * beat - x) / 0.6) * 0.12; put(mus, t0, pad); put(mus, t0, np.sin(2 * np.pi * mf(root - 12) * x) * np.minimum(1, x / 0.1) * np.exp(-x * 0.8) * 0.4)
    for b in range(4):
        k = int(0.18 * SR); xx = np.arange(k) / SR; put(mus, t0 + b * beat, np.sin(2 * np.pi * 52 * xx * (1 - 0.4 * xx)) * np.exp(-xx * 22) * 0.6)
        if b % 2: h = rng.normal(0, 1, int(0.04 * SR)); put(mus, t0 + b * beat + beat / 2, (h - ma(h, 4)) * env(len(h), 0.001, 90) * 0.12)
    bar += 1; t0 += 4 * beat
mus *= np.interp(t, [0, 1.0, D - 2.0, D], [0, 1, 1, 0])
pk = lambda y: np.percentile(np.abs(y), 99.9)
mus *= 0.2 * pk(sfx) / max(pk(mus), 1e-9)  # music sits ~14 dB under the bounce sounds
mix = np.tanh((sfx + mus) * 1.6 / max(pk(sfx), 1e-9) * 0.55) * 0.9
mix *= np.interp(t, [0, 0.02, D - 0.05, D], [0, 1, 1, 0])
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
