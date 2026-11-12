// ---------- mijlpaal-overzicht ----------
// Tik op de felicitatiekaart (of "Bekijk overzicht" bij een behaalde keytag) → overzicht over de hele pagina:
// keytag, eigen bericht per mijlpaal, wat je sindsdien hebt gedaan (tot de mijlpaaldatum) en de volgende mijlpaal.
// Alleen lezen uit allDays(); er wordt niets opgeslagen.

// welk soort mijlpaal is deze datum? (zelfde mijlpalen als milestones() in weergave.js)
function mpSoort(since, key){
  if(key === since) return {t: "welkom"};
  for(const n of [1, 30, 60, 90, 120, 150, 180, 270]) if(addDaysKey(since, n) === key) return {t: "d" + n};
  if(addMonthsKey(since, 18) === key) return {t: "m18"};
  for(let y = 1; y <= 60; y++) if(addMonthsKey(since, 12 * y) === key) return y === 1 ? {t: "j1"} : {t: "jn", jaren: y};
  return null;
}
function mpTitel(s){
  if(s.t === "welkom") return vt("Welkom!", "Welcome!");
  if(s.t === "d1") return vt("24 uur clean!", "24 hours clean!");
  if(s.t[0] === "d") return s.t.slice(1) + vt(" dagen clean!", " days clean!");
  if(s.t === "m18") return vt("18 maanden clean!", "18 months clean!");
  if(s.t === "j1") return vt("1 jaar clean!", "1 year clean!");
  return s.jaren + vt(" jaar clean!", " years clean!");
}
// kort, warm en nuchter; in de sfeer van NA ("alleen voor vandaag", "het werkt als je eraan werkt")
function mpBericht(s){
  const B = {
    welkom: ["Welkom. Hier begint het: één dag tegelijk. Je hoeft het niet alleen te doen.",
             "Welcome. This is where it begins: one day at a time. You don't have to do it alone."],
    d1: ["Je eerste 24 uur. Precies zo werkt het: alleen voor vandaag. Morgen doe je gewoon weer één dag.",
         "Your first 24 hours. That's exactly how it works: just for today. Tomorrow you simply do one more day."],
    d30: ["Een maand clean. De eerste weken zijn vaak het zwaarst, en jij bent erdoorheen gekomen. Blijf terugkomen: het werkt als je eraan werkt.",
          "One month clean. The first weeks are often the hardest, and you got through them. Keep coming back: it works if you work it."],
    d60: ["Twee maanden. Je bouwt aan iets: elke meeting en elk telefoontje telt mee. Wees trots, en blijf het dag voor dag doen.",
          "Two months. You're building something: every meeting and every phone call counts. Be proud, and keep doing it one day at a time."],
    d90: ["Drie maanden. Dat is geen geluk, dat is werk: meetings, bellen, eerlijk zijn. Het werkt als je eraan werkt, en jij laat zien dat het werkt.",
          "Three months. That isn't luck, that's work: meetings, calls, being honest. It works if you work it, and you're showing that it does."],
    d120: ["Vier maanden. Misschien voelt het soms gewoon, en dat is juist goed: herstel wordt je nieuwe gewoonte. Blijf doen wat werkt.",
           "Four months. Maybe it sometimes feels ordinary, and that's a good thing: recovery is becoming your new habit. Keep doing what works."],
    d150: ["Vijf maanden. Je bent er nog, elke dag opnieuw. Vergeet niet ook anderen te helpen: zo houd je het zelf vast.",
           "Five months. You're still here, every day anew. Don't forget to help others too: that's how you keep it yourself."],
    d180: ["Een half jaar clean. Kijk eens terug naar waar je stond. Dit heb jij gedaan, met hulp van de mensen om je heen. Alleen voor vandaag, nog steeds.",
           "Half a year clean. Look back at where you were. You did this, with help from the people around you. Just for today, still."],
    d270: ["Negen maanden. Je hebt laten zien dat je kunt volhouden, ook als het tegenzat. Blijf naar meetings gaan en blijf eerlijk; daar zit je kracht.",
           "Nine months. You've shown that you can keep going, even when things were hard. Keep going to meetings and keep being honest; that's where your strength is."],
    j1: ["Een jaar clean. Een heel jaar, opgebouwd uit gewone dagen waarop je de juiste keuze maakte. Gefeliciteerd. Het werkt als je eraan werkt.",
         "One year clean. A whole year, built from ordinary days on which you made the right choice. Congratulations. It works if you work it."],
    m18: ["Anderhalf jaar. Je herstel staat steviger, maar het blijft iets wat je elke dag doet. Geef door wat je hebt gekregen.",
          "A year and a half. Your recovery stands on firmer ground, but it's still something you do every day. Pass on what you were given."],
    jn: [(s.jaren || 2) + " jaar clean. Jaar na jaar, en nog steeds alleen voor vandaag. Jouw verhaal kan iemand anders hoop geven.",
         (s.jaren || 2) + " years clean. Year after year, and still just for today. Your story can give someone else hope."]
  };
  const b = B[s.t] || B.d30;
  return vt(b[0], b[1]);
}
// de keytag bij deze mijlpaal (24 uur, 120 en 150 dagen hebben er geen)
function mpKeytag(since, key, s){
  if(s.t === "jn") return keytagList(since).filter(t => t.years !== undefined).map(t => Object.assign({}, t, {big: String(s.jaren), label: s.jaren + vt(" jaar", " years")}))[0];
  return keytagList(since).find(t => t.key === key && t.years === undefined) || null;
}
// tellen vanaf de eerste ingevulde dagbeschouwing tot en met de mijlpaaldatum
function mpTelling(map, tot){
  const days = Object.values(map).filter(e => e && e.date && e.date <= tot && hasContent(e)).sort((a, b) => a.date < b.date ? -1 : 1);
  const q4has = (e, item) => { const t = (e.answers && e.answers.q4 && e.answers.q4.text) || ""; return t.split("\n").some(l => itemVariants(item).some(v => l.trim().toLowerCase().startsWith("- " + v.toLowerCase()))); };
  let meetings = 0; const plaatsen = {};
  days.forEach(e => {
    const p = meetingPlacesOf(e); if(p === null) return;
    meetings += p.length ? p.length : 1;   // meeting zonder plaats telt als 1, anders elke plaats
    p.forEach(x => { plaatsen[x] = (plaatsen[x] || 0) + 1; });
  });
  return {
    eerste: days.length ? days[0].date : null, dagen: days.length, meetings,
    plaatsen: Object.entries(plaatsen).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    sponsor: days.filter(e => q4has(e, "mijn sponsor gebeld")).length,
    service: days.filter(e => q4has(e, "service gedaan")).length
  };
}

let mpOpen = null;
async function openMijlpaal(key){
  const since = settings.since; if(!since || !key) return;
  const s = mpSoort(since, key); if(!s) return;
  if(mpOpen) mpOpen.remove();
  const back = el("div"); mpOpen = back;
  back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-label", mpTitel(s));
  back.style.cssText = "position:fixed;inset:0;z-index:420;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;transition:opacity .25s ease";
  const wrap = el("div"); wrap.style.cssText = "max-width:560px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 16px calc(32px + env(safe-area-inset-bottom))";
  back.appendChild(wrap);
  const sluit = () => { back.style.opacity = "0"; document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); setTimeout(() => { back.remove(); if(mpOpen === back) mpOpen = null; }, 250); };
  const onKey = e => { if(e.key === "Escape") sluit(); };
  document.addEventListener("keydown", onKey);

  // 1. keytag en titel (met confetti in dit vak)
  const held = el("div", "card"); held.style.cssText = "position:relative;overflow:hidden;text-align:center;padding:28px 16px 22px;background:linear-gradient(135deg,var(--warm-soft),var(--accent-soft));border-color:transparent";
  const tag = mpKeytag(since, key, s);
  const tagEl = el("div"); tagEl.style.cssText = "display:flex;justify-content:center";
  if(tag) tagEl.appendChild(keytagSvg(tag, true, 96));
  else { const ic = el("div", "celic"); ic.appendChild(icon("award", 72)); tagEl.appendChild(ic); }
  held.appendChild(tagEl);
  const h = el("div", null, mpTitel(s)); h.style.cssText = "font-weight:750;font-size:26px;letter-spacing:-.02em;margin-top:10px"; held.appendChild(h);
  const datum = note(vt("Behaald op ", "Achieved on ") + shortDate(key)); datum.style.cssText = "margin-top:4px;font-size:14px"; held.appendChild(datum);
  wrap.appendChild(held);

  // 2. bericht
  const msg = el("div", "card"); const mt = el("div", null, mpBericht(s)); mt.style.cssText = "font-size:17px;line-height:1.55"; msg.appendChild(mt); wrap.appendChild(msg);

  // 3. wat je sindsdien hebt gedaan
  const st = el("div", "card"); wrap.appendChild(st);
  st.appendChild(el("div", "qtitle", vt("Wat je sindsdien hebt gedaan", "What you've done since")));
  const laden = note(vt("Laden…", "Loading…")); st.appendChild(laden);

  // 4. volgende mijlpaal (gezien vanaf vandaag)
  const tk = todayKey(), volgende = milestones(since).find(m => m.key > tk);
  if(volgende){
    const c = el("div", "card"); c.appendChild(el("div", "qtitle", vt("Volgende mijlpaal", "Next milestone")));
    const left = Math.round((parseKey(volgende.key) - parseKey(tk)) / 864e5);
    const n = note(isEn() ? volgende.label + ", " + aantal(left, "", "", "day", "days") + " to go (" + shortDate(volgende.key) + ")" : volgende.label + ", nog " + left + (left === 1 ? " dag" : " dagen") + " (" + shortDate(volgende.key) + ")");
    n.style.cssText = "margin-top:6px;font-size:16px;color:var(--ink)"; c.appendChild(n); wrap.appendChild(c);
  }

  // 5. dank je
  const ok = el("button", "primary", vt("Dank je", "Thank you")); ok.type = "button"; ok.style.cssText = "width:100%;margin-top:4px;min-height:52px;font-size:17px"; ok.onclick = sluit;
  wrap.appendChild(ok);

  document.body.appendChild(back); document.body.style.overflow = "hidden";
  requestAnimationFrame(() => { back.style.opacity = "1"; ok.focus({preventScroll: true}); });
  setTimeout(() => ktConfetti(held, tagEl, true), 350);   // kort en rustig; niet bij "minder beweging"

  const t = mpTelling(await allDays(), key);
  laden.remove();
  if(!t.dagen){ const n = note(vt("Nog geen ingevulde dagbeschouwingen tot deze datum.", "No daily reflections filled in up to this date yet.")); n.style.marginTop = "6px"; st.appendChild(n); return; }
  const sub = note(isEn() ? "Since your first daily reflection on " + shortDate(t.eerste) + (key < tk ? ", up to " + shortDate(key) : "") + "."
    : "Sinds je eerste dagbeschouwing op " + shortDate(t.eerste) + (key < tk ? ", tot " + shortDate(key) : "") + ".");
  sub.style.cssText = "margin-top:2px;font-size:14px"; st.appendChild(sub);
  if(t.meetings){
    const big = el("div"); big.style.cssText = "display:flex;align-items:baseline;gap:10px;margin-top:14px";
    const g = el("div", null, String(t.meetings)); g.style.cssText = "font-size:44px;font-weight:750;line-height:1;color:var(--accent);font-variant-numeric:tabular-nums";
    big.appendChild(g); big.appendChild(el("div", null, t.meetings === 1 ? "meeting" : "meetings")).style.cssText = "font-size:18px;font-weight:600";
    st.appendChild(big);
    if(t.plaatsen.length){ const p = note(vt("Meest bezocht: ", "Most visited: ") + t.plaatsen.slice(0, 3).map(([x, n]) => x + " (" + n + "×)").join(", ")); p.style.cssText = "margin-top:4px;font-size:15px"; st.appendChild(p); }
  }
  const tiles = el("div", "tiles");
  tiles.appendChild(tile(String(t.dagen), t.dagen === 1 ? vt("dagbeschouwing ingevuld", "daily reflection filled in") : vt("dagbeschouwingen ingevuld", "daily reflections filled in")));
  if(t.sponsor) tiles.appendChild(tile(String(t.sponsor), t.sponsor === 1 ? vt("keer je sponsor gebeld", "time you called your sponsor") : vt("keer je sponsor gebeld", "times you called your sponsor")));
  if(t.service) tiles.appendChild(tile(String(t.service), t.service === 1 ? vt("keer service gedaan", "time you did service") : vt("keer service gedaan", "times you did service")));
  st.appendChild(tiles);
}
window.__mijlpaal = {openMijlpaal, mpSoort, mpTelling};
