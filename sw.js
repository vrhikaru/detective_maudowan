/* 毛豆丸偵探社：離線快取
   - 網站外框（首頁、遊玩頁、圖示）：先用快取，背景更新
   - chapters.json：先連網拿最新的案件清單，沒網路時用快取
   - 遊戲與圖片：第一次打開後存起來，之後沒網路也能玩 */
const VERSION='mdw-muxphx3r';
const SHELL=['./','index.html','play.html','privacy.html','install.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url); if(url.origin!==location.origin) return;
  if(url.pathname.endsWith('/chapters.json')){
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(VERSION).then(c=>c.put(req,cp)); return r; }).catch(()=>caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:url.pathname.endsWith('play.html')}).then(hit=>{
    const net=fetch(req).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(VERSION).then(c=>c.put(req,cp)); } return r; }).catch(()=>hit);
    return hit||net;
  }));
});
