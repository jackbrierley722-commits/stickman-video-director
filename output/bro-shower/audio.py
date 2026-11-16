# Watch your bro shower: SFX only (no music), all under the narration
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
S0 = [c['start'] for c in CL]
def roar(a, b, amp=0.08):
    i0, i1 = int(a * SR), min(N, int(b * SR)); n = i1 - i0; y = (ma(rng.normal(0, 1, n), 3) - ma(rng.normal(0, 1, n), 40)); e = np.minimum(1, np.arange(n) / (0.15 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.2 * SR)); out[i0:i1] += y * e * amp
roar(0, S0[1] - 0.1, 0.07); whoosh(0.05, 0.1, 0.8)  # frame 1: lift-off
for k in range(5): add(wt(1, 'so')[0] + 0.3 + k * 0.35, nz(0.05, 1) * env(int(0.05 * SR), 0.001, 60) * 0.06); tone(wt(1, 'so')[0] + 0.3 + k * 0.35, 0.08, 1800, 0.012, 40)  # ladder clanks
tone(wt(1, "it's")[0], 0.5, 220, 0.04, 5); tone(wt(1, "it's")[0] + 0.2, 0.6, 180, 0.04, 4)  # sad trombone-ish
for k in range(6): thump(S0[2] + 0.3 + k * 0.45, 0.15, 130, 40)  # stilt clomps
sn = wt(2, 'then')[0]; whoosh(sn + 0.5, 0.12, 0.9); thump(S0[3] - 0.25, 0.9, 50, 10); add(S0[3] - 0.25, nz(0.25, 2) * env(int(0.25 * SR), 0.002, 12) * 0.15)  # topple + crash
i0 = int(S0[3] * SR); i1 = int((wt(3, 'headshot')[0] + 1.0) * SR); x = np.arange(i1 - i0) / SR; out[i0:i1] += np.sin(2 * np.pi * (180 + 8 * np.sin(x * 30)) * x) * 0.015 + ma(rng.normal(0, 1, i1 - i0), 2) * 0.01  # drone buzz
hs = wt(3, 'headshot')[0]; whoosh(hs - 0.5, 0.06, 0.4); thump(hs - 0.05, 0.6, 140, 30); tone(hs - 0.05, 0.15, 900, 0.04, 20); thump(hs + 0.9, 0.5, 60, 14)  # bonk, then crash
lt = wt(4, 'and')[0]
for k in range(int((S0[5] - lt) / 0.04)): add(lt - 0.2 + k * 0.04, nz(0.02, 1) * env(int(0.02 * SR), 0.001, 90) * 0.05)  # fuse fizz
roar(lt + 0.15, S0[5] - 0.05, 0.1); thump(lt + 0.15, 0.9, 45, 6)
i0 = int(S0[5] * SR); out[i0:] += np.sin(2 * np.pi * 60 * t[i0:]) * 0.004  # space hum (almost silent)
for k in range(3): tone(wt(6, 'you')[0] - 0.1 + k * 0.1, 0.1, 2400 - k * 300, 0.03, 30)  # telescope zoom clicks
i0 = int(wt(6, 'you')[0] * SR); i1 = int(S0[7] * SR); out[i0:i1] += (ma(rng.normal(0, 1, i1 - i0), 1) - ma(rng.normal(0, 1, i1 - i0), 6)) * 0.035  # shower running
tone(S0[7] + 0.2, 0.4, 330, 0.03, 6)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
