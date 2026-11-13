// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- kleur ----------
const THEMES = [["groen","Groen","#2f6f62","Green"],["blauw","Blauw","#2f5f9e","Blue"],["paars","Paars","#6a4c9c","Purple"],["petrol","Petrol","#1f6f80","Teal"],["roze","Roze","#a8437a","Pink"],["antraciet","Antraciet","#3d4a52","Charcoal"]];
let pickTheme = null;
function applyTheme(t){
  const th = THEMES.find(x => x[0] === t) || THEMES[0];
  document.documentElement.dataset.theme = th[0];
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.content = th[2];
}
function drawSwatches(){
  const w = $("setTheme"); w.innerHTML = "";
  THEMES.forEach(([k, lnl, c, len]) => {
    const l = vt(lnl, len);
    const wrap = el("div", "swwrap" + (pickTheme === k ? " on" : ""));
    const b = el("button", "swatch" + (pickTheme === k ? " on" : "")); b.type = "button"; b.style.setProperty("--sw", c); b.setAttribute("aria-label", l);
    b.onclick = () => { pickTheme = k; applyTheme(k); drawSwatches(); };
    wrap.appendChild(b); wrap.appendChild(el("span", null, l)); w.appendChild(wrap);
  });
}

// ---------- taal ----------
// Tikken laat de nieuwe taal meteen zien in dit venster; Annuleren zet hem terug, Opslaan tekent de hele app opnieuw.
let taalVoorInstellingen = null;
function drawTaal(){
  const w = $("setTaal"); w.innerHTML = "";
  [["nl", "Nederlands"], ["en", "English"]].forEach(([k, l]) => {
    const b = el("button", (settings.taal || "nl") === k ? "on" : null, l); b.type = "button";
    b.onclick = () => { settings.taal = k; pasTaalToe(); drawTaal(); drawSwatches(); };
    w.appendChild(b);
  });
}
function closeSettings(){
  applyTheme(settings.theme);
  if(taalVoorInstellingen !== null && (settings.taal || "nl") !== taalVoorInstellingen){ settings.taal = taalVoorInstellingen; pasTaalToe(); }
  taalVoorInstellingen = null;
  $("setOverlay").classList.remove("show");
}

// ---------- settings ----------
$("openSettings").onclick = () => {
  $("setNaam").value = settings.naam||""; $("setSince").value = settings.since||""; $("setMail").value = settings.mail||""; pickTheme = settings.theme || "groen";
  taalVoorInstellingen = settings.taal || "nl";
  drawSwatches(); drawTaal();
  $("setOverlay").classList.add("show");
};
$("setCancel").onclick = closeSettings;
$("setBackup").onclick = () => { closeSettings(); showView("backup"); };
// alles verwijderen: waarschuwing met de keuze om eerst een back-up te maken, daarna een tweede bevestiging
$("setWissen").onclick = async () => {
  const ca = !!(window.claude && window.claude.use);
  const keuze = await confirmDialog(vt("Alles verwijderen?", "Delete everything?"),
    ca ? vt("Al je dagen, je instellingen, je noodplan, weekformulieren, weekdoelen en keytags worden gewist, op dit toestel én in je claude.ai-account. Dit kan niet ongedaan worden gemaakt. Wil je iets bewaren? Maak dan eerst een back-up.",
            "All your days, your settings, your emergency plan, weekly forms, weekly goals and keytags will be deleted, on this device and in your claude.ai account. This cannot be undone. Want to keep anything? Make a backup first.")
       : vt("Al je dagen, je instellingen, je noodplan, weekformulieren, weekdoelen en keytags worden van dit toestel gewist. Dit kan niet ongedaan worden gemaakt. Wil je iets bewaren? Maak dan eerst een back-up.",
            "All your days, your settings, your emergency plan, weekly forms, weekly goals and keytags will be deleted from this device. This cannot be undone. Want to keep anything? Make a backup first."),
    vt("Verder", "Continue"), false, {label: vt("Eerst een back-up maken", "Make a backup first"), waarde: "backup"});
  if(keuze === "backup"){ closeSettings(); showView("backup"); $("backupMake").click(); return; }
  if(!keuze) return;
  const zeker = await confirmDialog(vt("Echt alles verwijderen?", "Really delete everything?"),
    vt("Dit is de laatste stap. Daarna is alles weg en begint de app helemaal leeg.", "This is the last step. After this everything is gone and the app starts completely empty."),
    vt("Ja, alles verwijderen", "Yes, delete everything"));
  if(!zeker) return;
  closeSettings();
  const ok = await wisAlleGegevens();
  toast(ok ? vt("Alles is verwijderd", "Everything has been deleted") : vt("Niet alles kon worden verwijderd. Probeer het nog eens.", "Not everything could be deleted. Please try again."), !ok);
  // opnieuw laden: geen oude gegevens in het geheugen, de app begint leeg
  setTimeout(() => location.reload(), ok ? 1300 : 3000);
};
$("setSave").onclick = async () => {
  const andereTaal = taalVoorInstellingen !== null && (settings.taal || "nl") !== taalVoorInstellingen;
  taalVoorInstellingen = null;
  settings = Object.assign({}, settings, {naam:$("setNaam").value.trim(), since:$("setSince").value, mail:$("setMail").value.trim(), theme: pickTheme || settings.theme || "groen", updated:Date.now()});
  local.set("settings", settings);
  $("setOverlay").classList.remove("show");
  render();
  if(andereTaal) hertekenAlles();
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
};
