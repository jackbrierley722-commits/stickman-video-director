# Shower temperature: SFX + low music bed, bleeped swears, hard cut at the end: SFX only, under the narration
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
# shower running the whole time (hiss), louder when it's hot
cut = wt(19, 'fucking')[0] + 0.14
w = rng.normal(0, 1, N); hissv = (w - ma(w, 4)) * 0.025 + ma(w, 30) * 0.03; out += hissv * np.where(t < cut, 1, 0)
sz = lambda at, amp=0.05: add(at, (nz(0.4, 1) - nz(0.4, 3)) * env(int(0.4 * SR), 0.005, 8) * amp)
sz(wt(7, 'your')[0], 0.12); tone(wt(7, 'your')[0], 0.25, 880, 0.02, 10)  # hand hisses, yelp sting
tone(wt(1, 'fuck')[0] - 0.4, 0.4, 330, 0.02, 6)
for at in (wt(12, 'you')[0] + 0.5, wt(12, 'she')[0] + 0.3, wt(15, 'you')[0] + 0.2): tone(at, 0.05, 1500, 0.03, 60); tone(at + 0.06, 0.05, 1300, 0.03, 60)  # knob clicks
for k in range(5): tone(wt(13, 'she')[0] + 0.1 + k * 0.45, 0.25, 1400, 0.03, 9)  # sonar pings
tone(wt(11, 'unfortunately')[0] + 0.6, 0.6, 98, 0.03, 3)
for k in range(4): thump(S0[15] + 0.2 + k * 0.3, 0.12, 120, 40)  # wet footsteps out
for j, f in enumerate([523, 659, 784]): tone(wt(15, 'and')[0] + 0.3 + j * 0.08, 1.2, f, 0.02, 2)  # bliss
for k in range(8): tone(S0[17] + 0.1 + k * 0.17, 0.03, 2400, 0.015, 90)  # clock ticks on the card
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
for ci_, c_ in enumerate(CL):
    for w_ in c_['words']:
        if w_['w'].lower().strip('.,!?') in ('fuck', 'fucking'):
            i0, i1 = int((w_['a'] - 0.02) * SR), int((w_['b'] + 0.02) * SR); lvl = np.sqrt(np.mean(vo[max(0, i0 - int(0.5 * SR)):i0] ** 2) + 1e-9) * 1.4; vo[i0:i1] = np.sin(2 * np.pi * 1000 * np.arange(i1 - i0) / SR) * lvl
vo[int((wt(19, 'fucking')[0] + 0.14) * SR):] = 0
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9; mix[int((wt(19, 'fucking')[0] + 0.14) * SR):] = 0
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
