# Day 6 soundtrack: helicopter, safe zone crowd, scanner, phone, night pulse, groans, torch clicks; narrator on top
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
seat = wt(0, 'seat'); like = wt(0, 'like'); fences = wt(2, 'fences'); everyone = wt(2, 'everyone'); no3 = wt(3, 'no'); rule = wt(4, 'rule'); charges = wt(4, 'charges'); one4 = wt(4, 'one'); fly = wt(6, "i'll"); midnight = wt(7, 'midnight'); heli7 = wt(7, 'helicopter'); below = wt(7, 'below')
but8 = wt(8, 'but'); light8 = wt(8, 'light'); mia8 = wt(8, "it's"); comment = wt(9, 'comment')
out += ma(rng.normal(0, 1, N), 40) * 0.02
# helicopter: loud in the hook + stadium landing, quiet in the tent, back at night (muffled at first)
hl = np.interp(t, [0, 0.4, c[1], c[2], fences, fences + 1, c[3], c[7], heli7 + 1.2, heli7 + 2, c[8], D - 0.5, D], [0.6, 1.4, 1.2, 1.0, 0.9, 0.4, 0, 0, 0.2, 1.0, 0.8, 0.8, 0])
out += heliN(hl)
# music: hopeful pad by day, tense pulse at night
beat = 0.6
lvlD = np.interp(t, [0, 0.5, c[3] - 0.2, c[3], c[6], c[7] - 0.3, c[7], D], [0, 0.6, 0.6, 0.3, 0.4, 0.6, 0, 0])
lvlN = np.interp(t, [0, c[7] - 0.2, c[7] + 0.5, D - 1, D], [0, 0, 1.0, 1.2, 0])
for i_, b in enumerate(np.arange(0.2, D, beat * 4)): tone(b, 2.4, [196.0, 174.6, 164.8, 174.6][i_ % 4], 0.05 * float(np.interp(b, t, lvlD) + 0.4 * np.interp(b, t, lvlN)), 1.2)
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvlN
# crowd murmur at the safe zone
out += ma(rng.normal(0, 1, N), 8) * 0.03 * np.interp(t, [c[2], c[2] + 1, c[3] - 0.5, c[3]], [0, 1, 1, 0]) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
# scanner beep at the bite check
for i in range(4): tone(everyone + 0.4 + i * 0.3, 0.12, 1800 if i < 3 else 2600, 0.06, 12)
# commander's no: low hit
thump(no3, 0.6, 45)
# phone power-on chime + message buzz
for i, f in enumerate([523, 659, 784]): tone(charges + 1 + i * 0.12, 0.3, f, 0.05, 8)
for k_ in range(2): m = int(0.3 * SR); x = np.arange(m) / SR; add(one4 - 0.1 + k_ * 0.45, 0.08 * np.sign(np.sin(2 * np.pi * 150 * x)) * np.hanning(m))
# music box for Mia's message
for k_, f in enumerate([784, 659, 587, 523, 587, 659]): tone(c[5] + 0.2 + k_ * 0.45, 0.6, f, 0.04, 3)
# "I'll fly you" rising chord
for f in (392, 494, 587): tone(fly, 2.0, f, 0.035, 1.5)
# night: distant groans + city drone
for g_ in range(10): groan(below + g_ * 0.55, 1.5, 0.06, 60 + g_ * 6)
# torch flashes: clicks on On / Off / On
for w_ in (wt(8, 'on', 1), wt(8, 'off'), wt(8, 'on', 2)): tone(w_, 0.04, 3200, 0.08, 80)
tone(mia8, 2.5, 523, 0.04, 1.4); tone(mia8, 2.5, 659, 0.035, 1.4)
# choice riser
m = int(1.0 * SR); x = np.arange(m) / SR; add(comment - 0.6, 0.12 * ma(rng.normal(0, 1, m), 8) * (x / x[-1]) ** 2)
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
