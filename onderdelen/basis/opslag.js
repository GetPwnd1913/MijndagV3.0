// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- storage ----------
const LS = "dagbeschouwing:";
const local = {
  get(k){ try{ const v = localStorage.getItem(LS+k); return v ? JSON.parse(v) : null; }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(LS+k, JSON.stringify(v)); }catch(err){} },
  days(){ const out=[]; try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.indexOf(LS+"day:")===0){ try{ out.push(JSON.parse(localStorage.getItem(k))); }catch(e){} } } }catch(e){} return out; }
};
let col = null, setDoc = null;
let dbState = "pending";
let settings = local.get("settings") || {naam:"", since:"", mail:"", updated:0};

function setStatus(txt){ $("status").textContent = txt; }
function baseStatus(){
  if(dbState==="on") return vt("Bewaard in je account · alleen jij ziet dit", "Saved in your account · only you can see this");
  if(dbState==="off") return vt("Bewaard op dit toestel", "Saved on this device");
  return vt("Verbinden…", "Connecting…");
}

async function initDb(){
  try{
    if(!window.claude || !window.claude.use){ dbState="off"; return; }
    const timeout = new Promise(r=>setTimeout(()=>r(null),10000));
    const db = await Promise.race([window.claude.use("db"), timeout]);
    const user = db ? await Promise.race([window.claude.use("user"), timeout]) : null;
    const id = user ? await user.id() : null;
    if(db && id){
      const root = db.doc("data/users/"+id+"/dagbeschouwing");
      col = root.collection("dagen");
      setDoc = db.doc("data/users/"+id+"/instellingen");
      dbState="on";
    } else dbState="off";
  }catch(e){ dbState="off"; col=null; setDoc=null; }
}

async function syncSettings(){
  if(!setDoc) return;
  try{
    const s = await setDoc.get();
    if(s.exists){
      const r = s.data();
      if((r.updated||0) >= (settings.updated||0)){ settings = Object.assign({}, r); local.set("settings", settings); renderInfo(); }
      else await setDoc.set(Object.assign({}, settings));
    } else if(settings.updated){ await setDoc.set(Object.assign({}, settings)); }
  }catch(e){}
}

// ---------- alles wissen ----------
// Wist alle gegevens van de app: alle localStorage-keys die met "dagbeschouwing:" beginnen (dagen, instellingen
// met taal en thema, back-updatum, Alleen voor vandaag, ...) en op claude.ai ook je eigen opslag (dagen + instellingen).
// De caches van de service worker blijven staan: dat zijn alleen de app-bestanden, geen gegevens.
async function wisAlleGegevens(){
  let gelukt = true;
  try{ if(typeof saveTimer !== "undefined") clearTimeout(saveTimer); if(typeof saving !== "undefined") await saving; }catch(e){}
  if(typeof dirty !== "undefined") dirty = false;
  if(col){
    try{ const snap = await col.get(); for(const d of snap.docs){ try{ await col.doc(d.id).delete(); }catch(e){ gelukt = false; } } }
    catch(e){ gelukt = false; }
  }
  if(setDoc){ try{ await setDoc.delete(); }catch(e){ gelukt = false; } }
  try{
    const weg = [];
    for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); if(k && k.indexOf(LS) === 0) weg.push(k); }
    weg.forEach(k => localStorage.removeItem(k));
  }catch(e){ gelukt = false; }
  return gelukt;
}
