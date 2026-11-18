# Retro sports-game soundtrack (synth bass + drum machine), stadium SFX, narrator on top -> mix.wav
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(9)
def wt(ci, word, n=0):
    k = 0
    for w in CL[ci]['words']:
        if ''.join(ch for ch in w['w'].lower() if ch.isalnum()) == word:
            if k == n: return w['a']
            k += 1
    return CL[ci]['start']
def ma(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
out = np.zeros(N)
def add(at, y, buf=None):
    b = out if buf is None else buf; i = int(at * SR)
    if 0 <= i < N: b[i:i + len(y)] += y[:N - i]
def env(n, a=0.005, d=8): x = np.arange(n) / SR; e = np.exp(-x * d); e[:int(a * SR)] *= np.linspace(0, 1, int(a * SR)); return e
mus = np.zeros(N)
BPM = 118; beat = 60 / BPM
prog_ = [(110, [220, 277.2, 329.6]), (98, [196, 246.9, 293.7]), (82.4, [164.8, 207.7, 246.9]), (92.5, [185, 233.1, 277.2])]  # A, G, E, F#m-ish
def sq(f, n, duty=0.5): x = np.arange(n) / SR; return np.where((x * f) % 1 < duty, 1.0, -1.0)
def saw(f, n): x = np.arange(n) / SR; return 2 * ((x * f) % 1) - 1
nb = int(D / beat) + 1
for b in range(nb):
    at = b * beat; bar = b // 4; root, chord = prog_[bar % 4]
    n = int(beat * SR)
    # kick on 1/3, snare on 2/4, hats every 8th
    if b % 2 == 0: x = np.arange(int(0.25 * SR)) / SR; add(at, 0.55 * np.sin(2 * np.pi * (50 + 90 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.18 * SR); add(at, 0.25 * ma(rng.normal(0, 1, m), 2) * env(m, d=20), mus); add(at, 0.12 * np.sin(2 * np.pi * 190 * np.arange(m) / SR) * env(m, d=25), mus)
    for h in (0, 0.5):
        m = int(0.05 * SR); hn = rng.normal(0, 1, m); hn = hn - ma(hn, 3); add(at + h * beat, 0.06 * hn * env(m, d=60), mus)
    # bass: 8th notes, octave bounce
    for k, h in enumerate((0, 0.5)):
        m = int(beat * 0.5 * SR); f = root * (2 if k else 1); add(at + h * beat, 0.16 * ma(saw(f, m), 6) * env(m, d=5), mus)
    # arp lead every 16th on bars 2+ of each phrase
    if (bar % 8) >= 4:
        for q in range(4):
            m = int(beat * 0.25 * SR); f = chord[(b * 4 + q) % 3] * 2; add(at + q * beat / 4, 0.045 * sq(f, m, 0.25) * env(m, d=14), mus)
    # pad
    if b % 4 == 0:
        m = int(4 * beat * SR); x = np.arange(m) / SR; pad = sum(np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.003 * x) for f in chord) / 3
        add(at, 0.05 * pad * np.minimum(1, x * 4) * np.minimum(1, (4 * beat - x) * 4), mus)
lvl = np.interp(t, [0, 0.2, D - 2, D], [0, 0.85, 0.85, 0])
out += mus * lvl
# crowd ambience in stadium scenes (penalty, referee, world cup)
crowd = ma(rng.normal(0, 1, N), 25) * 0.6
cl = np.zeros(N)
for ci in (5, 6, 7):
    a0 = CL[ci]['start']; b0 = a0 + CL[ci]['dur']; cl += np.interp(t, [a0 - 0.01, a0, b0 - 0.01, b0], [0, 1, 1, 0])
out += crowd * 0.1 * np.clip(cl, 0, 1)
def roar(at, dur=2.5, amp=0.5): m = int(dur * SR); x = np.arange(m) / SR; add(at, amp * ma(rng.normal(0, 1, m), 12) * np.minimum(1, x * 6) * np.exp(-x * 1.2))
def whistle(at, dur=0.6): m = int(dur * SR); x = np.arange(m) / SR; add(at, 0.18 * np.sin(2 * np.pi * (2900 + 120 * np.sin(2 * np.pi * 30 * x)) * x) * np.minimum(1, (dur - x) * 20))
def thud(at, amp=0.4): x = np.arange(int(0.15 * SR)) / SR; add(at, amp * np.sin(2 * np.pi * 120 * x) * np.exp(-x * 40) + amp * 0.5 * ma(rng.normal(0, 1, len(x)), 3) * np.exp(-x * 60))
def blip(at, good): # game notification sound
    for k, f in enumerate([660, 990] if good else [330, 220]): m = int(0.09 * SR); x = np.arange(m) / SR; add(at + k * 0.08, 0.07 * np.sign(np.sin(2 * np.pi * f * x)) * np.exp(-x * 20))
for ci, w, good in [(0,'football',1),(0,'hundreds',0),(1,'teams',1),(1,'pick',0),(2,'laws',1),(2,'rugby',1),(3,'where',0),(3,'goal',1),(4,'nobody',0),(4,'crossbar',1),(4,'net',1),(5,'fouling',0),(5,'penalty',1),(6,'argue',0),(6,'referee',1),(7,'every',0),(7,'world',1)]:
    blip(wt(ci, w) - 0.15, good)
# mob noise (village riot)
m = int(CL[0]['dur'] * SR); add(CL[0]['start'], 0.14 * ma(rng.normal(0, 1, m), 40) * np.interp(np.arange(m) / SR, [0, 0.4, wt(0, 'hundreds'), wt(0, 'hundreds') + 0.6, 99], [0.3, 0.4, 0.4, 1, 1]))
for k in np.arange(0.4, CL[0]['dur'], 0.5): thud(k, 0.2)
thud(wt(3, 'goal') - 0.4, 0.5); roar(wt(3, 'goal'), 1.5, 0.25)
thud(wt(4, 'net') + 0.1, 0.5)
thud(wt(5, 'fouling') + 0.3, 0.7); whistle(wt(5, 'fouling') + 0.6, 0.5)
kk = wt(5, 'penalty') + 0.2; thud(kk, 0.6); roar(kk + 0.45, 2.5, 0.55)
whistle(wt(6, 'whistle') - 0.05, 0.8)
roar(wt(7, 'world'), 4.0, 0.5)
for k in np.arange(CL[7]['start'] + 0.4, D - 1, 0.37): thud(k, 0.2)
out *= np.interp(t, [0, 0.1, D - 0.8, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = out * duck + vo * 1.7
mix = np.tanh(mix * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
