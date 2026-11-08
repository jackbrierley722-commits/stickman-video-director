# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "Pick an island. You have to live there for one whole year. Choose fast.",
 "Five.", "Four.", "Three.", "Two.", "One.",
 "Island A. A free mansion, with a pool. The catch? A goose lives there. It hates you. And it's faster than you.",
 "Island B. The best beaches on Earth. But you can only walk backwards. Want to watch the sunset? Better turn around.",
 "Island C. Any food you want, for free. Pizza. Burgers. Cake. But everything tastes like broccoli. Even the ice cream.",
 "Island D looks normal. But this one's real. It's Christmas Island, in the Indian Ocean. Every year, tens of millions of red crabs march across the whole island. On the roads. In the gardens. At your front door.",
 "So, which island did you pick? Comment A, B, C, or D.",
]
MIN = {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0}
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
    dur = max(MIN.get(i, 0), LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
