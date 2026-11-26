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
pr = [wt(2, 'press')[0] + 0.15, wt(3, 'again')[0], wt(4, 'again')[0]] + [S0[5] + 0.35 + i * 0.36 for i in range(7)]
def click(at, amp=1.0): thump(at, 0.5 * amp, 140, 45); tone(at, 0.04, 2400, 0.04 * amp, 80); add(at, nz(0.02, 1) * env(int(0.02 * SR), 0.001, 150) * 0.15 * amp)
def ka(at, amp=0.03): tone(at, 0.12, 1568, amp, 18); tone(at + 0.07, 0.35, 2093, amp, 8)
for i, p in enumerate(pr): click(p, 1.0 if i < 3 else 0.7); ka(p + 0.12, 0.03 if i < 3 else 0.018)
tone(wt(0, 'million')[0], 0.5, 1046, 0.02, 6); tone(wt(0, 'million')[0] + 0.08, 0.6, 1568, 0.02, 6)  # sparkle on the million
whoosh(wt(1, 'bro')[0] - 0.15, 0.08, 0.35); thump(wt(1, 'bro')[0], 0.3, 120, 30)  # bro pops in
h = wt(3, 'he')[0]; whoosh(h - 0.45, 0.1, 0.45); thump(h + 0.1, 1.0, 45, 7); add(h + 0.1, nz(0.3, 3) * env(int(0.3 * SR), 0.002, 12) * 0.12)  # house lands
whoosh(wt(4, 'bro')[0] - 0.15, 0.08, 0.3); tone(wt(4, 'bro')[0], 0.08, 900, 0.03, 30)  # sign flips
for k in range(14): add(wt(5, 'bro')[0] - 0.2 + k * 0.07, nz(0.05, 2) * env(int(0.05 * SR), 0.001, 60) * 0.06)  # cash rustle
tone(S0[6] + 0.35, 0.12, 1320, 0.035, 20); tone(S0[6] + 0.45, 0.2, 1760, 0.03, 15)  # voice note ping
tone(wt(8, 'comment')[0], 0.2, 880, 0.03, 12)
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
