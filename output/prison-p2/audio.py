# Prison escape Part 2: punch, thud, run, hatch, chute slide, cart landing, Dex yell, flashlight, footsteps
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
E = dict(why=wt(0, 'why'), said=S0[1], punch=wt(1, 'one'), sorry=wt(1, 'sorry'), like=S0[2], worse=wt(2, 'this'), sixty=S0[3], chute3=wt(3, 'the'), squeeze=S0[4], two=wt(4, 'two'), cart=wt(4, 'into'), dexYell=S0[5], stay=S0[6], beam=wt(6, 'and'),
         reyes=S0[7], optA=S0[8], optB=wt(8, 'option', 1), comment=wt(8, 'comment'), follow=wt(8, 'follow'), because=wt(8, 'because'))
E['hit'] = E['punch'] + 0.38
out += (nz(D, 2) - nz(D, 8)) * 0.022 + nz(D, 40) * 0.02  # rain outside
lvl = np.interp(t, [0, E['punch'], E['hit'], E['hit'] + 0.4, E['sixty'], E['two'], E['cart'], E['dexYell'], E['optA'], D], [1.0, 1.2, 0.2, 0.6, 1.1, 1.3, 0.5, 1.3, 1.0, 1.1])
out += (0.05 * np.sin(2 * np.pi * 43 * t) + 0.03 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.1 * t))) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t)) * lvl
for s_ in np.arange(1.0, D - 0.5, 1.0): tone(s_, 0.05, 1250, 0.009, 50)  # countdown ticks
sting(0.0, 60, 0.08)
# punch: whoosh, crack, body hitting the floor (cartoon, not gory)
m = int(0.25 * SR); x = np.arange(m) / SR; add(E['hit'] - 0.15, nz(0.25, 2) * np.hanning(m) * 0.08)
thump(E['hit'], 0.9, 90, 30); add(E['hit'], nz(0.06, 1) * env(int(0.06 * SR), 0.0005, 80) * 0.25); thump(E['hit'] + 0.55, 0.8, 55, 14); thump(E['hit'] + 0.7, 0.4, 70, 20)
tone(E['sorry'] + 0.05, 0.4, 330, 0.02, 6)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
for k in range(int((E['squeeze'] - E['worse']) / 0.27)): thump(E['worse'] + k * 0.27, 0.16, 90, 40)  # running
creak(E['squeeze'] - 0.1, 0.6, 180, 0.05)  # hatch
m = int((E['cart'] - E['two'] + 0.2) * SR); x = np.arange(m) / SR; add(E['two'] - 0.15, (nz(m / SR, 1) - nz(m / SR, 6)) * np.linspace(0.3, 1, m) * 0.07 + np.sin(2 * np.pi * np.cumsum(80 + 300 * x) / SR) * 0.02)  # sliding metal
thump(E['cart'] + 0.05, 0.7, 50, 10); m = int(0.4 * SR); add(E['cart'] + 0.05, ma(nz(0.4, 1), 20) * env(m, 0.002, 8) * 0.25)  # soft landing in sheets
sting(E['dexYell'], 65, 0.1)
tone(E['beam'] + 0.3, 0.08, 1800, 0.03, 40); thump(E['beam'] + 0.35, 0.5, 60, 14); sting(E['beam'] + 0.3, 55, 0.08)  # flashlight click
for k in range(6): thump(E['reyes'] + 0.2 + k * 0.42, 0.3, 110, 30)  # boots behind the door
for k in range(5): thump(E['optA'] + 0.3 + k * 0.7, 0.45, 48); thump(E['optA'] + 0.55 + k * 0.7, 0.28, 45)  # heartbeat
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
sting(E['because'] + 0.2, 60, 0.07)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
