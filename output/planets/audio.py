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
# ---------- A: bright crystal arps (C major 7), soft pad, shaker
a0, a1 = S0, S1; bpm = 112; st = 60 / bpm / 4
padA = sum(np.sin(2 * np.pi * hz(n) * x + 0.3 * np.sin(2 * np.pi * 3 * x)) for n in (48, 55, 64, 71)) * 0.022
out += padA * gate(a0, a1, 0.05, 0.4)
notes = [72, 76, 79, 83, 86, 83, 79, 76]; k = 0
for s_ in np.arange(a0, a1, st):
    n = notes[k % 8] + (12 if (k // 32) % 2 else 0); y = (sine(hz(n), 0.6) + 0.4 * sine(hz(n) * 2.01, 0.6) + 0.2 * sine(hz(n) * 3.98, 0.6)) * env(int(0.6 * SR), 0.002, 7)
    add(s_, y * 0.035); add(s_ + st * 3, y * 0.012); k += 1
for s_ in np.arange(a0, a1, st * 2): add(s_, nz(0.04, 1) * env(int(0.04 * SR), 0.001, 60) * (0.03 if int((s_ - a0) / st / 2) % 2 else 0.015))
for s_ in np.arange(a0, a1, st * 8): add(s_, sine(hz(36), 0.5) * env(int(0.5 * SR), 0.003, 6) * 0.12)
# ---------- B: dark twilight drone + slow echo bells + wind
b0, b1 = S1, S2
drone = (np.sin(2 * np.pi * hz(33) * x) * 0.06 + np.sin(2 * np.pi * hz(40) * x) * 0.03 + np.sin(2 * np.pi * hz(45) * x + np.sin(2 * np.pi * 0.2 * x)) * 0.02) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.15 * x))
out += drone * gate(b0, b1, 0.05, 0.4); out += nz(D, 60) * 0.06 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * x)) * gate(b0, b1, 0.3, 0.4)
for i, s_ in enumerate(np.arange(b0 + 0.3, b1, 1.6)):
    n = [69, 72, 76, 74, 72, 67, 69, 64][i % 8]; y = (sine(hz(n), 2.5) + 0.3 * sine(hz(n) * 2.76, 2.5)) * env(int(2.5 * SR), 0.01, 1.6) * 0.045
    for e_ in range(4): add(s_ + e_ * 0.4, y * 0.55 ** e_)
for s_ in np.arange(b0, b1, 3.2): add(s_, sine(hz(57), 3.2) * np.hanning(int(3.2 * SR)) * 0.025); add(s_, sine(hz(60), 3.2) * np.hanning(int(3.2 * SR)) * 0.02)
# ---------- C: boring. one tick, one beep, forever. exactly the same.
c0, c1 = S2, S3
for i, s_ in enumerate(np.arange(c0 + 0.1, c1, 0.5)):
    add(s_, nz(0.015) * env(int(0.015 * SR), 0.0005, 200) * 0.06)
    if i % 2 == 0: add(s_, sq(hz(60), 0.18) * env(int(0.18 * SR), 0.002, 14) * 0.03)
    else: add(s_, sq(hz(55), 0.18) * env(int(0.18 * SR), 0.002, 14) * 0.025)
out += np.sin(2 * np.pi * 60 * x) * 0.012 * gate(c0, c1, 0.05, 0.2)  # fridge hum
# sad trombone-ish slide on 'Exactly. The. Same.'
for j, w in enumerate([wt(8, 'exactly', 1), wt(8, 'the', 2), wt(8, 'same', 1)]):
    n = int(0.45 * SR); xx = np.arange(n) / SR; f = hz(58 - j * 2) * (1 - 0.04 * xx / xx[-1]); add(w, np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, 0.01, 2.5) * 0.03)
# ---------- D: glitch beat (140bpm), stutter arps, bit noise
d0, d1 = S3, END; bpm = 140; b = 60 / bpm; r2 = np.random.default_rng(404)
for i, s_ in enumerate(np.arange(d0, d1, b)):
    if r2.random() < 0.9: n = int(0.25 * SR); xx = np.arange(n) / SR; add(s_, np.sin(2 * np.pi * (45 + 90 * np.exp(-xx * 30)) * xx) * np.exp(-xx * 12) * 0.45)
    if i % 2: add(s_, nz(0.12, 1) * env(int(0.12 * SR), 0.001, 30) * 0.1)
    for q in range(4):
        if r2.random() < 0.75:
            n_ = [61, 64, 66, 73, 70, 61, 76, 68][r2.integers(8)]; dur = b / 4; y = sq(hz(n_), dur) * env(int(dur * SR), 0.001, 18) * 0.03
            if r2.random() < 0.25: y = np.repeat(y[::8], 8)[:len(y)] * 1.4
            add(s_ + q * b / 4, y)
    if r2.random() < 0.18:
        g = nz(b / 2, 1); g = np.round(g * 3) / 3; add(s_ + b / 2, g * 0.05)
out += (np.sin(2 * np.pi * hz(37) * x) * 0.05) * (np.sin(2 * np.pi * x / (b * 2)) > -0.3) * gate(d0, d1, 0.05, 0.3)
for w in (wt(9, 'disappears'), wt(9, 'reappears')):
    n = int(0.6 * SR); xx = np.arange(n) / SR; add(w - 0.1, np.sign(np.sin(2 * np.pi * np.cumsum(2000 * np.exp(-xx * 6) + 80) / SR)) * env(n, 0.002, 4) * 0.06); add(w - 0.1, nz(0.5, 1) * env(int(0.5 * SR), 0.001, 6) * 0.12)
# ---------- OUTRO: all four motifs as one chord + riser on 'comment'
e0 = END; out += sum(np.sin(2 * np.pi * hz(n) * x) for n in (57, 60, 64, 69)) * 0.02 * gate(e0, D - 0.2, 0.05, 0.3)
for i in range(8): add(e0 + 0.2 + i * 0.3, sine(hz([76, 81, 84, 88][i % 4]), 0.8) * env(int(0.8 * SR), 0.003, 5) * 0.035)
# ---------- transitions: whoosh at each planet + soft swish on each cut
def whoosh(at, amp=0.18, dur=0.6):
    n = int(dur * SR); xx = np.arange(n) / SR; add(at - dur * 0.6, nz(dur, 8) * np.sin(np.pi * xx / xx[-1]) ** 2 * amp)
for s_ in (S0, S1, S2, S3, END): whoosh(s_, 0.22, 0.7); add(s_, sine(50, 0.5) * env(int(0.5 * SR), 0.002, 8) * 0.4)
cuts = [wt(6, w) for w in ('giant', 'deserts', 'trees', 'and', 'just')] + [wt(6, 'mile') - 0.2, wt(6, 'a', 2)] + [wt(7, w) for w in ('the', 'under', 'icy', 'forests', 'a', 'but')] + [wt(7, 'boats') - 0.3, wt(7, 'oasis') - 0.3, wt(7, 'and', 1), wt(7, 'artificial') - 0.4, wt(7, "it's", 1)] \
     + [wt(9, w) for w in ('reality', 'whole', 'holes', 'and', 'hopefully')] + [wt(9, 'reappears') - 0.05]
for c in cuts: whoosh(c, 0.07, 0.35)
for c in [wt(8, w) for w in ('absolutely', 'flat', 'dull', 'identical', 'the', 'every', 'but')] + [wt(8, 'exactly', 1), wt(8, 'same', 1)]: add(c, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
# glass ting on 'sunglasses' glare, crystal chime on 'crystal'
for w in (wt(6, 'crystal'), wt(6, 'sunglasses', 1)):
    for i, f in enumerate([2093, 2637, 3136]): add(w + i * 0.05, sine(f, 1.2) * env(int(1.2 * SR), 0.001, 4) * 0.04)
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.3 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
