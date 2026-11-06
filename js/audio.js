/* =========================================================
   音：効果音・BGM・映写機の環境音。すべてWebAudioで合成（音声ファイルなし）
   仕様は docs/SOUND.md
   ========================================================= */
/* ================================================================
   音：すべてWebAudioで合成（素材ファイルなし・数KB）
   BGMは「エンドロールの余韻」を邪魔しない音量で、ジャンルの記号だけを最小の音数で鳴らす。
   ================================================================ */
let ac=null,master=null,musicBus=null,humGain=null,noiseBuf=null,muted=false;
try{muted=localStorage.getItem("er_muted")==="1";}catch(e){}
const mtof=n=>440*Math.pow(2,(n-69)/12);
function initAudio(){
  if(ac){if(ac.state==="suspended")ac.resume();return;}
  try{
    ac=new (window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=muted?0:.7;master.connect(ac.destination);
    musicBus=ac.createGain();musicBus.gain.value=0;musicBus.connect(master);
    const len=ac.sampleRate*2;noiseBuf=ac.createBuffer(1,len,ac.sampleRate);
    const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    // 映写機の回転音：ノイズ→バンドパスを24コマ/秒で揺らす
    const src=ac.createBufferSource();src.buffer=noiseBuf;src.loop=true;
    const bp=ac.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1500;bp.Q.value=.8;
    humGain=ac.createGain();humGain.gain.value=0;
    const lfo=ac.createOscillator();lfo.type="square";lfo.frequency.value=24;
    const amt=ac.createGain();amt.gain.value=.002;lfo.connect(amt).connect(humGain.gain);
    src.connect(bp).connect(humGain).connect(master);src.start();lfo.start();
  }catch(e){ac=null;}
}
function hum(on){if(!ac)return;humGain.gain.setTargetAtTime(on?.0035:0,ac.currentTime,.25);}
// 汎用ボイス：周波数・長さ・波形・音量・ピッチ終点・ローパス・出力先・アタック
function tone(f,t0,dur,type,vol,fEnd,lp,dest,atk){
  const o=ac.createOscillator(),g=ac.createGain();atk=atk||.008;
  o.type=type||"sine";o.frequency.setValueAtTime(f,t0);
  if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t0+dur);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+atk);g.gain.exponentialRampToValueAtTime(.0001,t0+Math.max(dur,atk+.02));
  let node=o;
  if(lp){const fl=ac.createBiquadFilter();fl.type="lowpass";fl.frequency.value=lp;o.connect(fl);node=fl;}
  node.connect(g).connect(dest||master);o.start(t0);o.stop(t0+Math.max(dur,atk+.02)+.05);
}
function noise(t0,dur,vol,freq,ftype,dest){
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=noiseBuf;f.type=ftype||"highpass";f.frequency.value=freq||3000;
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f).connect(g).connect(dest||master);s.start(t0,Math.random()*1.5);s.stop(t0+dur+.02);
}
const SE={
  found(c){if(!ac)return;const t=ac.currentTime,b=659.25*Math.pow(2,Math.min(c,9)/12);
    tone(b,t,.16,"triangle",.22);tone(b*1.5,t+.055,.3,"sine",.16);tone(b*3,t+.055,.22,"sine",.035);},
  wrong(){if(!ac)return;const t=ac.currentTime;tone(150,t,.18,"square",.14,95,700);tone(75,t,.2,"sine",.2);},
  miss(){if(!ac)return;const t=ac.currentTime;tone(494,t,.55,"triangle",.16,247);},
  clear(p){if(!ac)return;const t=ac.currentTime,n=p?[523.25,659.25,783.99,1046.5,1318.5]:[523.25,659.25,783.99];
    n.forEach((f,i)=>tone(f,t+i*.085,.45,"triangle",.14));},
  over(){if(!ac)return;const t=ac.currentTime;[392,311.13,261.63].forEach((f,i)=>tone(f,t+i*.28,.7,"sine",.18));},
  finale(){if(!ac)return;const t=ac.currentTime;
    [[60,64,67,72],[65,69,72,77],[67,71,74,79],[72,76,79,84]].forEach((ch,i)=>ch.forEach((n,j)=>tone(mtof(n),t+i*.45+j*.03,1.6,"triangle",.07,null,3000,master,.02)));},
  tick(){if(!ac)return;tone(1800,ac.currentTime,.04,"square",.03,null,3000);}
};

/* ---- BGM：ジャンルごとの小さなステップシーケンサー ----
   prog: [ルート(MIDI), 構成音(半音)] を1小節ずつ。play(s,t,ch,sd,bar) で1ステップ分を予約 */
const M=()=>musicBus;
const MUSIC={
  sf:{bpm:92,div:4,beats:4,prog:[[57,[0,3,7]],[53,[0,4,7]],[48,[0,4,7]],[55,[0,4,7]]],
    play(s,t,[r,iv],sd){
      if(s===0)iv.forEach(i=>tone(mtof(r+i),t,sd*16,"sawtooth",.018,null,850,M(),.5));
      const arp=[0,iv[1],iv[2],12];tone(mtof(r+12+arp[s%4]+(s>=8?12:0)),t,sd*.9,"sine",.04,null,null,M());
      if(s%8===0)tone(mtof(r-12),t,sd*7,"triangle",.1,null,null,M(),.02);
    }},
  horror:{bpm:54,div:2,beats:4,prog:[[45,[0,1]],[45,[0,1]],[44,[0,1]],[46,[0,6]]],
    play(s,t,[r,iv],sd,bar){
      if(s===0){tone(mtof(r-12),t,sd*8.5,"sine",.12,null,null,M(),1.2);iv.forEach(i=>tone(mtof(r+12+i),t,sd*8,"triangle",.016,null,1200,M(),1.6));}
      if(s===0&&bar%2===1)tone(70,t,.6,"sine",.18,40,null,M());
      if(Math.random()<.3)tone(mtof(81+R([0,3,6,8,11,-2])),t,1.2,"triangle",.03,null,null,M(),.005);
    }},
  western:{bpm:104,div:2,beats:4,prog:[[52,[0,7,12,15]],[50,[0,7,12,16]],[48,[0,7,12,16]],[47,[0,4,7,10]]],
    play(s,t,[r,iv],sd,bar){
      if(s===0||s===4)tone(mtof(r-12+(s===4?7:0)),t,.32,"triangle",.14,null,null,M());
      if(s===2||s===6)iv.forEach((i,k)=>tone(mtof(r+12+i),t+k*.012,.22,"triangle",.035,null,2600,M()));
      if(s%2===1&&Math.random()<.35)tone(mtof(R([64,67,69,71,74,76])+12),t,.18,"square",.022,null,1800,M());
    }},
  romance:{bpm:84,div:1,beats:3,prog:[[53,[0,4,7,11]],[52,[0,3,7,10]],[50,[0,3,7,10]],[48,[0,4,7,11]]],
    play(s,t,[r,iv],sd,bar){
      if(s===0){tone(mtof(r-12),t,sd*2.2,"triangle",.13,null,null,M());tone(mtof(r+24+iv[bar%2?3:2]),t,sd*2.8,"sine",.045,null,null,M(),.08);}
      else iv.forEach((i,k)=>tone(mtof(r+12+i),t+k*.01,sd*.7,"triangle",.022,null,2200,M()));
    }},
  action:{bpm:128,div:2,beats:4,prog:[[50,[0,7,12]],[50,[0,7,12]],[46,[0,7,12]],[48,[0,7,12]]],
    play(s,t,[r,iv],sd){
      tone(mtof(r-12+(s%2?12:0)),t,sd*.8,"sawtooth",.05,null,520,M());
      if(s===0||s===4)tone(120,t,.22,"sine",.3,42,null,M());
      if(s===2||s===6)noise(t,.14,.09,1800,"bandpass",M());
      if(s===0)iv.forEach(i=>tone(mtof(r+12+i),t,.2,"square",.022,null,1400,M()));
      if(s%2===1)noise(t,.03,.025,7000,"highpass",M());
    }},
  noir:{bpm:76,div:2,beats:4,prog:[[48,[0,3,7,10]],[53,[0,3,7,10]],[50,[0,3,6,10]],[55,[0,4,7,10]]],
    play(s,t,[r,iv],sd){
      const sw=s%2?sd*.34:0;
      if(s%2===0){const walk=[0,iv[1],iv[2],iv[2]+2][s/2];tone(mtof(r-12+walk),t,sd*1.7,"triangle",.13,null,null,M());}
      if(s===0)iv.forEach(i=>tone(mtof(r+12+i)*1.002,t,sd*6,"sine",.026,null,null,M(),.01));
      if(s===2||s===6)noise(t,.16,.03,5000,"highpass",M());
      if(s%2===1)noise(t+sw,.05,.012,6000,"highpass",M());
    }}
};
function sweep(t0,dur,vol,f0,f1,dest){
  const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=noiseBuf;f.type="bandpass";f.Q.value=4;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+dur);
  g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+dur*.9);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f).connect(g).connect(dest);s.start(t0,Math.random());s.stop(t0+dur+.02);
}
/* Bパート（後半4小節）に重ねる層 b と、8小節目の最後の1拍に入るフィル fill */
Object.assign(MUSIC.sf,{
  b(s,t,[r,iv],sd){if(s%8===0){const n=r+24+[iv[2],iv[1]][s/8];tone(mtof(n),t,sd*7.5,"sine",.04,null,null,M(),.06);tone(mtof(n)*.996,t,sd*7.5,"sine",.025,null,null,M(),.06);}},
  fill(k,t,ch,sd){if(k===0)sweep(t,sd*4,.05,400,6000,M());}});
Object.assign(MUSIC.horror,{
  b(s,t,[r],sd){if(s===0){tone(60,t,.25,"sine",.16,40,null,M());tone(mtof(r+37),t,sd*8,"sine",.01,null,null,M(),2);}if(s===1)tone(55,t,.22,"sine",.11,38,null,M());},
  fill(k,t,ch,sd){if(k===0)sweep(t,sd*2,.06,3000,300,M());}});
const WHISTLE=[[76,79,81,79],[74,78,79,78],[72,76,79,76],[71,75,78,75]];
Object.assign(MUSIC.western,{
  b(s,t,ch,sd,bar){if(s%2===0)tone(mtof(WHISTLE[bar%4][s/2]),t,sd*1.8,"sine",.04,null,null,M(),.04);},
  fill(k,t,[r,iv],sd){iv.forEach((i,j)=>tone(mtof(r+12+i),t+j*.008,.14,"triangle",.04,null,2600,M()));}});
Object.assign(MUSIC.romance,{
  b(s,t,[r,iv],sd){if(s===1)tone(mtof(r+24+iv[3]),t,sd*1.6,"sine",.03,null,null,M(),.06);},
  fill(k,t,[r,iv],sd){iv.concat(iv.map(i=>i+12)).forEach((i,j)=>tone(mtof(r+12+i),t+j*sd/8,.6,"triangle",.03,null,3000,M()));}});
Object.assign(MUSIC.action,{
  b(s,t,[r,iv],sd){if(s%2===1)tone(mtof(r+24+(s%4===1?0:7)),t,sd*.6,"sawtooth",.018,null,2000,M());},
  fill(k,t,ch,sd){noise(t,.08,.08,1800,"bandpass",M());noise(t+sd/2,.08,.1,1800,"bandpass",M());if(k===0)sweep(t,sd*2,.04,800,5000,M());}});
Object.assign(MUSIC.noir,{
  b(s,t,[r,iv],sd){if(s===0)tone(mtof(r+24+iv[3]),t,sd*3,"sawtooth",.02,null,1100,M(),.06);if(s===5)tone(mtof(r+24+iv[2]),t+sd*.34,sd*2,"sawtooth",.02,null,1100,M(),.06);},
  fill(k,t,[r],sd){if(k===1)tone(mtof(r-12+11),t+sd*.34,sd*.6,"triangle",.09,null,null,M());noise(t,.1,.025,5000,"highpass",M());}});
const bgm={timer:null,step:0,next:0,m:null};
function bgmStart(g){
  if(!ac)return;bgmStop(true);
  bgm.m=MUSIC[g];bgm.step=0;bgm.next=ac.currentTime+.12;
  musicBus.gain.cancelScheduledValues(ac.currentTime);musicBus.gain.setTargetAtTime(.32,ac.currentTime,.4);
  bgm.timer=setInterval(sched,25);sched();
}
function sched(){
  const m=bgm.m;if(!m)return;const sd=60/m.bpm/m.div,spb=m.div*m.beats;
  while(bgm.next<ac.currentTime+.12){
    const s=bgm.step%spb,bar=Math.floor(bgm.step/spb);
    const ch=m.prog[bar%m.prog.length];
    m.play(s,bgm.next,ch,sd,bar);
    if(Math.floor(bar/4)%2===1&&m.b)m.b(s,bgm.next,ch,sd,bar);
    if(bar%8===7&&m.fill&&s>=spb-m.div)m.fill(s-(spb-m.div),bgm.next,ch,sd);
    bgm.next+=sd;bgm.step++;
  }
}
function bgmStop(quick){
  clearInterval(bgm.timer);bgm.timer=null;bgm.m=null;
  if(ac&&musicBus){musicBus.gain.cancelScheduledValues(ac.currentTime);musicBus.gain.setTargetAtTime(0,ac.currentTime,quick?.05:.6);}
}
function setMute(m){muted=m;if(ac)master.gain.setTargetAtTime(m?0:.7,ac.currentTime,.02);
  try{localStorage.setItem("er_muted",m?"1":"0");}catch(e){}
  $("btnMute").setAttribute("aria-label",m?"音を出す":"音を消す");$("btnMute").style.opacity=m?.45:1;}
