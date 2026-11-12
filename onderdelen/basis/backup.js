
$("backupMake").onclick = async () => {
  const msg = $("backupMsg");
  msg.textContent = "Back-up maken…";
  try{
    const map = await allDays();
    const days = Object.values(map).filter(hasContent).sort((a,b)=>a.date<b.date?-1:1);
    const data = JSON.stringify({app:"mijn-dag", versie:1, gemaakt:new Date().toISOString(), instellingen:settings, dagen:days}, null, 1);
    await offerFile("Mijn dag back-up "+todayKey()+".json", data, "application/json");
    try{ localStorage.setItem(BK_LAST, todayKey()); }catch(e){}
    renderBackupReminder(); toast("Back-up gemaakt");
    msg.textContent = "Back-up met "+days.length+(days.length===1?" dag":" dagen")+" gemaakt. Bewaar het bestand op een veilige plek, bijvoorbeeld in iCloud Drive of je mail.";
  }catch(err){
    msg.textContent = err && err.code==="declined" ? "Niet opgeslagen." : "Back-up maken lukte niet.";
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
      local.set("day:"+clean.date, clean);
      if(col){ try{ await col.doc(clean.date).set(clean); }catch(err){} }
      added++;
    }
    if(data.instellingen && !(settings.naam || settings.since)){
      settings = Object.assign({naam:"",since:"",mail:""}, data.instellingen, {updated:Date.now()});
      local.set("settings", settings);
      if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(err){} }
    }
    msg.textContent = added+(added===1?" dag":" dagen")+" teruggezet."+(kept? " "+kept+" "+(kept===1?"dag stond":"dagen stonden")+" er al in een nieuwere versie en zijn niet overschreven." : "");
    entry = local.get("day:"+curKey) || entry;
    render(); renderHistory();
  }catch(err){
    msg.textContent = "Dit bestand kon ik niet lezen. Kies een back-up van Mijn dag (een .json-bestand).";
  }
};

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
  const agoTxt = daysAgo === 0 ? "vandaag" : daysAgo === 1 ? "1 dag geleden" : daysAgo + " dagen geleden";
  const dot = $("backupDot"); if(dot) dot.classList.toggle("hidden", !st.due);
  const lastEl = $("backupLast");
  if(lastEl) lastEl.textContent = st.last ? "Laatste back-up: " + longDay(st.last).toLowerCase() + " (" + agoTxt + ")" : "Je hebt nog geen back-up gemaakt.";
  const card = $("backupBanner"); if(!card) return;
  card.innerHTML = "";
  let hid = ""; try{ hid = localStorage.getItem(BK_HIDE) || ""; }catch(e){}
  const on = st.due && hid !== tk && curKey === tk;
  card.classList.toggle("hidden", !on);
  if(!on) return;
  card.style.cssText = "background:var(--warm-soft);border-color:transparent";
  const head = el("div"); head.style.cssText = "display:flex;gap:10px;align-items:flex-start";
  const t = el("div"); t.style.flex = "1";
  t.appendChild(el("div", "qtitle", "Tijd voor een back-up"));
  const n = note((st.last ? "Je laatste back-up is " + agoTxt + "." : "Je hebt nog geen back-up gemaakt.") + " Maak er even een, zodat je dagen veilig bewaard blijven.");
  n.style.cssText = "margin-top:2px;font-size:14px"; t.appendChild(n);
  head.appendChild(t);
  const x = el("button", "xbtn"); x.appendChild(icon("x", 18)); x.type = "button"; x.setAttribute("aria-label", "Verbergen tot morgen");
  x.onclick = () => { try{ localStorage.setItem(BK_HIDE, tk); }catch(e){} renderBackupReminder(); };
  head.appendChild(x); card.appendChild(head);
  const b = el("button", "primary", "Back-up maken"); b.type = "button"; b.style.cssText = "margin-top:12px;background:var(--warm);border-color:var(--warm)";
  b.onclick = () => $("backupMake").click();
  card.appendChild(b);
}
