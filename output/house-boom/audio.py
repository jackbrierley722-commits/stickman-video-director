# House boom: SFX + low music bed, under the narration (no bleeps on this version)
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
def cash(at): tone(at, 0.08, 2600, 0.03, 30); tone(at + 0.07, 0.25, 3300, 0.025, 10); add(at, nz(0.06, 1) * env(int(0.06 * SR), 0.001, 60) * 0.03)
def hammer(at): thump(at, 0.35, 220, 40); tone(at, 0.05, 1800, 0.015, 60)
def swish(at, dur=0.3, amp=0.05): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 4)) * np.hanning(m) * amp)
def hiss(at, dur=0.7, amp=0.04): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 2)) * np.hanning(m) * amp)
E = dict(stairs=wt(2, 'stairs')[0], roof=wt(2, 'roof')[0], railing=wt(2, 'railing')[0], wall=wt(2, 'bedroom')[0] + 0.25, peach=wt(3, 'peach')[0], reps=wt(3, 'reps')[0], hid=wt(3, 'hid')[0], fed=wt(1, 'fed')[0] + 0.25, day=wt(4, 'day')[0], c4=S0[4], blew=wt(6, 'blew')[0], masked=S0[5] + 0.1, fought=S0[5] + 1.35, every=S0[5] + 1.95, run=S0[5] + 2.35, c7=S0[7], c8=S0[8])
boom = E['blew'] - 0.05
# repairs: hammering, sawing, each one rings the till
for k in range(3): hammer(E['stairs'] - 0.3 + k * 0.15)
for k in range(4): hammer(E['roof'] - 0.4 + k * 0.12)
for k in range(2): swish(E['railing'] - 0.2 + k * 0.2, 0.18, 0.06)
thump(E['wall'], 0.5, 110, 20); hammer(E['wall'] + 0.15)
for k in range(3): swish(E['peach'] - 0.2 + k * 0.22)
for t_ in (E['stairs'], E['roof'], E['railing'], E['wall'], E['peach'], E['hid']): cash(t_ + 0.05)
for k in range(3): thump(E['reps'] - 0.2 + k * 0.4, 0.25, 160, 40); tone(E['reps'] - 0.2 + k * 0.4, 0.05, 900, 0.01, 40)  # weight clanks
thump(E['hid'] - 0.05, 0.25, 260, 40); add(E['hid'] + 0.2, nz(0.3, 2) * np.hanning(int(0.3 * SR)) * 0.03)  # floorboard pried up, cash rustle
hiss(E['fed'] + 0.1, 0.6, 0.03); thump(E['fed'] - 0.1, 0.15, 300, 50)
# leaving: car doors, engine pulling away
thump(E['c4'] + 0.3, 0.3, 140, 30); thump(E['c4'] + 0.45, 0.3, 140, 30); n = int(1.2 * SR); x = np.arange(n) / SR; add(E['c4'] + 0.5, (np.sin(2 * np.pi * np.cumsum(40 + 30 * x) / SR) * 0.04 + ma(rng.normal(0, 1, n), 40) * 0.05) * np.exp(-x * 1.2))
# BOOM
thump(boom, 1.4, 40, 3); thump(boom, 0.9, 70, 5); m = int(2.5 * SR); xx = np.arange(m) / SR; add(boom, ma(rng.normal(0, 1, m), 8) * np.exp(-xx * 1.8) * 0.5); add(boom, ma(rng.normal(0, 1, m), 60) * 6 * np.exp(-xx * 0.8) * 0.12)
for k in range(24): tt = boom + 0.6 + rng.random() * 1.6; thump(tt, 0.08 + 0.1 * rng.random(), 150 + rng.random() * 200, 35)
for k in range(int((D - boom) / 0.07)): add(boom + 0.5 + k * 0.07 + rng.random() * 0.05, nz(0.02, 1) * env(int(0.02 * SR), 0.001, 90) * 0.03)
for k in range(int((D - boom - 1.6) / 0.5)): tone(boom + 1.6 + k * 0.5, 0.24, 1250 if k % 2 else 950, 0.008, 2)
# break-in: door smashed, punch, kick, bodies hitting the wall, fire catching
thump(E['masked'] - 0.05, 0.7, 90, 12); add(E['masked'], nz(0.3, 1) * env(int(0.3 * SR), 0.001, 14) * 0.12)
for tt in (E['fought'] - 0.55, E['every'] - 0.1): thump(tt, 0.8, 120, 22); add(tt, nz(0.06, 1) * env(int(0.06 * SR), 0.001, 50) * 0.15); thump(tt + 0.5, 0.6, 70, 14)
i0 = int(E['fought'] * SR); i1 = int(boom * SR); xx = np.arange(i1 - i0) / SR; out[i0:i1] += ma(rng.normal(0, 1, i1 - i0), 30) * 0.12 * np.clip(xx, 0, 1)
k = E['run']
while k < boom: thump(k, 0.12, 140, 35); k += 0.2  # her running out
# lost the snake: glass tinkle; lost the money: falling sad tones
for k in range(8): tone(E['c7'] + 0.2 + k * 0.07, 0.15, 2800 + 400 * (k % 3), 0.01, 25)
for k, f in enumerate([392, 370, 349, 294]): tone(E['c8'] + 0.4 + k * 0.38, 0.5 if k < 3 else 1.2, f, 0.03, 2.5)
# ---------- low cinematic music bed: dark pulse + low strings, original ----------
mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 100
for k in range(int(D / beat) + 1):
    tb = k * beat; nn = int(0.35 * SR); xx = np.arange(nn) / SR; i = int(tb * SR)
    if i < N: y = np.sin(2 * np.pi * mf([36, 33, 29, 31][(k // 4) % 4]) * xx) * np.exp(-xx * 6) * 0.6; mus[i:i + nn] += y[:N - i]
chords = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
for bi, t0 in enumerate(np.arange(0, D, 4 * beat)):
    n = int(4 * beat * SR); xx = np.arange(n) / SR; pad = sum(np.sin(2 * np.pi * mf(m) * xx) + 0.3 * np.sin(2 * np.pi * mf(m) * 2.004 * xx) for m in chords[bi % 4]) * np.minimum(1, xx / 0.8) * np.minimum(1, (4 * beat - xx) / 0.8) * 0.12; i = int(t0 * SR); mus[i:i + n] += pad[:max(0, N - i)]
mus *= np.interp(t, [0, 0.5, boom - 0.05, boom, boom + 1.5, boom + 2.5, D - 0.6, D], [0, 1, 1, 0, 0, 0.6, 0.6, 0])  # music cuts dead at the blast
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
# no bleeps on this one (user asked)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
