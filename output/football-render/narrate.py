# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "How did the world's most popular sport begin? Let's go back, more than two thousand years.",
 "Step one: Ancient China. Soldiers played a game called chew joo, kicking a leather ball into a net to train for battle.",
 "Step two: Medieval England. Whole villages played mob football. Hundreds of people, almost no rules, and plenty of broken bones. It got so wild that kings tried to ban it.",
 "Step three: The early eighteen hundreds. English schools each played their own version. Some kicked the ball, some carried it. Nobody agreed on the rules.",
 "Step four: eighteen forty eight. Students at Cambridge University wrote one of the first shared rulebooks, so teams from different schools could finally play each other.",
 "Step five: eighteen fifty seven. Sheffield F C is founded. Today, it's recognised as the oldest football club in the world.",
 "Step six: eighteen sixty three. In a London pub, the Football Association is formed, and writes the Laws of the Game. Carrying the ball is out, and rugby goes its own way.",
 "Step seven: eighteen seventy two. The first international match. Scotland versus England. The result? Nil, nil. That same year, the very first F A Cup final is played.",
 "Step eight: eighteen eighty eight. The Football League kicks off. Three years later, goal nets and penalty kicks arrive.",
 "Step nine: nineteen oh four. FIFA is founded in Paris, to run the game worldwide. Step ten: nineteen thirty. Uruguay hosts the first World Cup, and wins it, beating Argentina four two in the final.",
 "Today, billions of people love football. From a leather ball in ancient China, to the biggest sport on Earth. Which step surprised you most? Tell me in the comments.",
]
SR = 24000; LEAD = 0.35; TAIL = 0.75
pipe = KPipeline(lang_code='b' if VOICE.startswith('b') else 'a')
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
