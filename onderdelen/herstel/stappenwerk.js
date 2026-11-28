// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- stappenwerk ----------
const STEPS = [
  "Toegeven dat ik machteloos ben",
  "Hoop: er is iets groters dat kan helpen",
  "De beslissing om mijn leven toe te vertrouwen",
  "Een eerlijke inventaris van mezelf maken",
  "Mijn fouten toegeven aan mezelf, een hogere macht en iemand anders",
  "Klaar zijn om mijn karaktergebreken los te laten",
  "Nederig vragen om mijn tekortkomingen weg te nemen",
  "Een lijst maken van mensen die ik schade heb gedaan",
  "Het goedmaken waar dat kan",
  "Elke dag mijn inventaris bijhouden",
  "Contact zoeken via gebed en meditatie",
  "De boodschap doorgeven en de principes toepassen"
];
// kort in eigen woorden (niet de officiële tekst), in dezelfde volgorde als STEPS
const STEPS_EN = [
  "Admitting that I am powerless",
  "Hope: there is something greater that can help",
  "The decision to entrust my life",
  "Making an honest inventory of myself",
  "Admitting my wrongs to myself, a higher power and another person",
  "Being ready to let go of my character defects",
  "Humbly asking for my shortcomings to be removed",
  "Making a list of people I have harmed",
  "Making amends where possible",
  "Keeping up my inventory every day",
  "Seeking contact through prayer and meditation",
  "Passing on the message and living the principles"
];
// Opslag: settings.steps = {1: {status: ""|"bezig"|"klaar", started, finished, log: [{id, d, t}]}}.
// Oud: één tekstvak "notes"; dat wordt bij het tekenen de eerste aantekening (met de begindatum van de stap).
// Uitleg en vragen staan in eigen woorden; de officiële tekst staat in de Basistekst.
const STW_INFO = [
  {k: "#5b8def", ic: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10M10 9.5v-6a1.5 1.5 0 0 1 3 0v6M13 9.5V5a1.5 1.5 0 0 1 3 0v6M16 10V8a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 6 17.8L3.6 13.4a1.5 1.5 0 0 1 2.6-1.5L7 13"/>',
   u: ["Je geeft eerlijk toe dat je de verslaving niet in je eentje onder controle krijgt, en dat je leven daardoor onhandelbaar werd.", "You honestly admit that you can't control the addiction on your own, and that it made your life unmanageable."],
   v: [["Wanneer merkte ik dat ik niet meer kon stoppen?", "When did I notice I couldn't stop any more?"], ["Wat heb ik allemaal geprobeerd om te minderen of te stoppen?", "What did I try in order to cut down or stop?"], ["Hoe werd mijn leven onhandelbaar?", "How did my life become unmanageable?"]]},
  {k: "#f2a541", ic: '<path d="M3 18h18M6 18a6 6 0 0 1 12 0"/><path d="M12 4v3M4.9 8.9l2 2M19.1 8.9l-2 2M21 14h-2M5 14H3"/>',
   u: ["Je gaat geloven dat er hulp is buiten jezelf: een hogere macht, de groep of iets anders dat groter is dan jij.", "You start to believe there is help outside yourself: a higher power, the group or something else greater than you."],
   v: [["Wat betekent hoop voor mij?", "What does hope mean to me?"], ["Waar zie ik bij anderen dat herstel werkt?", "Where do I see recovery working for others?"], ["Wat of wie zou mij kunnen helpen?", "What or who could help me?"]]},
  {k: "#3fb5a3", ic: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M3 21c2-1 4-1 6 0M15 21c2-1 4-1 6 0"/>',
   u: ["Je besluit om je wil en je leven toe te vertrouwen aan die hulp, in plaats van alles zelf te willen regelen.", "You decide to trust your will and your life to that help, instead of wanting to control everything yourself."],
   v: [["Wat vind ik moeilijk aan loslaten?", "What do I find hard about letting go?"], ["Waar wil ik nog steeds alles zelf in de hand houden?", "Where do I still want to control everything myself?"], ["Hoe ziet toevertrouwen er voor mij uit?", "What does trusting look like for me?"]]},
  {k: "#8c6be0", ic: '<path d="M6 3h10l3 3v15H6z"/><path d="M9 9h7M9 13h7M9 17h4"/>',
   u: ["Je schrijft eerlijk op hoe je bent: je wrok, je angsten, je fouten en ook je goede kanten.", "You honestly write down who you are: your resentments, your fears, your mistakes and your good sides too."],
   v: [["Op wie of wat ben ik boos, en waarom?", "Who or what am I angry at, and why?"], ["Waar ben ik bang voor?", "What am I afraid of?"], ["Wat zijn mijn goede kanten?", "What are my good sides?"]]},
  {k: "#e0699a", ic: '<path d="M4 5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3v-3H4z"/><path d="M17 9h3v8h-2v3l-3.5-3H11"/>',
   u: ["Je vertelt wat je in stap 4 over jezelf vond aan je hogere macht, aan jezelf en aan een ander mens, vaak je sponsor.", "You share what you found about yourself in step 4 with your higher power, yourself and another person, often your sponsor."],
   v: [["Wat vind ik het moeilijkst om te vertellen?", "What do I find hardest to share?"], ["Hoe voelde ik me nadat ik het gedeeld had?", "How did I feel after I had shared it?"], ["Wat heb ik geleerd over mezelf?", "What did I learn about myself?"]]},
  {k: "#4aa3d8", ic: '<path d="M5 21V4h9v17"/><path d="M14 4l5 2v15l-5-2"/><circle cx="11.5" cy="12.5" r=".9"/>',
   u: ["Je wordt bereid om je karaktergebreken los te laten, ook de gewoontes die je ooit hielpen.", "You become willing to let go of your defects of character, even the habits that once helped you."],
   v: [["Welke karaktergebreken zie ik bij mezelf?", "Which defects of character do I see in myself?"], ["Wat leveren ze me nog op?", "What do they still give me?"], ["Ben ik echt bereid om ze los te laten?", "Am I really willing to let them go?"]]},
  {k: "#d46a4c", ic: '<path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/><path d="M12 7v6M9 10h6"/>',
   u: ["Je vraagt met een open en nederige houding om hulp bij het loslaten van je tekortkomingen.", "With an open and humble attitude, you ask for help in letting go of your shortcomings."],
   v: [["Wat betekent nederigheid voor mij?", "What does humility mean to me?"], ["Hoe vraag ik om hulp?", "How do I ask for help?"], ["Waar merk ik al verandering?", "Where do I already notice change?"]]},
  {k: "#6c9a3b", ic: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a5 5 0 0 1 10 0M13.5 20a4 4 0 0 1 7.5-2"/>',
   u: ["Je maakt een lijst van mensen die je schade hebt gedaan, en je wordt bereid om het goed te maken.", "You make a list of people you have harmed, and you become willing to make amends."],
   v: [["Wie heb ik pijn gedaan?", "Who have I hurt?"], ["Wat heb ik precies gedaan?", "What exactly did I do?"], ["Sta ik zelf ook op mijn lijst?", "Am I on my own list too?"]]},
  {k: "#c9952b", ic: '<path d="M2 12l4-4 4 2 3-2 4 1 5 3"/><path d="M6 8v6l5 4c.8.6 1.8.6 2.5 0l4.5-4"/><path d="M10 10l4 3"/>',
   u: ["Je maakt het goed waar dat kan, behalve als je daarmee iemand anders of jezelf schade zou doen.", "You make amends where you can, except when doing so would harm someone else or yourself."],
   v: [["Hoe kan ik het goedmaken met deze persoon?", "How can I make amends with this person?"], ["Waar moet ik voorzichtig zijn?", "Where do I need to be careful?"], ["Hoe voelde het na het goedmaken?", "How did it feel after making amends?"]]},
  {k: "#2f8f6b", ic: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 15l2.3 2.2 4.7-4.4"/>',
   u: ["Je blijft elke dag eerlijk naar jezelf kijken en geeft fouten snel toe. Je dagbeschouwing in deze app helpt je daarbij.", "You keep looking honestly at yourself every day and admit mistakes quickly. Your daily reflection in this app helps you with that."],
   v: [["Wat ging er vandaag goed?", "What went well today?"], ["Waar zat ik fout, en heb ik het al rechtgezet?", "Where was I wrong, and have I put it right yet?"], ["Waar ben ik dankbaar voor?", "What am I grateful for?"]]},
  {k: "#5a63c9", ic: '<path d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5z"/><path d="M16 3l.6 1.4L18 5l-1.4.6L16 7l-.6-1.4L14 5l1.4-.6z"/>',
   u: ["Je zoekt elke dag contact met je hogere macht, door gebed, meditatie of gewoon even stil zijn.", "Every day you seek contact with your higher power, through prayer, meditation or simply being still."],
   v: [["Wanneer heb ik rust in mijn hoofd?", "When is my head at peace?"], ["Hoe zoek ik contact met mijn hogere macht?", "How do I seek contact with my higher power?"], ["Wat helpt mij om stil te worden?", "What helps me to become still?"]]},
  {k: "#e2574c", ic: '<path d="M12 3c2 3 4 4.5 4 7.5a4 4 0 0 1-8 0C8 8 10 6.5 12 3z"/><path d="M10 14h4l-.6 7h-2.8z"/>',
   u: ["Je geeft door wat je hebt gekregen aan anderen die nog worstelen, en je leeft de principes in alles wat je doet.", "You pass on what you have been given to others who are still struggling, and you live the principles in everything you do."],
   v: [["Hoe kan ik iemand anders helpen?", "How can I help someone else?"], ["Welke service kan ik doen?", "What service can I do?"], ["Waar pas ik de principes al toe in mijn leven?", "Where do I already apply the principles in my life?"]]}
];
let stepOpen = null, stepConcept = {};
function setStep(n, v){ settings.steps = Object.assign({}, settings.steps || {}); settings.steps[n] = v; }
const stwDagen = (van, tot) => Math.max(1, Math.round((parseKey(tot) - parseKey(van)) / 864e5) + 1);
const stwDagTekst = n => isEn() ? n + (n === 1 ? " day" : " days") : n + (n === 1 ? " dag" : " dagen");
// oud tekstvak omzetten naar de eerste aantekening
function stwLog(n){
  const s = (settings.steps || {})[n] || {};
  if(s.notes && s.notes.trim() && !(s.log || []).length){
    const nieuw = Object.assign({}, s, {log: [{id: "oud" + n, d: s.started || todayKey(), t: s.notes.trim()}]}); delete nieuw.notes;
    setStep(n, nieuw); settings.updated = Date.now(); local.set("settings", settings);
    return nieuw.log;
  }
  return s.log || [];
}
// de stap waar je nu bent: de eerste die bezig is, anders de eerste die nog niet klaar is
const stwNu = st => { const b = STEPS.findIndex((_, i) => (st[i + 1] || {}).status === "bezig"); if(b >= 0) return b + 1; const k = STEPS.findIndex((_, i) => (st[i + 1] || {}).status !== "klaar"); return k >= 0 ? k + 1 : 13; };
const stwOpenStap = n => { stepOpen = n; renderSteps(); requestAnimationFrame(() => { const c = document.querySelector('.stwkaart[data-n="' + n + '"]'); if(c) c.scrollIntoView({block: "start", behavior: "smooth"}); }); };
const STW_STENEN = [[40, 228], [98, 221], [158, 214], [218, 206], [272, 192], [232, 172], [172, 162], [124, 147], [150, 122], [196, 108], [212, 84], [192, 58]];

// de berg: een pad met twaalf stenen naar de top; poppetje op de stap waar je nu bent
function stwBerg(st){
  const NS = "http://www.w3.org/2000/svg", nu = stwNu(st);
  const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 340 250"); s.setAttribute("class", "stwberg");
  s.setAttribute("role", "group"); s.setAttribute("aria-label", vt("De berg van je stappen", "The mountain of your steps"));
  const P = STW_STENEN;
  // vloeiend pad door de stenen (Catmull-Rom naar Bezier)
  let d = "M" + P[0][0] + " " + P[0][1];
  for(let i = 0; i < P.length - 1; i++){
    const a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
    d += " C" + (b[0] + (c[0] - a[0]) / 6).toFixed(1) + " " + (b[1] + (c[1] - a[1]) / 6).toFixed(1) + " " + (c[0] - (e[0] - b[0]) / 6).toFixed(1) + " " + (c[1] - (e[1] - b[1]) / 6).toFixed(1) + " " + c[0] + " " + c[1];
  }
  d += " L190 30";
  const klaarN = STEPS.filter((_, i) => (st[i + 1] || {}).status === "klaar").length;
  let html = '<circle cx="290" cy="46" r="18" class="zon"/>' +
    '<path d="M-10 250 L70 120 L120 175 L190 30 L250 120 L280 95 L350 250Z" class="berg2"/>' +
    '<path d="M0 250 L190 30 L340 250Z" class="berg"/>' +
    '<path d="M190 30 L164 62 L176 58 L184 68 L194 58 L204 66 L212 56 Z" class="sneeuw"/>' +
    '<path d="M0 250 Q80 236 170 240 T340 236 V250 H0Z" class="voet"/>' +
    '<path d="' + d + '" class="pad"/>' +
    '<path d="M190 30 V8" class="vlagstok"/><path d="M190 9 l16 5 -16 5z" class="vlag' + (klaarN === 12 ? " gehaald" : "") + '"/>';
  s.innerHTML = html;
  P.forEach(([x, y], i) => {
    const n = i + 1, stt = (st[n] || {}).status, g = document.createElementNS(NS, "g");
    g.setAttribute("class", "stwsteen" + (stt === "klaar" ? " klaar" : n === nu ? " nu" : ""));
    g.style.setProperty("--k", STW_INFO[i].k);
    g.setAttribute("role", "button"); g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", vt("Stap " + n, "Step " + n) + ": " + vt(STEPS[i], STEPS_EN[i]) + ". " + (stt === "klaar" ? vt("Klaar", "Done") : stt === "bezig" ? vt("Bezig", "In progress") : vt("Nog niet begonnen", "Not started yet")));
    g.innerHTML = (n === nu ? '<circle cx="' + x + '" cy="' + y + '" r="15" class="gloed"/>' : "") +
      '<circle cx="' + x + '" cy="' + y + '" r="10.5" class="rond"/>' +
      (stt === "klaar" ? '<path d="M' + (x - 4.5) + ' ' + y + ' l3 3 6-6.5" class="vink"/>' : '<text x="' + x + '" y="' + (y + 4) + '" class="nr">' + n + '</text>');
    g.onclick = () => stwOpenStap(n); toetsKlik(g);
    s.appendChild(g);
  });
  // poppetje boven de stap waar je nu bent (of op de top als alles klaar is)
  const [px, py] = nu <= 12 ? P[nu - 1] : [190, 30];
  const pop = document.createElementNS(NS, "g"); pop.setAttribute("class", "stwpop"); pop.setAttribute("aria-hidden", "true");
  pop.innerHTML = '<g transform="translate(' + px + ' ' + (py - 17) + ')"><circle cx="0" cy="-13" r="4.2" class="hoofd"/><path d="M0 -9 V-1 M-5 -6 L0 -7 L5 -6 M0 -1 L-3.5 5 M0 -1 L3.5 5" class="lijf"/></g>';
  s.appendChild(pop);
  return s;
}
// tijdlijn: hoe lang je over elke stap deed (of nu al bezig bent)
function stwTijdlijn(st){
  const rijen = STEPS.map((_, i) => ({n: i + 1, s: st[i + 1] || {}})).filter(r => r.s.started && (r.s.status === "klaar" || r.s.status === "bezig"));
  if(!rijen.length) return null;
  const tk = todayKey(), duur = r => stwDagen(r.s.started, r.s.status === "klaar" && r.s.finished ? r.s.finished : tk), max = Math.max(...rijen.map(duur));
  const c = el("div", "card stwtijd");
  c.appendChild(el("div", "qtitle", vt("Hoe lang deed ik erover?", "How long did it take me?")));
  const eerste = rijen.map(r => r.s.started).sort()[0];
  const n = note(vt("Je werkt nu " + stwDagTekst(stwDagen(eerste, tk)) + " aan je stappen. Elke stap gaat in zijn eigen tempo.", "You've been working on your steps for " + stwDagTekst(stwDagen(eerste, tk)) + ". Every step goes at its own pace."));
  n.style.margin = "2px 0 10px"; c.appendChild(n);
  rijen.forEach(r => {
    const rij = el("button", "stwtijdrij"); rij.type = "button"; rij.style.setProperty("--k", STW_INFO[r.n - 1].k);
    rij.appendChild(el("span", "stwtijdnr", String(r.n)));
    const balk = el("span", "stwtijdbalk"); const f = el("i"); f.style.width = Math.max(6, duur(r) / max * 100) + "%"; if(r.s.status === "bezig") f.className = "bezig"; balk.appendChild(f); rij.appendChild(balk);
    rij.appendChild(el("span", "stwtijdtx", stwDagTekst(duur(r)) + (r.s.status === "bezig" ? vt(" · bezig", " · ongoing") : "")));
    rij.setAttribute("aria-label", vt("Stap ", "Step ") + r.n + ": " + stwDagTekst(duur(r)));
    rij.onclick = () => stwOpenStap(r.n);
    c.appendChild(rij);
  });
  return c;
}
function renderSteps(){
  const box = $("stepsBox"); box.innerHTML = "";
  const st = settings.steps || {};
  const doneN = STEPS.filter((_, i) => (st[i + 1] || {}).status === "klaar").length;
  const top = el("div", "card stwheld");
  top.appendChild(el("div", "qtitle", vt("Mijn stappenwerk", "My step work")));
  top.appendChild(el("div", "stwteller", doneN === 12 ? vt("Alle 12 stappen klaar. Je staat op de top!", "All 12 steps done. You've reached the top!") : doneN + vt(" van de 12 stappen klaar", " of the 12 steps done")));
  const vak = el("div", "stwbergvak"); vak.appendChild(stwBerg(st)); top.appendChild(vak);
  const n = note(vt("Tik op een steen of een stap hieronder. De stappen staan hier kort in eigen woorden; de officiële tekst staat in je Basistekst.", "Tap a stone or a step below. The steps are summarised here in our own words; the official text is in your Basic Text."));
  n.style.marginTop = "8px"; top.appendChild(n);
  box.appendChild(top);
  const tl = stwTijdlijn(st); if(tl) box.appendChild(tl);
  STEPS.forEach((title, idx) => {
    const nr = idx + 1, s = st[nr] || {}, info = STW_INFO[idx], open = stepOpen === nr;
    const c = el("div", "card stwkaart" + (s.status === "klaar" ? " klaar" : s.status === "bezig" ? " bezig" : "")); c.dataset.n = nr; c.style.setProperty("--k", info.k);
    const head = el("div", "stwkop"); head.setAttribute("role", "button"); head.tabIndex = 0;
    const ic = el("span", "stwic"); const svg = icon("x", 24); svg.innerHTML = info.ic; ic.appendChild(svg); ic.appendChild(el("b", "stwicnr", String(nr))); head.appendChild(ic);
    const hb = el("div", "stwkoptx");
    hb.appendChild(el("small", "stwstapnr", vt("Stap " + nr, "Step " + nr)));
    hb.appendChild(el("div", "qtitle", vt(title, STEPS_EN[idx])));
    const tk = todayKey();
    const lab = s.status === "klaar" ? vt("Klaar", "Done") + (s.finished ? vt(" op ", " on ") + shortDate(s.finished) : "") + (s.started && s.finished ? " · " + stwDagTekst(stwDagen(s.started, s.finished)) : "")
      : s.status === "bezig" ? vt("Bezig", "In progress") + (s.started ? vt(" sinds ", " since ") + shortDate(s.started) + " · " + stwDagTekst(stwDagen(s.started, tk)) : "") : vt("Nog niet begonnen", "Not started yet");
    hb.appendChild(el("div", "stwstatus", lab));
    head.appendChild(hb);
    if(s.status === "klaar"){ const v = el("span", "stwvink"); v.appendChild(icon("check", 16)); head.appendChild(v); }
    const arrow = el("div", "stwpijl"); arrow.appendChild(icon(open ? "chevD" : "chevR", 18)); head.appendChild(arrow);
    head.onclick = () => { stepOpen = open ? null : nr; renderSteps(); };
    toetsKlik(head); head.setAttribute("aria-expanded", open ? "true" : "false");
    c.appendChild(head);
    if(open){
      c.appendChild(el("div", "stwuitleg", vt(info.u[0], info.u[1])));
      const vr = el("div", "stwvragen");
      vr.appendChild(el("div", "label", vt("Om over na te denken", "To think about")));
      const ul = el("ul"); info.v.forEach(q => ul.appendChild(el("li", null, vt(q[0], q[1])))); vr.appendChild(ul);
      c.appendChild(vr);
      c.appendChild(el("div", "label", vt("Waar sta ik?", "Where am I?")));
      const sc = el("div", "scale");
      [["", "Niet begonnen", "Not started"], ["bezig", "Bezig", "In progress"], ["klaar", "Klaar", "Done"]].forEach(([v, l, len]) => {
        const b = el("button", null, vt(l, len)); b.type = "button";
        if((s.status || "") === v) b.classList.add("on");
        b.onclick = async () => {
          const cur = Object.assign({}, (settings.steps || {})[nr] || {}); cur.status = v;
          if(v && !cur.started) cur.started = todayKey();
          cur.finished = v === "klaar" ? todayKey() : "";
          if(!v) cur.started = "";
          setStep(nr, cur); renderSteps(); await saveSettingsNow();
        };
        sc.appendChild(b);
      });
      c.appendChild(sc);
      if(nr === 10){ const t = note(vt("Je dagbeschouwing in deze app is je dagelijkse inventaris.", "Your daily reflection in this app is your daily inventory.")); t.style.marginTop = "8px"; c.appendChild(t); }
      // aantekeningen met datum, nieuwste bovenaan
      c.appendChild(el("div", "label", vt("Mijn aantekeningen", "My notes")));
      const ta = el("textarea"); ta.value = stepConcept[nr] || "";
      ta.placeholder = vt("Waar ben je mee bezig? Wat wil je bespreken met je sponsor?", "What are you working on? What do you want to discuss with your sponsor?");
      ta.setAttribute("aria-label", vt("Nieuwe aantekening", "New note"));
      ta.oninput = () => { stepConcept[nr] = ta.value; };
      c.appendChild(ta);
      const bw = el("button", "primary stwbewaar", vt("Aantekening bewaren", "Save note")); bw.type = "button";
      bw.onclick = async () => {
        const t = ta.value.trim(); if(!t){ ta.focus(); return; }
        const log = stwLog(nr).slice(); log.unshift({id: Date.now().toString(36), d: todayKey(), t});
        setStep(nr, Object.assign({}, (settings.steps || {})[nr] || {}, {log})); delete stepConcept[nr];
        renderSteps(); await saveSettingsNow(); toast(vt("Aantekening bewaard.", "Note saved."));
      };
      c.appendChild(bw);
      const log = stwLog(nr);
      if(log.length){
        const l = el("div", "stwlog");
        log.forEach(a => {
          const it = el("div", "stwnotitie");
          const kop = el("div", "stwnotitiekop"); kop.appendChild(el("span", null, cap(parseKey(a.d).toLocaleDateString(locale(), {weekday: "short", day: "numeric", month: "long", year: "numeric"}))));
          const weg = el("button", "linkbtn", vt("Weghalen", "Delete")); weg.type = "button";
          weg.onclick = async () => {
            if(!(await confirmDialog(vt("Aantekening weghalen?", "Delete note?"), vt("Deze aantekening verdwijnt helemaal.", "This note will be removed completely."), vt("Weghalen", "Delete")))) return;
            setStep(nr, Object.assign({}, (settings.steps || {})[nr] || {}, {log: stwLog(nr).filter(x => x.id !== a.id)})); renderSteps(); await saveSettingsNow();
          };
          kop.appendChild(weg); it.appendChild(kop);
          it.appendChild(el("div", "stwnotitietx", a.t));
          l.appendChild(it);
        });
        c.appendChild(l);
      }
    }
    box.appendChild(c);
  });
}
