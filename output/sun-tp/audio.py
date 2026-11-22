# Teleported to the Sun: SFX + low music bed, under the narration
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
def baa(at, amp=0.06, f0=330):
    n = int(0.6 * SR); x = np.arange(n) / SR; f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 9 * x)) * (1 - 0.15 * x); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.sign(np.sin(ph)) * 0.5 + np.sin(ph); y = ma(y, 4) - ma(y, 30); add(at, y * np.sin(np.pi * x / 0.6) ** 0.5 * amp)
def boing(at, amp=0.05): n = int(0.4 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * np.cumsum(220 + 500 * np.exp(-x * 8) * (1 + 0.3 * np.sin(x * 60))) / SR) * np.exp(-x * 6) * amp)
here = wt(0, "here's")[0]; whoosh(here + 0.2, 0.12, 0.6); thump(here + 0.1, 0.3, 120, 30)
# teleport zap in and out
def zap(at, up=True):
    n = int(0.6 * SR); x = np.arange(n) / SR; f = (300 + 2500 * x / 0.6) if up else (2800 - 2500 * x / 0.6); add(at, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.005, 4) * 0.05); add(at, (nz(0.6, 1) - nz(0.6, 4)) * env(n, 0.002, 6) * 0.08)
zap(0.15); zap(S0[5] - 0.1, False)
# the Sun: deep roaring plasma rumble the whole time you're there, plus crackle
i1 = int(S0[5] * SR); xx = t[:i1]; out[:i1] += (ma(rng.normal(0, 1, i1), 150) * 7 + np.sin(2 * np.pi * 38 * xx) * 0.15) * 0.22 * np.clip(xx * 3, 0, 1) * np.clip((S0[5] - xx) * 5, 0, 1)
for k in range(int(S0[5] / 0.09)): add(k * 0.09 + rng.random() * 0.06, nz(0.02, 1) * env(int(0.02 * SR), 0.001, 90) * 0.02)
# microwaves popping in, then all humming
mw = wt(2, 'microwaves')[0]
for i in range(12): tone(mw - 0.3 + i * 0.05, 0.08, 1400 + 60 * (i % 4), 0.012, 30)
i0 = int((mw - 0.2) * SR); i2 = int(S0[4] * SR); xx = np.arange(i2 - i0) / SR; out[i0:i2] += (np.sin(2 * np.pi * 120 * xx) * 0.02 + np.sin(2 * np.pi * 240 * xx) * 0.008) * np.clip(xx * 3, 0, 1)
# boiling into steam: sizzle
st = wt(3, 'steam')[0]; m = int(2.5 * SR); add(st - 0.4, (nz(2.5, 1) - nz(2.5, 2)) * np.clip(np.arange(m) / SR * 2, 0, 1) * np.exp(-np.arange(m) / SR * 0.6) * 0.06)
# blinded: ringing high tone + white-out
bl = wt(3, 'blinded')[0]; tone(bl, 1.4, 3800, 0.02, 1.2); thump(bl, 0.5, 60, 8)
# 28x gravity: sudden drop whoosh, then a thud into the plasma
fl = wt(4, 'fall')[0]; whoosh(fl - 0.15, 0.12, 0.5); thump(fl + 0.4, 0.7, 45, 7)
# back home: steam sizzle fading, a microwave "ding" when the tan is done
m = int(4 * SR); add(S0[5] + 0.3, (nz(4, 1) - nz(4, 2)) * np.exp(-np.arange(m) / SR * 0.5) * 0.03)
bell(wt(5, 'side')[0] + 0.4, 0.05)
# ---------- low curious music bed: plucky, light, original ----------
BPM = 104; beat = 60 / BPM; mus = np.zeros(N); mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def note(at, f, dur, amp):
    n = int(dur * SR); x = np.arange(n) / SR; y = (np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)) * np.exp(-x * 6); i = int(at * SR)
    if i < N: mus[i:i + n] += amp * y[:N - i]
chords = [(50, [62, 65, 69]), (46, [62, 65, 70]), (48, [60, 64, 67]), (45, [61, 64, 69])]
bar = 0; t0 = 0.0
while t0 < D:
    root, ch = chords[bar % 4]
    for bt in range(4):
        tb = t0 + bt * beat; note(tb, mf(root), beat * 0.9, 0.35); arp = ch + [ch[0] + 12]; note(tb, mf(arp[bt] + 12), beat * 0.5, 0.12); note(tb + beat / 2, mf(arp[(bt + 2) % 4] + 12), beat * 0.5, 0.09)
    bar += 1; t0 += 4 * beat
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
