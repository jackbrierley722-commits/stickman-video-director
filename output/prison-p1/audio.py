# Prison escape Part 1: rain, thunder on lightning, power-down, key click, cell door creak, generator countdown, heartbeat
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
E = dict(storm=S0[1], plan=S0[2], t212=S0[3], thunder=wt(3, 'thunder'), dark=wt(3, 'darkness'), like=S0[4], keyturn=S0[5], door5=wt(5, 'the', 1), voice=wt(5, 'then'), mate=wt(5, 'your'),
         knows=S0[6], take=wt(6, 'take'), scream=wt(6, 'or'), optA=S0[7], optB=wt(7, 'option', 1), comment=wt(7, 'comment'), follow=wt(7, 'and', 2), guilty=wt(0, 'and'))
FL = [1.3, 4.6, E['storm'] + 1.4, E['thunder'] + 0.1, E['dark'] + 2.2, E['door5'] + 0.3, E['mate'] + 0.1, E['knows'] + 2.6, E['optA'] + 1.8, E['comment'] + 1.2]
# rain bed (louder in the yard), electrical hum that dies at the blackout
rain = (nz(D, 2) - nz(D, 8)) * 0.035 + nz(D, 40) * 0.03; out += rain
hum = (np.sign(np.sin(2 * np.pi * 60 * t)) * 0.004 + np.sin(2 * np.pi * 120 * t) * 0.01) * np.interp(t, [0, E['dark'] - 0.05, E['dark'] + 0.6, D], [1, 1, 0, 0]); out += hum
lvl = np.interp(t, [0, E['dark'], E['dark'] + 0.3, E['voice'], E['knows'], E['optA'], D], [0.8, 1.0, 0.4, 0.7, 1.2, 0.9, 1.0])
out += (0.05 * np.sin(2 * np.pi * 43 * t) + 0.03 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.1 * t))) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t)) * lvl
# thunder after each flash
def thunder(at, amp=0.5):
    m = int(2.8 * SR); x = np.arange(m) / SR; y = nz(2.8, 60) * 6 * np.exp(-x * 1.6) * (1 - np.exp(-x * 30)); add(at, y * amp); add(at, (nz(0.25, 3)) * env(int(0.25 * SR), 0.001, 25) * amp * 0.5)
for i, f in enumerate(FL): thunder(f + (0.05 if i in (3, 6) else 0.3), 0.6 if i in (3, 6) else 0.35)
sting(E['guilty'], 73, 0.08); thump(E['guilty'] + 0.9, 0.5, 45)  # NOT GUILTY stamp
tone(E['storm'] + 0.1, 0.5, 880, 0.025, 5)  # clock
for s_ in (E['plan'] + 0.3, wt(2, 'a') + 0.2, wt(2, 'the', 1) + 0.2, wt(2, 'and') + 0.3): tone(s_, 0.12, 1800, 0.03, 30)  # plan ticks
for k in range(int(E['thunder'] - E['t212'])): tone(E['t212'] + k + 0.05, 0.05, 2400, 0.02, 60)  # clock tick
# power down: hum whine drops, big thud
m = int(0.9 * SR); x = np.arange(m) / SR; add(E['dark'], np.sin(2 * np.pi * np.cumsum(220 * np.exp(-x * 3)) / SR) * np.exp(-x * 2.5) * 0.06); thump(E['dark'], 0.8, 38, 6)
# generator countdown beeps (quiet, every second from blackout)
for s_ in np.arange(E['dark'] + 1, D - 0.5, 1.0): tone(s_, 0.07, 1250, 0.012, 40)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
# key turn: two metallic clicks, door creak
for d_ in (0.35, 0.6): thump(E['keyturn'] + d_, 0.35, 180, 40); tone(E['keyturn'] + d_, 0.06, 3200, 0.04, 60)
creak(E['door5'] + 0.1, 1.3, 140, 0.06)
sting(E['mate'], 65, 0.1); thump(E['mate'], 0.6, 40, 8)  # WIDE AWAKE
for k in range(6): thump(E['knows'] + k * 0.75, 0.45, 48); thump(E['knows'] + k * 0.75 + 0.25, 0.28, 45)  # heartbeat
sting(E['scream'], 55, 0.11); thump(E['scream'], 0.7, 36, 6)
for k in range(int((E['optB'] - E['optA']) / 0.27)): thump(E['optA'] + 0.3 + k * 0.27, 0.15, 90, 40)  # running footsteps (A)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2), {k: round(v, 2) for k, v in E.items()})
