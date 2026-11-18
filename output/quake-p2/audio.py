# Earthquake P2 (vote A, the stairs): SFX + low tense music bed, under the narration
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
# fire alarm the whole way down, echoing stairwell
for k in range(int(D / 0.5)): tone(k * 0.5, 0.22, 2900, 0.012, 4)
out += (nz(D, 1) - nz(D, 4)) * 0.008  # smoke hiss
# door opens into the stairwell
thump(S0[1] + 0.3, 0.3, 110, 25); creak(S0[1] + 0.35, 0.7, 260, 0.03); thump(S0[1] + 1.9, 0.4, 80, 18)
# shirt pulled up
sh = wt(1, 'shirt')[0]; m = int(0.4 * SR); add(sh - 0.1, (nz(0.4, 1) - nz(0.4, 3)) * np.hanning(m) * 0.05)
# footsteps on concrete stairs, echoey
def step(at, amp=0.12): thump(at, amp, 140, 30); add(at, nz(0.04, 1) * env(int(0.04 * SR), 0.001, 70) * amp * 0.3); thump(at + 0.09, amp * 0.25, 140, 30)
for a_, b_ in [(S0[1] + 1.0, S0[1] + 2.4), (S0[2], S0[3]), (S0[3], wt(3, 'hits')[0] - 0.2), (S0[5], S0[6] + 0.6)]:
    k = a_
    while k < b_: step(k); k += 0.42
# aftershock: rumble, rattling rail, creaks
hits = wt(3, 'hits')[0]; i0 = int((hits - 0.2) * SR); i1 = int((S0[5] - 0.3) * SR); xx = np.arange(i1 - i0) / SR; L = xx[-1]
strength = np.clip(xx * 4, 0, 1) * np.clip(1 - xx / L, 0, 1) ** 0.7
out[i0:i1] += (ma(rng.normal(0, 1, i1 - i0), 120) * 6 + np.sin(2 * np.pi * 32 * xx) * 0.2) * strength * 0.25
thump(hits - 0.15, 0.9, 45, 6)
for k in range(int(L / 0.12)): add(hits + k * 0.12, nz(0.03, 1) * env(int(0.03 * SR), 0.001, 80) * 0.04 * (1 - k * 0.12 / L))
creak(hits + 0.3, 1.2, 140, 0.04); creak(hits + 1.4, 1.0, 110, 0.03)
thump(wt(4, 'grab')[0], 0.3, 220, 40); tone(wt(4, 'grab')[0], 0.4, 520, 0.01, 10)  # hand slaps the metal rail
# smoke rising from below: deep whoosh
c5 = S0[5]; m = int((S0[6] - c5) * SR); xx = np.arange(m) / SR; add(c5, (ma(rng.normal(0, 1, m), 30) * 2) * np.clip(xx, 0, 1) * 0.05)
# hand on the door
thump(wt(6, 'touch')[0] + 0.25, 0.2, 180, 40)
sting_at = wt(6, "it's")[0]; tone(sting_at, 0.6, 523, 0.02, 5); tone(sting_at + 0.05, 0.6, 784, 0.015, 5)
tone(S0[7] + 0.2, 0.2, 660, 0.04, 12); tone(wt(7, 'option', 1)[0], 0.2, 990, 0.04, 12); tone(wt(7, 'comment')[0], 0.2, 880, 0.035, 12)
# ---------- low tense music bed: dark pulse + drone, original ----------
BPM = 120; beat = 60 / BPM; mus = np.zeros(N)
def mput(at, y):
    i = int(at * SR)
    if i < N: mus[i:i + len(y)] += y[:N - i]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
seq = [45, 45, 48, 45, 44, 44, 47, 44]; tb = 0.0; k = 0
while tb < D:
    f = mf(seq[k % 8]); nn = int(beat * 0.45 * SR); xx = np.arange(nn) / SR; mput(tb, np.tanh(2.5 * np.sin(2 * np.pi * f * xx)) * np.exp(-xx * 6) * 0.5)
    if k % 2 == 0: kk = int(0.16 * SR); x2 = np.arange(kk) / SR; mput(tb, np.sin(2 * np.pi * 48 * x2 * (1 - 0.4 * x2)) * np.exp(-x2 * 20) * 0.7)
    tb += beat / 2; k += 1
mus += (np.sin(2 * np.pi * mf(33) * t) + 0.5 * np.sin(2 * np.pi * mf(40) * t)) * 0.18 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.2 * t))
mus *= np.interp(t, [0, 0.6, D - 1.5, D], [0, 1, 1, 0])
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
