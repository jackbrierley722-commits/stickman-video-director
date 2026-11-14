# Eye contact: suspense drone, emergency alert tones, heartbeat, scream, furniture scrape, glass taps, door drone
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(32)
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
def thump(at, amp=0.5, f=50):
    n = int(0.3 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 18))
phone = wt(0, 'phone'); dont = wt(1, "don't"); stay = wt(3, 'stay'); tall = wt(4, 'tall'); grabs = wt(5, 'grabs'); something = wt(5, 'something'); scream = wt(6, 'scream'); two = wt(6, 'two'); right = wt(6, 'right')
rule = wt(7, 'rule'); slides = wt(7, 'slides'); ward = wt(7, 'wardrobe'); four = wt(9, 'four'); taps = wt(9, 'taps'); newA = wt(10, 'new'); one = wt(10, 'one'); opt = CL[11]['start']; comment = wt(11, 'comment')
# low drone + room tone, dips to near silence at 4 AM, swells at the end
lvl = np.interp(t, [0, 0.5, phone, phone + 0.5, four - 0.3, four, taps, taps + 0.3, newA, D - 1, D], [0, 0.6, 0.6, 1, 1, 0.15, 0.15, 1.1, 1.2, 1.2, 0])
out += (0.06 * np.sin(2 * np.pi * 41 * t) + 0.04 * np.sin(2 * np.pi * 61.7 * t + np.sin(2 * np.pi * 0.1 * t)) + 0.02 * np.sin(2 * np.pi * 92 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t)) * lvl
out += ma(rng.normal(0, 1, N), 50) * 0.04 * lvl
# eerie music-box motif (flat, childlike) under the story
mel = [76, 79, 74, 72, 71, 72, 74, 67]
for i, s_ in enumerate(np.arange(CL[2]['start'], four - 0.5, 0.75)):
    f = 440 * 2 ** ((mel[i % 8] - 69) / 12); n = int(0.9 * SR); add(s_, (sine(f, 0.9) + 0.3 * sine(f * 3.01, 0.9)) * env(n, 0.002, 5) * 0.028)
# emergency alert: two-tone wail when phones go off, again for the new alert
def alert(at, dur):
    n = int(dur * SR); x = np.arange(n) / SR; y = (np.sin(2 * np.pi * 853 * x) + np.sin(2 * np.pi * 960 * x)) * 0.5 * (np.sin(2 * np.pi * 4 * x) > 0) * np.interp(x, [0, 0.05, dur - 0.3, dur], [0, 1, 1, 0]); add(at, y * 0.09)
alert(phone - 0.1, 3.0); alert(newA - 0.2, 1.4)
# hundreds of phones: buzz clusters
for k in range(60): s_ = phone + rng.uniform(0, 2.8); m = int(0.25 * SR); x = np.arange(m) / SR; add(s_, np.sign(np.sin(2 * np.pi * rng.uniform(140, 200) * x)) * np.hanning(m) * 0.012)
# heartbeat from the tall man reveal through the eye shot
hb = tall
while hb < scream - 0.3: thump(hb, 0.45, 48); thump(hb + 0.24, 0.3, 45); hb += 0.8 if hb < something else 0.62
# stinger on the figure
m = int(2.5 * SR); x = np.arange(m) / SR; add(something - 0.1, (np.sin(2 * np.pi * 110 * x) + np.sin(2 * np.pi * 116.5 * x) + np.sin(2 * np.pi * 233 * x) * 0.5) * env(m, 0.01, 1.2) * 0.07)
# scream: formant-ish noise with pitch slide
m = int(1.2 * SR); x = np.arange(m) / SR; f = 900 + 300 * np.sin(2 * np.pi * 6 * x) - 250 * x; sc = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + rng.normal(0, 1, m) * 0.4; add(scream - 0.05, ma(sc, 3) * env(m, 0.01, 2.0) * 0.12)
# window goes dark: low hit
thump(right + 0.8, 0.6, 38); m = int(1.5 * SR); add(right + 0.8, nz(1.5, 20) * env(m, 0.005, 2) * 0.12)
# furniture scraping
for s0, dur in ((slides, 1.6), (ward, 1.6)):
    m = int(dur * SR); x = np.arange(m) / SR; sc = np.sign(np.sin(2 * np.pi * np.cumsum(90 + 30 * np.sin(x * 23)) / SR)) + rng.normal(0, 1, m) * 0.6; add(s0, ma(sc, 12) * np.hanning(m) * 0.08); thump(s0 + dur - 0.05, 0.4, 70)
# three taps on the glass
for i in range(3):
    s_ = taps + i * 0.45; m = int(0.12 * SR); x = np.arange(m) / SR; add(s_, (np.sin(2 * np.pi * 2400 * x) * 0.5 + np.sin(2 * np.pi * 3600 * x) * 0.3 + rng.normal(0, 1, m) * 0.4) * np.exp(-x * 60) * 0.35); thump(s_, 0.15, 120)
# door: something breathing on the other side
m = int((opt - one) * SR); x = np.arange(m) / SR; add(one, nz(opt - one, 30) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * x)) ** 2 * 0.12)
# choice: ticking clock + rising tone
for s_ in np.arange(opt, D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
m = int((D - opt) * SR); x = np.arange(m) / SR; add(opt, np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.15, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
