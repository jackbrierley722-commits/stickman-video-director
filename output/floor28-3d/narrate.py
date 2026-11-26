# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "If the zombie apocalypse starts while you're on the twenty eighth floor, don't run. Everyone else is racing for the stairs and the elevators. That's exactly where the zombies will go.",
 "Rule one: Stay in the room. Lock the door, and push a desk against it.",
 "Rule two: Make no sound. Phone on silent, shoes off, and not a single word.",
 "Next, water. On the top floors, the taps die first. So fill every jug and bottle you can find. Fourteen litres. That's one week, if you're careful.",
 "Then food. Search every desk drawer. Nine snack bars, four pots of noodles, and a jar of coffee. Write it all down. Everything gets tracked.",
 "That night, the power goes out. The whole city goes dark. And outside your door, something starts scratching.",
 "Option A: Stay silent, and wait. Option B: Check who it is. Comment A or B. The most popular choice decides Day 2.",
]
SR = 24000; LEAD = 0.3; TAIL = 0.6
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    segs = []; words = []; off = LEAD
    for r in pipe(text, voice=VOICE, speed=0.94):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
        for tok in (r.tokens or []):
            if tok.start_ts is not None and tok.text.strip() and any(ch.isalnum() for ch in tok.text):
                words.append({'w': tok.text, 'a': round(t + off + tok.start_ts, 3), 'b': round(t + off + (tok.end_ts or tok.start_ts + 0.2), 3)})
        segs.append(a); off += len(a) / SR + 0.12
        segs.append(np.zeros(int(0.12 * SR)))
    body = np.concatenate(segs)
    dur = max(4.0, LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
