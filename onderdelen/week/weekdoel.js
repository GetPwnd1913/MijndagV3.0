// © 2026 Roy van Dalem. Alle rechten voorbehouden.
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
const goalStuckOpen = new Set();
let reflectOpen = false;
// één weekdoel als korte regel: afvinken, wissen, en pas op verzoek het vak "loop je ergens tegenaan?"
function goalRow(wk, g, first){
  const w = el("div", "goalrow"); if(first) w.style.borderTop = "0";
  const head = el("div"); head.style.cssText = "display:flex;gap:10px;align-items:flex-start";
  const lab = el("label", "goalcheck" + (g.done ? " done" : ""));
  const cb = el("input"); cb.type = "checkbox"; cb.checked = !!g.done;
  cb.onchange = () => { updateGoal(wk, g.id, {done: cb.checked ? todayKey() : ""}); setTimeout(renderGoals, 300); renderGoalsMini(); saveSettingsNow(); };
  const tx = el("div", "tx"); tx.appendChild(el("span", "gtext", g.text));
  if(g.done) tx.appendChild(el("small", "gdone", vt("✓ Gelukt op ", "✓ Done on ") + dayMonth(g.done)));
  lab.appendChild(cb); lab.appendChild(tx); head.appendChild(lab);
  const del = el("button", "xbtn"); del.appendChild(icon("x", 18)); del.type = "button"; del.setAttribute("aria-label", vt("Weekdoel wissen", "Delete weekly goal"));
  del.onclick = async () => {
    if(!(await confirmDialog(vt("Weekdoel wissen?", "Delete weekly goal?"), "“" + g.text + "”" + vt(" wordt gewist, met wat je erbij hebt geschreven.", " will be deleted, along with what you wrote about it."), vt("Wissen", "Delete")))) return;
    const d = JSON.parse(JSON.stringify(weekData(wk))); d.goals = d.goals.filter(x => x.id !== g.id); setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow();
  };
  head.appendChild(del); w.appendChild(head);
  if(g.done && !g.stuck) return w;
  if(!goalStuckOpen.has(g.id) && !g.stuck){
    const lk = el("button", "linkbtn gstuck", vt("Loop je hier ergens tegenaan?", "Stuck on this?")); lk.type = "button";
    lk.onclick = () => { goalStuckOpen.add(g.id); renderGoals(); const t = document.querySelector('[data-stuck="' + g.id + '"]'); if(t) t.focus(); };
    w.appendChild(lk); return w;
  }
  const box = el("div", "gstuckbox");
  const ta = el("textarea"); ta.dataset.stuck = g.id; ta.value = g.stuck || ""; ta.rows = 2;
  ta.setAttribute("aria-label", vt("Waar loop je tegenaan?", "What are you stuck on?"));
  ta.placeholder = vt("Waar loop je tegenaan?", "What are you stuck on?");
  ta.oninput = () => {
    updateGoal(wk, g.id, {stuck: ta.value});
    settings.updated = Date.now(); local.set("settings", settings);
    clearTimeout(goalTimer); goalTimer = setTimeout(saveSettingsNow, 900);
  };
  box.appendChild(ta);
  if((settings.talk || []).some(t => t.goal === g.id && !t.done)){
    box.appendChild(el("div", "note gdone", vt("✓ Staat op je bespreeklijst", "✓ On your talking points")));
  } else {
    const bt = el("button", "linkbtn gstuck", vt("Zet op mijn bespreeklijst", "Add to my talking points")); bt.type = "button";
    bt.onclick = async () => {
      const v = ta.value.trim(); if(!v){ ta.focus(); return; }
      settings.talk = (settings.talk || []).concat([{id: newId(), text: g.text + ": " + v, added: todayKey(), done: "", goal: g.id}]);
      renderGoals(); await saveSettingsNow();
    };
    box.appendChild(bt);
  }
  w.appendChild(box);
  return w;
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
  const wk = goalWeek, data = weekData(wk), isNow = wk === thisWeek;
  const box = $("goalsBox"); box.innerHTML = "";
  const nav = el("div", "datebar"); nav.style.margin = "0 2px 12px";
  const pv = el("button", "iconbtn"); pv.appendChild(icon("chevL")); pv.type = "button"; pv.setAttribute("aria-label", vt("Vorige week", "Previous week"));
  pv.onclick = () => { goalWeek = addDaysKey(wk, -7); reflectOpen = false; renderGoals(); };
  const nx = el("button", "iconbtn"); nx.appendChild(icon("chevR")); nx.type = "button"; nx.setAttribute("aria-label", vt("Volgende week", "Next week")); nx.disabled = wk >= thisWeek;
  nx.onclick = () => { if(wk < thisWeek){ goalWeek = addDaysKey(wk, 7); reflectOpen = false; renderGoals(); } };
  const lab = el("div", "d", (isNow ? vt("Deze week · ", "This week · ") : "") + "week " + isoWeek(wk));
  const sub = el("div", null, dayMonth(wk) + " – " + dayMonth(addDaysKey(wk, 6))); sub.style.cssText = "font-size:calc(13px*var(--ts));color:var(--muted);font-weight:400";
  lab.appendChild(sub);
  nav.appendChild(pv); nav.appendChild(lab); nav.appendChild(nx); box.appendChild(nav);

  if(!data.goals.length){
    box.appendChild(emptyState("target", isNow ? vt("Nog geen weekdoel", "No weekly goal yet") : vt("Geen weekdoel in deze week", "No weekly goal this week"), isNow ? vt("Schrijf hieronder op wat je met je begeleider hebt afgesproken.", "Write below what you agreed with your support worker.") : vt("In deze week stond er geen weekdoel.", "There was no weekly goal this week.")));
  }
  if(data.goals.length || wk >= thisWeek){
    const c = el("div", "card");
    if(data.goals.length){
      const kop = el("div"); kop.style.cssText = "display:flex;align-items:baseline;gap:10px;margin-bottom:4px";
      kop.appendChild(el("div", "qtitle", vt("Mijn weekdoelen", "My weekly goals")));
      const af = data.goals.filter(g => g.done).length;
      const cnt = el("div", "note", af + vt(" van ", " of ") + data.goals.length); cnt.style.cssText = "margin:0 0 0 auto;flex:none;font-weight:600"; kop.appendChild(cnt);
      c.appendChild(kop);
      data.goals.filter(g => !g.done).concat(data.goals.filter(g => g.done)).forEach((g, i) => c.appendChild(goalRow(wk, g, i === 0)));
    }
    if(wk >= thisWeek){
      const row = el("div"); row.style.cssText = "display:flex;gap:6px;margin-top:" + (data.goals.length ? "12px" : "0");
      const inp = el("input", "sosinp"); inp.id = "goalInput"; inp.placeholder = data.goals.length ? vt("Nog een weekdoel…", "Another weekly goal…") : vt("Wat heb je afgesproken?", "What did you agree?");
      inp.setAttribute("aria-label", vt("Weekdoel toevoegen", "Add a weekly goal"));
      const go = el("button", "primary", vt("Toevoegen", "Add")); go.type = "button"; go.style.cssText = "flex:none;padding:10px 14px";
      const doAdd = () => {
        const v = inp.value.trim(); if(!v){ inp.focus(); return; }
        const d = JSON.parse(JSON.stringify(weekData(wk)));
        d.goals.push({id: newId(), text: v, done: "", stuck: ""});
        setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow(); $("goalInput").focus();
      };
      go.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
      row.appendChild(inp); row.appendChild(go); c.appendChild(row);
    }
    box.appendChild(c);
  }
  // terugblik: pas vanaf vrijdag (of als er al iets is ingevuld, of bij een eerdere week)
  if(data.goals.length){
    const r = data.reflect || {}, dagNr = (parseKey(tk).getDay() + 6) % 7;
    if(!isNow || dagNr >= 4 || r.how || r.text || reflectOpen) box.appendChild(reflectCard(wk, isNow));
    else {
      const lk = el("button", "linkbtn more", vt("Terugblik op deze week (vanaf vrijdag)", "Look back on this week (from Friday)")); lk.type = "button"; lk.style.margin = "2px 4px 12px";
      lk.onclick = () => { reflectOpen = true; renderGoals(); };
      box.appendChild(lk);
    }
  }
  renderTalkTabs();
}
// op het beginscherm een rustige regel "Mijn weekdoel · 0 van 2 ›"; tikken klapt de doelen open
let goalsMiniOpen = false;
function renderGoalsMini(){
  const card = $("goalsMini"), wk = mondayOf(curKey), data = weekData(wk);
  card.classList.toggle("hidden", !data.goals.length);
  card.innerHTML = "";
  if(!data.goals.length) return;
  const head = el("button", "plankop"); head.type = "button"; head.setAttribute("aria-expanded", goalsMiniOpen ? "true" : "false");
  head.appendChild(icon("target", 20));
  head.appendChild(el("div", "qtitle", vt("Mijn weekdoel", "My weekly goal")));
  const af = data.goals.filter(g => g.done).length;
  const cnt = el("div", "note", af + vt(" van ", " of ") + data.goals.length + (goalsMiniOpen ? " ▾" : " ›")); cnt.style.cssText = "margin:0;flex:none"; head.appendChild(cnt);
  head.onclick = () => { goalsMiniOpen = !goalsMiniOpen; renderGoalsMini(); };
  card.appendChild(head);
  if(!goalsMiniOpen) return;
  const wrap = el("div"); wrap.style.marginTop = "6px";
  data.goals.forEach((g, i) => {
    const row = el("label", "planitem" + (g.done ? " done" : "")); if(i === 0) row.style.borderTop = "0";
    const cb = el("input"); cb.type = "checkbox"; cb.checked = !!g.done;
    cb.onchange = () => { updateGoal(wk, g.id, {done: cb.checked ? todayKey() : ""}); renderGoalsMini(); saveSettingsNow(); };
    row.appendChild(cb); row.appendChild(el("span", null, g.text));
    wrap.appendChild(row);
  });
  const lk = el("button", "linkbtn more", vt("Alle weekdoelen bekijken", "View all weekly goals")); lk.type = "button"; lk.style.marginTop = "6px";
  lk.onclick = () => { talkTab = "doel"; showView("talk"); };
  wrap.appendChild(lk);
  card.appendChild(wrap);
}
