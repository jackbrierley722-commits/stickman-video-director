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
 "Pick a planet. You have to live there for a year. ~ And every planet has a catch.",
 "Good choice. ~ Planet one. The library planet. ~ Every book ever written. Rain on the windows.",
 "The catch? ~ You can only whisper. ~ All year.",
 "Not bad. ~ Planet two. Snowy mountains, and hot springs everywhere. ~ Free ramen.",
 "The catch? ~ The second you step out of the water, ~ it's minus thirty.",
 "Like and follow. ~ Planet three is the one nobody comes back from.",
 "OMEN|Bad choice.",
 "Planet three. A night market that never closes. ~ Lanterns. Street food. Everything is free.",
 "The catch? ~ It's always two in the morning. ~ The sun never rises. ~ And the vendors never stop smiling.",
 "Alright. ~ Planet four. Your own island. ~ A lighthouse, endless sunsets, ~ and a dog.",
 "The catch? ~ You're the only human there.",
 "Which planet are you picking? ~ Comment one, two, three, or four.",
]






MIN = {}
WHISPER = set()
SR = 24000; LEAD = 0.08; TAIL = 0.14
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    V = VOICE; SP = 1.3; OMEN = text.startswith('OMEN|')
    if OMEN: text = text[5:]; SP = 0.85
    if '|' in text: V, text = text.split('|', 1); SP = 1.12
    segs = []; words = []; off = LEAD
    import re
    sents = [x for x in re.split(r'(?<=[.?!])\s+', text) if x.strip()]
    longp = [False] * len(sents)
    for k in range(len(sents) - 1):
        if sents[k + 1].startswith('~'): longp[k] = True; sents[k + 1] = sents[k + 1].lstrip('~ ')
    for si, sent in enumerate(sents):
     for r in pipe(sent, voice=V, speed=SP):
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
    if OMEN:  # long tired sigh, then the line slower and deeper
        from scipy.signal import lfilter as lf, resample
        n = int(1.5 * SR); x = np.arange(n) / SR; rn = np.random.default_rng(3).normal(0, 1, n)
        def reson(sig, f, bw): r_ = np.exp(-np.pi * bw / SR); return lf([1 - r_], [1, -2 * r_ * np.cos(2 * np.pi * f / SR), r_ * r_], sig)
        br = reson(rn, 650, 300) * 0.6 + reson(rn, 1150, 400) * 0.35 + reson(rn, 2600, 900) * 0.12
        voiced = np.sin(2 * np.pi * np.cumsum(115 - 30 * x / 1.5) / SR) * 0.25 * np.exp(-x * 2.2)
        e_ = np.minimum(1, x / 0.18) * np.exp(-np.maximum(0, x - 0.18) * 1.9); sig = (br + voiced * 0.4) * e_; sig = sig / (np.abs(sig).max() + 1e-9) * 0.42
        gap = np.zeros(int(0.45 * SR)); fct = 1 / 0.86; body2 = resample(body, int(len(body) * fct)) * 0.95
        pre = len(sig) + len(gap); cs = t + LEAD
        for w in words: w['a'] = round(cs + pre / SR + (w['a'] - cs) * fct, 3); w['b'] = round(cs + pre / SR + (w['b'] - cs) * fct, 3)
        body = np.concatenate([sig, gap, body2])
    if V == 'am_onyx':  # guard: shouted down a concrete corridor (band-limited + echo)
        from scipy.signal import butter, sosfilt
        body = sosfilt(butter(4, [300, 3400], 'bandpass', fs=SR, output='sos'), body); e = np.zeros(len(body) + int(0.5 * SR)); e[:len(body)] += body
        for d, g in ((0.11, 0.35), (0.23, 0.2), (0.37, 0.1)): e[int(d * SR):int(d * SR) + len(body)] += g * body
        body = np.tanh(e * 1.6) * 0.8
    dur = MIN[i] if not text else max(MIN.get(i, 0), LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words, 'voice': V}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
