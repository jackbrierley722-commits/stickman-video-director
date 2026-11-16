# Tsunami with bro: SFX only, under the narration
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
i1 = int(S0[6] * SR); x = t[:i1]; out[:i1] += np.sin(2 * np.pi * np.cumsum(500 + 250 * np.sin(2 * np.pi * 0.25 * x)) / SR) * 0.018 * np.clip(x * 2, 0, 1)  # siren wail
out[:int(S0[5] * SR)] += ma(rng.normal(0, 1, int(S0[5] * SR)), 6) * 0.025  # crowd panic / surf
for k in range(3): tone(0.6 + k * 0.9, 0.4, [880, 990, 760][k], 0.01, 6)
tone(S0[1] + 1.6, 1.4, 1320, 0.02, 2); tone(S0[1] + 1.75, 1.4, 1760, 0.015, 2)  # dreamy shimmer on the gorgeous face
tone(S0[2] + 0.2, 0.05, 1800, 0.03, 60)  # phone camera beep
i0 = int(S0[3] * SR); i1 = int(S0[4] * SR); n = i1 - i0; out[i0:i1] += (ma(rng.normal(0, 1, n), 3) - ma(rng.normal(0, 1, n), 30)) * 0.06 * np.linspace(1, 0.3, n)  # sea sucking back
for k in range(10): thump(S0[4] + 0.2 + k * 0.2, 0.18, 120, 40)  # running on sand
for k in range(int((S0[6] - S0[5]) / 0.22)): thump(S0[5] + 0.1 + k * 0.22, 0.2, 110, 35)  # running, then stairs
cr = wt(6, 'the')[0]; thump(cr, 1.0, 35, 3); i0 = int(cr * SR); n = N - i0; out[i0:] += (ma(rng.normal(0, 1, n), 2) - ma(rng.normal(0, 1, n), 20)) * 0.09 * np.exp(-np.arange(n) / SR * 0.35)  # the crash and the flood
tone(wt(8, 'twelve')[0], 0.12, 1400, 0.04, 30)  # story notification
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
