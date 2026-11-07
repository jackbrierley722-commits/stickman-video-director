# 28th floor soundtrack: tense pulse, elevator ding, groans, echoing footsteps, bangs, power-down, sirens, rotor; narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(28)
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
def add(at, y):
    i = int(at * SR)
    if 0 <= i < N: out[i:i + len(y)] += y[:N - i]
def burst(at, dur, amp, k=8, decay=8):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, ma(rng.normal(0, 1, n), k) * amp * np.exp(-x * decay))
def thump(at, amp=0.5, f=48):
    n = int(0.3 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 20))
def tone(at, dur, f, amp, decay=4):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x) * np.exp(-x * decay))
def groan(at, dur=1.8, amp=0.15, f0=90):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + 8 * np.sin(2 * np.pi * 5 * x) - 12 * x; g = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + 0.3 * rng.normal(0, 1, n); add(at, amp * ma(g, 22) * np.hanning(n))
powerT = wt(6, 'power') + 0.3; torchT = wt(6, 'torch')
# music: pulsing low synth at 100bpm, drops at power out, returns
beat = 0.6
lvl = np.interp(t, [0, 0.4, powerT - 0.1, powerT, torchT, torchT + 1, D - 1, D], [0, 1, 1, 0, 0, 1, 1, 0])
pulse = (0.07 * np.sin(2 * np.pi * 55 * t) + 0.04 * np.sin(2 * np.pi * 82.4 * t)) * (0.4 + 0.6 * np.exp(-((t % beat) / beat) * 4))
out += pulse * lvl
for b in np.arange(0, D, beat * 2): tone(b, 0.25, 41, 0.25 * np.interp(b, [0, powerT - 0.1, powerT, torchT, D], [1, 1, 0, 0, 1]), 16)
for i, b in enumerate(np.arange(0.3, D, beat * 4)):
    if not (powerT - 1 < b < torchT + 0.5): tone(b, 1.2, [220, 207.7, 196, 207.7][i % 4], 0.05, 2.5)
# city sirens far away in hook + lobby
def siren(a, b, amp):
    n = int((b - a) * SR); x = np.arange(n) / SR; f = 700 + 250 * np.sin(2 * np.pi * 0.5 * x); add(a, amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, np.minimum(x, (b - a) - x) * 2))
siren(0.2, CL[0]['start'] + wt(0, 'floor') - 0.6, 0.03); siren(CL[7]['start'], CL[8]['start'], 0.05)
# elevator: ding at "wrong", doors slide, groans
dw = wt(1, 'wrong'); tone(dw, 1.2, 1318, 0.12, 3); tone(dw + 0.05, 1.2, 1046, 0.08, 3)
burst(wt(1, 'doors') - 0.1, 0.9, 0.12, 30, 2); groan(wt(1, 'zombies') - 0.2, 2.2, 0.2); groan(wt(1, 'zombies') + 0.4, 1.8, 0.14, 75)
# echoing footsteps in stairwell (with delays)
for s in np.arange(CL[2]['start'] + 0.2, CL[3]['start'], 0.3):
    for d, a in [(0, 0.2), (0.18, 0.1), (0.36, 0.05), (0.54, 0.025)]: burst(s + d, 0.08, a, 2, 40)
groan(wt(2, 'ten') + 0.2, 1.6, 0.12, 80)
# shoes off thuds then soft sock steps
off = CL[3]['start'] + 0.9; thump(off, 0.3, 90); thump(off + 0.5, 0.3, 90)
for s in np.arange(wt(3, 'silence') + 0.3, CL[4]['start'], 0.8): burst(s, 0.06, 0.03, 4, 40)
# floor 15 bangs
bang = wt(4, 'banging')
for i in range(4): thump(bang + i * 0.6, 0.9, 50); burst(bang + i * 0.6, 0.4, 0.5, 10, 10)
groan(wt(4, 'already'), 2.0, 0.18, 85)
# office: running steps
for s in np.arange(CL[5]['start'] + 0.3, CL[6]['start'], 0.25): burst(s, 0.07, 0.08, 4, 40)
# power down: falling tone + click
n = int(0.8 * SR); x = np.arange(n) / SR; add(powerT - 0.1, 0.15 * np.sin(2 * np.pi * np.cumsum(220 * np.exp(-x * 4)) / SR) * np.exp(-x * 3)); thump(powerT, 0.5, 60)
tone(torchT + 0.1, 0.05, 2400, 0.08, 40)
# lobby: crowd of groans at "street"
st = wt(7, 'street')
for i in range(6): groan(st + i * 0.35, 1.8, 0.09, 70 + i * 6)
# decision: rotor for option B
ob = wt(8, 'option', 1); n = int((D - ob) * SR); x = np.arange(n) / SR; add(ob, 0.18 * ma(rng.normal(0, 1, n), 30) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * x))) * np.minimum(1, x * 2))
hb = wt(8, 'comment')
while hb < D - 0.5: thump(hb, 0.3); thump(hb + 0.27, 0.2); hb += 0.85
out *= np.interp(t, [0, 0.2, D - 1.0, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
