# Pick a planet: different mood music per planet + cut whooshes; narrator on top
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
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def sine(f, dur): x = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * x)
def sq(f, dur): return np.sign(sine(f, dur))
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def hz(n): return 440 * 2 ** ((n - 69) / 12)
def gate(a, b, fi=0.3, fo=0.3): return np.interp(t, [a - fi, a, b, b + fo], [0, 1, 1, 0])
C1, S0, S1, S2, S3, END = [CL[i]['start'] for i in (1, 6, 7, 8, 9, 10)]
def seg(a, b): return (a, b, int(a * SR), int(b * SR))
# ---------- HOOK: spacey pad + riser
x = t
pad = sum(np.sin(2 * np.pi * hz(n) * x) for n in (45, 52, 57, 64)) * 0.025 * (1 + 0.3 * np.sin(2 * np.pi * 0.25 * x))
out += pad * gate(0, C1, 0.01, 0.4)
for i in range(16): add(0.4 + i * 0.35, sine(hz([76, 79, 83, 88][i % 4]), 1.0) * env(int(SR), 0.005, 4) * 0.03)
# ---------- COUNTDOWN: tick + heartbeat, rising pitch, riser into planet A
for i in range(5):
    c = CL[1 + i]['start']; add(c, sine(55, 0.3) * env(int(0.3 * SR), 0.002, 14) * 0.6); add(c + 0.22, sine(50, 0.25) * env(int(0.25 * SR), 0.002, 16) * 0.35)
    add(c, sine(hz(60 + i * 2), 0.5) * env(int(0.5 * SR), 0.002, 8) * 0.07)
    for q in range(4): add(c + q * 0.25, nz(0.03) * env(int(0.03 * SR), 0.001, 90) * 0.08)
m = int((S0 - C1) * SR); xr = np.arange(m) / SR; add(C1, nz(S0 - C1, 6) * (xr / xr[-1]) ** 3 * 0.18)
# ---------- A: whimsical marimba bounce (giant world)
a0, a1 = S0, S1; bpm = 118; st = 60 / bpm / 2
mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74]
for i, s_ in enumerate(np.arange(a0, a1, st)):
    n = mel[i % 16]; y = (sine(hz(n), 0.35) + 0.5 * sine(hz(n) * 4.0, 0.35) * np.exp(-np.arange(int(0.35 * SR)) / SR * 30)) * env(int(0.35 * SR), 0.002, 12); add(s_, y * 0.05)
    if i % 2 == 0: add(s_, sine(hz([48, 43, 45, 41][(i // 8) % 4]), 0.3) * env(int(0.3 * SR), 0.003, 9) * 0.12)
    if i % 4 == 2: add(s_, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 50) * 0.04)
# ---------- B: sea shanty waltz (accordion-ish) + waves + gulls
b0, b1 = S1, S2; beat = 0.42
chords = [[55, 59, 62], [50, 54, 57], [52, 55, 59], [50, 54, 57]]
for i, s_ in enumerate(np.arange(b0, b1, beat)):
    ch = chords[(i // 6) % 4]
    if i % 3 == 0: add(s_, sine(hz(ch[0] - 12), 0.4) * env(int(0.4 * SR), 0.003, 6) * 0.13)
    else:
        for n in ch: x = np.arange(int(0.3 * SR)) / SR; add(s_, (np.sign(np.sin(2 * np.pi * hz(n) * x)) * 0.3 + np.sin(2 * np.pi * hz(n) * x)) * (1 + 0.15 * np.sin(2 * np.pi * 6 * x)) * env(int(0.3 * SR), 0.02, 5) * 0.018)
waves = ma(rng.normal(0, 1, N), 60) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t)) ** 2 * 0.12; out += waves * gate(b0, b1, 0.1, 0.4)
for g_ in range(5):
    s_ = b0 + 2 + g_ * 2.7; n = int(0.4 * SR); xx = np.arange(n) / SR; add(s_, np.sin(2 * np.pi * np.cumsum(1800 - 900 * xx / xx[-1]) / SR) * env(n, 0.01, 6) * 0.03)
# ---------- C: lounge chords over a lava rumble + bubbling
c0, c1 = S2, S3
lounge = [[57, 60, 64, 67], [55, 59, 62, 65], [53, 57, 60, 64], [52, 56, 59, 62]]
for i, s_ in enumerate(np.arange(c0 + 0.1, c1, 1.6)):
    for n in lounge[i % 4]: x = np.arange(int(1.6 * SR)) / SR; add(s_, np.sin(2 * np.pi * hz(n) * x) * (1 + 0.3 * np.sin(2 * np.pi * 5 * x)) * env(int(1.6 * SR), 0.01, 1.6) * 0.02)
    add(s_, sine(hz(lounge[i % 4][0] - 24), 1.5) * env(int(1.5 * SR), 0.005, 2) * 0.12)
for s_ in np.arange(c0, c1, 0.4): add(s_ + 0.2, nz(0.03, 2) * env(int(0.03 * SR), 0.001, 80) * 0.035)
out += (ma(rng.normal(0, 1, N), 200) * 0.25 + 0.04 * np.sin(2 * np.pi * 32 * t)) * gate(c0, c1, 0.1, 0.3)
for k_ in range(60):
    s_ = c0 + rng.uniform(0, c1 - c0); n = int(0.08 * SR); xx = np.arange(n) / SR; add(s_, np.sin(2 * np.pi * rng.uniform(150, 400) * (1 + 3 * xx) * xx) * env(n, 0.002, 30) * 0.025)
# melting + sizzle on ice cream and hot tub
m = int(1.5 * SR); add(wt(8, 'melts'), nz(1.5, 1) * np.hanning(m) * 0.05)
# ---------- D: frozen time. near silence, slow music box, ice tinkles
d0, d1 = S3, END
for i, s_ in enumerate(np.arange(d0 + 0.3, d1, 1.1)):
    n = [84, 79, 76, 81, 79, 74, 76, 72][i % 8]; add(s_, (sine(hz(n), 2.2) + 0.25 * sine(hz(n) * 2.01, 2.2)) * env(int(2.2 * SR), 0.002, 2.2) * 0.035)
    add(s_ + 0.55, sine(hz(n + 12), 1.0) * env(int(1.0 * SR), 0.001, 6) * 0.012)
out += sine(hz(40), D)[:N] * 0.025 * gate(d0, d1, 0.2, 0.3)
x = t
# ---------- OUTRO: all four motifs as one chord + riser on 'comment'
e0 = END; out += sum(np.sin(2 * np.pi * hz(n) * x) for n in (57, 60, 64, 69)) * 0.02 * gate(e0, D - 0.2, 0.05, 0.3)
for i in range(8): add(e0 + 0.2 + i * 0.3, sine(hz([76, 81, 84, 88][i % 4]), 0.8) * env(int(0.8 * SR), 0.003, 5) * 0.035)
# ---------- transitions: whoosh at each planet + soft swish on each cut
def whoosh(at, amp=0.18, dur=0.6):
    n = int(dur * SR); xx = np.arange(n) / SR; add(at - dur * 0.6, nz(dur, 8) * np.sin(np.pi * xx / xx[-1]) ** 2 * amp)
for s_ in (S0, S1, S2, S3, END): whoosh(s_, 0.22, 0.7); add(s_, sine(50, 0.5) * env(int(0.5 * SR), 0.002, 8) * 0.4)
cuts = [wt(6, w) for w in ('everything', 'mushrooms', 'flowers', 'dew', 'and', "they're")] + [wt(7, w) for w in ("there's", 'so', 'whole', 'lighthouses', 'bridges', 'every', 'hope')] + [wt(8, w) for w in ('rivers', 'cities', 'every', 'the', 'your', 'and')] + [wt(9, w) for w in ('time', 'raindrops', 'birds', 'a', "you're", 'no', 'but')]
for c in cuts: whoosh(c, 0.07, 0.35)
for w_ in (wt(6, 'but'), wt(7, 'planet', 1), wt(8, 'planet', 1), wt(0, 'stay')):
    m = int(0.8 * SR); xx = np.arange(m) / SR; add(w_ - 0.1, np.sin(2 * np.pi * (300 + 500 * xx) * xx) * env(m, 0.01, 3) * 0.04)
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.3 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
