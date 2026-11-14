# Comment reply: chest workout. Light bed, SFX on actions.
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(8)
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
def thump(at, amp=0.5, f=60, d=20): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
prog = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]
for i, s_ in enumerate(np.arange(0, D, 0.3)):
    ch = prog[int(s_ / 2.4) % 4]; n = int(0.5 * SR); x = np.arange(n) / SR; add(s_, (np.sin(2 * np.pi * hz([ch[0], ch[2], ch[1], ch[2] + 12][i % 4] + 12) * x) + 0.25 * np.sin(2 * np.pi * 4 * hz(ch[0] + 12) * x)) * env(n, 0.002, 9), 0.014)
    if i % 2 == 0: add(s_, np.sin(2 * np.pi * hz(ch[0] - 12) * x) * env(n, 0.002, 8), 0.022)
pop(0.05, 800, 0.06)  # comment pops in
thump(wt(0, 'no'), 0.6, 70, 14); tone(wt(0, 'no'), 0.25, 220, 0.04, 8)
tone(wt(0, 'but') + 0.2, 0.3, 880, 0.03, 8)
pop(wt(1, 'fat') - 0.1, 1100); thump(wt(1, "there's") + 0.2, 0.4, 70, 16)
n = int(1.0 * SR); x = np.arange(n) / SR; add(wt(2, 'grow'), np.sin(2 * np.pi * np.cumsum(np.linspace(90, 160, n)) / SR) * np.hanning(n) * 0.1)  # muscle pump
for k in range(3): thump(wt(2, 'grow') + 0.1 + k * 0.3, 0.3, 90, 25)
n = int(0.6 * SR); add(wt(3, 'lifted') - 0.2, np.sin(2 * np.pi * np.cumsum(np.linspace(500, 1200, n)) / SR) * np.hanning(n) * 0.04)  # lift
tone(wt(4, 'twist'), 0.5, 330, 0.04, 4); tone(wt(4, 'twist') + 0.1, 0.5, 311, 0.04, 4)
m = int(2.2 * SR); add(wt(4, 'burns'), (nz(2.2) - nz(2.2, 3)) * np.hanning(m) * 0.03)  # fat sizzle
n = int(0.8 * SR); add(wt(4, 'smaller') - 0.2, np.sin(2 * np.pi * np.cumsum(np.linspace(900, 400, n)) / SR) * np.hanning(n) * 0.04)
for k, m_ in enumerate([72, 76, 79]): tone(wt(5, 'lift') + k * 0.07, 0.4, hz(m_), 0.035, 6)
thump(wt(5, 'not') + 0.2, 0.5, 70, 14)
pop(wt(5, 'got') - 0.1, 900); pop(wt(5, 'comment') - 0.1, 1200)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
