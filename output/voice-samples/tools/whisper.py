import sys, numpy as np, soundfile as sf
import espeakng_loader
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
from scipy.signal import stft, istft, lfilter
SR = 24000
text = "At three thirty two in the morning, every phone in the city goes off. Don't look outside. Whatever you do... don't make any eye contact."
pipe = KPipeline(lang_code='a')
def whisper(a):
    f, t, Z = stft(a, SR, nperseg=1024, noverlap=768)
    mag = np.abs(Z)
    # smooth the spectrum across frequency (cepstral lifter) -> keep the mouth shape, drop the pitch harmonics
    lm = np.log(mag + 1e-6); ce = np.fft.irfft(lm, axis=0); ce[40:-40] = 0; env = np.exp(np.fft.rfft(ce, axis=0).real)[:mag.shape[0]]
    rng = np.random.default_rng(1); ph = np.exp(2j * np.pi * rng.random(Z.shape))
    _, y = istft(env * ph, SR, nperseg=1024, noverlap=768)
    # whispers are breathy: tilt toward highs, cut lows
    y = lfilter([1, -0.92], [1], y)
    y = y / (np.abs(y).max() + 1e-9) * 0.6
    return y[:len(a)]
for voice in sys.argv[1:]:
    parts = []
    for r in pipe(text, voice=voice, speed=1.0):
        a = r.audio.numpy(); parts.append(a); parts.append(np.zeros(int(0.25 * SR)))
    a = np.concatenate(parts)
    w = whisper(a)
    sf.write(f'whisper_{voice}.wav', w, SR)
print('ok')
