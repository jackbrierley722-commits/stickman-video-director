# Your number part 4: drone, rewind tape, wardrobe burst, running steps, ceiling skitter, chain + lock, clock flip, corridor buzz, phone buzz
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
def tone(at, dur, f, amp, d=6): n = int(dur * SR); add(at, sine(f, dur) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def sweep(at, dur, f0, f1, amp):
    n = int(dur * SR); f = np.linspace(f0, f1, n); add(at, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(n) * amp)
def creak(at, dur=1.0, f0=200, amp=0.07):
    m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 70 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
def buzz(at, n=2):
    for k in range(n): m = int(0.35 * SR); x = np.arange(m) / SR; add(at + k * 0.5, np.sign(np.sin(2 * np.pi * 165 * x)) * np.hanning(m) * 0.05)
def whoosh(at, amp=0.05):
    m = int(0.45 * SR); x = np.linspace(0, 1, m); n = nz(0.45, 1); lo = ma(n, 3); hi = n - ma(n, 12)
    add(at - 0.3, (lo * x + hi * (1 - x) * 0.6) * np.sin(np.pi * x) ** 2 * amp * 3)
E = dict(open0=wt(0, 'open'), already=wt(0, 'and'), rewind=wt(1, "let's"), burst=CL[2]['start'], misses=wt(2, 'misses'), run3=wt(3, 'you', 2), bed=wt(3, "she's"), mister=wt(3, 'mister'), rule=CL[4]['start'], real=wt(4, 'so'), like=wt(4, 'like'),
         behind=CL[5]['start'], ceiling=wt(5, 'on'), grab=CL[6]['start'], front=wt(6, 'front'), chain=wt(6, 'chain'), lock=wt(6, 'lock'), becomes=wt(6, 'becomes'), open7=CL[7]['start'], there=wt(7, 'and'), texting=wt(7, 'the', 1), w8=CL[8]['start'], optA=CL[9]['start'], optB=wt(9, 'option', 1), comment=wt(9, 'comment'), follow=wt(9, 'follow'))
# drone bed, drops for the reveal, corridor fluorescent buzz in door shots
lvl = np.interp(t, [0, 0.3, E['there'] - 0.4, E['there'], E['w8'], E['optA'], D], [0.9, 1, 1, 0.3, 0.3, 1.1, 1.2])
out += (0.055 * np.sin(2 * np.pi * 43 * t) + 0.03 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.11 * t)) + 0.015 * np.sin(2 * np.pi * 129 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.17 * t)) * lvl
door = ((t > E['open0']) & (t < E['rewind'])) | ((t > E['open7'] + 0.3) & (t < E['texting'])) | (t > E['w8']) & (t < E['optA'])
out += np.sign(np.sin(2 * np.pi * 120 * t)) * 0.006 * door
# hook: door unlock + creak, sting on "already standing outside"
thump(E['open0'] - 0.3, 0.3, 300, 50); creak(E['open0'], 1.0, 190, 0.06); sting(E['already'] + 0.2, 82, 0.08)
# rewind: tape spin-down + reverse whoosh (a transition that earns a sound)
sweep(E['rewind'] - 0.2, 1.4, 1800, 200, 0.05); m = int(1.3 * SR); add(E['rewind'], (nz(1.3) - nz(1.3, 6))[::-1] * np.linspace(0, 1, m) ** 2 * 0.05)
# wardrobe burst, grab miss
thump(E['burst'] + 0.1, 0.8, 70, 14); add(E['burst'] + 0.1, nz(0.3, 2) * env(int(0.3 * SR), 0.001, 14) * 0.2); whoosh(E['misses'], 0.06)
for s_ in np.arange(E['burst'] + 0.4, E['run3'] + 1.5, 0.28): thump(s_, 0.25, 90, 40)
# under the bed: soft music-box hint of the teddy name
for k, m_ in enumerate([76, 79, 84]): tone(E['mister'] + k * 0.18, 0.9, 440 * 2 ** ((m_ - 69) / 12), 0.03, 4)
sting(E['rule'] + 0.1, 98, 0.05); tone(E['real'] + 0.3, 0.6, 523, 0.03, 4)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
# copy running, then skittering on the ceiling
for s_ in np.arange(E['behind'] + 0.3, E['ceiling'], 0.32): thump(s_, 0.2, 80, 40)
for s_ in np.arange(E['ceiling'] - 0.1, E['grab'] + 1.0, 0.07): add(s_ + rng.random() * 0.02, nz(0.012) * env(int(0.012 * SR), 0.0005, 300) * 0.07)
sting(E['ceiling'], 65, 0.08)
for s_ in np.arange(E['grab'], E['front'], 0.24): thump(s_, 0.25, 90, 40)
# chain rattle, lock clunk
for k in range(9): tone(E['chain'] + k * 0.035, 0.08, 2600 + (k % 3) * 500, 0.03, 40)
thump(E['lock'] + 0.05, 0.6, 140, 30); tone(E['lock'] + 0.05, 0.08, 1800, 0.05, 50)
# clock flip 4.19 -> 4.20: tick, flip clack, low hit
for k in range(4): tone(wt(6, 'four') + k * 0.4, 0.04, 1500, 0.05, 70)
add(E['becomes'] + 0.35, nz(0.05, 2) * env(int(0.05 * SR), 0.001, 80) * 0.2); thump(E['becomes'] + 0.4, 0.8, 40, 8); sting(E['becomes'] + 0.4, 55, 0.08)
# door opens again: creak + reveal sting
creak(E['open7'] + 0.2, 1.1, 170, 0.06); sting(E['there'], 73, 0.09); thump(E['there'], 0.5, 42)
buzz(E['texting'] - 0.3, 2)
# whisper bed
m = int((E['optA'] - E['w8'] + 0.2) * SR); add(E['w8'] - 0.1, (rng.normal(0, 1, m) - ma(rng.normal(0, 1, m), 6)) * 0.01 * np.hanning(m))
# choice: tick, rising tone, follow pop
for s_ in np.arange(E['optA'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.07)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12)
m = int((D - E['optA']) * SR); x = np.arange(m) / SR; add(E['optA'], np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
tone(E['follow'], 0.12, 1400, 0.06, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.04, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
a0, a1 = int(CL[8]['start'] * SR), int((CL[8]['start'] + CL[8]['dur']) * SR); seg = vo[a0:a1].copy(); ech = np.zeros_like(seg); d = int(0.08 * SR); ech[d:] += seg[:-d] * 0.35; vo[a0:a1] = seg * 1.4 + ech
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
