# Gas station Night 1: night ambience, fluorescent hum, marker, lock, pump buzz, knocks, freezer, coins, heartbeat
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(77)
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
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07): m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
E = dict(rules=wt(0, 'there'), last=wt(0, 'the', 1), sorry=wt(0, 'sorry'), lock1=wt(1, 'lock'), light2=wt(2, 'if'), dont2=wt(2, "don't"), never3=wt(3, 'never'), coins4=wt(4, 'if'), n1=S0[5], lockN=wt(5, 'you'), like=wt(5, 'like'), t241=S0[6], flick=wt(6, 'the'), refl=wt(6, 'but'), someone=wt(6, 'someone'),
         knock=S0[7], oldman=wt(7, 'an'), freezer=wt(7, 'you'), onebag=wt(7, 'one'), coins=S0[8], both=wt(8, 'you'), optA=S0[9], optB=wt(9, 'option', 1), comment=wt(9, 'comment'), follow=wt(9, 'and'))
# beds: crickets outside, fluorescent hum, low drone that thickens at night
cr = np.sin(2 * np.pi * 4400 * t) * (np.sin(2 * np.pi * 17 * t) > 0.55) * (np.sin(2 * np.pi * 0.6 * t) > -0.2) * 0.006; out += cr
out += np.sign(np.sin(2 * np.pi * 120 * t)) * 0.004 + ma(rng.normal(0, 1, N), 30) * 0.012
lvl = np.interp(t, [0, 0.3, E['n1'], E['n1'] + 2, E['someone'], E['knock'] - 0.3, E['knock'], D], [0.6, 0.8, 0.8, 1.0, 1.2, 0.3, 1.0, 1.2])
out += (0.05 * np.sin(2 * np.pi * 41 * t) + 0.03 * np.sin(2 * np.pi * 61.5 * t + np.sin(2 * np.pi * 0.1 * t)) + 0.012 * np.sin(2 * np.pi * 123 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)) * lvl
# sparse piano motif under the rules
for i, s_ in enumerate(np.arange(0.4, E['n1'], 1.2)): tone(s_, 1.4, 440 * 2 ** (([57, 60, 64, 63, 60, 57, 55, 56][i % 8] - 69) / 12), 0.025, 2)
# marker scratches on rule 5, sting on SORRY
for k in range(5): m = int(0.18 * SR); add(E['last'] + 0.2 + k * 0.17, (nz(0.18) - nz(0.18, 3)) * np.hanning(m) * 0.06)
sting(E['sorry'], 73, 0.09); thump(E['sorry'], 0.5, 42)
for s_ in (S0[1], S0[2], S0[3], S0[4]): tone(s_ + 0.1, 0.12, 1800, 0.03, 30)  # rule tick
thump(E['lock1'] + 0.1, 0.4, 160, 40)
m = int(0.8 * SR); x = np.arange(m) / SR; add(E['light2'], np.sign(np.sin(2 * np.pi * 120 * x)) * (np.sin(2 * np.pi * 9 * x) > 0) * 0.02)
tone(E['coins4'] + 0.2, 0.15, 3200, 0.03, 30); tone(E['coins4'] + 0.3, 0.15, 2800, 0.03, 30)
tone(E['n1'], 0.6, 880, 0.03, 4)  # clock beep
thump(E['lockN'] + 0.4, 0.6, 140, 30); tone(E['lockN'] + 0.4, 0.08, 1800, 0.05, 50)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
tone(E['t241'], 0.6, 880, 0.03, 4)
m = int(1.2 * SR); x = np.arange(m) / SR; add(E['flick'], np.sign(np.sin(2 * np.pi * 120 * x)) * (np.sin(2 * np.pi * 14 * x) > 0) * 0.03)  # pump 4 flicker buzz
sting(E['someone'], 65, 0.1); thump(E['someone'], 0.6, 40, 8)
for k in range(3): thump(E['knock'] + 0.4 + k * 0.28, 0.6, 180, 35); add(E['knock'] + 0.4 + k * 0.28, nz(0.05, 2) * env(int(0.05 * SR), 0.001, 70) * 0.12)
creak(E['freezer'] + 0.1, 0.9, 260, 0.05); m = int(2.5 * SR); add(E['freezer'] + 0.5, np.sin(2 * np.pi * 60 * np.arange(m) / SR) * np.hanning(m) * 0.02)
sting(E['onebag'], 82, 0.06)
for k in range(12): tone(E['coins'] + 0.3 + k * 0.07 + rng.random() * 0.03, 0.2, 2600 + rng.random() * 2200, 0.025, 20)  # coins slide/clink
for k in range(5): thump(E['coins'] + 3.0 + k * 0.7, 0.45, 48); thump(E['coins'] + 3.0 + k * 0.7 + 0.25, 0.28, 45)  # heartbeat on the rule clash
sting(E['both'], 55, 0.1)
for s_ in np.arange(E['optA'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.07)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
