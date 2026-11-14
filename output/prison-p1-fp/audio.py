# Prison escape Part 1 (first person): rain, thunder, power-down, key, door, guard, heartbeat
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
E = dict(take=wt(0, 'take'), or0=wt(0, 'or'), dex1=wt(1, 'dex'), youre=wt(1, "you're"), and1=wt(1, 'and'), rew=S0[2], storm=wt(2, 'storm'), power=wt(2, 'power'), gen=wt(2, 'generator'), key=S0[3], tb=wt(3, 'toothbrush'), six=wt(3, 'six'), turns=wt(3, 'turns'),
         like=S0[4], follow4=wt(4, 'follow'), clock4=wt(4, 'the'), guard=S0[5], head=wt(5, 'head'), reyes=S0[6], counts=wt(6, 'if'), over=wt(6, "it's"), then=S0[7], top=wt(7, 'from'), dex2=S0[8], take2=wt(8, 'take'), or2=wt(8, 'or'),
         optA=S0[9], optB=wt(9, 'option', 1), comment=wt(9, 'comment'), follow=wt(9, 'and', 2))
FL = [0.0, E['or0'] + 0.05, E['storm'] + 0.05, E['over'] + 0.05, E['top'] + 0.3, E['or2'] + 0.05, E['optB'] + 0.5, E['comment'] + 0.7]
lit = lambda x: (x >= E['rew']) & (x < E['power'])
out += (nz(D, 2) - nz(D, 8)) * 0.03 + nz(D, 40) * 0.028  # rain on the window
out += (np.sign(np.sin(2 * np.pi * 60 * t)) * 0.004 + np.sin(2 * np.pi * 120 * t) * 0.01) * lit(t)  # lights hum only before the power cut
lvl = np.interp(t, [0, E['rew'], E['rew'] + 0.6, E['power'], E['guard'], E['then'], E['dex2'], E['optA'], D], [1.1, 1.1, 0.3, 0.8, 1.0, 1.3, 1.4, 0.9, 1.1])
out += (0.05 * np.sin(2 * np.pi * 43 * t) + 0.03 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.1 * t))) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t)) * lvl
def thunder(at, amp=0.5):
    m = int(2.8 * SR); x = np.arange(m) / SR; add(at, nz(2.8, 60) * 6 * np.exp(-x * 1.6) * (1 - np.exp(-x * 30)) * amp); add(at, nz(0.25, 3) * env(int(0.25 * SR), 0.001, 25) * amp * 0.5)
for i, f in enumerate(FL): thunder(f + (0.02 if i in (0, 2) else 0.25), 0.55 if i in (0, 2, 5) else 0.32)
# beacon alarm-less pulse: soft red-light relay click while dark
for s_ in np.arange(0.3, D, 1.14):
    if not lit(np.array([s_]))[0]: tone(s_, 0.03, 900, 0.006, 80)
sting(E['or0'], 60, 0.1); thump(E['or0'], 0.6, 40, 8)
thump(E['youre'] + 0.6, 0.45, 45)  # MAXIMUM SECURITY stamp
sting(E['and1'], 70, 0.08)
# rewind: tape whirr pitched down
m = int(0.7 * SR); x = np.arange(m) / SR; add(E['rew'], np.sin(2 * np.pi * np.cumsum(900 - 700 * x / 0.7) / SR) * np.hanning(m) * 0.05 + nz(0.7, 2) * np.hanning(m) * 0.04)
m = int(0.9 * SR); x = np.arange(m) / SR; add(E['power'], np.sin(2 * np.pi * np.cumsum(220 * np.exp(-x * 3)) / SR) * np.exp(-x * 2.5) * 0.06); thump(E['power'], 0.8, 38, 6)  # power dies
for s_ in np.arange(E['power'] + 1, D - 0.5, 1.0):  # countdown ticks
    if not (E['optA'] <= s_ < E['optB']): tone(s_, 0.05, 1250, 0.01, 50)
# key: scrape in, click on the turn, door unlatch + creak
m = int(0.5 * SR); add(E['key'] + 0.3, (nz(0.5, 1) - nz(0.5, 4)) * np.hanning(m) * 0.05)
for d_ in (0.0, 0.18): thump(E['turns'] + d_, 0.35, 180, 40); tone(E['turns'] + d_, 0.06, 3200, 0.05, 60)
creak(E['turns'] + 0.4, 1.1, 140, 0.06)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
for k in range(5): thump(E['like'] + 0.2 + k * 0.33, 0.12, 90, 40)  # your steps into the corridor
for k in range(4): thump(E['guard'] + 0.1 + k * 0.5, 0.2, 110, 35)  # guard boots on concrete
tone(E['counts'] + 0.45, 0.08, 1800, 0.03, 40); thump(E['counts'] + 0.5, 0.5, 60, 14)  # flashlight finds you
sting(E['over'], 55, 0.1)
for k in range(6): thump(E['then'] + k * 0.7, 0.45, 48); thump(E['then'] + k * 0.7 + 0.25, 0.28, 45)  # heartbeat into Dex
creak(E['top'] + 0.1, 0.6, 90, 0.04)  # bunk springs
sting(E['or2'], 55, 0.11); thump(E['or2'], 0.7, 36, 6)
for k in range(int((E['optB'] - E['optA']) / 0.27)): thump(E['optA'] + 0.2 + k * 0.27, 0.16, 90, 40)  # running
thump(E['optB'] + 0.1, 0.5, 120, 25); tone(E['optB'] + 0.1, 0.07, 2600, 0.04, 50)  # door slams shut on Dex
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
