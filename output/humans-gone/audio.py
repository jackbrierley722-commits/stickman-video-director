# Humans gone: no narration. City sound cut, crash, alarm, power-out, crickets, birds growing over the years, collapses, sparse piano.
import numpy as np, soundfile as sf
SR = 44100; D = 46.0; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(9)
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, g=1.0):
    i = int(at * SR)
    if i < 0: y = y[-i:]; i = 0
    if i < N: out[i:i + len(y)] += g * y[:N - i]
def env(n, a=0.005, d=4.0):
    x = np.arange(n) / SR; e = np.exp(-x * d); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.5 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def rumble(at, dur, amp):
    n = int(dur * SR); x = np.linspace(0, 1, n); add(at, ma(rng.normal(0, 1, n), 60) * np.sin(np.pi * x) ** 0.6 * amp * 3)
def creak(at, dur=1.2, f0=120, amp=0.06):
    m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 40 * np.sin(x * 3)) / SR)), 8) * np.hanning(m) * amp)
def bird(at, amp=0.02, base=3000):
    for k in range(3 + int(rng.random() * 3)):
        n = int(0.09 * SR); x = np.arange(n) / SR; f = base + rng.random() * 1500; add(at + k * 0.12, np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 1.3, n)) / SR) * np.hanning(n) * amp)
def piano(at, m, amp=0.05):
    n = int(2.5 * SR); x = np.arange(n) / SR; f = hz(m); add(at, (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x) + 0.15 * np.sin(2 * np.pi * 3 * f * x)) * env(n, 0.003, 1.6) * amp)
# city: hum + traffic, cut the instant people vanish (0.15 s); engine of the rolling car keeps going till the crash
city = (ma(rng.normal(0, 1, N), 25) * 0.05 + 0.02 * np.sin(2 * np.pi * 60 * t)) * (t < 0.15)
for k in range(5): add(0.0, np.sin(2 * np.pi * (300 + k * 90) * np.arange(int(0.15 * SR)) / SR) * 0.01)
out += city
eng = np.sin(2 * np.pi * (70 + 8 * np.sin(2 * np.pi * 0.5 * t)) * t) * 0.03 * (t < 1.8); out += ma(eng, 4)
# crash: thud + glass
thump(1.8, 0.9, 60, 8); add(1.8, (nz(0.5) - nz(0.5, 4)) * env(int(0.5 * SR), 0.001, 7) * 0.2)
for k in range(10): tone(1.82 + k * 0.03 + rng.random() * 0.02, 0.2, 2500 + rng.random() * 3000, 0.03, 18)
# car alarm until the battery dies (~day 15)
for s_ in np.arange(2.1, 6.9, 0.5): tone(s_, 0.22, 1250, 0.035, 2); tone(s_ + 0.25, 0.22, 900, 0.035, 2)
# electric hum until the power fails at 4.0, flicker buzz, thunk
grid = 0.015 * np.sin(2 * np.pi * 120 * t) * (t < 4.0) * (t > 0.15); out += grid
for k in range(6): add(4.0 + k * 0.1, np.sign(np.sin(2 * np.pi * 120 * np.arange(int(0.05 * SR)) / SR)) * 0.03)
thump(4.6, 0.7, 45, 6)
# night crickets, then dawn birds, birdsong grows with the years; wind always
cr = (np.sin(2 * np.pi * 4200 * t) * (np.sin(2 * np.pi * 18 * t) > 0.6)) * 0.008 * np.interp(t, [3.5, 4.5, 6.5, 7.5], [0, 1, 1, 0]); out += cr
wind = ma(rng.normal(0, 1, N), 80) * 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t)) * np.interp(t, [0, 3, 34, 46], [0.2, 0.6, 1.0, 0.8]); out += wind * 0.08
s_ = 6.8
while s_ < D - 1:
    dens = np.interp(s_, [6.8, 16, 34, 40, 46], [0.6, 1.2, 2.5, 3.2, 2.0]); bird(s_, 0.012 + 0.006 * dens, 2600 + rng.random() * 1600); s_ += 1.0 / dens * (0.6 + rng.random() * 0.8)
# deer hooves crossing
for s_ in np.arange(11.2, 16.0, 0.22): thump(s_ + rng.random() * 0.05, 0.12, 300, 60)
# camera starts moving: one soft whoosh
m = int(1.2 * SR); xx = np.linspace(0, 1, m); add(15.6, nz(1.2, 3) * np.sin(np.pi * xx) ** 2 * 0.05)
# rust: metal groans
creak(17.2, 1.4, 90, 0.05); creak(19.5, 1.2, 110, 0.04)
# building collapses
for tc, a in [(23.8, 0.06), (26.0, 0.05), (27.0, 0.05), (33.2, 0.05)]: creak(tc - 0.3, 1.0, 70, 0.05); rumble(tc + 0.2, 3.2, a); thump(tc + 1.8, 0.8, 38, 5)
# the tower: long groan, huge rumble and impact
creak(30.0, 2.0, 55, 0.07); rumble(30.6, 6.0, 0.1); thump(33.6, 1.0, 32, 3); add(33.6, nz(2.5, 30) * env(int(2.5 * SR), 0.002, 1.2) * 0.35)
# sparse melancholic piano: A minor, notes every ~0.9 s, a pad that swells for the tower and the ending
mel = [69, 72, 76, 74, 72, 69, 67, 69, 64, 67, 69, 72, 71, 67, 69, 76]
for i, s_ in enumerate(np.arange(5.0, D - 0.5, 0.9)): piano(s_, mel[i % 16], 0.03 + 0.015 * (s_ > 34))
for i, s_ in enumerate(np.arange(5.0, D - 0.5, 3.6)): piano(s_, [45, 41, 48, 43][i % 4], 0.05)
padE = np.interp(t, [5, 10, 29, 33, 36, 40, 46], [0, 0.4, 0.5, 1.0, 0.6, 0.9, 0.7]); out += (np.sin(2 * np.pi * hz(57) * t) + np.sin(2 * np.pi * hz(64) * t) * 0.7 + np.sin(2 * np.pi * hz(60) * t) * 0.6) * 0.008 * padE
# like + follow pops
for at in (18.2, 43.3): tone(at, 0.12, 1400, 0.06, 30); tone(at + 0.06, 0.12, 2100, 0.04, 30)
out *= np.interp(t, [0, 0.01, D - 0.4, D], [0, 1, 1, 0.6])
mix = np.tanh(out * 1.3) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok')
