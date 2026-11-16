# Voices with OmniVoice (VoiceStudio's default engine): a designed narrator + a designed friend with real [laughter].
import json, time, torch, numpy as np, soundfile as sf
from omnivoice import OmniVoice
NARR = 'male, low pitch, american accent'
FRIEND = 'male, young adult, high pitch, american accent'
LINES = [
 ('N', "Send this to the friend who laughs at their own jokes."),
 ('F', "Okay, okay. Why did the chicken cross the road? [laughter]"),
 ('N', "He hasn't even said the punchline."),
 ('F', "To get to the... [laughter] I can't. I can't do it."),
 ('N', "A psychologist actually measured this. People laugh about forty six percent more when they're the one talking."),
 ('F', "The other side! [laughter]"),
 ('N', "Nobody laughed. Except him."),
 ('N', "Send it to him. He'll laugh before he finishes reading it."),
]
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
SR = 24000; clips = []; audio = []; t = 0.0
for who, text in LINES:
    a = m.generate(text=text, instruct=NARR if who == 'N' else FRIEND, speed=1.08 if who == 'N' else 1.0)
    w = a[0] if isinstance(a, (list, tuple)) else a
    w = w.squeeze().cpu().numpy() if hasattr(w, 'cpu') else np.asarray(w).squeeze()
    nz = np.where(np.abs(w) > 0.01)[0]; w = w[max(0, nz[0] - 600):nz[-1] + 1800] if len(nz) else w
    gap = 0.18; dur = len(w) / SR + gap
    clips.append({'who': who, 'text': text, 'start': round(t, 3), 'dur': round(dur, 3)}); audio.append(np.concatenate([w, np.zeros(int(gap * SR))])); t += dur
full = np.concatenate(audio); full = full / np.abs(full).max() * 0.92
sf.write('vo.wav', full, SR); json.dump({'total': round(t, 3), 'clips': clips}, open('timing.json', 'w'), indent=1)
open('timing.js', 'w').write('window.TIMING = ' + json.dumps({'total': round(t, 3), 'clips': clips}) + ';\n')
print('total', round(t, 2), [c['dur'] for c in clips])
