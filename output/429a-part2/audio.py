# 429A part 2: 1986 room tone, record crackle music, TV static, rotary bell, pick-up, slam, handle, knocks
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(1986)
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
def sine(f, dur): x = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * x)
def nz(dur, k=1): return ma(rng.normal(0, 1, int(dur * SR)), k)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def tone(at, dur, f, amp, d=6): n = int(dur * SR); add(at, sine(f, dur) * env(n, 0.002, d) * amp)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def whoosh(at, amp=0.05):
    m = int(0.45 * SR); x = np.linspace(0, 1, m); n = nz(0.45, 1); lo = ma(n, 3); hi = n - ma(n, 12)
    add(at - 0.3, (lo * x + hi * (1 - x) * 0.6) * np.sin(np.pi * x) ** 2 * amp * 3)
def ring(at, dur, amp=0.05):
    s_ = at
    while s_ < at + dur:
        m = int(min(1.0, at + dur - s_) * SR); x = np.arange(m) / SR; trem = (np.sin(2 * np.pi * 18 * x) > 0).astype(float)
        add(s_, (np.sin(2 * np.pi * 980 * x) + 0.8 * np.sin(2 * np.pi * 1240 * x) + 0.3 * np.sin(2 * np.pi * 2900 * x)) * trem * env(m, 0.003, 0.4) * amp); s_ += 1.8
E = dict(inside=wt(0, 'inside'), tea=wt(0, 'and'), hot=wt(0, 'hot'), record=wt(1, 'a'), tv=wt(1, 'a', 1), cal=wt(1, 'even'), desk=CL[2]['start'], but2=wt(2, 'but'), leo2=wt(2, 'leo'), never=CL[3]['start'], like=wt(3, 'like'),
         phone=CL[4]['start'], picks=wt(4, 'leo'), w5=CL[5]['start'], behind=CL[6]['start'], slams=wt(6, 'slams'), gone=wt(6, 'gone'), knockW=wt(6, 'knocks'), optA=CL[7]['start'], optB=wt(7, 'option', 1), comment=wt(7, 'comment'), follow=wt(7, 'follow'))
silent = (t > E['w5'] - 0.3) & (t < E['behind'])
# corridor hum before the door, warm room tone after
lvl = np.interp(t, [0, 0.2, E['handle'] if 'handle' in E else wt(6, 'handle'), D], [1, 1, 1, 1]) * np.where(silent, 0.1, 1.0)
out += (0.04 * np.sin(2 * np.pi * 50 * t) + 0.02 * np.sin(2 * np.pi * 100 * t)) * lvl * (t < E['inside'])
out += ma(rng.normal(0, 1, N), 30) * 0.018 * lvl
# the record: muffled 80s ballad + vinyl crackle, playing in the room until the phone rings
rec = (t > E['inside'] - 0.1) & (t < E['phone'])
prog_ = [(57, 61, 64), (53, 57, 60), (55, 59, 62), (52, 55, 59)]
mus = np.zeros(N)
for k, s_ in enumerate(np.arange(E['inside'] - 0.1, E['phone'], 2.0)):
    ch = prog_[k % 4]; n = int(2.0 * SR); x = np.arange(n) / SR
    seg = sum(np.sin(2 * np.pi * hz(m) * x) + 0.2 * np.sin(2 * np.pi * hz(m) * 2 * x) for m in ch) * np.minimum(1, x / 0.3) * np.exp(-x * 0.6)
    for j, m in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]): i0 = int(j * 0.5 * SR); seg[i0:i0 + int(0.45 * SR)] += np.sin(2 * np.pi * hz(m) * x[:int(0.45 * SR)]) * np.exp(-x[:int(0.45 * SR)] * 4) * 0.6
    i = int(s_ * SR); mus[i:i + n] += seg[:max(0, N - i)]
mus = ma(mus, 6) * 0.012; crack = (rng.random(N) > 0.9993) * rng.normal(0, 1, N) * 0.15 + ma(rng.normal(0, 1, N), 2) * 0.004
out += (mus + crack) * rec * np.interp(t, [E['record'] - 0.5, E['record'], E['record'] + 1.5, E['record'] + 2.5], [0.6, 1.6, 1.6, 0.8])
# TV static while it's on screen
tvm = np.interp(t, [E['tv'] - 0.2, E['tv'], E['tv'] + 1.4, E['tv'] + 1.8], [0, 1, 1, 0.2]) * (t < E['phone'])
out += (rng.normal(0, 1, N) - ma(rng.normal(0, 1, N), 4)) * 0.02 * tvm
# hook: door creak open + warm sting, kettle-hiss on tea
m = int(1.1 * SR); x = np.arange(m) / SR; add(0.0, ma(np.sign(np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(x * 4)) / SR)), 6) * np.hanning(m) * 0.06)
whoosh(E['inside'] - 0.1, 0.05); sting(E['inside'], 87, 0.05)
m = int(1.6 * SR); add(E['tea'], (nz(1.6) - nz(1.6, 3)) * np.hanning(m) * 0.03); tone(E['hot'] + 0.2, 0.5, 220, 0.04, 4)
tone(E['cal'] + 1.2, 0.6, 330, 0.03, 4)
# guest book: page turn, pen scratch, sting on LEO
m = int(0.5 * SR); add(E['desk'] + 0.2, nz(0.5, 3) * np.hanning(m) * 0.05)
for k in range(8): add(E['but2'] + 0.6 + k * 0.12, (nz(0.08) - nz(0.08, 4)) * env(int(0.08 * SR), 0.005, 30) * 0.06)
sting(E['leo2'], 73, 0.09); thump(E['leo2'], 0.5, 42)
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
# rotary bell until pick-up, click
ring(E['phone'] - 0.05, E['picks'] + 0.3 - E['phone']); thump(E['picks'] + 0.3, 0.3, 300, 60); tone(E['picks'] + 0.3, 0.05, 2200, 0.05, 60)
# whisper bed: line hiss
m = int((E['behind'] - E['w5'] + 0.3) * SR); add(E['w5'] - 0.2, (rng.normal(0, 1, m) - ma(rng.normal(0, 1, m), 6)) * 0.012 * np.hanning(m))
# SLAM, handle, knocks
whoosh(E['slams'] - 0.05, 0.06); thump(E['slams'], 1.0, 45, 10); add(E['slams'], nz(0.4, 2) * env(int(0.4 * SR), 0.001, 12) * 0.25)
tone(E['gone'] - 0.15, 0.4, 2600, 0.05, 10); tone(E['gone'] - 0.05, 0.4, 3400, 0.03, 10); sting(E['gone'], 65, 0.06)
for k in range(3): kt = E['knockW'] + 0.3 + k * 0.32; thump(kt, 0.7, 110, 30); add(kt, nz(0.06, 3) * env(int(0.06 * SR), 0.001, 60) * 0.15)
# choice: ticking, rising drone, follow pop
for s_ in np.arange(E['optA'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.07)
tone(E['optA'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12)
m = int((D - E['optA']) * SR); x = np.arange(m) / SR; add(E['optA'], np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
tone(E['follow'], 0.12, 1400, 0.06, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.04, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
a0, a1 = int(CL[5]['start'] * SR), int((CL[5]['start'] + CL[5]['dur']) * SR); seg = vo[a0:a1].copy(); ech = np.zeros_like(seg); d = int(0.08 * SR); ech[d:] += seg[:-d] * 0.35; vo[a0:a1] = seg * 1.4 + ech
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
