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
 "In this town. ~ Every Monday, everyone wakes up in the wrong body. ~ Except one man. ~ And now, me.",
 "At seven, you wake up as a random neighbour, for a whole week. ~ Last week, my dad woke up as the baker. ~ He made four hundred croissants. ~ He can't even make toast.",
 "My teacher spent a week as a baby. ~ He still gave us homework.",
 "At weddings, everyone wears name tags. ~ Because by Monday, your wife could be the postman.",
 "There's one rule. ~ Be in bed by seven. ~ Whoever you wake up as, that's your life now.",
 "Except old Mister Hale. ~ The clock tower keeper. ~ Every Monday, the whole town swaps. ~ He never does.",
 "Then my best friend, Leo, tried to skip a Monday. ~ He stayed awake in his basement. ~ Eyes wide open.",
 "At seven, the whole town swapped. ~ Except Leo. ~ By eight, the Swap Patrol had him. ~ They dragged him into the clock tower.",
 "Like and follow. ~ Because that night, I went in after him.",
 "First, I asked my mum why we swap. ~ She said, Mondays are Mondays. ~ This week, the mayor was a seven year old. ~ She just shrugged.",
 "So on Sunday night, I climbed the clock tower.",
 "Behind the clock face, there was a machine. ~ Thousands of wires. ~ One to every bed in town. ~ And in the middle, a chair. ~ Leo was strapped into it.",
 "Then Mister Hale stepped out of the dark.",
 "bm_george|Sixty years ago, this town had a wall down the middle. ~ Both sides hated each other. ~ So I built this. ~ You can't hate someone, once you've been them.",
 "bm_george|But the machine needs one person who never swaps. ~ I'm too old now. ~ It needs someone new.",
 "Leo was shaking. ~ So I had a choice. ~ Unplug it, and the wall goes back up. ~ Or take Leo's place.",
 "I thought about the week I woke up as my dad. ~ I finally got why he's always tired. ~ When I swapped back, I hugged him.",
 "So I unstrapped Leo. ~ And I sat down in the chair.",
 "Would you have sat down? ~ Comment YES or NO. ~ And follow. ~ Because it's Sunday night. ~ Be in bed by seven.",
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
