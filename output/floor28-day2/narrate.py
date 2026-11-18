# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "Day two. You voted A. So you stay silent, and wait.",
 "The scratching goes on for hours. Every few minutes, the bookcase shakes. You don't move. You barely breathe.",
 "Then, just before sunrise, it stops. Silence.",
 "Rule three. Ration everything. Two litres of water a day. Two meals. Nothing more. Twelve litres left.",
 "You check the window. Down on the street, the zombies are moving. They're following the sound of a car alarm. Noise is everything.",
 "Then your phone lights up. A message from your neighbour on floor twenty seven. \"I'm out of water. Please help.\" But how do they know you're still here?",
 "Option A. Stay hidden, and ignore it. Option B. Sneak down one floor, with water. Comment A or B. The most popular choice decides Day 3.",
]
SR = 24000; LEAD = 0.3; TAIL = 0.5
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    segs = []; words = []; off = LEAD
    import re
    sents = [x for x in re.split(r'(?<=[.?!])\s+', text) if x.strip()]
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
     gap = 0.22 if si < len(sents) - 1 else 0.1
     segs.append(np.zeros(int(gap * SR))); off += gap
    body = np.concatenate(segs)
    dur = LEAD + len(body) / SR + TAIL
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
