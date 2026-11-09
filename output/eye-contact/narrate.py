# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "At three thirty two in the morning, every phone in the city goes off. At the exact same time. And the message only says one thing.",
 "Don't make any eye contact.",
 "This is Ellie. She's nineteen, and she's home alone with her little brother Theo. Their parents are stuck across the city.",
 "The alert keeps going. Stay inside. Cover your windows. Whatever you see out there, do not look at it.",
 "But Theo is already at the window. Ellie, there's a really tall man outside.",
 "Ellie grabs him, and pulls him away. She doesn't look. But out of the corner of her eye, she sees it. Something tall. Standing between the buildings. Not moving.",
 "Then, a scream. Across the street, someone looked. Two seconds later, the tall figure is right outside their window. On the fourteenth floor.",
 "Rule one. They only come for the ones who look. So Ellie slides the bookshelf across the window. Then the wardrobe. No gaps. No glass.",
 "Theo whispers. Why the window? And Ellie says. Because if we can't see them, they can't find us.",
 "Four AM. Total silence. Then something taps on the glass. Behind the wardrobe. Three times.",
 "And Ellie's phone lights up again. New alert. One of them is inside your building.",
 "Option A. Stay hidden behind the wardrobe until sunrise. Option B. Run for the car, with your eyes closed. Comment A or B. The most popular choice decides part two.",
]



MIN = {1: 2.6}
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
    dur = max(MIN.get(i, 0), LEAD + len(body) / SR + TAIL)
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
