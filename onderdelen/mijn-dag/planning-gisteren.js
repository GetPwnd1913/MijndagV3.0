// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- planning van gisteren ----------
const PLAN_Q = QUESTIONS.find(q => q.id === "q11");
function planFrom(e){
  const a = e && e.answers && e.answers.q11, txt = a ? (a.text || "") : "";
  if(!txt.trim()) return [];
  // title = Nederlandse sleutel (ook voor entry.planDone), toon = wat je ziet in de gekozen taal
  const groups = []; let cur = null;
  const other = () => { let g = groups.find(x => x.title === "Overig"); if(!g){ g = {title:"Overig", toon: vt("Overig", "Other"), items:[]}; groups.push(g); } return g; };
  txt.split("\n").forEach(raw => {
    const l = raw.trim(); if(!l) return;
    const hi = PLAN_Q.rows.findIndex(r => headersOf(r).indexOf(l) >= 0);
    if(hi >= 0){ cur = {title: PLAN_Q.rows[hi].label, toon: rowLabel(PLAN_Q.rows[hi]), items: []}; groups.push(cur); return; }
    const isBullet = /^[-•]\s/.test(l);
    if(!cur || !isBullet) cur = other();
    cur.items.push(l.replace(/^[-•]\s*/, ""));
  });
  return groups.filter(g => g.items.length);
}
let planReq = 0, planOpen = false;   // op Vandaag ingeklapt: alleen de kop met "0 van 4 gedaan"
async function renderPlan(){
  const card = $("planCard"), k = curKey, req = ++planReq, pk = addDaysKey(k, -1);
  const draw = p => {
    const groups = planFrom(p);
    card.classList.toggle("hidden", !groups.length);
    card.innerHTML = "";
    if(!groups.length) return;
    const keys = [];
    const head = el("button", "plankop"); head.type = "button"; head.setAttribute("aria-expanded", planOpen ? "true" : "false");
    const lijst = el("div"); lijst.classList.toggle("hidden", !planOpen);
    head.onclick = () => { planOpen = !planOpen; head.setAttribute("aria-expanded", planOpen ? "true" : "false"); lijst.classList.toggle("hidden", !planOpen); upd(); };
    head.appendChild(el("div", "qtitle", k === todayKey() ? vt("Mijn planning voor vandaag", "My plan for today") : vt("Planning voor deze dag", "Plan for this day")));
    const cnt = el("div", "note"); cnt.style.cssText = "margin:0;flex:none"; head.appendChild(cnt);
    card.appendChild(head); card.appendChild(lijst);
    const sub = note(vt("Gemaakt bij je dagbeschouwing van ", "Made in your daily reflection of ") + shortDate(pk) + vt(". Vink af wat je gedaan hebt.", ". Tick off what you have done.")); sub.style.cssText = "margin-top:2px;font-size:14px"; lijst.appendChild(sub);
    const upd = () => { const d = entry.planDone || {}; cnt.textContent = keys.filter(x => d[x]).length + vt(" van ", " of ") + keys.length + vt(" gedaan", " done") + (planOpen ? " ▾" : " ›"); };
    groups.forEach(g => {
      lijst.appendChild(el("div", "label", g.toon));
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
        lijst.appendChild(row);
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
