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
let reflectOpen = false, goalNetAf = null;
const WD_KLEUREN = ["var(--accent)", "var(--tv-groen)", "var(--warm)", "var(--tv-oranje)"];
const WD_VOORBEELDEN = [["Elke dag mijn dagbeschouwing invullen", "Fill in my daily reflection every day"], ["Drie meetings bezoeken", "Go to three meetings"],
  ["Mijn sponsor twee keer bellen", "Call my sponsor twice"], ["Elke dag 20 minuten wandelen", "Walk 20 minutes every day"],
  ["Werken aan mijn volgende stap", "Work on my next step"], ["Op tijd naar bed", "Go to bed on time"], ["Iets leuks doen voor mezelf", "Do something nice for myself"]];
// voortgangsring (af van tot) als svg
function wdRing(af, tot){
  const r = 30, omtrek = 2 * Math.PI * r, deel = tot ? af / tot : 0;
  const s = '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="' + r + '" class="wdrb"/>' +
    '<circle cx="36" cy="36" r="' + r + '" class="wdrf" stroke-dasharray="' + omtrek.toFixed(1) + '" stroke-dashoffset="' + (omtrek * (1 - deel)).toFixed(1) + '"/>' +
    (tot && af >= tot ? '<path d="M24 37l8 8 16-17" class="wdrv"/>' : '<text x="36" y="42" text-anchor="middle" class="wdrt">' + af + '/' + tot + '</text>') + '</svg>';
  const w = el("div", "wdring" + (tot && af >= tot ? " vol" : "")); w.innerHTML = s; return w;
}
// de weekkaart bovenaan: weeknavigatie, ring, dagen van de week
function wdWeekKaart(wk, data, isNow, thisWeek){
  const c = el("div", "card wdheld");
  const nav = el("div", "wdnav");
  const pv = el("button", "iconbtn"); pv.appendChild(icon("chevL")); pv.type = "button"; pv.setAttribute("aria-label", vt("Vorige week", "Previous week"));
  pv.onclick = () => { goalWeek = addDaysKey(wk, -7); reflectOpen = false; renderGoals(); };
  const nx = el("button", "iconbtn"); nx.appendChild(icon("chevR")); nx.type = "button"; nx.setAttribute("aria-label", vt("Volgende week", "Next week")); nx.disabled = wk >= thisWeek;
  nx.onclick = () => { if(wk < thisWeek){ goalWeek = addDaysKey(wk, 7); reflectOpen = false; renderGoals(); } };
  const lab = el("div", "wdnavtx");
  lab.appendChild(el("b", null, (isNow ? vt("Deze week · ", "This week · ") : "") + vt("week ", "week ") + isoWeek(wk)));
  lab.appendChild(el("small", null, dayMonth(wk) + " – " + dayMonth(addDaysKey(wk, 6))));
  nav.appendChild(pv); nav.appendChild(lab); nav.appendChild(nx); c.appendChild(nav);
  const tot = data.goals.length, af = data.goals.filter(g => g.done).length;
  const rij = el("div", "wdheldrij");
  rij.appendChild(wdRing(af, tot));
  const tx = el("div", "wdheldtx");
  const dagNr = (parseKey(todayKey()).getDay() + 6) % 7, over = 6 - dagNr;
  tx.appendChild(el("div", "wdgroot", !tot ? vt("Nog geen doelen", "No goals yet") : af >= tot ? vt("Alles gelukt!", "All done!") : af + vt(" van ", " of ") + tot + vt(" gelukt", " done")));
  tx.appendChild(el("div", "wdklein", !isNow ? vt("Deze week is voorbij.", "This week is over.") : over === 0 ? vt("Vandaag is de laatste dag van de week.", "Today is the last day of the week.") : vt("Nog " + over + (over === 1 ? " dag" : " dagen") + " deze week.", over + (over === 1 ? " day" : " days") + " left this week.")));
  rij.appendChild(tx); c.appendChild(rij);
  // dagen: verleden licht gevuld, vandaag omcirkeld, een vinkje op dagen waarop je een doel haalde
  const dagen = el("div", "wddagen"), tk = todayKey();
  for(let i = 0; i < 7; i++){
    const k = addDaysKey(wk, i), d = el("div", "wddag" + (k < tk ? " voorbij" : "") + (k === tk ? " nu" : ""));
    d.appendChild(el("small", null, cap(dayName((i + 1) % 7)).slice(0, 2)));
    const bol = el("span", "wdbol"); if(data.goals.some(g => g.done === k)){ bol.classList.add("af"); bol.appendChild(icon("check", 14)); }
    d.appendChild(bol); dagen.appendChild(d);
  }
  c.appendChild(dagen);
  return c;
}
// één weekdoel als gekleurd kaartje: grote afvinkknop, wissen, en op verzoek "loop je ergens tegenaan?"
function goalRow(wk, g, i){
  const w = el("div", "wdkaart" + (g.done ? " done" : "")); w.style.setProperty("--k", WD_KLEUREN[i % WD_KLEUREN.length]);
  w.dataset.goal = g.id;
  const vink = el("button", "wdvink" + (g.done ? " af" : "")); vink.type = "button"; vink.appendChild(icon("check", 20));
  vink.setAttribute("aria-pressed", g.done ? "true" : "false");
  vink.setAttribute("aria-label", g.done ? vt("Toch nog niet gelukt", "Not done after all") : vt("Gelukt", "Done"));
  vink.onclick = () => {
    const nu = !g.done; updateGoal(wk, g.id, {done: nu ? todayKey() : ""});
    w.classList.toggle("done", nu); vink.classList.toggle("af", nu);
    if(nu) goalNetAf = g.id;
    setTimeout(renderGoals, 350); renderGoalsMini(); saveSettingsNow();
  };
  w.appendChild(vink);
  const tx = el("div", "wdtx"); tx.appendChild(el("span", "wdtekst", g.text));
  if(g.done) tx.appendChild(el("small", "wdok", vt("✓ Gelukt op ", "✓ Done on ") + dayMonth(g.done)));
  w.appendChild(tx);
  const del = el("button", "xbtn"); del.appendChild(icon("x", 18)); del.type = "button"; del.setAttribute("aria-label", vt("Weekdoel wissen", "Delete weekly goal"));
  del.onclick = async () => {
    if(!(await confirmDialog(vt("Weekdoel wissen?", "Delete weekly goal?"), "“" + g.text + "”" + vt(" wordt gewist, met wat je erbij hebt geschreven.", " will be deleted, along with what you wrote about it."), vt("Wissen", "Delete")))) return;
    const d = JSON.parse(JSON.stringify(weekData(wk))); d.goals = d.goals.filter(x => x.id !== g.id); setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow();
  };
  w.appendChild(del);
  if(g.done && !g.stuck) return w;
  const onder = el("div", "wdonder");
  if(!goalStuckOpen.has(g.id) && !g.stuck){
    const lk = el("button", "linkbtn", vt("Loop je hier ergens tegenaan?", "Stuck on this?")); lk.type = "button";
    lk.onclick = () => { goalStuckOpen.add(g.id); renderGoals(); const t = document.querySelector('[data-stuck="' + g.id + '"]'); if(t) t.focus(); };
    onder.appendChild(lk); w.appendChild(onder); return w;
  }
  const ta = el("textarea"); ta.dataset.stuck = g.id; ta.value = g.stuck || ""; ta.rows = 2;
  ta.setAttribute("aria-label", vt("Waar loop je tegenaan?", "What are you stuck on?"));
  ta.placeholder = vt("Waar loop je tegenaan?", "What are you stuck on?");
  ta.oninput = () => {
    updateGoal(wk, g.id, {stuck: ta.value});
    settings.updated = Date.now(); local.set("settings", settings);
    clearTimeout(goalTimer); goalTimer = setTimeout(saveSettingsNow, 900);
  };
  onder.appendChild(ta);
  if((settings.talk || []).some(t => t.goal === g.id && !t.done)){
    onder.appendChild(el("div", "wdok", vt("✓ Staat op je bespreeklijst", "✓ On your talking points")));
  } else {
    const bt = el("button", "linkbtn", vt("Zet op mijn bespreeklijst", "Add to my talking points")); bt.type = "button";
    bt.onclick = async () => {
      const v = ta.value.trim(); if(!v){ ta.focus(); return; }
      settings.talk = (settings.talk || []).concat([{id: newId(), text: g.text + ": " + v, added: todayKey(), done: "", goal: g.id}]);
      renderGoals(); renderTalkTabs(); await saveSettingsNow();
    };
    onder.appendChild(bt);
  }
  w.appendChild(onder);
  return w;
}
const REFLECT_OPTS = [["goed","Goed gelukt","Went well","groen"],["deels","Deels gelukt","Partly","oranje"],["niet","Niet gelukt","Didn't work","rood"]];
let reflectTimer = null;
function setReflect(wk, patch){
  const d = JSON.parse(JSON.stringify(weekData(wk)));
  d.reflect = Object.assign({how: "", text: ""}, d.reflect || {}, patch);
  setWeek(wk, d);
}
function reflectCard(wk, isNow){
  const r = weekData(wk).reflect || {how: "", text: ""};
  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", vt("Hoe ging mijn week?", "How did my week go?")));
  const n = note(isNow ? vt("Kijk aan het eind van de week, bijvoorbeeld op zondag, kort terug.", "Look back briefly at the end of the week, for example on Sunday.") : vt("Je terugblik op deze week.", "Your review of this week.")); n.style.marginTop = "2px"; c.appendChild(n);
  const sc = el("div", "wdkeuzes");
  REFLECT_OPTS.forEach(([v, l, len, z]) => {
    const b = el("button", "wdkeus" + (r.how === v ? " on" : "")); b.type = "button"; b.dataset.z = z;
    b.setAttribute("aria-pressed", r.how === v ? "true" : "false");
    b.appendChild(el("span", "wdstip")); b.appendChild(el("span", null, vt(l, len)));
    b.onclick = async () => { const cur = (weekData(wk).reflect || {}).how; setReflect(wk, {how: cur === v ? "" : v}); renderGoals(); await saveSettingsNow(); };
    sc.appendChild(b);
  });
  c.appendChild(sc);
  const ta = el("textarea"); ta.value = r.text || "";
  ta.setAttribute("aria-label", vt("Wat neem je mee naar volgende week?", "What will you take into next week?"));
  ta.placeholder = vt("Wat hielp je, of waar liep je tegenaan? Wat neem je mee naar volgende week?", "What helped you, or what got in the way? What will you take into next week?");
  ta.oninput = () => {
    setReflect(wk, {text: ta.value});
    settings.updated = Date.now(); local.set("settings", settings);
    clearTimeout(reflectTimer); reflectTimer = setTimeout(saveSettingsNow, 900);
  };
  c.appendChild(ta);
  return c;
}
// doelen van vorige week die niet gelukt zijn en nog niet in deze week staan
function wdOpenVanVorige(wk){
  const nu = weekData(wk).goals.map(g => g.text.trim().toLowerCase());
  return weekData(addDaysKey(wk, -7)).goals.filter(g => !g.done && nu.indexOf(g.text.trim().toLowerCase()) < 0);
}
function wdNeemMee(wk, lijst){
  const d = JSON.parse(JSON.stringify(weekData(wk)));
  lijst.forEach(g => d.goals.push({id: newId(), text: g.text, done: "", stuck: ""}));
  setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow();
}
function renderGoals(){
  const tk = todayKey(), thisWeek = mondayOf(tk);
  if(!goalWeek) goalWeek = thisWeek;
  const wk = goalWeek, data = weekData(wk), isNow = wk === thisWeek;
  const box = $("goalsBox"); box.innerHTML = "";
  box.appendChild(wdWeekKaart(wk, data, isNow, thisWeek));

  if(!data.goals.length && !isNow){
    box.appendChild(emptyState("target", vt("Geen weekdoel in deze week", "No weekly goal this week"), vt("In deze week stond er geen weekdoel.", "There was no weekly goal this week.")));
  }
  // nog open van vorige week: met één tik meenemen
  const mee = isNow ? wdOpenVanVorige(wk) : [];
  if(mee.length){
    const c = el("div", "card wdmee");
    c.appendChild(el("div", "qtitle", vt("Nog open van vorige week", "Still open from last week")));
    const n = note(vt("Wil je hier deze week verder mee?", "Do you want to keep working on these this week?")); n.style.marginTop = "2px"; c.appendChild(n);
    mee.forEach(g => {
      const r = el("div", "wdmeerij"); r.appendChild(el("span", null, g.text));
      const b = el("button", "linkbtn more", vt("Meenemen", "Carry over")); b.type = "button"; b.onclick = () => wdNeemMee(wk, [g]);
      r.appendChild(b); c.appendChild(r);
    });
    if(mee.length > 1){ const b = el("button", "ghost", vt("Alles meenemen", "Carry over all")); b.type = "button"; b.style.marginTop = "10px"; b.onclick = () => wdNeemMee(wk, mee); c.appendChild(b); }
    box.appendChild(c);
  }
  if(data.goals.length || isNow){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Mijn weekdoelen", "My weekly goals")));
    if(!data.goals.length){ const n = note(vt("Schrijf op wat je met je begeleider hebt afgesproken, of kies hieronder een voorbeeld.", "Write down what you agreed with your support worker, or pick an example below.")); n.style.marginTop = "2px"; c.appendChild(n); }
    const lijst = el("div", "wdlijst");
    data.goals.filter(g => !g.done).concat(data.goals.filter(g => g.done)).forEach(g => lijst.appendChild(goalRow(wk, g, data.goals.indexOf(g))));
    c.appendChild(lijst);
    if(isNow){
      const row = el("div", "wdinvoer");
      const inp = el("input", "sosinp"); inp.id = "goalInput"; inp.placeholder = data.goals.length ? vt("Nog een weekdoel…", "Another weekly goal…") : vt("Wat heb je afgesproken?", "What did you agree?");
      inp.setAttribute("aria-label", vt("Weekdoel toevoegen", "Add a weekly goal"));
      const go = el("button", "primary", vt("Toevoegen", "Add")); go.type = "button";
      const doAdd = () => {
        const v = inp.value.trim(); if(!v){ inp.focus(); return; }
        const d = JSON.parse(JSON.stringify(weekData(wk)));
        d.goals.push({id: newId(), text: v, done: "", stuck: ""});
        setWeek(wk, d); renderGoals(); renderGoalsMini(); saveSettingsNow(); $("goalInput").focus();
      };
      go.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
      row.appendChild(inp); row.appendChild(go); c.appendChild(row);
      const al = data.goals.map(g => g.text);
      const vb = WD_VOORBEELDEN.map(p => vt(p[0], p[1])).filter(v => al.indexOf(v) < 0).slice(0, data.goals.length ? 4 : 7);
      if(vb.length){
        const ch = el("div", "wdchips");
        vb.forEach(v => { const b = el("button", "chip", "+ " + v); b.type = "button"; b.onclick = () => { inp.value = v; inp.focus(); }; ch.appendChild(b); });
        c.appendChild(ch);
      }
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
  // net gehaald: een klein feestje op het vinkje (en bij het laatste doel ook op de ring)
  const netAf = goalNetAf; goalNetAf = null;
  if(netAf && typeof ktShow === "function" && !KT_RUSTIG()){
    const v = box.querySelector('.wdkaart[data-goal="' + netAf + '"] .wdvink'), ring = box.querySelector(".wdring.vol");
    try{
      const show = ktShow();
      if(v){ const [x, y] = ktMidden(v); show.knal(x, y, ktFeestKleuren(wbxKleurVan("var(--accent)")), 22, 5, ["stip", "ster"]); }
      if(ring){ const [x, y] = ktMidden(ring); setTimeout(() => show.knal(x, y, ktFeestKleuren(wbxKleurVan("var(--warm)")), 46, 7, ["strook", "stip", "ster"]), 250); }
      if(navigator.vibrate) navigator.vibrate(20);
    }catch(e){}
  }
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
