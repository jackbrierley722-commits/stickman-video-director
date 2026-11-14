# Stop gooning: lo-fi bed, SFX on actions
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(11)
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
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=60, d=20): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def pop(at, f=900, amp=0.05): n = int(0.1 * SR); add(at, np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.8, n)) / SR) * env(n, 0.001, 35) * amp)
S0 = [c['start'] for c in CL]
# lo-fi bed: soft keys + kick + hat, brightens once he goes outside
prog = [(57, 60, 64), (53, 57, 60), (55, 59, 62), (52, 55, 59)]
for i, s_ in enumerate(np.arange(0, D, 0.5)):
    ch = prog[int(s_ / 2) % 4]; n = int(0.9 * SR); x = np.arange(n) / SR; add(s_, sum(np.sin(2 * np.pi * hz(m + 12) * x) for m in ch) * env(n, 0.01, 3), 0.009)
    thump(s_, 0.12 if i % 2 == 0 else 0.0, 55, 18); add(s_ + 0.25, nz(0.03) * env(int(0.03 * SR), 0.001, 90) * 0.03)
# hook: monitor hum + mouse clicks
out += np.sin(2 * np.pi * 60 * t) * 0.006 * (t < S0[1])
for k in range(8): add(0.3 + k * 0.33 + rng.random() * 0.1, nz(0.01) * env(int(0.01 * SR), 0.0005, 300) * 0.06)
pop(wt(0, 'send') - 0.1, 900, 0.05)
tone(S0[1] + 0.5, 0.2, 300, 0.04, 10); thump(wt(1, 'charge'), 0.3, 200, 40); tone(wt(1, 'charge') + 0.3, 0.3, 1800, 0.04, 8)  # monitor off, plug in, charge chime
for k in range(3): pop(S0[2] + 0.7 + k * 0.45, 1200, 0.05)  # toggles
for k in range(14): add(wt(2, 'make') + k * 0.06, nz(0.008) * env(int(0.008 * SR), 0.0005, 300) * 0.05)  # password typing
for k in range(4): thump(wt(3, 'move') + 0.2 + k * 0.26, 0.3, 90, 25)  # push-up thuds
for k in range(6): thump(wt(3, 'a') + k * 0.25, 0.15, 300, 60)  # footsteps
m = int(1.0 * SR); add(wt(3, 'a', 1), (nz(1.0) - nz(1.0, 5)) * np.hanning(m) * 0.05)  # shower
n = int(2.0 * SR); add(wt(3, 'urges'), np.sin(2 * np.pi * np.cumsum(300 + 400 * np.exp(-((np.linspace(0, 1, n) - 0.3) / 0.17) ** 2)) / SR) * np.hanning(n) * 0.03)  # rising and falling tone
for k in range(3): tone(S0[4] + 0.6 + k * 0.4, 0.15, 2600 + rng.random() * 1200, 0.015, 30)  # birds
for k, m_ in enumerate([72, 76, 79]): tone(S0[4] + 0.3 + k * 0.07, 0.5, hz(m_), 0.03, 5)
for k in range(8): pop(S0[5] + 0.3 + k * 0.1, 900 + k * 60, 0.025)  # streak fills
tone(wt(5, 'one'), 0.3, 1320, 0.04, 8)
n = int(0.35 * SR); add(wt(5, 'send'), np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1800, n)) / SR) * env(n, 0.002, 8) * 0.05)
tone(wt(5, 'follow'), 0.12, 1400, 0.05, 30); tone(wt(5, 'follow') + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
