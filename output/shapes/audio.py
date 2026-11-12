# Psychology of shapes: playful bed; round sounds for round things, sharp sounds for sharp things
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(6)
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
def boing(at, amp=0.06): n = int(0.45 * SR); x = np.arange(n) / SR; f = 180 + 120 * np.exp(-x * 8) * np.cos(2 * np.pi * 9 * x); add(at, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.005, 5) * amp)
def ting(at, amp=0.05): n = int(0.5 * SR); x = np.arange(n) / SR; add(at, (np.sin(2 * np.pi * 2800 * x) + 0.6 * np.sin(2 * np.pi * 4100 * x) + 0.3 * np.sin(2 * np.pi * 6300 * x)) * env(n, 0.0005, 10) * amp)
def thunk(at, amp=0.4): n = int(0.3 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * 110 * x) * np.exp(-x * 25) * amp)
def pop(at, f=900, amp=0.05): n = int(0.1 * SR); add(at, np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, n)) / SR) * env(n, 0.001, 35) * amp)
S0 = [c['start'] for c in CL]
for i, s_ in enumerate(np.arange(0, D, 0.25)):
    ch = [(60, 64, 67), (57, 60, 64), (65, 69, 72), (67, 71, 74)][int(s_ / 2) % 4]; n = int(0.3 * SR); x = np.arange(n) / SR
    add(s_, np.sin(2 * np.pi * hz([ch[0], ch[2], ch[1], ch[2]][i % 4] + 12) * x) * env(n, 0.002, 18), 0.014)
    if i % 4 == 0: add(s_, np.sin(2 * np.pi * hz(ch[0] - 12) * x) * env(n, 0.002, 10), 0.04)
boing(0.2); thunk(wt(0, 'squares')); ting(wt(0, 'triangles'))
for k in range(4): tone(wt(0, 'brain') + k * 0.05, 0.1, 2000 + k * 300, 0.02, 30)
boing(wt(1, 'bouba') - 0.05, 0.07); ting(wt(1, 'kiki') - 0.05, 0.06)
for k in range(3): pop(wt(1, 'pick') + k * 0.33, 1000, 0.03)
m = int(0.5 * SR); xx = np.linspace(0, 1, m); add(S0[2] - 0.3, ma(rng.normal(0, 1, m), 3) * np.sin(np.pi * xx) ** 2 * 0.12)
for k in range(3): pop(wt(3, 'people', 1) + k * 0.15, 1300, 0.04)
for k in range(10): tone(wt(3, 'sharp') + k * 0.07, 0.04, 3000 + rng.random() * 1500, 0.015, 60)
n = int(0.7 * SR); add(wt(4, 'point'), np.sin(2 * np.pi * np.cumsum(np.linspace(400, 900, n)) / SR) * np.hanning(n) * 0.04)
for k in range(3): tone(wt(4, 'and') + k * 0.35, 0.3, 1200, 0.03, 8)
thunk(wt(4, 'because') + 0.3, 0.5); tone(wt(4, 'eyebrows'), 0.4, 200, 0.04, 6)
thunk(S0[5] + 0.2, 0.5); thunk(wt(5, 'stable'), 0.35); thunk(wt(5, 'predictable'), 0.35)
for k in range(6): pop(wt(5, "that's") + k * 0.08, 800 + k * 100, 0.025)
boing(wt(6, 'did') + 0.2, 0.05); ting(wt(6, 'did') + 0.6, 0.05)
n = int(1.2 * SR); add(wt(6, 'so'), np.sin(2 * np.pi * np.cumsum(np.linspace(300, 1200, n)) / SR) * np.linspace(0, 1, n) * 0.04)
for k, m_ in enumerate([72, 76, 79, 84]): tone(wt(6, 'so') + 1.2 + k * 0.07, 0.5, hz(m_), 0.03, 6)
for k in range(3): pop(S0[7] + 0.2 + k * 0.15, 900 + k * 200, 0.04)
tone(wt(7, 'and'), 0.12, 1400, 0.05, 30); tone(wt(7, 'and') + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
