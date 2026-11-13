/* Gestão Alameda — ligação ao Firebase (substitui o armazenamento do Claude) */
(function(){
"use strict";
var PAP_GEST=["Administrador","Enóloga e gestora"];
function cfg(){ if(window.ALAMEDA_FIREBASE&&window.ALAMEDA_FIREBASE.apiKey) return window.ALAMEDA_FIREBASE;
  try{var c=JSON.parse(localStorage.getItem("alameda-fb-config")||"null"); if(c&&c.apiKey) return c;}catch(e){} return null;}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
var css=document.createElement("style");
css.textContent="#fb_gate{position:fixed;inset:0;z-index:9999;background:var(--bg,#f5f4f2);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:48px 16px}"+
"#fb_gate[hidden]{display:none}#fb_gate .box{background:var(--surface,#fff);border:1px solid var(--line,#e3dfe0);border-radius:14px;max-width:420px;width:100%;padding:28px 24px;font-family:Figtree,system-ui,sans-serif;color:var(--ink,#1e1b1d)}"+
"#fb_gate h1{font-family:Newsreader,Georgia,serif;font-size:26px;margin:0 0 6px}#fb_gate p{margin:8px 0;color:var(--muted,#6b6468);font-size:14px;line-height:1.45}"+
"#fb_gate input,#fb_gate textarea{width:100%;box-sizing:border-box;margin:6px 0;padding:10px 12px;border:1px solid var(--line,#e3dfe0);border-radius:8px;font:inherit;background:var(--surface,#fff);color:inherit}"+
"#fb_gate button{width:100%;margin:6px 0;padding:11px 12px;border-radius:8px;border:1px solid var(--line,#e3dfe0);background:var(--surface,#fff);font:inherit;font-weight:600;cursor:pointer;color:inherit}"+
"#fb_gate button.pri{background:var(--wine,#7a1f3d);border-color:var(--wine,#7a1f3d);color:#fff}#fb_gate .err{color:#b3261e;font-size:13px;min-height:1em}#fb_gate .sep{text-align:center;color:var(--muted,#6b6468);font-size:12px;margin:10px 0}"+
"#fb_gate img.lg{height:64px;display:block;margin:0 0 14px}#fb_gate code{font-size:12px;word-break:break-all}"+
"#fb_bar{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;font:13px Figtree,system-ui,sans-serif;color:var(--muted,#6b6468);padding:28px 16px 8px;margin-top:20px;border-top:1px solid var(--line,#e3dfe0);max-width:1400px;margin:0 auto}#fb_bar button{font:inherit;border:1px solid var(--line,#e3dfe0);background:var(--surface,#fff);border-radius:999px;padding:4px 12px;cursor:pointer;color:inherit}"+
"#fb_off{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);background:#3e5b4a;color:#fff;padding:8px 14px;border-radius:999px;font:13px Figtree,system-ui,sans-serif;z-index:9998}";
document.head.appendChild(css);
var gateEl=null;
function gate(html){ if(!gateEl){gateEl=document.createElement("div"); gateEl.id="fb_gate"; (document.body||document.documentElement).appendChild(gateEl);}
  var logo=document.querySelector("img.logo"); gateEl.innerHTML='<div class="box">'+(logo?'<img class="lg" alt="Quinta da Alameda" src="'+logo.getAttribute("src")+'">':"")+html+'</div>'; gateEl.hidden=false; return gateEl;}
function onReady(fn){ if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn); else fn(); }
var C=cfg();
if(!C){
  window.claude={use:function(){return new Promise(function(){});}};
  onReady(function(){ var g=gate('<h1>Configurar a ligação</h1><p>Esta cópia ainda não sabe a que projeto Firebase se ligar. Cola aqui o bloco <code>firebaseConfig</code> que o Firebase mostra (Definições do projeto → As tuas apps → Web).</p><textarea id="fb_cfg" rows="9" placeholder="apiKey: &quot;…&quot;, authDomain: &quot;…&quot;, projectId: &quot;…&quot; …"></textarea><div class="err" id="fb_err"></div><button class="pri" id="fb_cfgok">Guardar neste aparelho</button><p>Para ficar igual para todos, envia este bloco ao Claude, que o põe no ficheiro <code>firebase-config.js</code>.</p>');
    g.querySelector("#fb_cfgok").onclick=function(){ var t=g.querySelector("#fb_cfg").value, o={};
      t.replace(/(apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId|measurementId)\s*["']?\s*:\s*["']([^"']+)["']/g,function(_,k,v){o[k]=v;});
      if(!o.apiKey||!o.projectId){g.querySelector("#fb_err").textContent="Não encontrei apiKey e projectId no texto."; return;}
      try{localStorage.setItem("alameda-fb-config",JSON.stringify(o));}catch(e){} location.reload(); };});
  return;
}
firebase.initializeApp(C);
var auth=firebase.auth(), fs=firebase.firestore();
if(C.emulator){ auth.useEmulator("http://127.0.0.1:9099"); }
try{fs.settings({ignoreUndefinedProperties:true,merge:true});}catch(e){}
if(C.emulator){ try{fs.useEmulator("127.0.0.1",8080);}catch(e){} }
if(!C.emulator){ try{fs.enablePersistence({synchronizeTabs:true}).catch(function(){});}catch(e){} }
var resolveCtx; var ctxP=new Promise(function(r){resolveCtx=r;});
window.claude={use:function(k){return ctxP.then(function(ctx){ if(k==="db") return fs; if(k==="user") return ctx.user; return null; });}};
window.ALAMEDA_FB={auth:auth,db:fs};

function loginScreen(msg){
  var g=gate('<h1>Gestão da quinta</h1><p>Entra com a tua conta para ver e registar.</p><div class="err" id="fb_err">'+esc(msg||"")+'</div>'+
   '<button class="pri" id="fb_g">Entrar com Google</button><div class="sep">ou com email</div>'+
   '<input type="email" id="fb_em" placeholder="Email" autocomplete="username"><input type="password" id="fb_pw" placeholder="Palavra-passe" autocomplete="current-password">'+
   '<button id="fb_in">Entrar</button><button id="fb_new">Criar conta com este email</button><button id="fb_rst" style="border:0;font-weight:400;text-decoration:underline">Esqueci-me da palavra-passe</button>');
  var E=function(t){g.querySelector("#fb_err").textContent=t;}, em=function(){return g.querySelector("#fb_em").value.trim();}, pw=function(){return g.querySelector("#fb_pw").value;};
  var tr=function(e){var c=(e&&e.code)||""; return /wrong-password|invalid-credential|invalid-login/.test(c)?"Email ou palavra-passe errados.":/user-not-found/.test(c)?"Não há conta com este email. Usa \"Criar conta\".":/email-already/.test(c)?"Já existe conta com este email. Usa \"Entrar\".":/weak-password/.test(c)?"A palavra-passe tem de ter pelo menos 6 caracteres.":/invalid-email/.test(c)?"O email não é válido.":/popup-closed|cancelled-popup/.test(c)?"":/unauthorized-domain/.test(c)?"Este endereço ainda não está autorizado no Firebase (Authentication → Definições → Domínios autorizados).":/operation-not-allowed/.test(c)?"Este tipo de entrada não está ligado no Firebase (Authentication → Método de início de sessão).":"Não foi possível entrar ("+c+").";};
  g.querySelector("#fb_g").onclick=function(){ var p=new firebase.auth.GoogleAuthProvider(); auth.signInWithPopup(p).catch(function(e){ if(/popup-blocked|operation-not-supported/.test(e.code||"")) auth.signInWithRedirect(p); else E(tr(e)); }); };
  g.querySelector("#fb_in").onclick=function(){ auth.signInWithEmailAndPassword(em(),pw()).catch(function(e){E(tr(e));}); };
  g.querySelector("#fb_new").onclick=function(){ auth.createUserWithEmailAndPassword(em(),pw()).catch(function(e){E(tr(e));}); };
  g.querySelector("#fb_rst").onclick=function(){ if(!em()){E("Escreve primeiro o email."); return;} auth.sendPasswordResetEmail(em()).then(function(){E("Enviámos um email para mudares a palavra-passe.");}).catch(function(e){E(tr(e));}); };
}
function bar(u,papel){ if(document.getElementById("fb_bar")) return; var b=document.createElement("div"); b.id="fb_bar";
  b.innerHTML='<span>'+esc(u.displayName||u.email||"")+(papel?" · "+esc(papel):"")+'</span><button type="button" id="fb_out">Sair</button>';
  var w=document.querySelector(".wrap"); if(w&&w.parentNode){ w.parentNode.insertBefore(b,w.nextSibling); } else document.body.appendChild(b);
  b.querySelector("#fb_out").onclick=function(){auth.signOut().then(function(){location.reload();});};}
function online(){ var o=document.getElementById("fb_off"); if(navigator.onLine){ if(o) o.remove(); } else if(!o){ o=document.createElement("div"); o.id="fb_off"; o.textContent="Sem rede: o que registares fica guardado e é enviado quando a rede voltar."; document.body.appendChild(o);} }
window.addEventListener("online",online); window.addEventListener("offline",online);

var started=false;
auth.onAuthStateChanged(function(u){ onReady(function(){ go(u); }); });
function go(u){
  if(!u){ if(started){location.reload(); return;} loginScreen(); return; }
  if(started) return;
  gate('<h1>Gestão da quinta</h1><p>A verificar o acesso…</p>');
  fs.collection("perfis").doc(u.uid).set({nome:u.displayName||u.email||"",email:u.email||"",ultimoAcesso:new Date().toISOString()},{merge:true}).catch(function(){});
  fs.doc("config/utilizadores").get().then(function(d){
    var US=d.exists?d.data():null;
    if(!US||!US.membros||!Object.keys(US.membros).length){ return primeiro(u); }
    var m=US.membros[u.uid];
    if(!m||!m.papel){ return semAcesso(u); }
    return fs.doc("config/dono").get().then(function(x){return x.exists?x.data().uid:null;},function(){return null;}).then(function(dono){ entrar(u,m.papel,dono); });
  }).catch(function(e){ gate('<h1>Gestão da quinta</h1><div class="err">Não foi possível ler as permissões ('+esc(e.code||e.message)+'). Confirma que as regras do Firestore foram publicadas.</div><button id="fb_out2">Sair</button>').querySelector("#fb_out2").onclick=function(){auth.signOut();}; });
}
function primeiro(u){
  var g=gate('<h1>Primeira configuração</h1><p>Ainda ninguém é administrador desta gestão. Se és o Luis, carrega no botão: ficas administrador e dono. Depois podes dar acesso às outras pessoas em Gestão → Utilizadores.</p><p>Conta: <b>'+esc(u.email||u.displayName||"")+'</b></p><div class="err" id="fb_err"></div><button class="pri" id="fb_boot">Tornar-me administrador</button><button id="fb_out2">Sair</button>');
  g.querySelector("#fb_out2").onclick=function(){auth.signOut();};
  g.querySelector("#fb_boot").onclick=function(){ var b=fs.batch(), M={}; M[u.uid]={papel:"Administrador"};
    b.set(fs.doc("config/utilizadores"),{membros:M}); b.set(fs.doc("config/dono"),{uid:u.uid,email:u.email||"",desde:new Date().toISOString()});
    b.commit().then(function(){location.reload();}).catch(function(e){g.querySelector("#fb_err").textContent="Não foi possível ("+(e.code||e.message)+"). Talvez outra pessoa já seja administrador.";}); };
}
function semAcesso(u){
  var g=gate('<h1>Ainda sem acesso</h1><p>Entraste como <b>'+esc(u.email||u.displayName||"")+'</b>, mas ainda não tens um papel na gestão.</p><p>Pede ao Luis para te dar acesso em Gestão → Utilizadores. Esta página abre sozinha quando o acesso for dado.</p><button id="fb_out2">Sair e entrar com outra conta</button>');
  g.querySelector("#fb_out2").onclick=function(){auth.signOut();};
  var un=fs.doc("config/utilizadores").onSnapshot(function(d){ var m=d.exists&&d.data().membros&&d.data().membros[u.uid]; if(m&&m.papel){un(); location.reload();} },function(){});
}
function entrar(u,papel,dono){
  started=true; if(gateEl) gateEl.hidden=true; bar(u,papel); online();
  var user={
    id:function(){return Promise.resolve(u.uid);},
    isOwner:function(){return Promise.resolve(!!dono&&dono===u.uid);},
    canEdit:function(){return Promise.resolve(PAP_GEST.indexOf(papel)>=0);},
    can:function(){return Promise.resolve(true);},
    profiles:function(ids){ return Promise.all(ids.map(function(i){return fs.collection("perfis").doc(i).get().then(function(d){return [i,d.exists?{name:d.data().nome||d.data().email||""}:null];},function(){return [i,null];});})).then(function(a){var o={}; a.forEach(function(x){if(x[1]) o[x[0]]=x[1];}); return o;}); },
    search:function(q){ q=String(q||"").toLowerCase(); return fs.collection("perfis").get().then(function(s){ return s.docs.map(function(d){var x=d.data(); return {id:d.id,name:x.nome||x.email||"",email:x.email||""};}).filter(function(h){return !q||(h.name+" "+h.email).toLowerCase().indexOf(q)>=0;}).slice(0,30); },function(){return [];}); }
  };
  resolveCtx({user:user});
}
})();
