# Blackout: playful toy-town music that dies with the power, city ambience, power-down/up sweeps, honks, beeps
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(24)
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
cut = wt(1, 'every') - 0.1; back = wt(7, 'power') + 0.5; c = [cl['start'] for cl in CL]
# toy-town glockenspiel + bass, plays only while power is on (hook, until cut, after back)
mel = [72, 76, 79, 76, 77, 81, 79, 76, 74, 77, 81, 79, 76, 72, 74, 76]
def music_on(s_): return s_ < cut or s_ > back
for i, s_ in enumerate(np.arange(0.1, D, 0.24)):
    if not music_on(s_): continue
    n = mel[i % 16]; add(s_, (sine(hz(n + 12), 0.5) + 0.4 * sine(hz(n + 12) * 2.76, 0.5)) * env(int(0.5 * SR), 0.002, 8) * 0.035)
    if i % 4 == 0: add(s_, sine(hz([48, 45, 41, 43][(i // 16) % 4]), 0.35) * env(int(0.35 * SR), 0.003, 7) * 0.12)
    if i % 2 == 1: add(s_, nz(0.04, 1) * env(int(0.04 * SR), 0.001, 60) * 0.03)
# while the power is off: sparse low drone, darker at night, music box twinkle for the stars
off = (t > cut) & (t < back)
out += (0.05 * np.sin(2 * np.pi * 55 * t) + 0.03 * np.sin(2 * np.pi * 82.4 * t)) * off * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t))
for i, s_ in enumerate(np.arange(c[6] + 0.5, c[7] - 0.3, 0.9)): add(s_, (sine(hz([84, 88, 91, 86][i % 4]), 1.6)) * env(int(1.6 * SR), 0.002, 2.5) * 0.03)
# city ambience: traffic hum by day while power on, quieter after
out += ma(rng.normal(0, 1, N), 40) * 0.05 * np.interp(t, [0, 0.4, c[6], c[6] + 1, c[7], c[7] + 0.5, D], [0, 1, 0.8, 0.3, 0.3, 1, 1])
# power-down sweep at the cut + power-up at back
n = int(1.2 * SR); x = np.arange(n) / SR; add(cut - 0.05, np.sin(2 * np.pi * np.cumsum(220 * np.exp(-x * 3) + 30) / SR) * env(n, 0.002, 2) * 0.15); add(cut, nz(0.3, 2) * env(int(0.3 * SR), 0.001, 12) * 0.2)
add(back - 0.2, np.sin(2 * np.pi * np.cumsum(30 + 300 * (x / x[-1]) ** 2) / SR) * (x / x[-1]) * 0.12)
# honks during gridlock
for k_ in range(14): s_ = wt(2, 'within') + 1 + rng.uniform(0, 3.5); m = int(0.35 * SR); xx = np.arange(m) / SR; f = rng.uniform(350, 480); add(s_, (np.sign(np.sin(2 * np.pi * f * xx)) + np.sign(np.sin(2 * np.pi * f * 1.26 * xx))) * np.hanning(m) * 0.03)
# tower beeps, dripping, generator rumble
for s_ in np.arange(wt(3, 'phone', 1), c[4] - 0.2, 0.8): add(s_, sine(1200, 0.1) * env(int(0.1 * SR), 0.002, 20) * 0.04)
for s_ in np.arange(c[4] + 0.3, c[5] - 0.2, 0.7): add(s_, sine(1800, 0.06) * env(int(0.06 * SR), 0.001, 40) * 0.04)
gen = ma(rng.normal(0, 1, N), 60) * 0.1 * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 25 * t))); out += gen * np.interp(t, [wt(5, 'big') - 0.2, wt(5, 'big'), wt(5, 'your') - 0.3, wt(5, 'your')], [0, 1, 1, 0])
for k_ in range(10): add(c[6] + 1.5 + k_ * 0.6, sine(4300, 0.03) * env(int(0.03 * SR), 0.001, 80) * 0.02)
# every fridge beeps
for k_ in range(30): s_ = wt(7, 'and') + rng.uniform(0, 1.4); add(s_, sine(rng.choice([2000, 2400, 2800]), 0.12) * env(int(0.12 * SR), 0.002, 10) * 0.04)
[add(wt(7, 'follow') + i * 0.08, sine(f, 0.8) * env(int(0.8 * SR), 0.002, 4) * 0.05) for i, f in enumerate([659, 784, 1047])]
out *= np.interp(t, [0, 0.1, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
