// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- slaap: vast blok bovenaan elke dagbeschouwing ----------
// entry.slaap = {bed: "23:15", op: "07:00", wakker: "0|1|2|3+", kwaliteit: "goed|matig|slecht"} (de nacht vóór deze dag).
// Verplicht voor Afronden (samenvatting.js) vanaf SLAAP_VANAF; oudere dagen mogen leeg blijven.
// De kwaliteit is dezelfde als "Hoe heb ik geslapen?" in het ochtendmoment: wat daar is gekozen, staat hier al ingevuld.
// Telt niet mee in "x van 13 vragen". Gebruikt in de samenvatting voor de 1-op-1 en in Mijn patronen.
const SLAAP_VANAF = "2026-11-28";
const SLAAP_WAKKER = [["0", "Niet", "Not"], ["1", "1 keer", "Once"], ["2", "2 keer", "Twice"], ["3+", "3 keer of vaker", "3 times or more"]];
const SLAAP_KWAL = [["goed", "Goed", "Well"], ["matig", "Matig", "So-so"], ["slecht", "Slecht", "Badly"]];
const slaapKwaliteit = e => (e && e.slaap && e.slaap.kwaliteit) || (e && e.ochtend && e.ochtend.slaap) || "";
const slaapKlaar = e => !!(e && e.slaap && e.slaap.bed && e.slaap.op && e.slaap.wakker && slaapKwaliteit(e));
const slaapVerplicht = k => k >= SLAAP_VANAF;
// aantal minuten tussen naar bed en opstaan (over middernacht heen)
function slaapMinuten(e){
  const s = e && e.slaap; if(!s || !/^\d\d:\d\d$/.test(s.bed || "") || !/^\d\d:\d\d$/.test(s.op || "")) return null;
  const m = t => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  let d = m(s.op) - m(s.bed); if(d <= 0) d += 1440;
  return d > 0 && d < 1080 ? d : null;   // meer dan 18 uur: waarschijnlijk een tikfout
}
const slaapUrenTekst = min => min == null ? "" : Math.floor(min / 60) + vt(" u", "h") + (min % 60 ? " " + String(min % 60).padStart(2, "0") + vt(" min", "m") : "");
// korte regel voor exports: "23:15 – 07:00 (7 u 45 min) · 1 keer wakker · goed"
function slaapRegel(e){
  if(!e || !(e.slaap || slaapKwaliteit(e))) return "";
  const s = e.slaap || {}, min = slaapMinuten(e), w = SLAAP_WAKKER.find(x => x[0] === s.wakker), k = SLAAP_KWAL.find(x => x[0] === slaapKwaliteit(e));
  return [s.bed && s.op ? s.bed + " – " + s.op + (min != null ? " (" + slaapUrenTekst(min) + ")" : "") : "",
    w ? (w[0] === "0" ? vt("niet wakker geworden", "did not wake up") : vt(w[1] + " wakker", "woke " + w[2].toLowerCase())) : "", k ? vt(k[1], k[2]).toLowerCase() : ""].filter(Boolean).join(" · ");
}
function buildSlaapKaart(){
  const c = el("div", "card slaapkaart" + (slaapKlaar(entry) ? " done" : ""));
  const kop = el("div", "slaapkop");
  const ic = el("span", "slaapic"); ic.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'; kop.appendChild(ic);
  const kt = el("div"); kt.appendChild(el("div", "qtitle", vt("Hoe heb ik geslapen?", "How did I sleep?")));
  kt.appendChild(el("div", "note", vt("Over de afgelopen nacht. ", "About last night. ") + (slaapVerplicht(curKey) ? vt("Vul dit eerst in, dan kun je afronden.", "Fill this in first, then you can finish.") : "")));
  kop.appendChild(kt); c.appendChild(kop);
  const s = Object.assign({bed: "", op: "", wakker: "", kwaliteit: ""}, entry.slaap || {});
  if(!s.kwaliteit && entry.ochtend && entry.ochtend.slaap) s.kwaliteit = entry.ochtend.slaap;
  const toonUren = () => { const m = slaapMinuten({slaap: s}); uren.textContent = m != null ? vt("Ongeveer ", "About ") + slaapUrenTekst(m) + vt(" geslapen", " of sleep") : ""; };
  const bewaar = () => {
    entry.slaap = {bed: s.bed, op: s.op, wakker: s.wakker, kwaliteit: s.kwaliteit};
    c.classList.toggle("done", slaapKlaar(entry));
    toonUren(); scheduleSave();
  };
  const tijden = el("div", "slaaptijden");
  [["bed", vt("Naar bed", "Went to bed"), "23:00"], ["op", vt("Opgestaan", "Got up"), "07:00"]].forEach(([k, l]) => {
    const f = el("label", "slaapveld"); f.appendChild(el("span", null, l));
    const i = el("input"); i.type = "time"; i.value = s[k]; i.onchange = () => { s[k] = i.value; bewaar(); };
    f.appendChild(i); tijden.appendChild(f);
  });
  c.appendChild(tijden);
  const uren = el("div", "slaapuren"); c.appendChild(uren);
  const keuze = (label, opts, veld) => {
    c.appendChild(el("div", "label", label));
    const sc = el("div", "scale slaapscale");
    opts.forEach(([v, nl, en]) => {
      const b = el("button", s[veld] === v ? "on" : null, vt(nl, en)); b.type = "button"; b.setAttribute("aria-pressed", s[veld] === v ? "true" : "false");
      if(veld === "kwaliteit" && v === "slecht") b.classList.add("warn");
      b.onclick = () => { s[veld] = s[veld] === v ? "" : v; [...sc.children].forEach((x, j) => { const aan = opts[j][0] === s[veld]; x.classList.toggle("on", aan); x.setAttribute("aria-pressed", aan ? "true" : "false"); }); bewaar(); };
      sc.appendChild(b);
    });
    c.appendChild(sc);
  };
  keuze(vt("Hoe vaak werd ik wakker?", "How often did I wake up?"), SLAAP_WAKKER, "wakker");
  keuze(vt("Hoe heb ik geslapen?", "How did I sleep?"), SLAAP_KWAL, "kwaliteit");
  toonUren();
  return c;
}
// Mijn patronen: slaap over de gekozen periode, en of slecht slapen samengaat met trek
function patSlaapKaart(dagen){
  const met = dagen.filter(e => slaapKwaliteit(e) || slaapMinuten(e) != null);
  if(met.length < 3) return null;
  const c = el("div", "card"); c.appendChild(el("div", "qtitle", vt("Mijn slaap", "My sleep")));
  const min = met.map(slaapMinuten).filter(x => x != null), gem = min.length ? min.reduce((a, b) => a + b, 0) / min.length : null;
  const tel = k => met.filter(e => slaapKwaliteit(e) === k).length;
  const tegels = el("div", "mteltegels");
  [[gem != null ? slaapUrenTekst(Math.round(gem)) : "–", vt("gemiddeld per nacht", "average per night")], [tel("goed") + "/" + met.length, vt("nachten goed", "good nights")], [String(tel("slecht")), vt("nachten slecht", "bad nights")]]
    .forEach(([g, l]) => { const t = el("div", "mteltegel"); t.appendChild(el("b", null, g)); t.appendChild(el("span", null, l)); tegels.appendChild(t); });
  c.appendChild(tegels);
  const slecht = met.filter(e => slaapKwaliteit(e) === "slecht" || (slaapMinuten(e) != null && slaapMinuten(e) < 360)), goed = met.filter(e => slecht.indexOf(e) < 0);
  const pct = l => l.length ? Math.round(l.filter(e => hadIt(e, "q5")).length / l.length * 100) : 0;
  if(slecht.length >= 2 && goed.length >= 2){
    const a = pct(slecht), b = pct(goed);
    const n = note(a > b ? vt("Na een slechte of korte nacht had je op " + a + "% van de dagen trek. Na een goede nacht op " + b + "%.", "After a bad or short night you had cravings on " + a + "% of days. After a good night on " + b + "%.")
      : vt("Na een slechte of korte nacht had je niet vaker trek dan na een goede nacht.", "After a bad or short night you did not have cravings more often than after a good night."));
    n.style.marginTop = "10px"; c.appendChild(n);
  }
  return c;
}
