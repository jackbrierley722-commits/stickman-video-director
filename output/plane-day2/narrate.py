# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "Day 2. You voted A. So Jake and Ryan grab a branch, and head towards the light.",
 "The forest is pitch black. Every step crunches on dry leaves. And the light keeps flickering through the trees.",
 "They get closer. And closer. Then the light blinks. It isn't a light. It's two eyes.",
 "Jake and Ryan run. They don't stop until they're back at camp.",
 "But something's wrong. There are footprints all around the shelter. And the water and first aid kit they saved from the plane are gone.",
 "Rule 2: Never leave your camp unguarded.",
 "Then, behind them, they hear footsteps.",
 "Option A: Follow the footprints, and get the supplies back. Option B: Build a fire, and stay awake until morning. Comment A or B. The most popular choice decides Day 3.",
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
    dur = max(4.5, LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
