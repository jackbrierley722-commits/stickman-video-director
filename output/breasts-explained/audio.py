# Body facts explainer: light marimba bed, SFX on actions only
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(12)
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
def mar(at, m, amp): n = int(0.6 * SR); x = np.arange(n) / SR; f = hz(m); add(at, (np.sin(2 * np.pi * f * x) + 0.25 * np.sin(2 * np.pi * 4 * f * x)) * env(n, 0.002, 9) * amp)
def pop(at, f=900, amp=0.05): n = int(0.1 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, n)) / SR) * env(n, 0.001, 35) * amp)
def thump(at, amp=0.5, f=60, d=20): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def whoosh(at, amp=0.04): m = int(0.5 * SR); x = np.linspace(0, 1, m); add(at - 0.3, ma(rng.normal(0, 1, m), 3) * np.sin(np.pi * x) ** 2 * amp * 3)
E = dict(muscle=wt(0, 'muscle'), no=wt(0, 'no'), chest=wt(1, 'chest'), fat=wt(1, 'fat'), glands=wt(2, 'glands'), grapes=wt(2, 'grapes'), lobules=wt(2, 'lobules'), job=wt(2, 'job'), milk=CL[3]['start'], baby=wt(3, 'baby'), fill=wt(3, 'fill'), ducts=wt(3, 'ducts'), nipple=wt(3, 'nipple'),
         like=CL[4]['start'], boys=wt(5, 'boys'), girls=wt(5, 'girls'), puberty=wt(5, 'puberty'), eight=wt(5, 'eight'), estrogen=wt(5, 'estrogen'), coopers=wt(6, "cooper's"), stretch=wt(6, 'stretch'), pair=CL[7]['start'], one7=wt(7, 'one'), normal=wt(7, 'normal'),
         look=wt(8, 'look'), feel=wt(8, 'feel'), changes=wt(8, 'changes'), checked=wt(8, 'checked'), follow=wt(8, 'follow'))
# marimba bed: C - Am - F - G, 8th notes at 100 bpm
bpm = 100; beat = 60 / bpm; prog = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]
for i, s_ in enumerate(np.arange(0, D, beat / 2)):
    ch = prog[int(s_ / (beat * 4)) % 4]; mar(s_, [ch[0], ch[2], ch[1], ch[2] + 12][i % 4] + 12, 0.016)
    if i % 2 == 0: mar(s_, ch[0] - 12, 0.025)
# SFX on actions
pop(E['muscle'] - 0.15, 700); thump(E['no'], 0.6, 70, 14); tone(E['no'], 0.25, 220, 0.04, 8)
pop(E['chest'] - 0.1); pop(E['fat'] - 0.1, 1100)
for k in range(6): pop(E['glands'] - 0.3 + k * 0.12, 1200 + k * 80, 0.03)
whoosh(E['grapes'], 0.04); pop(E['lobules'] - 0.1, 1300); tone(E['job'], 0.4, 880, 0.04, 6)
n = int(0.3 * SR); x = np.arange(n) / SR; add(E['milk'] + 0.1, np.sin(2 * np.pi * np.cumsum(np.linspace(1400, 500, n)) / SR) * env(n, 0.002, 12) * 0.06)  # drip
for k, m in enumerate([72, 76, 79]): tone(E['baby'] + k * 0.09, 0.4, hz(m), 0.03, 6)
for k in range(8): tone(E['ducts'] + 0.2 + k * 0.1, 0.06, 1800 + k * 60, 0.015, 40)
pop(E['nipple'] - 0.1, 1000)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
for w in ('boys', 'girls'): tone(E[w], 0.3, 1320, 0.04, 8)
for k in range(6): tone(E['eight'] - 0.2 + k * 0.15, 0.05, 1500, 0.03, 60)
tone(E['estrogen'] - 0.1, 0.5, 660, 0.03, 4); tone(E['estrogen'], 0.5, 990, 0.03, 4)
pop(E['coopers'] - 0.1, 900); n = int(1.2 * SR); x = np.arange(n) / SR; add(E['stretch'], np.sin(2 * np.pi * np.cumsum(np.linspace(500, 300, n)) / SR) * np.hanning(n) * 0.02)
for k in range(5): pop(E['pair'] + k * 0.15, 700 + k * 120, 0.03)
for k, m in enumerate([72, 76, 79, 84]): tone(E['normal'] + k * 0.07, 0.5, hz(m), 0.035, 5)
for w in ('look', 'feel', 'changes', 'checked'): pop(E[w] - 0.2, 1000, 0.04)
tone(E['follow'], 0.12, 1400, 0.06, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.04, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
