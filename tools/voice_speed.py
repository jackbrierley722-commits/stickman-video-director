# Default channel voice: speed the finished narration up 1.2x WITH the pitch rising (like a phone editor's speed-up),
# and rescale every word timestamp so captions, SFX and cuts stay in sync.
# Usage (inside a video folder, after narrate.py):  python ../../tools/voice_speed.py [factor=1.2]
import json, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
f = float(sys.argv[1]) if len(sys.argv) > 1 else 1.2
a, sr = sf.read('vo.wav')
num, den = 5, int(round(5 * f))  # 1.2 -> 5/6
a = resample_poly(a, num, den)  # fewer samples at the same rate = faster and higher
sf.write('vo.wav', a, sr)
tm = json.load(open('timing.json')); k = num / den
for c in tm['clips']:
    c['start'] = round(c['start'] * k, 3); c['dur'] = round(c['dur'] * k, 3)
    for w in c['words']: w['a'] = round(w['a'] * k, 3); w['b'] = round(w['b'] * k, 3)
tm['total'] = round(tm['total'] * k, 3); tm['speed'] = f
json.dump(tm, open('timing.json', 'w'), indent=1)
open('timing.js', 'w').write('window.TIMING = ' + json.dumps(tm, indent=1) + ';\n')
print('voice x%.2f (pitch up), total %.2fs' % (num and den / num, tm['total']))
