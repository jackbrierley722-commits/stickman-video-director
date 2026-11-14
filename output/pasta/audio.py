# Pasta: light Italian-style mandolin/accordion bed + kitchen SFX
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(21)
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
def hz(n): return 440 * 2 ** ((n - 69) / 12)
# tarantella-ish bed: tremolo mandolin melody + oom-pah bass (6/8 feel)
bpm = 132; e8 = 60 / bpm / 2
mel = [76, 74, 72, 74, 76, 76, 76, 74, 74, 74, 76, 79, 79, 76, 74, 72, 74, 76, 76, 76, 74, 74, 76, 74, 72]
bass = [[48, 55], [43, 50], [45, 52], [43, 50]]
for i, s_ in enumerate(np.arange(0.1, D - 0.5, e8)):
    n = mel[i % len(mel)]; d_ = e8 * 0.95; x = np.arange(int(d_ * SR)) / SR
    trem = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 16 * x)); add(s_, (np.sin(2 * np.pi * hz(n) * x) + 0.3 * np.sin(2 * np.pi * hz(n) * 2 * x)) * trem * env(len(x), 0.003, 3) * 0.035)
    b = bass[(i // 6) % 4]
    if i % 3 == 0: add(s_, sine(hz(b[0] - 12), 0.25) * env(int(0.25 * SR), 0.003, 9) * 0.12)
    else: add(s_, (sine(hz(b[1]), 0.15) + sine(hz(b[1] + 4), 0.15)) * env(int(0.15 * SR), 0.003, 16) * 0.025)
lvl = np.interp(t, [0, 0.3, D - 1, D], [0, 1, 1, 0]); out *= lvl
# SFX
def thud(at, amp=0.3, f=90): n = int(0.25 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 20))
def pop(at, f=900): n = int(0.1 * SR); add(at, (sine(f, 0.1) + 0.5 * sine(f * 1.5, 0.1)) * env(n, 0.002, 30) * 0.08)
thud(wt(1, 'flour'), 0.4); [pop(wt(1, 'eggs') + i * 0.12, 1200 + i * 120) for i in range(2)]
m = int(1.6 * SR); add(wt(2, 'pour'), nz(1.6, 3) * np.hanning(m) * 0.08)
for i in range(2): c = wt(2, 'crack') + i * 0.25; add(c, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 60) * 0.3); add(c + 0.1, sine(300, 0.12) * env(int(0.12 * SR), 0.002, 25) * 0.08)
m = int(0.8 * SR); x = np.arange(m) / SR; add(wt(2, 'volcano') - 0.1, np.sin(2 * np.pi * (500 - 300 * x) * x) * env(m, 0.01, 3) * 0.08)
for s_ in np.arange(wt(2, 'mix'), CL[3]['start'], 0.11): add(s_, nz(0.03, 2) * env(int(0.03 * SR), 0.001, 70) * 0.05)
for s_ in np.arange(wt(3, 'knead'), wt(3, 'but'), 0.63): thud(s_, 0.35, 70)
for s_ in np.arange(wt(3, 'rest'), CL[4]['start'] - 0.2, 0.25): add(s_, nz(0.015) * env(int(0.015 * SR), 0.0005, 200) * 0.06)
for s_ in np.arange(wt(4, 'roll'), wt(4, 'but'), 0.78): m = int(0.6 * SR); add(s_, nz(0.6, 12) * np.hanning(m) * 0.08)
for s_ in np.arange(wt(4, 'slice'), CL[5]['start'], 0.14): add(s_, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * 0.12); thud(s_, 0.1, 160)
add(wt(5, 'drop'), nz(0.6, 4) * env(int(0.6 * SR), 0.005, 5) * 0.15)
b0, b1 = CL[5]['start'], wt(5, 'but'); bub = np.zeros(N)
for k_ in range(120): s_ = rng.uniform(b0, b1); n = int(0.05 * SR); xx = np.arange(n) / SR; add(s_, np.sin(2 * np.pi * rng.uniform(300, 800) * (1 + 4 * xx) * xx) * env(n, 0.002, 40) * 0.03)
m = int(1.0 * SR); x = np.arange(m) / SR; add(wt(5, 'boring'), np.sign(np.sin(2 * np.pi * np.cumsum(220 - 90 * x) / SR)) * env(m, 0.02, 2) * 0.03)
m = int(2.0 * SR); add(wt(5, 'sauce') - 0.2, nz(2.0, 1) * np.hanning(m) * 0.06)
for w_ in ('tomatoes', 'garlic', 'olive', 'basil'): pop(wt(6, w_) - 0.05, 900 + 150 * ('tomatoes', 'garlic', 'olive', 'basil').index(w_))
for s_ in np.arange(wt(6, 'toss'), wt(6, "that's"), 0.35): add(s_, nz(0.15, 3) * env(int(0.15 * SR), 0.003, 15) * 0.1)
for i, f in enumerate([523, 659, 784, 1047]): add(wt(6, "that's") + i * 0.08, sine(f, 1.2) * env(int(1.2 * SR), 0.002, 3) * 0.05)
pop(wt(7, 'yes'), 1100); pop(wt(7, 'no'), 700); [add(wt(7, 'follow') + i * 0.08, sine(f, 0.8) * env(int(0.8 * SR), 0.002, 4) * 0.05) for i, f in enumerate([659, 784, 1047])]
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
