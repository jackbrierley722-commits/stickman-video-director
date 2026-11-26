# SFX only (no music): bubble pops and soft scene ticks, kept under the voices
import json, numpy as np, soundfile as sf
SR = 44100; tm = json.load(open('timing.json')); CL = tm['clips']; D = tm['total']; N = int(SR * D); out = np.zeros(N)
def add(at, y):
    i = int(at * SR)
    if 0 <= i < N: out[i:i + len(y)] += y[:N - i]
def pop(at, f=900, amp=0.05): n = int(0.09 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * f * (1 + 2 * np.exp(-x * 60)) * x) * np.exp(-x * 45) * amp)
def tick(at, amp=0.03): n = int(0.05 * SR); x = np.arange(n) / SR; add(at, np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 90) * amp)
for c in CL: tick(c['start'])
pop(CL[1]['start'] + 0.05); [pop(CL[1]['start'] + 2.0 + i * 0.28, 700 + i * 120) for i in range(4)]
pop(CL[3]['start'] + 0.05); [pop(CL[3]['start'] + 1.4 + i * 0.22, 650 + i * 90) for i in range(7)]
n = int(0.4 * SR); x = np.arange(n) / SR; add(CL[4]['start'] + 0.25, np.sin(2 * np.pi * 70 * x) * np.exp(-x * 9) * 0.12)
pop(CL[5]['start'] + 0.05, 600, 0.06); tick(CL[5]['start'] + 1.0); tick(CL[5]['start'] + 1.1)
vo, vsr = sf.read('vo.wav'); vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
pk = lambda y: np.percentile(np.abs(y), 99.9) + 1e-9; out *= min(1, 0.5 * pk(vo) / pk(out))
mix = np.tanh((out + vo) * 1.05) * 0.92; sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok', round(D, 2))
