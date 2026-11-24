// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- pot met mooie momenten (in het noodplan) ----------
// Verzamelt uit alle dagbeschouwingen wat je invulde bij "dankbaar" (q10), "trots" en "wat ging goed" (q7).
// Alleen lezen: er wordt niets opgeslagen. "Schud de pot" laat 3 willekeurige momenten zien, met datum.
const POT_VRAGEN = [
  {id: "q10", nl: "Dankbaar voor ", en: "Grateful for ", soort: "dankbaar"},
  {id: "trots", nl: "Trots ", en: "Proud ", soort: "trots"},
  {id: "q7", nl: "Ging goed: ", en: "Went well: ", soort: "goed"}
];
let potKeuze = null, potLijst = null;
// alle momenten: [{date, soort, tekst}] in de gekozen taal
function potMomenten(map){
  const out = [];
  Object.values(map || {}).forEach(e => {
    if(!e || !e.date || !e.answers) return;
    POT_VRAGEN.forEach(v => {
      const a = e.answers[v.id]; if(!a || !a.text) return;
      a.text.split("\n").map(l => l.trim()).filter(Boolean).forEach(l => {
        const bol = l.indexOf("- ") === 0;
        let s = bol ? l.slice(2).trim() : l;
        if(!s || /[?:]$/.test(s)) return;                       // kopjes overslaan
        if(bol){
          const lf = x => x.charAt(0).toLowerCase() + x.slice(1);
          const nl = nlItem(s) !== s ? nlItem(s) : nlItem(lf(s));
          s = vItem(lf(nl)).replace(/\.$/, "");
          s = vt(v.nl, v.en) + s;
        } else s = s.replace(/^\s*[-–•*]\s*/, "");
        out.push({date: e.date, soort: v.soort, tekst: s.charAt(0).toUpperCase() + s.slice(1)});
      });
    });
  });
  return out;
}
function potSchud(){
  const l = potLijst || []; if(!l.length){ potKeuze = []; return; }
  // liefst van verschillende dagen
  const pool = l.slice().sort(() => Math.random() - 0.5), uit = [], dagen = new Set();
  pool.forEach(m => { if(uit.length < 3 && !dagen.has(m.date)){ uit.push(m); dagen.add(m.date); } });
  pool.forEach(m => { if(uit.length < 3 && uit.indexOf(m) < 0) uit.push(m); });
  potKeuze = uit;
}
const POT_SVG = '<svg viewBox="0 0 64 72" aria-hidden="true"><rect x="18" y="4" width="28" height="8" rx="3" class="deksel"/><path d="M20 12h24v6c8 4 12 10 12 20v20a10 10 0 0 1-10 10H18A10 10 0 0 1 8 58V38c0-10 4-16 12-20z" class="glas"/>' +
  '<circle cx="22" cy="54" r="5" class="m1"/><circle cx="34" cy="58" r="5" class="m2"/><circle cx="45" cy="52" r="5" class="m3"/><circle cx="28" cy="45" r="4.5" class="m3"/><circle cx="40" cy="42" r="4.5" class="m1"/><circle cx="20" cy="40" r="3.5" class="m2"/></svg>';
function potCard(){
  const c = el("div", "card potcard");
  const kop = el("div", "potkop");
  const pot = el("div", "potglas"); pot.innerHTML = POT_SVG;
  const tx = el("div"); tx.style.cssText = "flex:1;min-width:0";
  tx.appendChild(el("div", "qtitle", vt("Mijn pot met mooie momenten", "My jar of good moments")));
  const sub = note(vt("Laden…", "Loading…")); sub.style.marginTop = "4px"; tx.appendChild(sub);
  kop.appendChild(pot); kop.appendChild(tx); c.appendChild(kop);
  const lijst = el("div", "potlijst"); c.appendChild(lijst);
  const knop = el("button", "primary", vt("Schud de pot", "Shake the jar")); knop.type = "button"; knop.style.marginTop = "12px";
  const teken = () => {
    const n = (potLijst || []).length;
    sub.textContent = n
      ? (isEn() ? n + (n === 1 ? " good moment" : " good moments") + " from your own daily reflections. Your own words, from your own good days."
                : n + (n === 1 ? " mooi moment" : " mooie momenten") + " uit je eigen dagbeschouwingen. Je eigen woorden, van je eigen goede dagen.")
      : vt("Vul in je dagbeschouwing in waar je dankbaar en trots op bent. Dan vult de pot zich vanzelf.", "Fill in what you are grateful for and proud of in your daily reflection. Then the jar fills up by itself.");
    knop.classList.toggle("hidden", !n);
    knop.textContent = potKeuze && potKeuze.length ? vt("Nog een keer schudden", "Shake again") : vt("Schud de pot", "Shake the jar");
    lijst.innerHTML = "";
    (potKeuze || []).forEach((m, i) => {
      const r = el("div", "potmoment"); r.dataset.soort = m.soort; r.style.animationDelay = (i * 90) + "ms";
      r.appendChild(el("div", "potdatum", cap(parseKey(m.date).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long"}))));
      r.appendChild(el("div", "pottekst", m.tekst));
      lijst.appendChild(r);
    });
  };
  knop.onclick = () => {
    potSchud(); teken();
    pot.classList.remove("schud"); void pot.offsetWidth; pot.classList.add("schud");
  };
  c.appendChild(knop);
  if(potLijst){ teken(); }
  allDays().then(map => { potLijst = potMomenten(map); if(potKeuze) potKeuze = potKeuze.filter(m => potLijst.some(x => x.date === m.date && x.tekst === m.tekst)); teken(); }).catch(() => { potLijst = potLijst || []; teken(); });
  return c;
}
