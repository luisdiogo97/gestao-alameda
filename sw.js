/* Service worker simples: a gestão abre mesmo sem rede (usa a última versão guardada). */
const C="alameda-v1";
self.addEventListener("install",e=>{self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html","./firebase-config.js","./shim.js","./manifest.json"]).catch(()=>{})));});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url); if(e.request.method!=="GET"||u.origin!==location.origin) return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone(); caches.open(C).then(c=>c.put(e.request,cp)); return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));});
