# Prison escape finale v2 (vote B): dog chase, river, home: SFX + low music bed, under the narration
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
E = dict(c1=S0[3], saw=wt(3, 'saw'), c2=wt(3, 'off') - 0.1, lead=wt(3, 'off'), c3=S0[4], barking=wt(4, 'barking'), c4=S0[5], jump=wt(5, 'jump'), c5=S0[6], scent=wt(6, 'scent'), c6=S0[7], c7=S0[8], knock=wt(8, 'knock'), c8=S0[9], opens=wt(9, 'opens'), girl=wt(9, 'girl'))
def rustle(at, dur=0.8, amp=0.06): m = int(dur * SR); add(at, (nz(dur, 1) - nz(dur, 3)) * np.abs(np.sin(np.linspace(0, 7 * np.pi, m))) * np.hanning(m) * amp)
def step(at, amp=0.06): add(at, (nz(0.08, 1) - nz(0.08, 4)) * env(int(0.08 * SR), 0.002, 40) * amp)
def bark(at, amp=0.06, f=380):
    m = int(0.22 * SR); x = np.arange(m) / SR; fr = f * (1 + 0.6 * np.exp(-x * 25)); y = np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(fr * 2) / SR) * 0.3
    add(at, ma(y + nz(0.22, 2) * 0.5, 3) * env(m, 0.005, 14) * amp)
def underwater(a, b, amp=0.05):
    i0, i1 = int(a * SR), int(min(b, D) * SR); n = i1 - i0; xx = np.arange(n) / SR; out[i0:i1] += (ma(rng.normal(0, 1, n), 200) * 8 * amp + np.sin(2 * np.pi * 45 * xx) * amp * 0.4) * np.clip(xx * 4, 0, 1) * np.clip((b - a - xx) * 4, 0, 1)
    for k in range(int((b - a) / 0.35)): tt = a + k * 0.35 + rng.random() * 0.2; m = int(0.06 * SR); x = np.arange(m) / SR; add(tt, np.sin(2 * np.pi * (600 + 900 * x / 0.06 + rng.random() * 300) * x) * env(m, 0.002, 40) * 0.02)  # bubbles
# underwater hook: muffled, the dog sniffing and a muffled bark above
underwater(0, S0[1]); bark(1.0, 0.025, 300); bark(2.3, 0.02, 300)
# roadblock: siren whoop, radio, the dog barking at the cop's side
night = (t > S0[1]) & (t < S0[6]); out += ((nz(D, 2) - nz(D, 10)) * 0.01 + nz(D, 60) * 0.015) * night
m = int(0.6 * SR); x = np.arange(m) / SR; add(E['c1'] + 0.2, np.sin(2 * np.pi * np.cumsum(600 + 500 * x / 0.6) / SR) * np.hanning(m) * 0.02)
k = E['c1'] + 0.1
while k < E['c2']: step(k, 0.05); k += 0.5
thump(E['saw'], 0.6, 50, 6)  # hit when he sees you
for i in range(3): bark(E['c2'] + 0.1 + i * 0.35, 0.05)
add(E['lead'] + 0.1, nz(0.15, 1) * env(int(0.15 * SR), 0.001, 30) * 0.05); tone(E['lead'] + 0.1, 0.1, 2400, 0.01, 30)  # clip unhooks
# the sprint: fast footsteps, branches, heavy breathing, barking getting louder
k = E['c3']
while k < E['jump']: step(k, 0.09); k += 0.27
for i in range(8): rustle(E['c3'] + 0.2 + i * 0.5, 0.3, 0.06)
for i in range(int((E['jump'] - E['c3']) / 0.55)): m = int(0.3 * SR); add(E['c3'] + i * 0.55, (nz(0.3, 2) - nz(0.3, 12)) * np.hanning(m) * 0.03)  # breathing
for i in range(10): tt = E['c3'] + 0.3 + i * 0.42; bark(tt, 0.03 + 0.05 * i / 9, 360 + 20 * (i % 2))
for i in range(int((E['jump'] - E['c3']) / 0.55)): thump(E['c3'] + 0.1 + i * 0.55, 0.35, 48, 14)  # heartbeat
# the jump: whoosh, splash, then underwater
n = int(0.5 * SR); x = np.arange(n) / SR; add(E['jump'], (nz(0.5, 4) - nz(0.5, 30)) * np.sin(np.pi * x / 0.5) ** 2 * 0.1)
sp = E['jump'] + 0.45; add(sp, (nz(0.8, 1) - nz(0.8, 6)) * env(int(0.8 * SR), 0.002, 5) * 0.25); thump(sp, 0.6, 60, 8)
underwater(sp + 0.1, S0[7] + 0.1); bark(E['c5'] + 0.3, 0.025, 300); bark(E['c5'] + 0.7, 0.02, 300); add(E['scent'] + 0.1, nz(0.4, 3) * np.hanning(int(0.4 * SR)) * 0.01)  # dog whimpers off
# drifting: gentle water lapping, distant city
for i in range(6): rustle(E['c6'] + i * 0.4, 0.4, 0.02)
i0 = int(E['c6'] * SR); i1 = int(E['c7'] * SR); out[i0:i1] += ma(rng.normal(0, 1, i1 - i0), 80) * 0.15
# sunrise: birds, footsteps up the path, three knocks
i0 = int(E['c7'] * SR); xx = t[i0:] - E['c7']
for i in range(14): tt = E['c7'] + 0.3 + i * 0.6 + rng.random() * 0.3; m = int(0.12 * SR); x = np.arange(m) / SR; add(tt, np.sin(2 * np.pi * (2800 + 1200 * np.sin(x * 90)) * x) * env(m, 0.005, 25) * 0.008)
k = E['c7'] + 0.2
while k < E['knock'] - 0.2: step(k, 0.04); k += 0.5
for d_ in (0, 0.28, 0.56): thump(E['knock'] + d_, 0.6, 120, 22)
creak(E['c8'] + 0.1, 0.8, 300, 0.02)  # door opens
# warm swell at the reunion (major chord, slow attack)
for f, g in [(261.6, 0.03), (329.6, 0.024), (392.0, 0.022), (523.2, 0.014)]:
    a0 = E['opens']; n = int((D - a0) * SR); x = np.arange(n) / SR; add(a0, np.sin(2 * np.pi * f * x) * np.clip(x / 2.5, 0, 1) * np.clip((D - a0 - x) / 1.5, 0, 1) * g)
# setup clips: prison alarm behind you, footsteps; Dex's car idling beside you, then pulling away
for k in range(int((S0[2] - S0[1]) / 0.5)): tone(S0[1] + k * 0.5, 0.25, 900 if k % 2 else 700, 0.008, 3)
k = S0[1] + 0.1
while k < S0[3]: step(k, 0.05); k += 0.5
wk = wt(2, 'walked'); lvl = np.interp(t, [S0[2], wk, wk + 0.4, S0[3]], [0.8, 0.8, 2.2, 0.3]) * ((t > S0[2]) & (t < S0[3]))
out += (np.sin(2 * np.pi * np.cumsum(34 * np.maximum(lvl, 0.5)) / SR) * 0.03 + ma(rng.normal(0, 1, N), 40) * 0.04 * lvl) * (lvl > 0)
tone(wt(2, 'betrayed'), 1.2, 98, 0.03, 1.5)  # low sting on "betrayed"
# ---------- low tense music bed (original, generated here) ----------
mus = np.zeros(N); beat = 60 / 92
for root_i, tb in enumerate(np.arange(0, D, beat * 8)):
    f0 = [55, 55 * 2 ** (1 / 12), 55 * 2 ** (-2 / 12), 55 * 2 ** (3 / 12)][root_i % 4]; m = int(beat * 8 * SR); x = np.arange(m) / SR
    pad = (np.sin(2 * np.pi * f0 * x) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * x) + 0.3 * np.sin(2 * np.pi * f0 * 2.4 * x)) * np.hanning(m)
    i = int(tb * SR); mus[i:i + m] += pad[:max(0, N - i)] * 0.5
for tb in np.arange(0, D, beat / 2):
    m = int(0.12 * SR); x = np.arange(m) / SR; i = int(tb * SR); y = np.sin(2 * np.pi * 440 * x) * np.exp(-x * 40) * 0.12
    mus[i:i + m] += y[:max(0, N - i)]
for tb in np.arange(0, D, beat):
    m = int(0.25 * SR); x = np.arange(m) / SR; i = int(tb * SR); y = np.sin(2 * np.pi * 50 * x * (1 - 0.3 * x)) * np.exp(-x * 14) * 0.6
    mus[i:i + m] += y[:max(0, N - i)]
mus *= np.interp(t, [0, 1.0, S0[8] - 0.5, S0[8] + 0.5, D], [0, 1, 1, 0, 0])  # tense bed stops at sunrise; the warm chord takes over
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.55 * np.clip(e / (e.max() * 0.25), 0, 1)
bus = out * duck; pk = lambda y: np.percentile(np.abs(y), 99.9); mus *= 0.1 * pk(vo * 1.6) / max(pk(mus), 1e-9); mus *= (1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1))
bus *= min(1, 0.5 * pk(vo * 1.6) / pk(bus))  # SFX bus at least 6 dB under the narration
mix = np.tanh((bus + mus + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
