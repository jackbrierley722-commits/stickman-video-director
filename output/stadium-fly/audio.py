# Stadium fly: wind whoosh through the clouds + a light airy music bed (original, generated here)
import numpy as np, soundfile as sf
SR = 44100; D = 9.0; N = int(SR * D); t = np.arange(N) / SR; rng = np.random.default_rng(5)
def ma(x, k): c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([y, np.full(k - 1, y[-1])])
# wind: swells as you climb into the clouds, peaks in the white-out, fades as you descend
wind_env = np.interp(t, [0, 1.5, 3.0, 4.2, 5.4, 7.0, D], [0.05, 0.15, 0.6, 1.0, 0.55, 0.15, 0.05])
noise = rng.normal(0, 1, N); wind = (ma(noise, 6) - ma(noise, 60)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t))
whoosh = ma(noise, 25) * 3 * np.exp(-((t - 4.2) / 0.5) ** 2)
fx = wind * wind_env * 0.35 + whoosh * 0.3
# music: slow major pad + soft plucks, swelling on the way down
mf = lambda m: 440 * 2 ** ((m - 69) / 12); mus = np.zeros(N); beat = 60 / 84
chords = [[57, 61, 64], [54, 57, 61], [50, 54, 57], [52, 56, 59]]
for bi, t0 in enumerate(np.arange(0, D, 4 * beat)):
    i0 = int(t0 * SR); n = min(N - i0, int(4 * beat * SR)); xx = np.arange(n) / SR
    mus[i0:i0 + n] += sum(np.sin(2 * np.pi * mf(m) * xx) + 0.25 * np.sin(2 * np.pi * mf(m + 12) * xx) for m in chords[bi % 4]) * np.minimum(1, xx / 0.6) * np.minimum(1, (4 * beat - xx) / 0.6) * 0.12
for k, tb in enumerate(np.arange(0, D, beat / 2)):
    i0 = int(tb * SR); n = min(N - i0, int(0.4 * SR)); xx = np.arange(n) / SR; m = [69, 73, 76, 81, 76, 73][k % 6]
    mus[i0:i0 + n] += np.sin(2 * np.pi * mf(m) * xx) * np.exp(-xx * 7) * 0.08
mus *= np.interp(t, [0, 0.6, 3.6, 4.4, 5.2, D - 0.8, D], [0, 0.7, 0.7, 0.35, 0.9, 0.9, 0])
mix = np.tanh((fx / np.percentile(np.abs(fx), 99.9) * 0.45 + mus / np.percentile(np.abs(mus), 99.9) * 0.35) * 1.1) * 0.85
mix *= np.interp(t, [0, 0.05, D - 0.05, D], [0, 1, 1, 0])
sf.write('mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16'); print('mix ok')
