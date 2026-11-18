# Pick a planet (cozy pixel): chiptune-ish bed, per-planet ambience, verdict stings, Gen Z punchline pops
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
def sq(at, dur, f, amp, d=6):  # chiptune square note
    n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sign(np.sin(2 * np.pi * f * x)) * env(n, 0.002, d) * amp)
# soft chiptune bed (C major), muted during the planet 3 omen
omen0, omen1 = S0[6], wt(7, 'a')
beat = 0.6; prog_ = [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]]
for i, s_ in enumerate(np.arange(0, D - 0.4, beat)):
    if omen0 - 0.2 < s_ < omen1 + 0.3: continue
    ch = prog_[(i // 4) % 4]; sq(s_, 0.25, 440 * 2 ** ((ch[i % 3] - 69) / 12), 0.012, 10)
    if i % 4 == 0: tone(s_, 0.5, 440 * 2 ** ((ch[0] - 81) / 12), 0.03, 4)
lib = (S0[1], S0[3]); spr = (S0[3], S0[5]); mkt = (S0[7], S0[9]); isl = (S0[9], S0[11])
def band(a, b, y, fade=0.3): g = np.clip(np.minimum((t - a) / fade, (b - t) / fade), 0, 1); return y * g
out += band(*lib, (nz(D, 2) - nz(D, 8)) * 0.025)
out += band(*spr, ma(rng.normal(0, 1, N), 60) * 0.05 * (1 + 3 * ((t > wt(4, "it's")) & (t < S0[5]))))
out += band(*mkt, ma(rng.normal(0, 1, N), 12) * 0.012)
out += band(*isl, ma(rng.normal(0, 1, N), 80) * 0.06 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t)))
for k in range(int((lib[1] - lib[0]) / 0.3)): tone(lib[0] + 0.3 + k * 0.3 + rng.random() * 0.2, 0.03, 900 + rng.random() * 600, 0.006, 60)
# omen: low drone + reversed swell into "bad choice", heavy hit on the stamp
dr = band(omen0 - 0.1, omen1 + 0.6, (np.sin(2 * np.pi * 41 * t) * 0.07 + np.sin(2 * np.pi * 61.7 * t) * 0.04 + np.sin(2 * np.pi * 82.4 * t + np.sin(2 * np.pi * 0.3 * t)) * 0.03), 0.6); out += dr
bad = wt(6, 'bad'); m = int(1.0 * SR); x = np.arange(m) / SR; add(bad - 1.0, nz(1.0, 3) * (x / 1.0) ** 3 * 0.12); thump(bad, 0.9, 38, 5); sting(bad, 46, 0.12)
# market catch: the smile — one detuned music-box note
sm = wt(8, 'and'); tone(sm + 0.2, 1.6, 523, 0.04, 1.5); tone(sm + 0.2, 1.6, 540, 0.03, 1.5)
# verdict stings: good = up, not bad = flat, alright = mild up
for ci, notes in [(1, [72, 76, 79]), (3, [69, 69]), (9, [67, 72])]:
    for j, n in enumerate(notes): sq(S0[ci] + 0.05 + j * 0.09, 0.14, 440 * 2 ** ((n - 69) / 12), 0.05, 12)
for ci in (2, 4, 8, 10): thump(S0[ci] + 0.05, 0.4, 70, 20); sting(wt(ci, 'catch') + 0.3, 62, 0.05)
for k in range(4): tone(wt(9, 'dog') + 0.15 + k * 0.18, 0.06, 900 + k * 40, 0.03, 40)
tone(S0[5], 0.12, 1400, 0.06, 30); tone(wt(5, 'follow') + 0.2, 0.12, 2100, 0.05, 30)
for ci in (1, 3, 9): m = int(0.5 * SR); x = np.arange(m) / SR; add(S0[ci] + 0.6, np.sin(2 * np.pi * np.cumsum(300 + 900 * x) / SR) * np.hanning(m) * 0.03)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.3 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
