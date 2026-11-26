# Dinosaur return: SFX + low cinematic music bed, under the narration: SFX only, under the narration
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
def growl(at, dur, f0, amp, rough=0.6):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.25 * np.sin(np.pi * x / dur)); ph = 2 * np.pi * np.cumsum(f) / SR
    src = np.tanh(3 * np.sin(ph)) + rough * ma(rng.normal(0, 1, n), 3); y = (ma(src, 6) - ma(src, 60)) * np.sin(np.pi * x / dur) ** 0.6 * amp; add(at, y)
def screech(at, dur=0.6, f0=1500, amp=0.05):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.6 * np.sin(np.pi * x / dur)) ; y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-x * 3) * np.sin(np.pi * x / dur); add(at, ma(y, 3) * amp)
day = [(0, S0[3]), (S0[3], S0[4]), (S0[5], D)]
# city ambience: traffic hum + distant horns (not during the night suburbs)
for a_, b_ in day:
    i0, i1 = int(a_ * SR), int(b_ * SR); n = i1 - i0; out[i0:i1] += (ma(rng.normal(0, 1, n), 30) * 0.05 + np.sin(2 * np.pi * 70 * t[i0:i1]) * 0.006) * np.clip((t[i0:i1] - a_) * 3, 0, 1)
for at in (1.2, 5.0, 12.8, 16.4): tone(at, 0.35, 392, 0.012, 3); tone(at, 0.35, 330, 0.01, 3)
# brachiosaurus: slow heavy steps + a deep call
for k in range(int(S0[3] / 1.95)): thump(0.3 + k * 1.95, 0.55, 38, 7)
growl(wt(0, 'one')[0] - 0.3, 2.0, 55, 0.18, 0.3); growl(wt(1, 'fog')[0], 2.2, 50, 0.16, 0.3)
i0, i1 = int(S0[2] * SR), int(S0[3] * SR); out[i0:i1] += ma(rng.normal(0, 1, i1 - i0), 8) * 0.03  # crowd murmur
tone(wt(2, 'people')[0] + 0.2, 0.05, 2600, 0.03, 60)  # phone camera click
# pterosaurs
for k in range(5): screech(S0[3] + 0.4 + k * 0.9 + rng.random() * 0.3, 0.5, 1300 + rng.random() * 600, 0.04)
# night suburbs: crickets, raptor chirps, car alarm
i0, i1 = int(S0[4] * SR), int(S0[5] * SR); xx = t[i0:i1]; out[i0:i1] += np.sin(2 * np.pi * 4200 * xx) * (np.sin(2 * np.pi * 14 * xx) > 0.6) * 0.006
for k in range(6): screech(S0[4] + 0.8 + k * 0.7, 0.25, 2200 + rng.random() * 700, 0.035)
hu = wt(4, 'they')[0]; thump(hu, 0.4, 120, 30)
i0 = int(hu * SR); i1 = int(S0[5] * SR); xx = t[i0:i1] - hu; out[i0:i1] += np.sin(2 * np.pi * np.cumsum(900 + 400 * np.sign(np.sin(2 * np.pi * 2 * xx))) / SR) * 0.012  # car alarm
# the ground shakes: giant footsteps, screams, roar
for k in range(int((D - S0[5]) / 0.95)): thump(wt(5, 'ground')[0] + k * 0.95, 1.0, 34, 5); add(wt(5, 'ground')[0] + k * 0.95, nz(0.2, 4) * env(int(0.2 * SR), 0.002, 14) * 0.08)
i0 = int(S0[5] * SR); n = int(2.5 * SR); xx = np.arange(n) / SR; out[i0:i0 + n] += (ma(rng.normal(0, 1, n), 2) - ma(rng.normal(0, 1, n), 12)) * 0.05 * np.sin(np.pi * xx / 2.5)  # crowd screams
growl(S0[6] + 1.6, 1.8, 70, 0.32, 0.9); growl(S0[7] + 0.2, 2.4, 62, 0.34, 1.0)  # T. rex roars
tone(wt(7, 'comment')[0], 0.2, 880, 0.03, 12)
# ---------- low cinematic music bed: dark pulse + low strings, original ----------
mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 100
for k in range(int(D / beat) + 1):
    tb = k * beat; nn = int(0.35 * SR); xx = np.arange(nn) / SR; i = int(tb * SR)
    if i < N: y = np.sin(2 * np.pi * mf([38, 38, 41, 36][(k // 4) % 4]) * xx) * np.exp(-xx * 6) * 0.6; mus[i:i + nn] += y[:N - i]
chords = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52]]
for bi, t0 in enumerate(np.arange(0, D, 4 * beat)):
    n = int(4 * beat * SR); xx = np.arange(n) / SR; pad = sum(np.sin(2 * np.pi * mf(m) * xx) + 0.3 * np.sin(2 * np.pi * mf(m) * 2.004 * xx) for m in chords[bi % 4]) * np.minimum(1, xx / 0.8) * np.minimum(1, (4 * beat - xx) / 0.8) * 0.12; i = int(t0 * SR); mus[i:i + n] += pad[:max(0, N - i)]
mus *= np.interp(t, [0, 0.5, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
