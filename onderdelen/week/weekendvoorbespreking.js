// ---------- weekendvoorbespreking ----------
function renderWv(box, wk){
  const Q = (title, sub) => { const c = wfCard(title, sub); box.appendChild(c); return c; };
  const plan = planOf(addDaysKey(wk, -7)); // planning die vorige zondag is gemaakt, voor deze week
  const fromPlan = i => planRuns(plan[i]).map(r => runTime(r) + " " + r.text).join("\n");
  [["vr","Wat doe je vrijdag na het programma?",4],["za","Wat is je planning zaterdag?",5],["zo","Wat is je planning zondag?",6]].forEach(([k, t, i]) => {
    const c = Q(t);
    const f = wfField(wk, "wv", k, "", "", false); c.appendChild(f);
    const p = fromPlan(i);
    if(p){
      const b = el("button", "linkbtn", "Neem over uit je weekplanning"); b.type = "button"; b.style.marginTop = "6px";
      b.onclick = () => { f._ta.value = (f._ta.value.trim() ? f._ta.value.trim() + "\n" : "") + p; wfSet(wk, "wv", k, f._ta.value, true); };
      c.appendChild(b);
    }
  });
  let c = Q("Welke avond eet je mee in het safehouse?");
  [["eet_vr","Vrijdag"],["eet_za","Zaterdag"],["eet_zo","Zondag"]].forEach(([k, l]) => c.appendChild(wfYN(wk, "wv", k, l)));
  c = Q("Is dit afgestemd met je huisgenoten?");
  c.appendChild(wfYN(wk, "wv", "afg_yn"));
  c.appendChild(wfYN(wk, "wv", "afwas_yn", "Zijn je afwas- en afdroogtaken hierop afgestemd?"));
  const withChips = (key, title, items, sub) => {
    const c2 = Q(title, sub); const f = wfField(wk, "wv", key, "", "Tik hieronder aan of typ zelf…", true); c2.appendChild(f);
    if(items.length) c2.appendChild(wfChips(f._ta, items, () => wfSet(wk, "wv", key, f._ta.value)));
  };
  withChips("trig", "Welke triggers verwacht je?", TRIGGERS);
  withChips("omgaan", "Hoe ga je met triggers om?", COPING.map(x => x === "mijn sponsor gebeld" ? "mijn sponsor bellen" : x));
  const sos = settings.sos || {};
  const names = [].concat((sos.contacts || []).map(p => p.name).filter(Boolean)).concat(["mijn sponsor","een fellow","mijn ouders","mijn broer","mijn zus","mijn dochter","mijn zoon"]);
  const seenN = new Set(), uniq = names.filter(n => { const k = n.trim().toLowerCase(); if(seenN.has(k)) return false; seenN.add(k); return true; });
  withChips("bellen", "Wie ga je bellen dit weekend?", uniq);
  const wkm = allMeetings().filter(m => [5, 6, 0].includes(m.d)).sort((a, b) => (isStar(b) - isStar(a)) || ([5,6,0].indexOf(a.d) - [5,6,0].indexOf(b.d)) || String(a.t).localeCompare(String(b.t)));
  withChips("meet", "Welke meetings bezoek je dit weekend?", wkm.slice(0, 14).map(m => ["zo","ma","di","wo","do","vr","za"][m.d] + " " + m.t + " " + m.f + " " + m.city), "Je vaste meetings (met ster) staan vooraan.");
  withChips("aanw", "Welke dagen ben je komende week bij het programma aanwezig?", ["maandag","dinsdag","woensdag","donderdag","vrijdag"]);
  c = Q("Welke dagen ben je niet bij het programma aanwezig en wat is de reden hiervan?");
  c.appendChild(wfField(wk, "wv", "afw", "", "", true));
  c = Q("Reminders");
  const rl = el("ul", "remind"); WV_REMIND[0].concat(WV_REMIND[1]).forEach(t => rl.appendChild(el("li", null, t))); c.appendChild(rl);
}
