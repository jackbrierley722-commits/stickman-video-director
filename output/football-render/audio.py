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
lvl = np.interp(t, [0, 0.2, 3.4, 3.6, CL[1]['start'], CL[1]['start'] + 0.3, D - 2, D], [0, 1, 1, 0.25, 0.25, 0.85, 0.85, 0])
out += mus * lvl
# rewind sweep in the intro
r0 = wt(0, 'back') - 0.3; m = int((CL[1]['start'] - r0) * SR); x = np.arange(m) / SR; f = 300 + 2600 * (x / x[-1]) ** 2
add(r0, 0.12 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.linspace(0.3, 1, m) * ma(np.ones(m), 1))
# crowd ambience in stadium scenes
crowd = ma(rng.normal(0, 1, N), 25) * 0.6
cl = np.zeros(N)
for ci in (0, 7, 8, 9, 10):
    a = CL[ci]['start']; b = a + CL[ci]['dur']
    if ci == 9: a = wt(9, 'step', 1) - 0.2
    cl += np.interp(t, [a - 0.01, a, b - 0.01, b], [0, 1, 1, 0]) * (np.abs(t - a) < 1e9)
out += crowd * 0.11 * np.clip(cl, 0, 1)
def roar(at, dur=2.5, amp=0.5): m = int(dur * SR); x = np.arange(m) / SR; add(at, amp * ma(rng.normal(0, 1, m), 12) * np.minimum(1, x * 6) * np.exp(-x * 1.2))
def whistle(at, dur=0.6): m = int(dur * SR); x = np.arange(m) / SR; add(at, 0.18 * np.sin(2 * np.pi * (2900 + 120 * np.sin(2 * np.pi * 30 * x)) * x) * np.minimum(1, (dur - x) * 20))
def thud(at, amp=0.4): x = np.arange(int(0.15 * SR)) / SR; add(at, amp * np.sin(2 * np.pi * 120 * x) * np.exp(-x * 40) + amp * 0.5 * ma(rng.normal(0, 1, len(x)), 3) * np.exp(-x * 60))
# kicks in cuju
for k in np.arange(CL[1]['start'] + 0.0, CL[2]['start'], 1 / 0.55): thud(k, 0.3)
# mob noise
m = int(CL[2]['dur'] * SR); add(CL[2]['start'], 0.12 * ma(rng.normal(0, 1, m), 40) * np.interp(np.arange(m) / SR, [0, 0.5, wt(2, 'kings') - CL[2]['start'], wt(2, 'kings') - CL[2]['start'] + 0.5, 99], [0, 1, 1, 0.1, 0.1]))
# ban stamp
thud(wt(2, 'ban') - 0.05, 0.9)
thud(wt(3, 'kicked'), 0.35)
for k in np.arange(CL[5]['start'] + 0.5, CL[6]['start'] - 2, 0.9): thud(k, 0.15)
# 1872: whistle at "nil nil", crowd sigh
whistle(wt(7, 'nil') - 0.1, 0.3); whistle(wt(7, 'nil') + 0.25, 0.3); whistle(wt(7, 'nil') + 0.6, 0.8)
# penalty goal
kk = wt(8, 'penalty') + 0.4; thud(kk, 0.6); roar(kk + 0.45, 3.0, 0.6)
# 1930 win
roar(wt(9, 'wins'), 4.0, 0.6); whistle(wt(9, 'wins') - 0.6, 0.9)
# fireworks today
for k in np.arange(CL[10]['start'] + 0.4, D - 1, 1 / 0.45 / 6 * 1.0): thud(k, 0.25); m = int(0.4 * SR); add(k + 0.05, 0.05 * rng.normal(0, 1, m) * env(m, d=9))
out *= np.interp(t, [0, 0.1, D - 0.8, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = out * duck + vo * 1.7
mix = np.tanh(mix * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
