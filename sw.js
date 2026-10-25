// Offline-Cache. Bei jedem Update CACHE-Version hochzählen.
const CACHE='schrank-v6';
const SHELL=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const store=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;};
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Eigene Dateien: erst Netz (Updates kommen sofort an), offline aus dem Cache
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(res=>store(req,res)).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
    return;
  }
  // Schriften: aus dem Cache, sonst laden und merken
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>store(req,res))));
  }
  // Wetter (Open-Meteo) geht immer direkt ans Netz
});
