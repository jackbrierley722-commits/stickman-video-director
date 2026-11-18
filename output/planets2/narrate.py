# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "Pick a planet. You have to live there for one whole year. No coming back. And stay till Planet D, it's the strangest one. Like and follow, then choose fast.",
 "", "", "", "", "",
 "Planet A. Everything is giant. Mushrooms as tall as skyscrapers. Flowers you can sleep inside. Dew drops the size of swimming pools. And the ladybugs are as big as buses. They're friendly. Probably. But wait till you see where people live on Planet B.",
 "Planet B. There's no land. Just one endless ocean. So people live on the backs of giant turtles. Whole towns. Lighthouses. Bridges between shells. Every morning, your house swims somewhere new. Hope you don't get seasick. Planet C looks perfect. Until you hear the catch.",
 "Planet C. Rivers of lava. Cities made of black glass. Every house is a free mansion, with a pool. The catch? It's sixty degrees. Every single day. Your ice cream melts in two seconds. And the pool is a hot tub. Forever. And Planet D breaks the laws of physics.",
 "Planet D. Time is frozen. Raindrops hang in the air. Birds are stuck mid flight. A wave is frozen, mid crash. You're the only thing that moves. No one to talk to. But you can walk on the rain.",
 "So, which planet are you picking? Comment A, B, C, or D.",
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
    body = np.concatenate(segs) if segs else np.zeros(0)
    dur = MIN[i] if not text else max(MIN.get(i, 0), LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
