# Class bro: SFX + low music bed, bleeped swear, under the narration: SFX only, under the narration
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
cut = wt(14, 'me')[0] + 0.08
i1 = int(S0[1] * SR); out[:i1] += ma(rng.normal(0, 1, i1), 10) * 0.03 * np.clip(t[:i1] * 3, 0, 1)  # class murmur
for k in range(6): tone(0.3 + k * 0.33, 0.03, 2400 + rng.random() * 600, 0.012, 80)  # chalk taps
thump(S0[1], 0.5, 60, 10)  # desk bang
n = int(0.6 * SR); x = np.arange(n) / SR; add(S0[2] - 0.05, np.sin(2 * np.pi * np.cumsum(900 - 700 * x) / SR) * np.exp(-x * 3) * 0.04)  # record scratch
for k in range(9): add(S0[2] + 0.1 + k * 0.06, nz(0.08, 4) * env(int(0.08 * SR), 0.003, 25) * 0.03)  # chairs creak round
add(S0[2] + 0.5, nz(0.4, 3) * env(int(0.4 * SR), 0.02, 5) * 0.04)  # gasp
tone(wt(4, 'i')[0], 0.8, 523, 0.015, 3); tone(wt(4, 'i')[0] + 0.1, 0.8, 659, 0.012, 3)  # dramatic "soul"
tone(wt(5, 'he')[0], 0.5, 220, 0.02, 4); tone(wt(5, 'he')[0] + 0.1, 0.5, 207, 0.02, 4)  # side-eye sting
mw = wt(6, 'meanwhile')[0]; tone(mw, 1.2, 98, 0.04, 1.5); tone(mw + 0.05, 1.2, 104, 0.03, 1.5)  # ominous sting
i0, i1 = int(wt(6, 'doing')[0] * SR), int(S0[10] * SR); xx = t[i0:i1]; w = rng.normal(0, 1, i1 - i0); out[i0:i1] += (ma(w, 4) - ma(w, 20)) * 0.04 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * xx))  # slow little circles
tone(S0[9] + 0.3, 0.12, 1320, 0.03, 20)  # rules card pops
tone(wt(10, 'out')[0], 0.4, 147, 0.03, 4)
for k in range(5): thump(wt(11, 'you')[0] + 0.3 + k * 0.4, 0.15, 110, 30)  # walk of shame
thump(S0[12] - 0.1, 0.4, 90, 20)  # door shuts
for k in range(6): tone(S0[12] + 0.1 + k * 0.2, 0.03, 2400, 0.015, 90)  # clock ticks
thump(S0[13] + 0.2, 0.35, 90, 20)  # door opens again
for k in range(4): thump(S0[13] + 0.4 + k * 0.35, 0.13, 110, 30)
# ---------- low awkward-bouncy music bed ----------
BPM = 100; beat = 60 / BPM; mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def note(at, f, dur, amp):
    n = int(dur * SR); x = np.arange(n) / SR; y = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 7); i = int(at * SR)
    if i < N: mus[i:i + n] += amp * y[:N - i]
seq = [(45, 69), (45, 72), (43, 71), (41, 69)]; tb = 0.0; k = 0
while tb < D: r_, m_ = seq[(k // 4) % 4]; note(tb, mf(r_), beat * 0.8, 0.35); note(tb + beat / 2, mf(m_ + (k % 2) * 3), beat * 0.4, 0.12); tb += beat; k += 1
mus *= np.interp(t, [0, 0.5, D - 1.0, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
fa, fb = wt(0, 'fucking'); i0, i1 = int((fa - 0.02) * SR), int((fb + 0.02) * SR); lvl = np.sqrt(np.mean(vo[i0 - int(0.5 * SR):i0] ** 2)) * 1.4; vo[i0:i1] = np.sin(2 * np.pi * 1000 * np.arange(i1 - i0) / SR) * lvl
vo[int((wt(14, 'me')[0] + 0.08) * SR):] = 0
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9; mix[int(cut * SR):] = 0
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
