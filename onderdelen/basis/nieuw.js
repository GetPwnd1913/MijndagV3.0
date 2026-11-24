// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- "Wat is er nieuw?" ----------
// Venster bij het openen van de app (en bij terugkomen na een half uur weg) met wat er nieuw is.
// Verschijnt elke keer, tot je "Niet meer laten zien" aanvinkt: dan staat settings.nieuwGezien = NIEUW_VERSIE.
// Bij een volgende update met nieuws: NIEUW_VERSIE en NIEUW_ITEMS aanpassen, dan komt het venster weer.
// Op een nieuw toestel komt eerst de uitleg (uitleg.js); dan niet ook nog dit venster.
const NIEUW_VERSIE = "2026-11-25";
const NIEUW_ITEMS = [
  {icoon: "gschema", kleur: "var(--accent)", naar: "werkboek",
   t: "Mijn werkboek", te: "My workbook",
   u: "Nieuw in het menu: zes opdrachten zoals je ze in de verslavingszorg meekrijgt. Terugvalpreventieplan, Nee zeggen, G-schema, Beslisbalans, Netwerkkaart en Plezierlijst. Je kunt ze downloaden als Word of PDF.",
   ue: "New in the menu: six assignments like the ones you get in addiction care. Relapse prevention plan, Saying no, ABC diary, Decision balance, Network map and Fun list. You can download them as Word or PDF."},
  {icoon: "terugval", kleur: "var(--tv-oranje)", naar: "sos",
   t: "Waar sta ik nu?", te: "Where am I right now?",
   u: "In het noodplan kies je groen, oranje of rood. Je ziet meteen hoe je het herkent, wat je moet doen en wie je kunt bellen.",
   ue: "In the emergency plan you choose green, orange or red. You see straight away how to recognise it, what to do and who to call."},
  {icoon: "plezier", kleur: "var(--warm)", naar: "sos",
   t: "Pot met mooie momenten", te: "Jar of good moments",
   u: "Schud de pot in je noodplan en lees terug waar je dankbaar en trots op was. Je eigen woorden, van je eigen goede dagen.",
   ue: "Shake the jar in your emergency plan and read back what you were grateful for and proud of. Your own words, from your own good days."},
  {icoon: "bell", kleur: "var(--tv-rood)", naar: null,
   t: "De app denkt mee", te: "The app thinks along",
   u: "Laat je dagbeschouwing zucht, triggers of een laag cijfer zien? Dan krijg je op het beginscherm een seintje, met een knop naar je plan.",
   ue: "Does your daily reflection show cravings, triggers or a low score? Then you get a gentle nudge on the home screen, with a button to your plan."},
  {icoon: "target", kleur: "var(--tv-groen)", naar: "patterns",
   t: "Waar stond ik?", te: "Where was I?",
   u: "In Mijn patronen zie je hoe vaak je groen, oranje of rood was, met bolletjes voor de laatste 4 weken.",
   ue: "In My patterns you see how often you were green, orange or red, with dots for the last 4 weeks."},
  {icoon: "star", kleur: "#e0a33a", naar: "today",
   t: "Meer keuzes in je dagbeschouwing", te: "More choices in your daily reflection",
   u: "Bij ‘Waarom dit cijfer?’ staan 19 nieuwe keuzes, verdeeld in wat de dag goed en wat de dag zwaar maakte. En bij een conflict, craving of trigger maak je met één tik een G-schema.",
   ue: "Under ‘Why this score?’ there are 19 new choices, split into what made the day good and what made it hard. And with a conflict, craving or trigger you can make an ABC diary in one tap."}
];
const nieuwNodig = () => settings.nieuwGezien !== NIEUW_VERSIE;
async function nieuwNietMeer(){
  settings = Object.assign({}, settings, {nieuwGezien: NIEUW_VERSIE, updated: Date.now()});
  local.set("settings", settings);
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
}
function nieuwIcoon(naam){
  if(typeof WB_ICONS !== "undefined" && WB_ICONS[naam]) return wbIcoon(naam, 22);
  const s = icon(naam, 22); return s;
}
let nieuwOpen = null;
function openNieuw(){
  if(nieuwOpen || (typeof uitlegOpen !== "undefined" && uitlegOpen)) return;
  const terugFocus = document.activeElement;
  const back = el("div", "dlgback nieuwback"); nieuwOpen = back;
  back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-labelledby", "nieuwTitel");
  const d = el("div", "dlg nieuwdlg"); d.tabIndex = -1; back.appendChild(d);
  const vink = el("input"); vink.type = "checkbox"; vink.id = "nieuwVink"; vink.checked = !nieuwNodig();
  const sluit = naar => {
    if(vink.checked) nieuwNietMeer();
    back.classList.remove("show"); document.removeEventListener("keydown", onKey);
    setTimeout(() => back.remove(), 200); nieuwOpen = null;
    if(naar) showView(naar);
    else if(terugFocus && terugFocus.focus) try{ terugFocus.focus({preventScroll: true}); }catch(e){}
  };
  const onKey = e => {
    if(e.key === "Escape"){ e.preventDefault(); sluit(); return; }
    if(e.key === "Tab"){
      const f = [...d.querySelectorAll("button:not([disabled]),input,a[href]")].filter(x => x.offsetParent !== null);
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
  };
  const kop = el("div", "nieuwkop");
  kop.appendChild(el("span", "nieuwlabel", vt("Update", "Update")));
  const h = el("h3", null, vt("Wat is er nieuw?", "What's new?")); h.id = "nieuwTitel"; kop.appendChild(h);
  kop.appendChild(el("p", null, vt("De app is uitgebreid. Dit is er veranderd:", "The app has been expanded. Here's what changed:")));
  d.appendChild(kop);
  const lijst = el("div", "nieuwlijst");
  NIEUW_ITEMS.forEach(it => {
    const r = el("div", "nieuwitem");
    const tg = el("span", "wbtegel"); tg.style.setProperty("--k", it.kleur); tg.appendChild(nieuwIcoon(it.icoon)); r.appendChild(tg);
    const tx = el("div", "nieuwtx");
    tx.appendChild(el("b", null, vt(it.t, it.te)));
    tx.appendChild(el("p", null, vt(it.u, it.ue)));
    if(it.naar){ const k = el("button", "linkbtn", vt("Bekijk ›", "Take a look ›")); k.type = "button"; k.onclick = () => sluit(it.naar); tx.appendChild(k); }
    r.appendChild(tx); lijst.appendChild(r);
  });
  d.appendChild(lijst);
  const voet = el("div", "nieuwvoet");
  const lab = el("label", "nieuwvink"); lab.htmlFor = "nieuwVink"; lab.appendChild(vink); lab.appendChild(el("span", null, vt("Niet meer laten zien", "Don't show this again")));
  voet.appendChild(lab);
  const ok = el("button", "primary", vt("Aan de slag", "Let's go")); ok.type = "button"; ok.className = "primary nieuwsluit"; ok.onclick = () => sluit();
  voet.appendChild(ok);
  d.appendChild(voet);
  document.addEventListener("keydown", onKey);
  back.onclick = e => { if(e.target === back) sluit(); };
  document.body.appendChild(back);
  requestAnimationFrame(() => { back.classList.add("show"); ok.focus({preventScroll: true}); });
}
// terugkomen in de app na minstens een half uur weg: opnieuw laten zien (de iPhone-app blijft vaak open op de achtergrond)
// wacht tot het openingsscherm en het slotscherm (pincode) weg zijn, en er geen ander venster openstaat
let nieuwWacht = null;
function nieuwToonWanneerVrij(){
  if(!nieuwNodig() || nieuwOpen || nieuwWacht) return;
  let n = 0;
  const kijk = () => {
    nieuwWacht = null;
    const bezig = document.getElementById("splash") || document.getElementById("vergrendel") || document.querySelector(".dlgback");
    if(bezig){ if(n++ < 1500) nieuwWacht = setTimeout(kijk, 400); return; }
    if(nieuwNodig()) openNieuw();
  };
  nieuwWacht = setTimeout(kijk, 300);
}
let nieuwWeg = 0;
document.addEventListener("visibilitychange", () => {
  if(document.hidden){ nieuwWeg = Date.now(); return; }
  if(nieuwWeg && Date.now() - nieuwWeg > 30 * 60 * 1000) nieuwToonWanneerVrij();
  nieuwWeg = 0;
});
$("menuNieuw").onclick = () => { closeMenu(); openNieuw(); };
window.__nieuw = {open: openNieuw, nodig: nieuwNodig};
