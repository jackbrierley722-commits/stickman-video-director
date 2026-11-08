# Upbeat explainer bed + techy SFX (zaps, hums, snaps, reveal whoosh); narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(77)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N); mus = np.zeros(N)
def add(at, y, buf=None):
    b = out if buf is None else buf; i = int(at * SR)
    if 0 <= i < N: b[i:i + len(y)] += y[:N - i]
def env(n, d=8): x = np.arange(n) / SR; e = np.exp(-x * d); a = max(1, int(0.003 * SR)); e[:a] *= np.linspace(0, 1, a); return e
def tone(at, dur, f, amp, d=6, sq=False): m = int(dur * SR); x = np.arange(m) / SR; w = np.sign(np.sin(2 * np.pi * f * x)) if sq else np.sin(2 * np.pi * f * x); add(at, amp * w * env(m, d))
bpm = 120; beat = 0.5; nb = int(D / beat) + 1
chords = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]]
for b in range(nb):
    at = b * beat; ch = chords[(b // 8) % 4]
    if b % 2 == 0: x = np.arange(int(0.2 * SR)) / SR; add(at, 0.4 * np.sin(2 * np.pi * (48 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.12 * SR); add(at, 0.12 * ma(rng.normal(0, 1, m), 2) * env(m, 25), mus)
    m = int(0.03 * SR); hn = rng.normal(0, 1, m); add(at + beat / 2, 0.04 * (hn - ma(hn, 3)) * env(m, 80), mus)
    for q in range(2): f = ch[(b * 2 + q) % 3] * 2; m = int(beat / 2 * SR); x = np.arange(m) / SR; add(at + q * beat / 2, 0.03 * np.sign(np.sin(2 * np.pi * f * x)) * env(m, 12), mus)
    m = int(beat * SR); x = np.arange(m) / SR; add(at, 0.08 * np.sin(2 * np.pi * ch[0] / 2 * x) * env(m, 3), mus)
out += mus * np.interp(t, [0, 0.3, D - 1.5, D], [0, 0.8, 0.8, 0])
def ev(ci, w): return wt(ci, w)
# cable plug click, cable vanish poof
tone(ev(0, 'cable'), 0.06, 1800, 0.15, 60); m = int(0.5 * SR); add(ev(0, "don't") + 0.1, 0.12 * ma(rng.normal(0, 1, m), 20) * env(m, 8))
# coil appears: shimmer
for i in range(6): tone(ev(1, 'coil') - 0.2 + i * 0.05, 0.3, 1200 + i * 220, 0.04, 10)
# AC hum from 'back' (clip 2) until reveal end
a0 = ev(2, 'back') - 0.2; hum = (0.03 * np.sin(2 * np.pi * 120 * t) + 0.015 * np.sign(np.sin(2 * np.pi * 240 * t))) * (t > a0) * (t < D - 1); out += hum * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 1.2 * t)))
# field whoosh
m = int(1.2 * SR); x = np.arange(m) / SR; add(ev(2, 'creates'), 0.12 * ma(rng.normal(0, 1, m), 6) * np.sin(np.pi * x / x[-1]))
# induction zaps
for i in range(8): s = ev(4, 'pushes') + i * 0.18; m = int(0.08 * SR); add(s, 0.15 * np.sign(rng.normal(0, 1, m)) * env(m, 40))
tone(ev(4, 'induction'), 0.6, 880, 0.08, 4); tone(ev(4, 'induction') + 0.1, 0.6, 1320, 0.06, 4)
# rectifier: rising beep then steady
for i, f in enumerate([440, 660, 880]): tone(ev(5, 'rectifier') + i * 0.1, 0.2, f, 0.07, 10, True)
# heat sizzle
m = int(1.5 * SR); add(ev(6, 'heat') - 0.2, 0.06 * ma(rng.normal(0, 1, m), 2) * np.hanning(m))
# magnet snap
x = np.arange(int(0.2 * SR)) / SR; add(ev(6, 'magnets') + 0.3, 0.6 * np.sin(2 * np.pi * 300 * x) * np.exp(-x * 40)); m = int(0.05 * SR); add(ev(6, 'magnets') + 0.3, 0.3 * rng.normal(0, 1, m) * env(m, 60))
# reveal: whoosh + chord
m = int(1.0 * SR); x = np.arange(m) / SR; add(ev(7, 'wireless') - 0.6, 0.2 * ma(rng.normal(0, 1, m), 10) * (x / x[-1]) ** 2)
for f in [523, 659, 784, 1047]: tone(ev(7, 'wireless'), 1.5, f, 0.06, 2)
out *= np.interp(t, [0, 0.1, D - 0.7, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
