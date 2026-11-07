# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "Imagine this. Your plane goes down in the middle of nowhere, and you're one of only two survivors. What would you do?",
 "Two friends, Jake and Ryan, were flying home when the engine failed. The plane tore through the trees and slammed into the forest.",
 "They crawl out of the wreck. Bruised, but alive. But the sun is already going down.",
 "Rule 1: Shelter before dark. Out here, night comes fast, and so does the cold.",
 "They lean branches into a frame, cover it in layers of leaves, and pile more leaves inside to keep warm.",
 "It's pitch black. They lie down. But just as they close their eyes, Ryan sits up. \"Jake... look.\"",
 "Option A: Investigate. It could be rescue... or something else. Option B: Stay quiet, and try to sleep until morning. Comment A or B. The most popular choice decides Day 2.",
]
SR = 24000; LEAD = 0.35; TAIL = 0.75
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    segs = []; words = []; off = LEAD
    for r in pipe(text, voice=VOICE, speed=1.0):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
        for tok in (r.tokens or []):
            if tok.start_ts is not None and tok.text.strip() and any(ch.isalnum() for ch in tok.text):
                words.append({'w': tok.text, 'a': round(t + off + tok.start_ts, 3), 'b': round(t + off + (tok.end_ts or tok.start_ts + 0.2), 3)})
        segs.append(a); off += len(a) / SR + 0.12
        segs.append(np.zeros(int(0.12 * SR)))
    body = np.concatenate(segs)
    dur = max(8.0, LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
