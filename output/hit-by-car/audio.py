# Tense bed + street/impact SFX; narrator on top
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
bpm = 100; beat = 0.6; nb = int(D / beat) + 1
chords = [[110, 131, 165], [98, 123, 147], [87, 110, 131], [104, 123, 156]]
for b in range(nb):
    at = b * beat; ch = chords[(b // 8) % 4]
    if b % 2 == 0: x = np.arange(int(0.2 * SR)) / SR; add(at, 0.4 * np.sin(2 * np.pi * (48 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.12 * SR); add(at, 0.12 * ma(rng.normal(0, 1, m), 2) * env(m, 25), mus)
    m = int(0.03 * SR); hn = rng.normal(0, 1, m); add(at + beat / 2, 0.04 * (hn - ma(hn, 3)) * env(m, 80), mus)
    for q in range(2): f = ch[(b * 2 + q) % 3] * 2; m = int(beat / 2 * SR); x = np.arange(m) / SR; add(at + q * beat / 2, 0.03 * np.sign(np.sin(2 * np.pi * f * x)) * env(m, 12), mus)
    m = int(beat * SR); x = np.arange(m) / SR; add(at, 0.08 * np.sin(2 * np.pi * ch[0] / 2 * x) * env(m, 3), mus)
I0 = wt(3, "impact"); out += mus * np.interp(t, [0, 0.3, D - 1.5, D], [0, 0.6, 0.6, 0]) * np.where((t > I0 - 0.05) & (t < CL[7]["start"]), 0.15, 1.0)
def ev(ci, w): return wt(ci, w)
def noise(m, k=4): return ma(rng.normal(0, 1, m), k)
I = ev(3, 'impact'); SAFE = CL[8]['start']; SLOW0 = ev(2, 'slow'); SLOW1 = ev(5, 'road') + 0.6
# street ambience (soft traffic rumble + distant birds), muted during slow-mo
amb = 0.05 * noise(N, 60) + 0.02 * noise(N, 12)
amb *= np.where((t > SLOW0) & (t < SLOW1), 0.25, 1.0)
out += amb
for i in range(10): tone(0.6 + i * 2.7, 0.12, 2600 + 300 * (i % 3), 0.02, 18); tone(0.75 + i * 2.7, 0.1, 3100, 0.015, 20)
# engine approach: rising pitch + volume until impact
a0 = CL[1]['start']; e = np.clip((t - a0) / (I - a0), 0, 1) * (t < I + 0.05)
f = 55 + 40 * e; ph = 2 * np.pi * np.cumsum(f) / SR
out += 0.10 * e ** 2 * (np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph)) * (1 - 0.6 * ((t > SLOW0) & (t < I)))
# phone notification ping
tone(ev(1, 'phone'), 0.15, 1568, 0.06, 18); tone(ev(1, 'phone') + 0.12, 0.2, 2093, 0.06, 14)
# slow-mo heartbeat
hb = ev(2, 'adrenaline')
k = 0
while hb + k * 0.85 < SLOW1:
    for d, amp in [(0, 0.5), (0.18, 0.35)]:
        x = np.arange(int(0.15 * SR)) / SR; add(hb + k * 0.85 + d, amp * np.sin(2 * np.pi * 50 * x) * np.exp(-x * 25))
    k += 1
# slow-down whoosh (pitch fall)
m = int(0.9 * SR); x = np.arange(m) / SR; add(SLOW0 - 0.2, 0.15 * noise(m, 30) * np.sin(np.pi * x / x[-1]))
# tyre screech just before impact
m = int(0.8 * SR); x = np.arange(m) / SR; add(I - 0.75, 0.07 * np.sin(2 * np.pi * (2200 + 300 * np.sin(x * 40)) * x) * np.sin(np.pi * x / x[-1]) + 0.04 * noise(m, 2) * np.sin(np.pi * x / x[-1]))
# impact thud + crunch
x = np.arange(int(0.6 * SR)) / SR; add(I, 0.9 * np.sin(2 * np.pi * (40 + 60 * np.exp(-x * 20)) * x) * np.exp(-x * 7)); m = int(0.25 * SR); add(I, 0.35 * noise(m, 3) * env(m, 18))
# bonnet thump + windscreen crack
x = np.arange(int(0.4 * SR)) / SR; add(ev(4, 'bonnet'), 0.55 * np.sin(2 * np.pi * (60 + 40 * np.exp(-x * 25)) * x) * np.exp(-x * 9))
w = ev(4, 'windscreen'); m = int(0.35 * SR); add(w, 0.3 * (noise(m, 1) - noise(m, 6)) * env(m, 14))
for i in range(6): tone(w + 0.03 * i, 0.12, 3000 + 700 * i, 0.03, 30)
# whoosh while thrown, then landing thud
m = int(1.0 * SR); x = np.arange(m) / SR; add(ev(5, 'thrown') - 0.1, 0.15 * noise(m, 10) * np.sin(np.pi * x / x[-1]))
x = np.arange(int(0.5 * SR)) / SR; add(ev(5, 'thrown') + 1.35, 0.6 * np.sin(2 * np.pi * (45 + 40 * np.exp(-x * 20)) * x) * np.exp(-x * 8)); m = int(0.15 * SR); add(ev(5, 'thrown') + 1.35, 0.2 * noise(m, 3) * env(m, 30))
# ringing ears during shock
s0 = CL[6]['start']; m = int((CL[7]['start'] - s0) * SR); x = np.arange(m) / SR; add(s0, 0.025 * np.sin(2 * np.pi * 4200 * x) * np.interp(x, [0, 0.4, x[-1] - 0.8, x[-1]], [0, 1, 1, 0]))
# energy bars: pops
tone(ev(7, 'double'), 0.15, 440, 0.08, 14, True); tone(ev(7, 'four'), 0.4, 880, 0.08, 6, True); tone(ev(7, 'four') + 0.08, 0.4, 1320, 0.05, 6, True)
# rewind sweep
m = int(1.0 * SR); x = np.arange(m) / SR; add(SAFE, 0.08 * np.sign(np.sin(2 * np.pi * np.cumsum(1200 - 900 * x / x[-1]) / SR)) * np.sin(np.pi * x / x[-1]))
# safe replay: car passes by (doppler whoosh)
cp = ev(8, 'look') + 0.6; m = int(1.6 * SR); x = np.arange(m) / SR; ff = 110 - 40 / (1 + np.exp(-(x - 0.8) * 8))
add(cp - 0.8, 0.12 * np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-((x - 0.8) / 0.4) ** 2) + 0.1 * noise(m, 8) * np.exp(-((x - 0.8) / 0.3) ** 2))
out *= np.interp(t, [0, 0.1, D - 0.7, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
