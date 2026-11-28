// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- Mijn tuin: je maand in bloemen (bovenaan Mijn patronen) ----------
// Eén maand tegelijk, als kalender: per week een plantenbak met 7 grote bloemen en de dagnummers eronder; pijltjes = andere maand.
// Cijfer 8-10: grote roze bloem · 6-7: gele bloem · 5: oranje bloemetje · 1-4: gesloten knopje met een regenwolkje ("regen hoort erbij")
// Geen cijfer maar wel ingevuld: groen sprietje · meeting: vlinder · nieuwe keytag: zonnebloem.
// Tik op een bloem: klein kaartje (datum, cijfer, eerste zin) met "Open deze dag". Alleen lezen: er wordt niets opgeslagen.
let tuinMaand = null;
const TUIN_W = 40, TUIN_H = 74, TUIN_GROND = 56;
function tuinSoort(e, mijlpaal){
  if(mijlpaal) return "zon";
  if(!e || !hasContent(e)) return "";
  const n = patCijfer(e);
  return n == null ? "spriet" : n >= 8 ? "roze" : n >= 6 ? "geel" : n >= 5 ? "oranje" : "regen";
}
// één plant op x (midden van het vak); s = schaal
function tuinPlant(soort, x, s, meeting){
  const f = v => v.toFixed(1), g = TUIN_GROND;
  let o = '<g transform="translate(' + f(x) + ' 0)">';
  const steel = (h, buig) => '<path class="tbsteel" d="M0 ' + g + ' Q' + (buig || 0) + ' ' + f(g - h / 2) + ' 0 ' + f(g - h) + '"/>';
  const blad = (y, kant) => '<path class="tbblad" d="M0 ' + f(y) + ' q' + (kant * 7 * s) + ' ' + (-6 * s) + ' ' + (kant * 10 * s) + ' 0 q' + (-kant * 6 * s) + ' ' + (4 * s) + ' ' + (-kant * 10 * s) + ' 0z"/>';
  const kroon = (cy, r, bl, kl) => { let k = ""; for(let i = 0; i < bl; i++){ const a = i * 2 * Math.PI / bl - Math.PI / 2; k += '<circle class="tbkroon ' + kl + '" cx="' + f(Math.cos(a) * r) + '" cy="' + f(cy + Math.sin(a) * r) + '" r="' + f(r * .8) + '"/>'; } return k + '<circle class="tbhart" cx="0" cy="' + f(cy) + '" r="' + f(r * .55) + '"/>'; };
  if(soort === "zon"){
    const top = g - 40 * s;
    o += steel(40 * s) + blad(g - 16 * s, 1) + blad(g - 24 * s, -1);
    for(let i = 0; i < 12; i++){ const a = i * Math.PI / 6, cx = Math.cos(a) * 7 * s, cy = top + Math.sin(a) * 7 * s; o += '<ellipse class="tbzon" cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(4 * s) + '" ry="' + f(1.9 * s) + '" transform="rotate(' + (i * 30) + ' ' + f(cx) + ' ' + f(cy) + ')"/>'; }
    o += '<circle class="tbhart bruin" cx="0" cy="' + f(top) + '" r="' + f(4.6 * s) + '"/>';
  } else if(soort === "roze"){ o += steel(34 * s) + blad(g - 14 * s, -1) + blad(g - 20 * s, 1) + kroon(g - 34 * s, 5.2 * s, 6, "roze"); }
  else if(soort === "geel"){ o += steel(26 * s) + blad(g - 12 * s, 1) + kroon(g - 26 * s, 4.2 * s, 5, "geel"); }
  else if(soort === "oranje"){ o += steel(18 * s) + blad(g - 8 * s, -1) + kroon(g - 18 * s, 3.2 * s, 5, "oranje"); }
  else if(soort === "regen"){
    const top = g - 16 * s;
    o += steel(16 * s) + blad(g - 7 * s, 1) + '<ellipse class="tbknop" cx="0" cy="' + f(top) + '" rx="' + f(3.2 * s) + '" ry="' + f(4.6 * s) + '"/>';
    o += '<g class="tbwolk"><circle cx="' + f(-4 * s) + '" cy="' + f(10 * s) + '" r="' + f(4.2 * s) + '"/><circle cx="' + f(2 * s) + '" cy="' + f(8 * s) + '" r="' + f(5.4 * s) + '"/><circle cx="' + f(7 * s) + '" cy="' + f(11 * s) + '" r="' + f(3.6 * s) + '"/><rect x="' + f(-8 * s) + '" y="' + f(10 * s) + '" width="' + f(18 * s) + '" height="' + f(5 * s) + '" rx="' + f(2.5 * s) + '"/></g>';
    [[-4, 19], [1, 23], [6, 19]].forEach(([dx, dy], i) => { o += '<path class="tbdrup" style="animation-delay:' + (i * .45) + 's" d="M' + f(dx * s) + ' ' + f(dy * s) + ' l-1 3"/>'; });
  } else if(soort === "spriet"){ o += '<path class="tbspriet" d="M0 ' + g + ' q-2 -8 -5 -12 M0 ' + g + ' q2 -9 5 -13 M0 ' + g + ' l0 -10"/>'; }
  if(meeting && soort && soort !== "regen") o += '<g class="tbvlinder" transform="translate(' + f(9 * s) + ' ' + f(g - 40 * s) + ') scale(' + f(s) + ')"><path d="M0 0 q-4 -5 -6 0 q2 3 6 0 M0 0 q4 -5 6 0 q-2 3 -6 0"/></g>';
  return o + "</g>";
}
function patTuinKaart(map, tk){
  const c = el("div", "card tuinkaart");
  const mijl = new Set(settings.since ? keytagList(settings.since).map(t => t.key) : []);
  if(!tuinMaand || tuinMaand > tk.slice(0, 7)) tuinMaand = tk.slice(0, 7);
  const teken = gekozen => {
    c.innerHTML = "";
    const mk = tuinMaand, [y, m] = mk.split("-").map(Number), n = new Date(y, m, 0).getDate();
    // kop met maandkeuze
    const kop = el("div", "tuinkop");
    kop.appendChild(el("div", "qtitle", vt("Mijn tuin", "My garden")));
    const nav = el("div", "tuinnav");
    const pv = el("button", "iconbtn"); pv.type = "button"; pv.appendChild(icon("chevL", 18)); pv.setAttribute("aria-label", vt("Vorige maand", "Previous month"));
    pv.onclick = () => { tuinMaand = addMonthsKey(mk + "-01", -1).slice(0, 7); teken(); };
    const nx = el("button", "iconbtn"); nx.type = "button"; nx.appendChild(icon("chevR", 18)); nx.setAttribute("aria-label", vt("Volgende maand", "Next month"));
    nx.disabled = mk >= tk.slice(0, 7); nx.onclick = () => { if(mk < tk.slice(0, 7)){ tuinMaand = addMonthsKey(mk + "-01", 1).slice(0, 7); teken(); } };
    const naam = new Date(y, m - 1, 1).toLocaleDateString(locale(), {month: "long", year: "numeric"});
    nav.appendChild(pv); nav.appendChild(el("span", "tuinmaandnaam", cap(naam))); nav.appendChild(nx);
    kop.appendChild(nav); c.appendChild(kop);
    // telling van de maand
    const tel = {bloem: 0, regen: 0, vlinder: 0, zon: 0};
    for(let d = 1; d <= n; d++){
      const k = mk + "-" + String(d).padStart(2, "0"), e = map[k], s = tuinSoort(e, mijl.has(k));
      if(s === "regen") tel.regen++; else if(s === "zon") tel.zon++; else if(s) tel.bloem++;
      if(e && hasContent(e) && meetBezoekenVan(e)) tel.vlinder++;
    }
    const delen = [tel.bloem === 1 ? vt("1 bloem", "1 flower") : vt(tel.bloem + " bloemen", tel.bloem + " flowers")];
    if(tel.regen) delen.push(tel.regen === 1 ? vt("1 regendag", "1 rainy day") : vt(tel.regen + " regendagen", tel.regen + " rainy days"));
    if(tel.vlinder) delen.push(tel.vlinder === 1 ? vt("1 vlinder", "1 butterfly") : vt(tel.vlinder + " vlinders", tel.vlinder + " butterflies"));
    if(tel.zon) delen.push(tel.zon === 1 ? vt("1 zonnebloem", "1 sunflower") : vt(tel.zon + " zonnebloemen", tel.zon + " sunflowers"));
    c.appendChild(el("div", "tuinsamen", delen.join("  ·  ")));
    // dagen van de week
    const wd = el("div", "tuinweek");
    [1, 2, 3, 4, 5, 6, 0].forEach(d => wd.appendChild(el("span", null, dayName(d).slice(0, 2))));
    c.appendChild(wd);
    // per week een plantenbak
    const eerste = (new Date(y, m - 1, 1).getDay() + 6) % 7, bakken = el("div", "tuinbakken");
    for(let w = 0; w * 7 - eerste < n; w++){
      let s = '<svg viewBox="0 0 ' + (7 * TUIN_W) + ' ' + TUIN_H + '" role="img" aria-label="' + vt("Week ", "Week ") + (w + 1) + '">';
      s += '<rect class="tuingrond" x="2" y="' + (TUIN_GROND - 1) + '" width="' + (7 * TUIN_W - 4) + '" height="7" rx="3.5"/>';
      for(let i = 0; i < 7; i++){
        const d = w * 7 + i - eerste + 1; if(d < 1 || d > n) continue;
        const k = mk + "-" + String(d).padStart(2, "0"), e = map[k], soort = tuinSoort(e, mijl.has(k)), x = i * TUIN_W + TUIN_W / 2;
        const kl = "tvak" + (k === tk ? " vandaag" : "") + (k > tk ? " straks" : "") + (soort ? " vol" : "") + (k === gekozen ? " gekozen" : "");
        s += '<g class="' + kl + '" data-dag="' + k + '"' + (soort ? ' tabindex="0" role="button" aria-label="' + niceDate(k) + '"' : "") + '><rect class="tbtik" x="' + (i * TUIN_W + 1) + '" y="0" width="' + (TUIN_W - 2) + '" height="' + TUIN_H + '" rx="8"/>';
        if(soort) s += tuinPlant(soort, x, 1, e && meetBezoekenVan(e));
        s += '<text class="tdag" x="' + x + '" y="' + (TUIN_H - 3) + '" text-anchor="middle">' + d + '</text></g>';
      }
      const bak = el("div", "tuinbak"); bak.innerHTML = s + "</svg>"; bakken.appendChild(bak);
    }
    const kies = g => { if(g && g.classList.contains("vol")) teken(g.dataset.dag === gekozen ? null : g.dataset.dag); };
    bakken.onclick = ev => kies(ev.target.closest && ev.target.closest(".tvak"));
    bakken.onkeydown = ev => { if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); kies(ev.target.closest && ev.target.closest(".tvak")); } };
    c.appendChild(bakken);
    // kaartje bij de gekozen bloem
    if(gekozen){
      const e = map[gekozen], n2 = e ? patCijfer(e) : null, kaart = el("div", "tuinpop");
      const k1 = el("div", "tuinpopkop");
      k1.appendChild(el("b", null, cap(niceDate(gekozen))));
      if(n2 != null) k1.appendChild(el("span", "tuincijfer " + tuinSoort(e, false), String(n2)));
      kaart.appendChild(k1);
      const regel = e && e.answers && e.answers.q1 ? (e.answers.q1.text || "").trim().split("\n")[0] : "", m1 = /^.*?[.!?](\s|$)/.exec(regel);
      const zin = m1 ? m1[0].trim() : regel;
      if(zin) kaart.appendChild(el("div", "note", zin.length > 140 ? zin.slice(0, 137) + "…" : zin));
      if(mijl.has(gekozen)) kaart.appendChild(el("div", "note", vt("Op deze dag haalde je een nieuwe keytag.", "On this day you reached a new keytag.")));
      if(e && hasContent(e)){
        const o = el("button", "linkbtn more", vt("Open deze dag", "Open this day")); o.type = "button";
        o.onclick = () => { showView("today"); loadDay(gekozen); window.scrollTo(0, 0); };
        kaart.appendChild(o);
      }
      c.appendChild(kaart);
    }
    if(tel.regen) c.appendChild(el("div", "tuinregen", vt("Regen hoort erbij. Ook daar groeit je tuin van.", "Rain is part of it. Your garden grows from that too.")));
    // legenda met de echte plantjes
    const leg = el("div", "tuinlegenda");
    [["roze", vt("goede dag (8+)", "good day (8+)")], ["geel", vt("fijne dag (6–7)", "nice day (6–7)")], ["oranje", vt("oké (5)", "okay (5)")], ["regen", vt("zware dag", "hard day")], ["zon", vt("mijlpaal", "milestone")], ["vlinder", vt("meeting", "meeting")]].forEach(([s, l]) => {
      const it = el("span", "tuinleg");
      const mini = s === "vlinder" ? tuinPlant("geel", 16, .85, true) : tuinPlant(s, 16, .85, false);
      it.innerHTML = '<svg viewBox="0 4 32 54" aria-hidden="true">' + mini + "</svg>";
      it.appendChild(document.createTextNode(l)); leg.appendChild(it);
    });
    c.appendChild(leg);
  };
  teken(null);
  return c;
}
