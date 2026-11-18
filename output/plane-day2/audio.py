# Day 2 soundtrack: tense drone + plucks, night forest, leaves, growl, running, footsteps; narrator on top -> mix.wav
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(12)
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
def pluck(f, dur=2.5, amp=0.12):
    n = int(SR * dur); p = int(SR / f); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n): y[i] = buf[i % p]; buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return amp * y
eyesT = wt(2, 'eyes'); runT = CL[3]['start']; campT = wt(3, 'camp'); stepsT = wt(6, 'footsteps')
lvl = np.interp(t, [0, 0.5, eyesT - 0.3, eyesT, eyesT + 0.1, runT + 0.2, D - 1, D], [0, 1, 1, 0.1, 0.1, 1, 1, 0])
dr = 0.06 * np.sin(2 * np.pi * 49 * t) + 0.045 * np.sin(2 * np.pi * 49.3 * t + 1) + 0.035 * np.sin(2 * np.pi * 73.4 * t)
out += dr * lvl * (0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * t))
notes = [196, 233.1, 293.7, 261.6, 196, 174.6, 233.1, 220]; k = 0; tt = 0.6
while tt < D - 3:
    if not (eyesT - 0.5 < tt < runT): add(tt, pluck(notes[k % 8], 2.2, 0.1))
    k += 1; tt += 2.2 if tt < runT else 1.5
for f in [196, 207.7, 293.7]: add(D - 4.6, pluck(f, 4.4, 0.1))
# crickets + wind all night
cr = sum(np.sin(2 * np.pi * fc * t) * (np.sin(2 * np.pi * 18 * t) > 0.6) * (np.sin(2 * np.pi * 0.9 * t + fc) > 0) for fc in [4300, 4700])
out += cr * 0.01 * np.interp(t, [0, eyesT - 0.5, eyesT, stepsT - 0.5, stepsT, D], [1, 1, 0, 0, 0, 0.6])
out += ma(rng.normal(0, 1, N), 70) * 0.07 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t))
# crunching leaves while walking
for s in np.arange(CL[0]['start'] + wt(0, 'head') - CL[0]['start'], CL[2]['start'] + 3.5, 0.55): burst(s, 0.18, 0.16, 2, 22)
# light blink: tiny tone; eyes reveal: sting + growl
n = int(0.5 * SR); x = np.arange(n) / SR; add(wt(2, 'blinks'), 0.05 * np.sin(2 * np.pi * 880 * x) * np.exp(-x * 8))
burst(eyesT - 0.05, 1.2, 0.7, 30, 3); thump(eyesT, 0.9, 40)
n = int(2.4 * SR); x = np.arange(n) / SR; f = 70 + 6 * np.sin(2 * np.pi * 7 * x); g = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + 0.4 * rng.normal(0, 1, n)
add(eyesT + 0.15, 0.22 * ma(g, 18) * np.hanning(n))
# running: fast footfalls + breathing
for s in np.arange(runT + 0.1, campT + 0.3, 0.19): burst(s, 0.1, 0.22, 2, 35)
for s in np.arange(runT + 0.2, campT + 0.6, 0.55): burst(s, 0.25, 0.05, 1, 10)
# supplies gone: low hit
thump(wt(4, 'gone') - 0.1, 0.6, 45)
# footsteps behind them — slow, heavy, getting closer
for i, s in enumerate(np.arange(stepsT - 0.2, CL[7]['start'] + 1.5, 0.75)): a = 0.12 + i * 0.05; burst(s, 0.22, a, 3, 16); thump(s, a, 70)
# heartbeat from footsteps to end
hb = stepsT
while hb < D - 0.5: thump(hb, 0.3); thump(hb + 0.27, 0.2); hb += 0.85
# final eyes: second sting
burst(CL[7]['start'] + wt(7, 'comment') - CL[7]['start'] + 0.4, 0.8, 0.35, 30, 4)
out *= np.interp(t, [0, 0.2, D - 1.2, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
