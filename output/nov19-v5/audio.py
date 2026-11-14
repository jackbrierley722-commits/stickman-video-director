# Nov 19: epic trailer hits, synth pulse, scene SFX
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(19)
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
def boom(at, amp=0.8):
    n = int(2.0 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * (32 + 60 * np.exp(-x * 8)) * x) * np.exp(-x * 1.6)); add(at, nz(1.5, 30) * env(int(1.5 * SR), 0.002, 2.5) * 0.25 * amp)
def riser(at, dur, amp=0.15):
    n = int(dur * SR); x = np.arange(n) / SR; add(at - dur, (nz(dur, 6) * 0.6 + np.sin(2 * np.pi * np.cumsum(200 + 900 * (x / x[-1]) ** 2) / SR) * 0.3) * (x / x[-1]) ** 2 * amp)
c = [cl['start'] for cl in CL]
# pulse bed (minor, 120bpm 8ths) with levels per scene
lvl = np.interp(t, [0, 0.5, c[3] - 0.2, c[3], c[4], c[5], c[6], c[6] + 0.3, c[7] - 0.2, c[7], D - 1, D], [0, 0.8, 1, 0.55, 0.9, 0.9, 0.35, 0.3, 0.3, 0.9, 0.9, 0])
e8 = 0.25; prog_ = [[45, 52, 57], [41, 48, 53], [43, 50, 55], [40, 47, 52]]
for i, s_ in enumerate(np.arange(0.1, D - 0.4, e8)):
    ch = prog_[(i // 16) % 4]; g = float(np.interp(s_, t, lvl)); n = int(0.22 * SR); x = np.arange(n) / SR
    add(s_, np.sign(np.sin(2 * np.pi * hz(ch[0]) * x)) * env(n, 0.002, 10) * 0.035 * g)
    if i % 4 == 0: add(s_, (np.sin(2 * np.pi * (45 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 12)) * 0.4 * g)
    if i % 8 == 4: add(s_, nz(0.18, 1) * env(int(0.18 * SR), 0.001, 18) * 0.12 * g)
for s_ in np.arange(0.1, D, 4.0):
    ch = prog_[int(s_ / 4) % 4]; for_ = [add(s_, sine(hz(n_ + 12), 4.0) * np.hanning(int(4.0 * SR)) * 0.018 * float(np.interp(s_, t, lvl))) for n_ in ch]
# hits
boom(0.15, 0.7); imp = wt(0, 'asteroid') + 0.35; riser(imp, 1.3, 0.16); boom(imp, 1.3); add(imp, nz(2.5, 3) * env(int(2.5 * SR), 0.002, 1.6) * 0.35)
add(imp + 0.3, nz(3.0, 40) * env(int(3.0 * SR), 0.05, 0.9) * 0.3)
fz = wt(0, 'but') - 0.05; n_ = int(0.45 * SR); xx = np.arange(n_) / SR; add(fz, np.sin(2 * np.pi * np.cumsum(420 * np.exp(-xx * 7) + 40) / SR) * env(n_, 0.002, 4) * 0.12); add(fz, nz(0.06, 1) * env(int(0.06 * SR), 0.001, 60) * 0.3)
cs = wt(0, 'video') - 0.25; n_ = int(1.1 * SR); xx = np.arange(n_) / SR; add(cs, nz(1.1, 8) * (xx / xx[-1]) * np.exp(-np.maximum(0, xx - 0.9) * 20) * 0.18); boom(cs + 1.0, 0.7); [add(cs + 1.0 + i * 0.06, sine(f, 1.4) * env(int(1.4 * SR), 0.002, 2.5) * 0.05) for i, f in enumerate([392, 523, 659, 784])]
riser(c[1], 1.0, 0.1)
boom(c[1] + 0.1, 0.5)
for w_ in (wt(1, 'ninety'), wt(1, 'four')): boom(w_, 0.45); [add(w_ + i * 0.05, sine(f, 0.8) * env(int(0.8 * SR), 0.002, 4) * 0.04) for i, f in enumerate([880, 1175, 1568])]
for k_ in range(30): add(c[2] + 0.2 + k_ * 0.12, nz(0.03, 2) * env(int(0.03 * SR), 0.001, 70) * 0.08)  # boxes stacking
boom(wt(2, 'so'), 0.6)
# office: phone send whoosh + cough
n = int(0.4 * SR); x = np.arange(n) / SR; add(wt(3, 'millions'), np.sin(2 * np.pi * (600 + 900 * x) * x) * env(n, 0.01, 5) * 0.05)
for k_ in range(2): add(wt(3, 'sick') + 0.2 + k_ * 0.3, nz(0.15, 4) * env(int(0.15 * SR), 0.003, 15) * 0.15)
# servers: fan whine + alarm
fan = np.sin(2 * np.pi * 3200 * t) * 0.01 + ma(rng.normal(0, 1, N), 4) * 0.03; out += fan * np.interp(t, [c[4] - 0.1, c[4], c[5] - 0.3, c[5]], [0, 1, 1.6, 0])
for s_ in np.arange(wt(4, 'exact') - 0.5, c[5] - 0.2, 0.5): add(s_, sine(1400, 0.2) * env(int(0.2 * SR), 0.003, 8) * 0.05)
# shop: crowd murmur
out += ma(rng.normal(0, 1, N), 8) * 0.04 * np.interp(t, [c[5], c[5] + 0.5, c[6] - 0.3, c[6]], [0, 1, 1, 0])
# city: wind + crickets, almost silent
out += ma(rng.normal(0, 1, N), 120) * 0.12 * np.interp(t, [c[6], c[6] + 0.4, c[7] - 0.3, c[7]], [0, 1, 1, 0])
for s_ in np.arange(c[6] + 0.3, c[7] - 0.3, 0.9): [add(s_ + k_ * 0.05, sine(4200, 0.03) * env(int(0.03 * SR), 0.001, 80) * 0.02) for k_ in range(3)]
for k_ in range(4): add(c[6] + 0.5 + k_ * 1.8, sine(880, 0.15) * env(int(0.15 * SR), 0.002, 15) * 0.02)  # traffic light beeps
boom(wt(7, 'no'), 0.7); [add(wt(7, 'follow') + i * 0.08, sine(f, 0.8) * env(int(0.8 * SR), 0.002, 4) * 0.05) for i, f in enumerate([659, 784, 1047])]
fzT = wt(0, 'but') - 0.05; out *= np.interp(t, [0, fzT, fzT + 0.05, fzT + 0.6, fzT + 1.0], [1, 1, 0.25, 0.25, 1])
out *= np.interp(t, [0, 0.1, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.15 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
