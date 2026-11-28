// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- dagbeschouwing: kleur en icoon per vraag, zonneboog, vragenrooster en één knoppenbalk onderin ----------
// Gebruikt door weergave.js (buildQuestion, renderStap, renderStapKop). Verandert niets aan het opslaan.
const DB_STIJL = {
  q1: {k: "#4f86e0", t: ["Mijn dag", "My day"]},
  q2: {k: "#2f9a8a", t: ["Eerlijk", "Honest"]},
  q3: {k: "#cf4f45", t: ["Conflicten", "Conflicts"]},
  q4: {k: "#3f9a5b", t: ["Herstel", "Recovery"]},
  q5: {k: "#e08a2e", t: ["Cravings", "Cravings"]},
  q6: {k: "#d4574c", t: ["Triggers", "Triggers"]},
  q7: {k: "#e3a51f", t: ["Ging goed", "Went well"]},
  q8: {k: "#6f7fd6", t: ["Kon beter", "Could be better"]},
  q9: {k: "#8a66d9", t: ["Terugkomen op", "Come back to"]},
  q10: {k: "#de5f93", t: ["Dankbaar", "Grateful"]},
  trots: {k: "#d9962a", t: ["Trots", "Proud"]},
  q11: {k: "#3a9dc4", t: ["Morgen", "Tomorrow"]},
  q12: {k: "#5b6bd6", t: ["Cijfer", "Score"]}
};
// rond kleurvlak met het nummer (sierletter) in de kop van een vraagkaart; vol gekleurd als de vraag klaar is
function dbStijlKaart(card, q, nr){
  const st = DB_STIJL[q.id]; if(!st) return;
  card.style.setProperty("--k", st.k); card.classList.add("dbk");
  const t = el("span", "qic", String(nr)); t.setAttribute("aria-hidden", "true");
  const h = card.querySelector(".qhead"); if(h) h.insertBefore(t, h.firstChild);
}
// zonneboog: één stip per vraag op een boog; ingevuld = in de kleur van de vraag; de zon staat bij de vraag waar je nu bent
function dbBoog(kaarten, nu){
  const W = 320, H = 74, x0 = 14, x1 = W - 14, yb = H - 10, top = 8;
  const punt = t => { const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * (W / 2) + t * t * x1, y = (1 - t) * (1 - t) * yb + 2 * (1 - t) * t * (top - 24) + t * t * yb; return [x, y]; };
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dbboog" aria-hidden="true"><path d="M' + x0 + ' ' + yb + ' Q' + (W / 2) + ' ' + (top - 24) + ' ' + x1 + ' ' + yb + '" class="baan"/>';
  const n = kaarten.length, [zx, zy] = punt(n > 1 ? nu / (n - 1) : 0);
  s += '<circle cx="' + zx.toFixed(1) + '" cy="' + zy.toFixed(1) + '" r="15" class="zongloed"/>';
  kaarten.forEach((c, i) => {
    const [x, y] = punt(n > 1 ? i / (n - 1) : 0), st = DB_STIJL[c.dataset.q] || {}, klaar = c.classList.contains("done");
    s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (i === nu ? 9 : 5.5) + '" class="stip' + (klaar ? " klaar" : "") + (i === nu ? " nu" : "") + '" style="--k:' + (st.k || "var(--accent)") + '"/>';
    if(klaar && i !== nu) s += '<path d="M' + (x - 2.4).toFixed(1) + ' ' + y.toFixed(1) + 'l1.7 1.7 3.2-3.4" class="vinkje"/>';
  });
  return s + "</svg>";
}
// rooster met alle vragen: zien wat klaar is en er met één tik naartoe
function dbRooster(){
  const k = stapKaarten();
  const back = el("div", "dlgback"); back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-label", vt("Alle vragen", "All questions"));
  const d = el("div", "dlg dbrooster");
  const n = k.filter(c => c.classList.contains("done")).length;
  d.appendChild(el("h3", null, vt("Alle vragen", "All questions")));
  d.appendChild(el("p", null, vt(n + " van de " + k.length + " klaar. Tik op een vraag om erheen te gaan.", n + " of " + k.length + " done. Tap a question to go there.")));
  const grid = el("div", "dbroostergrid");
  const sluit = () => { back.classList.remove("show"); setTimeout(() => back.remove(), 200); document.removeEventListener("keydown", toets); };
  const toets = e => { if(e.key === "Escape") sluit(); };
  k.forEach((c, i) => {
    const st = DB_STIJL[c.dataset.q], q = QUESTIONS.find(x => x.id === c.dataset.q);
    const b = el("button", "dbroostervak" + (c.classList.contains("done") ? " klaar" : "") + (i === stapNu ? " nu" : "")); b.type = "button";
    if(st) b.style.setProperty("--k", st.k);
    b.appendChild(el("span", "dbroosteric", q ? String(QUESTIONS.indexOf(q) + 1) : "☀"));
    const tx = el("span", "dbroostertx");
    tx.appendChild(el("small", null, q ? vt("Vraag " + (QUESTIONS.indexOf(q) + 1), "Question " + (QUESTIONS.indexOf(q) + 1)) : ""));
    tx.appendChild(el("b", null, st ? vt(st.t[0], st.t[1]) : vt("Ochtend", "Morning")));
    b.appendChild(tx);
    if(c.classList.contains("done")){ const v = el("span", "dbroostervink"); v.appendChild(icon("check", 13)); b.appendChild(v); }
    b.setAttribute("aria-label", (st ? vt(st.t[0], st.t[1]) : vt("Ochtend", "Morning")) + (c.classList.contains("done") ? vt(", klaar", ", done") : ""));
    b.onclick = () => { sluit(); stapNaar(i); };
    grid.appendChild(b);
  });
  d.appendChild(grid);
  const row = el("div", "row");
  const z = el("button", "ghost", vt("Sluiten", "Close")); z.type = "button"; z.onclick = sluit;
  const af = el("button", "primary", vt("Afronden", "Finish")); af.type = "button"; af.onclick = () => { sluit(); $("summaryBtn").click(); };
  row.appendChild(z); row.appendChild(af); d.appendChild(row);
  back.appendChild(d); back.onclick = e => { if(e.target === back) sluit(); };
  document.body.appendChild(back); document.addEventListener("keydown", toets);
  requestAnimationFrame(() => { back.classList.add("show"); const nu = grid.querySelector(".nu") || grid.firstChild; if(nu) nu.focus(); });
}
// vraag voor vraag: knoppen Vorige/Volgende in de balk onderin (in plaats van een tweede rij eronder)
function dbBalk(stap){
  document.body.classList.toggle("dbstap", !!stap);
  const v = $("balkVorige"), n = $("balkVolgende"); if(!v || !n) return;
  if(!stap) return;
  const k = stapKaarten(), laatste = stapNu >= k.length - 1;
  v.disabled = stapNu <= 0;
  n.textContent = laatste ? vt("Afronden", "Finish") : vt("Volgende ›", "Next ›");
}
// knoppen koppelen (dit bestand staat na weergave.js in index.html)
$("balkVorige").onclick = () => stapNaar(stapNu - 1);
$("balkVolgende").onclick = () => $("stapVolgende").click();
$("stapAlle").onclick = dbRooster;
$("stapSeg").onclick = dbRooster;
// alles tegelijk: één vraag open tegelijk, de rest als nette regel (icoon, vraag, kort je antwoord). open = kaart die open moet; anders de eerste die nog niet klaar is
function dbLijstAccordeon(open, scroll){
  const k = stapKaarten().filter(c => c.dataset.q);
  const doel = open === undefined || open === null ? k.find(c => !c.classList.contains("done")) : open;
  k.forEach(c => { const q = QUESTIONS.find(x => x.id === c.dataset.q); if(!q || c.classList.contains("fs")) return; setFold(c, q, c !== doel); c.classList.toggle("dbopen", c === doel); });
  if(scroll && doel && doel.scrollIntoView) requestAnimationFrame(() => doel.scrollIntoView({block: "start", behavior: KT_RUSTIG() ? "auto" : "smooth"}));
}
// na afvinken: de volgende vraag die nog niet klaar is gaat open
function dbLijstVolgende(card){
  const k = stapKaarten().filter(c => c.dataset.q), i = k.indexOf(card);
  const v = k.slice(i + 1).find(c => !c.classList.contains("done")) || k.find(c => !c.classList.contains("done"));
  dbLijstAccordeon(v || false, !!v);
}
