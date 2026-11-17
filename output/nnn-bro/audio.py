# No Nut November: SFX only, under the narration: SFX only, under the narration
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(11)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a'], w['b']
            k += 1
    return CL[ci]['start'], CL[ci]['start'] + 0.3
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
def whoosh(at, amp=0.08, dur=0.4):
    n = int(dur * SR); x = np.arange(n) / SR; y = ma(rng.normal(0, 1, n), 6) - ma(rng.normal(0, 1, n), 30); add(at, y * np.sin(np.pi * x / dur) ** 2 * amp)
def bell(at, amp=0.04): tone(at, 0.5, 2200, amp, 6); tone(at + 0.12, 0.6, 2200, amp, 6)
def rattle(a, b, amp=0.05):
    for k in range(int((b - a) / 0.05)): add(a + k * 0.05, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * amp * (0.6 + 0.4 * rng.random()))
def creak(at, dur=1.0, f0=200, amp=0.06): m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
S0 = [c['start'] for c in CL]
def stamp(at, amp=1.0): thump(at, 0.7 * amp, 70, 22); add(at, nz(0.06, 2) * env(int(0.06 * SR), 0.001, 60) * 0.25 * amp)
def squeak(at, dur=0.4, amp=0.03):
    m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(1400 + 500 * np.sin(x * 23)) / SR)), 4) * np.hanning(m) * amp)
def ping(at, f=1320, amp=0.035): tone(at, 0.25, f, amp, 14); tone(at + 0.07, 0.3, f * 1.5, amp * 0.8, 12)
stamp(wt(0, 'lost')[0])                                   # LOST stamp on the calendar
add(wt(0, 'bro')[0] + 0.02, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 70) * 0.18)  # facepalm slap
thump(S0[1] + 0.05, 0.6, 55, 10)                         # flops on the floor
squeak(wt(2, 'day')[0] - 0.1, 0.55)                       # marker writing DAY 1
stamp(wt(3, 'lost')[0])                                   # stamped again
squeak(wt(3, 'rename')[0], 0.45, 0.03); squeak(wt(3, 'not')[0] - 0.15, 0.6, 0.025)  # cross out, write NOT NOW
tone(wt(3, 'clever')[0], 0.6, 2093, 0.025, 5); tone(wt(3, 'clever')[0] + 0.08, 0.7, 2637, 0.02, 5)  # sparkle
stamp(wt(4, 'lost')[0])                                   # banner stamped
f0 = wt(4, 'fly')[0]; i0 = int(f0 * SR); i1 = int(S0[5] * SR); n = i1 - i0; jet = (ma(rng.normal(0, 1, n), 8) - ma(rng.normal(0, 1, n), 60)) * 0.05; out[i0:i1] += jet * np.clip(np.arange(n) / SR * 3, 0, 1) * np.clip((n - np.arange(n)) / SR * 4, 0, 1)  # jet engines
whoosh(f0 - 0.05, 0.12, 0.6)
tone(wt(4, 'much')[0], 0.6, 2093, 0.025, 5); tone(wt(4, 'much')[0] + 0.08, 0.7, 2637, 0.02, 5)
for k in range(12): tone(wt(5, 'tell')[0] + 0.15 + k * 0.1, 0.03, 3000, 0.012, 80)  # typing
whoosh(wt(5, 'strong')[0] + 0.15, 0.06, 0.3)              # message sent
for k in range(4): ping(S0[6] + 0.15 + k * 0.22, 1320 + k * 40)  # same, same, same, same
ping(wt(6, 'dave', 1)[0] - 0.15, 990, 0.045)              # Dave
for k in range(29): stamp(S0[7] + 0.25 + k * 0.075, 0.45)  # every day stamped LOST
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
