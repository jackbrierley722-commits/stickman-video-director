# In this town (body swap Mondays): plucky day music, night pad, music box flashback, swap whooshes and action SFX under the narration
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
def W(ci, w, n=0): return wt(ci, w, n)
E = dict(except0=W(0, 'except'), now0=W(0, 'and'), wake=S0[1], dadB=W(1, 'last'), four=W(1, 'four'), toast=W(1, 'he', 1), teach=S0[2], hw=W(2, 'he'), wed=S0[3], post=W(3, 'because'),
         rule=S0[4], bed=W(4, 'be'), who=W(4, 'whoever'), hale=S0[5], every5=W(5, 'every'), never=W(5, 'he'), leo=S0[6], base=W(6, 'he'), eyes=W(6, 'eyes'),
         swap7=S0[7], exLeo=W(7, 'except'), patrol=W(7, 'by'), drag=W(7, 'they'), like=S0[8], follow8=W(8, 'follow'), after=W(8, 'because'), mum=S0[9], mondays=W(9, 'she'), mayor=W(9, 'this'), shrug=W(9, 'she', 1),
         climb=S0[10], mach=S0[11], wires=W(11, 'thousands'), beds=W(11, 'one'), chair=W(11, 'and'), strap=W(11, 'leo'), dark=S0[12], wall=S0[13], hated=W(13, 'both'), built=W(13, 'so'), hate=W(13, 'you'),
         needs=S0[14], old=W(14, "i'm"), newp=W(14, 'it'), shake=S0[15], choice=W(15, 'so'), unplug=W(15, 'unplug'), place=W(15, 'or'), dadwk=S0[16], tired=W(16, 'i', 2), hug=W(16, 'when'),
         unstrap=S0[17], sit=W(17, 'and'), q=S0[18], comment=W(18, 'comment'), follow=W(18, 'and'), sunday=W(18, 'because'))
mus = np.zeros(N)
def madd(at, y, g=1.0):
    i = int(at * SR)
    if i < N: mus[i:i + len(y)] += g * y[:N - i]
def pluck(at, f, amp=0.05, d=5.0, dur=0.6):
    n = int(dur * SR); x = np.arange(n) / SR; madd(at, (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(4 * np.pi * f * x) + 0.12 * np.sin(6 * np.pi * f * x)) * np.exp(-x * d) * np.minimum(1, x * 400) * amp)
def pad(a, b, fs, amp=0.02):
    i0, i1 = int(a * SR), min(N, int(b * SR)); x = np.arange(i1 - i0) / SR; L = len(x) / SR
    e = np.minimum(1, np.minimum(x / 1.2, (L - x) / 1.2)).clip(0, 1); y = sum(np.sin(2 * np.pi * f * x + np.sin(2 * np.pi * 0.2 * x) * 0.6) for f in fs) / len(fs); mus[i0:i1] += y * e * amp
note = lambda m: 440 * 2 ** ((m - 69) / 12)
BEAT = 60 / 104
# sections: (start, end, kind)
SEC = [(0, E['rule'], 'day'), (E['rule'], E['hale'], 'eve'), (E['hale'], E['leo'], 'day'), (E['leo'], E['swap7'], 'tense'), (E['swap7'], E['patrol'], 'day'), (E['patrol'], E['mum'], 'tense'),
       (E['mum'], E['climb'], 'day'), (E['climb'], E['wall'], 'mystery'), (E['wall'], E['needs'], 'box'), (E['needs'], E['dadwk'], 'mystery'), (E['dadwk'], E['unstrap'], 'warm'), (E['unstrap'], D, 'swell')]
DAY = [[60, 64, 67, 72, 67, 64, 69, 67], [57, 60, 64, 69, 64, 60, 65, 64], [53, 57, 60, 65, 60, 57, 62, 60], [55, 59, 62, 67, 62, 59, 65, 62]]
for a, b, k in SEC:
    if k in ('day', 'eve', 'warm'):
        n = 0; t0 = a
        while t0 < b - 0.1:
            bar = DAY[(n // 8) % 4]; m = bar[n % 8] + (0 if k == 'day' else -2 if k == 'eve' else -5)
            pluck(t0, note(m), 0.045 if k != 'warm' else 0.035, 5 if k != 'warm' else 2.5)
            if n % 4 == 0: pluck(t0, note(bar[0] - 24), 0.06, 3, 1.2)
            if k == 'day' and n % 2 == 1: madd(t0, nz(0.04, 1) * np.exp(-np.arange(int(0.04 * SR)) / SR * 90) * 0.02)
            n += 1; t0 += BEAT / 2
        if k == 'warm': pad(a, b, [note(48), note(55), note(64)], 0.03)
    elif k == 'tense':
        pad(a, b, [note(45), note(46), note(57)], 0.03)
        for t0 in np.arange(a, b, BEAT): pluck(t0, note(45), 0.03, 6, 0.4)
    elif k == 'mystery':
        pad(a, b, [note(50), note(53), note(57), note(62)], 0.032)
        for j, t0 in enumerate(np.arange(a, b, BEAT * 1.5)): pluck(t0, note([62, 65, 69, 72, 69, 65][j % 6]), 0.022, 3, 1.0)
    elif k == 'box':
        for j, t0 in enumerate(np.arange(a, b, BEAT * 0.75)): pluck(t0, note([79, 76, 72, 74, 76, 72, 67, 71][j % 8]), 0.03, 7, 0.5)
        pad(a, b, [note(48), note(55)], 0.018)
    elif k == 'swell':
        pad(a, b, [note(48), note(52), note(55), note(60)], 0.04)
        for j, t0 in enumerate(np.arange(a, b, BEAT)): pluck(t0, note([72, 76, 79, 76][j % 4]), 0.03, 3, 1.0)
out += mus
# ---- SFX on real actions ----
def whoosh(at, amp=0.12, dur=0.7):
    n = int(dur * SR); x = np.arange(n) / SR; y = ma(rng.normal(0, 1, n), 8) - ma(rng.normal(0, 1, n), 40); add(at, y * np.sin(np.pi * x / dur) ** 2 * amp)
def chime(at, amp=0.05):
    for j, f in enumerate([1568, 2093, 2637]): tone(at + j * 0.07, 0.8, f, amp * (1 - j * 0.2), 4)
for at in (0.02, E['wake'] + 0.45, E['every5'], E['swap7'] + 0.1, E['hate'], E['sit'] + 0.25): whoosh(at - 0.25, 0.14); chime(at + 0.1, 0.035)
for k in range(10): tone(0.6 + k * 0.45, 0.3, [1400, 1800, 1600][k % 3], 0.012, 8)  # orbs twinkling on the first shot
for k in range(14): tone(E['wake'] + k * 0.08, 0.06, 2400 if k % 2 else 2000, 0.03, 30)  # alarm clock
for k in range(12): tone(E['four'] + k * 0.08, 0.1, 500 + k * 60, 0.025, 25)  # croissants piling up
tone(E['toast'] + 0.1, 0.08, 900, 0.05, 40); thump(E['toast'] + 0.1, 0.3, 160, 40)  # toaster pop
for k in range(3): tone(E['hw'] + 0.25 + k * 0.18, 0.04, 3000, 0.03, 60)  # chalk taps
for k in range(4): tone(E['wed'] + 0.1 + k * 0.35, 1.2, [1046, 1318][k % 2], 0.03, 3)  # wedding bells
for at in (E['bed'], E['sunday'] + 0.6): tone(at, 2.0, 196, 0.06, 1.5); tone(at, 2.0, 392, 0.03, 2)  # tower bell
for k in range(int((E['eyes'] - E['leo']) / 0.8) + 4): thump(E['eyes'] - 0.4 + k * 0.75, 0.35, 48); thump(E['eyes'] - 0.15 + k * 0.75, 0.22, 45)  # heartbeat in the basement
m_ = int(0.5 * SR); x_ = np.arange(m_) / SR; add(E['exLeo'] + 0.25, np.sin(2 * np.pi * np.cumsum(300 + 500 * np.exp(-x_ * 8) * np.sin(x_ * 40)) / SR) * np.exp(-x_ * 6) * 0.05)  # orb bounces off Leo
tone(E['patrol'], 0.5, 2800, 0.04, 3); tone(E['patrol'] + 0.25, 0.5, 2800, 0.04, 3)  # whistle
for k in range(int((E['like'] - E['patrol']) / 0.32)): thump(E['patrol'] + 0.3 + k * 0.32, 0.18, 100, 35)  # marching
thump(E['like'] - 0.45, 0.8, 55, 12); add(E['like'] - 0.45, nz(0.15, 2) * env(int(0.15 * SR), 0.001, 25) * 0.1)  # tower door slam
tone(E['like'] + 0.1, 0.12, 1400, 0.05, 30); tone(E['like'] + 0.16, 0.12, 2100, 0.035, 30)
tone(E['shrug'] + 0.1, 0.15, 520, 0.04, 14); tone(E['shrug'] + 0.22, 0.2, 390, 0.04, 12)
for k in range(int((E['mach'] - E['climb']) / 0.3)): thump(E['climb'] + 0.1 + k * 0.3, 0.14, 120, 40)  # climbing stairs
i0 = int(E['mach'] * SR); xx = np.arange(N - i0) / SR; hum = (np.sin(2 * np.pi * 55 * xx) + 0.5 * np.sin(2 * np.pi * 110 * xx)) * 0.02 * np.clip(xx * 2, 0, 1)
hum *= np.interp(t[i0:], [E['wall'] - 0.2, E['wall'], E['needs'], E['needs'] + 0.2, E['dadwk'], E['dadwk'] + 0.1, E['unstrap'], E['unstrap'] + 0.2], [1, 0, 0, 1, 1, 0, 0, 1]); out[i0:] += hum
for tt in np.arange(E['mach'], D - 1, 1.0): tone(tt, 0.05, 1600, 0.012, 50)  # clock ticks
add(E['wires'], (nz(0.6, 1) - nz(0.6, 4)) * env(int(0.6 * SR), 0.01, 5) * 0.05)  # electric surge
tone(E['strap'] + 0.1, 0.05, 1200, 0.04, 60); thump(E['strap'] + 0.1, 0.2, 200, 50)  # strap buckle
for k in range(5): thump(E['dark'] + 0.1 + k * 0.38, 0.25, 90, 30)  # Hale's footsteps
i0 = int(E['wall'] * SR); i1 = int(E['hate'] * SR); crowd = ma(rng.normal(0, 1, i1 - i0), 30) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * np.arange(i1 - i0) / SR)); out[i0:i1] += crowd * 0.04 * np.interp(np.arange(i1 - i0), [0, SR * 0.4, i1 - i0 - SR * 0.3, i1 - i0], [0, 1, 1, 0])  # angry crowd
for k in range(6): thump(E['hate'] - 0.2 + k * 0.12, 0.3, 60 + k * 5, 15)  # wall crumbling
creak(E['unplug'] + 0.1, 0.5, 220, 0.04)  # hand on the lever
for k in range(2): tone(E['unstrap'] + 0.3 + k * 0.2, 0.05, 1200, 0.04, 60)
m_ = int(1.6 * SR); x_ = np.arange(m_) / SR; add(E['sit'] + 0.2, np.sin(2 * np.pi * np.cumsum(60 + 140 * x_) / SR) * np.clip(x_, 0, 1) * np.exp(-np.maximum(0, x_ - 1.2) * 6) * 0.06)  # power-up
tone(E['comment'], 0.2, 990, 0.05, 12); tone(E['follow'], 0.12, 1400, 0.05, 30); tone(E['follow'] + 0.06, 0.12, 2100, 0.035, 30)
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9)
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
