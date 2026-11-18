# Prison escape Part 4 (vote B, the yard): SFX only, under the narration
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
E = dict(recap=S0[1], found=wt(1, 'found'), threw=wt(2, 'threw'), lightF=wt(2, 'the', 1), c3=S0[3], climbed=wt(3, 'climbed'), c4=S0[4], c5=S0[5], leaves=wt(5, 'he'), c6=S0[6], engine=wt(6, 'engine'),
         c7=S0[7], guard=wt(7, 'guard'), steps=wt(7, 'steps'), torch=wt(7, 'torch'), optA=S0[8], optB=wt(8, 'option', 1), comment=wt(8, 'comment'))
out += (nz(D, 2) - nz(D, 10)) * 0.012 + nz(D, 60) * 0.02  # night wind
def clunk(at): thump(at, 0.5, 120, 40); tone(at, 0.06, 900, 0.03, 50)
def scrape(at, dur=0.35): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 5)) * np.hanning(m) * 0.05)
def rattle(at, dur=0.6, amp=0.05):
    for k in range(int(dur / 0.04)): add(at + k * 0.04, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 90) * amp * (0.5 + 0.5 * rng.random()))
def alarm(a, b, amp=0.008):
    i0, i1 = int(a * SR), int(b * SR); xx = np.arange(i1 - i0) / SR; out[i0:i1] += np.sign(np.sin(2 * np.pi * (650 + 180 * (np.sin(2 * np.pi * 1.1 * xx) > 0)) * xx)) * amp * np.clip(xx * 3, 0, 1)
# flash-forward: guards rattling the fence, alarm in the distance
rattle(0.2, 2.4, 0.04); alarm(0, E['recap'])
# recap: the searchlight clunks onto you
thump(E['found'], 0.9, 40, 5); tone(E['found'], 1.4, 110, 0.03, 1.5); alarm(E['recap'], E['c5'])
# the throw: whoosh, then the jacket snags on the wire
n = int(0.5 * SR); x = np.arange(n) / SR; add(E['threw'] + 0.05, (nz(0.5, 4) - nz(0.5, 30)) * np.sin(np.pi * x / 0.5) ** 2 * 0.12)
rattle(E['threw'] + 0.65, 0.5, 0.06); thump(E['lightF'], 0.6, 45, 6)  # light swings onto the jacket
for k in range(int((E['climbed'] - E['c3']) / 0.26)): thump(E['c3'] + 0.1 + k * 0.26, 0.22, 110, 32)  # running
thump(E['climbed'] + 0.25, 0.5, 70, 14); scrape(E['climbed'] + 0.4, 0.5)  # climbing onto the truck floor
for k in range(10): thump(E['c4'] - 0.2 + k * 0.17, 0.12, 120, 40)  # guards running past
rattle(E['c4'] + 1.4, 1.2, 0.05)
thump(E['c5'] + 0.15, 0.3, 160, 30); thump(E['c5'] + 0.35, 0.25, 90, 25)  # cab door slams, driver lands
for k in range(6): thump(E['c5'] + 0.5 + k * 0.22, 0.15, 115, 35)
i0 = int(E['c3'] * SR); i1 = int(E['optA'] + 9 * SR); idle = (np.sin(2 * np.pi * 38 * t) * 0.03 + ma(rng.normal(0, 1, N), 40) * 0.05)
rev = np.interp(t, [E['engine'] - 0.2, E['engine'] + 0.6, E['guard'], E['guard'] + 0.6], [1, 2.2, 2.2, 1])
out[i0:] += (np.sin(2 * np.pi * np.cumsum(38 * rev) / SR) * 0.03 + ma(rng.normal(0, 1, N), 40) * 0.05 * rev)[i0:] * np.clip((t[i0:] - E['c3']) * 2, 0, 1)  # truck engine
thump(E['engine'] - 0.15, 0.4, 60, 10)  # into gear
tone(E['guard'] + 0.1, 0.5, 2200, 0.012, 8); scrape(E['guard'] + 0.1, 0.6)  # brakes
for k in range(5): thump(E['steps'] + k * 0.32, 0.15, 120, 40)  # guard's footsteps
tone(E['torch'] + 0.05, 0.04, 3200, 0.03, 80)  # torch click
for k in range(5): thump(E['optA'] + 0.3 + k * 0.75, 0.45, 48); thump(E['optA'] + 0.55 + k * 0.75, 0.28, 45)  # heartbeat
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['comment'], 0.2, 880, 0.04, 12)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
