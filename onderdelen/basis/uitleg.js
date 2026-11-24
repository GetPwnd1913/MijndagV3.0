// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- uitleg bij het eerste gebruik ----------
// Vier korte stappen: wat de app is, waar je gegevens staan, back-up en Alleen voor vandaag.
// Verschijnt één keer op een nieuw toestel (nog geen naam, cleandatum of ingevulde dagen) en niet meer als
// settings.uitleg = true. Bestaande gebruikers met gegevens zien hem niet. Opnieuw te openen via het menu (groep App).
function uitlegStappen(){
  const ca = typeof opClaudeAi === "function" && opClaudeAi();
  return [
    {titel: vt("Welkom bij Mijn dag", "Welcome to My day"), beeld: "book",
     tekst: vt("Mijn dag is een dagboek voor je herstel. Elke dag vul je een korte dagbeschouwing in. Daarnaast vind je hier je dagplanning, je noodplan, de weekformulieren en overzichten van hoe het met je gaat.",
               "My day is a journal for your recovery. Every day you fill in a short daily reflection. You will also find your day planning, your emergency plan, the weekly forms and overviews of how you are doing.")},
    {titel: vt("Je gegevens blijven bij jou", "Your data stays with you"), beeld: "calendar",
     tekst: ca ? vt("Alles wat je invult, staat in deze browser en in je eigen claude.ai-account. Niet op een andere server en niet bij de maker van de app.",
                    "Everything you enter is kept in this browser and in your own claude.ai account. Not on any other server and not with the maker of the app.")
               : vt("Alles wat je invult, staat alleen op dit toestel, in deze app. Niet op een server en niet bij de maker van de app. Ga je naar een ander toestel of wis je je browsergegevens, dan ben je het kwijt.",
                    "Everything you enter is kept only on this device, in this app. Not on a server and not with the maker of the app. If you switch to another device or clear your browser data, it is gone.")},
    {titel: vt("Maak af en toe een back-up", "Make a backup now and then"), beeld: "week",
     tekst: vt("Een back-up is één bestand met al je dagen en instellingen. Je maakt hem via het menu › Back-up. Bewaar hem op een veilige plek, bijvoorbeeld in iCloud Drive of in je mail. De app herinnert je er om de twee weken aan.",
               "A backup is one file with all your days and settings. You make it via the menu › Backup. Keep it somewhere safe, for example in iCloud Drive or in your email. The app reminds you every two weeks.")},
    {titel: vt("Alleen voor vandaag", "Just for Today"), beeld: "target", jft: true,
     tekst: vt("De dagelijkse teksten van ‘Alleen voor vandaag’ en ‘Just for Today’ zitten niet in de app. Je kiest één keer zelf de officiële PDF. Hoe dat gaat, lees je bij Alleen voor vandaag onder ‘Waar vind ik de PDF?’.",
               "The daily readings of ‘Just for Today’ and ‘Alleen voor vandaag’ are not included in the app. You choose the official PDF yourself, once. How that works is explained under Just for Today, at ‘Where do I find the PDF?’.")}
  ];
}
// nieuw toestel: nog niets ingesteld en geen ingevulde dagen, en de uitleg is nog niet weggeklikt
function uitlegNodig(){
  if(settings.uitleg) return false;
  if(settings.naam || settings.since) return false;
  return !local.days().some(e => e && typeof hasContent === "function" && hasContent(e));
}
async function uitlegGezien(){
  if(settings.uitleg) return;
  settings = Object.assign({}, settings, {uitleg: true, updated: Date.now()});
  local.set("settings", settings);
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
}
let uitlegOpen = null;
function openUitleg(){
  if(uitlegOpen) return;
  const stappen = uitlegStappen();
  let stap = 0;
  const terugFocus = document.activeElement;
  const back = el("div", "dlgback uitlegback"); uitlegOpen = back;
  back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-labelledby", "uitlegTitel");
  const d = el("div", "dlg uitlegdlg"); d.tabIndex = -1; back.appendChild(d);
  const sluit = () => {
    back.classList.remove("show"); document.removeEventListener("keydown", onKey);
    setTimeout(() => back.remove(), 200); uitlegOpen = null; uitlegGezien();
    if(terugFocus && terugFocus.focus) try{ terugFocus.focus({preventScroll: true}); }catch(e){}
  };
  const onKey = e => {
    if(e.key === "Escape"){ e.preventDefault(); sluit(); return; }
    if(e.key === "Tab"){   // focus binnen het venster houden
      const f = [...d.querySelectorAll("button:not([disabled]),a[href]")].filter(x => x.offsetParent !== null);
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
  };
  const teken = () => {
    const s = stappen[stap], laatste = stap === stappen.length - 1;
    d.innerHTML = "";
    const kop = el("div", "uitlegkop");
    const bol = el("div", "uitlegbol"); bol.setAttribute("aria-label", vt("Stap ", "Step ") + (stap + 1) + vt(" van ", " of ") + stappen.length); bol.setAttribute("role", "img");
    stappen.forEach((x, i) => bol.appendChild(el("i", i === stap ? "nu" : i < stap ? "al" : null)));
    kop.appendChild(bol);
    const over = el("button", "linkbtn", vt("Overslaan", "Skip")); over.type = "button"; over.onclick = sluit;
    if(!laatste) kop.appendChild(over);
    d.appendChild(kop);
    const il = typeof illustratie === "function" ? illustratie(s.beeld) : null; if(il) d.appendChild(il);
    const h = el("h3", null, s.titel); h.id = "uitlegTitel"; d.appendChild(h);
    d.appendChild(el("p", null, s.tekst));
    if(s.jft){
      const j = el("button", "linkbtn more", vt("Bekijk Alleen voor vandaag", "See Just for Today")); j.type = "button";
      j.onclick = () => { sluit(); showView("jft"); };
      d.appendChild(j);
    }
    const rij = el("div", "row uitlegrij");
    if(stap > 0){ const t = el("button", "ghost", vt("Terug", "Back")); t.type = "button"; t.onclick = () => { stap--; teken(); }; rij.appendChild(t); }
    const v = el("button", "primary", laatste ? vt("Klaar", "Done") : vt("Volgende", "Next")); v.type = "button";
    v.onclick = () => { if(laatste) sluit(); else { stap++; teken(); } };
    rij.appendChild(v); d.appendChild(rij);
    v.focus({preventScroll: true});
  };
  document.addEventListener("keydown", onKey);
  back.onclick = e => { if(e.target === back) sluit(); };
  document.body.appendChild(back);
  teken();
  requestAnimationFrame(() => back.classList.add("show"));
}
// bij het opstarten: na het openingsscherm en het laden van de opslag, alleen op een nieuw toestel
function toonUitlegAlsNieuw(){
  let n = 0;
  const kijk = () => {
    if(document.getElementById("splash") && n++ < 20){ setTimeout(kijk, 250); return; }
    if(uitlegNodig()) openUitleg();
    else if(typeof nieuwToonWanneerVrij === "function") nieuwToonWanneerVrij();   // "Wat is er nieuw?" (nieuw.js)
  };
  kijk();
}
$("menuUitleg").onclick = () => { closeMenu(); openUitleg(); };
// testhaakje voor de rooktest
window.__uitleg = {open: openUitleg, nodig: uitlegNodig};
