# Generate narration per clip with Kokoro + word timestamps -> vo.wav, timing.json
import json, sys, numpy as np, soundfile as sf
import espeakng_loader  # use the system espeak-ng (the bundled build has a broken data path)
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
VOICE = sys.argv[1] if len(sys.argv) > 1 else 'am_michael'
VO = [
 "If you kick a ball between two villages, you have football. But hundreds join in, and it becomes a riot.",
 "So you put it on a field, with two teams. But some players pick up the ball, and run.",
 "So you write the rules down. No carrying. This is the Laws of the Game. Those who want to carry it, start rugby.",
 "But where do you score? So you put two posts at each end. This is the goal.",
 "But nobody can tell if it went in. So you add a crossbar, and a net.",
 "But players keep fouling near the goal. So you give a free kick from twelve yards. This is the penalty.",
 "But players argue about everything. So you add a referee, with a whistle.",
 "Now every country wants in. So you hold a World Cup. And that's football. What rule would you add?",
]
SR = 24000; LEAD = 0.2; TAIL = 0.45
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
    dur = LEAD + len(body) / SR + TAIL
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words}); t += dur
full = np.concatenate(audio)
sf.write('vo.wav', full, SR)
json.dump({'voice': VOICE, 'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
print('total', round(t, 2), [c['dur'] for c in clips])
