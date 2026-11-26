# Send this to your friend who's always late: SFX only (no music), all under the narration
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
E = dict(late0=wt(0, 'your'), shirt=S0[1], traffic=S0[2], door=wt(2, 'they'), comment=S0[3], waited=wt(3, 'waited'), but=S0[4], psych=wt(4, 'psychologists'), brain=wt(4, 'their'), every=wt(4, 'every'),
         think=S0[5], two=wt(5, 'two'), follow=S0[6], see=wt(6, "they'll"))
def ping(at, amp=0.05): tone(at, 0.25, 1320, amp, 10); tone(at + 0.09, 0.3, 1760, amp * 0.8, 9)
def whoosh(at, amp=0.08, dur=0.4):
    n = int(dur * SR); x = np.arange(n) / SR; y = ma(rng.normal(0, 1, n), 6) - ma(rng.normal(0, 1, n), 30); add(at, y * np.sin(np.pi * x / dur) ** 2 * amp)
# shower running (only while the bathroom is on screen)
sh = (nz(D, 1) - nz(D, 3)) * 0.05 + nz(D, 12) * 0.03
gate = np.interp(t, [0, E['shirt'] - 0.05, E['shirt'], E['think'] - 0.05, E['think'], D], [1, 1, 0, 0, 1, 1]); out += sh * gate
ping(-0.05 + 0.06); ping(E['shirt'] + 0.05); ping(E['traffic'] + 0.05)
for k in range(6): whoosh(E['shirt'] + 0.3 + k * 0.33, 0.05, 0.3)  # shirts flying
for k in range(12): thump(E['door'] + k * 0.26, 0.16, 110, 40)  # 12 steps next door
tone(E['comment'] - 0.2, 0.5, 784, 0.03, 4); tone(E['comment'] - 0.05, 0.6, 659, 0.03, 4)  # doorbell ding-dong
for k in range(10): thump(E['comment'] + 0.2 + k * 0.35, 0.12, 140, 50)  # foot tapping outside
tone(E['comment'] + 0.05, 0.2, 990, 0.04, 12)
tone(E['psych'], 0.8, 880, 0.04, 4); tone(E['psych'] + 0.12, 0.8, 1320, 0.03, 4)  # idea ding
for k in range(3): tone(E['brain'] + 0.3 + k * 0.35, 0.08, 700 + k * 200, 0.035, 20)  # plan rows
thump(E['every'], 0.4, 70, 12)
for k in range(int((E['follow'] - E['two']) / 0.06)): tone(E['two'] + k * 0.06, 0.03, 1500, 0.015, 80)  # clock spinning
ping(E['see'] - 0.05, 0.06)  # their phone finally gets the message
tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
