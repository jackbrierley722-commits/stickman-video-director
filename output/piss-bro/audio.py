# Piss next to bro: SFX only, under the narration
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
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
def trickle(a, b, amp=0.03):
    i0, i1 = int(a * SR), min(N, int(b * SR)); n = i1 - i0; y = ma(rng.normal(0, 1, n), 2) - ma(rng.normal(0, 1, n), 9); out[i0:i1] += y * amp * np.minimum(1, np.arange(n) / 2000) * np.minimum(1, (n - np.arange(n)) / 4000)
trickle(0.2, S0[5] - 0.2, 0.025)  # implied, never shown
for k in range(4): thump(S0[2] + 0.4 + k * 0.32, 0.18, 140, 40)  # bro shuffles over
for k in range(6): tone(S0[3] + 0.3 + k * 0.12, 0.06, 2600 + 300 * (k % 2), 0.02, 50)  # drill/screw clicks
tone(AT_he := wt(3, 'he')[0], 0.3, 520, 0.03, 8)
for k in range(5): add(S0[4] + 0.3 + k * 0.1, (nz(0.08, 1) - nz(0.08, 6)) * env(int(0.08 * SR), 0.002, 30) * 0.05)  # metal panel extending
thump(wt(4, 'he')[0] + 0.3, 0.4, 160, 30); tone(wt(4, 'he')[0] + 0.3, 0.2, 700, 0.02, 20)  # foot on ceramic
for k in range(3): thump(S0[5] + 0.2 + k * 0.35, 0.35, 90, 25)  # panels going up
creak(wt(5, 'with')[0] + 0.1, 0.6, 210, 0.04); thump(wt(5, 'with')[0] + 0.7, 0.5, 70, 18)  # door swings shut
tone(wt(5, 'and')[0] + 0.5, 0.05, 2200, 0.05, 60); thump(wt(5, 'and')[0] + 0.5, 0.25, 220, 50)  # lock click
for k in range(4): thump(wt(5, 'and')[0] + 0.9 + k * 0.22, 0.25, 120, 35)  # bro knocking
i0 = int((S0[6] + 0.4) * SR); x = np.arange(N - i0) / SR; out[i0:] += (ma(rng.normal(0, 1, N - i0), 20) * 0.12) * np.minimum(1, x / 1.2)  # stadium crowd swells in
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
