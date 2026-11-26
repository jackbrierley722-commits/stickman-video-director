# Day 7 finale: helicopter hover, glass shatter, door crash, slow-mo heartbeat, relief, sunrise theme; narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(31)
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
def add(at, y):
    i = int(at * SR)
    if 0 <= i < N: out[i:i + len(y)] += y[:N - i]
def burst(at, dur, amp, k=8, decay=8):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, ma(rng.normal(0, 1, n), k) * amp * np.exp(-x * decay))
def thump(at, amp=0.5, f=48):
    n = int(0.3 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 20))
def tone(at, dur, f, amp, decay=4):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x) * np.exp(-x * decay))
def groan(at, dur=1.8, amp=0.15, f0=90):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + 8 * np.sin(2 * np.pi * 5 * x) - 12 * x; g = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + 0.3 * rng.normal(0, 1, n); add(at, amp * ma(g, 22) * np.hanning(n))
def heliN(amp_env):
    blade = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9.5 * t)); return 0.13 * ma(rng.normal(0, 1, N), 30) * blade * amp_env
c = [cl['start'] for cl in CL]
w = lambda ci, word, n=0: wt(ci, word, n)
torch = w(2, 'torch'); swing = w(3, 'swing'); expl = w(3, 'explodes'); door = w(4, 'bursts'); jumps = w(5, 'jumps'); catch = w(5, 'catches'); away = w(6, 'away'); hands = w(6, 'and'); gives = w(7, 'gives'); seven = w(8, 'seven'); one8 = w(8, 'one'); rules = w(9, 'rules'); thanks = w(9, 'thanks')
out += ma(rng.normal(0, 1, N), 40) * 0.02
# helicopter hovering throughout the rescue, cabin muffled, landing at dawn
hl = np.interp(t, [0, 0.4, c[7] - 0.3, c[7], c[8], c[8] + 0.5, seven, seven + 1.5, D], [0.9, 1.1, 1.1, 0.35, 0.35, 1.0, 0.8, 0.1, 0.05])
out += heliN(hl)
# tense pulse until the catch, then warm resolution
lvlN = np.interp(t, [0, 0.5, jumps, jumps + 0.3, catch, catch + 0.3, c[7], D], [0, 1, 1, 0.15, 0.15, 1.1, 0, 0])
beat = 0.5
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvlN
# slow-motion heartbeat during the jump
hb = jumps
while hb < catch: thump(hb, 0.5); thump(hb + 0.3, 0.3); hb += 1.1
m = int((catch - jumps) * SR); xx = np.arange(m) / SR; add(jumps, ma(rng.normal(0, 1, m), 60) * 0.12 * np.sin(np.pi * xx / xx[-1]))
# axe swing + glass shatter
burst(swing - 0.15, 0.2, 0.25, 6, 4); thump(expl, 0.5, 60)
for k in range(40): tone(expl + rng.uniform(0, 0.6), 0.15, rng.uniform(2500, 6000), 0.03, 25)
burst(expl, 0.4, 0.4, 1, 10)
# door crash + groans
thump(door, 0.7, 45); burst(door, 0.25, 0.4, 3, 12)
for g_ in range(6): groan(door + 0.4 + g_ * 0.5, 1.4, 0.1, 60 + g_ * 8)
for g_ in range(5): groan(hands + g_ * 0.4, 1.2, 0.08, 70 + g_ * 6)
# the catch: hit + relief chord
thump(catch, 0.6, 50); [tone(catch + 0.05 + i * 0.05, 2.0, f, 0.04, 1.6) for i, f in enumerate([392, 494, 587])]
# warm music box for the chocolate, then a hopeful sunrise theme to the end
for k_, f in enumerate([784, 659, 587, 523, 587, 659, 784, 880]): tone(gives - 0.8 + k_ * 0.45, 0.8, f, 0.045, 3)
for i_, b in enumerate(np.arange(c[8], D - 0.5, 0.5)):
    ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]][(i_ // 4) % 4]
    for n in ch: tone(b, 0.9, 440 * 2 ** ((n - 69) / 12), 0.022, 2.5)
    if i_ % 2 == 0: tone(b, 0.5, 440 * 2 ** ((ch[0] - 81) / 12), 0.07, 5)
for f in (523, 659, 784, 1047): tone(seven, 2.5, f, 0.03, 1.2)
# crowd cheer at the landing
out += ma(rng.normal(0, 1, N), 6) * 0.05 * np.interp(t, [one8 - 0.2, one8 + 0.3, c[9] + 1, c[9] + 2], [0, 1, 0.6, 0])
for r_ in (w(9, "don't"), w(9, 'stay'), w(9, 'know'), w(9, 'and')): tone(r_, 0.2, 1200, 0.05, 15)
for f in (392, 523, 659, 784): tone(thanks, 3.0, f, 0.035, 1.0)
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
