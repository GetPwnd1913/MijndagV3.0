// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- pincode (optioneel slot) ----------
// Standaard UIT. Zet je hem aan in Instellingen, dan vraagt de app bij het openen en na een minuut weg om je pincode.
// Beschermt tegen iemand die even in je telefoon kijkt; het versleutelt je gegevens NIET.
// - De pincode zelf wordt nooit bewaard: alleen een zout + PBKDF2-hash (WebCrypto, SHA-256, veel rondes).
// - Eigen sleutel "dagbeschouwing:lock" in localStorage, dus NIET in settings: zo gaat hij niet mee in de back-up
//   en niet naar claude.ai. Een back-up terugzetten raakt het slot niet.
// - Foute pogingen: na 5 keer moet je wachten (30 s, daarna 1 min, 2 min, ... tot 1 uur); dat staat in dezelfde sleutel.
// - De inhoud van de app is al onzichtbaar vóór dit script draait (html[data-slot], gezet door het scriptje in <head>).
// - Uitbreidbaar: ontgrendelen loopt via slotOpen(); een andere manier (bv. Face ID) kan later dezelfde functie aanroepen.
const SLOT_KEY = LS + "lock";
const SLOT_RONDES = 210000;
const SLOT_WEG_MS = 60000;            // zo lang weg (app op de achtergrond) voordat de pincode opnieuw nodig is
let slotZichtbaar = false, slotWegSinds = 0;

function slotLees(){ try{ const v = JSON.parse(localStorage.getItem(SLOT_KEY) || "null"); return v && v.hash && v.salt ? v : null; }catch(e){ return null; } }
function slotSchrijf(v){ try{ if(v) localStorage.setItem(SLOT_KEY, JSON.stringify(v)); else localStorage.removeItem(SLOT_KEY); return true; }catch(e){ return false; } }
const slotAan = () => !!slotLees();
const slotKan = () => !!(window.crypto && crypto.subtle && crypto.getRandomValues && window.TextEncoder);
const slotB64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));
const slotUitB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function slotHash(pin, salt, rondes){
  const sleutel = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(pin)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name: "PBKDF2", hash: "SHA-256", salt, iterations: rondes}, sleutel, 256);
  return slotB64(bits);
}
const pinGeldig = p => /^[0-9]{4,6}$/.test(String(p || ""));
// wachttijd in seconden na een aantal foute pogingen op rij
function wachtSeconden(fouten){ return fouten < 5 ? 0 : Math.min(30 * Math.pow(2, fouten - 5), 3600); }
function slotWachtNog(){ const s = slotLees(); return s && s.wachtTot ? Math.max(0, Math.ceil((s.wachtTot - Date.now()) / 1000)) : 0; }

// nieuwe pincode instellen (of wijzigen): alleen zout + hash bewaren, foute pogingen op nul
async function zetPin(pin){
  if(!pinGeldig(pin) || !slotKan()) return false;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await slotHash(pin, salt, SLOT_RONDES);
  return slotSchrijf({v: 1, salt: slotB64(salt), hash, rondes: SLOT_RONDES, lengte: String(pin).length, fouten: 0, wachtTot: 0});
}
// pincode controleren; telt foute pogingen en zet de wachttijd. Geeft {ok, wacht} terug (wacht = seconden).
async function controleerPin(pin){
  const s = slotLees(); if(!s) return {ok: true, wacht: 0};
  const nog = slotWachtNog(); if(nog > 0) return {ok: false, wacht: nog};
  let goed = false;
  try{ goed = slotKan() && await slotHash(pin, slotUitB64(s.salt), s.rondes || SLOT_RONDES) === s.hash; }catch(e){ goed = false; }
  const nu = slotLees() || s;
  if(goed){ nu.fouten = 0; nu.wachtTot = 0; slotSchrijf(nu); return {ok: true, wacht: 0}; }
  nu.fouten = (nu.fouten || 0) + 1;
  const w = wachtSeconden(nu.fouten); nu.wachtTot = w ? Date.now() + w * 1000 : 0;
  slotSchrijf(nu);
  return {ok: false, wacht: w, fouten: nu.fouten};
}
const slotDuur = s => s >= 60 ? (s % 60 ? Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0") + vt(" min", " min") : aantal(s / 60, "minuut", "minuten", "minute", "minutes"))
                              : aantal(s, "seconde", "seconden", "second", "seconds");

// ---------- het slotscherm ----------
function toonSlot(){
  if(!slotAan()){ slotOpen(); return; }
  document.documentElement.setAttribute("data-slot", "");
  if(slotZichtbaar && $("vergrendel")) return;
  slotZichtbaar = true;
  const oud = $("vergrendel"); if(oud) oud.remove();
  const s = slotLees(), lengte = s.lengte || 4;
  let invoer = "", bezig = false, wachtTimer = null;
  const w = el("div"); w.id = "vergrendel";
  w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-labelledby", "slotTitel");
  const binnen = el("div", "slotbinnen"); w.appendChild(binnen);
  const logo = el("div", "slotlogo"); logo.setAttribute("aria-hidden", "true");
  logo.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>';
  binnen.appendChild(logo);
  const h = el("h2", null, vt("Mijn dag", "My day")); h.id = "slotTitel"; binnen.appendChild(h);
  const uitleg = el("p", "slotuitleg", vt("Voer je pincode in", "Enter your PIN")); binnen.appendChild(uitleg);
  const bollen = el("div", "slotbollen"); bollen.setAttribute("aria-hidden", "true");
  for(let i = 0; i < lengte; i++) bollen.appendChild(el("i"));
  binnen.appendChild(bollen);
  const melding = el("p", "slotmelding"); melding.setAttribute("role", "status"); melding.setAttribute("aria-live", "polite"); binnen.appendChild(melding);
  const pad = el("div", "slotpad");
  const teken = () => {
    [...bollen.children].forEach((b, i) => b.classList.toggle("vol", i < invoer.length));
    bollen.setAttribute("aria-label", invoer.length + vt(" van ", " of ") + lengte);
  };
  const zetWacht = () => {
    clearInterval(wachtTimer);
    const loop = () => {
      const nog = slotWachtNog();
      pad.classList.toggle("wacht", nog > 0);
      [...pad.querySelectorAll("button")].forEach(b => b.disabled = nog > 0);
      if(nog > 0) melding.textContent = vt("Te vaak een verkeerde pincode. Probeer het opnieuw over ", "Too many wrong attempts. Try again in ") + slotDuur(nog) + ".";
      else { clearInterval(wachtTimer); if(pad.classList.contains("was")) { melding.textContent = ""; pad.classList.remove("was"); } }
    };
    if(slotWachtNog() > 0){ pad.classList.add("was"); loop(); wachtTimer = setInterval(loop, 1000); }
  };
  const probeer = async () => {
    if(bezig || invoer.length < lengte) return;
    bezig = true; w.classList.add("bezig");
    const r = await controleerPin(invoer);
    bezig = false; w.classList.remove("bezig");
    if(r.ok){ clearInterval(wachtTimer); slotOpen(); return; }
    invoer = ""; teken();
    bollen.classList.remove("schud"); void bollen.offsetWidth; bollen.classList.add("schud");
    if(navigator.vibrate) try{ navigator.vibrate(120); }catch(e){}
    if(r.wacht > 0) zetWacht();
    else {
      const over = 5 - (r.fouten || 0);
      melding.textContent = vt("Verkeerde pincode.", "Wrong PIN.") + (over > 0 && over < 3 ? " " + vt("Nog " + over + " " + (over === 1 ? "poging" : "pogingen") + ", daarna moet je even wachten.", over + " more " + (over === 1 ? "attempt" : "attempts") + ", then you will have to wait a moment.") : "");
    }
  };
  const tik = c => {
    if(bezig || slotWachtNog() > 0) return;
    if(c === "weg"){ invoer = invoer.slice(0, -1); teken(); return; }
    if(invoer.length >= lengte) return;
    if(invoer.length === 0 && !pad.classList.contains("was")) melding.textContent = "";
    invoer += c; teken();
    if(invoer.length === lengte) setTimeout(probeer, 120);
  };
  ["1","2","3","4","5","6","7","8","9","","0","weg"].forEach(c => {
    if(!c){ pad.appendChild(el("span")); return; }
    const b = el("button", c === "weg" ? "slotweg" : null); b.type = "button";
    if(c === "weg"){ b.setAttribute("aria-label", vt("Wis laatste cijfer", "Delete last digit")); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5"/></svg>'; }
    else b.textContent = c;
    b.onclick = () => tik(c);
    pad.appendChild(b);
  });
  binnen.appendChild(pad);
  const vergeten = el("button", "linkbtn slotvergeten", vt("Pincode vergeten?", "Forgot your PIN?")); vergeten.type = "button";
  vergeten.onclick = () => slotVergeten(binnen, () => { slotZichtbaar = false; toonSlot(); });
  binnen.appendChild(vergeten);
  w._toets = e => {
    if(!slotZichtbaar || !w.isConnected || binnen.classList.contains("wis")) return;
    if(/^[0-9]$/.test(e.key)){ e.preventDefault(); e.stopPropagation(); tik(e.key); }
    else if(e.key === "Backspace"){ e.preventDefault(); e.stopPropagation(); tik("weg"); }
    else if(e.key === "Escape" || e.key === "Enter"){ e.preventDefault(); e.stopPropagation(); }
    else if(e.key === "Tab"){   // focus binnen het slot houden
      const f = [...w.querySelectorAll("button:not([disabled])")];
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && (document.activeElement === f[f.length - 1] || !w.contains(document.activeElement))){ e.preventDefault(); f[0].focus(); }
    }
  };
  document.addEventListener("keydown", w._toets, true);
  document.body.appendChild(w);
  teken(); zetWacht();
  try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}
  setTimeout(() => { const b = pad.querySelector("button:not([disabled])"); if(b) b.focus({preventScroll: true}); }, 50);
}
// "Pincode vergeten?": waarschuwing in het slotscherm zelf, daarna alles op dit toestel wissen en opnieuw beginnen
function slotVergeten(binnen, terug){
  binnen.classList.add("wis");
  const bewaar = [...binnen.childNodes]; bewaar.forEach(n => n.remove());
  const h = el("h2", null, vt("Pincode vergeten?", "Forgot your PIN?")); h.id = "slotTitel";
  binnen.appendChild(h);
  binnen.appendChild(el("p", "slotuitleg", vt("Alle gegevens op dit toestel worden gewist. Heb je een back-up, dan kun je die daarna terugzetten.",
                                              "All data on this device will be deleted. If you have a backup, you can restore it afterwards.")));
  const rij = el("div", "row slotrij");
  const nee = el("button", "ghost", vt("Terug", "Back")); nee.type = "button";
  const ja = el("button", "danger", vt("Alles wissen", "Delete everything")); ja.type = "button";
  nee.onclick = () => { binnen.classList.remove("wis"); binnen.innerHTML = ""; bewaar.forEach(n => binnen.appendChild(n)); terug(); };
  ja.onclick = async () => {
    nee.disabled = ja.disabled = true; ja.textContent = vt("Bezig met wissen…", "Deleting…");
    // op claude.ai eerst de verbinding met je opslag afwachten, anders blijven daar gegevens staan
    for(let i = 0; i < 40 && typeof dbState !== "undefined" && dbState === "pending"; i++) await new Promise(r => setTimeout(r, 250));
    try{ await wisAlleGegevens(); }catch(e){}
    slotSchrijf(null);
    location.reload();
  };
  rij.appendChild(nee); rij.appendChild(ja); binnen.appendChild(rij);
  setTimeout(() => nee.focus({preventScroll: true}), 30);
}
// ontgrendelen (ook het aanknopingspunt voor een andere manier van ontgrendelen later)
function slotOpen(){
  const w = $("vergrendel");
  if(w){ document.removeEventListener("keydown", w._toets, true); w.classList.add("weg"); setTimeout(() => w.remove(), 250); }
  slotZichtbaar = false;
  document.documentElement.removeAttribute("data-slot");
  document.documentElement.removeAttribute("data-afgedekt");
}
// app op de achtergrond: meteen afdekken (zo min mogelijk te zien in het app-overzicht); terug na een minuut of langer = pincode
document.addEventListener("visibilitychange", () => {
  if(!slotAan()) return;
  if(document.hidden){ slotWegSinds = Date.now(); if(!slotZichtbaar) document.documentElement.setAttribute("data-afgedekt", ""); return; }
  if(slotZichtbaar) return;
  if(slotWegSinds && Date.now() - slotWegSinds >= SLOT_WEG_MS) toonSlot();
  else document.documentElement.removeAttribute("data-afgedekt");
  slotWegSinds = 0;
});

// ---------- in Instellingen: aanzetten, wijzigen, uitzetten ----------
function tekenPinInstelling(){
  const st = $("pinStatus"), kn = $("pinKnoppen"); if(!st || !kn) return;
  kn.innerHTML = "";
  const knop = (tekst, fn, cls) => { const b = el("button", cls || "ghost", tekst); b.type = "button"; b.onclick = fn; kn.appendChild(b); return b; };
  if(!slotKan()){ st.textContent = vt("Op dit toestel of in deze browser kan geen pincode worden ingesteld.", "A PIN cannot be set on this device or in this browser."); return; }
  if(slotAan()){
    st.textContent = vt("Aan. De app vraagt om je pincode bij het openen en als je langer dan een minuut weg was. ", "On. The app asks for your PIN when it opens and when you have been away for more than a minute. ")
                   + vt("Beschermt tegen iemand die even in je telefoon kijkt. Het versleutelt je gegevens niet.", "Protects against someone taking a quick look at your phone. It does not encrypt your data.");
    knop(vt("Wijzigen", "Change"), () => pinDialoog("wijzig"));
    knop(vt("Uitzetten", "Turn off"), () => pinDialoog("uit"));
  } else {
    st.textContent = vt("Uit. Met een pincode kan niemand anders de app openen. Beschermt tegen iemand die even in je telefoon kijkt. Het versleutelt je gegevens niet.",
                        "Off. With a PIN nobody else can open the app. Protects against someone taking a quick look at your phone. It does not encrypt your data.");
    knop(vt("Pincode instellen", "Set a PIN"), () => pinDialoog("aan"));
  }
}
// soort: "aan" (nieuw, twee keer), "wijzig" (huidige + nieuw twee keer), "uit" (huidige)
function pinDialoog(soort){
  const stappen = soort === "aan" ? ["nieuw", "herhaal"] : soort === "wijzig" ? ["huidig", "nieuw", "herhaal"] : ["huidig"];
  let stap = 0, nieuw = "";
  const back = el("div", "dlgback"); back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-labelledby", "pinTitel");
  const d = el("div", "dlg pindlg"); back.appendChild(d);
  const titel = soort === "aan" ? vt("Pincode instellen", "Set a PIN") : soort === "wijzig" ? vt("Pincode wijzigen", "Change PIN") : vt("Pincode uitzetten", "Turn off PIN");
  const h = el("h3", null, titel); h.id = "pinTitel"; d.appendChild(h);
  const lab = el("label"); lab.htmlFor = "pinInvoer"; d.appendChild(lab);
  const inp = el("input", "pininvoer"); inp.id = "pinInvoer"; inp.type = "password"; inp.inputMode = "numeric"; inp.autocomplete = "off";
  inp.setAttribute("pattern", "[0-9]*"); inp.maxLength = 6; inp.setAttribute("enterkeyhint", "done");
  d.appendChild(inp);
  const fout = el("p", "pinfout"); fout.setAttribute("role", "status"); fout.setAttribute("aria-live", "polite"); d.appendChild(fout);
  if(soort === "aan") d.appendChild(el("p", "pinnoot", vt("Beschermt tegen iemand die even in je telefoon kijkt. Het versleutelt je gegevens niet. Vergeet je de pincode, dan moet je alle gegevens op dit toestel wissen (en eventueel een back-up terugzetten).",
                                                           "Protects against someone taking a quick look at your phone. It does not encrypt your data. If you forget the PIN, you will have to delete all data on this device (and restore a backup if you have one).")));
  const rij = el("div", "row");
  const nee = el("button", "ghost", vt("Annuleren", "Cancel")); nee.type = "button";
  const ja = el("button", soort === "uit" ? "danger" : "primary"); ja.type = "button";
  rij.appendChild(nee); rij.appendChild(ja); d.appendChild(rij);
  const sluit = () => { back.classList.remove("show"); document.removeEventListener("keydown", onKey); setTimeout(() => back.remove(), 200); tekenPinInstelling(); };
  const onKey = e => { if(e.key === "Escape"){ e.preventDefault(); sluit(); } };
  const toon = () => {
    const s = stappen[stap];
    lab.textContent = s === "huidig" ? vt("Je huidige pincode", "Your current PIN") : s === "nieuw" ? vt("Nieuwe pincode (4 tot 6 cijfers)", "New PIN (4 to 6 digits)") : vt("Typ de nieuwe pincode nog een keer", "Type the new PIN again");
    ja.textContent = stap < stappen.length - 1 ? vt("Volgende", "Next") : soort === "uit" ? vt("Uitzetten", "Turn off") : vt("Opslaan", "Save");
    inp.value = ""; setTimeout(() => inp.focus(), 30);
  };
  const verder = async () => {
    const s = stappen[stap], v = inp.value.trim();
    fout.textContent = "";
    if(s === "huidig"){
      if(!v) return;
      ja.disabled = true; const r = await controleerPin(v); ja.disabled = false;
      if(!r.ok){
        inp.value = "";
        fout.textContent = r.wacht > 0 ? vt("Te vaak een verkeerde pincode. Probeer het opnieuw over ", "Too many wrong attempts. Try again in ") + slotDuur(r.wacht) + "." : vt("Dat is niet je huidige pincode.", "That is not your current PIN.");
        return;
      }
      if(soort === "uit"){ slotSchrijf(null); sluit(); toast(vt("De pincode staat uit", "The PIN is off")); return; }
    } else if(s === "nieuw"){
      if(!pinGeldig(v)){ fout.textContent = vt("Gebruik 4 tot 6 cijfers.", "Use 4 to 6 digits."); return; }
      nieuw = v;
    } else {
      if(v !== nieuw){ fout.textContent = vt("De pincodes zijn niet hetzelfde. Begin opnieuw.", "The PINs do not match. Start again."); stap = stappen.indexOf("nieuw"); nieuw = ""; toon(); return; }
      ja.disabled = true; const ok = await zetPin(nieuw); ja.disabled = false;
      if(!ok){ fout.textContent = vt("Het opslaan is niet gelukt.", "Saving did not work."); return; }
      sluit(); toast(soort === "aan" ? vt("De pincode staat aan", "The PIN is on") : vt("De pincode is gewijzigd", "The PIN has been changed")); return;
    }
    stap++; toon();
  };
  inp.addEventListener("input", () => { const c = inp.value.replace(/[^0-9]/g, "").slice(0, 6); if(c !== inp.value) inp.value = c; });
  inp.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); verder(); } });
  nee.onclick = sluit; ja.onclick = verder;
  back.onclick = e => { if(e.target === back) sluit(); };
  document.addEventListener("keydown", onKey);
  document.body.appendChild(back);
  toon();
  requestAnimationFrame(() => back.classList.add("show"));
}

// bij het laden: slot tonen als er een pincode is (de inhoud is dan al verborgen door het scriptje in <head>)
if(slotAan()) toonSlot(); else document.documentElement.removeAttribute("data-slot");
// testhaakje voor de rooktest
window.__slot = {zetPin, controleer: controleerPin, wachtSeconden, aan: slotAan, lees: slotLees, toon: toonSlot, open: slotOpen, uit: () => { slotSchrijf(null); slotOpen(); }};
