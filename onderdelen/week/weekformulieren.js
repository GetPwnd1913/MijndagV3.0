// ---------- weekformulieren ----------
// WF_DAYS, PLAN_CHIPS en WV_REMIND volgen de gekozen taal: het zijn getters op window (geen const),
// zodat alle bestaande plekken die ze gebruiken vanzelf de juiste taal krijgen.
const taalLijst = (naam, nl, en) => Object.defineProperty(window, naam, {get: () => isEn() ? en : nl, configurable: true});
taalLijst("WF_DAYS", ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"], ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]);
const WF_SLOTS = (() => { const a = []; for(let m = 8 * 60; m <= 22 * 60; m += 30) a.push(pad(Math.floor(m / 60)) + "." + pad(m % 60)); return a; })();
const WF_BAND = i => i <= 8 ? "E3ECF7" : i <= 20 ? "CFDDEF" : "EEF3FA";
const WF_BAND_T = i => i <= 8 ? "C9D9EE" : i <= 20 ? "B3C9E4" : "DAE5F3";
taalLijst("PLAN_CHIPS", ["programma","meeting","sporten","wandelen","koken","huistaken","boodschappen","nazorg","1-op-1 gesprek","sponsor bellen","stappenwerk","werk of dagbesteding","vrije tijd","voetbal kijken","rust","familie","vrienden"],
  ["programme","meeting","exercise","walk","cooking","household chores","groceries","aftercare","1-to-1 talk","call sponsor","step work","work or day activities","free time","watch football","rest","family","friends"]);
const HULP = ["Voedingsbegeleiding","Herstelbegeleiding","Werk begeleiding","Studie begeleiding","Sociale begeleiding m.b.t. contacten","Huisvestingsbegeleiding","Financiële begeleiding","Administratieve begeleiding","Justitiële begeleiding","Medicatiebegeleiding","Begeleiding met plannen"];
// HULP blijft Nederlands: het zijn de sleutels waaronder je keuzes bewaard worden (u.hulp). HULP_EN is alleen voor de weergave.
const HULP_EN = ["Nutrition support","Recovery support","Work support","Study support","Social support with contacts","Housing support","Financial support","Administrative support","Legal support","Medication support","Support with planning"];
const hulpNaam = h => isEn() ? (HULP_EN[HULP.indexOf(h)] || h) : h;
taalLijst("WV_REMIND", [["Vermijd zelfmedelijden, honger, boosheid, eenzaamheid en moeheid","Check je motieven","Alleen voor vandaag","Ook dit gaat voorbij","Slim zijn en niet sterk"],
  ["Herstel staat op 1","Plan B","De slechtste plek voor een verslaafde is alleen in zijn hoofd","Wil je gebruiken? Gebruik dan de telefoon"]],
  [["Avoid self-pity, hunger, anger, loneliness and tiredness","Check your motives","Just for today","This too shall pass","Be smart, not strong"],
  ["Recovery comes first","Plan B","The worst place for an addict is alone in their own head","Want to use? Use the phone instead"]]);
const WF_FORMS = [
  {id: "plan", get title(){ return vt("Weekplanning", "Weekly planning"); }, when: "zondag", desc: "Je planning voor de komende week"},
  {id: "upd", get title(){ return vt("Wekelijkse Update", "Weekly update"); }, when: "zondag", desc: "Terugblik op de afgelopen week"},
  {id: "wv", get title(){ return vt("Weekendvoorbespreking", "Weekend plan"); }, when: "woensdagavond", desc: "Je plan voor het weekend"}
];
let wfWeek = null, wfOpen = "", planDay = 0, planSel = null, wfTimer = null, planCopy = false;

function wfData(wk){ return JSON.parse(JSON.stringify(((settings.wf || {})[wk]) || {})); }
function wfStore(wk, d){ settings.wf = Object.assign({}, settings.wf || {}); settings.wf[wk] = d; settings.updated = Date.now(); local.set("settings", settings); }
function wfSet(wk, form, key, val, now){
  const d = wfData(wk); d[form] = d[form] || {}; d[form][key] = val; wfStore(wk, d);
  clearTimeout(wfTimer);
  if(now) saveSettingsNow(); else wfTimer = setTimeout(saveSettingsNow, 900);
}
const wfGet = (wk, form) => (wfData(wk)[form]) || {};
const planWeekStart = wk => addDaysKey(wk, 7);
const rangeLabel = (a, b) => { const A = parseKey(a), B = parseKey(b);
  const tm = vt(" t/m ", " – ");
  if(A.getFullYear() !== B.getFullYear()) return shortDate(a) + tm + shortDate(b);
  return A.getMonth() === B.getMonth() ? A.getDate() + tm + shortDate(b) : dayMonth(a) + tm + shortDate(b); };
const isoYear = k => { const d = parseKey(k); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7)).getFullYear(); };
function wfWeekInfo(wk, id){
  const start = id === "plan" ? planWeekStart(wk) : wk;
  const from = id === "wv" ? addDaysKey(wk, 4) : start, to = addDaysKey(start, 6);
  return {week: isoWeek(start), year: isoYear(start), range: rangeLabel(from, to)};
}
function wfFooterText(wk, id){
  const f = WF_FORMS.find(x => x.id === id), w = wfWeekInfo(wk, id);
  return vt("Mijn dag", "My day") + "  \u00b7  " + f.title + "  \u00b7  week " + w.week + " (" + w.range + ")";
}
function wfStatus(wk, f){
  const d = wfData(wk), s = (d.sent || {})[f.id];
  if(s) return {t: vt("✓ Verstuurd op ", "✓ Sent on ") + dayMonth(s), cls: "ok"};
  const v = d[f.id] || {};
  const has = f.id === "plan" ? Object.keys(v).some(k => /^\d$/.test(k) && Object.values(v[k] || {}).some(Boolean)) : Object.keys(v).some(k => { const x = v[k]; return typeof x === "object" ? Object.values(x || {}).some(Boolean) : !!x; });
  return has ? {t: vt("Bezig", "In progress"), cls: "busy"} : {t: vt("Nog invullen", "To fill in"), cls: ""};
}

// velden
function wfField(wk, form, key, label, ph, small){
  const f = el("div", "wff");
  if(label) f.appendChild(el("div", "label", label));
  const ta = el("textarea"); ta.value = wfGet(wk, form)[key] || ""; ta.placeholder = ph || "";
  if(small) ta.classList.add("small");
  ta.oninput = () => wfSet(wk, form, key, ta.value);
  f.appendChild(ta); f._ta = ta;
  return f;
}
function wfChips(ta, items, onchange){
  const row = el("div", "chips"); row.style.marginTop = "8px";
  const parts = () => ta.value.split(/,\s*/).map(x => x.trim()).filter(Boolean);
  items.forEach(it => {
    const c = el("button", "chip", it); c.type = "button";
    if(parts().map(x => x.toLowerCase()).includes(it.toLowerCase())) c.classList.add("on");
    c.onclick = () => {
      let p = parts(); const i = p.findIndex(x => x.toLowerCase() === it.toLowerCase());
      if(i >= 0) p.splice(i, 1); else p.push(it);
      ta.value = p.join(", "); c.classList.toggle("on", i < 0); onchange();
    };
    row.appendChild(c);
  });
  return row;
}
function wfYN(wk, form, key, label, opts){
  const f = el("div", "wff");
  if(label) f.appendChild(el("div", "label", label));
  const sc = el("div", "scale");
  (opts || [["ja","Ja","Yes"],["nee","Nee","No"]]).forEach(([v, l, len]) => {
    const b = el("button", null, vt(l, len || l)); b.type = "button";
    if(wfGet(wk, form)[key] === v) b.classList.add("on");
    b.onclick = () => { const cur = wfGet(wk, form)[key]; wfSet(wk, form, key, cur === v ? "" : v, true); renderWf(); };
    sc.appendChild(b);
  });
  f.appendChild(sc);
  return f;
}
function wfCard(title, sub){
  const c = el("div", "card");
  if(title) c.appendChild(el("div", "qtitle", title));
  if(sub){ const n = note(sub); n.style.marginTop = "2px"; c.appendChild(n); }
  return c;
}

// ---------- overzicht ----------
function renderWf(){
  const box = $("wfBox"); if(!box) return;
  if(!wfWeek) wfWeek = mondayOf(todayKey());
  const keepY = window.scrollY;
  box.innerHTML = "";
  if(wfOpen){ renderWfForm(box); if(renderWf._keep) window.scrollTo(0, keepY); renderWf._keep = false; return; }
  const thisWk = mondayOf(todayKey());
  const nav = el("div", "datebar");
  const pv = el("button", "iconbtn"); pv.appendChild(icon("chevL")); pv.type = "button"; pv.setAttribute("aria-label", vt("Vorige week", "Previous week"));
  pv.onclick = () => { wfWeek = addDaysKey(wfWeek, -7); renderWf(); };
  const nx = el("button", "iconbtn"); nx.appendChild(icon("chevR")); nx.type = "button"; nx.setAttribute("aria-label", vt("Volgende week", "Next week"));
  nx.disabled = wfWeek >= thisWk; nx.onclick = () => { wfWeek = addDaysKey(wfWeek, 7); renderWf(); };
  const mid = el("div", "d", (wfWeek === thisWk ? vt("Deze week · ", "This week · ") : "") + "week " + isoWeek(wfWeek));
  const ms = el("div", null, dayMonth(wfWeek) + " – " + dayMonth(addDaysKey(wfWeek, 6))); ms.style.cssText = "font-size:13px;color:var(--muted);font-weight:400"; mid.appendChild(ms);
  nav.appendChild(pv); nav.appendChild(mid); nav.appendChild(nx);
  box.appendChild(nav);
  const intro = note(vt("Elke zondag vul je de weekplanning en de wekelijkse update in, en op woensdagavond de weekendvoorbespreking. Daarna maak je er een Word- of PDF-bestand van om te mailen.", "Every Sunday you fill in the weekly planning and the weekly update, and on Wednesday evening the weekend plan. Then you make a Word or PDF file of it to email."));
  intro.style.margin = "0 2px 14px"; box.appendChild(intro);
  WF_FORMS.forEach(f => {
    const st = wfStatus(wfWeek, f);
    const c = el("button", "card wfitem"); c.type = "button";
    const tx = el("div"); tx.style.cssText = "flex:1;min-width:0;text-align:left";
    tx.appendChild(el("div", "qtitle", f.title));
    const sub = f.id === "plan" ? vt("Voor week ", "For week ") + isoWeek(planWeekStart(wfWeek)) + vt(" · in te vullen op zondag", " · fill in on Sunday")
      : f.id === "upd" ? vt("Over deze week · in te vullen op zondag", "About this week · fill in on Sunday") : vt("Voor dit weekend · in te vullen op woensdagavond", "For this weekend · fill in on Wednesday evening");
    const n = note(sub); n.style.margin = "2px 0 0"; tx.appendChild(n);
    const s = el("div", "wfst " + st.cls, st.t); tx.appendChild(s);
    c.appendChild(tx); const chv = el("div", "cnt"); chv.appendChild(icon("chevR", 20)); c.appendChild(chv);
    c.onclick = () => { wfOpen = f.id; planSel = null; planCopy = false; if(f.id === "plan") planDay = 0; renderWf(); window.scrollTo(0, 0); };
    box.appendChild(c);
  });
}

function renderWfForm(box){
  const f = WF_FORMS.find(x => x.id === wfOpen);
  const back = el("button", "linkbtn back", vt("Alle weekformulieren", "All weekly forms")); back.type = "button"; back.style.margin = "0 2px 10px";
  back.onclick = () => { wfOpen = ""; planSel = null; renderWf(); window.scrollTo(0, 0); };
  box.appendChild(back);
  const h = el("div", "sectionhead", f.title); h.style.marginTop = "0"; box.appendChild(h);
  const wk = wfWeek;
  const sub = f.id === "plan" ? "Week " + isoWeek(planWeekStart(wk)) + " · " + rangeLabel(planWeekStart(wk), addDaysKey(planWeekStart(wk), 6))
    : f.id === "upd" ? "Week " + isoWeek(wk) + " · " + rangeLabel(wk, addDaysKey(wk, 6))
    : "Weekend " + rangeLabel(addDaysKey(wk, 4), addDaysKey(wk, 6));
  const sn = note(sub); sn.style.margin = "-6px 2px 12px"; box.appendChild(sn);
  if(f.id === "plan") renderWfPlan(box, wk);
  else if(f.id === "upd") renderUpd(box, wk);
  else renderWv(box, wk);
  box.appendChild(wfExportCard(wk, f));
}
