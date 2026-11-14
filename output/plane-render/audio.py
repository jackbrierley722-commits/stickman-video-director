# Music bed + SFX synthesized to the narration timeline, then narrator mixed on top -> mix.wav
import json, wave, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(5)
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
    i = int(at * SR); 
    if i >= N: return
    out[i:i + len(y)] += y[:N - i]
def burst(at, dur, amp, k=8, decay=8):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, ma(rng.normal(0, 1, n), k) * amp * np.exp(-x * decay))
def tone(at, dur, f, amp, decay=6):
    n = int(dur * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x) * np.exp(-x * decay))
def thump(at, amp=0.5, f=48):
    n = int(0.3 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 20))
def pluck(f, dur=2.5, amp=0.12):
    n = int(SR * dur); p = int(SR / f); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for i in range(n): y[i] = buf[i % p]; buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return amp * y
fail = wt(1, 'failed'); slam = wt(1, 'slammed'); night = wt(4, 'pile'); sits = wt(5, 'sits'); light = wt(5, 'jake') + 0.6
# --- music: drone + plucks, drops out right after the crash, returns softer
lvl = np.interp(t, [0, 0.5, slam, slam + 0.2, slam + 3, slam + 6, D], [0, 1, 1, 0, 0, 0.8, 0.9])
dr = 0.06 * np.sin(2 * np.pi * 49 * t) + 0.045 * np.sin(2 * np.pi * 49.3 * t + 1) + 0.035 * np.sin(2 * np.pi * 73.4 * t)
out += dr * lvl * (0.75 + 0.25 * np.sin(2 * np.pi * 0.08 * t))
notes = [196, 233.1, 293.7, 261.6, 196, 174.6, 233.1, 220]; k = 0; tt = 0.6
while tt < D - 3:
    if not (slam - 0.3 < tt < slam + 5.5):
        y = pluck(notes[k % 8], 2.4, 0.11); add(tt, y)
        if k % 4 == 0: add(tt, pluck(notes[k % 8] / 2, 2.4, 0.07))
    k += 1; tt += 2.4 if tt < sits else 1.9
for f in [196, 207.7, 293.7]: add(D - 4.6, pluck(f, 4.4, 0.1))
# --- plane: engine rumble until crash, alarm beeps, masks
rum = ma(rng.normal(0, 1, N), 120) * 2.2 * np.interp(t, [0, 0.4, slam, slam + 0.05], [0, 0.18, 0.3, 0]); out += rum
for b in np.arange(3.2, CL[1]['start'], 0.55): tone(b, 0.22, 980, 0.07, 4)
for b in np.arange(fail, slam, 0.45): tone(b, 0.2, 1040, 0.07, 4)
burst(4.3, 0.6, 0.15, 3, 6)  # masks drop
thump(fail, 0.5, 70); burst(fail, 0.8, 0.35, 6, 5)  # engine bang
# dive whine
n = int((slam - wt(1, 'tore') + 0.3) * SR); x = np.arange(n) / SR; f = 300 + 500 * x / x[-1]; add(wt(1, 'tore') - 0.3, 0.06 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0.3, 1, n))
# crash
burst(slam, 2.5, 1.4, 20, 2.2); thump(slam, 1.2, 40); thump(slam + 0.15, 0.8, 55)
for d in np.arange(slam + 0.3, slam + 2.2, 0.17): burst(d, 0.12, 0.25 * rng.uniform(0.3, 1), 3, 30)
# --- forest ambience: wind, then crickets at night
wind = ma(rng.normal(0, 1, N), 70) * np.interp(t, [0, slam, slam + 1, D], [0, 0, 0.06, 0.08]) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.13 * t)); out += wind
cr = np.zeros(N)
for fc in [4300, 4700]:
    cr += np.sin(2 * np.pi * fc * t) * (np.sin(2 * np.pi * 18 * t) > 0.6) * (np.sin(2 * np.pi * 0.9 * t + fc) > 0)
out += cr * 0.012 * np.interp(t, [0, CL[3]['start'] + 4, night, night + 2, D], [0, 0, 0.6, 1, 1])
# camp: branch thuds, leaf rustles
for b in np.arange(CL[4]['start'] + 0.6, CL[4]['start'] + wt(4, 'cover') - CL[4]['start'], 0.9): thump(b, 0.25, 90); burst(b, 0.15, 0.12, 4, 25)
for b in np.arange(wt(4, 'cover'), night + 1.5, 0.35): burst(b, 0.3, 0.07, 2, 12)
# twist: leaves rustle as Ryan sits up, distant noise when the light appears
burst(sits, 0.6, 0.18, 2, 8); burst(light - 0.3, 1.0, 0.1, 30, 3); thump(light, 0.35, 60)
n = int(2.5 * SR); x = np.arange(n) / SR; add(light + 0.2, 0.05 * np.sin(2 * np.pi * (180 + 30 * np.sin(x * 3)) * x) * np.hanning(n))
# heartbeat from the light to the end
hb = light
while hb < D - 0.5: thump(hb, 0.32); thump(hb + 0.27, 0.22); hb += 0.85
# footsteps in leaves under option A
for b in np.arange(CL[6]['start'] + 0.4, CL[6]['start'] + 5.5, 0.5): burst(b, 0.12, 0.1, 2, 30)
out *= np.interp(t, [0, 0.2, D - 1.2, D], [0, 1, 1, 0])
# --- narrator: resample 24k -> 44.1k, duck the bed under speech
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
env = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(env / (env.max() * 0.25), 0, 1)
mix = out * duck + vo * 1.6
mix = np.tanh(mix * 1.1) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
