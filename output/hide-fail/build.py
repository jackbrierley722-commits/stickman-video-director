# Assemble scenes.js for "How NOT to hide a body" from the shared blocky toolkit (late-friend) + this video's parts
import shutil, os
src = '../late-friend/'
for f in ['index.html', 'package.json', 'render.js', 'snap.js']:
    if not os.path.exists(f): shutil.copy(src + f, f)
if not os.path.exists('fonts'): shutil.copytree(src + 'fonts', 'fonts')
r = open('render.js').read().replace('late-friend.mp4', 'hide-fail.mp4'); open('render.js', 'w').write(r)
h = open(src + 'p_head.js').read()
a = h.index('// ---------- timing ----------'); b = h.index('function CLI(T)')
h = h[:a] + open('p_E.js').read() + h[b:]
h = h.replace("// Send this to your friend who's always late. Bright blocky 3D, text vs reality.", "// How NOT to hide a body. Bright blocky 3D dark comedy: every attempt fails.")
u = open(src + 'p_ui.js').read()
a = u.index('const SEQ'); b = u.index('const CAPS')
u = u[:a] + '''const SEQ = [[['fucking'], 'F***ING']];
const VCOL = { am_puck: '#ff6b6b' }, VWHO = { am_puck: 'YOU' };
const HL = /^(backyard|lake|freezer|concrete|driveway|dog|fisherman|landlord|smell|hand|police|caught|again|everything|f\\*\\*\\*ing|a|b|c)$/i;
''' + u[b:]
u = u.replace("!/^(I|LATE|Psychologists)$/", "!/^(I|A|B|C|Attempt|Comment|Like)$/")
e = open(src + 'p_end.js').read()
keep = e[:e.index('function bubble')]  # pill + captionHL + initFootball
open('scenes.js', 'w').write(h + open('p_hide.js').read() + u + keep + open('p_over.js').read())
print('scenes.js ok', os.path.getsize('scenes.js'))
