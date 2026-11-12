// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- wekelijkse update ----------
async function prefillUpd(wk){
  const map = await allDays(), dk = [0,1,2,3,4,5,6].map(i => addDaysKey(wk, i));
  const days = dk.map(k => map[k]).filter(Boolean);
  const short = k => (isEn() ? ["Su","Mo","Tu","We","Th","Fr","Sa"] : ["zo","ma","di","wo","do","vr","za"])[parseKey(k).getDay()] + " " + parseKey(k).getDate() + "/" + (parseKey(k).getMonth() + 1);
  // telt in beide talen: een Nederlands en een Engels antwoord ("- Mijn sponsor gebeld" / "- Called my sponsor") tellen allebei
  const q4has = (e, item) => { const t = (e.answers && e.answers.q4 && e.answers.q4.text) || ""; return t.split("\n").some(l => itemVariants(item).some(v => l.trim().toLowerCase().startsWith("- " + v.toLowerCase()))); };
  const u = wfGet(wk, "upd"), set = {}; let n = 0;
  const put = (k, v) => { if(v !== "" && v != null && !u[k]){ set[k] = v; n++; } };
  const meet = days.filter(e => meetingPlacesOf(e) !== null);
  if(meet.length){ put("meet_n", String(meet.length)); put("meet_txt", meet.map(e => { const p = meetingPlacesOf(e); return short(e.date) + (p.length ? " " + p.join(", ") : ""); }).join("; ")); }
  else if(days.length) put("meet_n", "0");
  const sp = days.filter(e => q4has(e, "mijn sponsor gebeld"));
  if(sp.length){ put("sp_yn", "ja"); put("sp_tel", sp.length + "x (" + sp.map(e => short(e.date)).join(", ") + ")"); }
  const sv = days.filter(e => q4has(e, "service gedaan"));
  if(sv.length) put("serv_txt", vt("Service gedaan op ", "Did service on ") + sv.map(e => short(e.date)).join(", "));
  const stp = days.filter(e => q4has(e, "aan mijn stappen gewerkt"));
  const st = settings.steps || {}; let cur = 0;
  for(let i = 1; i <= 12; i++){ if((st[i] || {}).status === "bezig"){ cur = i; break; } }
  if(!cur){ for(let i = 12; i >= 1; i--){ if((st[i] || {}).status === "klaar"){ cur = Math.min(12, i + 1); break; } } }
  if(cur) put("step_n", String(cur));
  if(stp.length) put("step_txt", stp.length + vt("x aan gewerkt (", "x worked on (") + stp.map(e => short(e.date)).join(", ") + ")");
  const fel = days.filter(e => q4has(e, "contact gehad met iemand uit het programma"));
  if(fel.length) put("c_fellow", fel.length + "x contact (" + fel.map(e => short(e.date)).join(", ") + ")");
  const goals = weekData(wk).goals || [];
  if(goals.length){
    put("doel", goals.map(g => g.text).join("; "));
    const rf = weekData(wk).reflect || {};
    if(rf.how === "goed" || rf.how === "deels"){ put("doel_yn", "ja"); if(rf.text) put("doel_ja", rf.text); }
    else if(rf.how === "niet"){ put("doel_yn", "nee"); if(rf.text) put("doel_nee", rf.text); }
  }
  if(n){ const d = wfData(wk); d.upd = Object.assign({}, d.upd || {}, set); wfStore(wk, d); await saveSettingsNow(); }
  return {n, days: days.length};
}
function renderUpd(box, wk){
  const pre = wfCard(vt("Vul in vanuit mijn week", "Fill in from my week"), vt("De app kijkt in je dagbeschouwingen van deze week (meetings, sponsor, service, stappenwerk, contact met fellows) en in je weekdoel. Alleen lege velden worden ingevuld. Controleer het daarna even.", "The app looks at your daily reflections of this week (meetings, sponsor, service, step work, contact with fellows) and at your weekly goal. Only empty fields are filled in. Check it afterwards."));
  const pb = el("button", "primary", vt("Vul in vanuit mijn week", "Fill in from my week")); pb.type = "button"; pb.style.marginTop = "10px";
  const pm = note("");
  pb.onclick = async () => { pb.disabled = true; pm.textContent = vt("Bezig…", "Working…"); const r = await prefillUpd(wk); renderWf._keep = true; renderWf(); toast(r.n ? (isEn() ? aantal(r.n, "", "", "field", "fields") + " filled in. Please check them." : r.n + (r.n === 1 ? " veld" : " velden") + " ingevuld. Kijk ze even na.") : (r.days ? vt("Er was niets nieuws om in te vullen.", "There was nothing new to fill in.") : vt("Deze week zijn nog geen dagbeschouwingen ingevuld.", "No daily reflections have been filled in this week yet."))); };
  pm.id = "wfPreMsg"; pre.appendChild(pb); pre.appendChild(pm);
  box.appendChild(pre);
  const Q = (title, sub) => { const c = wfCard(title, sub); box.appendChild(c); return c; };
  const num = (wk2, key, label) => { const f = el("div", "wff"); f.appendChild(el("div", "label", label)); const i = el("input", "sosinp"); i.inputMode = "numeric"; i.style.maxWidth = "120px"; i.value = wfGet(wk2, "upd")[key] || ""; i.oninput = () => wfSet(wk2, "upd", key, i.value); f.appendChild(i); return f; };
  const aantalLbl = vt("Aantal", "Number");
  let c = Q(vt("Hoeveel meetings heb je bijgewoond?", "How many meetings did you attend?"));
  c.appendChild(num(wk, "meet_n", aantalLbl)); c.appendChild(wfField(wk, "upd", "meet_txt", vt("Waar en wanneer?", "Where and when?"), "", true));
  c = Q(vt("Hoe vaak heb je afgelopen week gesport, buiten het programma om?", "How often did you exercise last week, outside the programme?"));
  c.appendChild(num(wk, "sport_n", aantalLbl)); c.appendChild(wfField(wk, "upd", "sport_txt", vt("Wat heb je qua sport gedaan en wanneer?", "What exercise did you do and when?"), "", true));
  c = Q(vt("Heb je een servicepositie?", "Do you have a service position?"));
  c.appendChild(num(wk, "serv_n", aantalLbl)); c.appendChild(wfField(wk, "upd", "serv_txt", vt("Zo ja: hoeveel, welke, waar en wanneer?", "If so: how many, which, where and when?"), "", true));
  c = Q(vt("Heb je een sponsor?", "Do you have a sponsor?"));
  c.appendChild(wfYN(wk, "upd", "sp_yn"));
  const spy = wfGet(wk, "upd").sp_yn;
  if(spy !== "nee"){
    const s = el("div", "label", vt("Hoe vaak heb je contact met je sponsor?", "How often are you in contact with your sponsor?")); s.style.marginTop = "14px"; c.appendChild(s);
    c.appendChild(wfField(wk, "upd", "sp_tel", vt("Telefonisch", "By phone"), "", true));
    c.appendChild(wfField(wk, "upd", "sp_afg", vt("Afgesproken", "In person"), "", true));
    c.appendChild(wfField(wk, "upd", "sp_ov", vt("Overige contactmomenten of afspraken", "Other contact or appointments"), "", true));
  }
  if(spy !== "ja") c.appendChild(wfField(wk, "upd", "sp_nee", vt("Zo nee, waarom niet?", "If not, why not?"), "", true));
  c = Q(vt("Bij welke stap ben je?", "Which step are you on?"));
  c.appendChild(num(wk, "step_n", vt("Stap", "Step"))); c.appendChild(wfField(wk, "upd", "step_txt", vt("Hoe vaak, hoeveel en wanneer werk je aan je stappenwerk?", "How often, how much and when do you work on your step work?"), "", true));
  c = Q(vt("Hoe vaak heb je contact met…", "How often are you in contact with…"), vt("Licht het contact kort toe.", "Briefly explain the contact."));
  [["c_fam","Familie","Family"],["c_vri","Vrienden","Friends"],["c_par","Partner","Partner"],["c_mede","Medebewoners","Housemates"],["c_fellow","Fellowship","Fellowship"]].forEach(([k, l, len]) => c.appendChild(wfField(wk, "upd", k, vt(l, len), "", true)));
  [["prog",vt("Heb je alle programmaonderdelen bijgewoond?", "Did you attend all parts of the programme?"),vt("Zo nee: welke niet en de reden van afwezigheid", "If not: which not and the reason for absence"), "nee"],
   ["budget",vt("Ben je binnen je eigen budget gebleven?", "Did you stay within your own budget?"),vt("Zo nee, licht toe", "If not, explain"), "nee"],
   ["vrijw",vt("Heb je vrijwilligerswerk?", "Do you do volunteer work?"),vt("Zo ja: waar, hoeveel uur en welke dagen. Zo nee, licht toe", "If so: where, how many hours and which days. If not, explain"), ""],
   ["dagb",vt("Heb je verder dagbesteding?", "Do you have any other day activities?"),vt("Welke?", "Which?"), "ja"]].forEach(([k, t, l, show]) => {
    c = Q(t); c.appendChild(wfYN(wk, "upd", k + "_yn"));
    const v = wfGet(wk, "upd")[k + "_yn"];
    if(!show || v === show || wfGet(wk, "upd")[k + "_txt"]) c.appendChild(wfField(wk, "upd", k + "_txt", l, "", true));
  });
  c = Q(vt("Wat is je doel deze week?", "What is your goal this week?"));
  c.appendChild(wfField(wk, "upd", "doel", "", "", true));
  c.appendChild(wfYN(wk, "upd", "doel_yn", vt("Werk je aan dit doel?", "Are you working on this goal?")));
  c.appendChild(wfField(wk, "upd", "doel_ja", vt("Zo ja, hoe?", "If so, how?"), "", true));
  c.appendChild(wfField(wk, "upd", "doel_nee", vt("Zo nee, waarom niet?", "If not, why not?"), "", true));
  c = Q(vt("Heb je jouw huishoudelijke taken (Safehouse) uitgevoerd?", "Did you do your household chores (Safehouse)?"));
  c.appendChild(wfYN(wk, "upd", "huis_yn"));
  c.appendChild(wfField(wk, "upd", "huis_ja", vt("Ja:", "Yes:"), "", true));
  c.appendChild(wfField(wk, "upd", "huis_nee", vt("Zo nee, waarom niet?", "If not, why not?"), "", true));
  c = Q(vt("Heb je ergens extra hulp bij nodig aankomende week?", "Do you need extra help with anything in the coming week?"), vt("Tik aan waar je hulp bij wilt. De rest wordt 'nee'.", "Tap what you want help with. The rest will be 'no'."));
  const hulp = wfGet(wk, "upd").hulp || {};
  const hr = el("div", "chips"); hr.style.marginTop = "10px";
  // hn = Nederlandse sleutel (zo bewaard in u.hulp); de knop toont de naam in de gekozen taal
  HULP.forEach(hn => {
    const b = el("button", "chip" + (hulp[hn] ? " on" : ""), hulpNaam(hn)); b.type = "button";
    b.onclick = () => { const h = Object.assign({}, wfGet(wk, "upd").hulp || {}); if(h[hn]) delete h[hn]; else h[hn] = 1; wfSet(wk, "upd", "hulp", h, true); b.classList.toggle("on"); };
    hr.appendChild(b);
  });
  c.appendChild(hr);
  c.appendChild(wfField(wk, "upd", "hulp_anders", vt("Anders:", "Other:"), "", true));
  c = Q(vt("Heb je een verzoek aan het team?", "Do you have a request for the team?"));
  c.appendChild(wfField(wk, "upd", "verzoek", "", "", true));
}
