# Source Code recap: train rumble, explosions, capsule hum, glitches, countdown ticks, tense pulse
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
def band(a, b, y, fade=0.2): g = np.clip(np.minimum((t - a) / fade, (b - t) / fade), 0, 1); return y * g
trainI = [(0, S0[1]), (S0[2], S0[4]), (wt(5, 'over') - 0.15, S0[6]), (S0[8], S0[9]), (S0[11], wt(11, 'the')), (S0[15], wt(16, 'everything')), (S0[18] + 1.2, S0[19]), (S0[20], D)]
cap = [(S0[4], wt(5, 'over') - 0.15), (S0[6], S0[7]), (S0[9], S0[10]), (wt(10, 'the', 1), S0[11]), (S0[13], S0[15]), (S0[19], S0[20])]
rum = ma(rng.normal(0, 1, N), 40) * 0.05 * (1 + 0.3 * np.sin(2 * np.pi * 1.6 * t)); clack = np.zeros(N)
for s_ in np.arange(0, D, 0.55): i = int(s_ * SR); clack[i:i + 800] += np.exp(-np.arange(800) / 120) * np.sin(np.arange(800) * 0.3) * 0.08; i2 = int((s_ + 0.12) * SR); clack[i2:i2 + 800] += np.exp(-np.arange(800) / 120) * np.sin(np.arange(800) * 0.25) * 0.06
for a, b in trainI: out += band(a, b, rum + clack)
hum = np.sin(2 * np.pi * 55 * t) * 0.03 + np.sin(2 * np.pi * 110 * t) * 0.012 + ma(rng.normal(0, 1, N), 8) * 0.006
for a, b in cap: out += band(a, b, hum)
# lab: slow heartbeat monitor
for s_ in np.arange(S0[10] + 0.3, wt(10, 'the', 1), 0.9): tone(s_, 0.12, 1000, 0.03, 20)
# tense pulse, quieter in the ending, a warm chord in the new world
for s_ in np.arange(0, D - 0.3, 0.5):
    if not (S0[17] < s_ < S0[20]): thump(s_, 0.12, 52, 18)
lvl = np.interp(t, [0, S0[3], wt(3, 'explodes'), S0[4], S0[10], S0[11], S0[16], S0[17], S0[18], D], [0.6, 0.9, 1.2, 0.5, 1.2, 0.8, 1.2, 0.2, 0.2, 0.8]); out += (0.03 * np.sin(2 * np.pi * 41 * t) + 0.02 * np.sin(2 * np.pi * 61.7 * t)) * lvl
for k, n in enumerate([60, 64, 67, 72]): tone(S0[17] + 0.9 + k * 0.08, 5.5, 440 * 2 ** ((n - 69) / 12), 0.025, 0.6)
for k, n in enumerate([62, 65, 69, 74]): tone(S0[18] + 4.0 + k * 0.08, 4.0, 440 * 2 ** ((n - 69) / 12), 0.02, 0.8)
def boom(at, amp=1.0): m = int(2.5 * SR); x = np.arange(m) / SR; add(at, nz(2.5, 30) * 7 * np.exp(-x * 2.2) * (1 - np.exp(-x * 60)) * amp); thump(at, 1.0 * amp, 36, 4); add(at, nz(0.3, 2) * env(int(0.3 * SR), 0.001, 12) * 0.2 * amp)
boom(wt(0, 'again') + 0.25, 0.6); boom(wt(3, 'explodes') + 0.1, 1.0); boom(wt(5, 'over') + 0.05, 0.4); boom(wt(5, 'over', 1) + 0.05, 0.4); boom(wt(8, 'and') + 0.05, 0.5)
for k in range(int((S0[1] - 0.2) / 1.0)): tone(0.2 + k * 1.0, 0.05, 1500, 0.015, 50)
tone(S0[1] + 0.05, 1.4, 220, 0.04, 2); tone(S0[1] + 0.05, 1.4, 329, 0.03, 2)
m = int(0.4 * SR); add(wt(3, 'same') + 0.3, nz(0.4, 3) * env(m, 0.01, 8) * 0.06)
sting(wt(3, 'then'), 55, 0.1); sting(wt(10, 'colter'), 50, 0.12); thump(wt(10, 'colter'), 0.7, 40, 6)
def glitch(at, d=0.35, amp=0.05): m = int(d * SR); x = np.arange(m) / SR; add(at, np.sign(np.sin(2 * np.pi * (300 + 900 * (np.floor(x * 30) % 5)) * x)) * amp * np.hanning(m))
for c in S0[2:]: glitch(c - 0.05, 0.16, 0.025)
glitch(S0[9], 0.6, 0.06); glitch(S0[13], 1.2, 0.05)
sting(wt(11, 'derek'), 70, 0.08)
for k in range(10): f = 700 + 250 * np.sin(k); tone(S0[12] + k * 0.45, 0.4, 880 if k % 2 else 660, 0.025, 3)  # sirens
tone(S0[7], 0.12, 1400, 0.06, 30); tone(wt(7, 'follow') + 0.2, 0.12, 2100, 0.05, 30)
for d_ in (0, 0.25): tone(S0[15] + 1.0 + d_, 0.06, 2200, 0.04, 40)  # snip snip: bomb disarmed
fr = wt(16, 'everything'); m = int(0.6 * SR); x = np.arange(m) / SR; add(fr - 0.1, np.sin(2 * np.pi * np.cumsum(400 * np.exp(-x * 4)) / SR) * np.exp(-x * 3) * 0.08); thump(fr, 0.6, 50, 6)
tone(wt(17, 'it') - 0.05, 0.3, 1200, 0.04, 8)
for k in range(3): tone(S0[19] + 0.3 + k * 0.12, 0.1, 1800 + k * 300, 0.03, 30)  # message ping
sting(wt(19, 'yet'), 62, 0.08)
tone(wt(20, 'comment'), 0.2, 660, 0.05, 12)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
