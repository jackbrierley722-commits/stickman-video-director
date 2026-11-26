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
 "You've got eight minutes before this train explodes. ~ Again.",
 "This is Source Code, from twenty eleven. ~ And I'm explaining all of it. Ending included.",
 "Captain Colter Stevens wakes up on a commuter train into Chicago. ~ In a stranger's body. ~ A teacher called Sean.",
 "Same coffee spill. Same woman across from him. Christina. ~ Then. ~ The train explodes.",
 "He wakes up again. ~ Strapped inside a dark capsule.",
 "A voice on a screen, Captain Goodwin, explains. ~ Source Code lets him relive the last eight minutes of Sean's memory. ~ Over and over.",
 "His mission? ~ Find the bomber. ~ Because the same man is about to set off a dirty bomb in Chicago.",
 "Like and follow. ~ This is where it gets strange.",
 "Each loop, he learns more. ~ The bomb is in the vent above the toilet. ~ He accuses the wrong man. ~ And dies again.",
 "They tell him it's not time travel. ~ The past can't be changed. ~ So he starts asking questions about himself.",
 "And the answer is brutal. ~ Colter died two months ago, in Afghanistan. ~ What's left of him is kept alive on machines. ~ The capsule only exists in his head.",
 "He keeps going anyway. ~ Next loop, he finds a wallet left on a seat. ~ Derek Frost. ~ The bomber got off the train, before it blew.",
 "Colter gives them the name. ~ The real attack is stopped. ~ Mission complete.",
 "But the army plans to wipe his memory, and use him again.",
 "So he asks Goodwin for one last trip. ~ And to switch him off, when the eight minutes end.",
 "This time, he stops the bomb. ~ He calls his dad. ~ He kisses Christina.",
 "Eight minutes. ~ Goodwin switches him off. ~ Everything freezes.",
 "And then. ~ It keeps going.",
 "Source Code was never a simulation. ~ Every loop made a real, new world. ~ And in this one, he's alive. ~ Living Sean's life.",
 "He sends Goodwin a message. ~ But this Goodwin has never met him. ~ Yet.",
 "So, would you take that deal? ~ A real life, in someone else's body? ~ Comment yes or no.",
]






MIN = {}
WHISPER = set()
SR = 24000; LEAD = 0.08; TAIL = 0.14
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    V = VOICE; SP = 1.25
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
