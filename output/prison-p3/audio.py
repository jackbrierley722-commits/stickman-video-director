# Prison escape Part 3: footsteps round the cart, flashlight, sheet rips, power on, alarm, radio, running, keys
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
E = dict(slowly=wt(1, 'slowly'), sweep=wt(1, 'his'), know=S0[2], one=wt(3, 'one'), two=wt(3, 'two'), like=S0[4], then=S0[5], snap=wt(5, 'lights'), gen=wt(5, 'the', 1), lock=S0[6], keys=S0[7], keysW=wt(7, 'keys'),
         optA=S0[8], optB=wt(8, 'option', 1), follow=wt(8, 'follow'), because=wt(8, 'because'))
out += (nz(D, 2) - nz(D, 8)) * 0.02 + nz(D, 40) * 0.018  # rain outside
dark = np.interp(t, [0, E['snap'], E['snap'] + 0.05, D - 2, D - 1.5, D], [1, 1, 0.3, 0.3, 1, 1])
out += (0.05 * np.sin(2 * np.pi * 43 * t) + 0.03 * np.sin(2 * np.pi * 64.5 * t + np.sin(2 * np.pi * 0.1 * t))) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.2 * t)) * dark
for s_ in np.arange(1.0, E['snap'], 1.0): tone(s_, 0.05, 1250, 0.009, 50)  # countdown ticks until power returns
sting(0.0, 58, 0.08)
for k in range(int((E['know'] - 0.3) / 0.62)): thump(0.3 + k * 0.62, 0.26, 105, 30)  # boots circling the cart
tone(E['sweep'] - 0.05, 0.06, 1800, 0.03, 40)  # flashlight click
sting(E['know'], 52, 0.09)
for at in (E['one'], E['two']):  # sheet ripped off
    m = int(0.35 * SR); add(at + 0.05, (nz(0.35, 1) - nz(0.35, 5)) * np.hanning(m) ** 0.5 * env(m, 0.01, 5) * 0.22)
for k in range(5): thump(E['like'] + 0.2 + k * 0.7, 0.4, 48); thump(E['like'] + 0.45 + k * 0.7, 0.25, 45)  # heartbeat under the sheets
tone(E['like'] + 0.15, 0.12, 1400, 0.05, 30); tone(E['like'] + 0.21, 0.12, 2100, 0.035, 30)
thump(E['snap'], 0.9, 40, 6); tone(E['snap'], 0.05, 3000, 0.03, 60)  # breaker clunk, lights on
m = int(1.8 * SR); x = np.arange(m) / SR; add(E['gen'], np.sin(2 * np.pi * np.cumsum(30 + 30 * np.clip(x, 0, 1)) / SR) * np.clip(x * 2, 0, 1) * 0.05)  # generator spin-up
alarm = np.zeros(N); a0 = int(E['lock'] * SR); x = np.arange(N - a0) / SR
alarm[a0:] = np.sign(np.sin(2 * np.pi * (700 + 200 * (np.sin(2 * np.pi * 1.2 * x) > 0)) * x)) * 0.012 * np.clip(x * 4, 0, 1) * np.interp(t[a0:], [E['optA'], E['optA'] + 0.5, D - 1.5, D - 1.4], [1, 0.5, 0.5, 0])
out += ma(alarm, 3)
add(E['lock'] - 0.05, nz(0.12, 1) * env(int(0.12 * SR), 0.001, 30) * 0.05)  # radio squelch
for k in range(int((E['keysW'] - E['keys']) / 0.3)): thump(E['keys'] + 0.2 + k * 0.3, 0.2, 95, 35)  # Reyes running for the door
for k in range(6): tone(E['keysW'] + 0.25 + k * 0.05, 0.12, 2600 + 500 * (k % 3), 0.02, 25)  # key jingle
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12)
for k in range(5): thump(E['optB'] + 0.3 + k * 0.28, 0.2, 95, 35)  # running for the yard
tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
sting(E['because'] + 0.2, 58, 0.07)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
