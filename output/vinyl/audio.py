# Vinyl explainer: SFX only, under the narration: SFX only, under the narration
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
# soft vinyl surface crackle bed through the whole video
for k in range(int(D * 9)): at = rng.random() * D; add(at, nz(0.004, 1) * env(int(0.004 * SR), 0.0005, 400) * (0.02 + 0.05 * rng.random() ** 3))
out += (nz(D, 3) - nz(D, 40)) * 0.004
thump(0.05, 0.5, 60, 14); add(0.06, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 120) * 0.08)  # needle drop
tone(wt(0, 'diamond')[0] + 0.05, 0.9, 2637, 0.012, 4); tone(wt(0, 'diamond')[0] + 0.12, 0.9, 3520, 0.009, 4)  # diamond glint
for at in (S0[1], S0[2], S0[4], S0[6]): whoosh(at - 0.25, 0.09, 0.5)  # zooms
i0 = int(S0[1] * SR); i1 = int(S0[4] * SR); xx = np.arange(i1 - i0) / SR; out[i0:i1] += (ma(rng.normal(0, 1, i1 - i0), 20) * 0.04) * np.clip(xx * 2, 0, 1) * np.clip((i1 - i0) / SR - xx, 0, 1)  # groove rumble under the microscope
i0 = int(wt(4, 'coils')[0] * SR); i1 = int(S0[5] * SR); xx = np.arange(i1 - i0) / SR; out[i0:i1] += np.sign(np.sin(2 * np.pi * 100 * xx)) * 0.006 * np.clip(xx * 3, 0, 1) * np.clip(((i1 - i0) / SR - xx) * 3, 0, 1)  # coil hum
for k in range(6): tone(wt(4, 'which')[0] + k * 0.12, 0.05, 1800 + k * 120, 0.012, 50)  # signal blips
for k in range(10): thump(wt(5, 'speaker')[0] + k * 0.4, 0.35, 55, 12)  # speaker pumping
tone(wt(6, 'left')[0], 0.3, 660, 0.02, 10); tone(wt(6, 'right')[0], 0.3, 880, 0.02, 10)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
