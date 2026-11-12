// ---------- weekterugblik ----------
let reviewWeek = null;
const RV_SEEN = "dagbeschouwing:reviewSeen";
function defaultReviewWeek(){
  return mondayOf(todayKey());
}
const longDay = k => cap(parseKey(k).toLocaleDateString("nl-NL", {weekday:"long", day:"numeric", month:"long"}));

function renderReviewBanner(){
  const card = $("reviewBanner"); card.innerHTML = "";
  const now = new Date(), dow = (now.getDay() + 6) % 7;
  const show = curKey === todayKey() && ((dow === 6 && now.getHours() >= 18) || dow === 0);
  const wk = defaultReviewWeek();
  let seen = ""; try{ seen = localStorage.getItem(RV_SEEN) || ""; }catch(e){}
  const on = show && seen !== wk;
  card.classList.toggle("hidden", !on);
  if(!on) return;
  card.style.cssText = "background:var(--accent-soft);border-color:transparent";
  const head = el("div"); head.style.cssText = "display:flex;gap:10px;align-items:flex-start";
  const t = el("div"); t.style.flex = "1";
  t.appendChild(el("div", "qtitle", "Je weekterugblik staat klaar"));
  const n = note("Een korte samenvatting van week " + isoWeek(wk) + ": je hoogtepunten, je herstel en je weekdoel."); n.style.cssText = "margin-top:2px;font-size:14px"; t.appendChild(n);
  head.appendChild(t);
  const x = el("button", "xbtn"); x.appendChild(icon("x", 18)); x.type = "button"; x.setAttribute("aria-label", "Verbergen");
  x.onclick = () => { try{ localStorage.setItem(RV_SEEN, wk); }catch(e){} renderReviewBanner(); };
  head.appendChild(x); card.appendChild(head);
  const b = el("button", "primary", "Bekijk mijn week"); b.type = "button"; b.style.marginTop = "12px";
  b.onclick = () => { try{ localStorage.setItem(RV_SEEN, wk); }catch(e){} showView("review"); };
  card.appendChild(b);
}
function rvList(items){ const ul = el("ul", "rv-list"); items.forEach(t => ul.appendChild(el("li", null, cap(t)))); return ul; }
async function renderReview(){
  const box = $("reviewBox");
  box.innerHTML = '<div class="empty">Laden…</div>';
  const map = await allDays();
  const tk = todayKey(), thisWeek = mondayOf(tk);
  if(!reviewWeek) reviewWeek = defaultReviewWeek();
  const wk = reviewWeek, end = addDaysKey(wk, 6);
  box.innerHTML = "";
  const nav = el("div", "datebar"); nav.style.margin = "0 2px 12px";
  const pv = el("button", "iconbtn"); pv.appendChild(icon("chevL")); pv.type = "button"; pv.setAttribute("aria-label", "Vorige week");
  pv.onclick = () => { reviewWeek = addDaysKey(wk, -7); renderReview(); };
  const nx = el("button", "iconbtn"); nx.appendChild(icon("chevR")); nx.type = "button"; nx.setAttribute("aria-label", "Volgende week"); nx.disabled = wk >= thisWeek;
  nx.onclick = () => { if(wk < thisWeek){ reviewWeek = addDaysKey(wk, 7); renderReview(); } };
  const lab = el("div", "d", (wk === thisWeek ? "Deze week · " : "") + "week " + isoWeek(wk));
  const sub = el("div", null, dayMonth(wk) + " – " + dayMonth(end)); sub.style.cssText = "font-size:13px;color:var(--muted);font-weight:400";
  lab.appendChild(sub);
  nav.appendChild(pv); nav.appendChild(lab); nav.appendChild(nx); box.appendChild(nav);

  const keys = []; for(let i = 0; i < 7; i++){ const k = addDaysKey(wk, i); if(k <= tk) keys.push(k); }
  const days = keys.map(k => map[k]).filter(e => e && hasContent(e));
  if(!days.length){
    const c = el("div", "card"); const t = note("In deze week heb je nog geen dagbeschouwing ingevuld."); t.style.marginTop = "0"; c.appendChild(t); box.appendChild(c);
    return;
  }
  const scores = days.map(e => parseInt(e.cijfer, 10)).filter(n => n > 0);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const mDays = days.map(meetingPlacesOf).filter(x => x !== null).length;
  const sponsor = days.filter(e => picked(e, "q4", 0).indexOf("mijn sponsor gebeld") >= 0).length;
  const zDays = days.filter(e => hadIt(e, "q5")).length, tDays = days.filter(e => hadIt(e, "q6")).length;

  // samenvatting
  const c1 = el("div", "card");
  c1.appendChild(el("div", "qtitle", "Je week in het kort"));
  let sent = "Je hebt " + days.length + " van de " + keys.length + " dagen ingevuld";
  sent += avg !== null ? ", met gemiddeld een " + nl1(avg) + "." : ".";
  const dc = daysClean(end); // zondag van deze week, ook als die nog moet komen
  if(dc !== null) sent += " Aan het eind van deze week ben je " + dc + " dagen clean.";
  const p = note(sent); p.style.cssText = "margin-top:6px;font-size:16px;color:var(--ink)"; c1.appendChild(p);
  const tiles = el("div", "tiles");
  tiles.appendChild(tile(days.length + "/" + keys.length, "dagen ingevuld"));
  tiles.appendChild(tile(avg !== null ? nl1(avg) : "–", "gemiddeld cijfer"));
  c1.appendChild(tiles);
  box.appendChild(c1);

  // mijlpaal
  if(settings.since){
    const ms = milestones(settings.since).filter(m => m.key >= wk && m.key <= end && m.key <= tk);
    if(ms.length){
      const c = el("div", "card"); c.style.cssText = "background:linear-gradient(135deg,var(--warm-soft),var(--accent-soft));border-color:transparent";
      const mth = el("div", "qtitle withic"); mth.appendChild(icon("award", 20)); mth.appendChild(document.createTextNode("Mijlpaal deze week")); mth.firstChild.style.color = "var(--warm)"; c.appendChild(mth);
      ms.forEach(m => { const t = note(m.label + " clean, op " + longDay(m.key).toLowerCase() + "."); t.style.cssText = "margin-top:4px;font-size:16px;color:var(--ink)"; c.appendChild(t); });
      box.appendChild(c);
    }
  }

  // beste dag
  const scored = days.filter(e => parseInt(e.cijfer, 10) > 0);
  if(scored.length){
    const best = scored.slice().sort((a, b) => (parseInt(b.cijfer, 10) - parseInt(a.cijfer, 10)) || (a.date < b.date ? 1 : -1))[0];
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", "Beste dag"));
    const t = note(longDay(best.date) + " · een " + best.cijfer); t.style.cssText = "margin-top:2px;font-size:15px"; c.appendChild(t);
    const good = picked(best, "q7", 0);
    if(good.length) c.appendChild(rvList(good.slice(0, 4)));
    const lk = el("button", "linkbtn more", "Lees die dag terug"); lk.type = "button"; lk.style.marginTop = "8px"; lk.onclick = () => openSummary(best, true);
    c.appendChild(lk);
    box.appendChild(c);
  }

  // hoogtepunten
  const good = tally(days.map(e => picked(e, "q7", 0)));
  const proud = tally(days.map(e => picked(e, "trots", 0).filter(x => !/^\d+ dagen? clean$/.test(x))));
  const thanks = tally(days.map(e => picked(e, "q10", 0)));
  if(good.length || proud.length || thanks.length){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", "Hoogtepunten"));
    [["Wat ging goed", good], ["Waar ik trots op was", proud], ["Waar ik dankbaar voor was", thanks]].forEach(([t, pairs]) => {
      if(!pairs.length) return;
      const l = el("div", "label", t); l.style.marginTop = "14px"; c.appendChild(l);
      c.appendChild(rvList(pairs.slice(0, 3).map(pr => pr[0] + (pr[1] > 1 ? " (" + pr[1] + "×)" : ""))));
    });
    box.appendChild(c);
  }

  // herstel
  const c3 = el("div", "card");
  c3.appendChild(el("div", "qtitle", "Herstel"));
  const t3 = el("div", "tiles");
  t3.appendChild(tile(String(mDays), mDays === 1 ? "dag naar een meeting" : "dagen naar een meeting"));
  t3.appendChild(tile(String(sponsor), sponsor === 1 ? "dag sponsor gebeld" : "dagen sponsor gebeld"));
  t3.appendChild(tile(String(zDays), zDays === 1 ? "dag met zucht" : "dagen met zucht"));
  t3.appendChild(tile(String(tDays), tDays === 1 ? "dag met triggers" : "dagen met triggers"));
  c3.appendChild(t3);
  box.appendChild(c3);

  // weekdoel
  const wd = weekData(wk);
  if(wd.goals.length){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", "Weekdoel"));
    wd.goals.forEach(g => {
      const r = el("div", "rv-goal");
      r.appendChild(el("span", "m" + (g.done ? "" : " no"), g.done ? "✓" : "○"));
      const tx = el("div"); tx.appendChild(el("div", null, g.text));
      const st = note(g.done ? "Behaald" : "Nog niet behaald"); st.style.cssText = "margin-top:0;font-size:13px"; tx.appendChild(st);
      r.appendChild(tx); c.appendChild(r);
    });
    const rf = wd.reflect || {};
    const rl = (REFLECT_OPTS.find(o => o[0] === rf.how) || [])[1];
    if(rl || (rf.text || "").trim()){
      const l = el("div", "label", "Mijn terugblik"); l.style.marginTop = "12px"; c.appendChild(l);
      if(rl){ const t = el("div", null, rl); t.style.fontWeight = "600"; c.appendChild(t); }
      if((rf.text || "").trim()){ const t = el("div", null, rf.text.trim()); t.style.cssText = "white-space:pre-wrap;margin-top:4px;font-size:16px"; c.appendChild(t); }
    }
    box.appendChild(c);
  }
}
