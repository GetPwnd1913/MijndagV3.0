// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- toegankelijkheid: schermlezer (VoiceOver) en toetsenbord ----------
// Werkt over de hele app, zonder elk scherm apart aan te passen:
// - aan/uit-knopjes (chips, keuzeknoppen, cijfers, afvinken) krijgen aria-pressed dat meeverandert met de klasse "on";
//   het menu krijgt aria-current="page" op het huidige scherm.
// - kopjes die als <div> zijn gemaakt (qtitle, homekop, ...) krijgen role="heading" + aria-level, zodat je met de rotor
//   van kopje naar kopje springt; de opmaak blijft precies hetzelfde.
// - vensters (menu, overlays, bevestigingen, groot schrijfscherm): alles erbuiten wordt "inert" (niet bereikbaar),
//   de focus gaat erin, Tab blijft erin, Esc sluit, en na sluiten gaat de focus terug naar de knop die het opende.
// - meldingen (toast) worden voorgelezen via vaste live-regio's (#srStatus, #srAlert) die al in de pagina staan.
const A11Y_AANUIT = "button.chip, .scale > button, .score > button, button.klaarbtn";
const A11Y_KOPPEN = [["div.qtitle, span.qtitle", 3], [".homekop", 2], [".sectionhead", 2], [".overkop", 3], [".vitkop", 3]];
const A11Y_FOCUSBAAR = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// meldingen voorlezen: eerst leegmaken, dan de tekst, zodat dezelfde melding twee keer ook twee keer klinkt
function a11yMeld(tekst, fout){
  const r = $(fout ? "srAlert" : "srStatus"); if(!r) return;
  r.textContent = "";
  setTimeout(() => { r.textContent = tekst; }, 60);
}

// aan/uit-status, menu en kopjes bijwerken binnen een stuk van de pagina
function a11yBijwerken(root){
  if(!root || !root.querySelectorAll) return;
  const knop = b => {
    if(b.closest("#drawer")){ if(b.dataset.view){ if(b.classList.contains("on")) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); } return; }
    b.setAttribute("aria-pressed", b.classList.contains("on") ? "true" : "false");
  };
  if(root.matches && root.matches(A11Y_AANUIT)) knop(root);
  root.querySelectorAll(A11Y_AANUIT + ", #drawer [data-view]").forEach(knop);
  root.querySelectorAll("textarea[placeholder], input[placeholder]").forEach(v => {
    if(v.getAttribute("aria-label") && !v.dataset.a11yPh) return;
    if(v.getAttribute("aria-labelledby") || v.closest("label") || (v.id && document.querySelector('label[for="' + v.id + '"]'))) return;
    v.setAttribute("aria-label", v.placeholder); v.dataset.a11yPh = "1";
  });
  A11Y_KOPPEN.forEach(([sel, niveau]) => {
    const kop = n => { if(n.closest("button, [role=button], h1, h2, h3, h4") || /^H\d$/.test(n.tagName)) return; n.setAttribute("role", "heading"); n.setAttribute("aria-level", String(niveau)); };
    if(root.matches && root.matches(sel)) kop(root);
    root.querySelectorAll(sel).forEach(kop);
  });
}

// ---------- vensters ----------
// het bovenste open venster (of null)
function a11yBovenste(){
  const slot = $("vergrendel"); if(slot && document.documentElement.hasAttribute("data-slot")) return slot;
  const dlg = [...document.querySelectorAll("body > .dlgback, body > [role=dialog][aria-modal=true]")].filter(d => d.id !== "vergrendel" && !d.classList.contains("weg") && !d.classList.contains("overlay") && getComputedStyle(d).display !== "none").pop(); if(dlg) return dlg;
  const ov = [...document.querySelectorAll(".overlay.show")];
  if(ov.length) return ov.sort((a, b) => (parseInt(getComputedStyle(a).zIndex) || 0) - (parseInt(getComputedStyle(b).zIndex) || 0)).pop();
  const dr = $("drawer"); if(dr && dr.classList.contains("open")) return dr;
  return document.querySelector(".card.fs");
}
let a11yModaal = null, a11yInert = [], a11yFsKaart = null;
const a11yTerug = new Map();   // venster -> element dat de focus had toen het openging
const a11yZichtbaar = n => !!n && n.isConnected && !n.closest("[inert]") && (n.offsetParent !== null || getComputedStyle(n).position === "fixed");
// naam en rol geven (als die er nog niet zijn)
function a11yNoem(m){
  if(m.id === "drawer") return;
  if(!m.getAttribute("role")) m.setAttribute("role", "dialog");
  m.setAttribute("aria-modal", "true");
  if(m.getAttribute("aria-label") || m.getAttribute("aria-labelledby")) return;
  const kop = m.querySelector("h1, h2, h3, [role=heading], .qtitle");
  if(kop){ if(!kop.id) kop.id = "a11y-kop-" + Math.random().toString(36).slice(2, 8); m.setAttribute("aria-labelledby", kop.id); }
}
function a11yFocusErin(m){
  if(m.contains(document.activeElement)) return;
  let doel = null;
  if(m.id === "drawer") doel = m.querySelector("[data-view].on") || m.querySelector(A11Y_FOCUSBAAR);
  else {
    doel = m.querySelector("h1, h2, h3, [role=heading]");
    if(doel && !doel.hasAttribute("tabindex")) doel.tabIndex = -1;
    if(!doel || !a11yZichtbaar(doel)) doel = [...m.querySelectorAll(A11Y_FOCUSBAAR)].find(a11yZichtbaar) || null;
    if(!doel){ if(!m.hasAttribute("tabindex")) m.tabIndex = -1; doel = m; }
  }
  try{ doel.focus({preventScroll: true}); }catch(e){}
}
function a11yHerbereken(){
  const dr = $("drawer"), mb = $("menuBtn");
  if(mb && dr){ const open = dr.classList.contains("open"); mb.setAttribute("aria-expanded", open ? "true" : "false"); mb.setAttribute("aria-controls", "drawer"); dr.inert = !open; }
  // groot schrijfscherm: alleen zolang hij open is een venster
  const fs = document.querySelector(".card.fs");
  if(a11yFsKaart && a11yFsKaart !== fs){ ["role", "aria-modal", "aria-labelledby"].forEach(a => a11yFsKaart.removeAttribute(a)); a11yFsKaart = null; }
  if(fs) a11yFsKaart = fs;
  const m = a11yBovenste();
  if(m === a11yModaal) return;
  a11yInert.forEach(n => { n.inert = false; }); a11yInert = [];
  a11yModaal = m;
  if(m && m.id !== "vergrendel"){
    // groot schrijfscherm: geen focus terugzetten (het tekstvak zelf opent het scherm, dan zou het meteen weer opengaan)
    if(!a11yTerug.has(m) && !m.classList.contains("card")) a11yTerug.set(m, document.activeElement);
    // alles buiten het venster onbereikbaar, behalve de live-regio's en de achtergrond van het menu (tik = sluiten)
    for(let n = m; n && n.parentElement && n !== document.body; n = n.parentElement){
      [...n.parentElement.children].forEach(s => {
        if(s === n || s.inert || s.tagName === "SCRIPT" || s.id === "toast" || s.id === "drawerBg" || s.classList.contains("srregio")) return;
        s.inert = true; a11yInert.push(s);
      });
    }
    a11yNoem(m);
  }
  // gesloten vensters: focus terug naar de knop die ze opende (als de focus nergens meer is)
  [...a11yTerug.keys()].forEach(k => {
    if(k === m || (k.isConnected && a11yOpen(k))) return;
    const t = a11yTerug.get(k); a11yTerug.delete(k);
    const kwijt = !document.activeElement || document.activeElement === document.body || !a11yZichtbaar(document.activeElement) || k.contains(document.activeElement);
    if(!kwijt) return;
    // nooit terug naar een tekstvak: op de iPhone springt dan het toetsenbord open en opent het groot schrijfscherm weer
    let doel = a11yZichtbaar(t) && !/^(TEXTAREA|INPUT|SELECT)$/.test(t.tagName) ? t : null;
    if(!doel && t && t.closest && t.closest("#drawer")) doel = $("menuBtn");
    if(doel && (!m || m.contains(doel))) try{ doel.focus({preventScroll: true}); }catch(e){}
  });
  if(m && m.id !== "vergrendel") a11yFocusErin(m);
}
const a11yOpen = k => k.id === "drawer" ? k.classList.contains("open") : k.classList.contains("overlay") ? k.classList.contains("show") : k.classList.contains("card") ? k.classList.contains("fs") : k.isConnected;

// Esc sluit het bovenste venster (als het venster dat zelf nog niet deed); Tab blijft binnen het venster
document.addEventListener("keydown", e => {
  const m = a11yModaal; if(!m || e.defaultPrevented || m.id === "vergrendel") return;
  if(e.key === "Escape"){
    if(m.id === "drawer"){ e.preventDefault(); closeMenu(); return; }
    if(m.classList.contains("overlay")){
      const dicht = m.querySelector("#setCancel, #closeSum, [data-sluit], .xbtn, .sluitknop");
      if(dicht){ e.preventDefault(); dicht.click(); }
    }
    return;
  }
  if(e.key !== "Tab") return;
  const f = [...m.querySelectorAll(A11Y_FOCUSBAAR)].filter(a11yZichtbaar);
  if(!f.length){ e.preventDefault(); return; }
  const i = f.indexOf(document.activeElement);
  if(e.shiftKey && (i <= 0)){ e.preventDefault(); f[f.length - 1].focus(); }
  else if(!e.shiftKey && (i === -1 || i === f.length - 1)){ e.preventDefault(); f[0].focus(); }
});

// alles bijhouden terwijl de app tekent
let a11yGepland = false;
const a11yPlan = () => { if(a11yGepland) return; a11yGepland = true; Promise.resolve().then(() => { a11yGepland = false; a11yHerbereken(); }); };
new MutationObserver(muts => {
  muts.forEach(mu => {
    if(mu.type === "childList") mu.addedNodes.forEach(n => { if(n.nodeType === 1) a11yBijwerken(n); });
    else if(mu.target.matches && mu.target.matches(A11Y_AANUIT + ", #drawer [data-view]")) a11yBijwerken(mu.target);
  });
  a11yPlan();
}).observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ["class"]});
a11yBijwerken(document.body);
a11yHerbereken();
// testhaakje voor de rooktest
window.__a11y = {bovenste: () => a11yModaal, meld: a11yMeld};
