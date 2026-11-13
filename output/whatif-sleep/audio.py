# What if you stopped sleeping: ticking clock bed that gets more unsettling, SFX on actions
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(3)
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
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * x) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18): n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07): m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
S0 = [c['start'] for c in CL]
E = dict(drunk=wt(0, 'drunk'), h17=S0[1], sci=wt(1, 'scientists'), h24=S0[2], now2=wt(2, 'now'), d2=S0[3], micro=wt(3, 'your'), like=S0[4], d3=S0[5], shadows=wt(5, 'shadows'), people=wt(5, 'people'), y64=S0[6], end7=S0[7], count=wt(7, 'and'), slept=S0[8], woke=wt(8, 'and'), danger=wt(8, "it's"), cta=S0[9], follow=wt(9, 'and'))
# clock tick throughout (stops during sleep); detune and drone grow with tiredness
for s_ in np.arange(0, D, 1.0):
    if not (E['slept'] < s_ < E['danger'] - 1): add(s_, nz(0.015) * env(int(0.015 * SR), 0.0005, 200) * 0.06)
tired = np.interp(t, [0, E['d2'], E['d3'], E['y64'], E['slept'], E['slept'] + 1, D], [0.2, 0.5, 0.9, 1.0, 1.0, 0.15, 0.2])
out += (0.04 * np.sin(2 * np.pi * 45 * t) + 0.025 * np.sin(2 * np.pi * 45 * (1.01 + 0.02 * tired) * t) + 0.012 * np.sin(2 * np.pi * 135 * t)) * tired
# music box motif that detunes as hours pass
mel = [76, 79, 83, 81, 79, 76, 74, 76]
for i, s_ in enumerate(np.arange(0.2, E['slept'], 0.75)):
    det = 1 + 0.03 * np.interp(s_, [0, E['d3'], E['y64']], [0, 0.5, 1]) * np.sin(i); tone(s_, 0.9, hz(mel[i % 8]) * det, 0.02, 5)
# hook: fast clock spin
for k in range(18): add(0.4 + k * 0.2, nz(0.01) * env(int(0.01 * SR), 0.0005, 300) * 0.05)
thump(E['drunk'], 0.5, 50, 12); n = int(0.6 * SR); x = np.arange(n) / SR; add(E['drunk'], np.sin(2 * np.pi * (300 + 60 * np.sin(2 * np.pi * 5 * x)) * x) * env(n, 0.01, 4) * 0.04)
n = int(1.2 * SR); add(E['h17'] + 0.4, np.sin(2 * np.pi * np.cumsum(np.linspace(200, 500, n)) / SR) * np.hanning(n) * 0.03)
tone(E['now2'] + 0.6, 0.6, 220, 0.05, 4); tone(E['now2'] + 0.7, 0.6, 207, 0.05, 4)  # over the limit
for k in range(3): s_ = E['micro'] + k * 1.25; thump(s_, 0.4, 60, 30); add(s_, -out[int(s_ * SR):int((s_ + 0.25) * SR)] * 0.8)  # microsleep: sound drops out
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
m = int(4.0 * SR); add(E['shadows'] - 0.3, (rng.normal(0, 1, m) - ma(rng.normal(0, 1, m), 4)) * np.hanning(m) * 0.015)  # whispery hiss
for k in range(4): s_ = E['shadows'] + k * 0.9; n = int(0.6 * SR); x = np.arange(n) / SR; add(s_, np.sin(2 * np.pi * (80 + 20 * np.sin(x * 3)) * x) * np.hanning(n) * 0.05)  # walls breathing
sting(E['people'], 65, 0.09)
n = int(0.5 * SR); add(E['y64'], (nz(0.5, 2)) * env(n, 0.01, 6) * 0.08)  # newspaper rustle
for k in range(6): tone(E['count'] + 0.3 + k * 0.32, 0.12, 900 - k * 60, 0.03, 15)
sting(E['end7'] + 3.4, 55, 0.06)
for k, m_ in enumerate([72, 76, 79, 84]): tone(E['woke'] + k * 0.08, 0.6, hz(m_), 0.03, 5)  # waking chime
thump(E['danger'] - 0.1, 0.8, 70, 10); add(E['danger'] - 0.1, nz(0.15, 2) * env(int(0.15 * SR), 0.001, 30) * 0.15)  # stamp
tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
