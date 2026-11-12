// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- mijn patronen ----------
// Wat er over een langere periode uit de dagbeschouwingen naar voren komt. Alleen lezen: er wordt niets opgeslagen.
// Hergebruikt picked() / tally() / barList() / hadIt() / tile() / note() uit maandoverzicht.js.
// picked() geeft altijd de Nederlandse sleutel terug, dus Nederlandse en Engelse antwoorden tellen samen.
let patPeriode = "3m";
const PAT_MIN = 7;   // minder ingevulde dagen: vriendelijke melding in plaats van grafieken
const patGem = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const patCijfer = e => { const n = parseInt(e.cijfer, 10); return n > 0 && n <= 10 ? n : null; };
const patSterkte = e => { const n = parseInt((picked(e, "q5", 0)[0] || ""), 10); return n > 0 ? n : null; };
const patTriggers = e => hadIt(e, "q6") ? picked(e, "q6", 0).concat(picked(e, "q6", 3)) : [];          // triggers + HALT-check
const patGevoelens = e => (hadIt(e, "q6") ? picked(e, "q6", 1) : []).concat(hadIt(e, "q3") ? picked(e, "q3", 1) : []);
const patAanpak = e => (hadIt(e, "q5") ? picked(e, "q5", 2) : []).concat(hadIt(e, "q6") ? picked(e, "q6", 2) : []);
const patMaandNaam = mk => { const [y, m] = mk.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(locale(), {month: "short"}); };
const patPct = (a, b) => b ? Math.round(a / b * 100) : 0;

function patVan(tk){
  if(patPeriode === "4w") return addDaysKey(tk, -27);
  if(patPeriode === "3m") return addDaysKey(addMonthsKey(tk, -3), 1);
  return "0000-00-00";
}

async function renderPatterns(){
  const box = $("patBox"); if(!box) return;
  box.innerHTML = '<div class="empty">' + vt("Laden…", "Loading…") + '</div>';
  const map = await allDays();
  const tk = todayKey(), van = patVan(tk);
  const days = Object.values(map).filter(e => e && e.date && e.date >= van && e.date <= tk && hasContent(e)).sort((a, b) => a.date < b.date ? -1 : 1);
  box.innerHTML = "";

  // periode kiezen
  const sc = el("div", "scale"); sc.style.marginTop = "0";
  [["4w", "4 weken", "4 weeks"], ["3m", "3 maanden", "3 months"], ["alles", "Alles", "All"]].forEach(([k, nl, en]) => {
    const b = el("button", patPeriode === k ? "on" : null, vt(nl, en)); b.type = "button";
    b.onclick = () => { patPeriode = k; renderPatterns(); };
    sc.appendChild(b);
  });
  const top = el("div", "card"); top.appendChild(sc);
  const sub = note(isEn() ? aantal(days.length, "", "", "day", "days") + " filled in in this period." : days.length + (days.length === 1 ? " dag" : " dagen") + " ingevuld in deze periode.");
  sub.style.cssText = "margin-top:10px;font-size:14px"; top.appendChild(sub);
  box.appendChild(top);

  if(days.length < PAT_MIN){
    box.appendChild(emptyState("target", vt("Nog even volhouden", "Keep going for a bit"),
      isEn() ? "After " + PAT_MIN + " filled-in days you will see your patterns here. You have " + days.length + " now. Every day you fill in makes the picture clearer."
             : "Na " + PAT_MIN + " ingevulde dagen zie je hier je patronen. Je hebt er nu " + days.length + ". Elke dag die je invult, maakt het beeld duidelijker."));
    return;
  }

  const zDays = days.filter(e => hadIt(e, "q5")), tDays = days.filter(e => hadIt(e, "q6"));
  const scored = days.filter(e => patCijfer(e) !== null);
  const card = titel => { const c = el("div", "card"); c.appendChild(el("div", "qtitle", titel)); box.appendChild(c); return c; };

  // ---- gegevens die meerdere kaarten gebruiken ----
  const DAGVOLG = [1, 2, 3, 4, 5, 6, 0];
  const perDag = DAGVOLG.map(d => {
    const ds = days.filter(e => parseKey(e.date).getDay() === d);
    return {d, n: ds.length, z: ds.filter(e => hadIt(e, "q5")).length, gem: patGem(ds.map(patCijfer).filter(x => x !== null))};
  });
  // een dag heet pas "vaak zwaarder" bij minstens 2 keer zucht én duidelijk vaker dan gemiddeld (geen conclusie uit 1 dag)
  const zGem = days.length ? days.filter(e => hadIt(e, "q5")).length / days.length : 0;
  const zwaarsteDag = perDag.filter(x => x.n >= 2 && x.z >= 2 && x.z / x.n >= zGem * 1.3).sort((a, b) => (b.z / b.n) - (a.z / a.n) || (a.gem || 10) - (b.gem || 10))[0];
  const dagdelen = tally(zDays.map(e => picked(e, "q5", 1)));
  const triggers = tally(days.map(patTriggers));
  const gevoelens = tally(days.map(patGevoelens));
  const aanpak = tally(days.map(patAanpak));
  // gemiddelde sterkte van de zucht per aanpak (alleen dagen waarop de sterkte is ingevuld, minstens 2 keer gebruikt)
  const perAanpak = {};
  zDays.forEach(e => { const s = patSterkte(e); if(s === null) return; Array.from(new Set(picked(e, "q5", 2))).forEach(a => { (perAanpak[a] = perAanpak[a] || []).push(s); }); });
  const helpt = Object.entries(perAanpak).filter(([, l]) => l.length >= 2).map(([a, l]) => [a, patGem(l), l.length]).sort((x, y) => x[1] - y[1] || y[2] - x[2]);
  // trend van het cijfer: eerste helft van de periode tegen tweede helft
  const half = Math.floor(scored.length / 2);
  const gem1 = scored.length >= 6 ? patGem(scored.slice(0, half).map(patCijfer)) : null, gem2 = scored.length >= 6 ? patGem(scored.slice(half).map(patCijfer)) : null;
  const gemAlles = patGem(scored.map(patCijfer));

  // ---- 1. in het kort ----
  const zinnen = [];
  if(gemAlles !== null){
    const trend = gem1 === null ? "" : gem2 - gem1 >= 0.3 ? vt(", en dat gaat de goede kant op", ", and that is heading in the right direction")
      : gem1 - gem2 >= 0.3 ? vt(". De laatste tijd ligt het wat lager; dat mag, en het is goed om te bespreken", ". Lately it has been a bit lower; that's okay, and it's worth talking about")
      : vt(", en dat is redelijk stabiel", ", and that is fairly steady");
    zinnen.push(vt("In deze periode gaf je je dagen gemiddeld een " + nl1(gemAlles), "In this period you gave your days an average of " + nl1(gemAlles)) + trend + ".");
  }
  if(zDays.length){
    const delen = [];
    if(dagdelen.length) delen.push(vItem(dagdelen[0][0]));
    if(zwaarsteDag) delen.push(vt("op " + dayName(zwaarsteDag.d), "on " + dayName(zwaarsteDag.d) + "s"));
    let z = isEn() ? "You had cravings on " + aantal(zDays.length, "", "", "day", "days") + (delen.length ? ", most often " + delen.join(" and ") : "")
                   : "Je had op " + zDays.length + (zDays.length === 1 ? " dag" : " dagen") + " zucht" + (delen.length ? ", het vaakst " + delen.join(" en ") : "");
    if(triggers.length) z += vt(". De trigger die het vaakst terugkomt is ‘", ". The trigger that comes back most often is ‘") + vItem(triggers[0][0]) + "’";
    zinnen.push(z + ".");
  } else if(days.length) zinnen.push(vt("Je had in deze periode geen dagen met zucht. Mooi om te zien.", "You had no days with cravings in this period. Good to see."));
  if(helpt.length) zinnen.push(vt("Bij ‘", "With ‘") + cap(vItem(helpt[0][0])) + vt("’ was de zucht gemiddeld het minst sterk (", "’ the craving was the weakest on average (") + nl1(helpt[0][1]) + vt(" uit 10).", " out of 10)."));
  else if(aanpak.length) zinnen.push(vt("Wat je het vaakst deed bij zucht of triggers: ‘", "What you did most often with cravings or triggers: ‘") + cap(vItem(aanpak[0][0])) + "’.");
  {
    const c = el("div", "card"); c.style.cssText = "background:var(--accent-soft);border-color:transparent";
    c.appendChild(el("div", "qtitle", vt("In het kort", "In short")));
    zinnen.slice(0, 3).forEach(t => { const p = note(t); p.style.cssText = "margin-top:8px;font-size:16px;color:var(--ink);line-height:1.5"; c.appendChild(p); });
    const n = note(vt("Om voor te lezen bij je sponsor of in je 1-op-1.", "To read out to your sponsor or in your 1-to-1.")); n.style.marginTop = "10px"; c.appendChild(n);
    box.appendChild(c);
  }

  // ---- 2. gaat het beter? (per maand) ----
  const maanden = Array.from(new Set(days.map(e => e.date.slice(0, 7)))).sort();
  if(maanden.length >= 2){
    const c = card(vt("Gaat het beter?", "Is it getting better?"));
    const rijen = maanden.map(mk => {
      const ds = days.filter(e => e.date.slice(0, 7) === mk), zs = ds.filter(e => hadIt(e, "q5")), ts = ds.filter(e => hadIt(e, "q6"));
      return {mk, n: ds.length, gem: patGem(ds.map(patCijfer).filter(x => x !== null)), z: zs.length, zp: zs.length / ds.length,
        st: patGem(zs.map(patSterkte).filter(x => x !== null)), t: ts.length, tp: ts.length / ds.length};
    });
    // pijltje: vergeleken met de maand ervoor; groen = beter (hoger cijfer, minder/zwakkere zucht, minder triggers)
    const pijl = (nu, vorig, hogerIsBeter) => {
      if(nu === null || vorig === null || nu === undefined || vorig === undefined || Math.abs(nu - vorig) < 0.05) return null;
      const op = nu > vorig, beter = op === hogerIsBeter;
      const s = el("span", null, op ? " ▲" : " ▼"); s.style.color = beter ? "var(--accent)" : "var(--warm)"; s.style.fontSize = "12px";
      s.setAttribute("aria-label", beter ? vt("beter", "better") : vt("minder goed", "not as good")); return s;
    };
    const wrap = el("div"); wrap.style.cssText = "overflow-x:auto;margin-top:10px;-webkit-overflow-scrolling:touch";
    const tb = el("table"); tb.style.cssText = "border-collapse:collapse;width:100%;font-size:14px;font-variant-numeric:tabular-nums";
    const th = (t, links) => { const x = el("th", null, t); x.style.cssText = "text-align:" + (links ? "left" : "right") + ";font-weight:600;color:var(--muted);padding:6px 4px;white-space:nowrap;font-size:13px"; return x; };
    const hr = el("tr"); hr.appendChild(th("", true)); rijen.forEach(r => hr.appendChild(th(patMaandNaam(r.mk))));
    tb.appendChild(hr);
    [[vt("Gemiddeld cijfer", "Average score"), r => r.gem !== null ? nl1(r.gem) : "–", r => r.gem, true],
     [vt("Dagen met zucht", "Days with cravings"), r => r.z + " (" + patPct(r.z, r.n) + "%)", r => r.zp, false],
     [vt("Sterkte zucht", "Craving strength"), r => r.st !== null ? nl1(r.st) : "–", r => r.st, false],
     [vt("Dagen met triggers", "Days with triggers"), r => r.t + " (" + patPct(r.t, r.n) + "%)", r => r.tp, false]].forEach(([lab, tekst, waarde, hoger]) => {
      const tr = el("tr"); tr.style.borderTop = "1px solid var(--line)";
      const l = el("td", null, lab); l.style.cssText = "padding:8px 4px;white-space:nowrap"; tr.appendChild(l);
      rijen.forEach((r, i) => {
        const td = el("td", null, tekst(r)); td.style.cssText = "padding:8px 4px;text-align:right;white-space:nowrap";
        if(i > 0){ const p = pijl(waarde(r), waarde(rijen[i - 1]), hoger); if(p) td.appendChild(p); }
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    wrap.appendChild(tb); c.appendChild(wrap);
    const n = note(vt("▲▼ vergeleken met de maand ervoor. Groen is beter. Percentages zijn van de dagen die je die maand invulde.", "▲▼ compared with the month before. Green is better. Percentages are of the days you filled in that month."));
    n.style.fontSize = "13px"; c.appendChild(n);
  }

  // ---- 3. top 5 triggers en gevoelens ----
  if(triggers.length || gevoelens.length){
    const c = card(vt("Wat speelt er het vaakst?", "What comes up most often?"));
    if(triggers.length) c.appendChild(barList(vt("Mijn top 5 triggers (met HALT)", "My top 5 triggers (with HALT)"), triggers));
    if(gevoelens.length) c.appendChild(barList(vt("Mijn top 5 gevoelens", "My top 5 feelings"), gevoelens));
    c.querySelector(".label").style.marginTop = "4px";
  }

  // ---- 4. wanneer is het zwaar? ----
  if(zDays.length || scored.length){
    const c = card(vt("Wanneer is het zwaar?", "When is it hard?"));
    if(zwaarsteDag){ const z = note(vt(cap(dayName(zwaarsteDag.d)) + " is vaak zwaarder: op " + zwaarsteDag.z + " van de " + zwaarsteDag.n + " " + dayName(zwaarsteDag.d) + "en had je zucht.", dayName(zwaarsteDag.d) + "s are often harder: you had cravings on " + zwaarsteDag.z + " of " + zwaarsteDag.n + " " + dayName(zwaarsteDag.d) + "s.")); z.style.cssText = "margin-top:6px;font-size:16px;color:var(--ink)"; c.appendChild(z); }
    const kort = isEn() ? ["Su","Mo","Tu","We","Th","Fr","Sa"] : ["zo","ma","di","wo","do","vr","za"];
    const grid = el("div"); grid.style.cssText = "display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:12px;text-align:center";
    const maxR = Math.max(...perDag.map(x => x.n ? x.z / x.n : 0), 0.01);
    perDag.forEach(x => {
      const cel = el("div"); cel.style.cssText = "border-radius:10px;padding:6px 0;background:var(--bg);font-size:12px;line-height:1.4" + (zwaarsteDag && x.d === zwaarsteDag.d ? ";outline:2px solid var(--warm)" : "");
      const r = x.n ? x.z / x.n : 0;
      const bar = el("div"); bar.style.cssText = "height:36px;display:flex;align-items:flex-end;justify-content:center;margin-bottom:2px";
      const b = el("i"); b.style.cssText = "display:block;width:12px;border-radius:4px;background:var(--warm);height:" + Math.max(2, Math.round(r / maxR * 34)) + "px;opacity:" + (x.n ? 1 : .25); bar.appendChild(b);
      cel.appendChild(bar);
      cel.appendChild(el("div", null, kort[x.d])).style.fontWeight = "600";
      cel.appendChild(el("div", null, x.gem !== null ? nl1(x.gem) : "–")).style.color = "var(--muted)";
      grid.appendChild(cel);
    });
    c.appendChild(grid);
    const lg = note(vt("Balkje = hoe vaak er zucht was op die dag. Getal = je gemiddelde cijfer.", "Bar = how often you had cravings on that day. Number = your average score.")); lg.style.fontSize = "13px"; c.appendChild(lg);
    if(dagdelen.length) c.appendChild(barList(vt("Wanneer kwam de zucht?", "When did the cravings come?"), dagdelen));
  }

  // ---- 5. wat helpt mij? ----
  if(aanpak.length){
    const c = card(vt("Wat helpt mij?", "What helps me?"));
    c.appendChild(barList(vt("Wat ik het vaakst deed bij zucht of triggers", "What I did most often with cravings or triggers"), aanpak));
    c.querySelector(".label").style.marginTop = "4px";
    if(helpt.length){
      const l = el("div", "label", vt("Bij deze aanpak was de zucht het minst sterk", "With this approach the craving was weakest")); l.style.marginTop = "16px"; c.appendChild(l);
      helpt.slice(0, 3).forEach(([a, g, n]) => {
        const r = el("div"); r.style.cssText = "display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:15px";
        r.appendChild(el("span", null, cap(vItem(a))));
        const s = el("span", null, vt("gem. ", "avg. ") + nl1(g) + vt(" uit 10 (", " out of 10 (") + n + "×)"); s.style.cssText = "color:var(--muted);white-space:nowrap"; r.appendChild(s);
        c.appendChild(r);
      });
      const n = note(vt("Alleen aanpakken die je minstens 2 keer gebruikte, op dagen waarop je de sterkte invulde.", "Only approaches you used at least twice, on days when you filled in the strength.")); n.style.fontSize = "13px"; c.appendChild(n);
    }
  }

  // ---- 6. verbanden: zware dagen (≤5) tegen goede dagen (≥7) ----
  const laag = scored.filter(e => patCijfer(e) <= 5), hoog = scored.filter(e => patCijfer(e) >= 7);
  if(laag.length >= 2 && hoog.length >= 2){
    const c = card(vt("Verbanden", "Connections"));
    const uitleg = note(isEn() ? "What comes up more often on hard days (score 5 or lower, " + laag.length + " days) than on good days (7 or higher, " + hoog.length + " days)."
      : "Wat vaker voorkomt op zware dagen (cijfer 5 of lager, " + laag.length + " dagen) dan op goede dagen (7 of hoger, " + hoog.length + " dagen).");
    uitleg.style.marginTop = "4px"; c.appendChild(uitleg);
    const tel = (lijst, f) => { const m = {}; lijst.forEach(e => Array.from(new Set(f(e))).forEach(x => { m[x] = (m[x] || 0) + 1; })); return m; };
    const verschil = f => { const L = tel(laag, f), H = tel(hoog, f);
      return Object.keys(L).filter(k => L[k] >= 2).map(k => [k, L[k], H[k] || 0, L[k] / laag.length - (H[k] || 0) / hoog.length]).filter(x => x[3] > 0.1).sort((a, b) => b[3] - a[3]).slice(0, 4); };
    const blok = (titel, rijen) => {
      if(!rijen.length) return;
      const l = el("div", "label", titel); l.style.marginTop = "14px"; c.appendChild(l);
      rijen.forEach(([k, nl, nh]) => {
        const r = el("div"); r.style.cssText = "padding:6px 0;border-top:1px solid var(--line);font-size:15px";
        r.appendChild(el("div", null, cap(vItem(k)))).style.fontWeight = "600";
        const s = note(isEn() ? "on " + nl + " of your " + laag.length + " hard days, on " + nh + " of your " + hoog.length + " good days"
          : "op " + nl + " van je " + laag.length + " zware dagen, op " + nh + " van je " + hoog.length + " goede dagen");
        s.style.cssText = "margin-top:0;font-size:13px"; r.appendChild(s); c.appendChild(r);
      });
    };
    const vt1 = verschil(patTriggers), vt2 = verschil(patGevoelens);
    blok(vt("Triggers", "Triggers"), vt1); blok(vt("Gevoelens", "Feelings"), vt2);
    if(!vt1.length && !vt2.length){ const n = note(vt("Er springt nog niets duidelijk uit. Dat kan ook goed nieuws zijn.", "Nothing clearly stands out yet. That can be good news too.")); n.style.marginTop = "10px"; c.appendChild(n); }
  }

  // ---- 7. conflicten ----
  const cDays = days.filter(e => hadIt(e, "q3"));
  const wie = tally(cDays.map(e => picked(e, "q3", 0))), deel = tally(cDays.map(e => picked(e, "q3", 3)));
  if(wie.length || deel.length){
    const c = card(vt("Conflicten", "Conflicts"));
    const n = note(isEn() ? "You had a conflict on " + aantal(cDays.length, "", "", "day", "days") + "." : "Je had op " + cDays.length + (cDays.length === 1 ? " dag" : " dagen") + " een conflict."); n.style.marginTop = "4px"; c.appendChild(n);
    if(wie.length) c.appendChild(barList(vt("Met wie", "With whom"), wie));
    if(deel.length) c.appendChild(barList(vt("Wat was vaak mijn eigen deel", "What was often my own part"), deel));
  }

  const slot = note(vt("Dit zijn patronen, geen oordeel. Gebruik ze om te zien wat jou helpt.", "These are patterns, not a judgement. Use them to see what helps you."));
  slot.style.cssText = "margin:4px 2px 0;font-size:13px;text-align:center"; box.appendChild(slot);
}
