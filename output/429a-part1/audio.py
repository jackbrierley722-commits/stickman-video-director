# 429A part 1: hotel drone, fluorescent buzz, clock tick, classic phone ring, keyboard, lift ding, carpet steps, handle creak, whooshes
import json, numpy as np, soundfile as sf
SR = 44100
TM = json.load(open('timing.json')); CL = TM['clips']; D = TM['total']; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(429)
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
def thump(at, amp=0.5, f=50, d=18):
    n = int(0.35 * SR); x = np.arange(n) / SR; add(at, amp * np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * d))
def tone(at, dur, f, amp, d=6): n = int(dur * SR); add(at, sine(f, dur) * env(n, 0.002, d) * amp)
def sting(at, f=98, amp=0.07):
    m = int(2.2 * SR); x = np.arange(m) / SR; add(at, (np.sin(2 * np.pi * f * x) + np.sin(2 * np.pi * f * 1.06 * x) + 0.5 * np.sin(2 * np.pi * f * 2 * x)) * env(m, 0.01, 1.3) * amp)
def whoosh(at, amp=0.06):
    m = int(0.45 * SR); x = np.linspace(0, 1, m); n = nz(0.45, 1); lo = ma(n, 3); hi = n - ma(n, 12)
    add(at - 0.3, (lo * x + hi * (1 - x) * 0.6) * np.sin(np.pi * x) ** 2 * amp * 3)
def ring(at, dur):  # classic bell phone: two-tone tremolo bursts
    s_ = at
    while s_ < at + dur:
        m = int(min(0.9, at + dur - s_) * SR); x = np.arange(m) / SR; trem = (np.sin(2 * np.pi * 20 * x) > 0).astype(float)
        sig = (np.sin(2 * np.pi * 1020 * x) + 0.8 * np.sin(2 * np.pi * 1280 * x) + 0.3 * np.sin(2 * np.pi * 2040 * x)) * trem * env(m, 0.003, 0.5)
        add(s_, sig * 0.05); s_ += 1.6
def creak(at, dur=1.0, f0=200, amp=0.07):
    m = int(dur * SR); x = np.arange(m) / SR; add(at, ma(np.sign(np.sin(2 * np.pi * np.cumsum(f0 + 70 * np.sin(x * 5)) / SR)), 6) * np.hanning(m) * amp)
E = dict(so0=wt(0, 'so'), like=wt(0, 'like'), leo=wt(1, 'leo'), on1=wt(1, 'on'), nothing=wt(1, 'nothing'), phone2=wt(2, 'phone'), the2=wt(2, 'the', 1), room2=wt(2, 'room'),
         no3=wt(3, 'no'), but3=wt(3, 'but'), forty=wt(3, 'forty'), never3=wt(3, 'never'), rule=wt(4, 'rule'), and4=wt(4, 'and'), lift=wt(5, 'lift'), room5=wt(5, 'room'), and5=wt(5, 'and'), door5=wt(5, 'door'),
         warm=wt(6, 'warm'), and6=wt(6, 'and'), handle=wt(7, 'handle'), turns=wt(7, 'turns'), opt=CL[8]['start'], optB=wt(8, 'option', 1), comment=wt(8, 'comment'))
cuts = [E['so0'] - 0.1, E['like'] - 0.2, E['leo'] - 0.2, E['on1'] - 0.1, CL[2]['start'], E['phone2'] - 0.2, E['the2'] - 0.1, CL[3]['start'], E['no3'] - 0.2, CL[4]['start'], E['and4'] - 0.1, CL[5]['start'], E['room5'] - 0.2, CL[6]['start'], E['and6'] - 0.1, CL[7]['start'], CL[8]['start']]
# bed: low hotel drone + fluorescent hum, drops before the reveal moments
lvl = np.interp(t, [0, 0.2, E['handle'] - 0.3, E['handle'], E['turns'] + 0.6, E['opt'], D - 0.8, D], [1, 1, 1, 0.15, 0.15, 1.2, 1.2, 0])
out += (0.055 * np.sin(2 * np.pi * 41 * t) + 0.03 * np.sin(2 * np.pi * 61.5 * t + np.sin(2 * np.pi * 0.09 * t)) + 0.012 * np.sin(2 * np.pi * 123 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t)) * lvl
out += (np.sign(np.sin(2 * np.pi * 120 * t)) * 0.004 + ma(rng.normal(0, 1, N), 40) * 0.02) * lvl
# eerie music box motif through the setup
mel = [69, 72, 76, 75, 72, 69, 68, 71]
for i, s_ in enumerate(np.arange(0.4, CL[5]['start'], 0.85)):
    f = 440 * 2 ** ((mel[i % 8] - 69) / 12); n = int(0.9 * SR); add(s_, (sine(f * 2, 0.9) + 0.3 * sine(f * 6.02, 0.9)) * env(n, 0.002, 6) * 0.018)
# opening: phone ring under the hook, sting on "so"
ring(0.0, E['leo'] - 0.4); sting(E['so0'], 87, 0.06)
for c in cuts: whoosh(c, 0.05)
# like pop
tone(E['like'], 0.12, 1400, 0.06, 30); tone(E['like'] + 0.06, 0.12, 2100, 0.04, 30)
# corridor reveal "nothing in between"
sting(E['nothing'], 73, 0.06)
# clock tick on 4.29 shot
for s_ in np.arange(CL[2]['start'], E['phone2'] - 0.2, 0.5): add(s_, nz(0.01) * env(int(0.01 * SR), 0.0005, 300) * 0.12)
ring(E['phone2'] - 0.1, CL[3]['start'] - E['phone2']); sting(E['room2'], 98, 0.07)
# keyboard clicks while searching
for k in range(16): add(CL[3]['start'] + 0.2 + k * 0.09 + rng.random() * 0.03, nz(0.012) * env(int(0.012 * SR), 0.0005, 250) * 0.07)
tone(E['no3'] - 0.1, 0.25, 220, 0.07, 8); tone(E['no3'] + 0.05, 0.3, 207, 0.07, 8)  # error beep
tone(E['but3'], 0.15, 880, 0.05, 15); tone(E['but3'] + 0.12, 0.2, 1320, 0.05, 12)  # found chime
sting(E['forty'], 82, 0.06); thump(E['never3'], 0.4, 45)
# paper rustle at note, sting on handwriting
m = int(0.6 * SR); add(CL[4]['start'] + 0.6, nz(0.6, 3) * np.hanning(m) * 0.05); sting(E['and4'], 73, 0.08); thump(E['and4'], 0.5, 42)
# lift ding + doors + footsteps on carpet
tone(E['lift'] - 0.2, 1.4, 1318, 0.07, 2.5); tone(E['lift'] - 0.2, 1.4, 1046 * 1.5, 0.03, 3); m = int(0.8 * SR); add(E['lift'] + 0.4, nz(0.8, 20) * np.hanning(m) * 0.05)
for s_ in np.arange(E['room5'] - 0.2, E['and5'], 0.55): thump(s_, 0.18, 80, 40); add(s_, nz(0.05, 6) * env(int(0.05 * SR), 0.002, 60) * 0.03)
m = int(1.8 * SR); x = np.arange(m) / SR; add(E['and5'] + 0.3, np.sin(2 * np.pi * (60 + 40 * x) * x) * 0.06 * np.hanning(m)); sting(E['door5'], 65, 0.08)
# warm brass hum, muffled ring from behind the door
tone(E['warm'], 1.5, 196, 0.03, 1.5)
m_ring_at = E['and6']
s_ = m_ring_at
while s_ < E['handle'] - 0.2:
    m = int(0.8 * SR); x = np.arange(m) / SR; trem = (np.sin(2 * np.pi * 20 * x) > 0).astype(float); add(s_, ma((np.sin(2 * np.pi * 1020 * x) + 0.8 * np.sin(2 * np.pi * 1280 * x)) * trem, 12) * env(m, 0.003, 0.6) * 0.04); s_ += 1.5
# silence, then the handle creaks + metal click
creak(E['handle'] + 0.1, 0.9, 260, 0.08); tone(E['turns'] + 0.75, 0.05, 2600, 0.08, 60); thump(E['turns'] + 0.75, 0.6, 40); sting(E['turns'] + 0.8, 55, 0.1)
# choice: ticking clock + rising tone
for s_ in np.arange(E['opt'], D - 0.5, 0.5): add(s_, nz(0.02) * env(int(0.02 * SR), 0.0005, 150) * 0.08)
tone(E['opt'] + 0.2, 0.2, 660, 0.05, 12); tone(E['optB'], 0.2, 990, 0.05, 12)
m = int((D - E['opt']) * SR); x = np.arange(m) / SR; add(E['opt'], np.sin(2 * np.pi * (55 + 30 * x / x[-1]) * x) * 0.05 * (x / x[-1]))
out *= np.interp(t, [0, 0.02, D - 0.6, D], [0, 1, 1, 0])
vo, vsr = sf.read('vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
e = ma(np.abs(vo), 4000); duck = 1 - 0.45 * np.clip(e / (e.max() * 0.25), 0, 1)
mix = np.tanh((out * 1.2 * duck + vo * 1.6) * 1.05) * 0.9
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
