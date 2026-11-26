# Shower how-to (short): bouncy bed, SFX on actions
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(5)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def pop(at, f=900, amp=0.05): n = int(0.1 * SR); add(at, np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, n)) / SR) * env(n, 0.001, 35) * amp)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
S = [CL[i]['start'] for i in range(8)]
# bouncy bed: pizzicato-ish bass + plucks, 120 bpm
beat = 0.5; prog = [(60, 64, 67), (65, 69, 72), (62, 65, 69), (67, 71, 74)]
for i, s_ in enumerate(np.arange(0, D, beat / 2)):
    ch = prog[int(s_ / 2) % 4]; n = int(0.25 * SR); x = np.arange(n) / SR
    if i % 2 == 0: add(s_, np.sin(2 * np.pi * hz(ch[0] - 24) * x) * env(n, 0.002, 14), 0.06)
    add(s_, (np.sin(2 * np.pi * hz([ch[0], ch[2], ch[1], ch[2]][i % 4] + 12) * x)) * env(n, 0.002, 20), 0.02)
# flies buzzing on the hook (and the loop)
bz = np.sin(2 * np.pi * (220 + 30 * np.sin(2 * np.pi * 7 * t)) * t) * (np.sin(2 * np.pi * 0.9 * t) * 0.5 + 0.5)
out += bz * 0.012 * (t < S[1]) + bz * 0.012 * (t > D - 0.4)
pop(wt(0, 'send') - 0.1, 800, 0.05)
# shower water running while it's on
wat = (nz(D) - nz(D, 6)) * 0.035; on = ((t > S[1] + 0.6) & (t < S[4])) | ((t > S[5]) & (t < wt(5, 'dry')))
out += wat * on
tone(wt(1, 'warm'), 0.3, 660, 0.04, 8); n = int(0.4 * SR); add(wt(1, 'not'), np.sin(2 * np.pi * np.cumsum(np.linspace(400, 1400, n)) / SR) * env(n, 0.002, 6) * 0.04); tone(wt(1, 'lava') + 0.1, 0.3, 200, 0.05, 8)
n = int(0.25 * SR); add(wt(3, 'coin') - 0.2, nz(0.25, 3) * env(n, 0.01, 10) * 0.08)  # squeeze
for k in range(10): add(wt(3, 'scrub') + k * 0.1, (nz(0.08) - nz(0.08, 4)) * env(int(0.08 * SR), 0.005, 30) * 0.05)  # scrubbing
for k in range(8): tone(wt(3, 'scrub') + rng.random() * 1.2, 0.08, 2500 + rng.random() * 1500, 0.015, 40)  # foam pops
for w in ('armpits', 'neck', 'ears', 'feet'): tone(wt(4, w) - 0.1, 0.25, 1320, 0.04, 10)
out += bz * 0.012 * ((t > wt(4, 'and')) & (t < S[5]))
for k in range(8): add(wt(5, 'dry') + k * 0.12, nz(0.1, 3) * env(int(0.1 * SR), 0.01, 20) * 0.05)  # towel rub
n = int(0.9 * SR); add(wt(6, 'deodorant') + 0.1, (nz(0.9) - nz(0.9, 3)) * np.hanning(n) * 0.06)  # spray
tone(wt(6, 'clean'), 0.3, 1320, 0.04, 8)
for k, m in enumerate([84, 88, 91]): tone(wt(7, 'clean') + k * 0.07, 0.4, hz(m), 0.03, 6)  # sparkle
for k in range(3): pop(wt(7, 'every') + k * 0.12, 1000 + k * 150, 0.03)
tone(wt(7, 'like'), 0.12, 1400, 0.06, 30); tone(wt(7, 'like') + 0.06, 0.12, 2100, 0.04, 30)
n = int(0.35 * SR); add(wt(7, 'them'), np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1800, n)) / SR) * env(n, 0.002, 8) * 0.05)  # send whoosh
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
