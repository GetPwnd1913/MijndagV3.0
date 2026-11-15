// © 2026 Roy van Dalem. Alle rechten voorbehouden.

$("backupMake").onclick = async () => {
  const msg = $("backupMsg");
  msg.textContent = vt("Back-up maken…", "Making backup…");
  try{
    const map = await allDays();
    const days = Object.values(map).filter(bkTeBewaren).sort((a,b)=>a.date<b.date?-1:1);
    const data = JSON.stringify({app:"mijn-dag", versie:1, gemaakt:new Date().toISOString(), instellingen:settings, dagen:days}, null, 1);
    await offerFile(vt("Mijn dag back-up ", "My day backup ")+todayKey()+".json", data, "application/json");
    try{ localStorage.setItem(BK_LAST, todayKey()); localStorage.setItem(BK_TIJD, String(Date.now())); }catch(e){}
    bkTelWeg(); renderBackupReminder(); toast(vt("Back-up gemaakt", "Backup made"));
    msg.textContent = isEn() ? "Backup with "+aantal(days.length, "", "", "day", "days")+" made. Keep the file in a safe place, for example in iCloud Drive or your email." : "Back-up met "+days.length+(days.length===1?" dag":" dagen")+" gemaakt. Bewaar het bestand op een veilige plek, bijvoorbeeld in iCloud Drive of je mail.";
  }catch(err){
    msg.textContent = err && err.code==="declined" ? vt("Niet opgeslagen.", "Not saved.") : vt("Back-up maken lukte niet.", "Making the backup did not work.");
  }
};
$("backupRestore").onclick = () => $("backupFile").click();
$("backupFile").onchange = async ev => {
  const f = ev.target.files && ev.target.files[0]; ev.target.value = "";
  if(!f) return;
  const msg = $("backupMsg");
  const nietGelezen = () => {
    msg.textContent = vt("Dit bestand kon ik niet lezen. Kies een back-up van Mijn dag (een .json-bestand).", "I could not read this file. Choose a My day backup (a .json file).");
    toast(vt("Dit bestand is geen back-up van Mijn dag", "This file is not a My day backup"), true);
  };
  // eerst lezen en controleren, dan laten zien wat erin zit en pas na "Terugzetten" echt terugzetten
  let data = null;
  try{
    data = JSON.parse(await f.text());
    if(!data || data.app!=="mijn-dag" || !Array.isArray(data.dagen)) throw 0;
  }catch(err){ nietGelezen(); return; }
  const doorgaan = await confirmDialog(vt("Back-up terugzetten?", "Restore this backup?"), bkVoorbeeld(data), vt("Terugzetten", "Restore"), true);
  if(!doorgaan) return;
  try{
    const map = await allDays();
    let added = 0, kept = 0;
    for(const e of data.dagen){
      if(!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.date||"")) continue;
      const cur = map[e.date];
      if(cur && bkTeBewaren(cur) && (cur.updated||0) >= (e.updated||0)){ kept++; continue; }
      const clean = {date:e.date, answers:e.answers||{}, cijfer:e.cijfer||"", planDone:e.planDone||{}, updated:e.updated||Date.now()};
      if(e.ochtend) clean.ochtend = e.ochtend;   // ochtendmoment (alleen als het er is; oude back-ups hebben het niet)
      local.set("day:"+clean.date, clean);
      if(col){ try{ await col.doc(clean.date).set(clean); }catch(err){} }
      added++;
    }
    let inst = "";   // "" = niets, "alles" = leeg toestel, "aangevuld" = ontbrekende onderdelen bijgezet
    const taalVoor = settings.taal || "nl";
    if(data.instellingen && typeof data.instellingen === "object"){
      if(!(settings.naam || settings.since)){
        settings = Object.assign({naam:"",since:"",mail:""}, data.instellingen, {updated:Date.now()}); inst = "alles";
      } else {
        const r = vulInstellingenAan(settings, data.instellingen);
        if(r.aangevuld){ settings = Object.assign(r.uit, {updated:Date.now()}); inst = "aangevuld"; }
      }
      if(inst){
        local.set("settings", settings);
        if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(err){} }
      }
    }
    msg.textContent = isEn() ? aantal(added, "", "", "day", "days")+" restored."+(kept? " "+aantal(kept, "", "", "day was", "days were")+" already there in a newer version and "+(kept===1?"was":"were")+" not overwritten." : "")
      : added+(added===1?" dag":" dagen")+" teruggezet."+(kept? " "+kept+" "+(kept===1?"dag stond er al in een nieuwere versie en is":"dagen stonden er al in een nieuwere versie en zijn")+" niet overschreven." : "");
    if(inst === "alles") msg.textContent += vt(" Je instellingen (zoals noodplan, weekformulieren en weekdoelen) zijn ook teruggezet.", " Your settings (such as emergency plan, weekly forms and weekly goals) were restored too.");
    if(inst === "aangevuld") msg.textContent += vt(" Ontbrekende instellingen (zoals noodplan, weekformulieren en weekdoelen) zijn aangevuld; wat er al stond, is gebleven.", " Missing settings (such as emergency plan, weekly forms and weekly goals) were added; what was already there was kept.");
    entry = local.get("day:"+curKey) || entry;
    render(); renderHistory();
    if((settings.taal || "nl") !== taalVoor && typeof hertekenAlles === "function") hertekenAlles();
    // de teruggezette back-up telt als laatste back-up (anders herinnert de app je meteen weer)
    const bkDatum = /^\d{4}-\d{2}-\d{2}/.test(data.gemaakt || "") ? data.gemaakt.slice(0, 10) : "";
    if(bkDatum){
      try{
        const oud = localStorage.getItem(BK_LAST) || ""; if(bkDatum > oud) localStorage.setItem(BK_LAST, bkDatum);
        const tijd = Date.parse(data.gemaakt) || 0; if(tijd > (+localStorage.getItem(BK_TIJD) || 0)) localStorage.setItem(BK_TIJD, String(tijd));
      }catch(e){}
      bkTelWeg(); renderBackupReminder();
    }
    toast(vt("Back-up teruggezet", "Backup restored"));
  }catch(err){ nietGelezen(); }
};
// Instellingen uit een back-up aanvullen zonder iets te overschrijven: lege onderdelen krijgen de waarde uit de back-up,
// en bij lijsten per week (weekformulieren, weekdoelen) worden ontbrekende weken toegevoegd. Het dataformaat blijft gelijk.
function vulInstellingenAan(huidig, backup){
  const leeg = v => v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
  const object = v => !!v && typeof v === "object" && !Array.isArray(v);
  const kopie = v => JSON.parse(JSON.stringify(v));
  const uit = Object.assign({}, huidig); let aangevuld = 0;
  Object.keys(backup || {}).forEach(k => {
    if(k === "updated") return;
    const b = backup[k], h = huidig[k];
    if(leeg(b)) return;
    if(leeg(h)){ uit[k] = kopie(b); aangevuld++; return; }
    if(object(h) && object(b)){
      const m = Object.assign({}, h); let n = 0;
      Object.keys(b).forEach(s => { if(leeg(m[s]) && !leeg(b[s])){ m[s] = kopie(b[s]); n++; } });
      if(n){ uit[k] = m; aangevuld++; }
    }
  });
  return {uit, aangevuld};
}

// Een dag hoort in de back-up als er iets is ingevuld: de dagbeschouwing of het cijfer, het ochtendmoment
// of een afgevinkte planning (vroeger telden alleen de eerste twee, dan ging een dag met alleen een ochtend niet mee).
function bkTeBewaren(e){
  if(!e || !e.date) return false;
  if(hasContent(e)) return true;
  const o = e.ochtend;
  if(o && typeof o === "object" && Object.keys(o).some(k => k !== "tijd" && o[k] !== "" && o[k] != null && !(Array.isArray(o[k]) && !o[k].length))) return true;
  return Object.values(e.planDone || {}).some(Boolean);
}
// "Back-up van 14 november 2026: 39 dagen (3 oktober 2026 t/m 14 november 2026). Terugzetten?"
function bkVoorbeeld(data){
  const datum = d => d.toLocaleDateString(locale(), {day: "numeric", month: "long", year: "numeric"});
  const datums = data.dagen.map(e => e && e.date).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k || "")).sort();
  const gemaakt = data.gemaakt && !isNaN(Date.parse(data.gemaakt)) ? new Date(data.gemaakt) : null;
  let t = gemaakt ? vt("Back-up van ", "Backup from ") + datum(gemaakt) + ": " : vt("Back-up: ", "Backup: ");
  if(!datums.length) t += vt("geen dagen", "no days");
  else {
    t += aantal(datums.length, "dag", "dagen", "day", "days") + " (" + datum(parseKey(datums[0]));
    if(datums.length > 1) t += vt(" t/m ", " to ") + datum(parseKey(datums[datums.length - 1]));
    t += ")";
  }
  return t + ". " + vt("Terugzetten? Dagen die hier al in een nieuwere versie staan, worden niet overschreven.",
                        "Restore it? Days that are already here in a newer version will not be overwritten.");
}

// ---------- back-upherinnering: om de ~10 dagen op zondag, of eerder als er veel nieuwe dagen zijn ----------
const BK_LAST = "dagbeschouwing:lastBackup", BK_HIDE = "dagbeschouwing:backupHide";
const BK_TIJD = "dagbeschouwing:lastBackupTijd";   // tijdstip (ms) van de laatste back-up, om nieuwe/gewijzigde dagen te tellen
const BK_VEEL = 7;                                  // zoveel nieuwe of gewijzigde dagen: dan meteen herinneren
let bkTelling = null;                                // {n, tot}: kort onthouden, render() draait vaak
function bkTelWeg(){ bkTelling = null; }
// aantal dagen dat nieuw of gewijzigd is sinds de laatste back-up (veld "updated" van de dagen)
function bkNieuweDagen(){
  if(bkTelling && Date.now() < bkTelling.tot) return bkTelling.n;
  let t = 0, last = "";
  try{ t = +localStorage.getItem(BK_TIJD) || 0; last = localStorage.getItem(BK_LAST) || ""; }catch(e){}
  if(!t && last) t = parseKey(last).getTime() + 86400000;   // oudere back-up: alleen de datum bekend, dus vanaf het eind van die dag
  const n = local.days().filter(e => bkTeBewaren(e) && (!t || (e.updated || 0) > t)).length;
  bkTelling = {n, tot: Date.now() + 3000};
  return n;
}
function backupDue(){
  let last = ""; try{ last = localStorage.getItem(BK_LAST) || ""; }catch(e){}
  const nieuw = bkNieuweDagen();
  if(!last) return {due: true, last: "", nieuw};
  let k = addDaysKey(last, 10);
  while(parseKey(k).getDay() !== 0) k = addDaysKey(k, 1);   // eerstvolgende zondag
  return {due: todayKey() >= k || nieuw >= BK_VEEL, last: last, next: k, nieuw};
}
function renderBackupReminder(){
  const st = backupDue(), tk = todayKey();
  const daysAgo = st.last ? Math.round((parseKey(tk) - parseKey(st.last)) / 86400000) : 0;
  const agoTxt = daysAgo === 0 ? vt("vandaag", "today") : daysAgo === 1 ? vt("1 dag geleden", "1 day ago") : daysAgo + vt(" dagen geleden", " days ago");
  const dot = $("backupDot"); if(dot) dot.classList.toggle("hidden", !st.due);
  const lastEl = $("backupLast");
  const nieuwTxt = st.last ? (st.nieuw ? aantal(st.nieuw, "nieuwe of gewijzigde dag", "nieuwe of gewijzigde dagen", "new or changed day", "new or changed days") + vt(" sinds je laatste back-up.", " since your last backup.")
                                        : vt("Sinds je laatste back-up is er geen dag nieuw of gewijzigd.", "No days are new or changed since your last backup."))
                           : (st.nieuw ? aantal(st.nieuw, "dag staat", "dagen staan", "day has", "days have") + vt(" nog niet in een back-up.", " not been saved in a backup yet.") : "");
  if(lastEl) lastEl.textContent = (st.last ? vt("Laatste back-up: " + longDay(st.last).toLowerCase(), "Last backup: " + longDay(st.last)) + " (" + agoTxt + ")." : vt("Je hebt nog geen back-up gemaakt.", "You have not made a backup yet.")) + (nieuwTxt ? " " + nieuwTxt : "");
  const card = $("backupBanner"); if(!card) return;
  card.innerHTML = "";
  let hid = ""; try{ hid = localStorage.getItem(BK_HIDE) || ""; }catch(e){}
  const on = st.due && hid !== tk && curKey === tk;
  card.classList.toggle("hidden", !on);
  if(!on) return;
  card.style.cssText = "background:var(--warm-soft);border-color:transparent";
  const head = el("div"); head.style.cssText = "display:flex;gap:10px;align-items:flex-start";
  const t = el("div"); t.style.flex = "1";
  t.appendChild(el("div", "qtitle", vt("Tijd voor een back-up", "Time for a backup")));
  const sinds = !st.nieuw ? "" : st.last ? vt(" Sindsdien: ", " Since then: ") + aantal(st.nieuw, "nieuwe of gewijzigde dag", "nieuwe of gewijzigde dagen", "new or changed day", "new or changed days") + "." : " " + nieuwTxt;
  const n = note(isEn() ? (st.last ? "Your last backup was " + agoTxt + "." : "You have not made a backup yet.") + sinds + " Make one now, so your days stay safe." : (st.last ? "Je laatste back-up is " + agoTxt + "." : "Je hebt nog geen back-up gemaakt.") + sinds + " Maak er even een, zodat je dagen veilig bewaard blijven.");
  n.style.cssText = "margin-top:2px;font-size:calc(14px*var(--ts))"; t.appendChild(n);
  head.appendChild(t);
  const x = el("button", "xbtn"); x.appendChild(icon("x", 18)); x.type = "button"; x.setAttribute("aria-label", vt("Verbergen tot morgen", "Hide until tomorrow"));
  x.onclick = () => { try{ localStorage.setItem(BK_HIDE, tk); }catch(e){} renderBackupReminder(); };
  head.appendChild(x); card.appendChild(head);
  const b = el("button", "primary", vt("Back-up maken", "Make a backup")); b.type = "button"; b.style.cssText = "margin-top:12px;background:var(--warm-knop);border-color:var(--warm-knop);color:var(--op-warm)";
  b.onclick = () => $("backupMake").click();
  card.appendChild(b);
}
