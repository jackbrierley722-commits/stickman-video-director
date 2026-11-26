import json, numpy as np, soundfile as sf, librosa, torch, re
from omnivoice import OmniVoice
from transformers import pipeline
asr = pipeline('automatic-speech-recognition', model='openai/whisper-base.en', device='cpu')
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
FRIEND = 'male, young adult, high pitch, american accent'; SR = 24000
FIX = {3: ("To get to the... [laughter] sorry, I can't, I can't do it.", ['get', 'sorry', 'can']), 5: ("To get to the other side! [laughter]", ['other', 'side'])}
tm = json.load(open('timing.json')); a, _ = sf.read('vo.wav'); segs = [a[int(c['start'] * SR):int((c['start'] + c['dur']) * SR)] for c in tm['clips']]
for i, (text, keys) in FIX.items():
    best = None
    for attempt in range(5):
        torch.manual_seed(100 + attempt * 7 + i)
        w = m.generate(text=text, instruct=FRIEND); w = w[0] if isinstance(w, (list, tuple)) else w; w = w.squeeze().cpu().numpy() if hasattr(w, 'cpu') else np.asarray(w).squeeze()
        nz = np.where(np.abs(w) > 0.01)[0]; w = w[max(0, nz[0] - 600):nz[-1] + 1800]
        heard = asr({'raw': librosa.resample(w, orig_sr=SR, target_sr=16000).astype(np.float32), 'sampling_rate': 16000})['text'].lower()
        score = sum(k in heard for k in keys); print(i, attempt, score, '|', heard)
        if best is None or score > best[0]: best = (score, w)
        if score == len(keys): break
    w = best[1] / max(1e-6, np.abs(best[1]).max()) * 0.85; segs[i] = np.concatenate([w, np.zeros(int(0.18 * SR))]); tm['clips'][i]['text'] = text
t = 0.0
for c, s in zip(tm['clips'], segs): c['start'] = round(t, 3); c['dur'] = round(len(s) / SR, 3); t += len(s) / SR
tm['total'] = round(t, 3); full = np.concatenate(segs); full = full / np.abs(full).max() * 0.92
sf.write('vo.wav', full, SR); json.dump(tm, open('timing.json', 'w'), indent=1); open('timing.js', 'w').write('window.TIMING = ' + json.dumps(tm) + ';\n'); print('total', round(t, 2))
