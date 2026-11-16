# How NOT to hide a body: SFX only (no music), all under the narration; the swear is bleeped
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(7)
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
def siren(a, b, amp=0.025):
    i0, i1 = int(a * SR), min(N, int(b * SR)); x = np.arange(i1 - i0) / SR; f = 700 + 250 * (np.sin(2 * np.pi * 1.5 * x) > 0); y = np.sin(2 * np.pi * np.cumsum(f) / SR); e = np.minimum(1, np.minimum(x / 0.3, (x[-1] - x) / 0.3 + 1e-9)).clip(0, 1); out[i0:i1] += y * e * amp
def stamp(at): thump(at, 0.7, 70, 14); add(at, nz(0.08, 2) * env(int(0.08 * SR), 0.001, 40) * 0.12); tone(at + 0.02, 0.35, 220, 0.05, 8)
S0 = [c['start'] for c in CL]
hide = wt(0, "here's")[0]; bury = wt(1, 'bury')[0]; dog = wt(1, 'next')[0]; fisher = wt(2, 'a')[0]; power = wt(3, 'then')[0]; smell = wt(3, 'and')[0]
comment = wt(4, 'comment')[0]; posts = wt(5, 'your')[0]; hand = wt(5, "there's")[0]; still = wt(6, 'but')[0]; fk = wt(6, 'fucking'); caught = S0[7]; dont = wt(7, "don't")[0]
# frame 1: police already there
siren(0, hide + 0.3, 0.02); stamp(0.05)
# backyard dig
for k in range(int((dog - bury) / 0.45)): add(bury + 0.1 + k * 0.45, (nz(0.18, 3) - nz(0.18, 12)) * env(int(0.18 * SR), 0.005, 12) * 0.12)
for k in range(6): tone(dog + 0.2 + k * 0.32, 0.12, 900, 0.025, 25)  # dog yaps
siren(dog + 0.4, S0[2] - 0.1, 0.02); stamp(dog + 0.3)
# lake
whoosh(fisher - 0.7, 0.08, 0.5); thump(fisher - 0.2, 0.5, 60, 10); add(fisher - 0.2, (nz(0.6, 2) - nz(0.6, 9)) * env(int(0.6 * SR), 0.005, 5) * 0.12)  # splash
for k in range(14): tone(fisher + k * 0.12, 0.05, 2200, 0.012, 60)  # reel clicking
stamp(fisher + 1.6)
# freezer
thump(S0[3] + 0.9, 0.4, 90, 25)  # lid slam
thump(power, 0.6, 45, 8); tone(power, 0.4, 120, 0.03, 6)  # power cut
for k in range(4): thump(smell + 0.05 + k * 0.18, 0.25, 160, 40)  # knock knock
siren(smell + 0.3, S0[4] - 0.1, 0.02); stamp(smell + 0.6)
tone(S0[4] + 0.1, 0.12, 1400, 0.05, 30); tone(S0[4] + 0.16, 0.12, 2100, 0.035, 30); tone(comment, 0.2, 990, 0.04, 12)
# driveway
for k in range(int((posts - S0[5]) / 0.4)): add(S0[5] + 0.2 + k * 0.4, (nz(0.25, 2) - nz(0.25, 10)) * env(int(0.25 * SR), 0.01, 8) * 0.07)  # trowel scrapes
tone(posts + 0.1, 0.15, 1800, 0.03, 30); tone(posts + 0.3, 0.2, 2400, 0.03, 20)  # camera + post ping
siren(hand + 0.5, D - 0.6, 0.022); stamp(hand + 0.8)
# rage: stomps
for k in range(8): thump(S0[6] + 0.1 + k * 0.3, 0.35, 70, 25)
tone(caught + 0.05, 0.08, 2600, 0.04, 40); tone(caught + 0.12, 0.08, 2200, 0.04, 40)  # handcuffs click
thump(dont, 0.4, 60, 12)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
# bleep the swear: silence the word and put a 1 kHz tone at voice level in its place
a, b = int((fk[0] - 0.02) * SR), int((fk[1] + 0.02) * SR); lvl = np.percentile(np.abs(vo[max(0, a - SR):a]), 99) if a > 0 else 0.3
x = np.arange(b - a) / SR; vo[a:b] = np.sin(2 * np.pi * 1000 * x) * lvl * 0.55 * np.minimum(1, np.minimum(x / 0.005, (x[-1] - x) / 0.005 + 1e-9))
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2), 'bleep at', fk)
