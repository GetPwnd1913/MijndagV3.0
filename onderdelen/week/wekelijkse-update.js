// ---------- wekelijkse update ----------
async function prefillUpd(wk){
  const map = await allDays(), dk = [0,1,2,3,4,5,6].map(i => addDaysKey(wk, i));
  const days = dk.map(k => map[k]).filter(Boolean);
  const short = k => ["zo","ma","di","wo","do","vr","za"][parseKey(k).getDay()] + " " + parseKey(k).getDate() + "/" + (parseKey(k).getMonth() + 1);
  const q4has = (e, item) => { const t = (e.answers && e.answers.q4 && e.answers.q4.text) || ""; return t.split("\n").some(l => l.trim().toLowerCase().startsWith("- " + item.toLowerCase())); };
  const u = wfGet(wk, "upd"), set = {}; let n = 0;
  const put = (k, v) => { if(v !== "" && v != null && !u[k]){ set[k] = v; n++; } };
  const meet = days.filter(e => meetingPlacesOf(e) !== null);
  if(meet.length){ put("meet_n", String(meet.length)); put("meet_txt", meet.map(e => { const p = meetingPlacesOf(e); return short(e.date) + (p.length ? " " + p.join(", ") : ""); }).join("; ")); }
  else if(days.length) put("meet_n", "0");
  const sp = days.filter(e => q4has(e, "mijn sponsor gebeld"));
  if(sp.length){ put("sp_yn", "ja"); put("sp_tel", sp.length + "x (" + sp.map(e => short(e.date)).join(", ") + ")"); }
  const sv = days.filter(e => q4has(e, "service gedaan"));
  if(sv.length) put("serv_txt", "Service gedaan op " + sv.map(e => short(e.date)).join(", "));
  const stp = days.filter(e => q4has(e, "aan mijn stappen gewerkt"));
  const st = settings.steps || {}; let cur = 0;
  for(let i = 1; i <= 12; i++){ if((st[i] || {}).status === "bezig"){ cur = i; break; } }
  if(!cur){ for(let i = 12; i >= 1; i--){ if((st[i] || {}).status === "klaar"){ cur = Math.min(12, i + 1); break; } } }
  if(cur) put("step_n", String(cur));
  if(stp.length) put("step_txt", stp.length + "x aan gewerkt (" + stp.map(e => short(e.date)).join(", ") + ")");
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
  const pre = wfCard("Vul in vanuit mijn week", "De app kijkt in je dagbeschouwingen van deze week (meetings, sponsor, service, stappenwerk, contact met fellows) en in je weekdoel. Alleen lege velden worden ingevuld. Controleer het daarna even.");
  const pb = el("button", "primary", "Vul in vanuit mijn week"); pb.type = "button"; pb.style.marginTop = "10px";
  const pm = note("");
  pb.onclick = async () => { pb.disabled = true; pm.textContent = "Bezig…"; const r = await prefillUpd(wk); renderWf._keep = true; renderWf(); toast(r.n ? r.n + (r.n === 1 ? " veld" : " velden") + " ingevuld. Kijk ze even na." : (r.days ? "Er was niets nieuws om in te vullen." : "Deze week zijn nog geen dagbeschouwingen ingevuld.")); };
  pm.id = "wfPreMsg"; pre.appendChild(pb); pre.appendChild(pm);
  box.appendChild(pre);
  const Q = (title, sub) => { const c = wfCard(title, sub); box.appendChild(c); return c; };
  const num = (wk2, key, label) => { const f = el("div", "wff"); f.appendChild(el("div", "label", label)); const i = el("input", "sosinp"); i.inputMode = "numeric"; i.style.maxWidth = "120px"; i.value = wfGet(wk2, "upd")[key] || ""; i.oninput = () => wfSet(wk2, "upd", key, i.value); f.appendChild(i); return f; };
  let c = Q("Hoeveel meetings heb je bijgewoond?");
  c.appendChild(num(wk, "meet_n", "Aantal")); c.appendChild(wfField(wk, "upd", "meet_txt", "Waar en wanneer?", "", true));
  c = Q("Hoe vaak heb je afgelopen week gesport, buiten het programma om?");
  c.appendChild(num(wk, "sport_n", "Aantal")); c.appendChild(wfField(wk, "upd", "sport_txt", "Wat heb je qua sport gedaan en wanneer?", "", true));
  c = Q("Heb je een servicepositie?");
  c.appendChild(num(wk, "serv_n", "Aantal")); c.appendChild(wfField(wk, "upd", "serv_txt", "Zo ja: hoeveel, welke, waar en wanneer?", "", true));
  c = Q("Heb je een sponsor?");
  c.appendChild(wfYN(wk, "upd", "sp_yn"));
  const spy = wfGet(wk, "upd").sp_yn;
  if(spy !== "nee"){
    const s = el("div", "label", "Hoe vaak heb je contact met je sponsor?"); s.style.marginTop = "14px"; c.appendChild(s);
    c.appendChild(wfField(wk, "upd", "sp_tel", "Telefonisch", "", true));
    c.appendChild(wfField(wk, "upd", "sp_afg", "Afgesproken", "", true));
    c.appendChild(wfField(wk, "upd", "sp_ov", "Overige contactmomenten of afspraken", "", true));
  }
  if(spy !== "ja") c.appendChild(wfField(wk, "upd", "sp_nee", "Zo nee, waarom niet?", "", true));
  c = Q("Bij welke stap ben je?");
  c.appendChild(num(wk, "step_n", "Stap")); c.appendChild(wfField(wk, "upd", "step_txt", "Hoe vaak, hoeveel en wanneer werk je aan je stappenwerk?", "", true));
  c = Q("Hoe vaak heb je contact met…", "Licht het contact kort toe.");
  [["c_fam","Familie"],["c_vri","Vrienden"],["c_par","Partner"],["c_mede","Medebewoners"],["c_fellow","Fellowship"]].forEach(([k, l]) => c.appendChild(wfField(wk, "upd", k, l, "", true)));
  [["prog","Heb je alle programmaonderdelen bijgewoond?","Zo nee: welke niet en de reden van afwezigheid", "nee"],
   ["budget","Ben je binnen je eigen budget gebleven?","Zo nee, licht toe", "nee"],
   ["vrijw","Heb je vrijwilligerswerk?","Zo ja: waar, hoeveel uur en welke dagen. Zo nee, licht toe", ""],
   ["dagb","Heb je verder dagbesteding?","Welke?", "ja"]].forEach(([k, t, l, show]) => {
    c = Q(t); c.appendChild(wfYN(wk, "upd", k + "_yn"));
    const v = wfGet(wk, "upd")[k + "_yn"];
    if(!show || v === show || wfGet(wk, "upd")[k + "_txt"]) c.appendChild(wfField(wk, "upd", k + "_txt", l, "", true));
  });
  c = Q("Wat is je doel deze week?");
  c.appendChild(wfField(wk, "upd", "doel", "", "", true));
  c.appendChild(wfYN(wk, "upd", "doel_yn", "Werk je aan dit doel?"));
  c.appendChild(wfField(wk, "upd", "doel_ja", "Zo ja, hoe?", "", true));
  c.appendChild(wfField(wk, "upd", "doel_nee", "Zo nee, waarom niet?", "", true));
  c = Q("Heb je jouw huishoudelijke taken (Safehouse) uitgevoerd?");
  c.appendChild(wfYN(wk, "upd", "huis_yn"));
  c.appendChild(wfField(wk, "upd", "huis_ja", "Ja:", "", true));
  c.appendChild(wfField(wk, "upd", "huis_nee", "Zo nee, waarom niet?", "", true));
  c = Q("Heb je ergens extra hulp bij nodig aankomende week?", "Tik aan waar je hulp bij wilt. De rest wordt 'nee'.");
  const hulp = wfGet(wk, "upd").hulp || {};
  const hr = el("div", "chips"); hr.style.marginTop = "10px";
  HULP.forEach(hn => {
    const b = el("button", "chip" + (hulp[hn] ? " on" : ""), hn); b.type = "button";
    b.onclick = () => { const h = Object.assign({}, wfGet(wk, "upd").hulp || {}); if(h[hn]) delete h[hn]; else h[hn] = 1; wfSet(wk, "upd", "hulp", h, true); b.classList.toggle("on"); };
    hr.appendChild(b);
  });
  c.appendChild(hr);
  c.appendChild(wfField(wk, "upd", "hulp_anders", "Anders:", "", true));
  c = Q("Heb je een verzoek aan het team?");
  c.appendChild(wfField(wk, "upd", "verzoek", "", "", true));
}
