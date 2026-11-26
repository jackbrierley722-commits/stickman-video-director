# Stay-in-the-room soundtrack: low tense pulse, hallway panic, lock click, desk scrape, water filling, rustle, power-down, scratching; deep narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(29)
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
power = wt(5, 'out'); scr = wt(5, 'scratching')
lvl = np.interp(t, [0, 0.4, power - 0.1, power, power + 1.5, D - 1, D], [0, 1, 1, 0.2, 0.9, 0.9, 0])
beat = 0.75
pulse = (0.08 * np.sin(2 * np.pi * 46 * t) + 0.04 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3))
out += pulse * lvl
for i, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.5, [174.6, 164.8, 155.6, 164.8][i % 4], 0.045 * np.interp(b, [0, power, power + 1, D], [1, 0.3, 1, 1]), 1.2)
# hook: distant sirens + hallway panic
n = int(CL[0]['dur'] * SR); x = np.arange(n) / SR; f = 680 + 240 * np.sin(2 * np.pi * 0.45 * x); add(0.2, 0.03 * np.sin(2 * np.pi * np.cumsum(f) / SR))
ev = wt(0, 'everyone')
for s in np.arange(ev - 0.2, CL[1]['start'], 0.11): burst(s, 0.07, 0.07 * rng.uniform(0.5, 1), 3, 40)
burst(ev, 3.5, 0.06, 40, 0.4)
th = wt(0, "that's"); groan(th, 2.0, 0.18); groan(th + 0.6, 2.0, 0.12, 75)
# lock click + desk scrape
lk = wt(1, 'lock'); tone(lk + 0.3, 0.05, 2200, 0.2, 60); thump(lk + 0.32, 0.25, 300)
ps = wt(1, 'push'); n = int(1.6 * SR); x = np.arange(n) / SR; add(ps + 0.2, 0.18 * ma(np.sign(np.sin(2 * np.pi * np.cumsum(140 + 40 * np.sin(x * 20)) / SR)) + 0.5 * rng.normal(0, 1, n), 10) * np.hanning(n))
# silent: phone vibrate off blip, shoes
tone(wt(2, 'silent'), 0.12, 880, 0.08, 20); thump(wt(2, 'shoes') + 0.2, 0.2, 110); thump(wt(2, 'shoes') + 0.55, 0.2, 110)
# tap squeak then water filling (rising pitch bubbles)
tap = wt(3, 'taps'); burst(tap + 0.4, 0.6, 0.05, 2, 6)
fs = wt(3, 'fill'); fe = wt(3, 'fourteen') + 0.3
n = int((fe - fs) * SR); x = np.arange(n) / SR; cyc = (x * (14 / (fe - fs))) % 1
add(fs, 0.06 * ma(rng.normal(0, 1, n), 6) * (0.6 + 0.4 * np.sin(2 * np.pi * (300 + 900 * cyc) * x)))
for k in range(14): tone(fs + k * (fe - fs) / 14, 0.1, 520 + k * 25, 0.05, 25)
# food: drawer slide, rustles, tick for each logged item
burst(CL[4]['start'] + 0.7, 0.6, 0.12, 6, 5)
for nm in ['nine', 'four', 'jar']: tw_ = wt(4, nm); [burst(tw_ + i * 0.1, 0.1, 0.06, 1, 30) for i in range(4)]
for nm in ['nine', 'four', 'jar', 'write']: tone(wt(4, nm) - 0.1, 0.09, 990, 0.06, 20); tone(wt(4, nm), 0.09, 1320, 0.05, 20)
wr = wt(4, 'write')
for s in np.arange(wr, wr + 2.2, 0.05): burst(s, 0.04, 0.03, 1, 70)
# power down + city hum stops
n = int(1.0 * SR); x = np.arange(n) / SR; add(power - 0.1, 0.18 * np.sin(2 * np.pi * np.cumsum(240 * np.exp(-x * 3)) / SR) * np.exp(-x * 2.5)); thump(power, 0.6, 55)
out += 0.015 * np.sin(2 * np.pi * 50 * t) * (t < power) * (t > CL[1]['start'])
# scratching at the door to the end
for s in np.arange(scr - 0.1, D - 0.6, 0.09):
    if (s * 1.7) % 2 < 1.3: burst(s, 0.06, 0.06 * rng.uniform(0.4, 1), 1, 50)
groan(wt(6, 'comment') + 0.5, 2.5, 0.1, 70)
hb = scr + 0.5
while hb < D - 0.6: thump(hb, 0.28); thump(hb + 0.27, 0.18); hb += 0.85
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
