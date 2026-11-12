// ---------- planning van gisteren ----------
const PLAN_Q = QUESTIONS.find(q => q.id === "q11");
function planFrom(e){
  const a = e && e.answers && e.answers.q11, txt = a ? (a.text || "") : "";
  if(!txt.trim()) return [];
  const heads = PLAN_Q.rows.map(r => headerOf(r));
  const groups = []; let cur = null;
  const other = () => { let g = groups.find(x => x.title === "Overig"); if(!g){ g = {title:"Overig", items:[]}; groups.push(g); } return g; };
  txt.split("\n").forEach(raw => {
    const l = raw.trim(); if(!l) return;
    const hi = heads.indexOf(l);
    if(hi >= 0){ cur = {title: PLAN_Q.rows[hi].label, items: []}; groups.push(cur); return; }
    const isBullet = /^[-•]\s/.test(l);
    if(!cur || !isBullet) cur = other();
    cur.items.push(l.replace(/^[-•]\s*/, ""));
  });
  return groups.filter(g => g.items.length);
}
let planReq = 0;
async function renderPlan(){
  const card = $("planCard"), k = curKey, req = ++planReq, pk = addDaysKey(k, -1);
  const draw = p => {
    const groups = planFrom(p);
    card.classList.toggle("hidden", !groups.length);
    card.innerHTML = "";
    if(!groups.length) return;
    const keys = [];
    const head = el("div"); head.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;gap:8px";
    head.appendChild(el("div", "qtitle", k === todayKey() ? "Mijn planning voor vandaag" : "Planning voor deze dag"));
    const cnt = el("div", "note"); cnt.style.cssText = "margin:0;flex:none"; head.appendChild(cnt);
    card.appendChild(head);
    const sub = note("Gemaakt bij je dagbeschouwing van " + shortDate(pk) + ". Vink af wat je gedaan hebt."); sub.style.cssText = "margin-top:2px;font-size:14px"; card.appendChild(sub);
    const upd = () => { const d = entry.planDone || {}; cnt.textContent = keys.filter(x => d[x]).length + " van " + keys.length + " gedaan"; };
    groups.forEach(g => {
      card.appendChild(el("div", "label", g.title));
      g.items.forEach(it => {
        const key = g.title + "|" + it; keys.push(key);
        const row = el("label", "planitem");
        const cb = el("input"); cb.type = "checkbox"; cb.checked = !!(entry.planDone && entry.planDone[key]);
        row.classList.toggle("done", cb.checked);
        cb.onchange = () => {
          entry.planDone = Object.assign({}, entry.planDone || {});
          if(cb.checked) entry.planDone[key] = true; else delete entry.planDone[key];
          row.classList.toggle("done", cb.checked);
          scheduleSave(); upd();
        };
        row.appendChild(cb); row.appendChild(el("span", null, it));
        card.appendChild(row);
      });
    });
    upd();
  };
  let prev = local.get("day:" + pk);
  draw(prev);
  if(col){
    try{
      const s = await col.doc(pk).get();
      if(req !== planReq || !s.exists) return;
      const r = s.data();
      if(!prev || (r.updated || 0) > (prev.updated || 0)){ local.set("day:" + pk, r); draw(r); }
    }catch(e){}
  }
}
