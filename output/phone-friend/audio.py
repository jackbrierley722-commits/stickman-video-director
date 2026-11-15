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
# hook: phone buzzes + scroll flicks
for k in range(5): m = int(0.25 * SR); x = np.arange(m) / SR; add(0.2 + k * 0.6, np.sign(np.sin(2 * np.pi * 170 * x)) * env(m, 0.005, 10) * 0.02)
pop(wt(0, 'send') - 0.1, 900, 0.05)
for k in range(10): pop(S0[1] + 0.1 + k * 0.12, 1400 + (k % 3) * 200, 0.03)  # notification pings piling up
for k in range(5): add(wt(1, 'all') + k * 0.12, nz(0.04, 3) * env(int(0.04 * SR), 0.001, 60) * 0.04)  # swipes away
tone(wt(1, 'messages'), 0.3, 880, 0.03, 6)
n = int(0.8 * SR); add(wt(2, 'grayscale'), np.sin(2 * np.pi * np.cumsum(np.linspace(900, 300, n)) / SR) * np.hanning(n) * 0.03)  # colour drains
thump(wt(3, 'another') + 0.3, 0.25, 160, 30); add(wt(3, 'another') + 0.5, nz(0.15, 2) * env(int(0.15 * SR), 0.002, 20) * 0.04)  # door
for k in range(3): add(S0[3] + 0.4 + k * 0.5, ma(nz(0.3, 1), 30) * np.hanning(int(0.3 * SR)) * 0.04)  # chatter murmur
for k in range(7): pop(wt(4, 'check') + 0.2 + k * 0.12, 600 + k * 80, 0.025)  # bars rise
thump(wt(4, "that's"), 0.5, 50, 8); tone(wt(4, "that's"), 1.2, 98, 0.04, 2); tone(wt(4, "that's"), 1.2, 104, 0.03, 2)
for k in range(3): tone(S0[5] + 2.6 + k * 0.4, 0.15, 2600 + rng.random() * 1200, 0.015, 30)  # birds outside
for k, m_ in enumerate([72, 76, 79]): tone(wt(5, 'look') + k * 0.07, 0.5, hz(m_), 0.03, 5)
n = int(0.35 * SR); add(wt(5, 'send'), np.sin(2 * np.pi * np.cumsum(np.linspace(600, 1800, n)) / SR) * env(n, 0.002, 8) * 0.05)
tone(wt(5, 'follow'), 0.12, 1400, 0.05, 30); tone(wt(5, 'follow') + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; bus *= min(1.0, 0.5 * np.abs(vo * 1.6).max() / (np.abs(bus).max() + 1e-9))  # SFX at least 6 dB under the voice
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
