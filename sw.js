// オフライン用の仕組み。版は js/config.js の CONFIG.VERSION を読むので、ここは触らなくてよい
importScripts("js/config.js");
const CACHE="endroll-"+CONFIG.VERSION;
const SHELL=["./","index.html","css/style.css","js/config.js","js/data.js","js/audio.js","js/game.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  // フォントは一度読んだら保存してオフラインでも使う
  if(url.host==="fonts.googleapis.com"||url.host==="fonts.gstatic.com"){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{c.put(req,res.clone());return res;}))));return;
  }
  if(url.origin!==location.origin)return;
  // 本体はネット優先（更新がすぐ届く）、つながらなければ保存した版
  e.respondWith(fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;}).catch(()=>caches.match(req).then(r=>r||caches.match("index.html"))));
});
