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
