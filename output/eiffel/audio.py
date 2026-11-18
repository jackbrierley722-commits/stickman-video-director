# Eiffel Tower explainer: paper foley (slaps, rustle, tape), light music bed
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
def paper(at, amp=0.06):  # cut-out slapped onto the board: soft thump + paper rustle
    thump(at, amp * 3, 140, 40); m = int(0.12 * SR); add(at, (nz(0.12, 1) - nz(0.12, 4)) * env(m, 0.001, 30) * amp)
def tapeR(at, amp=0.04): m = int(0.35 * SR); x = np.arange(m) / SR; add(at, nz(0.35, 1) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * x))) * np.hanning(m) * amp)
# light plucky music bed (Paris-ish waltz feel, 3/4), ducked under voice
bpm = 150; beat = 60 / bpm; notes = [62, 66, 69, 66, 64, 67, 71, 67, 62, 66, 69, 74, 73, 69, 66, 64]
for i, s_ in enumerate(np.arange(0.0, D - 0.4, beat)):
    b3 = i % 3; f = 440 * 2 ** ((notes[(i // 3) % len(notes)] - 69 - (12 if b3 == 0 else 0)) / 12); tone(s_, 0.35, f, 0.03 if b3 == 0 else 0.018, 9)
    if b3 == 0: thump(s_, 0.08, 70, 25)
# label slap-ins: one paper sound per new label (word-anchored)
E = {k: wt(*v) for k, v in dict(up=(0, 'up'), nobody=(0, 'and'), iron=(1, 'its'), over=(1, 'over'), shake=(2, 'shake'), push=(2, 'and'), metre=(3, 'so'), grows3=(3, 'grows'), about3=(3, 'about'), deg=(3, 'degree'), tiny=(4, 'tiny'), but=(4, 'but'), frm=(4, 'from'), adds=(4, 'that'), fifteen=(4, 'fifteen'), like=(5, 'like'), follow=(5, 'follow'), sunny=(6, 'on'), leans=(6, 'so'), flower=(6, 'like'), cmt=(7, 'comment'), summer=(7, 'summer'), because=(7, 'because')).items()}
for k in ['up', 'nobody', 'over', 'shake', 'push', 'grows3', 'deg', 'tiny', 'fifteen', 'leans', 'flower', 'summer', 'because']: paper(E[k])
for k in ['iron', 'metre', 'cmt']: paper(E[k] + 0.25); tapeR(E[k] + 0.35)
for d_ in (0.5, 0.2 + (E['frm'] - E['but']), 1.1 + (E['frm'] - E['but'])): paper(E['but'] + d_, 0.05)  # math cards
paper(E['adds'] + 0.2); thump(E['fifteen'], 0.5, 60, 10); sting(E['fifteen'], 98, 0.05)
for k in range(3): tone(E['up'] + 0.1 + k * 0.08, 0.12, 880 * 2 ** (k * 4 / 12), 0.035, 18)  # growing arpeggio on +15 CM
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['follow'] + 0.2, 0.12, 2100, 0.05, 30)
for k in range(5): tone(E['because'] + 0.4 + k * 0.1, 0.25, 1760 * 2 ** (-k * 2 / 12), 0.02, 12)  # shrinking chime
for c in S0[1:]: m = int(0.18 * SR); add(c, (nz(0.18, 1) - nz(0.18, 5)) * np.hanning(m) * 0.03)  # paper slide on scene changes
out *= np.interp(t, [0, 0.02, D - 0.03, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.5 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.25 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
