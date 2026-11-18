# Synthesize music bed + SFX for the 100s video (44.1kHz stereo WAV).
import numpy as np, wave, sys
SR=44100; D=100.0; N=int(SR*D); t=np.arange(N)/SR
rng=np.random.default_rng(3)
def env(a,b,att=0.01,rel=0.2):
    e=np.zeros(N); i0,i1=int(a*SR),min(N,int(b*SR)); n=i1-i0
    x=np.ones(n); na=max(1,int(att*SR)); nr=max(1,int(rel*SR)); x[:na]=np.linspace(0,1,na); x[-nr:]*=np.linspace(1,0,nr); e[i0:i1]=x; return e
def lp(x,a): # one-pole lowpass
    y=np.empty_like(x); acc=0.0
    for i in range(0,len(x)): acc+=a*(x[i]-acc); y[i]=acc
    return y
def lp_fast(x,k): # moving average lowpass
    c=np.cumsum(np.insert(x,0,0)); y=(c[k:]-c[:-k])/k; return np.concatenate([y,np.full(k-1,y[-1])])
out=np.zeros(N)
# music level automation (duck in clip 8 reveal)
lvl=np.ones(N); 
for a,b,v in [(70.0,71.0,None)]: pass
lvl=np.interp(t,[0,0.5,70,70.6,76.5,78,100],[0,1,1,0.15,0.15,1,1])
# drone
dr=0.07*np.sin(2*np.pi*55*t)+0.05*np.sin(2*np.pi*55.4*t+1)+0.04*np.sin(2*np.pi*82.4*t)+0.02*np.sin(2*np.pi*110*t)
dr*= (0.75+0.25*np.sin(2*np.pi*0.07*t))
dr*=np.interp(t,[0,60,62,100],[0.8,0.8,1.15,1.15])
out+=dr*lvl
# plucks (Karplus-Strong)
def pluck(f,dur=2.5,amp=0.18):
    n=int(SR*dur); p=int(SR/f); buf=rng.uniform(-1,1,p); y=np.zeros(n)
    for i in range(n): y[i]=buf[i%p]; buf[i%p]=0.996*0.5*(buf[i%p]+buf[(i+1)%p])
    return amp*y
notes=[220,261.6,329.6,293.7,220,196,261.6,246.9]
k=0; tt=0.8
while tt<96:
    if not (70.3<tt<77.5):
        f=notes[k%len(notes)]; y=pluck(f,2.4,0.13); i=int(tt*SR); out[i:i+len(y)]+=y[:N-i]
        if k%4==0: y2=pluck(f/2,2.4,0.08); out[i:i+len(y2)]+=y2[:N-i]
    k+=1; tt+=2.5 if tt<60 else 2.0
# final unresolved chord
for f in [220,233.1,329.6]:
    y=pluck(f,4.5,0.11); i=int(95.6*SR); out[i:i+len(y)]+=y[:N-i]
# wind noise (louder at night)
wn=lp_fast(rng.normal(0,1,N),60)*0.9
wn*=np.interp(t,[0,10,20,60,70,100],[0.06,0.05,0.02,0.02,0.09,0.1])*(0.7+0.3*np.sin(2*np.pi*0.11*t))
out+=wn
# heartbeat from 60s
def thump(at,amp=0.5,f=48):
    n=int(0.25*SR); x=np.arange(n)/SR; y=amp*np.sin(2*np.pi*f*x*(1-0.3*x))*np.exp(-x*22); i=int(at*SR)
    if i<N: out[i:i+n]+=y[:N-i]
hb=60.5
while hb<99:
    if not (70.3<hb<76.5): thump(hb,0.35); thump(hb+0.28,0.25)
    hb+=0.86
thump(98.6,0.6); thump(98.88,0.45)
# SFX helpers
def noise_burst(at,dur,amp,k=8,decay=8):
    n=int(dur*SR); x=np.arange(n)/SR; y=lp_fast(rng.normal(0,1,n),k)*amp*np.exp(-x*decay); i=int(at*SR); out[i:i+n]+=y[:N-i]
def tone(at,dur,f,amp,decay=6):
    n=int(dur*SR); x=np.arange(n)/SR; y=amp*np.sin(2*np.pi*f*x)*np.exp(-x*decay); i=int(at*SR); out[i:i+n]+=y[:N-i]
def creak(at,dur,amp=0.12):
    n=int(dur*SR); x=np.arange(n)/SR; f=180+80*np.sin(x*5); ph=np.cumsum(f)/SR
    y=amp*np.sign(np.sin(2*np.pi*ph))*(0.5+0.5*np.sin(2*np.pi*23*x)); y=lp_fast(y,6)*np.hanning(n); i=int(at*SR); out[i:i+n]+=y[:N-i]
# clip1 footsteps + splash
for s in np.arange(6.8,10,0.33): noise_burst(s,0.12,0.25,20,30)
noise_burst(8.2,0.5,0.3,3,6)
thump(4.6,0.15,40)  # distant groan-ish
creak(10.3,1.2); noise_burst(17.2,1.0,0.06,2,2)  # door, lantern hiss
noise_burst(21.3,0.35,0.25,4,10)  # whoosh
tone(22.6,0.15,880,0.05,30)
for s in np.arange(25.3,29.5,0.01): pass
# ripple hum
y=0.06*np.sin(2*np.pi*70*t)*env(25.2,29.6,0.5,1.5); out+=y
noise_burst(30.6,0.9,0.12,6,3)  # tarp
for s in np.arange(33.5,36.5,0.4): tone(s,0.2,140+rng.uniform(-20,20),0.18,18); noise_burst(s,0.15,0.08,10,20)
for s in [43.4,44.2,44.9]: tone(s,0.25,1400,0.12,25); tone(s+0.02,0.2,700,0.08,25)
creak(44.8,0.5,0.1)  # tap squeak
creak(46.7,1.0,0.09)  # pantry
for s in [47.8,48.1,48.5,50.2,50.5,50.8,51.1,51.4]: tone(s,0.3,2100+rng.uniform(-200,200),0.06,14)
for s in np.arange(53.2,54.8,0.18): tone(s,0.08,320,0.07,30)
for s in np.arange(54.4,57.6,0.05): noise_burst(s,0.04,0.05,1,60)  # pencil
noise_burst(58.1,0.25,0.4,3,25)  # notebook snap
for b in [61.7,62.4,63.1]: noise_burst(b,0.6,0.9,12,9); thump(b,0.9,55)
creak(62.0,1.2,0.06)  # lantern chain
noise_burst(66.9,0.8,0.06,2,4)  # curtain
# groan
n=int(2.2*SR); x=np.arange(n)/SR; f=95+8*np.sin(2*np.pi*5*x)-15*x; ph=np.cumsum(f)/SR
g=0.22*lp_fast(np.sign(np.sin(2*np.pi*ph))+0.3*rng.normal(0,1,n),25)*np.hanning(n); i=int(74.0*SR); out[i:i+n]+=g
g2=g*0.6; i=int(91.5*SR); out[i:i+n]+=g2; i=int(94.5*SR); out[i:i+n]+=g2*0.7
thump(80.9,0.6,90); noise_burst(80.9,0.2,0.4,5,20)  # bolt clunk
creak(83.2,2.5,0.12)  # cabinet scrape
noise_burst(86.8,1.2,0.12,3,2)  # crops rustle
# fade out end
out*=np.interp(t,[0,0.3,98.5,100],[0,1,1,0])
out=np.tanh(out*1.3)*0.85
st=np.stack([out,out*0.98],1)
pcm=(st*32767).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('audio ok')
