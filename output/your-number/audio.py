# Your own number: drone, phone buzzes, message pops, knocks, whisper reverb, footsteps, choice tick
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(44)
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
def sine(f, dur): x = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * x)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def buzz(at, n=2):
    for k in range(n): m = int(0.35 * SR); x = np.arange(m) / SR; add(at + k * 0.5, np.sign(np.sin(2 * np.pi * 165 * x)) * np.hanning(m) * 0.05)
def pop(at, f=1400): m = int(0.12 * SR); add(at, (sine(f, 0.12) + 0.5 * sine(f * 1.5, 0.12)) * env(m, 0.002, 30) * 0.08)
text = wt(0, 'text'); whatever = wt(0, 'whatever'); never = wt(1, 'never'); who = wt(2, 'who'); dots = wt(2, 'three'); its = wt(2, "it's"); twenty = wt(2, 'twenty'); please = wt(2, 'please')
lock = wt(3, 'lock'); c4 = CL[4]['start']; k = [wt(5, 'knock'), wt(5, 'knock', 1), wt(5, 'knock', 2)]; voice = wt(5, 'voice'); wh = CL[6]['start']; buzz7 = wt(7, 'buzzes'); dont = wt(7, "don't"); thats = wt(7, "that's"); i7 = wt(7, 'i')
stops = wt(8, 'stops'); and8 = wt(8, 'and'); towards = wt(8, 'towards'); opt = CL[9]['start']
lvl = np.interp(t, [0, 0.5, c4 - 0.2, c4, k[0] - 0.05, k[0], wh, CL[7]['start'], and8, D - 1, D], [0, 0.7, 0.9, 0.12, 0.12, 1.0, 1.1, 1.0, 1.2, 1.2, 0])
out += (0.06 * np.sin(2 * np.pi * 43 * t) + 0.035 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.11 * t)) + 0.018 * np.sin(2 * np.pi * 129 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * t)) * lvl
out += ma(rng.normal(0, 1, N), 50) * 0.035 * lvl
mel = [72, 75, 79, 78, 75, 72, 70, 71]
for i, s_ in enumerate(np.arange(1.0, c4 - 0.4, 0.8)):
    f = 440 * 2 ** ((mel[i % 8] - 69) / 12); n = int(0.9 * SR); add(s_, (sine(f, 0.9) + 0.3 * sine(f * 3.01, 0.9)) * env(n, 0.002, 5) * 0.026)
buzz(text - 0.15); pop(whatever - 0.1, 1200)
for i in range(3): add(never + i * 0.12, sine(300 - i * 60, 0.15) * env(int(0.15 * SR), 0.002, 20) * 0.08)
for i in range(12): add(CL[2]['start'] + 0.4 + i * 0.07, nz(0.02) * env(int(0.02 * SR), 0.0005, 200) * 0.05)
pop(who - 0.05, 1600)
for s_ in np.arange(dots, its, 0.3): add(s_, sine(900, 0.05) * env(int(0.05 * SR), 0.001, 60) * 0.03)
for s_ in (its, twenty, please): pop(s_ - 0.05, 1200)
# deadbolt
add(lock + 0.05, nz(0.15, 2) * env(int(0.15 * SR), 0.001, 30) * 0.2); thump(lock + 0.18, 0.4, 140, 40)
# clock ticks in the silence
for s_ in np.arange(c4 + 0.1, k[0] - 0.3, 0.5): add(s_, nz(0.015) * env(int(0.015 * SR), 0.0005, 200) * 0.07)
# knocks: wood + low body
for s_ in k:
    for d_, a_ in ((0, 1.0), (0.12, 0.6)): thump(s_ + d_, 0.7 * a_, 85, 30); add(s_ + d_, nz(0.06, 3) * env(int(0.06 * SR), 0.001, 50) * 0.25 * a_)
# stinger on 'your own'
m = int(2.2 * SR); x = np.arange(m) / SR; add(voice + 1.3, (np.sin(2 * np.pi * 98 * x) + np.sin(2 * np.pi * 103.8 * x) + 0.5 * np.sin(2 * np.pi * 196 * x)) * env(m, 0.01, 1.3) * 0.07)
# phone buzz again + pops
buzz(buzz7 - 0.1); [pop(s_ - 0.05, 1000) for s_ in (dont, thats, i7)]
# footsteps leaving, slow
for i, s_ in enumerate(np.arange(and8 + 0.3, opt - 0.3, 0.62)):
    thump(s_, 0.25, 70, 35); add(s_, nz(0.05, 4) * env(int(0.05 * SR), 0.001, 60) * 0.1); add(s_ + 0.03, nz(0.2, 30) * env(int(0.2 * SR), 0.01, 12) * 0.05)
# choice: ticking + rising tone
for s_ in np.arange(opt, D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
m = int((D - opt) * SR); x = np.arange(m) / SR; add(opt, np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
# whisper line gets a small-room echo
a0, a1 = int(wh * SR), int(CL[7]['start'] * SR); seg = vo[a0:a1].copy(); echo = np.zeros_like(seg); d = int(0.07 * SR); echo[d:] += seg[:-d] * 0.35; d2 = int(0.15 * SR); echo[d2:] += seg[:-d2] * 0.2; vo[a0:a1] = seg * 1.3 + echo
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
