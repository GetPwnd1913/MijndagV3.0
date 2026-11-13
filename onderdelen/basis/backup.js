// © 2026 Roy van Dalem. Alle rechten voorbehouden.

$("backupMake").onclick = async () => {
  const msg = $("backupMsg");
  msg.textContent = vt("Back-up maken…", "Making backup…");
  try{
    const map = await allDays();
    const days = Object.values(map).filter(hasContent).sort((a,b)=>a.date<b.date?-1:1);
    const data = JSON.stringify({app:"mijn-dag", versie:1, gemaakt:new Date().toISOString(), instellingen:settings, dagen:days}, null, 1);
    await offerFile(vt("Mijn dag back-up ", "My day backup ")+todayKey()+".json", data, "application/json");
    try{ localStorage.setItem(BK_LAST, todayKey()); }catch(e){}
    renderBackupReminder(); toast(vt("Back-up gemaakt", "Backup made"));
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
  try{
    const data = JSON.parse(await f.text());
    if(!data || data.app!=="mijn-dag" || !Array.isArray(data.dagen)) throw 0;
    const map = await allDays();
    let added = 0, kept = 0;
    for(const e of data.dagen){
      if(!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.date||"")) continue;
      const cur = map[e.date];
      if(cur && hasContent(cur) && (cur.updated||0) >= (e.updated||0)){ kept++; continue; }
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
      : added+(added===1?" dag":" dagen")+" teruggezet."+(kept? " "+kept+" "+(kept===1?"dag stond":"dagen stonden")+" er al in een nieuwere versie en zijn niet overschreven." : "");
    if(inst === "alles") msg.textContent += vt(" Je instellingen (zoals noodplan, weekformulieren en weekdoelen) zijn ook teruggezet.", " Your settings (such as emergency plan, weekly forms and weekly goals) were restored too.");
    if(inst === "aangevuld") msg.textContent += vt(" Ontbrekende instellingen (zoals noodplan, weekformulieren en weekdoelen) zijn aangevuld; wat er al stond, is gebleven.", " Missing settings (such as emergency plan, weekly forms and weekly goals) were added; what was already there was kept.");
    entry = local.get("day:"+curKey) || entry;
    render(); renderHistory();
    if((settings.taal || "nl") !== taalVoor && typeof hertekenAlles === "function") hertekenAlles();
    // de teruggezette back-up telt als laatste back-up (anders herinnert de app je meteen weer)
    const bkDatum = /^\d{4}-\d{2}-\d{2}/.test(data.gemaakt || "") ? data.gemaakt.slice(0, 10) : "";
    if(bkDatum){ try{ const oud = localStorage.getItem(BK_LAST) || ""; if(bkDatum > oud) localStorage.setItem(BK_LAST, bkDatum); }catch(e){} renderBackupReminder(); }
    toast(vt("Back-up teruggezet", "Backup restored"));
  }catch(err){
    msg.textContent = vt("Dit bestand kon ik niet lezen. Kies een back-up van Mijn dag (een .json-bestand).", "I could not read this file. Choose a My day backup (a .json file).");
    toast(vt("Dit bestand is geen back-up van Mijn dag", "This file is not a My day backup"), true);
  }
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

// ---------- back-upherinnering: om de 2 weken op zondag ----------
const BK_LAST = "dagbeschouwing:lastBackup", BK_HIDE = "dagbeschouwing:backupHide";
function backupDue(){
  let last = ""; try{ last = localStorage.getItem(BK_LAST) || ""; }catch(e){}
  if(!last) return {due: true, last: ""};
  let k = addDaysKey(last, 10);
  while(parseKey(k).getDay() !== 0) k = addDaysKey(k, 1);   // eerstvolgende zondag
  return {due: todayKey() >= k, last: last, next: k};
}
function renderBackupReminder(){
  const st = backupDue(), tk = todayKey();
  const daysAgo = st.last ? Math.round((parseKey(tk) - parseKey(st.last)) / 86400000) : 0;
  const agoTxt = daysAgo === 0 ? vt("vandaag", "today") : daysAgo === 1 ? vt("1 dag geleden", "1 day ago") : daysAgo + vt(" dagen geleden", " days ago");
  const dot = $("backupDot"); if(dot) dot.classList.toggle("hidden", !st.due);
  const lastEl = $("backupLast");
  if(lastEl) lastEl.textContent = st.last ? vt("Laatste back-up: " + longDay(st.last).toLowerCase(), "Last backup: " + longDay(st.last)) + " (" + agoTxt + ")" : vt("Je hebt nog geen back-up gemaakt.", "You have not made a backup yet.");
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
  const n = note(isEn() ? (st.last ? "Your last backup was " + agoTxt + "." : "You have not made a backup yet.") + " Make one now, so your days stay safe." : (st.last ? "Je laatste back-up is " + agoTxt + "." : "Je hebt nog geen back-up gemaakt.") + " Maak er even een, zodat je dagen veilig bewaard blijven.");
  n.style.cssText = "margin-top:2px;font-size:14px"; t.appendChild(n);
  head.appendChild(t);
  const x = el("button", "xbtn"); x.appendChild(icon("x", 18)); x.type = "button"; x.setAttribute("aria-label", vt("Verbergen tot morgen", "Hide until tomorrow"));
  x.onclick = () => { try{ localStorage.setItem(BK_HIDE, tk); }catch(e){} renderBackupReminder(); };
  head.appendChild(x); card.appendChild(head);
  const b = el("button", "primary", vt("Back-up maken", "Make a backup")); b.type = "button"; b.style.cssText = "margin-top:12px;background:var(--warm);border-color:var(--warm)";
  b.onclick = () => $("backupMake").click();
  card.appendChild(b);
}
