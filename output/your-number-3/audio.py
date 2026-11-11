# Part 2: drone, small footsteps, phone buzzes, stingers, double laugh, window knocks, choice tick
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(45)
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
def tone(at, dur, f, amp, d=6): n = int(dur * SR); add(at, sine(f, dur) * env(n, 0.002, d) * amp)
def pop(at, f=1400): m = int(0.12 * SR); add(at, (sine(f, 0.12) + 0.5 * sine(f * 1.5, 0.12)) * env(m, 0.002, 30) * 0.08)
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
something = wt(0, 'something'); never = wt(2, 'never'); picks = wt(3, 'picks'); typing = wt(3, 'and'); buzz4 = wt(4, 'buzzes'); msg = wt(4, 'i'); rule = wt(5, 'rule'); taps = wt(6, 'taps'); c7 = CL[7]['start']; what = wt(8, "what's"); sil = wt(9, 'silence'); doors = wt(9, 'then'); opt = CL[10]['start']
lvl = np.interp(t, [0, 0.5, rule - 0.2, rule, CL[6]['start'], taps, sil - 0.1, sil, doors, doors + 0.4, D - 1, D], [0, 0.8, 1, 0.3, 0.3, 0.9, 0.9, 0.1, 0.1, 1.3, 1.2, 0])
out += (0.06 * np.sin(2 * np.pi * 43 * t) + 0.035 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.11 * t)) + 0.018 * np.sin(2 * np.pi * 129 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * t)) * lvl
out += ma(rng.normal(0, 1, N), 50) * 0.03 * lvl
mel = [72, 75, 79, 78, 75, 72, 70, 71]
for i, s_ in enumerate(np.arange(0.6, rule - 0.3, 0.8)):
    f = 440 * 2 ** ((mel[i % 8] - 69) / 12); n = int(0.9 * SR); add(s_, (sine(f, 0.9) + 0.3 * sine(f * 3.01, 0.9)) * env(n, 0.002, 5) * 0.022)
# door creak + footsteps of the copy
m = int(1.2 * SR); x = np.arange(m) / SR; add(something - 0.2, ma(np.sign(np.sin(2 * np.pi * np.cumsum(240 + 110 * np.sin(x * 5)) / SR)), 5) * np.hanning(m) * 0.07)
for s_ in np.arange(something + 0.3, CL[2]['start'], 0.6): thump(s_, 0.25, 70, 35)
for s_ in np.arange(CL[3]['start'] + 0.2, picks, 0.6): thump(s_, 0.22, 70, 35)
sting(never, 98, 0.07)
for k in range(14): s_ = typing + 0.1 + k * 0.11; add(s_, nz(0.015) * env(int(0.015 * SR), 0.0005, 200) * 0.05)
buzz(buzz4 - 0.1); pop(msg - 0.05, 900); sting(msg + 0.6, 82, 0.06)
# held breath: heartbeat
hb = rule
while hb < CL[6]['start']: thump(hb, 0.45, 48); thump(hb + 0.26, 0.28, 45); hb += 0.85
# taps on the vent
for k in range(3): tone(taps + k * 0.35, 0.08, 1800, 0.08, 40); thump(taps + k * 0.35, 0.15, 160, 40)
# metallic vent hum while the voice whispers
m = int(4.0 * SR); x = np.arange(m) / SR; add(c7 - 0.3, np.sin(2 * np.pi * 55 * x) * 0.03 * np.hanning(m))
# silence... then the doors open
m = int(1.2 * SR); x = np.arange(m) / SR; add(doors, ma(np.sign(np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(x * 4)) / SR)), 6) * np.hanning(m) * 0.09); sting(doors + 0.3, 73, 0.08)
for s_ in np.arange(opt, D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
m = int((D - opt) * SR); x = np.arange(m) / SR; add(opt, np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
for c in (7,):
    a0, a1 = int(CL[c]['start'] * SR), int((CL[c]['start'] + CL[c]['dur']) * SR); seg = vo[a0:a1].copy(); echo = np.zeros_like(seg); d = int(0.07 * SR); echo[d:] += seg[:-d] * 0.35; d2 = int(0.15 * SR); echo[d2:] += seg[:-d2] * 0.2; vo[a0:a1] = seg * 1.3 + echo
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
