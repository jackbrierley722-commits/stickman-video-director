# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
from scipy.signal import stft, istft, lfilter
def whisper(a, SR=24000):
    f, t, Z = stft(a, SR, nperseg=1024, noverlap=768); mag = np.abs(Z)
    lm = np.log(mag + 1e-6); ce = np.fft.irfft(lm, axis=0); ce[40:-40] = 0; env = np.exp(np.fft.rfft(ce, axis=0).real)[:mag.shape[0]]
    ph = np.exp(2j * np.pi * np.random.default_rng(1).random(Z.shape)); _, y = istft(env * ph, SR, nperseg=1024, noverlap=768)
    y = lfilter([1, -0.92], [1], y); y = y / (np.abs(y).max() + 1e-9) * 0.85; return y[:len(a)]

VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "You got the night shift at a gas station. ~ There are five rules on the wall. ~ The last one is scratched out. ~ And underneath, someone wrote. Sorry.",
 "Rule one. At two in the morning, lock the doors. Only serve through the window.",
 "Rule two. If the light on pump four turns on, don't look at pump four.",
 "Rule three. Never sell the last bag of ice.",
 "Rule four. If someone pays with old coins, take them. Say thank you. Don't count them.",
 "Night one. One fifty eight. You lock the doors. ~ Like and follow. You'll want to know what rule five said.",
 "Two forty one. The light on pump four flickers on. ~ You keep your eyes down. ~ But in the window, there's a reflection. ~ Someone is standing at pump four.",
 "Then, a knock. ~ An old man, at the window. He wants ice. ~ You check the freezer. ~ One bag left.",
 "He slides a handful of old coins through the window. ~ Rule three says don't sell it. ~ Rule four says take the coins. ~ You can't follow both.",
 "Option A. Sell him the ice. Option B. Keep the ice, and refuse the coins. Comment A or B. And follow for night two.",
]






MIN = {}
WHISPER = set()
SR = 24000; LEAD = 0.15; TAIL = 0.3
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    segs = []; words = []; off = LEAD
    import re
    sents = [x for x in re.split(r'(?<=[.?!])\s+', text) if x.strip()]
    longp = [False] * len(sents)
    for k in range(len(sents) - 1):
        if sents[k + 1].startswith('~'): longp[k] = True; sents[k + 1] = sents[k + 1].lstrip('~ ')
    for si, sent in enumerate(sents):
     for r in pipe(sent, voice=VOICE, speed=1.2):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
        nz = np.where(np.abs(a) > 0.01)[0]
        lead = max(0, nz[0] - int(0.03 * SR)) if len(nz) else 0
        tail = min(len(a), nz[-1] + int(0.08 * SR)) if len(nz) else len(a)
        a = a[lead:tail]; off -= lead / SR
        for tok in (r.tokens or []):
            if tok.start_ts is not None and tok.text.strip() and any(ch.isalnum() for ch in tok.text):
                words.append({'w': tok.text, 'a': round(t + off + tok.start_ts, 3), 'b': round(t + off + (tok.end_ts or tok.start_ts + 0.2), 3)})
        segs.append(a); off += len(a) / SR + lead / SR
     gap = (0.5 if longp[si] else 0.22) if si < len(sents) - 1 else 0.1
     segs.append(np.zeros(int(gap * SR))); off += gap
    body = np.concatenate(segs) if segs else np.zeros(0)
    if i in WHISPER: body = whisper(body)
    dur = MIN[i] if not text else max(MIN.get(i, 0), LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
