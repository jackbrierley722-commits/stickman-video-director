# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, re, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline

VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "So, you want to watch your bro shower.",
 "But the bathroom is upstairs. ~ So you get a ladder. ~ It's two metres short.",
 "So you build stilts. ~ Ten metre stilts. ~ Then you sneeze.",
 "So you buy a drone. ~ He throws a shampoo bottle at it. ~ Headshot.",
 "So you strap forty fireworks to a garden chair, ~ and light them.",
 "You overshoot. ~ By about four hundred kilometres. ~ You're in orbit.",
 "So you borrow a space telescope. ~ You finally see through his window. ~ He's showering, ~ in his clothes.",
 "Mum was right. ~ He is a weirdo.",
]
SR = 24000; LEAD = 0.08; TAIL = 0.14
pipe = KPipeline(lang_code='a')
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    V = VOICE; SP = 1.25
    if '|' in text: V, text = text.split('|', 1); SP = 1.15
    segs = []; words = []; off = LEAD
    sents = [x for x in re.split(r'(?<=[.?!])\s+', text) if x.strip()]
    longp = [False] * len(sents)
    for k in range(len(sents) - 1):
        if sents[k + 1].startswith('~'): longp[k] = True; sents[k + 1] = sents[k + 1].lstrip('~ ')
    for si, sent in enumerate(sents):
        for r in pipe(sent, voice=V, speed=SP):
            a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
            nzi = np.where(np.abs(a) > 0.01)[0]
            lead = max(0, nzi[0] - int(0.03 * SR)) if len(nzi) else 0
            tail = min(len(a), nzi[-1] + int(0.08 * SR)) if len(nzi) else len(a)
            a = a[lead:tail]; off -= lead / SR
            for tok in (r.tokens or []):
                if tok.start_ts is not None and tok.text.strip() and any(ch.isalnum() for ch in tok.text):
                    words.append({'w': tok.text, 'a': round(t + off + tok.start_ts, 3), 'b': round(t + off + (tok.end_ts or tok.start_ts + 0.2), 3)})
            segs.append(a); off += len(a) / SR + lead / SR
        gap = (0.5 if longp[si] else 0.22) if si < len(sents) - 1 else 0.1
        segs.append(np.zeros(int(gap * SR))); off += gap
    body = np.concatenate(segs)
    if V != VOICE: body = np.tanh(body * 2.2) * 0.8  # shouting: a little hotter
    dur = LEAD + len(body) / SR + TAIL
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words, 'voice': V}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
open('timing.js', 'w').write('window.TIMING = ' + json.dumps({'voice': VOICE, 'total': round(t, 3), 'clips': clips}) + ';\n')
print('total', round(t, 2), [c['dur'] for c in clips])
