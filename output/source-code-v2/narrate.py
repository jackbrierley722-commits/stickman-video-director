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
 "The man reliving it was reported killed, two months ago. ~ And by the end, he'll be living a stranger's life.",
 "He wakes up on a commuter train into Chicago. ~ A coffee spills on his shoe. ~ The woman across from him talks like she knows him. ~ He's never seen her before.",
 "In the window, the reflection isn't his face. ~ It's a teacher called Sean.",
 "Eight minutes later, ~ as another train passes, ~ the whole train explodes.",
 "He wakes up again. ~ In a dark, freezing cockpit. ~ A woman on a screen gives him a mission. ~ Find the bomber. ~ Because he's planning a dirty bomb in Chicago next.",
 "Every time he fails, they send him back. ~ Same coffee. Same woman. Same eight minutes.",
 "Like and follow. ~ Because the cockpit isn't real either.",
 "Loop by loop, he finds clues. ~ The bomb, hidden in a vent in the toilet. ~ He chases the wrong man off the train. ~ And dies on the tracks.",
 "Then he looks himself up. ~ Captain Colter Stevens. ~ Killed in action, two months ago. ~ Most of his body is gone. ~ Machines keep his brain alive. ~ The cockpit only exists in his head.",
 "He keeps going anyway. ~ A wallet falls out of a passenger's pocket. ~ Derek Frost. ~ The bomber. ~ Colter memorises his licence plate.",
 "The police find the van. ~ The second attack never happens.",
 "But the scientist in charge wants to wipe his memory, and use him again. ~ So Colter begs for one last trip. ~ And to let him die, when it ends.",
 "This time, he defuses the bomb. ~ He calls his dad, pretending to be a friend, and makes peace with him. ~ He kisses the woman. Christina.",
 "Eight minutes. ~ They switch him off. ~ Everything freezes.",
 "And then. ~ It keeps going.",
 "He walks Christina to the giant bean in Chicago. ~ The loops were never a simulation. ~ Each one made a real world. ~ And in this one, he's alive.",
 "He emails the woman from the screen. ~ But in this world, she's never met him. ~ Yet.",
 "The movie is Source Code. ~ Twenty eleven.",
 "Would you take his deal? ~ A real life, in someone else's body? ~ Comment yes or no.",
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
