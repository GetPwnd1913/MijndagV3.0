// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- eigen lijsten: vaste knopjes verbergen en eigen knopjes toevoegen ----------
// Bewaard in settings.eigenLijsten = {triggers|omgaan|vooruit: {eigen: [tekst], verborgen: [nl-sleutel]}, meetings: {verborgen: [id]}}.
// Een ontbrekend veld werkt als een lege lijst, dus oude back-ups en dagen blijven gewoon werken.
// Eigen knopjes zijn één tekst (geen vertaling) en worden in beide talen hetzelfde getoond.
// Vaste knopjes worden nooit verwijderd, alleen verborgen. Wat al in een dag staat, blijft daar staan.
const EIGEN_MAX = 60;
const EIGEN_LIJST_DEF = [
  {naam: "triggers", titel: ["Triggers", "Triggers"], uitleg: ["Bij de dagbeschouwing (vraag 6) en de weekendvoorbespreking.", "In the daily reflection (question 6) and the weekend plan."], vast: () => TRIGGERS, en: () => TRIGGERS_EN},
  {naam: "omgaan", titel: ["Omgaan met triggers en cravings", "Dealing with triggers and cravings"], uitleg: ["Wat je hebt gedaan, bij de dagbeschouwing (vraag 5 en 6).", "What you did, in the daily reflection (questions 5 and 6)."], vast: () => COPING, en: () => COPING_EN},
  {naam: "vooruit", titel: ["Omgaan met triggers (vooruitkijkend)", "Dealing with triggers (looking ahead)"], uitleg: ["Wat je gaat doen, bij de weekendvoorbespreking.", "What you will do, in the weekend plan."], vast: () => WV_COPING, en: () => WV_COPING_EN}
];

// ---- gegevens ----
function lijstData(naam){
  const l = (settings.eigenLijsten || {})[naam] || {};
  const tekst = a => Array.isArray(a) ? a.filter(x => typeof x === "string" && x.trim()) : [];
  return {eigen: tekst(l.eigen), verborgen: tekst(l.verborgen)};
}
const lijstEigen = naam => lijstData(naam).eigen;
const lijstVerborgen = naam => lijstData(naam).verborgen;
// welke lijst hoort bij een rij van de vragenlijst (op basis van de vaste lijst die de rij gebruikt)
function lijstVanRij(row){
  if(!row) return null;
  if(row.items === TRIGGERS) return "triggers";
  if(row.items === COPING) return "omgaan";
  return null;
}
// voor de voorbespreking: zichtbare vaste knopjes in de gekozen taal + eigen knopjes
function lijstVoorWeek(naam){
  const def = EIGEN_LIJST_DEF.find(d => d.naam === naam); if(!def) return [];
  const nl = def.vast(), en = def.en(), weg = lijstVerborgen(naam);
  const vast = nl.map((x, i) => weg.indexOf(x) >= 0 ? null : (isEn() ? en[i] || x : x)).filter(Boolean);
  const lc = vast.map(x => x.toLowerCase());
  return vast.concat(lijstEigen(naam).filter(x => lc.indexOf(x.toLowerCase()) < 0));
}
const meetingVerborgen = () => lijstVerborgen("meetings");
async function bewaarEigenLijst(naam, data){
  const alles = Object.assign({}, settings.eigenLijsten || {});
  alles[naam] = {eigen: data.eigen || [], verborgen: data.verborgen || []};
  settings = Object.assign({}, settings, {eigenLijsten: alles, updated: Date.now()});
  local.set("settings", settings);
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
}
// invoer netjes maken: geen komma's of dubbele punten (die gebruikt de app als scheidingsteken), geen dubbele spaties,
// eerste letter klein (zoals de vaste knopjes), behalve bij een afkorting zoals "NA" of "AA"
function eigenTekst(v){
  let t = String(v || "").replace(/[,:\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, EIGEN_MAX).trim();
  if(t.length > 1 && t.charAt(1) !== t.charAt(1).toUpperCase()) t = t.charAt(0).toLowerCase() + t.slice(1);
  return t;
}

// ---- scherm ----
let lijstOpen = {};
function openLijsten(){ renderLijsten(); $("lijstOverlay").classList.add("show"); $("lijstSheet").scrollTop = 0; }
function sluitLijsten(){
  $("lijstOverlay").classList.remove("show");
  // alles wat knopjes toont opnieuw tekenen
  render();
  if(typeof hertekenAlles === "function") hertekenAlles();
}
function renderLijsten(){
  const sh = $("lijstSheet");
  const terugFocus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.focus : "";
  sh.innerHTML = "";
  sh.appendChild(el("h2", null, vt("Eigen lijsten", "Own lists")));
  sh.appendChild(el("p", "overtekst", vt("Vul de knopjes aan met je eigen woorden, of verberg vaste knopjes die niet bij je passen. Wat je al in een dag hebt gekozen, blijft daar altijd staan.",
    "Add your own words to the buttons, or hide fixed buttons that do not suit you. What you already chose in a day always stays there.")));
  EIGEN_LIJST_DEF.forEach(def => sh.appendChild(lijstVak(def)));
  sh.appendChild(meetingVak());
  const ok = el("button", "primary", vt("Klaar", "Done")); ok.type = "button"; ok.style.cssText = "width:100%;margin-top:16px"; ok.onclick = sluitLijsten; ok.dataset.focus = "klaar";
  sh.appendChild(ok);
  if(terugFocus){ const f = sh.querySelector('[data-focus="' + CSS.escape(terugFocus) + '"]'); if(f) f.focus(); }
}
function lijstVak(def){
  const data = lijstData(def.naam);
  const d = el("details", "overlic lijstvak"); d.open = !!lijstOpen[def.naam];
  d.addEventListener("toggle", () => { lijstOpen[def.naam] = d.open; });
  const s = el("summary"); s.appendChild(el("b", null, vt(def.titel[0], def.titel[1])));
  s.appendChild(el("span", "note", aantal(data.eigen.length, "eigen", "eigen", "own", "own") + " · " + data.verborgen.length + vt(" verborgen", " hidden")));
  d.appendChild(s);
  d.appendChild(el("div", "note", vt(def.uitleg[0], def.uitleg[1])));
  // toevoegen
  const lab = el("label", "label", vt("Eigen knopje toevoegen", "Add your own button"));
  const id = "eigenIn-" + def.naam; lab.htmlFor = id; d.appendChild(lab);
  const rij = el("div", "lijstrij");
  const inp = el("input"); inp.id = id; inp.maxLength = EIGEN_MAX; inp.autocomplete = "off"; inp.dataset.focus = "in-" + def.naam;
  inp.placeholder = def.naam === "triggers" ? vt("bijv. drukte op het werk", "e.g. busy at work") : def.naam === "omgaan" ? vt("bijv. mijn hond uitgelaten", "e.g. walked my dog") : vt("bijv. mijn hond uitlaten", "e.g. walk my dog");
  const knop = el("button", "ghost", vt("Toevoegen", "Add")); knop.type = "button"; knop.dataset.focus = "add-" + def.naam;
  const melding = el("div", "note lijstmelding"); melding.setAttribute("role", "status"); melding.setAttribute("aria-live", "polite");
  const voegToe = async () => {
    const t = eigenTekst(inp.value);
    if(!t){ melding.textContent = vt("Typ eerst een woord of zin.", "Type a word or phrase first."); inp.focus(); return; }
    const nu = lijstData(def.naam);
    const bestaand = def.vast().concat(def.en(), nu.eigen).map(x => x.toLowerCase());
    if(bestaand.indexOf(t.toLowerCase()) >= 0){
      const vastNl = def.vast().find((x, i) => x.toLowerCase() === t.toLowerCase() || (def.en()[i] || "").toLowerCase() === t.toLowerCase());
      if(vastNl && nu.verborgen.indexOf(vastNl) >= 0){ await bewaarEigenLijst(def.naam, {eigen: nu.eigen, verborgen: nu.verborgen.filter(x => x !== vastNl)}); lijstOpen[def.naam] = true; renderLijsten(); toast(vt("Dit vaste knopje staat weer aan", "This fixed button is shown again")); return; }
      melding.textContent = vt("Dit knopje staat al in de lijst.", "This button is already in the list."); inp.focus(); return;
    }
    await bewaarEigenLijst(def.naam, {eigen: nu.eigen.concat([t]), verborgen: nu.verborgen});
    lijstOpen[def.naam] = true; renderLijsten();
    const nieuw = $("eigenIn-" + def.naam); if(nieuw) nieuw.focus();
    toast(vt("Toegevoegd: ", "Added: ") + t);
  };
  knop.onclick = voegToe;
  inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); voegToe(); } };
  rij.appendChild(inp); rij.appendChild(knop); d.appendChild(rij); d.appendChild(melding);
  // eigen knopjes
  if(data.eigen.length){
    d.appendChild(el("div", "label", vt("Jouw eigen knopjes", "Your own buttons")));
    const ul = el("ul", "eigenlijst");
    data.eigen.forEach(t => {
      const li = el("li"); li.appendChild(el("span", null, t));
      const x = el("button", "xbtn"); x.type = "button"; x.appendChild(icon("x", 18)); x.dataset.focus = "del-" + def.naam + "-" + t;
      x.setAttribute("aria-label", vt("‘" + t + "’ verwijderen", "Remove ‘" + t + "’"));
      x.onclick = async () => { const nu = lijstData(def.naam); await bewaarEigenLijst(def.naam, {eigen: nu.eigen.filter(y => y !== t), verborgen: nu.verborgen}); renderLijsten(); toast(vt("Verwijderd: ", "Removed: ") + t); };
      li.appendChild(x); ul.appendChild(li);
    });
    d.appendChild(ul);
  }
  // vaste knopjes: verbergen en weer tonen
  d.appendChild(el("div", "label", vt("Vaste knopjes: tik om te verbergen of weer te tonen", "Fixed buttons: tap to hide or show again")));
  const chips = el("div", "chips");
  def.vast().forEach((nl, i) => {
    const zicht = data.verborgen.indexOf(nl) < 0;
    const tekst = isEn() ? (def.en()[i] || nl) : nl;
    const b = el("button", "chip vastchip" + (zicht ? " on" : " verborgen"), tekst); b.type = "button";
    b.setAttribute("aria-pressed", zicht ? "true" : "false"); b.dataset.focus = "vast-" + def.naam + "-" + i;
    b.title = zicht ? vt("Zichtbaar · tik om te verbergen", "Visible · tap to hide") : vt("Verborgen · tik om weer te tonen", "Hidden · tap to show again");
    b.onclick = async () => {
      const nu = lijstData(def.naam);
      const verborgen = nu.verborgen.indexOf(nl) >= 0 ? nu.verborgen.filter(x => x !== nl) : nu.verborgen.concat([nl]);
      await bewaarEigenLijst(def.naam, {eigen: nu.eigen, verborgen}); renderLijsten();
    };
    chips.appendChild(b);
  });
  d.appendChild(chips);
  return d;
}
function meetingVak(){
  const weg = meetingVerborgen();
  const d = el("details", "overlic lijstvak"); d.open = !!lijstOpen.meetings;
  d.addEventListener("toggle", () => { lijstOpen.meetings = d.open; });
  const s = el("summary"); s.appendChild(el("b", null, "Meetings"));
  const eigen = (settings.customMeetings || []).filter(m => m && m.id && typeof m.d === "number");
  s.appendChild(el("span", "note", aantal(eigen.length, "eigen", "eigen", "own", "own") + " · " + weg.length + vt(" verborgen", " hidden")));
  d.appendChild(s);
  d.appendChild(el("div", "note", vt("Een eigen meeting heeft een dag, tijd en plaats. Die voeg je toe op het scherm Meetings.", "Your own meeting has a day, time and place. You add it on the Meetings screen.")));
  const naar = el("button", "linkbtn more", vt("Eigen meeting toevoegen", "Add your own meeting")); naar.type = "button"; naar.dataset.focus = "meet-naar";
  naar.onclick = () => { $("lijstOverlay").classList.remove("show"); closeSettings(); meetForm = true; showView("meetings"); };
  d.appendChild(naar);
  const kort = isEn() ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["zo","ma","di","wo","do","vr","za"];
  const naam = m => kort[m.d] + " " + m.t + " · " + m.f + " " + m.city;
  if(eigen.length){
    d.appendChild(el("div", "label", vt("Jouw eigen meetings", "Your own meetings")));
    const ul = el("ul", "eigenlijst");
    eigen.slice().sort(meetSort).forEach(m => {
      const li = el("li"); li.appendChild(el("span", null, naam(m)));
      const x = el("button", "xbtn"); x.type = "button"; x.appendChild(icon("x", 18)); x.dataset.focus = "mdel-" + m.id;
      x.setAttribute("aria-label", vt("‘" + naam(m) + "’ verwijderen", "Remove ‘" + naam(m) + "’"));
      x.onclick = async () => {
        if(!(await confirmDialog(vt("Meeting weghalen?", "Remove meeting?"), naam(m) + vt(" verdwijnt uit je lijst.", " will be removed from your list."), vt("Weghalen", "Remove")))) return;
        settings = Object.assign({}, settings, {customMeetings: (settings.customMeetings || []).filter(y => y.id !== m.id), updated: Date.now()});
        local.set("settings", settings);
        if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
        renderLijsten();
      };
      li.appendChild(x); ul.appendChild(li);
    });
    d.appendChild(ul);
  }
  d.appendChild(el("div", "label", vt("Vaste meetings: tik om te verbergen of weer te tonen", "Fixed meetings: tap to hide or show again")));
  const chips = el("div", "chips");
  MEETINGS.slice().sort(meetSort).forEach(m => {
    const zicht = weg.indexOf(m.id) < 0;
    const b = el("button", "chip vastchip" + (zicht ? " on" : " verborgen"), naam(m)); b.type = "button";
    b.setAttribute("aria-pressed", zicht ? "true" : "false"); b.dataset.focus = "mvast-" + m.id;
    b.onclick = async () => {
      const nu = meetingVerborgen();
      await bewaarEigenLijst("meetings", {eigen: [], verborgen: nu.indexOf(m.id) >= 0 ? nu.filter(x => x !== m.id) : nu.concat([m.id])});
      renderLijsten();
    };
    chips.appendChild(b);
  });
  d.appendChild(chips);
  return d;
}
$("openLijsten").onclick = openLijsten;
$("lijstOverlay").onclick = e => { if(e.target === $("lijstOverlay")) sluitLijsten(); };
$("lijstOverlay").addEventListener("keydown", e => { if(e.key === "Escape"){ e.preventDefault(); sluitLijsten(); } });
