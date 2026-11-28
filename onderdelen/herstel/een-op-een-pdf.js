// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- samenvatting voor de 1-op-1 (PDF) ----------
// Periode: de 7 dagen tot en met de dag vóór de volgende 1-op-1 (talkPeriode in een-op-een.js).
// Pagina 1: kop, "In één oogopslag", "De week in beeld" (tabel per dag), "Wat valt op", weekdoelen, bespreekpunten.
// Daarna per ingevulde dag: ochtend + alle ingevulde vragen (zelfde regels als de dag-PDF: answerLines).
// Huisstijl en hulpjes uit dag-pdf.js / dag-word.js: exportTheme, pdfLogo, cp1252, wrap, textW, pesc, answerLines, qTitle, ochtendRegels.
function talkSamenvattingPdf(){
  const [van, tot] = talkPeriode();
  const map = {}; local.days().forEach(e => { if(e && e.date) map[e.date] = e; });
  if(typeof entry !== "undefined" && entry && entry.date) map[entry.date] = entry;
  const dagen = []; for(let k = van; k <= tot; k = addDaysKey(k, 1)) dagen.push(k);
  const ing = dagen.filter(k => map[k] && hasContent(map[k])).map(k => map[k]);
  const cijfers = ing.map(patCijfer).filter(x => x != null), gem = patGem(cijfers);
  const meet = dagen.reduce((s, k) => s + (map[k] ? meetBezoekenVan(map[k]) : 0), 0);
  const kl = settings.kleuren || {}, slaap = {goed: 0, matig: 0, slecht: 0};
  dagen.forEach(k => { const s = map[k] ? slaapKwaliteit(map[k]) : ""; if(slaap[s] != null) slaap[s]++; });
  const slaapMin = dagen.map(k => map[k] ? slaapMinuten(map[k]) : null).filter(x => x != null), slaapGem = slaapMin.length ? Math.round(slaapMin.reduce((a, b) => a + b, 0) / slaapMin.length) : null;
  const uurKort = m => Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0");
  const nx = talkVolgendeDatum();

  const W = 595.28, H = 841.89, M = 46, CW = W - 2 * M, BOTTOM = 56;
  const TH = exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const ZK = {groen: [0.231, 0.541, 0.341], oranje: [0.824, 0.478, 0.122], rood: [0.776, 0.157, 0.157]};
  const SOFT = c => c.map(v => v + (1 - v) * 0.86);
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const pages = []; let ops = [], y = 0;
  const txt = (s, x, yy, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const T = (s, x, yy, size, font, c) => txt(cp1252(s), x, yy, size, font, c);
  const rrect = (x, yy, w, h, rd, c) => { rd = Math.min(rd, h / 2, w / 2); const k = 0.5523 * rd; ops.push(col(c) + " rg " + [f(x+rd)+" "+f(yy)+" m", f(x+w-rd)+" "+f(yy)+" l", f(x+w-rd+k)+" "+f(yy)+" "+f(x+w)+" "+f(yy+rd-k)+" "+f(x+w)+" "+f(yy+rd)+" c", f(x+w)+" "+f(yy+h-rd)+" l", f(x+w)+" "+f(yy+h-rd+k)+" "+f(x+w-rd+k)+" "+f(yy+h)+" "+f(x+w-rd)+" "+f(yy+h)+" c", f(x+rd)+" "+f(yy+h)+" l", f(x+rd-k)+" "+f(yy+h)+" "+f(x)+" "+f(yy+h-rd+k)+" "+f(x)+" "+f(yy+h-rd)+" c", f(x)+" "+f(yy+rd)+" l", f(x)+" "+f(yy+rd-k)+" "+f(x+rd-k)+" "+f(yy)+" "+f(x+rd)+" "+f(yy)+" c"].join(" ") + " f"); };
  const circle = (cx, cy, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + f(cx+rd)+" "+f(cy)+" m "+f(cx+rd)+" "+f(cy+k)+" "+f(cx+k)+" "+f(cy+rd)+" "+f(cx)+" "+f(cy+rd)+" c "+f(cx-k)+" "+f(cy+rd)+" "+f(cx-rd)+" "+f(cy+k)+" "+f(cx-rd)+" "+f(cy)+" c "+f(cx-rd)+" "+f(cy-k)+" "+f(cx-k)+" "+f(cy-rd)+" "+f(cx)+" "+f(cy-rd)+" c "+f(cx+k)+" "+f(cy-rd)+" "+f(cx+rd)+" "+f(cy-k)+" "+f(cx+rd)+" "+f(cy)+" c f"); };
  const hline = (x1, x2, yy, c, w) => ops.push(col(c) + " RG " + (w || 0.7) + " w " + f(x1) + " " + f(yy) + " m " + f(x2) + " " + f(yy) + " l S");
  const kort = (s, size, bold, maxW) => { let b = cp1252(s); if(textW(b, size, bold) <= maxW) return b; while(b.length && textW(b + "...", size, bold) > maxW) b = b.slice(0, -1); return b + "..."; };
  const midden = (s, cx, yy, size, font, c) => { const b = cp1252(s); txt(b, cx - textW(b, size, font === "F2") / 2, yy, size, font, c); };
  const kopRegel = vt("Samenvatting 1-op-1 · ", "1-to-1 summary · ") + dayMonth(van) + " – " + dayMonth(tot);
  const newPage = first => {
    ops = []; pages.push(ops);
    if(first){ y = H - M; return; }
    T(kopRegel, M, H - 32, 8.5, "F1", MUT); hline(M, M + CW, H - 40, LINE); y = H - 60;
  };
  const ruimte = h => { if(y - h < BOTTOM) newPage(false); };
  const sectie = (titel, sub) => {
    ruimte(60); y -= 8;
    rrect(M, y - 22, 4, 18, 2, TH.rgb);
    T(titel, M + 12, y - 16, 13, "F2", INK);
    if(sub) T(sub, M + 12 + textW(cp1252(titel), 13, true) + 10, y - 16, 9, "F1", MUT);
    y -= 32;
  };
  const scoreKleur = n => n == null ? MUT : n >= 7 ? ZK.groen : n >= 5 ? ZK.oranje : ZK.rood;
  const dagKort = k => parseKey(k).toLocaleDateString(locale(), {weekday: "short", day: "numeric", month: "short"}).replace(/\./g, "");

  // ---- pagina 1: kop ----
  newPage(true);
  const bandH = 84, dc = daysClean(tot);
  rrect(M, y - bandH, CW, bandH, 12, TH.rgb);
  T(vt("Samenvatting voor mijn 1-op-1", "Summary for my 1-to-1"), M + 22, y - 36, 21, "F2", WHITE);
  T(cap(dayMonth(van)) + " – " + dayMonth(tot) + " " + tot.slice(0, 4), M + 22, y - 58, 11, "F1", WHITE);
  const LS = 50, lx = M + CW - 16 - LS, ltop = y - (bandH - LS) / 2;
  pdfLogo(ops, lx, ltop, LS, rrect, circle);
  if(dc !== null){
    const big = cp1252(String(dc)), small = cp1252(dc === 1 ? vt("dag clean", "day clean") : vt("dagen clean", "days clean")), rx = lx - 14;
    txt(big, rx - textW(big, 24, true), y - 40, 24, "F2", WHITE);
    txt(small, rx - textW(small, 9.5, false), y - 56, 9.5, "F1", WHITE);
  }
  y -= bandH + 12;
  {
    const gap = 10, bw = (CW - 2 * gap) / 3, bh = 42;
    [[vt("NAAM", "NAME"), (settings.naam || "").trim() || "–"], [vt("VOLGENDE 1-OP-1", "NEXT 1-TO-1"), nx ? cap(parseKey(nx).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long"})) : "–"],
     [vt("GEMAAKT OP", "MADE ON"), cap(dayMonth(todayKey()))]].forEach(([k, v], i) => {
      const x = M + i * (bw + gap);
      rrect(x, y - bh, bw, bh, 8, TH.soft);
      T(k, x + 12, y - 14, 7.5, "F2", MUT);
      txt(kort(v, 11.5, true, bw - 24), x + 12, y - 31, 11.5, "F2", INK);
    });
    y -= bh + 10;
  }

  // ---- in één oogopslag ----
  sectie(vt("In één oogopslag", "At a glance"));
  {
    const trek = ing.filter(e => hadIt(e, "q5")).length, trig = ing.filter(e => hadIt(e, "q6")).length;
    const kleurN = {groen: 0, oranje: 0, rood: 0}; dagen.forEach(k => { if(kleurN[kl[k]] != null) kleurN[kl[k]]++; });
    const tegels = [
      [gem != null ? nl1(gem) : "–", vt("gemiddeld cijfer", "average score"), scoreKleur(gem)],
      [ing.length + "/7", vt("dagen ingevuld", "days filled in"), TH.rgb],
      [String(meet), meet === 1 ? vt("meeting bezocht", "meeting attended") : vt("meetings bezocht", "meetings attended"), TH.rgb],
      [String(trek), trek === 1 ? vt("dag met trek", "day with cravings") : vt("dagen met trek", "days with cravings"), trek ? ZK.oranje : ZK.groen],
      [String(trig), trig === 1 ? vt("dag met triggers", "day with triggers") : vt("dagen met triggers", "days with triggers"), trig ? ZK.oranje : ZK.groen],
      [String(slaap.goed) + "/" + (slaap.goed + slaap.matig + slaap.slecht), vt("nachten goed geslapen", "nights slept well"), slaap.slecht ? ZK.oranje : TH.rgb]
    ];
    const gap = 8, n = 3, bw = (CW - (n - 1) * gap) / n, bh = 54;
    tegels.forEach(([g, l, c], i) => {
      const x = M + (i % n) * (bw + gap), yy = y - Math.floor(i / n) * (bh + gap);
      rrect(x, yy - bh, bw, bh, 9, SOFT(c));
      T(g, x + 14, yy - 28, 20, "F2", c);
      T(l, x + 14, yy - 44, 9, "F1", INK);
    });
    y -= 2 * bh + gap + 6;
    if(cijfers.length){
      const lijst = ing.filter(e => patCijfer(e) != null);
      const laag = lijst.reduce((a, e) => patCijfer(e) < patCijfer(a) ? e : a, lijst[0]), hoog = lijst.reduce((a, e) => patCijfer(e) > patCijfer(a) ? e : a, lijst[0]);
      T(vt("Beste dag: ", "Best day: ") + dagKort(hoog.date) + " (" + patCijfer(hoog) + ")   ·   " + vt("Zwaarste dag: ", "Hardest day: ") + dagKort(laag.date) + " (" + patCijfer(laag) + ")", M, y - 10, 9.5, "F1", MUT);
      y -= 18;
    }
    if(slaapGem != null){
      const kort = slaapMin.filter(m => m < 360).length;
      T(vt("Slaap: gemiddeld " + slaapUrenTekst(slaapGem) + " per nacht", "Sleep: on average " + slaapUrenTekst(slaapGem) + " a night") + (kort ? vt(", " + kort + (kort === 1 ? " nacht" : " nachten") + " korter dan 6 uur", ", " + kort + (kort === 1 ? " night" : " nights") + " shorter than 6 hours") : ""), M, y - 10, 9.5, "F1", kort ? ZK.oranje : MUT);
      y -= 18;
    }
    if(kleurN.groen + kleurN.oranje + kleurN.rood){
      let x = M; T(vt("Stoplicht:", "Traffic light:"), x, y - 10, 9.5, "F1", MUT); x += 62;
      [["groen", vt("groen", "green")], ["oranje", vt("oranje", "orange")], ["rood", vt("rood", "red")]].forEach(([z, l]) => {
        circle(x + 5, y - 7, 5, ZK[z]); const s = kleurN[z] + "x " + l; T(s, x + 14, y - 10, 9.5, "F1", INK); x += 24 + textW(cp1252(s), 9.5, false);
      });
      y -= 18;
    }
  }

  // ---- de week in beeld: tabel ----
  sectie(vt("De week in beeld", "The week at a glance"));
  {
    const kol = [[vt("Dag", "Day"), 86], [vt("Cijfer", "Score"), 46], [vt("Slaap", "Sleep"), 92], [vt("Stoplicht", "Light"), 64], [vt("Trek", "Cravings"), 56], [vt("Triggers", "Triggers"), 56], [vt("Meeting", "Meeting"), 0]];
    kol[kol.length - 1][1] = CW - kol.slice(0, -1).reduce((s, k) => s + k[1], 0);
    const rh = 24;
    rrect(M, y - rh, CW, rh, 6, TH.soft);
    let x = M; kol.forEach(([t, w]) => { T(t, x + 8, y - 16, 8.5, "F2", MUT); x += w; });
    y -= rh;
    dagen.forEach((k, r) => {
      const e = map[k], leeg = !(e && hasContent(e)), cy = y - rh / 2;
      if(r % 2) rrect(M, y - rh, CW, rh, 0, [0.975, 0.972, 0.965]);
      let x = M;
      const cel = (fn) => { fn(x, kol[cel.i][1]); x += kol[cel.i][1]; cel.i++; }; cel.i = 0;
      cel((x0) => T(cap(dagKort(k)), x0 + 8, cy - 3.5, 9.5, "F2", leeg ? MUT : INK));
      if(k > todayKey() && leeg){ T(vt("nog niet geweest", "still to come"), x + 8, cy - 3.5, 9, "F3", MUT); y -= rh; return; }
      cel((x0, w) => { const n = e ? patCijfer(e) : null; if(n == null){ T("–", x0 + 8, cy - 3.5, 9.5, "F1", MUT); return; } circle(x0 + 17, cy, 9, scoreKleur(n)); midden(String(n), x0 + 17, cy - 3.3, 9, "F2", WHITE); });
      cel((x0) => { const s = e ? slaapKwaliteit(e) : "", m = e ? slaapMinuten(e) : null; const t = [s ? cap(och(s)) : "", m != null ? uurKort(m) : ""].filter(Boolean).join("  "); T(t || "–", x0 + 8, cy - 3.5, 9.5, "F1", s === "slecht" || (m != null && m < 360) ? ZK.rood : t ? INK : MUT); });
      cel((x0) => { const z = kl[k]; if(!ZK[z]){ T("–", x0 + 8, cy - 3.5, 9.5, "F1", MUT); return; } circle(x0 + 13, cy, 5.5, ZK[z]); T(vt(z, {groen: "green", oranje: "orange", rood: "red"}[z]), x0 + 23, cy - 3.5, 9, "F1", INK); });
      cel((x0) => { if(!e || !hadIt(e, "q5")){ T(leeg ? "–" : vt("nee", "no"), x0 + 8, cy - 3.5, 9.5, "F1", MUT); return; } const st = patSterkte(e); T(st ? st + "/10" : vt("ja", "yes"), x0 + 8, cy - 3.5, 9.5, "F2", st >= 7 ? ZK.rood : ZK.oranje); });
      cel((x0) => { T(!e || leeg ? "–" : hadIt(e, "q6") ? vt("ja", "yes") : vt("nee", "no"), x0 + 8, cy - 3.5, 9.5, e && hadIt(e, "q6") ? "F2" : "F1", e && hadIt(e, "q6") ? ZK.oranje : MUT); });
      cel((x0, w) => { const n = e ? meetBezoekenVan(e) : 0; T(n ? (n > 1 ? n + "x" : vt("ja", "yes")) : "–", x0 + 8, cy - 3.5, 9.5, n ? "F2" : "F1", n ? ZK.groen : MUT); });
      y -= rh;
    });
    hline(M, M + CW, y, LINE);
    y -= 8;
  }

  // ---- wat valt op ----
  const rij = (q, i) => { const qq = QUESTIONS.find(x => x.id === q); return qq && qq.rows && qq.rows[i] ? i : -1; };
  const telLijst = (bronnen) => tally(ing.map(e => [].concat(...bronnen.filter(([q, i]) => rij(q, i) >= 0 && (q !== "q5" && q !== "q6" && q !== "q3" || hadIt(e, q))).map(([q, i]) => picked(e, q, i)))));
  const opvallend = [
    [vt("Triggers", "Triggers"), telLijst([["q6", 0]])],
    [vt("Gevoelens", "Feelings"), telLijst([["q6", 1], ["q3", 1]])],
    [vt("Wat hielp bij trek of triggers", "What helped with cravings or triggers"), telLijst([["q5", 2], ["q6", 2]])],
    [vt("HALT", "HALT"), telLijst([["q6", 3]])],
    [vt("Dankbaar voor", "Grateful for"), telLijst([["q10", 0]])],
    [vt("Wat ging goed", "What went well"), telLijst([["q7", 0]])]
  ].filter(([, l]) => l.length);
  if(opvallend.length){
    sectie(vt("Wat valt op", "What stands out"), vt("hoe vaak in deze 7 dagen", "how often in these 7 days"));
    opvallend.forEach(([titel, lijst]) => {
      const tekst = lijst.slice(0, 5).map(([it, n]) => cap(vItem(it)) + " (" + n + "x)").join(",  ");
      const regels = wrap(tekst, 10, false, CW - 150);
      ruimte(regels.length * 14 + 6);
      T(titel, M, y - 11, 9.5, "F2", TH.rgb);
      regels.forEach((r, i) => txt(r, M + 150, y - 11 - i * 14, 10, "F1", INK));
      y -= regels.length * 14 + 6;
    });
    y -= 4;
  }

  // ---- weekdoelen ----
  const weken = dagen.map(mondayOf).filter((w, i, a) => a.indexOf(w) === i), doelen = [], terug = [];
  weken.forEach(w => { const d = weekData(w); d.goals.forEach(g => { const o = doelen.find(x => x.text === g.text); if(!o) doelen.push(Object.assign({}, g)); else if(g.done) o.done = g.done; }); if(d.reflect && (d.reflect.how || (d.reflect.text || "").trim())) terug.push(d.reflect); });
  if(doelen.length){
    sectie(vt("Weekdoelen", "Weekly goals"), doelen.filter(g => g.done).length + vt(" van ", " of ") + doelen.length + vt(" gelukt", " done"));
    doelen.forEach(g => {
      const regels = wrap(g.text, 10.5, true, CW - 110), extra = g.stuck && g.stuck.trim() ? wrap(vt("Loop ik tegenaan: ", "Stuck on: ") + g.stuck.trim(), 9.5, false, CW - 110) : [];
      const h = regels.length * 14 + extra.length * 13 + 14;
      ruimte(h + 6);
      rrect(M, y - h, CW, h, 8, [0.975, 0.972, 0.965]);
      const c = g.done ? ZK.groen : ZK.oranje, lab = g.done ? vt("Gelukt", "Done") : vt("Nog open", "Still open");
      rrect(M + 10, y - 7 - 16, 72, 16, 8, SOFT(c)); midden(lab, M + 46, y - 7 - 11.5, 8.5, "F2", c);
      regels.forEach((r, i) => txt(r, M + 94, y - 18 - i * 14, 10.5, "F2", INK));
      extra.forEach((r, i) => txt(r, M + 94, y - 18 - regels.length * 14 - i * 13, 9.5, "F1", MUT));
      y -= h + 6;
    });
    terug.forEach(r => {
      const how = {goed: vt("Goed gelukt", "Went well"), deels: vt("Deels gelukt", "Partly"), niet: vt("Niet gelukt", "Didn't work")}[r.how] || "";
      wrap(vt("Terugblik: ", "Review: ") + [how, (r.text || "").trim()].filter(Boolean).join(". "), 9.5, false, CW).forEach(l => { ruimte(14); txt(l, M, y - 10, 9.5, "F1", MUT); y -= 13; });
    });
    y -= 4;
  }

  // ---- bespreekpunten ----
  const open = (settings.talk || []).filter(t => !t.done).sort((a, b) => (b.prio ? 1 : 0) - (a.prio ? 1 : 0));
  sectie(vt("Wat ik wil bespreken", "What I want to discuss"));
  if(!open.length){ T(vt("Geen open punten.", "No open points."), M, y - 10, 10, "F1", MUT); y -= 18; }
  open.forEach((t, i) => {
    const regels = wrap(t.text, 10.5, !!t.prio, CW - 30);
    ruimte(regels.length * 14 + 6);
    circle(M + 9, y - 7, 9, t.prio ? [0.878, 0.627, 0.125] : TH.rgb); midden(String(i + 1), M + 9, y - 10.3, 9, "F2", WHITE);
    regels.forEach((r, j) => txt(r, M + 26, y - 11 - j * 14, 10.5, t.prio ? "F2" : "F1", INK));
    if(t.prio) T(vt("belangrijk", "important"), M + 26 + textW(regels[0], 10.5, true) + 8, y - 11, 8.5, "F2", [0.75, 0.5, 0.06]);
    y -= regels.length * 14 + 8;
  });

  // ---- per dag: alles wat is ingevuld ----
  if(ing.length){
    newPage(false);
    sectie(vt("Per dag", "Day by day"), vt("wat ik in mijn dagbeschouwing schreef", "what I wrote in my daily reflection"));
    ing.forEach((e, di) => {
      ruimte(80);
      if(di) y -= 6;
      const n = patCijfer(e);
      rrect(M, y - 28, CW, 28, 8, TH.soft);
      T(cap(parseKey(e.date).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long"})), M + 12, y - 18.5, 11.5, "F2", INK);
      if(n != null){ circle(M + CW - 18, y - 14, 10, scoreKleur(n)); midden(String(n), M + CW - 18, y - 17.5, 10, "F2", WHITE); T(vt("cijfer", "score"), M + CW - 62, y - 17.5, 8.5, "F1", MUT); }
      y -= 38;
      const sr = typeof slaapRegel === "function" ? slaapRegel(e) : "";
      let ochR = typeof ochtendRegels === "function" ? ochtendRegels(e) : null;
      if(sr){ ochR = [[vt("Slaap", "Sleep"), sr]].concat((ochR || []).filter(r => r[0] !== vt("Slaap", "Sleep"))); }
      if(ochR){
        ochR.forEach(([k, v]) => wrap(k + ": " + v, 9.5, false, CW - 12).forEach(l => { ruimte(13); txt(l, M + 6, y - 9.5, 9.5, "F1", MUT); y -= 13; }));
        y -= 4;
      }
      QUESTIONS.forEach(q => {
        const a = e.answers && e.answers[q.id], tx = ((a && a.text) || "").trim();
        if(q.doneOn && a && q.doneOn.indexOf(a.level) >= 0 && (!tx || [q.noText, q.noTextEn, q.yesText, q.yesTextEn].indexOf(tx) >= 0)) return;   // gewoon "nee": weglaten
        const regels = answerLines(q, e).filter(l => l.k !== "empty");
        if(!regels.length) return;
        const tl = wrap(qTitle(q), 9.5, true, CW - 12);
        ruimte(tl.length * 13 + 18);
        tl.forEach(l => { txt(l, M + 6, y - 9.5, 9.5, "F2", TH.rgb); y -= 13; });
        regels.forEach(l => {
          if(l.k === "blank"){ y -= 6; return; }
          const ins = l.k === "bullet" ? 20 : 6, bold = l.k === "label" || l.k === "head";
          wrap(l.t, 10, bold, CW - ins - 6).forEach((t, j) => {
            ruimte(13.5);
            if(l.k === "bullet" && j === 0) txt(cp1252("•"), M + 10, y - 10, 10, "F2", TH.rgb);
            txt(t, M + ins, y - 10, 10, bold ? "F2" : "F1", INK);
            y -= 13.5;
          });
        });
        y -= 5;
      });
    });
  }

  // ---- voettekst ----
  pages.forEach((p, i) => {
    ops = p;
    hline(M, M + CW, 40, LINE, 0.5);
    T(vt("Mijn dag", "My day") + ((settings.naam || "").trim() ? "  ·  " + settings.naam.trim() : ""), M, 28, 8, "F1", MUT);
    const pg = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + pages.length);
    txt(pg, M + CW - textW(pg, 8, false), 28, 8, "F1", MUT);
  });
  return pdfAssemble(pages, W, H);
}
window.__talkPdf = talkSamenvattingPdf;
