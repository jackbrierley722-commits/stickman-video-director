# Pick an island: ocean bed, a music mood per island, SFX only on actions
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(7)
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
def pluck(at, m, amp=0.05, d=5, harm=(1, 0.4, 0.15)):
    f = hz(m); n = int(1.2 * SR); x = np.arange(n) / SR; add(at, sum(h * np.sin(2 * np.pi * f * (k + 1) * x) for k, h in enumerate(harm)) * env(n, 0.002, d) * amp)
def pad(t0, t1, ms, amp=0.02):
    n = int((t1 - t0) * SR); x = np.arange(n) / SR; e = np.minimum(1, np.minimum(x / 0.4, (x[-1] - x) / 0.4 + 1e-9)); add(t0, sum(np.sin(2 * np.pi * hz(m) * x) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.003 * x) for m in ms) * e * amp)
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def sweep(at, dur, f0, f1, amp):
    n = int(dur * SR); x = np.arange(n) / SR; f = np.linspace(f0, f1, n); add(at, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(n) * amp)
def chime(at, amp=0.04):
    for k, m in enumerate([84, 88, 91, 96]): tone(at + k * 0.05, 0.8, hz(m), amp, 5)
E = dict(look=wt(0, 'every'), every0=wt(0, 'every'), A=wt(1, 'paradise'), everyone=wt(1, 'everyone'), songs=wt(1, 'songs'), boat=wt(1, 'boat'), cA=wt(2, 'but'), bath=wt(2, 'bathroom'),
         B=wt(3, 'dollar'), cash=wt(3, 'cash'), money=wt(3, 'money'), cB=CL[4]['start'], shop=wt(4, 'shop'), like=wt(4, 'like'), because=wt(4, 'last'),
         C=wt(5, 'nothing'), frozen=wt(5, 'frozen'), still=wt(5, 'still'), here=wt(5, 'here'), cC=wt(6, 'but'), step=wt(6, 'step'), every6=wt(6, 'every'),
         D=wt(7, 'twisted'), sparkles=wt(7, 'sparkles'), sp=wt(7, 'superpower'), yest=wt(7, 'neighbour'), cD=CL[8]['start'], crabs2=wt(8, 'and'), end=CL[9]['start'], comment=wt(9, 'comment'), follow=wt(9, 'follow'))
# ocean bed: slow swells of filtered noise (still on island C)
sw = ma(rng.normal(0, 1, N), 60) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t)) * 0.12
calm = np.interp(t, [E['C'] - 0.2, E['C'] + 0.3, E['cC'] - 0.2, E['cC'] + 0.3], [1, 0.15, 0.15, 1]); out += sw * calm
for g in np.arange(2.5, D - 5, 9.0):  # gulls
    if not (E['C'] < g < E['cC']): sweep(g, 0.35, 1800, 1300, 0.012); sweep(g + 0.45, 0.3, 1900, 1400, 0.01)
# opening: bright plucks, 4 hits on the 4 islands
for k, s_ in enumerate([0, 0.5, 1.0, 1.5]): pluck(s_, [72, 76, 79, 84][k], 0.06); thump(s_, 0.25, 60, 25)
for k, s_ in enumerate(np.arange(E['look'], E['A'], 0.3)): pluck(s_, [72, 79, 76, 81, 79, 84][k % 6], 0.03, 7)
# A: romantic pads + harp
pad(E['A'], E['cA'], [65, 69, 72, 76], 0.012)
for k, s_ in enumerate(np.arange(E['A'], E['cA'], 0.25)): pluck(s_, [77, 81, 84, 88, 84, 81][k % 6], 0.022, 6)
chime(E['everyone'] - 0.05, 0.03)
for k in range(6): pluck(E['songs'] + k * 0.07, [52, 56, 59, 64, 68, 71][k], 0.04, 3, (1, 0.6, 0.3, 0.2))
tone(E['boat'], 0.9, 196, 0.05, 2); tone(E['boat'], 0.9, 247, 0.03, 2)  # little boat horn
sweep(E['cA'] - 0.05, 0.5, 900, 120, 0.06)  # record stop
for k in range(3): thump(E['bath'] + 0.2 + k * 0.22, 0.35, 120, 40)  # knock knock knock
# B: steel-drum calypso
for k, s_ in enumerate(np.arange(E['B'], E['cB'], 0.25)): pluck(s_, [67, 71, 74, 76, 74, 71, 72, 74][k % 8], 0.03, 9, (1, 0.5, 0.0, 0.25))
for s_ in np.arange(E['B'], E['cB'], 0.5): thump(s_, 0.15, 55, 20)
tone(E['cash'], 0.12, 2400, 0.06, 20); tone(E['cash'] + 0.08, 0.6, 3200, 0.05, 6)  # ka-ching
m = int(2.2 * SR); add(E['money'] + 0.3, nz(2.2, 2) * np.hanning(m) * 0.04)  # bills fluttering
for k in range(10): tone(E['money'] + 0.3 + k * 0.09, 0.15, 3000 + (k % 3) * 400, 0.025, 25)  # coins
for k, (f, d) in enumerate([(311, 0.4), (293, 0.4), (277, 0.4), (262, 1.0)]): n = int(d * SR); x = np.arange(n) / SR; add(E['cB'] + 0.1 + k * 0.42, np.sign(np.sin(2 * np.pi * f * x * (1 - 0.02 * x * (k == 3)))) * env(n, 0.02, 2) * 0.02)  # sad trombone
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
sweep(E['because'], 1.0, 300, 900, 0.03)
# C: time stops. frozen shimmer, one held tone, no waves
tone(E['C'], 0.1, 1800, 0.05, 20); pad(E['C'], E['cC'], [76, 83], 0.008)
chime(E['frozen'], 0.03); sweep(E['frozen'], 0.9, 2400, 3000, 0.01)
for k in range(10): tone(E['here'] + k * 0.5, 0.05, 1500, 0.04 * (1 - k / 12), 60)  # clock ticks
for s_ in np.arange(E['cC'] + 0.2, E['step'] + 0.4, 0.42): thump(s_, 0.3, 140, 45)  # steps on wooden dock
sweep(E['step'] + 0.3, 1.6, 400, 50, 0.08); thump(E['every6'], 0.6, 38)  # years rush in
# D: magical whole-tone arps, sparkles, power roulette, flying whoosh, crabs
for k, s_ in enumerate(np.arange(E['D'], E['cD'], 0.2)): pluck(s_, [72, 74, 76, 78, 80, 82][(k * 2) % 6] + 12 * (k % 2), 0.018, 8)
chime(E['sparkles'], 0.035)
for s_ in np.arange(E['sp'], E['yest'] - 0.1, 1 / 12): tone(s_, 0.03, 1100, 0.03, 80)
tone(E['yest'] - 0.1, 0.3, 1760, 0.05, 8)
m = int(1.4 * SR); x = np.linspace(0, 1, m); add(E['yest'] + 0.2, nz(1.4, 4) * np.sin(np.pi * x) ** 2 * 0.06)
sweep(E['cD'], 0.35, 600, 250, 0.04)
for s_ in np.arange(E['cD'] + 0.2, E['end'] - 0.2, 0.13): add(s_ + rng.random() * 0.04, nz(0.01) * env(int(0.01 * SR), 0.0005, 300) * 0.06)  # crab clicks
for k in range(3): sweep(E['crabs2'] + 0.25 + k * 0.4, 0.18, 700, 500, 0.03)  # crab sass
# transition whooshes on SOME cuts only: the four island reveals and the BUT catches
def whoosh(at, amp=0.05):
    m = int(0.45 * SR); x = np.linspace(0, 1, m); n = nz(0.45, 1); lo = ma(n, 3); hi = n - ma(n, 12)
    add(at - 0.3, (lo * x + hi * (1 - x) * 0.6) * np.sin(np.pi * x) ** 2 * amp * 3)
for c in (wt(0, 'forever') + 0.45, E['A'] - 0.1, E['B'] - 0.1, E['C'] - 0.1, E['D'] - 0.1, E['end']): whoosh(c, 0.05)
for c in (E['cB'], E['cC'], E['cD']): whoosh(c, 0.035)
# end: pick hits, ticking, follow
for k, w in enumerate(['a', 'b', 'c', 'd']): s_ = wt(9, w); pluck(s_, [72, 76, 79, 84][k], 0.05); thump(s_, 0.3, 60, 25)
for s_ in np.arange(E['comment'], D - 0.4, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.07)
tone(E['follow'], 0.12, 1400, 0.06, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.04, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])  # no fade: video loops
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.4 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.3 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
