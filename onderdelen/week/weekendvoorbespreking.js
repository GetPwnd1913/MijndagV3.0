// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- weekendvoorbespreking ----------
// Wat je kunt doen bij een trigger (vooruitkijkend; COPING in vragen.js is de verleden tijd voor de dagbeschouwing)
const WV_COPING = ["mijn sponsor bellen","iemand anders bellen","erover praten","naar een meeting gaan","naar buiten gaan","afleiding zoeken","de situatie verlaten","bidden of mediteren","de film doorspoelen tot het eind","iets eten of drinken","wachten tot het overgaat","literatuur lezen"];
const WV_COPING_EN = ["call my sponsor","call someone else","talk about it","go to a meeting","go outside","find a distraction","leave the situation","pray or meditate","play the tape through to the end","eat or drink something","wait until it passes","read literature"];
function renderWv(box, wk){
  const Q = (title, sub) => { const c = wfCard(title, sub); box.appendChild(c); return c; };
  const plan = planOf(addDaysKey(wk, -7)); // planning die vorige zondag is gemaakt, voor deze week
  const fromPlan = i => planRuns(plan[i]).map(r => runTime(r) + " " + r.text).join("\n");
  [["vr",vt("Wat doe je vrijdag na het programma?", "What are you doing on Friday after the programme?"),4],["za",vt("Wat is je planning zaterdag?", "What is your plan for Saturday?"),5],["zo",vt("Wat is je planning zondag?", "What is your plan for Sunday?"),6]].forEach(([k, t, i]) => {
    const c = Q(t);
    const f = wfField(wk, "wv", k, "", "", false); c.appendChild(f);
    const p = fromPlan(i);
    if(p){
      const b = el("button", "linkbtn", vt("Neem over uit je weekplanning", "Copy from your weekly planning")); b.type = "button"; b.style.marginTop = "6px";
      b.onclick = () => { f._ta.value = (f._ta.value.trim() ? f._ta.value.trim() + "\n" : "") + p; wfSet(wk, "wv", k, f._ta.value, true); };
      c.appendChild(b);
    }
  });
  let c = Q(vt("Welke avond eet je mee in het safehouse?", "Which evenings will you eat at the safehouse?"));
  [["eet_vr","Vrijdag","Friday"],["eet_za","Zaterdag","Saturday"],["eet_zo","Zondag","Sunday"]].forEach(([k, l, len]) => c.appendChild(wfYN(wk, "wv", k, vt(l, len))));
  c = Q(vt("Is dit afgestemd met je huisgenoten?", "Have you agreed this with your housemates?"));
  c.appendChild(wfYN(wk, "wv", "afg_yn"));
  c.appendChild(wfYN(wk, "wv", "afwas_yn", vt("Zijn je afwas- en afdroogtaken hierop afgestemd?", "Have your washing-up and drying tasks been arranged around this?")));
  const withChips = (key, title, items, sub) => {
    const c2 = Q(title, sub); const f = wfField(wk, "wv", key, "", vt("Tik hieronder aan of typ zelf…", "Tap below or type yourself…"), true); c2.appendChild(f);
    if(items.length) c2.appendChild(wfChips(f._ta, items, () => wfSet(wk, "wv", key, f._ta.value)));
  };
  withChips("trig", vt("Welke triggers verwacht je?", "What triggers do you expect?"), isEn() ? TRIGGERS_EN : TRIGGERS);
  withChips("omgaan", vt("Hoe ga je met triggers om?", "How will you deal with triggers?"), isEn() ? WV_COPING_EN : WV_COPING);
  const sos = settings.sos || {};
  const names = [].concat((sos.contacts || []).map(p => p.name).filter(Boolean)).concat(isEn() ? ["my sponsor","a fellow","my parents","my brother","my sister","my daughter","my son"] : ["mijn sponsor","een fellow","mijn ouders","mijn broer","mijn zus","mijn dochter","mijn zoon"]);
  const seenN = new Set(), uniq = names.filter(n => { const k = n.trim().toLowerCase(); if(seenN.has(k)) return false; seenN.add(k); return true; });
  withChips("bellen", vt("Wie ga je bellen dit weekend?", "Who will you call this weekend?"), uniq);
  const wkm = allMeetings().filter(m => [5, 6, 0].includes(m.d)).sort((a, b) => (isStar(b) - isStar(a)) || ([5,6,0].indexOf(a.d) - [5,6,0].indexOf(b.d)) || String(a.t).localeCompare(String(b.t)));
  const kort = isEn() ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] : ["zo","ma","di","wo","do","vr","za"];
  withChips("meet", vt("Welke meetings bezoek je dit weekend?", "Which meetings will you attend this weekend?"), wkm.slice(0, 14).map(m => kort[m.d] + " " + m.t + " " + m.f + " " + m.city), vt("Je vaste meetings (met ster) staan vooraan.", "Your regular meetings (with a star) are shown first."));
  withChips("aanw", vt("Welke dagen ben je komende week bij het programma aanwezig?", "Which days will you attend the programme next week?"), isEn() ? ["Monday","Tuesday","Wednesday","Thursday","Friday"] : ["maandag","dinsdag","woensdag","donderdag","vrijdag"]);
  c = Q(vt("Welke dagen ben je niet bij het programma aanwezig en wat is de reden hiervan?", "Which days will you not attend the programme, and why?"));
  c.appendChild(wfField(wk, "wv", "afw", "", "", true));
  c = Q("Reminders");
  const rl = el("ul", "remind"); WV_REMIND[0].concat(WV_REMIND[1]).forEach(t => rl.appendChild(el("li", null, t))); c.appendChild(rl);
}
