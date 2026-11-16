# Prison escape Part 4 (vote B, the yard): SFX only, under the narration
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
E = dict(recap=S0[1], gate=S0[2], k1=wt(2, 'first'), no1=wt(2, 'no'), k2=wt(2, 'second'), no2=wt(2, 'no', 1), dex=S0[3], scream=S0[4], guards=wt(4, 'every'), k3=S0[5], click=wt(5, 'click'), open=wt(5, 'the'),
         light=S0[6], yard=wt(6, 'thirty'), truck=wt(6, 'a'), optA=S0[7], optB=wt(7, 'option', 1), comment=wt(7, 'comment'))
out += (nz(D, 2) - nz(D, 10)) * 0.012 + nz(D, 60) * 0.02  # night wind
def jingle(at, n=5, amp=0.02):
    for k in range(n): tone(at + k * 0.045, 0.12, 2600 + 400 * ((k * 3) % 4), amp, 25)
def clunk(at): thump(at, 0.5, 120, 40); tone(at, 0.06, 900, 0.03, 50)
def scrape(at, dur=0.35): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 5)) * np.hanning(m) * 0.05)
# frame 1: the searchlight is already on you
thump(0.05, 0.9, 45, 6); i1 = int(E['recap'] * SR); out[:i1] += np.sin(2 * np.pi * 110 * t[:i1]) * 0.02 * np.interp(t[:i1], [0, 0.3, E['recap'] - 0.2, E['recap']], [0, 1, 1, 0])
for k in range(int((E['gate'] - E['recap'] - 0.3) / 0.28)): thump(E['recap'] + 0.2 + k * 0.28, 0.22, 110, 32)  # running
jingle(E['recap'] + 0.6); jingle(E['gate'] + 0.3, 7)
for at in (E['k1'], E['k2']): scrape(at + 0.1); clunk(at + 0.45)
for at in (E['no1'], E['no2']): tone(at, 0.25, 160, 0.04, 8)
# Dex screams from the window, echoing off the yard
m = int(1.2 * SR); x = np.arange(m) / SR; add(E['dex'] + 0.05, nz(1.2, 3) * np.exp(-x * 3) * 0.04)
i0 = int(E['scream'] * SR); xx = np.arange(N - i0) / SR; out[i0:] += np.sign(np.sin(2 * np.pi * (650 + 180 * (np.sin(2 * np.pi * 1.1 * xx) > 0)) * xx)) * 0.01 * np.clip(xx * 3, 0, 1) * np.interp(t[i0:], [E['optA'], E['optA'] + 0.5, D - 1.0, D - 0.9], [1, 0.45, 0.45, 0])  # sirens
for k in range(4): thump(E['guards'] + 0.4 + k * 0.5, 0.18, 90, 30)  # distant doors banging
scrape(E['k3'] + 0.1); jingle(E['k3']); tone(E['click'] + 0.02, 0.05, 2400, 0.06, 60); thump(E['click'] + 0.02, 0.3, 200, 50)  # CLICK
m_ = int(1.1 * SR); x_ = np.arange(m_) / SR; add(E['open'] + 0.1, ma(np.sign(np.sin(2 * np.pi * np.cumsum(180 + 40 * np.sin(x_ * 6)) / SR)), 6) * np.hanning(m_) * 0.04)  # gate creak
for k in range(int((E['light'] - E['open'] - 0.4) / 0.3)): thump(E['open'] + 0.5 + k * 0.3, 0.2, 110, 32)
thump(E['light'] + 0.5, 0.9, 40, 5); tone(E['light'] + 0.5, 1.4, 110, 0.03, 1.5)  # searchlight clunks onto you
i0 = int(E['truck'] * SR); out[i0:] += (np.sin(2 * np.pi * 38 * t[i0:]) * 0.03 + ma(rng.normal(0, 1, N - i0), 40) * 0.05) * np.clip((t[i0:] - E['truck']) * 2, 0, 1)  # truck idling
for k in range(5): thump(E['optA'] + 0.3 + k * 0.75, 0.45, 48); thump(E['optA'] + 0.55 + k * 0.75, 0.28, 45)  # heartbeat
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12); tone(E['comment'], 0.2, 880, 0.04, 12)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
