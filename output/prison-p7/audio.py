# Prison escape Part 7 finale (vote B, keep walking): SFX + low music bed, under the narration
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(77)
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
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07): m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
E = dict(c1=S0[1], c2=S0[2], rb=wt(2, 'roadblock'), c3=S0[3], c4=S0[4], past=wt(4, 'past'), c5=S0[5], c6=S0[6], note=wt(6, 'note'), welcome=wt(6, "you're"), c7=S0[7], comment=wt(7, 'comment'))
night = t < E['c5']; out += ((nz(D, 2) - nz(D, 10)) * 0.01 + nz(D, 60) * 0.015) * night  # night air
def scrape(at, dur=0.35, amp=0.05): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 5)) * np.hanning(m) * amp)
def rustle(at, dur=0.8, amp=0.06): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 3)) * np.abs(np.sin(np.linspace(0, 7 * np.pi, m))) * np.hanning(m) * amp)
def step(at, amp=0.06): add(at, (nz(0.08, 1) - nz(0.08, 4)) * env(int(0.08 * SR), 0.002, 40) * amp)
# footsteps whenever you walk (clips 0-4)
k = 0.1
while k < E['c5'] - 0.2: step(k, 0.07 if (k < E['c1'] or k > E['c3']) else 0.05); k += 0.48
for k in range(6): rustle(E['c4'] + 0.3 + k * 0.5, 0.35, 0.05)  # branches in the trees
# roadblock: siren whoops, radio crackle, car door, Dex hauled out
for at in (0.3, E['c3'] + 0.4): m = int(0.6 * SR); x = np.arange(m) / SR; add(at, np.sin(2 * np.pi * np.cumsum(600 + 500 * x / 0.6) / SR) * np.hanning(m) * 0.02)
for at in (1.0, E['c3'] + 1.6, E['c4'] + 0.8): add(at, (nz(0.5, 1) - nz(0.5, 2)) * (np.random.default_rng(int(at * 10)).random(int(0.5 * SR)) > 0.6) * 0.03)  # radio
thump(0.25, 0.4, 150, 30); thump(1.5, 0.35, 90, 20)  # door, Dex against the car
# clip 1: car idling beside you, then pulls away; clip 2: drives off and brakes at the roadblock
lvl = np.interp(t, [E['c1'], E['c2'] - 0.5, E['c2'], E['rb'], E['rb'] + 0.5, E['c3']], [0.8, 0.8, 2.2, 2.0, 0.7, 0.4]) * ((t > E['c1']) & (t < E['c3']))
fade = np.interp(t, [E['c2'], E['c3']], [1, 0.45]); out += (np.sin(2 * np.pi * np.cumsum(34 * np.maximum(lvl, 0.5)) / SR) * 0.03 + ma(rng.normal(0, 1, N), 40) * 0.04 * lvl) * fade
tone(E['rb'] + 0.1, 0.5, 1900, 0.006, 6)  # distant brakes
# train: rhythmic wheel clatter + hum from sunrise on
i0 = int(E['c5'] * SR); out[i0:] += (np.sin(2 * np.pi * 55 * t[i0:]) * 0.01 + ma(rng.normal(0, 1, N - i0), 30) * 0.02)
k = E['c5']
while k < D - 0.5: thump(k, 0.12, 70, 30); thump(k + 0.16, 0.1, 70, 30); k += 1.1
# paper unfolding, then a warm ending sting
rustle(E['c6'] + 0.2, 0.7, 0.07)
tone(E['welcome'], 1.6, 523, 0.02, 1.5); tone(E['welcome'] + 0.05, 1.6, 659, 0.016, 1.5); tone(E['welcome'] + 0.1, 1.6, 784, 0.014, 1.5)
tone(E['comment'], 0.2, 880, 0.04, 12)
# ---------- low tense music bed (original, generated here) ----------
mus = np.zeros(N); beat = 60 / 92
for root_i, tb in enumerate(np.arange(0, D, beat * 8)):
    f0 = [55, 55 * 2 ** (1 / 12), 55 * 2 ** (-2 / 12), 55 * 2 ** (3 / 12)][root_i % 4]; m = int(beat * 8 * SR); x = np.arange(m) / SR
    pad = (np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x) + 0.3 * np.sin(2 * np.pi * f0 * 2.4 * x)) * np.hanning(m)
    i = int(tb * SR); mus[i:i + m] += pad[:max(0, N - i)] * 0.5
for tb in np.arange(0, D, beat / 2):
    m = int(0.12 * SR); x = np.arange(m) / SR; i = int(tb * SR); y = np.sin(2 * np.pi * 440 * x) * np.exp(-x * 40) * 0.12
    mus[i:i + m] += y[:max(0, N - i)]
for tb in np.arange(0, D, beat):
    m = int(0.25 * SR); x = np.arange(m) / SR; i = int(tb * SR); y = np.sin(2 * np.pi * 50 * x * (1 - 0.3 * x)) * np.exp(-x * 14) * 0.6
    mus[i:i + m] += y[:max(0, N - i)]
mus *= np.interp(t, [0, 1.0, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
