# 429A part 3: knocks, peephole reveal, flashback, phone line + front desk ring, time glitch, notes flurry, handwriting sting
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(429)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'" or ch == '.') .strip('.') == word.strip('.'):
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
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def ring(at, dur, amp=0.05, muffle=1):
    s_ = at
    while s_ < at + dur:
        m = int(min(1.0, at + dur - s_) * SR); x = np.arange(m) / SR; trem = (np.sin(2 * np.pi * 20 * x) > 0).astype(float)
        sig = (np.sin(2 * np.pi * 1020 * x) + 0.8 * np.sin(2 * np.pi * 1280 * x)) * trem * env(m, 0.003, 0.5); add(s_, ma(sig, muffle) * amp); s_ += 1.6
def knock(at, amp=0.7): thump(at, amp, 110, 30); add(at, nz(0.06, 3) * env(int(0.06 * SR), 0.001, 60) * 0.15)
S0 = [c['start'] for c in CL]
E = dict(knock=wt(0, 'someone'), looks=wt(0, 'he'), isleo=wt(0, 'is', 2), tag=wt(1, 'same', 1), earlier=wt(1, "it's"), hook=S0[2], lifts=wt(2, 'he'), through=wt(2, 'through'), front=wt(2, 'the', 2), call=S0[3], coming=wt(3, "it's"), always=wt(3, 'it', 1),
         like=S0[4], desk=S0[5], wet=wt(5, 'the', 3), wrote=S0[6], hundreds=wt(6, 'maybe'), book=S0[7], same7=wt(7, 'the'), leos=wt(7, "leo's"), optA=S0[8], optB=wt(8, 'option', 1), comment=wt(8, 'comment'))
# bed: hotel drone, drops on the reveal
lvl = np.interp(t, [0, 0.3, E['isleo'] - 0.3, E['isleo'], E['isleo'] + 1.5, D], [0.8, 1, 1, 0.2, 1, 1.1])
out += (0.05 * np.sin(2 * np.pi * 41 * t) + 0.028 * np.sin(2 * np.pi * 61.5 * t + np.sin(2 * np.pi * 0.09 * t)) + 0.012 * np.sin(2 * np.pi * 123 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)) * lvl
out += ma(rng.normal(0, 1, N), 40) * 0.015
# knocks at the start (and again at the loop)
for o in (0.3, 0.65, 1.0): knock(o)
for o in (0.25, 0.6, 0.95): knock(E['knock'] + o)
for o in (0.0, 0.35): knock(E['looks'] + 1.2 + o, 0.5)
# peephole: lens creak + silence, light flick and sting
tone(E['looks'] + 0.3, 0.2, 3000, 0.02, 20); add(E['isleo'] - 0.05, nz(0.04) * 0.2); thump(E['isleo'], 0.6, 45, 8); sting(E['isleo'], 73, 0.1)
# flashback: tape slow-down
n = int(1.2 * SR); add(E['earlier'] - 0.2, np.sin(2 * np.pi * np.cumsum(np.linspace(1600, 200, n)) / SR) * np.hanning(n) * 0.04)
for s_ in np.arange(E['earlier'], E['hook'] - 0.2, 0.55): thump(s_, 0.15, 80, 40)
# phone: lift click, line hiss, distant ring through the line, then the real front desk ring
thump(E['lifts'] + 0.3, 0.3, 300, 60); tone(E['lifts'] + 0.3, 0.05, 2200, 0.04, 60)
m = int((E['call'] - E['lifts']) * SR); add(E['lifts'] + 0.3, (rng.normal(0, 1, m) - ma(rng.normal(0, 1, m), 5)) * 0.008)
ring(E['through'] + 0.6, E['front'] - E['through'] - 0.6, 0.02, 30)
ring(E['front'] - 0.1, E['coming'] - E['front'] + 0.1, 0.05)
# time glitch back to 4.29
for k in range(10): tone(E['always'] + k * 0.08, 0.06, 400 + rng.random() * 2400, 0.03, 30)
sting(E['coming'], 82, 0.07)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
# sticky note: paper tear, ink sting
m = int(0.3 * SR); add(E['desk'] + 0.3, nz(0.3, 2) * env(m, 0.002, 10) * 0.06); tone(E['wet'], 0.5, 1800, 0.02, 6); sting(E['wet'] + 0.2, 98, 0.05)
# hundreds of notes: flurry of paper flicks, rising
for k in range(40): s_ = E['hundreds'] + k * 0.035; add(s_, nz(0.02, 2) * env(int(0.02 * SR), 0.001, 80) * (0.03 + k * 0.002))
n = int(1.6 * SR); add(E['hundreds'], np.sin(2 * np.pi * np.cumsum(np.linspace(80, 260, n)) / SR) * np.linspace(0, 1, n) * 0.05)
# handwriting match: heartbeat then hit
for k in range(4): thump(E['same7'] + k * 0.75, 0.45, 48); thump(E['same7'] + k * 0.75 + 0.25, 0.28, 45)
thump(E['leos'], 0.9, 38, 5); sting(E['leos'], 55, 0.1)
# choice: tick, rising, pops
for s_ in np.arange(E['optA'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.07)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12)
m = int((D - E['optA']) * SR); x = np.arange(m) / SR; add(E['optA'], np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
