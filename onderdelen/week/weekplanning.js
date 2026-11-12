// ---------- weekplanning ----------
function planOf(wk){ return wfGet(wk, "plan"); }
function setPlanSlots(wk, day, from, to, text){
  const d = wfData(wk); d.plan = d.plan || {}; d.plan[day] = Object.assign({}, d.plan[day] || {});
  for(let i = from; i <= to; i++){ if(text) d.plan[day][WF_SLOTS[i]] = text; else delete d.plan[day][WF_SLOTS[i]]; }
  wfStore(wk, d); clearTimeout(wfTimer); wfTimer = setTimeout(saveSettingsNow, 600);
}
function slotIndexOf(t){ // "19:30" -> index (afgerond naar beneden op half uur)
  const m = /^(\d{1,2})[:.](\d{2})/.exec(t || ""); if(!m) return -1;
  let mins = +m[1] * 60 + (+m[2] >= 30 ? 30 : 0);
  return Math.max(-1, Math.min(WF_SLOTS.length - 1, (mins - 480) / 30));
}
function addStarMeetings(wk){
  const d = wfData(wk); d.plan = d.plan || {}; let n = 0;
  allMeetings().filter(isStar).forEach(m => {
    const day = (m.d + 6) % 7, i = slotIndexOf(m.t);
    if(i < 0) return;
    d.plan[day] = Object.assign({}, d.plan[day] || {});
    for(let k = i; k < Math.min(i + 3, WF_SLOTS.length); k++){ if(!d.plan[day][WF_SLOTS[k]]){ d.plan[day][WF_SLOTS[k]] = m.f + " meeting " + m.city; n++; } }
  });
  d.plan._init = 1; wfStore(wk, d); saveSettingsNow();
  return n;
}
function renderWfPlan(box, wk){
  let plan = planOf(wk);
  if(!plan._init && !Object.keys(plan).some(k => /^\d$/.test(k))){ addStarMeetings(wk); plan = planOf(wk); }
  const start = planWeekStart(wk);
  const vast = planVastHas();
  if(vast && !plan._vast){
    const vc = el("div", "card vastcard");
    vc.appendChild(el("div", "qtitle", vt("Je vaste week invullen?", "Fill in your regular week?")));
    vc.appendChild(note(vt("Zet je normale week in één keer neer. Daarna pas je alleen aan wat deze week anders is.", "Put your normal week in at once. Then you only change what is different this week.")));
    const r = el("div", "row"); const vb = el("button", "primary", vt("Vul mijn vaste week in", "Fill in my regular week")); vb.type = "button";
    vb.onclick = () => planApplyVast(wk); r.appendChild(vb); vc.appendChild(r);
    box.appendChild(vc);
  }
  const tabs = el("div", "daytabs");
  WF_DAYS.forEach((dn, i) => {
    const b = el("button", i === planDay ? "on" : null); b.type = "button";
    b.appendChild(el("span", "dn", dn.slice(0, 2)));
    b.appendChild(el("span", "dd", String(parseKey(addDaysKey(start, i)).getDate())));
    if(Object.values(plan[i] || {}).some(Boolean)) b.appendChild(el("i"));
    b.onclick = () => { planDay = i; planSel = null; planCopy = false; renderWf(); };
    tabs.appendChild(b);
  });
  box.appendChild(tabs);

  const card = el("div", "card");
  const top = el("div"); top.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap";
  top.appendChild(el("div", "qtitle", WF_DAYS[planDay] + " " + dayMonth(addDaysKey(start, planDay))));
  card.appendChild(top);
  const addB = el("button", "primary addbtn", vt("+ Activiteit toevoegen", "+ Add activity")); addB.type = "button";
  addB.onclick = () => planAddSheet(wk);
  card.appendChild(addB);
  const hint = note(planSel ? vt("Tik op een tweede tijd om het blok groter te maken, of kies hieronder wat je gaat doen.", "Tap a second time to make the block bigger, or choose below what you are going to do.") : vt("Of tik hieronder op een tijd, en daarna op een tweede tijd voor een heel blok.", "Or tap a time below, and then a second time for a whole block."));
  hint.style.marginTop = "2px"; card.appendChild(hint);

  const day = plan[planDay] || {};
  const list = el("div", "slots");
  WF_SLOTS.forEach((t, i) => {
    const v = day[t] || "", prev = i > 0 ? (day[WF_SLOTS[i - 1]] || "") : "", nxt = day[WF_SLOTS[i + 1]] || "";
    const inSel = planSel && i >= planSel.from && i <= planSel.to;
    const r = el("button", "slot" + (inSel ? " sel" : "") + (v ? " has" : "") + (v && v === prev ? " cont" : "") + (v && v !== nxt ? " end" : "")); r.type = "button";
    r.appendChild(el("span", "tm", t));
    r.appendChild(el("span", "tx", v && v !== prev ? v : ""));
    r.onclick = () => {
      if(!planSel || planSel.from !== planSel.to || i === planSel.from) planSel = planSel && i === planSel.from && planSel.from === planSel.to ? null : {from: i, to: i};
      else planSel = {from: Math.min(planSel.from, i), to: Math.max(planSel.from, i)};
      renderWf._keep = true; renderWf();
    };
    list.appendChild(r);
    if(planSel && i === planSel.to) list.appendChild(planPanel(wk));
  });
  card.appendChild(list);
  box.appendChild(card);

  const tools = wfCard(vt("Sneller invullen", "Fill in faster"));
  const row = el("div", "chips"); row.style.marginTop = "8px";
  const cp = el("button", "chip" + (planCopy ? " on" : ""), vt("Kopieer " + WF_DAYS[planDay].toLowerCase() + " naar…", "Copy " + WF_DAYS[planDay] + " to…")); cp.type = "button";
  cp.onclick = () => { planCopy = !planCopy; renderWf._keep = true; renderWf(); };
  row.appendChild(cp);
  const prevWk = addDaysKey(wk, -7), prevPlan = planOf(prevWk);
  if(Object.keys(prevPlan).some(k => /^\d$/.test(k) && Object.values(prevPlan[k] || {}).some(Boolean))){
    const pw = el("button", "chip", vt("Neem vorige week over", "Copy last week")); pw.type = "button";
    pw.onclick = async () => {
      if(Object.keys(plan).some(k => /^\d$/.test(k) && Object.values(plan[k] || {}).some(Boolean)) && !(await confirmDialog(vt("Vorige week overnemen?", "Copy last week?"), vt("Wat je deze week al hebt ingevuld, wordt vervangen door de planning van vorige week.", "What you have already filled in this week will be replaced by last week's plan."), vt("Overnemen", "Copy")))) return;
      const d = wfData(wk); d.plan = JSON.parse(JSON.stringify(prevPlan)); d.plan._init = 1; wfStore(wk, d); saveSettingsNow(); renderWf();
    };
    row.appendChild(pw);
  }
  if(vast){ const vb = el("button", "chip", vt("Vul mijn vaste week in", "Fill in my regular week")); vb.type = "button"; vb.onclick = () => planApplyVast(wk); row.appendChild(vb); }
  const sv = el("button", "chip", vast ? vt("Bewaar als nieuwe vaste week", "Save as new regular week") : vt("Bewaar als mijn vaste week", "Save as my regular week")); sv.type = "button";
  sv.onclick = async () => {
    const cur = planOf(wk);
    if(!planHasOwn(cur)){ toast(vt("Vul eerst je week in, dan kun je hem bewaren.", "Fill in your week first, then you can save it.")); return; }
    if(vast && !(await confirmDialog(vt("Vaste week vervangen?", "Replace regular week?"), vt("Je huidige vaste week wordt vervangen door deze planning.", "Your current regular week will be replaced by this plan."), vt("Vervangen", "Replace"), true))) return;
    const t = {}; for(let i = 0; i < 7; i++){ t[i] = {}; Object.entries(cur[i] || {}).forEach(([k, v]) => { if(v && !isMeetText(v)) t[i][k] = v; }); }
    settings.planVast = t; await saveSettingsNow(); renderWf._keep = true; renderWf();
    toast(vt("Bewaard. Volgende week vul je hem in één tik in.", "Saved. Next week you can fill it in with one tap."));
  };
  row.appendChild(sv);
  const sm = el("button", "chip", vt("Zet mijn vaste meetings erin", "Add my regular meetings")); sm.type = "button";
  sm.onclick = () => { const n = addStarMeetings(wk); renderWf._keep = true; renderWf(); toast(n ? vt("Je vaste meetings staan erin.", "Your regular meetings have been added.") : vt("Geen nieuwe vaste meetings. Geef ze een ster bij Meetings.", "No new regular meetings. Give them a star under Meetings.")); };
  row.appendChild(sm);
  const clr = el("button", "chip", vt("Dag leegmaken", "Clear day")); clr.type = "button";
  clr.onclick = async () => { if(!(await confirmDialog(vt(WF_DAYS[planDay] + " leegmaken?", "Clear " + WF_DAYS[planDay] + "?"), vt("Alles wat je voor deze dag hebt gepland, wordt gewist.", "Everything you planned for this day will be deleted."), vt("Leegmaken", "Clear")))) return; setPlanSlots(wk, planDay, 0, WF_SLOTS.length - 1, ""); renderWf(); };
  row.appendChild(clr);
  tools.appendChild(row);
  if(planCopy){
    const cr = el("div"); cr.style.marginTop = "12px";
    cr.appendChild(el("div", "label", vt("Naar welke dagen?", "To which days?")));
    const sel = new Set();
    const dr = el("div", "chips");
    WF_DAYS.forEach((dn, i) => { if(i === planDay) return; const b = el("button", "chip", dn); b.type = "button"; b.onclick = () => { if(sel.has(i)) sel.delete(i); else sel.add(i); b.classList.toggle("on"); }; dr.appendChild(b); });
    cr.appendChild(dr);
    const go = el("button", "primary", vt("Kopiëren", "Copy")); go.type = "button"; go.style.marginTop = "10px";
    go.onclick = async () => {
      if(!sel.size){ toast(vt("Kies eerst een of meer dagen.", "Choose one or more days first.")); return; }
      const filled = [...sel].filter(i => Object.values((planOf(wk)[i]) || {}).some(Boolean));
      if(filled.length && !(await confirmDialog(vt("Dagen overschrijven?", "Overwrite days?"), filled.sort().map(i => WF_DAYS[i]).join(", ") + (isEn() ? (filled.length === 1 ? " is" : " are") + " already filled in and will be overwritten." : (filled.length === 1 ? " is" : " zijn") + " al ingevuld en wordt overschreven."), vt("Kopiëren", "Copy")))) return;
      const d = wfData(wk); d.plan = d.plan || {};
      sel.forEach(i => { d.plan[i] = Object.assign({}, d.plan[planDay] || {}); });
      wfStore(wk, d); saveSettingsNow(); planCopy = false; renderWf._keep = true; renderWf();
      toast(isEn() ? WF_DAYS[planDay] + " copied to " + [...sel].sort().map(i => WF_DAYS[i]).join(", ") : WF_DAYS[planDay] + " gekopieerd naar " + [...sel].sort().map(i => WF_DAYS[i].toLowerCase()).join(", "));
    };
    cr.appendChild(go); tools.appendChild(cr);
  }
  if(!vast) tools.appendChild(note(vt("Tip: vul één keer je normale week in en tik op ‘Bewaar als mijn vaste week’. Volgende keer staat alles er in één tik.", "Tip: fill in your normal week once and tap ‘Save as my regular week’. Next time everything is there with one tap.")));
  const tm = note(""); tm.id = "wfToolMsg"; tools.appendChild(tm);
  box.appendChild(tools);
}
function planHasAny(plan){ return Object.keys(plan || {}).some(k => /^\d$/.test(k) && Object.values(plan[k] || {}).some(Boolean)); }
const isMeetText = v => /^(NA|AA|CA) meeting /.test(v || "");
function planHasOwn(plan){ return Object.keys(plan || {}).some(k => /^\d$/.test(k) && Object.values(plan[k] || {}).some(v => v && !isMeetText(v))); }
function planVastHas(){ return planHasAny(settings.planVast); }
async function planApplyVast(wk){
  if(planHasOwn(planOf(wk)) && !(await confirmDialog(vt("Vaste week invullen?", "Fill in regular week?"), vt("Wat je deze week al hebt gepland, wordt vervangen door je vaste week. Je vaste meetings komen er weer bij.", "What you have already planned this week will be replaced by your regular week. Your regular meetings will be added again."), vt("Invullen", "Fill in"), true))) return;
  const d = wfData(wk); d.plan = {_init: 1, _vast: 1};
  for(let i = 0; i < 7; i++) d.plan[i] = Object.assign({}, (settings.planVast || {})[i] || {});
  wfStore(wk, d); addStarMeetings(wk); await saveSettingsNow();
  renderWf._keep = true; renderWf(); toast(vt("Je vaste week staat erin. Pas aan wat anders is.", "Your regular week is filled in. Change what is different."));
}
function planAddSheet(wk, preset){
  const own = Array.isArray(settings.planChips) ? settings.planChips : [];
  const back = el("div", "dlgback"); back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true");
  const d = el("div", "dlg sheet");
  d.appendChild(el("h3", null, vt("Activiteit toevoegen", "Add activity")));
  let what = "";
  d.appendChild(el("div", "label", vt("Wat ga je doen?", "What are you going to do?")));
  const wr = el("div", "chips");
  const inp = el("input", "sosinp"); inp.placeholder = "Of typ zelf, bijv. Sessie kantoor"; inp.style.cssText = "width:100%;margin-top:8px;box-sizing:border-box";
  PLAN_CHIPS.concat(own.filter(c => !PLAN_CHIPS.includes(c))).forEach(c => {
    const b = el("button", "chip", c); b.type = "button";
    b.onclick = () => { what = c; inp.value = ""; wr.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b)); };
    wr.appendChild(b);
  });
  inp.oninput = () => { if(inp.value.trim()){ what = ""; wr.querySelectorAll(".chip").forEach(x => x.classList.remove("on")); } };
  d.appendChild(wr); d.appendChild(inp);
  d.appendChild(el("div", "label", vt("Hoe laat?", "What time?")));
  const tr = el("div", "timerow");
  const ends = WF_SLOTS.slice(1).concat(["22.30"]);
  const sFrom = el("select"), sTo = el("select");
  WF_SLOTS.forEach((t, i) => { const o = el("option", null, t); o.value = i; sFrom.appendChild(o); });
  ends.forEach((t, i) => { const o = el("option", null, t); o.value = i; sTo.appendChild(o); });
  sFrom.value = preset ? preset.from : WF_SLOTS.indexOf("09.00"); sTo.value = preset ? preset.to : WF_SLOTS.indexOf("09.30");
  sFrom.setAttribute("aria-label", vt("Van", "From")); sTo.setAttribute("aria-label", vt("Tot", "To"));
  sFrom.onchange = () => { if(+sTo.value < +sFrom.value) sTo.value = sFrom.value; };
  sTo.onchange = () => { if(+sTo.value < +sFrom.value) sFrom.value = sTo.value; };
  tr.appendChild(el("span", "note", vt("van", "from"))); tr.appendChild(sFrom); tr.appendChild(el("span", "note", vt("tot", "to"))); tr.appendChild(sTo);
  d.appendChild(tr);
  d.appendChild(el("div", "label", vt("Welke dagen?", "Which days?")));
  const days = new Set([planDay]);
  const dr = el("div", "chips");
  const dayBtns = WF_DAYS.map((dn, i) => { const b = el("button", "chip" + (days.has(i) ? " on" : ""), dn.slice(0, 2)); b.type = "button"; b.setAttribute("aria-label", dn);
    b.onclick = () => { if(days.has(i)) days.delete(i); else days.add(i); b.classList.toggle("on", days.has(i)); }; dr.appendChild(b); return b; });
  d.appendChild(dr);
  const qr = el("div", "chips"); qr.style.marginTop = "8px";
  [[vt("Ma t/m vr", "Mon to Fri"), [0,1,2,3,4]], ["Weekend", [5,6]], [vt("Hele week", "Whole week"), [0,1,2,3,4,5,6]]].forEach(([l, arr]) => {
    const b = el("button", "linkbtn", l); b.type = "button"; b.style.marginRight = "16px";
    b.onclick = () => { days.clear(); arr.forEach(i => days.add(i)); dayBtns.forEach((x, i) => x.classList.toggle("on", days.has(i))); };
    qr.appendChild(b);
  });
  d.appendChild(qr);
  const row = el("div", "row");
  const no = el("button", "ghost", vt("Annuleren", "Cancel")); no.type = "button";
  const yes = el("button", "primary", vt("Toevoegen", "Add")); yes.type = "button";
  const close = () => { back.classList.remove("show"); setTimeout(() => back.remove(), 200); document.removeEventListener("keydown", onKey); };
  const onKey = e => { if(e.key === "Escape") close(); };
  no.onclick = close; back.onclick = e => { if(e.target === back) close(); };
  yes.onclick = async () => {
    const text = inp.value.trim() || what;
    if(!text){ toast(vt("Kies eerst wat je gaat doen.", "Choose what you are going to do first.")); return; }
    if(!days.size){ toast(vt("Kies eerst een of meer dagen.", "Choose one or more days first.")); return; }
    const from = +sFrom.value, to = +sTo.value, plan = planOf(wk), list = [...days].sort();
    const clash = list.filter(i => { const dy = plan[i] || {}; for(let k = from; k <= to; k++){ const v = dy[WF_SLOTS[k]]; if(v && v !== text) return true; } return false; });
    if(clash.length){
      back.style.visibility = "hidden";
      const ok = await confirmDialog(vt("Overschrijven?", "Overwrite?"), isEn() ? "On " + clash.map(i => WF_DAYS[i]).join(", ") + " something is already planned at that time. It will be replaced." : "Op " + clash.map(i => WF_DAYS[i].toLowerCase()).join(", ") + " staat op die tijd al iets. Dat wordt vervangen.", vt("Overschrijven", "Overwrite"), true);
      back.style.visibility = "";
      if(!ok) return;
    }
    list.forEach(i => setPlanSlots(wk, i, from, to, text));
    if(inp.value.trim() && !PLAN_CHIPS.includes(text) && !own.includes(text)) settings.planChips = own.concat([text]);
    await saveSettingsNow(); close(); planSel = null; renderWf._keep = true; renderWf();
    toast(text.charAt(0).toUpperCase() + text.slice(1) + vt(" staat erin", " has been added") + (list.length > 1 ? vt(" op ", " on ") + list.map(i => isEn() ? WF_DAYS[i].slice(0, 2) : WF_DAYS[i].slice(0, 2).toLowerCase()).join(", ") : "") + ".");
  };
  document.addEventListener("keydown", onKey);
  row.appendChild(no); row.appendChild(yes); d.appendChild(row); back.appendChild(d);
  document.body.appendChild(back);
  requestAnimationFrame(() => back.classList.add("show"));
}
function planPanel(wk){
  const p = el("div", "slotpanel");
  const s = planSel, endT = (() => { const i = s.to + 1; return i < WF_SLOTS.length ? WF_SLOTS[i] : "22.30"; })();
  p.appendChild(el("div", "label", WF_SLOTS[s.from] + " – " + endT + vt(" · wat ga je doen?", " · what are you going to do?")));
  const done = text => { setPlanSlots(wk, planDay, s.from, s.to, text); planSel = null; renderWf._keep = true; renderWf(); };
  const row = el("div", "chips");
  PLAN_CHIPS.forEach(c => { const b = el("button", "chip", c); b.type = "button"; b.onclick = () => done(c); row.appendChild(b); });
  const own = Array.isArray(settings.planChips) ? settings.planChips : [];
  own.forEach(c => {
    const b = el("button", "chip", c); b.type = "button"; b.onclick = () => done(c);
    const x = el("span"); x.appendChild(icon("x", 14)); x.style.cssText = "color:var(--muted);padding-left:6px;display:inline-flex;vertical-align:-2px"; x.setAttribute("aria-label", vt("Knopje weghalen", "Remove button"));
    x.onclick = async ev => { ev.stopPropagation(); settings.planChips = own.filter(y => y !== c); renderWf._keep = true; renderWf(); await saveSettingsNow(); };
    b.appendChild(x); row.appendChild(b);
  });
  const plus = el("button", "chip start", vt("+ Eigen", "+ Own")); plus.type = "button";
  row.appendChild(plus);
  p.appendChild(row);
  const f = el("div"); f.style.cssText = "display:none;gap:6px;margin-top:10px";
  const inp = el("input", "sosinp"); inp.placeholder = vt("Wat ga je doen?", "What are you going to do?");
  const cur = (planOf(wk)[planDay] || {})[WF_SLOTS[s.from]]; if(cur && !PLAN_CHIPS.includes(cur) && !own.includes(cur)) inp.value = cur;
  const ok = el("button", "primary", "OK"); ok.type = "button"; ok.style.cssText = "flex:none;padding:10px 16px";
  ok.onclick = async () => {
    const v = inp.value.trim(); if(!v){ inp.focus(); return; }
    if(!PLAN_CHIPS.includes(v) && !own.includes(v)) settings.planChips = own.concat([v]);
    done(v); await saveSettingsNow();
  };
  inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); ok.onclick(); } };
  plus.onclick = () => { f.style.display = "flex"; plus.classList.add("hidden"); inp.focus(); };
  f.appendChild(inp); f.appendChild(ok); p.appendChild(f);
  const r2 = el("div"); r2.style.cssText = "display:flex;gap:16px;margin-top:10px";
  const wis = el("button", "linkbtn", vt("Wissen", "Clear")); wis.type = "button"; wis.onclick = () => done("");
  const an = el("button", "linkbtn", vt("Annuleren", "Cancel")); an.type = "button"; an.style.color = "var(--muted)"; an.onclick = () => { planSel = null; renderWf._keep = true; renderWf(); };
  r2.appendChild(wis); r2.appendChild(an); p.appendChild(r2);
  return p;
}
function planRuns(dayObj){ // [{from,to,text}]
  const out = []; let cur = null;
  WF_SLOTS.forEach((t, i) => {
    const v = (dayObj || {})[t] || "";
    if(cur && v && v === cur.text) cur.to = i;
    else { if(cur) out.push(cur); cur = v ? {from: i, to: i, text: v} : null; }
  });
  if(cur) out.push(cur);
  return out;
}
const runTime = r => WF_SLOTS[r.from].replace(".", ":") + "–" + (r.to + 1 < WF_SLOTS.length ? WF_SLOTS[r.to + 1] : "22.30").replace(".", ":");
