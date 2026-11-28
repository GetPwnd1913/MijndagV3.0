// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- "Wat is er nieuw?" ----------
// Venster bij het openen van de app (en bij terugkomen na een half uur weg) met wat er nieuw is.
// Verschijnt elke keer, tot je "Niet meer laten zien" aanvinkt: dan staat settings.nieuwGezien = NIEUW_VERSIE.
// Bij een volgende update met nieuws: NIEUW_VERSIE en NIEUW_ITEMS aanpassen, dan komt het venster weer.
// Op een nieuw toestel komt eerst de uitleg (uitleg.js); dan niet ook nog dit venster.
const NIEUW_VERSIE = "2026-11-28-2";
const NIEUW_ITEMS = [
  {icoon: "pin", kleur: "var(--accent)", naar: "meetings",
   t: "Meetings bij jou in de buurt", te: "Meetings near you",
   u: "Vul je plaats of adres in bij Meetings. Dan zie je alle meetings van NA, AA en CA binnen 30 km, met de afstand erbij.",
   ue: "Enter your town or address under Meetings. You will then see all NA, AA and CA meetings within 30 km, with the distance."},
  {icoon: "target", kleur: "var(--tv-groen)", naar: "talk",
   t: "Je weekdoel, mooier en handiger", te: "Your weekly goal, nicer and handier",
   u: "Zie in één oogopslag hoe je week gaat. Haal een doel en er volgt een klein feestje. Wat vorige week niet lukte, neem je met één tik mee.",
   ue: "See at a glance how your week is going. Reach a goal and there is a little celebration. What didn't work out last week, you carry over with one tap."},
  {icoon: "calendar", kleur: "var(--warm)", naar: "talk-punten",
   t: "Klaar voor je 1-op-1", te: "Ready for your 1-to-1",
   u: "Zet de datum van je volgende gesprek erin, markeer wat belangrijk is, en maak van een afspraak meteen een weekdoel.",
   ue: "Add the date of your next talk, mark what is important, and turn an agreement straight into a weekly goal."},
  {icoon: "star", kleur: "var(--tv-groen)", naar: "home",
   t: "Jouw weg door de seizoenen", te: "Your road through the seasons",
   u: "Jouw weg verandert mee met het seizoen, en je volgende keytag loopt langzaam vol met kleur.",
   ue: "Your road changes with the seasons, and your next keytag slowly fills up with colour."},
  {icoon: "award", kleur: "var(--warm)", naar: "home",
   t: "Tik op een mijlpaal", te: "Tap a milestone",
   u: "Er is iets veranderd op Jouw weg. Tik op een van je keytags en kijk wat er gebeurt.",
   ue: "Something has changed on Your road. Tap one of your keytags and see what happens."},
  {icoon: "gschema", kleur: "var(--accent)", naar: "werkboek",
   t: "Mijn werkboek", te: "My workbook",
   u: "Nieuw in het menu: zes opdrachten zoals je ze in de verslavingszorg meekrijgt. Terugvalpreventieplan, Nee zeggen, G-schema, Beslisbalans, Netwerkkaart en Plezierlijst. Je kunt ze downloaden als Word of PDF.",
   ue: "New in the menu: six assignments like the ones you get in addiction care. Relapse prevention plan, Saying no, ABC diary, Decision balance, Network map and Fun list. You can download them as Word or PDF."},,
  {icoon: "plezier", kleur: "var(--warm)", naar: "sos",
   t: "Pot met mooie momenten", te: "Jar of good moments",
   u: "Schud de pot in je noodplan en lees terug waar je dankbaar en trots op was. Je eigen woorden, van je eigen goede dagen.",
   ue: "Shake the jar in your emergency plan and read back what you were grateful for and proud of. Your own words, from your own good days."},,
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
    if(naar === "talk-punten"){ talkTab = "punten"; naar = "talk"; } else if(naar === "talk") talkTab = "doel";
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
    const bezig = document.getElementById("splash") || document.getElementById("vergrendel") || document.querySelector(".dlgback") ||
      document.querySelector(".ktshow, .feestbanier") || (typeof mpOpen !== "undefined" && mpOpen) || (typeof wegMomentBezig !== "undefined" && wegMomentBezig) ||
      (typeof wegFeestOpKomst === "function" && wegFeestOpKomst());   // een nieuwe mijlpaal gaat voor: eerst het feest (keytags.js), daarna dit venster
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
