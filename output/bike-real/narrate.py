# Narration with emphasis: *word* = slower, louder, short beat before; ^word^ = SHOUTED (hot, higher, loud).
# Writes vo.wav, timing.json, timing.js (each word carries 'emph' 1 or 2 for the captions).
import json, sys, re, numpy as np, soundfile as sf
import espeakng_loader
espeakng_loader.get_library_path = lambda: '/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1'
espeakng_loader.get_data_path = lambda: '/usr/lib/x86_64-linux-gnu/espeak-ng-data'
from kokoro import KPipeline
from scipy.signal import resample_poly

VOICE = 'am_michael'
VO = [
 "To beat your bro to school, ~ you invent the *bike*.",
 "A wooden frame. ~ *No pedals.* ~ You're basically *running*, ~ *sitting down*. ~ Your bro walks past you. ~ The little ^shit!^",
 "So you stick pedals on the front wheel. ~ But the wheels are iron rimmed wood, ~ and every bump goes straight up your *spine*. ~ They called it the *boneshaker*.",
 "So you make the front wheel *massive*. ~ One pedal turn goes way further. ~ *Genius*. ~ Until *one pebble* ~ sends you over the handlebars.",
 "So, pedals in the *middle*, ~ a *chain* to the back wheel, ~ *same size* wheels. ~ The safety bicycle.",
 "But it still rattles your *teeth*. ~ So you fill the tyres with *air*.",
 "Now you beat your bro *every single day*. ~ He takes the *bus*.",
]
SR = 24000; LEAD = 0.08; TAIL = 0.14; SP = 1.25
pipe = KPipeline(lang_code='a')
def synth(text, speed):
    outs = []; toks = []
    for r in pipe(text, voice=VOICE, speed=speed):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
        nzi = np.where(np.abs(a) > 0.01)[0]; lead = max(0, nzi[0] - int(0.03 * SR)) if len(nzi) else 0; tail = min(len(a), nzi[-1] + int(0.08 * SR)) if len(nzi) else len(a)
        off = sum(len(o) for o in outs) / SR - lead / SR
        seg_len = (tail - lead) / SR; pend = []
        for tok in (r.tokens or []):
            if not (tok.text.strip() and any(ch.isalnum() for ch in tok.text)): continue
            if tok.start_ts is None: pend.append(tok.text); continue
            for pw in pend: toks.append([pw, None, None])
            pend = []; toks.append([tok.text, off + tok.start_ts, off + (tok.end_ts or tok.start_ts + 0.2)])
        for pw in pend: toks.append([pw, None, off + seg_len])
        outs.append(a[lead:tail])
    # fill missing timestamps between neighbours
    for k, tk in enumerate(toks):
        if tk[1] is None:
            prev = toks[k - 1][2] if k else 0.0; nxt = next((x[1] for x in toks[k + 1:] if x[1] is not None), (sum(len(o) for o in outs) / SR))
            tk[1] = prev; tk[2] = min(prev + 0.25, nxt) if tk[2] is None else tk[2]
    return (np.concatenate(outs) if outs else np.zeros(1)), toks
audio = []; clips = []; t = 0.0
for i, text in enumerate(VO):
    sents = [x for x in re.split(r'(?<=[.?!])\s+(?=~|\S)', text) if x.strip()]
    parts = []  # (text, kind, pause_before)
    for s in sents:
        pb = 0.36 if s.startswith('~') else 0.18
        s = s.lstrip('~ ')
        for j, seg in enumerate(re.split(r'(\*[^*]+\*|\^[^^]+\^)', s)):
            if not seg.strip(): continue
            kind = 2 if seg.startswith('^') else 1 if seg.startswith('*') else 0
            parts.append((seg.strip('*^ '), kind, pb if j == 0 or not parts else (0.09 if kind else 0.02)))
            pb = 0.03
    body = []; words = []; cur = LEAD
    for k, (seg, kind, pb) in enumerate(parts):
        if k: body.append(np.zeros(int(pb * SR))); cur += pb
        a, toks = synth(seg, SP * (0.95 if kind == 1 else 0.95 if kind == 2 else 1.0))
        if kind == 1: a = a * 1.4
        if kind == 2: a = resample_poly(a, 25, 27); a = np.tanh(a * 4.0) * 0.98; toks = [[w, s_ * 25 / 27, e_ * 25 / 27] for w, s_, e_ in toks]
        for w, s_, e_ in toks: words.append({'w': w, 'a': round(t + cur + s_, 3), 'b': round(t + cur + e_, 3), 'emph': kind})
        body.append(a); cur += len(a) / SR
    body = np.concatenate(body)
    dur = LEAD + len(body) / SR + TAIL
    clip = np.zeros(int(round(dur * SR))); clip[int(LEAD * SR):int(LEAD * SR) + len(body)] = body
    audio.append(clip); clips.append({'start': round(t, 3), 'dur': round(dur, 3), 'words': words, 'voice': VOICE}); t += dur
full = np.concatenate(audio); full = full / max(1e-6, np.abs(full).max()) * 0.95
sf.write('vo.wav', full, SR)
tm = {'voice': VOICE, 'total': round(t, 3), 'clips': clips}
json.dump(tm, open('timing.json', 'w'), indent=1); open('timing.js', 'w').write('window.TIMING = ' + json.dumps(tm) + ';\n')
print('total', round(t, 2), [c['dur'] for c in clips])
