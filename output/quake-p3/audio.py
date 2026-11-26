# Earthquake P3 (vote A, the door to floor 4): SFX + low tense music bed, under the narration
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
# smoke roar through the open door, cut off when it shuts
shut = wt(2, 'shut')[0]; i1 = int((shut + 0.1) * SR); out[:i1] += (ma(rng.normal(0, 1, i1), 8) - ma(rng.normal(0, 1, i1), 60)) * 0.05
thump(shut + 0.1, 0.8, 70, 10); thump(shut + 0.12, 0.3, 160, 30)  # door slams
for k in range(int(D / 0.5)): tone(k * 0.5, 0.22, 2900, 0.006 if k * 0.5 > shut else 0.014, 4)  # alarm, muffled after the door
for k in range(3): thump(0.1 + k * 0.45, 0.1, 140, 30)  # footsteps in
for k in range(4): thump(S0[1] + 0.3 + k * 0.45, 0.08, 140, 30)
# knocking on the lift doors (metal), keeps going
kn = wt(3, 'knocking')[0]; k = kn
while k < S0[5] - 0.3:
    for d_ in (0, 0.14, 0.28): thump(k + d_, 0.35, 180, 28); tone(k + d_, 0.15, 420, 0.012, 20)
    k += 1.0
# lift doors scrape apart a crack
add(S0[4] + 0.3, (nz(0.9, 2) - nz(0.9, 8)) * np.hanning(int(0.9 * SR)) * 0.05)
# fire truck below: diesel rumble + siren whoops getting closer
c5 = S0[5]; i0 = int((c5 - 0.2) * SR); xx = np.arange(N - i0) / SR; g = np.clip(xx / 2.0, 0, 1)
out[i0:] += (np.sin(2 * np.pi * 40 * xx) * 0.02 + ma(rng.normal(0, 1, N - i0), 50) * 0.04) * g
for at in (c5 + 0.2, c5 + 1.4): m = int(0.7 * SR); x = np.arange(m) / SR; add(at, np.sin(2 * np.pi * np.cumsum(500 + 700 * x / 0.7) / SR) * np.hanning(m) * 0.02)
tone(S0[6] + 0.2, 0.2, 660, 0.04, 12); tone(wt(6, 'option', 1)[0], 0.2, 990, 0.04, 12); tone(wt(6, 'comment')[0], 0.2, 880, 0.035, 12)
# ---------- low tense music bed: dark pulse + drone, original ----------
BPM = 120; beat = 60 / BPM; mus = np.zeros(N)
def mput(at, y):
    i = int(at * SR)
    if i < N: mus[i:i + len(y)] += y[:N - i]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
seq = [45, 45, 48, 45, 44, 44, 47, 44]; tb = 0.0; k = 0
while tb < D:
    f = mf(seq[k % 8]); nn = int(beat * 0.45 * SR); xx = np.arange(nn) / SR; mput(tb, np.tanh(2.5 * np.sin(2 * np.pi * f * xx)) * np.exp(-xx * 6) * 0.5)
    if k % 2 == 0: kk = int(0.16 * SR); x2 = np.arange(kk) / SR; mput(tb, np.sin(2 * np.pi * 48 * x2 * (1 - 0.4 * x2)) * np.exp(-x2 * 20) * 0.7)
    tb += beat / 2; k += 1
mus += (np.sin(2 * np.pi * mf(33) * t) + 0.5 * np.sin(2 * np.pi * mf(40) * t)) * 0.18 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
mus *= np.interp(t, [0, 0.6, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
