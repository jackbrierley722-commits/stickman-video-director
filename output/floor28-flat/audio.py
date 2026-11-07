# Flat version soundtrack: rain + thunder, TV alert tone, hallway panic beyond walls, lock, bookcase scrape, tap/water/bath, cupboards, pencil, power-down, scratching; deep narrator
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
power = wt(5, 'out'); scr = wt(5, 'scratching')
# rain bed all the way through
out += ma(rng.normal(0, 1, N), 3) * 0.035 + ma(rng.normal(0, 1, N), 40) * 0.05
# thunder at the same lightning times as the video
R0 = np.random.default_rng(0)
def mulberry_bolts():
    s = 31
    vals = []
    for _ in range(12):
        s = (s * 1664525 + 1013904223) % 4294967296; vals.append(s / 4294967296 * D)
    return vals
for b in mulberry_bolts(): burst(b + 0.4, 2.5, 0.35, 120, 1.4); thump(b + 0.4, 0.4, 35)
# low score
beat = 0.8
lvl = np.interp(t, [0, 0.4, power - 0.1, power, power + 1.5, D - 1, D], [0, 1, 1, 0.2, 0.9, 0.9, 0])
out += (0.07 * np.sin(2 * np.pi * 46 * t) + 0.035 * np.sin(2 * np.pi * 69 * t)) * (0.35 + 0.65 * np.exp(-((t % beat) / beat) * 3)) * lvl
for i, b in enumerate(np.arange(0.4, D, beat * 4)): tone(b, 2.8, [174.6, 164.8, 155.6, 164.8][i % 4], 0.04 * np.interp(b, [0, power, power + 1, D], [1, 0.3, 1, 1]), 1.1)
# TV emergency alert tone
for k in range(5): tone(0.3 + k * 0.6, 0.45, 853, 0.05, 1); tone(0.3 + k * 0.6, 0.45, 960, 0.05, 1)
# panic in the corridor beyond the walls (muffled)
ev = wt(0, 'everyone'); m = int((CL[1]['start'] - ev + 2) * SR); add(ev, 0.08 * ma(rng.normal(0, 1, m), 90) * np.minimum(1, np.arange(m) / SR))
for s in np.arange(ev, CL[1]['start'] + 1, 0.13): burst(s, 0.08, 0.05, 20, 30)
th = wt(0, "that's"); groan(th, 2.0, 0.12, 80)
# lock + bookcase scrape
lk = wt(1, 'lock'); tone(lk + 0.35, 0.05, 2000, 0.2, 60); thump(lk + 0.37, 0.25, 280)
ps = wt(1, 'push'); m = int(1.8 * SR); x = np.arange(m) / SR; add(ps, 0.16 * ma(np.sign(np.sin(2 * np.pi * np.cumsum(120 + 40 * np.sin(x * 18)) / SR)) + 0.5 * rng.normal(0, 1, m), 10) * np.hanning(m)); thump(ps + 1.8, 0.4, 60)
# silence: phone blip, shoes thud
tone(wt(2, 'phone') + 0.6, 0.12, 700, 0.07, 25); thump(wt(2, 'shoes') + 0.5, 0.25, 110); thump(wt(2, 'shoes') + 0.8, 0.22, 110)
# fridge hum until unplugged
fr = wt(2, 'unplug') + 0.5
out += (0.03 * np.sin(2 * np.pi * 100 * t) + 0.015 * np.sin(2 * np.pi * 200 * t)) * (t < fr) * (t > CL[1]['start'])
thump(fr, 0.35, 220); tone(fr, 0.05, 1500, 0.1, 50)
# tap, filling jugs, bath
tp = wt(3, 'taps'); fs = wt(3, 'fill'); bt = wt(3, 'bath'); fo = wt(3, 'fourteen')
m = int((bt - CL[3]['start']) * SR); add(CL[3]['start'], 0.05 * ma(rng.normal(0, 1, m), 4) * np.interp(np.arange(m) / SR, [0, tp - CL[3]['start'], tp - CL[3]['start'] + 1, 99], [1, 1, 0.5, 0.5]))
for k in range(14): tone(fs + k * (bt - fs) / 14, 0.12, 500 + k * 30, 0.05, 25)
m = int((fo - bt + 1) * SR); add(bt, 0.08 * ma(rng.normal(0, 1, m), 12) * np.minimum(1, np.arange(m) / SR * 3))
# cupboards, items, pencil
burst(CL[4]['start'] + 0.5, 0.5, 0.1, 6, 6); tone(CL[4]['start'] + 0.5, 0.3, 300, 0.04, 8)
for nm in ['nine', 'four', 'jar']:
    tw_ = wt(4, nm)
    for i in range(5): thump(tw_ + i * 0.08, 0.08, 400)
for nm in ['nine', 'four', 'jar', 'write']: tone(wt(4, nm) - 0.1, 0.09, 990, 0.05, 20); tone(wt(4, nm), 0.09, 1320, 0.04, 20)
wr = wt(4, 'write')
for s in np.arange(wr, wr + 3.0, 0.05): burst(s, 0.04, 0.03, 1, 70)
# power down
m = int(1.0 * SR); x = np.arange(m) / SR; add(power - 0.1, 0.18 * np.sin(2 * np.pi * np.cumsum(240 * np.exp(-x * 3)) / SR) * np.exp(-x * 2.5)); thump(power, 0.6, 55)
out += 0.012 * np.sin(2 * np.pi * 50 * t) * (t < power)
# scratching + heartbeat to the end
for s in np.arange(scr - 0.1, D - 0.6, 0.09):
    if (s * 1.7) % 2 < 1.3: burst(s, 0.06, 0.06 * rng.uniform(0.4, 1), 1, 50)
hb = scr + 0.5
while hb < D - 0.6: thump(hb, 0.28); thump(hb + 0.27, 0.18); hb += 0.85
groan(wt(6, 'comment') + 0.6, 2.5, 0.1, 70)
out *= np.interp(t, [0, 0.2, D - 0.9, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.5) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
