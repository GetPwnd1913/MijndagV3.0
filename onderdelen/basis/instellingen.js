// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- kleur ----------
const THEMES = [["groen","Groen","#2f6f62","Green"],["blauw","Blauw","#2f5f9e","Blue"],["paars","Paars","#6a4c9c","Purple"],["petrol","Petrol","#1f6f80","Teal"],["roze","Roze","#a8437a","Pink"],["antraciet","Antraciet","#3d4a52","Charcoal"]];
let pickTheme = null;
function applyTheme(t){
  const th = THEMES.find(x => x[0] === t) || THEMES[0];
  document.documentElement.dataset.theme = th[0];
  zetThemaKleur();
}

// ---------- weergave: automatisch (volgt het toestel), licht of donker ----------
// settings.modus = "auto" | "licht" | "donker"; ontbreekt het, dan is het "auto". De keuze staat als data-modus op <html>;
// html[data-donker] betekent "nu donker" (bij "auto" volgens het toestel) en daar hangen alle donkere kleuren in app.css aan.
const MODI = [["auto", "Automatisch", "Automatic"], ["licht", "Licht", "Light"], ["donker", "Donker", "Dark"]];
const MODUS_MQ = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
let pickModus = null;
const modusNaam = m => { const x = MODI.find(y => y[0] === (m || "auto")) || MODI[0]; return vt(x[1], x[2]); };
function pasModusToe(m){
  const keuze = MODI.some(x => x[0] === m) ? m : "auto", h = document.documentElement;
  const donker = keuze === "donker" || (keuze === "auto" && !!(MODUS_MQ && MODUS_MQ.matches));
  if(keuze === "auto") h.removeAttribute("data-modus"); else h.setAttribute("data-modus", keuze);
  if(donker) h.setAttribute("data-donker", ""); else h.removeAttribute("data-donker");
  if(typeof zetLaag === "function") zetLaag();
  zetThemaKleur();
}
// kleur van de balk bovenin de telefoon: licht = de themakleur (zoals altijd), donker = de donkere achtergrond
function zetThemaKleur(){
  const m = document.querySelector('meta[name="theme-color"]'); if(!m) return;
  const th = THEMES.find(x => x[0] === document.documentElement.dataset.theme) || THEMES[0];
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  m.content = document.documentElement.hasAttribute("data-donker") && bg ? bg : th[2];
}
// toestel wisselt tussen licht en donker: bij "Automatisch" meteen meedoen
if(MODUS_MQ){
  const opnieuw = () => pasModusToe(pickModus !== null ? pickModus : settings.modus);
  if(MODUS_MQ.addEventListener) MODUS_MQ.addEventListener("change", opnieuw); else if(MODUS_MQ.addListener) MODUS_MQ.addListener(opnieuw);
}
function drawModus(){
  const w = $("setModus"); w.innerHTML = "";
  const nu = pickModus || settings.modus || "auto";
  MODI.forEach(([k, nl, en]) => {
    const b = el("button", nu === k ? "on" : null, vt(nl, en)); b.type = "button";
    b.setAttribute("aria-pressed", nu === k ? "true" : "false");
    b.onclick = () => { pickModus = k; pasModusToe(k); drawModus(); };
    w.appendChild(b);
  });
}
// ---------- tekstgrootte: Normaal / Groot / Extra groot ----------
// settings.tekstgrootte = "normaal" | "groot" | "extra"; ontbreekt het, dan "normaal". Staat als data-tekst op <html>;
// in app.css zijn alle lettergroottes calc(…px*var(--ts)), en data-tekst zet --ts op 1 / 1.15 / 1.3.
const TEKSTGROOTTES = [["normaal", "Normaal", "Normal"], ["groot", "Groot", "Large"], ["extra", "Extra groot", "Extra large"]];
let pickTekst = null;
function pasTekstToe(t){
  const h = document.documentElement;
  if(t === "groot" || t === "extra") h.setAttribute("data-tekst", t); else h.removeAttribute("data-tekst");
  if(typeof pasTitelAan === "function") pasTitelAan();
}
function drawTekst(){
  const w = $("setTekst"); w.innerHTML = "";
  const nu = pickTekst || settings.tekstgrootte || "normaal";
  TEKSTGROOTTES.forEach(([k, nl, en]) => {
    const b = el("button", nu === k ? "on" : null, vt(nl, en)); b.type = "button";
    b.setAttribute("aria-pressed", nu === k ? "true" : "false");
    b.onclick = () => { pickTekst = k; pasTekstToe(k); drawTekst(); };
    w.appendChild(b);
  });
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
    b.onclick = () => { settings.taal = k; pasTaalToe(); drawTaal(); drawSwatches(); drawModus(); drawTekst(); tekenPinInstelling(); };
    w.appendChild(b);
  });
}
function closeSettings(){
  applyTheme(settings.theme);
  pickModus = null; pasModusToe(settings.modus);
  pickTekst = null; pasTekstToe(settings.tekstgrootte);
  if(taalVoorInstellingen !== null && (settings.taal || "nl") !== taalVoorInstellingen){ settings.taal = taalVoorInstellingen; pasTaalToe(); }
  taalVoorInstellingen = null;
  $("setOverlay").classList.remove("show");
}

// ---------- settings ----------
$("openSettings").onclick = () => {
  $("setNaam").value = settings.naam||""; $("setSince").value = settings.since||""; $("setMail").value = settings.mail||""; if($("setWeer")) $("setWeer").checked = !!settings.weerLucht; pickTheme = settings.theme || "groen";
  taalVoorInstellingen = settings.taal || "nl";
  pickModus = settings.modus || "auto";
  pickTekst = settings.tekstgrootte || "normaal";
  drawSwatches(); drawTaal(); drawModus(); drawTekst(); tekenPinInstelling();
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
  settings = Object.assign({}, settings, {naam:$("setNaam").value.trim(), since:$("setSince").value, mail:$("setMail").value.trim(), weerLucht: !!($("setWeer") && $("setWeer").checked), theme: pickTheme || settings.theme || "groen", modus: pickModus || settings.modus || "auto", tekstgrootte: pickTekst || settings.tekstgrootte || "normaal", updated:Date.now()});
  pickModus = null; pickTekst = null;
  local.set("settings", settings);
  $("setOverlay").classList.remove("show");
  render();
  if(andereTaal) hertekenAlles();
  if(typeof luchtWeer === "function"){ try{ localStorage.removeItem(WEER_KEY); }catch(e){} luchtWeer(); }
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
};
