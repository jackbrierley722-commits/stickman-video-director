# Dino survival P1: SFX + low tense music bed, under the narration: SFX only, under the narration
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
def growl(at, dur, f0, amp, rough=0.6):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.25 * np.sin(np.pi * x / dur)); ph = 2 * np.pi * np.cumsum(f) / SR
    src = np.tanh(3 * np.sin(ph)) + rough * ma(rng.normal(0, 1, n), 3); y = (ma(src, 6) - ma(src, 60)) * np.sin(np.pi * x / dur) ** 0.6 * amp; add(at, y)
def hiss(at, dur, amp): n = int(dur * SR); x = np.arange(n) / SR; w = rng.normal(0, 1, n); add(at, (w - ma(w, 3)) * np.sin(np.pi * x / dur) * amp)
# power-down: hum dies, fridge compressor clicks off
n = int(1.2 * SR); x = np.arange(n) / SR; add(0.0, np.sin(2 * np.pi * np.cumsum(60 * np.exp(-x * 2)) / SR) * np.exp(-x * 2.5) * 0.12); tone(0.05, 0.06, 1200, 0.04, 40); thump(0.1, 0.3, 90, 30)
# night city outside: distant roars, wind
out += (nz(D, 6) - nz(D, 60)) * 0.01
for at in (5.6, 16.0, 27.5): growl(at, 1.8, 48, 0.05, 0.4)
for k in range(6): thump(S0[1] + 0.2 + k * 0.62, 0.15, 90, 30)  # footsteps to the window
for k in range(5): thump(S0[2] + 0.1 + k * 0.5, 0.14, 100, 30)  # footsteps to the bathroom
fl = wt(2, 'fill')[0]; thump(fl, 0.15, 400, 60); i0 = int(fl * SR); i1 = int(S0[4] * SR); xx = t[i0:i1] - fl; w = rng.normal(0, 1, i1 - i0); out[i0:i1] += (ma(w, 2) - ma(w, 14)) * 0.07 * np.clip(xx * 4, 0, 1) * np.interp(t[i0:i1], [S0[3], S0[4]], [1, 0.4]) * (1 - 0.3 * np.clip(xx / 6, 0, 1))  # tap running, bath filling
tone(wt(3, 'tank')[0], 0.4, 180, 0.04, 6)  # knock on the tank
for k in range(4): thump(S0[4] + 0.1 + k * 0.5, 0.14, 100, 30)
thump(wt(4, 'keep')[0], 0.12, 220, 50)  # hand on the handle, lets go
add(wt(5, 'eat')[0] + 0.5, nz(0.12, 1) * env(int(0.12 * SR), 0.002, 30) * 0.12)  # apple crunch
for k in range(3): tone(wt(5, 'save')[0] + 0.2 + k * 0.12, 0.05, 1600, 0.03, 50)  # tins clink
tone(wt(6, 'low')[0], 0.05, 2200, 0.03, 60); tone(wt(6, 'torch')[0] + 0.05, 0.04, 1800, 0.03, 60); thump(wt(6, 'torch')[0] + 0.05, 0.1, 300, 60)  # phone taps, torch click
sl = wt(7, 'slams')[0]; thump(sl, 1.0, 55, 8); add(sl, nz(0.25, 2) * env(int(0.25 * SR), 0.001, 16) * 0.3); thump(sl + 0.6, 0.7, 60, 10)  # door slams
hiss(wt(7, 'raptor')[0] - 0.1, 0.9, 0.06); growl(wt(7, 'raptor')[0] + 0.3, 0.8, 140, 0.08, 1.0)
for k in range(4): thump(S0[8] + 0.6 + k * 1.6, 0.6, 55, 9)  # it keeps hitting the door
tone(S0[8] + 0.2, 0.2, 660, 0.04, 12); tone(wt(8, 'option', 1)[0], 0.2, 990, 0.04, 12); tone(wt(8, 'comment')[0], 0.2, 880, 0.035, 12)
# ---------- low tense music bed ----------
mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12); beat = 60 / 92
for k in range(int(D / beat) + 1):
    tb = k * beat; nn = int(0.3 * SR); xx = np.arange(nn) / SR; i = int(tb * SR)
    if i < N: y = np.sin(2 * np.pi * mf([40, 40, 43, 38][(k // 4) % 4]) * xx) * np.exp(-xx * 7) * 0.5; mus[i:i + nn] += y[:N - i]
mus += (np.sin(2 * np.pi * mf(28) * t) + 0.4 * np.sin(2 * np.pi * mf(35) * t * 1.002)) * 0.2 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t))
for i_, m in enumerate([64, 67, 63, 62]):
    t0 = 2 + i_ * 11; n = int(6 * SR); xx = np.arange(n) / SR; ii = int(t0 * SR)
    if ii < N: mus[ii:ii + n] += (np.sin(2 * np.pi * mf(m) * xx) * np.sin(np.pi * xx / 6) * 0.08)[:N - ii]
mus *= np.interp(t, [0, 0.8, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
