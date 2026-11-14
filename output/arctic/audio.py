# Original indie-rock style bed (not any real song) + crowd/scene SFX; British narrator on top
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(44)
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
def env(n, d=8): x = np.arange(n) / SR; e = np.exp(-x * d); a = int(0.004 * SR); e[:a] *= np.linspace(0, 1, a); return e
# drums + overdriven power-chord riff (original pattern), 132 bpm
bpm = 132; beat = 60 / bpm; nb = int(D / beat) + 1
riff = [(82.4, 1), (82.4, 0.5), (98.0, 0.5), (110.0, 1), (82.4, 0.5), (123.5, 0.5), (110, 0.5), (98, 0.5)]
for b in range(nb):
    at = b * beat
    if b % 2 == 0: x = np.arange(int(0.22 * SR)) / SR; add(at, 0.5 * np.sin(2 * np.pi * (50 + 80 * np.exp(-x * 30)) * x) * np.exp(-x * 14), mus)
    else: m = int(0.16 * SR); add(at, 0.22 * ma(rng.normal(0, 1, m), 2) * env(m, 18), mus)
    for h in (0, 0.5): m = int(0.04 * SR); hn = rng.normal(0, 1, m); add(at + h * beat, 0.05 * (hn - ma(hn, 3)) * env(m, 70), mus)
pos = 0.0; k = 0
while pos < D:
    f, L = riff[k % len(riff)]; dur = L * beat; m = int(dur * SR); x = np.arange(m) / SR
    tone = sum(np.sign(np.sin(2 * np.pi * f * r * x)) for r in (1, 1.5, 2)) / 3
    add(pos, 0.07 * np.tanh(ma(tone, 4) * 2.5) * env(m, 3), mus); pos += dur; k += 1
lvl = np.interp(t, [0, 0.3, CL[0]['start'] + wt(0, 'back') - CL[0]['start'] - 0.3, CL[1]['start'], CL[1]['start'] + 0.5, D - 1.5, D], [0, 0.6, 0.6, 0.15, 0.75, 0.9, 0])
out += mus * lvl
# rewind
r0 = wt(0, 'back') - 0.3; m = int((CL[1]['start'] - r0) * SR); x = np.arange(m) / SR; f = 300 + 2600 * (x / x[-1]) ** 2; add(r0, 0.1 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.linspace(0.3, 1, m))
def cheer_(a, b, amp):
    m = int((b - a) * SR); x = np.arange(m) / SR; add(a, amp * ma(rng.normal(0, 1, m), 14) * np.minimum(1, np.minimum(x, (b - a) - x) * 2))
cheer_(CL[2]['start'] + 1, CL[3]['start'], 0.08)                      # small pub crowd
cheer_(CL[3]['start'] + wt(3, 'soon') - CL[3]['start'], CL[4]['start'], 0.25)  # crowd singing
cheer_(CL[7]['start'], D, 0.3)                                          # festival
# coin clink for £27
for i in range(4): add(wt(2, 'paid') + 0.2 + i * 0.12, 0.08 * np.sin(2 * np.pi * (2400 + i * 300) * np.arange(int(0.2 * SR)) / SR) * env(int(0.2 * SR), 20))
# CD tray + burn whir
m = int(2.5 * SR); add(CL[3]['start'] + 0.3, 0.04 * np.sin(2 * np.pi * 180 * np.arange(m) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * np.arange(m) / SR)))
# pen scratch on contract + chart sting
sg = wt(4, 'sign')
for s in np.arange(sg + 0.1, sg + 1.5, 0.05): add(s, 0.03 * ma(rng.normal(0, 1, int(0.04 * SR)), 1))
for i, f in enumerate([523, 659, 784, 1047]): add(wt(4, 'one') + i * 0.09, 0.08 * np.sin(2 * np.pi * f * np.arange(int(0.4 * SR)) / SR) * env(int(0.4 * SR), 6))
# till ding for sales counter
for i in range(6): add(wt(5, 'sells') + i * 0.35, 0.05 * np.sin(2 * np.pi * 1800 * np.arange(int(0.2 * SR)) / SR) * env(int(0.2 * SR), 18))
# prize fanfare
for i, f in enumerate([392, 523, 659, 784]): add(wt(6, 'win') + i * 0.12, 0.08 * np.sign(np.sin(2 * np.pi * f * np.arange(int(0.5 * SR)) / SR)) * env(int(0.5 * SR), 5))
# fireworks at the end
for s in np.arange(CL[8]['start'] + 0.3, D - 1, 0.4): x = np.arange(int(0.15 * SR)) / SR; add(s, 0.2 * np.sin(2 * np.pi * 110 * x) * np.exp(-x * 40))
out *= np.interp(t, [0, 0.1, D - 0.8, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
