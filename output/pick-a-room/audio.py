# Pick a hotel room: hotel lounge bed, SFX on actions, mood per room
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(31)
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
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07): m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def whoosh(at, amp=0.05): m = int(0.45 * SR); x = np.linspace(0, 1, m); n = nz(0.45, 1); add(at - 0.3, (ma(n, 3) * x + (n - ma(n, 12)) * (1 - x) * 0.6) * np.sin(np.pi * x) ** 2 * amp * 3)
S0 = [c['start'] for c in CL]
E = dict(one=wt(0, 'one'), worry=wt(0, "that's"), A=S0[1], pool=wt(1, 'a', 1), free=wt(1, 'and'), rings=wt(2, 'phone'), awake=wt(2, 'are'), yes=wt(2, 'you', 1), nobody=wt(2, 'nobody'), B=S0[3], best=wt(3, 'and'), warm=wt(4, "it's"), like=S0[5], C=S0[6], except_=wt(6, 'except'),
         D=S0[7], tea=wt(7, 'the'), check=wt(7, 'check'), never=wt(7, 'never'), end=S0[8])
# lounge jazz-ish bed, darker per room
mood = [(0, (57, 60, 64, 67)), (E['A'], (62, 65, 69, 72)), (E['rings'], (57, 60, 63, 67)), (E['B'], (55, 58, 62, 65)), (E['C'], (53, 57, 60, 64)), (E['D'], (52, 55, 58, 62)), (E['end'], (57, 60, 64, 67))]
for i, s_ in enumerate(np.arange(0, D, 0.6)):
    ch = [m for t0, m in mood if t0 <= s_][-1]; n = int(1.2 * SR); x = np.arange(n) / SR
    add(s_, (np.sin(2 * np.pi * hz(ch[i % 4] + 12) * x) + 0.2 * np.sin(2 * np.pi * hz(ch[i % 4] + 24) * x)) * env(n, 0.003, 4), 0.014)
    if i % 2 == 0: add(s_, np.sin(2 * np.pi * hz(ch[0] - 12) * x) * env(n, 0.003, 3), 0.03)
out += ma(rng.normal(0, 1, N), 40) * 0.012
sting(E['one'], 87, 0.05)
for s_, a in [(E['A'], 0.05), (E['B'], 0.04), (E['C'], 0.04), (E['D'], 0.05), (E['end'], 0.04)]: whoosh(s_, a)
m = int(2.5 * SR); add(E['pool'], (nz(2.5) - nz(2.5, 5)) * np.hanning(m) * 0.03)  # pool water
tone(E['free'] + 0.3, 0.6, 1568, 0.04, 4); tone(E['free'] + 0.38, 0.6, 2093, 0.03, 4)  # room service bell
s_ = E['rings'] - 0.1
while s_ < E['yes']:  # electronic hotel phone
    m = int(0.4 * SR); x = np.arange(m) / SR; add(s_, (np.sin(2 * np.pi * 1400 * x) * (np.sin(2 * np.pi * 16 * x) > 0)) * env(m, 0.003, 2) * 0.04); s_ += 0.9
m = int(1.3 * SR); add(E['awake'] - 0.1, (rng.normal(0, 1, m) - ma(rng.normal(0, 1, m), 4)) * 0.01 * np.hanning(m)); sting(E['nobody'], 73, 0.06)
for k in range(8): tone(E['B'] + 1.4 + k * 0.143, 0.02, 1100, 0.01, 80)  # bulb buzz flicker
out += np.sign(np.sin(2 * np.pi * 120 * t)) * 0.004 * ((t > E['B']) & (t < S0[5]))
n = int(0.6 * SR); add(E['warm'] - 0.1, np.sin(2 * np.pi * np.cumsum(np.linspace(1800, 600, n)) / SR) * np.hanning(n) * 0.04); thump(E['warm'], 0.5, 45, 10); sting(E['warm'], 65, 0.07)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
for k in range(4): tone(E['C'] + 0.3 + k * 0.1, 0.8, hz([72, 76, 79, 84][k]), 0.025, 3)  # 1920s glitter
tone(E['except_'] + 0.4, 0.2, 660, 0.04, 10); tone(E['except_'] + 1.4, 0.2, 660, 0.025, 10)  # echo one second later
sting(E['except_'] + 0.3, 82, 0.06)
m = int(1.4 * SR); add(E['tea'], (nz(1.4) - nz(1.4, 3)) * np.hanning(m) * 0.02); thump(E['never'], 0.8, 40, 6); sting(E['never'], 55, 0.09)
for s_ in np.arange(E['end'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.06)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
