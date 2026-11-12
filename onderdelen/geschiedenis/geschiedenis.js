// ---------- history ----------
async function allDays(){
  if(dirty){ clearTimeout(saveTimer); await flush(); }
  const map = {};
  local.days().forEach(e=>{ if(e && e.date) map[e.date]=e; });
  if(col){
    try{
      const snap = await col.orderBy("date","desc").limit(1000).get();
      snap.docs.forEach(d=>{ const e=d.data(); if(e && e.date && (!map[e.date] || (e.updated||0)>=(map[e.date].updated||0))) map[e.date]=e; });
    }catch(e){}
  }
  return map;
}
const hasContent = e => e.cijfer || Object.values(e.answers||{}).some(a=>a.level||(a.text||"").trim());

async function renderHistory(){
  const v = $("viewHist");
  v.innerHTML = '<div class="empty">' + vt("Laden…", "Loading…") + '</div>';
  const map = {};
  local.days().forEach(e=>{ if(e && e.date) map[e.date]=e; });
  if(col){
    try{
      const snap = await col.orderBy("date","desc").limit(500).get();
      snap.docs.forEach(d=>{ const e=d.data(); if(e && e.date && (!map[e.date] || (e.updated||0)>=(map[e.date].updated||0))) map[e.date]=e; });
    }catch(e){}
  }
  histMap = map; renderMonth();
  const list = Object.values(map).filter(e=>e.cijfer || Object.values(e.answers||{}).some(a=>a.level||(a.text||"").trim()))
    .sort((a,b)=>a.date<b.date?1:-1);
  v.innerHTML = "";
  if(!list.length){ v.innerHTML = ""; v.appendChild(emptyState("book", vt("Nog geen eerdere dagen", "No earlier days yet"), vt("Na je eerste dagbeschouwing verschijnt die hier. Je kunt elke dag terugkijken en opnieuw versturen.", "After your first daily reflection it will appear here. You can look back at every day and send it again."))); return; }
  list.forEach(e=>{
    const c=document.createElement("div"); c.className="card item";
    const first = ((e.answers&&e.answers.q1&&e.answers.q1.text)||"").trim();
    c.innerHTML='<div class="emo"></div><div style="flex:1;min-width:0"><div class="t"></div><div class="s"></div></div><div style="color:var(--muted);display:flex"><svg class="i" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></div>';
    c.querySelector(".emo").textContent = e.cijfer || "–";
    c.querySelector(".t").textContent = niceDate(e.date);
    c.querySelector(".s").textContent = first.replace(/\n+/g," ") || vt("Bekijk dagbeschouwing", "View daily reflection");
    c.onclick = () => openSummary(e, true);
    v.appendChild(c);
  });
}
