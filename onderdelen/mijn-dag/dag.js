// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- state ----------
let curKey = todayKey();
let entry = local.get("day:"+curKey) || emptyEntry(curKey);
let dirty = false, saveTimer = null, saving = Promise.resolve();

function scheduleSave(){
  dirty = true;
  entry.updated = Date.now();
  local.set("day:"+entry.date, entry);
  setStatus(vt("Opslaan…", "Saving…"));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 900);
  updateProgress();
}
function flush(){
  const snap = JSON.parse(JSON.stringify(entry));
  saving = saving.then(async ()=>{
    if(col){
      try{ await col.doc(snap.date).set(snap); }
      catch(e){
        if(e && e.code==="unavailable"){ try{ await new Promise(r=>setTimeout(r,800+Math.random()*700)); await col.doc(snap.date).set(snap); }catch(e2){} }
        else if(e && ["invalid_argument","revoked","not_granted","capability_disabled","capability_removed"].indexOf(e.code)>=0){ col=null; setDoc=null; dbState="off"; }
      }
    }
    dirty = false;
    setStatus(vt("Opgeslagen ✓", "Saved ✓"));
    setTimeout(()=>{ if(!dirty) setStatus(baseStatus()); }, 1500);
  });
  return saving;
}

async function loadDay(k){
  if(dirty){ clearTimeout(saveTimer); await flush(); }
  curKey = k;
  entry = local.get("day:"+k) || emptyEntry(k);
  render();
  if(col){
    try{
      const s = await col.doc(k).get();
      if(curKey!==k || dirty) return;
      if(s.exists){
        const remote = s.data();
        if(!entry.updated || (remote.updated||0) >= entry.updated){
          entry = JSON.parse(JSON.stringify(remote));
          local.set("day:"+k, entry); render();
        } else flush();
      } else if(entry.updated) flush();
    }catch(e){}
  }
}
