# Upbeat explainer bed + SFX for the never-eat video; narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(77)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum() or ch == "'") == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N); mus = np.zeros(N)
def add(at, y, buf=None):
    b = out if buf is None else buf; i = int(at * SR)
    if 0 <= i < N: b[i:i + len(y)] += y[:N - i]
def env(n, d=8): x = np.arange(n) / SR; e = np.exp(-x * d); a = max(1, int(0.003 * SR)); e[:a] *= np.linspace(0, 1, a); return e
def tone(at, dur, f, amp, d=6, sq=False): m = int(dur * SR); x = np.arange(m) / SR; w = np.sign(np.sin(2 * np.pi * f * x)) if sq else np.sin(2 * np.pi * f * x); add(at, amp * w * env(m, d))
bpm = 120; beat = 0.5; nb = int(D / beat) + 1
chords = [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 294]]
for b in range(nb):
    at = b * beat; ch = chords[(b // 8) % 4]
    if b % 2 == 0: x = np.arange(int(0.2 * SR)) / SR; add(at, 0.4 * np.sin(2 * np.pi * (48 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.12 * SR); add(at, 0.12 * ma(rng.normal(0, 1, m), 2) * env(m, 25), mus)
    m = int(0.03 * SR); hn = rng.normal(0, 1, m); add(at + beat / 2, 0.04 * (hn - ma(hn, 3)) * env(m, 80), mus)
    for q in range(2): f = ch[(b * 2 + q) % 3] * 2; m = int(beat / 2 * SR); x = np.arange(m) / SR; add(at + q * beat / 2, 0.03 * np.sign(np.sin(2 * np.pi * f * x)) * env(m, 12), mus)
    m = int(beat * SR); x = np.arange(m) / SR; add(at, 0.08 * np.sin(2 * np.pi * ch[0] / 2 * x) * env(m, 3), mus)
g_ = wt(6, 'gone'); out += mus * np.interp(t, [0, 0.3, g_ - 0.05, g_, g_ + 2.0, D - 1.5, D], [0, 0.8, 0.8, 0, 0.6, 0.6, 0])
def ev(ci, w, n=0): return wt(ci, w, n)
# poofs as each food vanishes
for w_ in ['hunger', 'cooking', 'food', 'ever']:
    m = int(0.4 * SR); add(ev(0, w_), 0.14 * ma(rng.normal(0, 1, m), 10) * env(m, 9)); tone(ev(0, w_), 0.2, 900, 0.05, 15)
add(ev(0, 'food') + 0.3, 0.12 * ma(rng.normal(0, 1, int(0.4 * SR)), 10) * env(int(0.4 * SR), 9))
# clock ticks + coin-up for the years counter
for k in range(8): tone(ev(1, 'hour') + k * 0.25, 0.03, 2500, 0.05, 80)
for i, f in enumerate([523, 659, 784, 1047]): tone(ev(1, 'years') + i * 0.08, 0.3, f, 0.06, 8, True)
# negative stings for side effects
for w_, ci_ in [('shrink', 3), ('starve', 4), ('thinner', 5)]:
    for i, f in enumerate([330, 247]): tone(ev(ci_, w_) + i * 0.15, 0.3, f, 0.07, 6, True)
# body diagram whoosh
m = int(0.6 * SR); x = np.arange(m) / SR; add(ev(2, 'body') - 0.2, 0.1 * ma(rng.normal(0, 1, m), 8) * np.sin(np.pi * x / x[-1]))
# party: cheer + kazoo-ish birthday notes, chatter, pizza
m = int(1.4 * SR); x = np.arange(m) / SR; add(ev(6, 'birthday'), 0.08 * ma(rng.normal(0, 1, m), 14) * np.hanning(m))
for i, f in enumerate([392, 392, 440, 392, 523, 494]): tone(ev(6, 'birthday') + i * 0.18, 0.18, f, 0.05, 6, True)
m = int(1.6 * SR); add(ev(6, 'family'), 0.05 * ma(rng.normal(0, 1, m), 30) * np.hanning(m))
# "Gone": everything cuts, low boom
thump_n = int(0.6 * SR); x = np.arange(thump_n) / SR; add(ev(6, 'gone'), 0.6 * np.sin(2 * np.pi * 45 * x) * np.exp(-x * 5))
# chalk scratches whenever something is being drawn or written
def scratch(at, dur):
    for k_ in range(3): tone(at + k_ * 0.07, 0.5, 1800 + ((int(at * 100) + k_ * 7) % 9) * 120, 0.018, 7)
for c_ in CL:
    for i_, w_ in enumerate(c_['words']):
        if i_ % 3 == 0: scratch(w_['a'] + 0.05, 0.5)
scratch(0.1, 1.2); scratch(CL[2]['start'] + 0.3, 2.2)
out *= np.interp(t, [0, 0.1, D - 0.7, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
