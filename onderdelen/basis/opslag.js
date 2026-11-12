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
  if(dbState==="on") return "Bewaard in je account · alleen jij ziet dit";
  if(dbState==="off") return "Bewaard op dit toestel";
  return "Verbinden…";
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
