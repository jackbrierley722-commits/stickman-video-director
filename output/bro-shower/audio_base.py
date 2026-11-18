# Beat your bro to school (realistic): SFX only, under the narration; the shout stays loud and unbleeped
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(11)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a'], w['b']
            k += 1
    return CL[ci]['start'], CL[ci]['start'] + 0.3
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def whoosh(at, amp=0.08, dur=0.4):
    n = int(dur * SR); x = np.arange(n) / SR; y = ma(rng.normal(0, 1, n), 6) - ma(rng.normal(0, 1, n), 30); add(at, y * np.sin(np.pi * x / dur) ** 2 * amp)
def bell(at, amp=0.04): tone(at, 0.5, 2200, amp, 6); tone(at + 0.12, 0.6, 2200, amp, 6)
def rattle(a, b, amp=0.05):
    for k in range(int((b - a) / 0.05)): add(a + k * 0.05, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * amp * (0.6 + 0.4 * rng.random()))
S0 = [c['start'] for c in CL]
# frame 1: zooming past
whoosh(0.1, 0.1, 0.6); bell(0.6)
for k in range(int((S0[2] - S0[1]) / 0.3)): thump(S0[1] + 0.1 + k * 0.3, 0.14, 120, 40)  # running feet
bump = wt(2, 'and')[0]; rattle(bump - 0.1, S0[3] - 0.1, 0.06)  # cobbles on iron wheels
for k in range(int((S0[3] - bump) / 0.25)): thump(bump + k * 0.25, 0.2, 90, 30)
gen = wt(3, 'genius')[0]; tone(gen, 0.6, 1320, 0.035, 4); tone(gen + 0.1, 0.6, 1760, 0.03, 4)
over = wt(3, 'sends')[0]; tone(over - 0.3, 0.06, 1500, 0.05, 50)  # tink (pebble)
whoosh(over - 0.05, 0.1, 0.7); thump(over + 0.75, 0.9, 55, 10); add(over + 0.75, nz(0.2, 2) * env(int(0.2 * SR), 0.002, 15) * 0.15)  # faceplant
for k in range(4): add(over + 0.85 + k * 0.08, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 50) * 0.05)  # metal clatter
chain = wt(4, 'a')[0]; rattle(chain, chain + 0.8, 0.025)  # chain clicking
for at in (S0[4] + 0.2, chain, wt(4, 'same')[0]): tone(at, 0.15, 900, 0.035, 18)
rattle(S0[5], wt(5, 'so')[0], 0.06)  # teeth rattling
air = wt(5, 'so')[0]
for k in range(5): add(air + 0.2 + k * 0.32, (nz(0.25, 2) - nz(0.25, 12)) * np.sin(np.linspace(0, np.pi, int(0.25 * SR))) * 0.07)  # pump psshh
whoosh(S0[6], 0.1, 0.6); bell(S0[6] + 0.5)
busA = wt(6, 'he')[0]; i0 = int(busA * SR); out[i0:] += (np.sin(2 * np.pi * 55 * t[i0:]) * 0.03 + np.resize(nz(D - busA + 0.01, 30), N - i0) * 0.05)  # bus engine
tone(busA + 0.6, 0.6, 330, 0.04, 3); tone(busA + 0.6, 0.6, 415, 0.03, 3)  # sad horn
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
