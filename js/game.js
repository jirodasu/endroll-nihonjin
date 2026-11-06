/* =========================================================
   ゲーム本体：クレジット生成・スクロール・判定・幕間・結果・シェア
   ========================================================= */
const TOTAL_FILMS=CONFIG.TOTAL_FILMS,SHARE_URL=CONFIG.SHARE_URL;
/* ---------- 状態 ---------- */
const stage=$("stage"),crawl=$("crawl");
let round=1,lives=CONFIG.LIVES,score=0,combo=0,slots=[],film=null,y=0,running=false,paused=false,last=0;
let roundWrong=0,roundFound=[],roundMissed=[],allFound=[],filmLog=[],lineup=[],ff=false,totalJp=0;
let best=0;try{best=+localStorage.getItem("er_best")||0;}catch(e){}

const jpCount=r=>Math.min(CONFIG.JP_MAX,1+Math.floor(r*CONFIG.JP_RATE));
function buildFilm(gk){
  const G=GENRES[gk];
  document.body.dataset.genre=gk;
  crawl.innerHTML="";slots=[];
  film={genre:gk,title:R(G.t1)+" "+R(G.t2),studio:R(STUDIOS),vendor:R(VENDORS),loc:R(LOCS)};
  const nm=(en,ja)=>{const i=slots.length;slots.push({role:en,roleJa:ja,jp:false,state:"idle"});return `<span class="nm" data-i="${i}"></span>`;};
  let h=`<div class="spacer"></div><div class="card title"><div class="presents">${film.studio} presents</div><h2>${film.title}</h2><div class="genre-tag">${G.ja}</div></div>`;
  MAIN.slice(0,Math.min(MAIN.length,4+round)).forEach(([en,ja])=>{
    const two=en==="Produced by";
    h+=`<div class="card"><div class="cr">${en}</div><div class="names">${nm(en,ja)}${two?"<br>"+nm(en,ja):""}</div></div>`;
  });
  const cast=G.chars.slice(0,2+Math.min(2,round)).concat(shuffle(CHARS).slice(0,Math.min(CHARS.length,4+round)));
  h+=`<div class="dept"><h3>Cast</h3>${cast.map(c=>`<div class="row"><span class="role">${c}</span>${nm(c,"出演（"+c+" 役）")}</div>`).join("")}</div>`;
  const dN=Math.min(DEPTS.length,2+round);
  const pick=shuffle(DEPTS.map((_,i)=>i)).slice(0,dN).sort((a,b)=>a-b);
  const lists=shuffle(LISTS).slice(0,Math.min(LISTS.length,1+Math.floor(round/2)));
  const listSize=Math.min(18,6+round*2);
  const vfxAt=Math.floor(pick.length/2);
  const deptHTML=d=>{const rows=shuffle(d.rows).slice(0,Math.max(2,Math.min(d.rows.length,2+Math.floor(round/2)+Math.floor(Math.random()*2))));
    return `<div class="dept"><h3>${d.h}</h3>${rows.map(([en,ja])=>`<div class="row"><span class="role">${en}</span>${nm(en,ja)}</div>`).join("")}</div>`;};
  const vfxBlock=()=>{let s=`<div class="dept"><div class="vendor">Visual Effects by</div><div class="vendorname">${film.vendor}</div>`;
    lists.forEach(([en,ja])=>{s+=`<h3>${en}</h3><div class="grid">${Array.from({length:listSize},()=>nm(en,ja)).join("")}</div>`;});return s+"</div>";};
  pick.forEach((di,k)=>{
    if(k===vfxAt)h+=vfxBlock();
    if(k===1)h+=deptHTML(G.dept);
    h+=deptHTML(DEPTS[di]);
  });
  if(vfxAt>=pick.length)h+=vfxBlock();
  h+=`<div class="legal">Filmed on location in ${film.loc}<br><br>The characters and events depicted in this photoplay are fictitious. Any similarity to actual persons, living or dead, is purely coincidental.<div class="copy">© 2026 ${film.studio.toUpperCase()}<br>ALL RIGHTS RESERVED</div></div>`;
  crawl.innerHTML=h;

  const k=jpCount(round);
  const jpSet=new Set(shuffle(slots.map((_,i)=>i).filter(i=>i>=1)).slice(0,k));
  const used=new Set();
  slots.forEach((s,i)=>{
    s.jp=jpSet.has(i);
    let n;do{n=s.jp?jpName():westName();}while(used.has(n));used.add(n);
    s.name=n;s.kanji=s.jp?toKanji(n):"";s.el=crawl.querySelector(`[data-i="${i}"]`);s.el.textContent=n;
  });
  totalJp=k;
}

function hud(){
  const G=film?GENRES[film.genre]:null;
  $("hudFilm").innerHTML=film?`第${round}作 / ${TOTAL_FILMS}　<span class="g">${G.ja}</span>『${film.title}』`:"";
  const f=slots.filter(s=>s.jp&&s.state==="found").length;
  $("hudFound").innerHTML=`日本人 <b>${f}</b> / ${totalJp}`;
  $("hudScore").textContent=score.toLocaleString();
  $("hudCombo").textContent=combo>=2?`${combo} 連続`:"";
  $("hudLives").innerHTML=Array.from({length:CONFIG.LIVES},(_,i)=>i).map(i=>`<span class="life${i<lives?"":" off"}"></span>`).join("");
}
function floatText(x,yy,txt,cls){
  const r=stage.getBoundingClientRect();
  const el=document.createElement("div");el.className="float "+cls;el.textContent=txt;
  el.style.left=(x-r.left)+"px";el.style.top=(yy-r.top)+"px";stage.appendChild(el);
  setTimeout(()=>el.remove(),950);
}
let toastT=0;
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove("on"),1800);}
function shake(){stage.classList.remove("shake");void stage.offsetWidth;stage.classList.add("shake");}
function loseLife(){lives--;combo=0;hud();if(lives<=0){running=false;bgmStop();hum(false);setTimeout(()=>showResult(false),600);}}

stage.addEventListener("pointerdown",e=>{
  if(!running||paused)return;
  const t=e.target.closest(".nm");if(!t||!crawl.contains(t))return;
  const s=slots[+t.dataset.i];if(!s||s.state!=="idle")return;
  const r=t.getBoundingClientRect(),sr=stage.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top;
  if(s.jp){
    s.state="found";t.classList.add("found");
    const early=Math.max(0,Math.min(1,(r.top-sr.top)/sr.height));
    const pts=CONFIG.PTS_BASE+combo*CONFIG.PTS_COMBO+Math.round(early*CONFIG.PTS_EARLY);
    score+=pts;combo++;
    SE.found(combo-1);floatText(cx,cy,"+"+pts,"good");
    const rec={name:s.name,kanji:s.kanji,role:s.roleJa,roleEn:s.role,film:film.title,pts};roundFound.push(rec);allFound.push(rec);
    hud();
    if(slots.every(x=>!x.jp||x.state!=="idle")&&roundMissed.length===0&&!ff){ff=true;toast("全員発見！ 残りを早送りします");}
  }else{
    s.state="wrong";t.classList.add("wrong");roundWrong++;
    SE.wrong();floatText(cx,cy,"フィルム −1","bad");shake();loseLife();
  }
});

function loop(ts){
  if(!running)return;
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(!paused){
    const base=Math.min(CONFIG.SPEED_MAX,CONFIG.SPEED_BASE+(round-1)*CONFIG.SPEED_STEP);
    y-=base*(ff?CONFIG.FAST_FORWARD:1)*dt;
    crawl.style.transform=`translate3d(0,${y}px,0)`;
    const sr=stage.getBoundingClientRect();
    for(const s of slots){
      if(!s.jp||s.state!=="idle")continue;
      if(s.el.getBoundingClientRect().bottom<sr.top+6){
        s.state="missed";s.el.classList.add("missed");roundMissed.push({name:s.name,kanji:s.kanji,role:s.roleJa});
        SE.miss();toast(`${s.name} さんを見逃した…`);loseLife();
        if(!running)return;
        if(slots.every(x=>!x.jp||x.state!=="idle"))ff=true;
      }
    }
    if(y+crawl.offsetHeight<0){endRound();return;}
  }
  requestAnimationFrame(loop);
}

function startRound(){
  roundWrong=0;roundFound=[];roundMissed=[];ff=false;
  buildFilm(lineup[round-1]);y=stage.clientHeight;crawl.style.transform=`translate3d(0,${y}px,0)`;
  hud();running=true;paused=false;last=performance.now();hum(true);bgmStart(film.genre);
  requestAnimationFrame(loop);
}

function reelHTML(current){
  return `<div class="reel" aria-label="上映記録">${Array.from({length:TOTAL_FILMS},(_,i)=>{const f=filmLog[i];
    const c=f?(f.perfect?"p":f.found===0?"z":"h"):"";return `<span class="${c}${current===i?" now":""}"></span>`;}).join("")}</div>
    <div class="legend"><span><i style="background:var(--gold)"></i>パーフェクト</span><span><i style="background:var(--orange)"></i>ミスあり</span><span><i style="background:#3a3a40"></i>ひとりも見つけられず</span></div>`;
}
function peopleList(found,missed){
  if(!found.length&&!missed.length)return "";
  return `<ul class="people">${found.map(p=>`<li><span class="pn">${p.name}<small>${p.kanji||""}</small></span><span class="pr">${p.role}</span></li>`).join("")}${missed.map(p=>`<li class="lost"><span class="pn">${p.name}<small>${p.kanji||""}</small></span><span class="pr">見逃し・${p.role}</span></li>`).join("")}</ul>`;
}

function endRound(){
  running=false;hum(false);bgmStop();
  const perfect=roundMissed.length===0&&roundWrong===0&&roundFound.length===totalJp;
  let healed=false;
  if(perfect){score+=CONFIG.PTS_PERFECT;if(lives<CONFIG.LIVES){lives++;healed=true;}}
  filmLog.push({genre:film.genre,title:film.title,found:roundFound.length,total:totalJp,perfect});
  SE.clear(perfect);hud();
  const last=round>=TOTAL_FILMS;
  $("roundSheet").innerHTML=`
    <div class="eyebrow">第${round}作 上映終了</div>
    <div class="filmname">${film.title}</div>
    ${perfect?`<div class="perfect">パーフェクト！ +${CONFIG.PTS_PERFECT}点${healed?"　フィルムが1本戻りました":""}</div>`:""}
    <div class="label">このエンドロールの日本人スタッフ（${roundFound.length} / ${totalJp}人）</div>
    ${peopleList(roundFound,roundMissed)}
    ${reelHTML(round-1)}
    <div class="stats">
      <div class="stat"><div class="v">${score.toLocaleString()}</div><div class="l">得点</div></div>
      <div class="stat"><div class="v">${lives}</div><div class="l">残りフィルム</div></div>
      <div class="stat"><div class="v">${last?"—":jpCount(round+1)}</div><div class="l">次作の日本人</div></div>
    </div>
    <button class="primary" id="btnNext">${last?"エンディングへ":`第${round+1}作を観る（${GENRES[lineup[round]].ja}）`}</button>`;
  $("ovRound").hidden=false;
  $("btnNext").onclick=()=>{$("ovRound").hidden=true;if(last){showResult(true);}else{round++;startRound();}};
}

/* ---------- 結果・評価・シェア ---------- */
function rankOf(done){
  const tot=filmLog.reduce((a,f)=>a+f.total,0),fd=filmLog.reduce((a,f)=>a+f.found,0);
  const ratio=tot?fd/tot:0;
  if(!done)return {l:"—",t:"途中退場",s:`第${filmLog.length}作の上映中に席を立ちました`};
  if(ratio>=CONFIG.RANK.S)return {l:"S",t:"エンドロールの番人",s:"ほぼ全員を見届けました"};
  if(ratio>=CONFIG.RANK.A)return {l:"A",t:"最後まで席を立たない人",s:"ほとんどの日本人スタッフを見つけました"};
  if(ratio>=CONFIG.RANK.B)return {l:"B",t:"名前を探す観客",s:"半分以上を見つけました"};
  return {l:"C",t:"本編派の観客",s:"次はエンドロールにもっと集中してみましょう"};
}
function shareText(done,rk){
  const tot=filmLog.reduce((a,f)=>a+f.total,0),fd=filmLog.reduce((a,f)=>a+f.found,0);
  const grid=Array.from({length:TOTAL_FILMS},(_,i)=>{const f=filmLog[i];return f?(f.perfect?"🟨":f.found===0?"⬛":"🟧"):"⬜";}).join("");
  const top=allFound.slice().sort((a,b)=>b.pts-a.pts)[0];
  let t=`洋画のエンドロールで日本人の名前を探すゲーム『エンドロールの日本人』\n`;
  t+=done?`全${TOTAL_FILMS}本を完走、評価${rk.l}「${rk.t}」\n`:`第${filmLog.length}作で途中退場\n`;
  t+=`${grid}\n見つけた日本人 ${fd}/${tot}人・${score.toLocaleString()}点`;
  if(top)t+=`\nいちばんの早見つけ：${top.film}の${top.roleEn}、${top.name}（${top.kanji.replace(" ","")}）さん`;
  if(SHARE_URL)t+=`\n${SHARE_URL}`;
  return t;
}
function showResult(done){
  running=false;hum(false);bgmStop();
  if(!done)SE.over();else setTimeout(()=>SE.finale(),200);
  if(!done&&filmLog.length<round)filmLog.push({genre:film.genre,title:film.title,found:roundFound.length,total:totalJp,perfect:false});
  const isBest=score>best;if(isBest){best=score;try{localStorage.setItem("er_best",String(best));}catch(e){}}
  const rk=rankOf(done);
  const text=shareText(done,rk);
  const fd=allFound.length;
  $("overSheet").innerHTML=`
    <div class="eyebrow">${done?"THE END":"上映中止"}</div>
    <h1>${done?`全${TOTAL_FILMS}本、<em>完走</em>`:"途中退場"}</h1>
    ${done?`<div class="thanks">最後まで席を立たずに見届けてくれて、ありがとうございました。あなたが見つけた${fd}人の名前は、きっと誰かの誇りです。</div>`:""}
    <div class="rank"><div class="letter">${rk.l}</div><div><div class="rt">${rk.t}</div><div class="rs">${rk.s}</div></div></div>
    ${reelHTML(-1)}
    <div class="stats">
      <div class="stat"><div class="v">${score.toLocaleString()}</div><div class="l">${isBest?"自己ベスト更新":"得点"}</div></div>
      <div class="stat"><div class="v">${filmLog.length}</div><div class="l">観た本数</div></div>
      <div class="stat"><div class="v">${fd}</div><div class="l">見つけた日本人</div></div>
    </div>
    ${isBest?"":`<div class="label">自己ベスト ${best.toLocaleString()} 点</div>`}
    <div class="label">結果をシェア</div>
    <pre class="sharebox" id="shareBox">${text.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>
    <div class="btnrow">
      <a class="xbtn" href="https://x.com/intent/post?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Xに投稿</a>
      <button class="copybtn" id="btnCopy">文章をコピー</button>
    </div>
    ${fd?`<div class="label">あなたが見つけた日本人スタッフ</div>${peopleList(allFound.slice().reverse(),[])}`:`<p>今回は一人も見つけられませんでした。名字の響きに注目してみてください。</p>`}
    <button class="primary" id="btnAgain">もう一度、10本立てを観る</button>
    <button class="sub" id="btnHome">タイトルに戻る</button>`;
  $("ovOver").hidden=false;
  $("btnCopy").onclick=()=>{
    const done2=()=>{$("btnCopy").textContent="コピーしました";setTimeout(()=>{const b=$("btnCopy");if(b)b.textContent="文章をコピー";},1600);};
    const sel=()=>{const r=document.createRange();r.selectNodeContents($("shareBox"));const s=getSelection();s.removeAllRanges();s.addRange(r);$("btnCopy").textContent="選択しました。長押しでコピー";};
    try{navigator.clipboard.writeText(text).then(done2,sel);}catch(e){sel();}
  };
  $("btnAgain").onclick=()=>{$("ovOver").hidden=true;newGame();};
  $("btnHome").onclick=()=>{$("ovOver").hidden=true;$("ovTitle").hidden=false;};
}

function newGame(){round=1;lives=CONFIG.LIVES;score=0;combo=0;allFound=[];filmLog=[];lineup=makeLineup();initAudio();startRound();}
function pause(on){
  if(!running)return;paused=on;$("ovPause").hidden=!on;hum(!on);
  if(on)bgmStop(true);else{bgmStart(film.genre);last=performance.now();}
}
$("btnStart").onclick=()=>{$("ovTitle").hidden=true;newGame();};
$("btnPause").onclick=()=>pause(true);
$("btnResume").onclick=()=>pause(false);
$("btnQuit").onclick=()=>{paused=false;running=false;hum(false);bgmStop();$("ovPause").hidden=true;$("ovTitle").hidden=false;};
$("btnMute").onclick=()=>{initAudio();setMute(!muted);if(!muted)SE.tick();};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running&&!paused)pause(true);});
document.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Escape"){if(running){e.preventDefault();pause(!paused);}}});
setMute(muted);
$("ver").textContent="ver "+CONFIG.VERSION;

/* タイトル裏で見本のエンドロールを流す */
buildFilm(R(GKEYS));hud();$("hudFilm").textContent="10本立て・本日上映";
(function idle(){let yy=stage.clientHeight*.15;const step=()=>{if(!running&&!$("ovTitle").hidden){yy-=.35;if(yy+crawl.offsetHeight<0)yy=stage.clientHeight;crawl.style.transform=`translate3d(0,${yy}px,0)`;}requestAnimationFrame(step);};requestAnimationFrame(step);})();
