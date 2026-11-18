# Prison escape Part 6 (vote B, through the gate): SFX + low music bed, under the narration
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
E = dict(c1=S0[1], id=wt(1, 'handed'), lifted=wt(2, 'then', 1), c3=S0[3], swap=wt(3, 'swap'), c4=S0[4], ditch=wt(4, 'you'), c5=S0[5], sirens=wt(5, 'sirens'), c6=S0[6], window=wt(6, 'the'), c7=S0[7], dex=wt(7, 'dex'),
         optA=S0[8], optB=wt(8, 'option', 1), comment=wt(8, 'comment'))
out += (nz(D, 2) - nz(D, 10)) * 0.01 + nz(D, 60) * 0.015  # night air
def clunk(at): thump(at, 0.5, 120, 40); tone(at, 0.06, 900, 0.03, 50)
def scrape(at, dur=0.35, amp=0.05): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 5)) * np.hanning(m) * amp)
def rustle(at, dur=0.8, amp=0.06): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 3)) * np.abs(np.sin(np.linspace(0, 7 * np.pi, m))) * np.hanning(m) * amp)
# truck engine: driving (clip 0 and 2 end), idling at gate, pulled over, off at the ditch
lvl = np.interp(t, [0, E['c1'] - 0.1, E['c1'], E['lifted'], E['lifted'] + 0.8, E['c3'] - 0.1, E['c3'], E['c4'] - 0.3, E['c4']], [2.0, 2.0, 1.0, 1.0, 2.0, 2.0, 0.8, 0.8, 0])
eng = (np.sin(2 * np.pi * np.cumsum(36 * lvl) / SR) * 0.03 + ma(rng.normal(0, 1, N), 40) * 0.05 * lvl) * (lvl > 0)
road = (nz(D, 3) - nz(D, 25)) * 0.02 * np.clip(lvl - 1, 0, 1); out += eng + road
tone(E['c1'] + 0.05, 0.5, 2200, 0.01, 8)  # brakes at the gate
scrape(E['id'] + 0.1, 0.25, 0.03)  # card passed over
creak(E['lifted'] + 0.05, 0.9, 180, 0.05); clunk(E['lifted'] + 0.95)  # barrier lifts
thump(E['c3'] + 0.2, 0.3, 60, 12)  # handbrake
rustle(E['c3'] + 1.0, 1.4, 0.05); rustle(E['swap'] - 0.1, 1.2, 0.07)  # digging through laundry bags, changing
thump(E['c4'] - 0.2, 0.25, 160, 30); thump(E['ditch'] + 0.2, 0.3, 90, 20)  # door, truck into the bushes
for k in range(4): rustle(E['ditch'] + 0.4 + k * 0.3, 0.25, 0.04)  # branches
# footsteps on gravel while walking (clips 4-6)
st = E['ditch'] + 0.8
while st < E['window'] - 0.2: add(st, (nz(0.08, 1) - nz(0.08, 4)) * env(int(0.08 * SR), 0.002, 40) * 0.06); st += 0.48
# sirens far behind
i0 = int((E['sirens'] - 0.3) * SR); xx = np.arange(N - i0) / SR; f = 700 + 250 * np.sin(2 * np.pi * 0.35 * xx)
out[i0:] += np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.012 * np.clip(xx * 0.8, 0, 1)
# car approaches from behind and stops
n = int((E['window'] - E['c6'] + 0.4) * SR); x = np.arange(n) / SR; k = x / x[-1]; ce = np.clip(k * 1.2, 0, 1) ** 2 * (1 - np.clip((k - 0.85) * 6, 0, 1) * 0.6)
add(E['c6'] - 0.4, ((nz(n / SR, 3) - nz(n / SR, 30)) * 0.08 + np.sin(2 * np.pi * np.cumsum(42 + 20 * (1 - k)) / SR) * 0.03) * ce)
tone(E['window'] - 0.15, 0.4, 1800, 0.008, 6)  # brakes
i1 = int((E['window'] - 0.1) * SR); out[i1:] += np.sin(2 * np.pi * 34 * t[i1:]) * 0.02 + ma(rng.normal(0, 1, N - i1), 50) * 0.03  # car idling
m = int(0.9 * SR); x = np.arange(m) / SR; add(E['window'] + 0.05, (np.sign(np.sin(2 * np.pi * 120 * x)) * 0.5 + nz(0.9, 4)) * np.hanning(m) * 0.02)  # window motor
sting(E['dex'], 98, 0.08)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['comment'], 0.2, 880, 0.04, 12)
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
