// ---------- maandoverzicht ----------
let histMap = {};
let mKey = todayKey().slice(0,7);
const qById = id => QUESTIONS.find(q => q.id === id);
function picked(e, qid, rowIdx){
  const q = qById(qid), a = e.answers && e.answers[qid];
  if(!q || !a || !a.text) return [];
  return rowSelected(a.text, q, q.rows[rowIdx]).map(l => {
    let s = l.replace(/^- /,""); const i = s.indexOf(": "); if(i >= 0) s = s.slice(0, i);
    return s.charAt(0).toLowerCase() + s.slice(1);
  });
}
const hadIt = (e, qid) => { const a = e.answers && e.answers[qid]; return !!a && (a.level === "beetje" || a.level === "ja"); };
function tally(lists){
  const m = {}; lists.forEach(l => Array.from(new Set(l)).forEach(x => { m[x] = (m[x]||0) + 1; }));
  return Object.entries(m).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
}
const nl1 = n => n.toFixed(1).replace(".", ",");
function barList(title, pairs){
  const box = document.createElement("div"); box.className = "bl";
  const l = document.createElement("div"); l.className = "label"; l.style.marginTop = "16px"; l.textContent = title; box.appendChild(l);
  const top = pairs.slice(0, 5), max = top.length ? top[0][1] : 1;
  top.forEach(([item, n]) => {
    const r = document.createElement("div"); r.className = "r";
    const a = document.createElement("span"); a.textContent = cap(item);
    const b = document.createElement("span"); b.style.color = "var(--muted)"; b.textContent = n + (n === 1 ? " dag" : " dagen");
    const t = document.createElement("div"); t.className = "track"; const i = document.createElement("i"); i.style.width = (n/max*100) + "%"; t.appendChild(i);
    r.appendChild(a); r.appendChild(b); r.appendChild(t); box.appendChild(r);
  });
  return box;
}
function tile(big, small){ const d = document.createElement("div"); d.className = "tile"; const b = document.createElement("b"); b.textContent = big; const s = document.createElement("small"); s.textContent = small; d.appendChild(b); d.appendChild(s); return d; }
function note(txt){ const p = document.createElement("div"); p.className = "note"; p.style.fontSize = "15px"; p.textContent = txt; return p; }
function scoreChart(nDays){
  const pts = [];
  for(let d = 1; d <= nDays; d++){ const e = histMap[mKey + "-" + pad(d)]; const s = e ? parseInt(e.cijfer, 10) : 0; if(s > 0 && s <= 10) pts.push([d, s]); }
  if(!pts.length) return null;
  const W = 320, H = 140, L = 24, R = 10, T = 10, B = 22;
  const x = d => (L + (d-1) / Math.max(nDays-1, 1) * (W-L-R)).toFixed(1);
  const y = s => (T + (10-s) / 9 * (H-T-B)).toFixed(1);
  let svg = '<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Dagcijfers van deze maand" style="display:block">';
  [10, 5, 1].forEach(s => {
    svg += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(s)+'" y2="'+y(s)+'" stroke-width="1" style="stroke:var(--line)"/>';
    svg += '<text x="'+(L-7)+'" y="'+(+y(s)+4)+'" text-anchor="end" font-size="11" style="fill:var(--muted)">'+s+'</text>';
  });
  [1, 15, nDays].forEach(d => { svg += '<text x="'+x(d)+'" y="'+(H-5)+'" text-anchor="middle" font-size="11" style="fill:var(--muted)">'+d+'</text>'; });
  if(pts.length > 1) svg += '<polyline fill="none" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--accent)" points="'+pts.map(p => x(p[0])+","+y(p[1])).join(" ")+'"/>';
  pts.forEach(p => { svg += '<circle cx="'+x(p[0])+'" cy="'+y(p[1])+'" r="4" stroke-width="2" style="fill:var(--accent);stroke:var(--card)"/>'; });
  return svg + '</svg>';
}
function meetingPlacesOf(e){
  const a = e.answers && e.answers.q4;
  if(!a || !a.text) return null;
  const line = a.text.split("\n").find(l => /^- een meeting bezocht/i.test(l.trim()));
  if(!line) return null;
  const i = line.indexOf(": ");
  return i < 0 ? [] : line.slice(i + 2).replace(/\.$/, "").split(/,\s*/).map(x => x.trim()).filter(Boolean);
}
function renderMonth(){
  const [y, m] = mKey.split("-").map(Number);
  $("mLabel").textContent = new Date(y, m-1, 1).toLocaleDateString("nl-NL", {month:"long", year:"numeric"});
  $("mNext").disabled = mKey >= todayKey().slice(0,7);
  const cal = $("mCal"); cal.innerHTML = "";
  ["ma","di","wo","do","vr","za","zo"].forEach(w => { const d = document.createElement("div"); d.className = "wd"; d.textContent = w; cal.appendChild(d); });
  const first = (new Date(y, m-1, 1).getDay() + 6) % 7;
  for(let i = 0; i < first; i++) cal.appendChild(document.createElement("div"));
  const nDays = new Date(y, m, 0).getDate(), tk = todayKey();
  const days = [];
  for(let d = 1; d <= nDays; d++){
    const k = mKey + "-" + pad(d), e = histMap[k];
    const has = !!e && !!hasContent(e);
    if(has) days.push(e);
    const c = document.createElement(has ? "button" : "div");
    c.className = "c" + (has ? " has" : "") + (k === tk ? " now" : "") + (k > tk ? " fut" : "");
    const n = document.createElement("span"); n.textContent = d; c.appendChild(n);
    const dots = document.createElement("span"); dots.className = "dots";
    if(has && hadIt(e, "q5")){ const z = document.createElement("i"); z.className = "dot z"; dots.appendChild(z); }
    if(has && hadIt(e, "q6")){ const t = document.createElement("i"); t.className = "dot t"; dots.appendChild(t); }
    c.appendChild(dots);
    if(has){ c.type = "button"; c.onclick = () => openSummary(e, true); }
    cal.appendChild(c);
  }
  const st = $("mStats"); st.innerHTML = "";
  if(!days.length){ st.appendChild(emptyState("calendar", "Deze maand nog niets ingevuld", "Zodra je een dagbeschouwing invult, zie je hier je cijfers, triggers en meetings.")); return; }
  const zDays = days.filter(e => hadIt(e, "q5")), tDays = days.filter(e => hadIt(e, "q6"));
  const scores = days.map(e => parseInt(e.cijfer, 10)).filter(n => n > 0);
  const strengths = zDays.map(e => parseInt(picked(e, "q5", 0)[0], 10)).filter(n => n > 0);
  const tiles = document.createElement("div"); tiles.className = "tiles";
  tiles.appendChild(tile(String(days.length), days.length === 1 ? "dag ingevuld" : "dagen ingevuld"));
  tiles.appendChild(tile(scores.length ? nl1(scores.reduce((a,b)=>a+b,0)/scores.length) : "–", "gemiddeld cijfer"));
  tiles.appendChild(tile(String(zDays.length), zDays.length === 1 ? "dag met zucht" : "dagen met zucht"));
  tiles.appendChild(tile(String(tDays.length), tDays.length === 1 ? "dag met triggers" : "dagen met triggers"));
  st.appendChild(tiles);
  const chart = scoreChart(nDays);
  if(chart){
    const l = el("div", "label", "Mijn dagcijfers"); l.style.marginTop = "16px"; st.appendChild(l);
    const w = el("div"); w.innerHTML = chart; st.appendChild(w);
  }
  if(strengths.length){ const p = note("Gemiddelde sterkte van de zucht: " + nl1(strengths.reduce((a,b)=>a+b,0)/strengths.length) + " uit 10 (hoogste: " + Math.max(...strengths) + ")."); p.style.marginTop = "12px"; st.appendChild(p); }
  const mDays = days.map(meetingPlacesOf).filter(x => x !== null);
  const ml = el("div", "label", "Meetings"); ml.style.marginTop = "18px"; st.appendChild(ml);
  const mt = el("div", "tile"); mt.appendChild(el("b", null, String(mDays.length)));
  mt.appendChild(el("small", null, (mDays.length === 1 ? "dag" : "dagen") + " naar een meeting deze maand"));
  st.appendChild(mt);
  const mp = tally(mDays);
  if(mp.length){ const bl = barList("Waar was ik?", mp); bl.querySelector(".label").style.marginTop = "12px"; st.appendChild(bl); }
  if(!zDays.length && !tDays.length){ const p = note("Deze maand geen zucht en geen triggers ingevuld."); p.style.marginTop = "12px"; st.appendChild(p); return; }
  const both = days.filter(e => hadIt(e, "q5") || hadIt(e, "q6"));
  [
    ["Mijn triggers", tally(tDays.map(e => picked(e, "q6", 0)))],
    ["Wanneer kwam de zucht?", tally(zDays.map(e => picked(e, "q5", 1)))],
    ["Hoe voelde ik me bij triggers?", tally(tDays.map(e => picked(e, "q6", 1)))],
    ["Wat heb ik gedaan bij zucht of triggers?", tally(both.map(e => (hadIt(e, "q5") ? picked(e, "q5", 2) : []).concat(hadIt(e, "q6") ? picked(e, "q6", 2) : [])))]
  ].forEach(([t, p]) => { if(p.length) st.appendChild(barList(t, p)); });
}
$("mPrev").onclick = () => { const [y, m] = mKey.split("-").map(Number); const d = new Date(y, m-2, 1); mKey = d.getFullYear() + "-" + pad(d.getMonth()+1); renderMonth(); };
$("mNext").onclick = () => { const [y, m] = mKey.split("-").map(Number); const d = new Date(y, m, 1); const k = d.getFullYear() + "-" + pad(d.getMonth()+1); if(k <= todayKey().slice(0,7)){ mKey = k; renderMonth(); } };
