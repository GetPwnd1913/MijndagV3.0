// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- wat heb ik bespaard? ----------
// Op het beginscherm (onder Vandaag) een rustige regel "Bespaard · € 8.240 ›"; tikken klapt het bedrag en het spaardoel open.
// settings.bespaard = {perDag: 25, doelNaam: "Vakantie", doelBedrag: 1500}. Rekent met de cleandatum (settings.since).
let bspOpen = false, bspBewerk = false;
const bspGeld = n => (Math.round(n) || 0).toLocaleString(locale(), {style: "currency", currency: "EUR", maximumFractionDigits: 0, minimumFractionDigits: 0});
const bspPrecies = n => n.toLocaleString(locale(), {style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2});
const bspDagen = () => settings.since ? Math.max(0, Math.round((parseKey(todayKey()) - parseKey(settings.since)) / 864e5)) : 0;
const bspGetal = v => { const n = parseFloat(String(v || "").replace(/[^\d,.]/g, "").replace(",", ".")); return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0; };
function renderBespaard(){
  const c = $("bespaardKaart"); if(!c) return;
  const b = settings.bespaard || {}, per = +b.perDag || 0;
  c.classList.toggle("hidden", !settings.since);
  c.innerHTML = "";
  if(!settings.since) return;
  const dagen = bspDagen(), totaal = per * dagen;
  const head = el("button", "plankop"); head.type = "button"; head.setAttribute("aria-expanded", bspOpen ? "true" : "false");
  head.appendChild(icon("euro", 20));
  head.appendChild(el("div", "qtitle", vt("Bespaard", "Saved")));
  const cnt = el("div", "note", (per ? bspGeld(totaal) : vt("Instellen", "Set up")) + (bspOpen ? " ▾" : " ›")); cnt.style.cssText = "margin:0;flex:none;font-weight:600"; head.appendChild(cnt);
  head.onclick = () => { bspOpen = !bspOpen; bspBewerk = false; renderBespaard(); };
  c.appendChild(head);
  if(!bspOpen) return;
  const w = el("div", "bspin");
  if(per && !bspBewerk){
    w.appendChild(el("div", "bspgroot", bspGeld(totaal)));
    w.appendChild(el("div", "note", vt("bespaard in " + dagen + (dagen === 1 ? " dag" : " dagen") + " clean, met " + bspPrecies(per) + " per dag. Dat is ongeveer " + bspGeld(per * 30.4) + " per maand en " + bspGeld(per * 365) + " per jaar.",
      "saved in " + dagen + (dagen === 1 ? " day" : " days") + " clean, at " + bspPrecies(per) + " a day. That is about " + bspGeld(per * 30.4) + " a month and " + bspGeld(per * 365) + " a year.")));
    const doel = +b.doelBedrag || 0;
    if(doel){
      const d = el("div", "bspdoel");
      const naam = (b.doelNaam || "").trim() || vt("Mijn spaardoel", "My savings goal");
      const kop = el("div", "bspdoelkop"); kop.appendChild(el("b", null, naam)); kop.appendChild(el("span", null, bspGeld(Math.min(totaal, doel)) + " / " + bspGeld(doel))); d.appendChild(kop);
      const bar = el("div", "bar"); const i = el("i"); i.style.width = Math.min(100, totaal / doel * 100).toFixed(1) + "%"; bar.appendChild(i); d.appendChild(bar);
      const nog = doel - totaal, nogDagen = Math.ceil(nog / per);
      d.appendChild(el("div", "note", nog <= 0 ? vt("Gehaald! Je hebt genoeg bespaard voor " + naam.toLowerCase() + ".", "Done! You have saved enough for " + naam.toLowerCase() + ".")
        : vt("Nog " + bspGeld(nog) + ", ongeveer " + nogDagen + (nogDagen === 1 ? " dag" : " dagen") + " clean.", bspGeld(nog) + " to go, about " + nogDagen + (nogDagen === 1 ? " day" : " days") + " clean.")));
      w.appendChild(d);
    }
    const lk = el("button", "linkbtn", vt("Bedrag of spaardoel aanpassen", "Change amount or savings goal")); lk.type = "button"; lk.style.marginTop = "6px";
    lk.onclick = () => { bspBewerk = true; renderBespaard(); };
    w.appendChild(lk);
  } else {
    w.appendChild(el("div", "note", vt("Vul in wat je gebruik ongeveer per dag kostte. Dan zie je hoeveel je sinds je cleandatum hebt bespaard.", "Enter roughly what your use cost per day. You will then see how much you have saved since your clean date.")));
    const veld = (label, inp) => { const f = el("label", "wddatum"); f.appendChild(el("span", null, label)); f.appendChild(inp); return f; };
    const pi = el("input"); pi.inputMode = "decimal"; pi.placeholder = "€ 20"; pi.value = per ? String(per).replace(".", settings.taal === "en" ? "." : ",") : "";
    w.appendChild(veld(vt("Per dag (€)", "Per day (€)"), pi));
    const dn = el("input"); dn.placeholder = vt("Bijv. vakantie (mag leeg)", "E.g. holiday (optional)"); dn.value = b.doelNaam || "";
    w.appendChild(veld(vt("Spaardoel", "Savings goal"), dn));
    const db = el("input"); db.inputMode = "decimal"; db.placeholder = "€ 1500"; db.value = b.doelBedrag ? String(b.doelBedrag) : "";
    w.appendChild(veld(vt("Bedrag doel (€)", "Goal amount (€)"), db));
    const msg = note(""); w.appendChild(msg);
    const rij = el("div", "row"); rij.style.cssText = "margin-top:12px;gap:8px";
    if(per){ const an = el("button", "ghost", vt("Annuleren", "Cancel")); an.type = "button"; an.onclick = () => { bspBewerk = false; renderBespaard(); }; rij.appendChild(an); }
    const ok = el("button", "primary", vt("Opslaan", "Save")); ok.type = "button";
    ok.onclick = async () => {
      const p = bspGetal(pi.value);
      if(!p){ msg.textContent = vt("Vul een bedrag per dag in, bijvoorbeeld 20.", "Enter an amount per day, for example 20."); pi.focus(); return; }
      settings.bespaard = {perDag: p, doelNaam: dn.value.trim(), doelBedrag: bspGetal(db.value)};
      bspBewerk = false; renderBespaard(); await saveSettingsNow();
    };
    rij.appendChild(ok); w.appendChild(rij);
  }
  c.appendChild(w);
}
