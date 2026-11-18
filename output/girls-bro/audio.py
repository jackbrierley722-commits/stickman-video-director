# Button bro: SFX + low music bed, under the narration: SFX only, under the narration
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
def ding(at, amp=0.025): tone(at, 0.6, 1568, amp, 5); tone(at + 0.08, 0.7, 2093, amp * 0.8, 5)
def sparkle(at, amp=0.015):
    for j, f in enumerate([1760, 2217, 2637]): tone(at + j * 0.06, 0.5, f, amp, 6)
for k in range(5): sparkle(0.3 + k * 0.55, 0.01)  # girls swooning
n = int(1.4 * SR); x = np.arange(n) / SR; add(wt(0, 'and')[0], np.sin(2 * np.pi * 180 * x) * 0.0 + (nz(1.4, 30) * 0.03) * np.sin(np.pi * x / 1.4))  # lonely wind
for k in range(3): tone(wt(0, 'and')[0] + 0.3 + k * 0.35, 0.3, [392, 370, 349][k], 0.02, 5)  # sad trombone-ish
whoosh(wt(1, 'jacket')[0], 0.06, 0.35); ding(wt(1, 'clever')[0])
for k in range(8): thump(S0[2] + 0.1 + k * 0.12, 0.12, 120, 40)  # stampede of girls
whoosh(S0[2] + 1.1, 0.07, 0.4)
for k in range(6): thump(S0[3] + 0.3 + k * 0.45, 0.14, 110, 30)  # the walk
ding(wt(3, 'much')[0])
bn = wt(4, 'bin')[0]; thump(bn, 0.9, 70, 10); add(bn, nz(0.3, 2) * env(int(0.3 * SR), 0.001, 12) * 0.15); thump(bn + 0.35, 0.6, 55, 12)  # bonk + clatter
for k in range(10): thump(S0[5] + 0.2 + k * 0.28, 0.12, 120, 35)  # crowd footsteps
for k in range(4): add(S0[5] + 0.4 + k * 0.5, nz(0.25, 4) * env(int(0.25 * SR), 0.01, 10) * 0.04)  # cheering
ding(wt(5, 'much')[0])
n = int(0.6 * SR); x = np.arange(n) / SR; add(wt(6, 'they')[0] - 0.05, np.sin(2 * np.pi * np.cumsum(900 - 700 * x) / SR) * np.exp(-x * 3) * 0.04)  # record scratch
for k in range(8): thump(S0[7] + 0.4 + k * 0.3, 0.1, 130, 40)  # her footsteps
tone(wt(7, 'charger')[0] + 0.1, 0.06, 1200, 0.03, 40)  # plug click
for k in range(4): tone(S0[8] + 0.2 + k * 0.4, 0.3, [349, 330, 311, 294][k], 0.018, 4)
# ---------- low background music bed: bouncy, original, generated here ----------
BPM = 112; beat = 60 / BPM; mus = np.zeros(N)
def note(at, f, dur, amp, kind='pluck'):
    n = int(dur * SR); x = np.arange(n) / SR
    if kind == 'pluck': y = (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(4 * np.pi * f * x) + 0.15 * np.sin(6 * np.pi * f * x)) * np.exp(-x * 7)
    elif kind == 'bass': y = np.tanh(2 * np.sin(2 * np.pi * f * x)) * np.exp(-x * 3.5)
    else: y = np.sin(2 * np.pi * f * x) * np.exp(-x * 2.2)
    k = min(n, int(0.004 * SR)); y[:k] *= np.linspace(0, 1, k); i = int(at * SR)
    if i < N: mus[i:i + n] += amp * y[:N - i]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
prog_ = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]  # C G Am F
bar = 0; t0 = 0.0
while t0 < D:
    root, ch = prog_[bar % 4]
    for b in range(4):
        tb = t0 + b * beat
        note(tb, mf(root), beat * 0.9, 0.5, 'bass'); note(tb + beat / 2, mf(root + 12), beat * 0.4, 0.22, 'bass')
        arp = ch + [ch[1] + 12]; note(tb, mf(arp[b % 4] + 12), beat * 0.5, 0.16); note(tb + beat / 2, mf(arp[(b + 2) % 4] + 12), beat * 0.5, 0.12)
        if b in (1, 3): add_s = nz(0.05, 1) * env(int(0.05 * SR), 0.001, 70) * 0.15; i = int(tb * SR); mus[i:i + len(add_s)] += add_s[:max(0, N - i)]  # soft clap
        i = int(tb * SR); kk = np.sin(2 * np.pi * 55 * np.arange(int(0.15 * SR)) / SR) * np.exp(-np.arange(int(0.15 * SR)) / SR * 25) * 0.6; mus[i:i + len(kk)] += kk[:max(0, N - i)]  # kick
    if bar % 2 == 0: note(t0, mf(ch[2] + 24), beat * 3, 0.05, 'bell')
    bar += 1; t0 += 4 * beat
mus *= np.interp(t, [0, 1.0, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
