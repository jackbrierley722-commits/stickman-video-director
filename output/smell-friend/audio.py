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
# hook: party chatter, a fly buzz, then everyone stepping back
out += ma(rng.normal(0, 1, N), 14) * 0.012 * (t < S0[1])
for k in range(3): m = int(0.6 * SR); x = np.arange(m) / SR; add(0.3 + k * 1.3, np.sin(2 * np.pi * (220 + 30 * np.sin(x * 40)) * x) * np.hanning(m) * 0.012)
pop(wt(0, 'send') - 0.1, 900, 0.05); tone(wt(0, 'they'), 0.25, 330, 0.03, 6)
m = int(0.6 * SR); add(S0[1] + 1.0, np.sin(2 * np.pi * 120 * np.arange(m) / SR) * env(m, 0.002, 10) * 0.03)  # X stamp
for k in range(2): add(wt(1, 'use') + 0.4 + k * 0.5, nz(0.35, 2) * env(int(0.35 * SR), 0.01, 8) * 0.05)  # spray
for k, m_ in enumerate([76, 79]): tone(wt(1, 'it') + k * 0.1, 0.4, hz(m_), 0.025, 5)
m = int(2.5 * SR); add(S0[2] + 0.3, ma(nz(2.5, 1), 40) * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * np.arange(m) / SR)) * np.hanning(m) * 0.05)  # washer spin
add(wt(2, 'sniffing'), nz(0.4, 4) * env(int(0.4 * SR), 0.05, 6) * 0.05)  # sniff
tone(wt(2, 'your'), 0.3, 220, 0.03, 5)
for k in range(2): thump(S0[3] + 0.8 + k * 0.3, 0.25, 140, 30)  # shoes drop
tone(wt(3, 'let') + 0.8, 0.3, 1320, 0.03, 8); pop(wt(3, 'and') + 0.7, 400, 0.05)
for k in range(10): add(S0[4] + 1.0 + k * 0.11, nz(0.08, 1) * env(int(0.08 * SR), 0.003, 30) * 0.03)  # brushing
for k in range(7): pop(S0[5] + 0.5 + k * 0.12, 900 + k * 60, 0.025)  # calendar ticks
m = int(1.4 * SR); add(wt(5, 'you') + 0.3, ma(nz(1.4, 1), 20) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * np.arange(m) / SR)) * 0.1)  # snore
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
