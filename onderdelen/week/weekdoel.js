// ---------- weekdoel ----------
let goalWeek = null, goalTimer = null;
const mondayOf = k => addDaysKey(k, -((parseKey(k).getDay() + 6) % 7));
function isoWeek(k){
  const d = parseKey(k), t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const y1 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t - y1) / 864e5 - 3 + ((y1.getDay() + 6) % 7)) / 7);
}
function weekData(wk){ const w = (settings.weeks || {})[wk]; return w && w.goals ? w : {goals: []}; }
function setWeek(wk, data){
  settings.weeks = Object.assign({}, settings.weeks || {});
  if(data.goals.length) settings.weeks[wk] = data; else delete settings.weeks[wk];
}
function updateGoal(wk, id, patch){
  const d = JSON.parse(JSON.stringify(weekData(wk)));
  const g = d.goals.find(x => x.id === id); if(!g) return;
  Object.assign(g, patch); setWeek(wk, d);
}
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function goalCard(wk, g){
  const c = el("div", "card" + (g.done ? " done" : ""));
  const head = el("div"); head.style.cssText = "display:flex;gap:10px;align-items:flex-start";
  const lab = el("label", "goalcheck" + (g.done ? " done" : ""));
  const cb = el("input"); cb.type = "checkbox"; cb.checked = !!g.done;
  cb.onchange = () => { updateGoal(wk, g.id, {done: cb.checked ? todayKey() : ""}); renderGoals(); renderGoalsMini(); saveSettingsNow(); };
  lab.appendChild(cb); lab.appendChild(el("span", "qtitle", g.text));
  head.appendChild(lab);
  const del = el("button", "xbtn"); del.appendChild(icon("x", 18)); del.type = "button"; del.setAttribute("aria-label", vt("Weekdoel wissen", "Delete weekly goal"));
  del.onclick = async () => {
    if(!(await confirmDialog(vt("Weekdoel wissen?", "Delete weekly goal?"), "\u201c" + g.text + "\u201d" + vt(" wordt gewist, met wat je erbij hebt geschreven.", " will be deleted, along with what you wrote about it."), vt("Wissen", "Delete")))) return;
    const d = JSON.parse(JSON.stringify(weekData(wk))); d.goals = d.goals.filter(x => x.id !== g.id); setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow();
  };
  head.appendChild(del); c.appendChild(head);
  const st = note(g.done ? vt("✓ Behaald op ", "✓ Achieved on ") + dayMonth(g.done) : vt("Nog bezig", "In progress"));
  st.style.cssText = "margin:4px 0 0 34px;font-size:14px" + (g.done ? ";color:var(--accent);font-weight:600" : "");
  c.appendChild(st);
  const l = el("div", "label", vt("Loop je ergens tegenaan?", "Are you stuck on something?")); l.style.marginTop = "14px"; c.appendChild(l);
  const ta = el("textarea"); ta.style.marginTop = "0"; ta.value = g.stuck || "";
  ta.placeholder = vt("Schrijf hier waar je vastloopt. Dan kun je het bespreken in je 1-op-1.", "Write here where you get stuck. Then you can discuss it in your 1-to-1.");
  ta.oninput = () => {
    updateGoal(wk, g.id, {stuck: ta.value});
    settings.updated = Date.now(); local.set("settings", settings);
    clearTimeout(goalTimer); goalTimer = setTimeout(saveSettingsNow, 900);
  };
  c.appendChild(ta);
  return c;
}
const REFLECT_OPTS = [["goed","Goed gelukt","Went well"],["deels","Deels gelukt","Partly"],["niet","Niet gelukt","Didn't work"]];
let reflectTimer = null;
function setReflect(wk, patch){
  const d = JSON.parse(JSON.stringify(weekData(wk)));
  d.reflect = Object.assign({how: "", text: ""}, d.reflect || {}, patch);
  setWeek(wk, d);
}
function reflectCard(wk, isNow){
  const r = weekData(wk).reflect || {how: "", text: ""};
  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", vt("Hoe ging mijn weekdoel?", "How did my weekly goal go?")));
  const n = note(isNow ? vt("Kijk aan het eind van de week, bijvoorbeeld op zondag, kort terug.", "Look back briefly at the end of the week, for example on Sunday.") : vt("Je terugblik op deze week.", "Your review of this week.")); n.style.marginTop = "2px"; c.appendChild(n);
  const sc = el("div", "scale");
  REFLECT_OPTS.forEach(([v, l, len]) => {
    const b = el("button", null, vt(l, len)); b.type = "button";
    if(r.how === v) b.classList.add("on");
    if(v === "niet") b.classList.add("warn");
    b.onclick = async () => { const cur = (weekData(wk).reflect || {}).how; setReflect(wk, {how: cur === v ? "" : v}); renderGoals(); await saveSettingsNow(); };
    sc.appendChild(b);
  });
  c.appendChild(sc);
  const ta = el("textarea"); ta.value = r.text || "";
  ta.placeholder = vt("Wat hielp je, of waar liep je tegenaan? Wat neem je mee naar volgende week?", "What helped you, or what got in the way? What will you take into next week?");
  ta.oninput = () => {
    setReflect(wk, {text: ta.value});
    settings.updated = Date.now(); local.set("settings", settings);
    clearTimeout(reflectTimer); reflectTimer = setTimeout(saveSettingsNow, 900);
  };
  c.appendChild(ta);
  return c;
}
function renderGoals(){
  const tk = todayKey(), thisWeek = mondayOf(tk);
  if(!goalWeek) goalWeek = thisWeek;
  const wk = goalWeek, data = weekData(wk);
  const box = $("goalsBox"); box.innerHTML = "";
  const nav = el("div", "datebar"); nav.style.margin = "0 2px 12px";
  const pv = el("button", "iconbtn"); pv.appendChild(icon("chevL")); pv.type = "button"; pv.setAttribute("aria-label", vt("Vorige week", "Previous week"));
  pv.onclick = () => { goalWeek = addDaysKey(wk, -7); renderGoals(); };
  const nx = el("button", "iconbtn"); nx.appendChild(icon("chevR")); nx.type = "button"; nx.setAttribute("aria-label", vt("Volgende week", "Next week")); nx.disabled = wk >= thisWeek;
  nx.onclick = () => { if(wk < thisWeek){ goalWeek = addDaysKey(wk, 7); renderGoals(); } };
  const lab = el("div", "d", (wk === thisWeek ? vt("Deze week · ", "This week · ") : "") + "week " + isoWeek(wk));
  const sub = el("div", null, dayMonth(wk) + " – " + dayMonth(addDaysKey(wk, 6))); sub.style.cssText = "font-size:13px;color:var(--muted);font-weight:400";
  lab.appendChild(sub);
  nav.appendChild(pv); nav.appendChild(lab); nav.appendChild(nx); box.appendChild(nav);

  data.goals.forEach(g => box.appendChild(goalCard(wk, g)));
  if(data.goals.length) box.appendChild(reflectCard(wk, wk === thisWeek));
  if(!data.goals.length){
    box.appendChild(emptyState("target", wk === thisWeek ? vt("Nog geen weekdoel", "No weekly goal yet") : vt("Geen weekdoel in deze week", "No weekly goal this week"), wk === thisWeek ? vt("Vul hieronder in wat je met je begeleider hebt afgesproken. Je kunt het afvinken als het gelukt is.", "Fill in below what you agreed with your support worker. You can tick it off when you have done it.") : vt("In deze week stond er geen weekdoel.", "There was no weekly goal this week.")));
  }
  if(wk < thisWeek) return;

  const add = el("div", "card");
  add.appendChild(el("div", "qtitle", vt("Weekdoel toevoegen", "Add a weekly goal")));
  const row = el("div"); row.style.cssText = "display:flex;gap:6px;margin-top:10px";
  const inp = el("input", "sosinp"); inp.id = "goalInput"; inp.placeholder = vt("Wat heb je afgesproken?", "What did you agree?");
  const go = el("button", "primary", vt("Toevoegen", "Add")); go.type = "button"; go.style.cssText = "flex:none;padding:10px 14px";
  const doAdd = () => {
    const v = inp.value.trim(); if(!v){ inp.focus(); return; }
    const d = JSON.parse(JSON.stringify(weekData(wk)));
    d.goals.push({id: newId(), text: v, done: "", stuck: ""});
    setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow();
  };
  go.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
  row.appendChild(inp); row.appendChild(go); add.appendChild(row);
  box.appendChild(add);
}
function renderGoalsMini(){
  const card = $("goalsMini"), wk = mondayOf(curKey), data = weekData(wk);
  card.classList.toggle("hidden", !data.goals.length);
  card.innerHTML = "";
  if(!data.goals.length) return;
  const head = el("div"); head.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;gap:8px";
  head.appendChild(el("div", "qtitle", vt("Mijn weekdoel", "My weekly goal")));
  const lk = el("button", "linkbtn more", vt("Bekijk", "View")); lk.type = "button"; lk.onclick = () => { showView("talk"); $("goalsHead").scrollIntoView(); }; head.appendChild(lk);
  card.appendChild(head);
  const wrap = el("div"); wrap.style.marginTop = "6px";
  data.goals.forEach((g, i) => {
    const row = el("label", "planitem" + (g.done ? " done" : "")); if(i === 0) row.style.borderTop = "0";
    const cb = el("input"); cb.type = "checkbox"; cb.checked = !!g.done;
    cb.onchange = () => { updateGoal(wk, g.id, {done: cb.checked ? todayKey() : ""}); renderGoalsMini(); saveSettingsNow(); };
    row.appendChild(cb); row.appendChild(el("span", null, g.text));
    wrap.appendChild(row);
  });
  card.appendChild(wrap);
}
