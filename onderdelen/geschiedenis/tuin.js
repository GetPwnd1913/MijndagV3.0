// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- Mijn tuin: je jaar in bloemen (bovenaan Mijn patronen) ----------
// Per maand een plantenbak (de laatste 12 maanden, nieuwste bovenaan); elke ingevulde dag is een bloem.
// Cijfer 8-10: grote roze bloem · 6-7: gele bloem · 4-5: oranje knopje · 1-3: klein blauw bloemetje · geen cijfer: groen sprietje.
// Meeting op die dag: een vlindertje erbij. Nieuwe keytag op die dag: een zonnebloem. Tik op een bloem = die dag openen.
// Alleen lezen: er wordt niets opgeslagen.
const TUIN_STAP = 11, TUIN_H = 46, TUIN_GROND = 38;
function tuinBloem(x, e, k, mijlpaal){
  const n = e ? patCijfer(e) : null, f = v => v.toFixed(1);
  let s = '<g class="tb" data-dag="' + k + '" transform="translate(' + f(x) + ' 0)"><rect class="tbtik" x="-5.5" y="0" width="11" height="' + TUIN_H + '"/>';
  if(mijlpaal){
    s += '<path class="tbsteel" d="M0 ' + TUIN_GROND + ' L0 9"/><path class="tbblad" d="M0 26 q5 -4 7 0 q-4 3 -7 0z"/>';
    for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5; s += '<ellipse class="tbzon" cx="' + f(Math.cos(a) * 5) + '" cy="' + f(9 + Math.sin(a) * 5) + '" rx="2.6" ry="1.3" transform="rotate(' + (i * 36) + ' ' + f(Math.cos(a) * 5) + ' ' + f(9 + Math.sin(a) * 5) + ')"/>'; }
    s += '<circle class="tbhart bruin" cx="0" cy="9" r="3.2"/>';
  } else if(n == null){
    s += '<path class="tbspriet" d="M0 ' + TUIN_GROND + ' q-1 -6 -3 -9 M0 ' + TUIN_GROND + ' q1 -7 3 -10"/>';
  } else {
    const kl = n >= 8 ? "roze" : n >= 6 ? "geel" : n >= 4 ? "oranje" : "blauw";
    const h = n >= 8 ? 22 : n >= 6 ? 17 : n >= 4 ? 12 : 8, r = n >= 8 ? 3.4 : n >= 6 ? 2.8 : n >= 4 ? 2.2 : 1.8, top = TUIN_GROND - h;
    s += '<path class="tbsteel" d="M0 ' + TUIN_GROND + ' Q' + (n < 4 ? 2 : 0) + ' ' + f(top + h / 2) + ' 0 ' + f(top) + '"/>';
    if(h > 12) s += '<path class="tbblad" d="M0 ' + f(TUIN_GROND - h * .45) + ' q-5 -4 -7 0 q4 3 7 0z"/>';
    if(n >= 4 && n < 6){ s += '<ellipse class="tbkroon ' + kl + '" cx="0" cy="' + f(top) + '" rx="2.4" ry="3.2"/>'; }
    else {
      const bl = n >= 8 ? 6 : 5;
      for(let i = 0; i < bl; i++){ const a = i * 2 * Math.PI / bl - Math.PI / 2; s += '<circle class="tbkroon ' + kl + '" cx="' + f(Math.cos(a) * r) + '" cy="' + f(top + Math.sin(a) * r) + '" r="' + f(r * .78) + '"/>'; }
      s += '<circle class="tbhart" cx="0" cy="' + f(top) + '" r="' + f(r * .55) + '"/>';
    }
    if(e && meetBezoekenVan(e)) s += '<g class="tbvlinder" transform="translate(4 ' + f(Math.max(4, top - 7)) + ')"><path d="M0 0 q-3 -3 -4 0 q1 2 4 0 M0 0 q3 -3 4 0 q-1 2 -4 0"/></g>';
  }
  return s + "</g>";
}
function patTuinKaart(map, tk){
  const since = settings.since, mijl = new Set(since ? keytagList(since).map(t => t.key) : []);
  const c = el("div", "card tuinkaart");
  const kop = el("div", "tuinkop"); kop.appendChild(el("div", "qtitle", vt("Mijn tuin", "My garden")));
  const vanaf = addMonthsKey(tk.slice(0, 7) + "-01", -11);
  const dagen = Object.keys(map).filter(k => k >= vanaf && k <= tk && map[k] && hasContent(map[k]));
  kop.appendChild(el("span", "tuinteller", dagen.length === 1 ? vt("1 bloem", "1 flower") : vt(dagen.length + " bloemen", dagen.length + " flowers")));
  c.appendChild(kop);
  c.appendChild(note(vt("Elke dag dat je je dagbeschouwing invult, groeit er een bloem. Hoe beter de dag, hoe voller de bloem. Tik op een bloem om die dag te openen.",
    "Every day you fill in your daily reflection, a flower grows. The better the day, the fuller the flower. Tap a flower to open that day.")));
  const bakken = el("div", "tuinbakken");
  for(let m = 0; m < 12; m++){
    const mk = addMonthsKey(tk.slice(0, 7) + "-01", -m).slice(0, 7);
    const [y, mm] = mk.split("-").map(Number), n = new Date(y, mm, 0).getDate();
    let s = '<svg viewBox="0 0 ' + (n * TUIN_STAP + 8) + " " + TUIN_H + '" preserveAspectRatio="xMinYMax meet" role="img" aria-label="' + vt("Tuin van ", "Garden of ") + patMaandNaam(mk) + '">';
    s += '<rect class="tuingrond" x="0" y="' + (TUIN_GROND - 1) + '" width="' + (n * TUIN_STAP + 8) + '" height="' + (TUIN_H - TUIN_GROND + 1) + '" rx="4"/>';
    let bloemen = 0;
    for(let d = 1; d <= n; d++){
      const k = mk + "-" + String(d).padStart(2, "0"); if(k > tk) break;
      const e = map[k];
      if(e && hasContent(e)){ s += tuinBloem(4 + (d - .5) * TUIN_STAP, e, k, mijl.has(k)); bloemen++; }
      else if(mijl.has(k)) s += tuinBloem(4 + (d - .5) * TUIN_STAP, null, k, true);
    }
    s += "</svg>";
    const rij = el("div", "tuinbak" + (bloemen ? "" : " leeg"));
    rij.appendChild(el("span", "tuinmaand", patMaandNaam(mk)));
    const plek = el("div", "tuinbed"); plek.innerHTML = s; rij.appendChild(plek);
    bakken.appendChild(rij);
  }
  bakken.onclick = ev => {
    const g = ev.target.closest && ev.target.closest(".tb"); if(!g) return;
    showView("today"); loadDay(g.dataset.dag); window.scrollTo(0, 0);
  };
  c.appendChild(bakken);
  const leg = el("div", "tuinlegenda");
  [["roze", vt("8 of hoger", "8 or higher")], ["geel", "6 – 7"], ["oranje", "4 – 5"], ["blauw", vt("zwaar", "hard")]].forEach(([k, l]) => {
    const i = el("span"); i.appendChild(el("i", "tl " + k)); i.appendChild(document.createTextNode(l)); leg.appendChild(i);
  });
  const z = el("span"); z.appendChild(el("i", "tl zon")); z.appendChild(document.createTextNode(vt("mijlpaal", "milestone"))); leg.appendChild(z);
  const v = el("span"); v.appendChild(el("i", "tl vlinder")); v.appendChild(document.createTextNode(vt("meeting", "meeting"))); leg.appendChild(v);
  c.appendChild(leg);
  return c;
}
