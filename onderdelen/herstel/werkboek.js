// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- mijn werkboek: opdrachten uit de verslavingszorg ----------
// Eén rustig overzicht in drie groepjes; je opent telkens één opdracht.
// Opdrachten: terugvalpreventieplan (terugval.js), nee zeggen, G-schema, beslisbalans, netwerkkaart, plezierlijst.
// Opslag: settings.werkboek = {gschema: [{id, date, gebeurtenis, gedachten, gedrag, gevolgen, helpend, keuzes: {...}}],
//   balans: {items: {...}, notitie}, netwerk: [{id, naam, rol, soort, afstand, tel}], plezier: {items: {...}}, nee: {items: {...}, notitie}}.
// Knopjes worden in het Nederlands bewaard (sleutel); WB_EN geeft de Engelse tekst.
let wbOpen = null, gsOpen = null, gsStap = null, nwBewerk = null, wbEigen = null, plKeuze = null, neeKaart = null;

const WB_LIJSTEN = {
  "gs.gedachten": [["dit kan ik niet","I can't do this"],["ze doen het expres","they're doing it on purpose"],["het is mijn schuld","it's my fault"],["niemand begrijpt me","nobody understands me"],["ik verdien beter","I deserve better"],["het maakt toch niet uit","it doesn't matter anyway"],["één keer kan wel","once won't hurt"],["ik moet dit alleen oplossen","I have to solve this alone"],["het gaat altijd mis","it always goes wrong"],["ze vinden me niks","they think I'm worthless"],["ik kan niks goed doen","I can't do anything right"],["ik moet het nú hebben","I need it right now"],["dit hou ik niet vol","I can't keep this up"]],
  "gs.sterkte": ["1","2","3","4","5","6","7","8","9","10"].map(n => [n + " uit 10", n + " out of 10"]),
  "gs.gedrag": [["ik werd boos","I got angry"],["ik ging schreeuwen","I started shouting"],["ik trok me terug","I withdrew"],["ik ging weg","I walked away"],["ik heb het opgekropt","I bottled it up"],["ik ging piekeren","I started worrying"],["ik deed alsof er niks was","I acted like nothing was wrong"],["ik zocht afleiding","I looked for a distraction"],["ik kreeg zucht","I got a craving"],["ik heb iemand gebeld","I called someone"],["ik heb erover gepraat","I talked about it"],["ik heb gebruikt","I used"]],
  "gs.gevolgen": [["ruzie","an argument"],["spijt","regret"],["schaamte","shame"],["zucht","a craving"],["slecht geslapen","slept badly"],["afstand tot anderen","distance from others"],["opluchting","relief"],["rust","calm"],["het werd uitgepraat","it got talked through"],["ik voelde me beter","I felt better"]],
  "gs.helpend": [["het ligt niet alleen aan mij","it's not only down to me"],["ik hoef niet meteen te reageren","I don't have to react straight away"],["ik kan om hulp vragen","I can ask for help"],["dit gevoel gaat voorbij","this feeling will pass"],["ik heb dit eerder overleefd","I've survived this before"],["het is niet het einde van de wereld","it's not the end of the world"],["ik kan rustig zeggen wat ik voel","I can calmly say what I feel"],["ik kan het later bespreken","I can talk about it later"]],
  "gs.volgende": [["eerst even weglopen","walk away for a moment first"],["eerst ademhalen","breathe first"],["iemand bellen","call someone"],["het rustig uitpraten","talk it out calmly"],["het opschrijven","write it down"],["HALT checken","check HALT"],["naar een meeting gaan","go to a meeting"],["het bespreken in mijn 1-op-1","discuss it in my 1-to-1"]],
  "balans.vgebruik": [["even geen zorgen","no worries for a while"],["ontspanning","relaxation"],["gezelligheid","company"],["erbij horen","fitting in"],["minder pijn of somberheid","less pain or low mood"],["niet hoeven voelen","not having to feel"],["meer zelfvertrouwen","more confidence"],["energie","energy"],["beter slapen","sleeping better"],["spanning en een kick","excitement and a kick"]],
  "balans.ngebruik": [["ruzie thuis","fights at home"],["geldproblemen en schulden","money problems and debts"],["mijn gezondheid","my health"],["slecht slapen","sleeping badly"],["vertrouwen kwijt","losing trust"],["liegen","lying"],["eenzaamheid","loneliness"],["schaamte en schuld","shame and guilt"],["werk of opleiding kwijt","losing work or school"],["mijn huis kwijt","losing my home"],["problemen met politie of justitie","trouble with police or the law"],["mijn kinderen","my children"],["ik word iemand die ik niet wil zijn","I become someone I don't want to be"]],
  "balans.vclean": [["een helder hoofd","a clear head"],["rust in mijn hoofd","peace of mind"],["vertrouwen terug","trust back"],["geld over","money left over"],["betere gezondheid","better health"],["goed slapen","sleeping well"],["echte vrienden","real friends"],["trots op mezelf","proud of myself"],["er zijn voor mijn familie","being there for my family"],["mijn kinderen zien","seeing my children"],["werk","work"],["een eigen plek","a place of my own"],["plannen voor de toekomst","plans for the future"]],
  "balans.nclean": [["verveling","boredom"],["mijn gevoelens echt voelen","really feeling my feelings"],["eenzaam zijn","being lonely"],["oude vrienden kwijt","losing old friends"],["geen gezelligheid","no fun nights out"],["oude gewoontes missen","missing old habits"],["geen uitlaatklep","no way to let off steam"],["moeite met slapen","trouble sleeping"],["het is zwaar","it's hard"]],
  "nw.rol": [["partner","partner"],["ouder","parent"],["kind","child"],["broer of zus","brother or sister"],["familie","family"],["vriend","friend"],["sponsor","sponsor"],["fellow","fellow"],["buddy","buddy"],["begeleider","support worker"],["therapeut","therapist"],["huisarts","GP"],["huisgenoot","housemate"],["collega","colleague"],["buren","neighbours"],["ex","ex"],["oude gebruiksvriend","old using friend"],["dealer","dealer"]],
  "pl.alleen": [["muziek luisteren","listening to music"],["een serie kijken","watching a series"],["gamen","gaming"],["lezen","reading"],["in bad of lang douchen","a bath or long shower"],["iets lekkers koken","cooking something nice"],["tekenen of schilderen","drawing or painting"],["puzzelen","doing puzzles"],["opruimen","tidying up"]],
  "pl.samen": [["koffie drinken met iemand","coffee with someone"],["samen koken","cooking together"],["een spelletje doen","playing a game"],["naar de film","going to the cinema"],["met mijn kinderen spelen","playing with my children"],["bellen met een vriend","calling a friend"],["voetbal kijken met anderen","watching football with others"]],
  "pl.buiten": [["wandelen","walking"],["fietsen","cycling"],["sporten","doing sport"],["zwemmen","swimming"],["vissen","fishing"],["naar het strand of bos","to the beach or woods"],["de hond uitlaten","walking the dog"],["tuinieren","gardening"]],
  "pl.nieuw": [["een nieuwe hobby proberen","trying a new hobby"],["vrijwilligerswerk","volunteering"],["een cursus volgen","taking a course"],["een instrument leren","learning an instrument"],["naar een museum","going to a museum"],["een dagje weg","a day out"]],
  "nee.situaties": [["iemand biedt me iets aan","someone offers me something"],["op een feestje","at a party"],["een oude vriend belt","an old friend calls"],["uit eten of in de kroeg","eating out or in a pub"],["na het werk met collega's","after work with colleagues"],["als ik net geld heb gekregen","when I've just been paid"],["iemand zegt: één keer kan toch","someone says: once is fine"],["iemand lacht me uit","someone laughs at me"]],
  "nee.zinnen": [["Nee, dank je. Ik gebruik niet meer.","No thanks. I don't use any more."],["Nee, ik ben clean en dat wil ik zo houden.","No, I'm clean and I want to keep it that way."],["Nee, ik drink liever iets anders.","No, I'd rather have something else."],["Nee, ik moet zo nog rijden.","No, I've got to drive later."],["Nee, ik heb morgen iets belangrijks.","No, I've got something important tomorrow."],["Ik ga zo, ik heb nog een afspraak.","I'm off soon, I've got an appointment."],["Nee. Ik wil het er niet over hebben.","No. I don't want to talk about it."],["Bel me maar als je clean bent.","Call me when you're clean."]]
};
const WB_EN = {};
Object.keys(WB_LIJSTEN).forEach(k => WB_LIJSTEN[k].forEach(p => { WB_EN[p[0]] = p[1]; }));
const wbLijst = k => k === "gs.gevoelens" ? FEELINGS.map((f, i) => [f, FEELINGS_EN[i]]) : (WB_LIJSTEN[k] || []);
const wbT = s => { if(!isEn()) return s; if(WB_EN[s]) return WB_EN[s]; const i = FEELINGS.indexOf(s); return i >= 0 ? FEELINGS_EN[i] : s; };
const wbData = () => {
  if(!settings.werkboek || typeof settings.werkboek !== "object") settings.werkboek = {};
  const d = settings.werkboek;
  d.gschema = d.gschema || []; d.netwerk = d.netwerk || [];
  ["balans", "plezier", "nee"].forEach(k => { d[k] = d[k] || {}; d[k].items = d[k].items || {}; });
  return d;
};
const wbLees = () => settings.werkboek || {};
const wbItems = k => ((wbLees()[k] || {}).items) || {};
const wbId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function wbToon(){
  const v = $("view-werkboek");
  if(v && v.classList.contains("hidden")) showView("werkboek"); else renderWerkboek();
  window.scrollTo(0, 0);
}
const wbDatum = k => cap(parseKey(k).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long"}));
const WB_ICONS = {
  terugval: '<rect x="8" y="2.5" width="8" height="19" rx="4"/><circle cx="12" cy="7" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="17" r="1.6"/>',
  nee: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  gschema: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  balans: '<path d="M12 4v16M7 20h10"/><path d="M4 8h16"/><path d="M4 8l-2.5 6a3 3 0 0 0 5 0z"/><path d="M20 8l-2.5 6a3 3 0 0 0 5 0z"/>',
  netwerk: '<circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="18" r="2"/><path d="M10 10.5 6.5 7.5M14 10.5l3.5-3M10.3 14 7.3 17.5M14 14l2.6 2.6"/>',
  plezier: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'
};
const wbIcoon = (naam, size) => { const s = icon("x", size || 22); s.innerHTML = WB_ICONS[naam] || ""; return s; };

// een rij knopjes met "+ Eigen"; get() geeft de lijst, set(lijst) bewaart. enkel = maar één keuze.
function wbChips(o){
  const w = el("div", "wbchips");
  if(o.l) w.appendChild(el("div", "label", vt(o.l, o.le)));
  const chips = el("div", "chips"); w.appendChild(chips);
  const sleutel = o.k + (o.id || "");
  const teken = () => {
    chips.innerHTML = "";
    const vast = wbLijst(o.k).map(p => p[0]), gekozen = o.get() || [];
    vast.concat(gekozen.filter(x => vast.indexOf(x) < 0)).forEach(item => {
      const on = gekozen.indexOf(item) >= 0;
      const b = el("button", "chip" + (on ? " on" : "") + (o.cls ? " " + o.cls : ""), wbT(item)); b.type = "button"; b.setAttribute("aria-pressed", on ? "true" : "false");
      b.onclick = () => {
        const cur = (o.get() || []).slice(), j = cur.indexOf(item);
        if(o.enkel) o.set(j >= 0 ? [] : [item]);
        else { if(j >= 0) cur.splice(j, 1); else cur.push(item); o.set(cur); }
        teken(); if(o.na) o.na();
      };
      chips.appendChild(b);
    });
    if(o.geenEigen) return;
    if(wbEigen === sleutel){
      const f = el("div"); f.style.cssText = "display:flex;gap:6px;flex-basis:100%;margin-top:4px";
      const inp = el("input", "sosinp"); inp.placeholder = vt("Typ je eigen woorden…", "Type your own words…");
      const ok = el("button", "primary", vt("Toevoegen", "Add")); ok.type = "button"; ok.style.cssText = "flex:none;padding:10px 14px";
      const doAdd = () => {
        const v = inp.value.trim().replace(/\s+/g, " "); if(!v){ inp.focus(); return; }
        const val = o.hoofdletter ? v : (v.length > 1 && v.charAt(1) !== v.charAt(1).toUpperCase() ? v.charAt(0).toLowerCase() + v.slice(1) : v);
        const cur = (o.get() || []).slice();
        o.set(o.enkel ? [val] : (cur.indexOf(val) < 0 ? cur.concat([val]) : cur));
        wbEigen = null; teken(); if(o.na) o.na();
      };
      ok.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } if(e.key === "Escape"){ wbEigen = null; teken(); } };
      f.appendChild(inp); f.appendChild(ok); chips.appendChild(f);
      requestAnimationFrame(() => inp.focus());
    } else {
      const plus = el("button", "chip start", vt("+ Eigen", "+ Own")); plus.type = "button";
      plus.onclick = () => { wbEigen = sleutel; teken(); };
      chips.appendChild(plus);
    }
  };
  teken();
  return w;
}
// knopjes die in een vak van een opdracht bewaard worden (balans, plezier, nee)
const wbVakChips = (opdracht, vak, extra) => wbChips(Object.assign({k: opdracht.slice(0, 2) === "pl" ? "pl." + vak : opdracht + "." + vak,
  get: () => wbItems(opdracht === "pl" ? "plezier" : opdracht)[vak],
  set: l => { const d = wbData(), it = d[opdracht === "pl" ? "plezier" : opdracht].items; if(l.length) it[vak] = l; else delete it[vak]; tvBewaar(); }}, extra || {}));
function wbTekstveld(waarde, plaats, plaatsEn, opslaan, label){
  const ta = el("textarea"); ta.value = waarde || ""; ta.placeholder = vt(plaats, plaatsEn);
  if(label) ta.setAttribute("aria-label", label);
  ta.oninput = () => opslaan(ta.value);
  return ta;
}
const wbTags = (l, z) => { const w = el("div", "tvtags"); if(z) w.dataset.z = z; l.forEach(s => w.appendChild(el("span", "tvtag", cap(wbT(s))))); return w; };
const wbTerug = () => tvTerugLink(vt("Terug naar werkboek", "Back to workbook"), () => { wbOpen = null; gsOpen = null; gsStap = null; nwBewerk = null; neeKaart = null; wbToon(); });
// kop van een opdracht: icoon, titel, uitleg
function wbKop(id, titel, uitleg){
  const o = WB_OPDRACHTEN.find(x => x.id === id);
  const c = el("div", "card wbkop");
  const r = el("div", "wbkoprij");
  const ic = el("span", "wbtegel"); ic.style.setProperty("--k", o.kleur); ic.appendChild(wbIcoon(id, 24));
  r.appendChild(ic); r.appendChild(el("div", "qtitle", titel)); c.appendChild(r);
  const n = note(uitleg); n.style.marginTop = "10px"; c.appendChild(n);
  return c;
}

// ---- het overzicht ----
const WB_GROEPEN = [
  {k: "terugval", t: "Terugval voorkomen", te: "Preventing relapse"},
  {k: "begrijpen", t: "Mezelf begrijpen", te: "Understanding myself"},
  {k: "opbouwen", t: "Mijn leven opbouwen", te: "Building my life"}
];
const WB_OPDRACHTEN = [
  {id: "terugval", groep: "terugval", t: "Terugvalpreventieplan", te: "Relapse prevention plan", kleur: "var(--tv-oranje)",
   uit: "Hoe herken je groen, oranje en rood, en wat doe je dan?", uitEn: "How do you recognise green, orange and red, and what do you do then?",
   voortgang: () => [TV_STAPPEN.filter(tvStapGevuld).length, TV_STAPPEN.length],
   status: () => { const n = TV_STAPPEN.filter(tvStapGevuld).length; return n ? vt(n + " van " + TV_STAPPEN.length + " opdrachten", n + " of " + TV_STAPPEN.length + " assignments") : null; }},
  {id: "nee", groep: "terugval", t: "Nee zeggen", te: "Saying no", kleur: "var(--tv-rood)",
   uit: "Je eigen zinnen klaar hebben voor als iemand je iets aanbiedt.", uitEn: "Have your own words ready for when someone offers you something.",
   voortgang: () => [["situaties", "zinnen"].filter(k => (wbItems("nee")[k] || []).length).length, 2],
   status: () => { const n = (wbItems("nee").zinnen || []).length; return n ? (isEn() ? n + (n === 1 ? " sentence ready" : " sentences ready") : n + (n === 1 ? " zin klaar" : " zinnen klaar")) : null; }},
  {id: "gschema", groep: "begrijpen", t: "G-schema", te: "ABC diary", kleur: "var(--accent)",
   uit: "Eén moment uitpluizen: gebeurtenis, gedachten, gevoelens, gedrag en gevolgen.", uitEn: "Unpick one moment: event, thoughts, feelings, behaviour and consequences.",
   voortgang: () => [Math.min((wbLees().gschema || []).length, 1), 1],
   status: () => { const l = (wbLees().gschema || []); return l.length ? vt(l.length + " ingevuld · laatste ", l.length + " filled in · last ") + parseKey(l.map(g => g.date).sort().pop()).toLocaleDateString(locale(), {day: "numeric", month: "short"}) : null; }},
  {id: "balans", groep: "begrijpen", t: "Beslisbalans", te: "Decision balance", kleur: "var(--warm)",
   uit: "Voordelen en nadelen van gebruiken en van clean blijven op een rij.", uitEn: "The pros and cons of using and of staying clean side by side.",
   voortgang: () => [BALANS_VAKKEN.filter(v => (wbItems("balans")[v.k] || []).length).length, 4],
   status: () => { const n = BALANS_VAKKEN.filter(v => (wbItems("balans")[v.k] || []).length).length; return n ? vt(n + " van 4 vakken", n + " of 4 boxes") : null; }},
  {id: "netwerk", groep: "opbouwen", t: "Netwerkkaart", te: "Network map", kleur: "var(--tv-groen)",
   uit: "Wie staat er om je heen? Wie helpt je, en bij wie moet je oppassen?", uitEn: "Who is around you? Who helps you, and who do you need to be careful with?",
   voortgang: () => [Math.min((wbLees().netwerk || []).length, 3), 3],
   status: () => { const n = (wbLees().netwerk || []).length; return n ? (isEn() ? n + (n === 1 ? " person" : " people") : n + (n === 1 ? " persoon" : " mensen")) : null; }},
  {id: "plezier", groep: "opbouwen", t: "Plezierlijst", te: "Fun list", kleur: "#e0a33a",
   uit: "Dingen die je leuk vindt zonder middelen. Handig als je je verveelt.", uitEn: "Things you enjoy without substances. Handy when you're bored.",
   voortgang: () => [Math.min(plAlles().length, 5), 5],
   status: () => { const n = plAlles().length; return n ? (isEn() ? n + (n === 1 ? " thing" : " things") + " on your list" : n + (n === 1 ? " ding" : " dingen") + " op je lijst") : null; }}
];
const wbKlaar = o => { const [a, b] = o.voortgang(); return a >= b; };
const wbBegonnen = o => o.voortgang()[0] > 0;
function renderWerkboek(){
  const box = $("wbBox"); if(!box) return; box.innerHTML = "";
  if(wbOpen === "terugval") return tvStap !== null ? renderTvStap(box) : renderTvOverzicht(box);
  if(wbOpen === "gschema") return !gsOpen ? renderGsLijst(box) : gsStap !== null ? renderGsStap(box) : renderGs(box);
  if(wbOpen === "balans") return renderBalans(box);
  if(wbOpen === "netwerk") return renderNetwerk(box);
  if(wbOpen === "plezier") return renderPlezier(box);
  if(wbOpen === "nee") return renderNee(box);
  const kop = el("div", "card wbintro");
  kop.appendChild(el("div", "qtitle", vt("Opdrachten voor je herstel", "Assignments for your recovery")));
  const n = note(vt("Opdrachten zoals je ze ook in de verslavingszorg meekrijgt. Doe ze in je eigen tempo, één tegelijk, en bespreek ze met je sponsor of begeleider.", "Assignments like the ones you get in addiction care. Do them at your own pace, one at a time, and talk them through with your sponsor or support worker."));
  n.style.marginTop = "4px"; kop.appendChild(n);
  const begonnen = WB_OPDRACHTEN.filter(wbBegonnen).length;
  const balk = el("div", "wbbalk");
  WB_OPDRACHTEN.forEach(o => { const i = el("i"); i.style.setProperty("--k", o.kleur); if(wbKlaar(o)) i.className = "vol"; else if(wbBegonnen(o)) i.className = "half"; balk.appendChild(i); });
  kop.appendChild(balk);
  kop.appendChild(el("div", "wbbalktx", begonnen ? vt(begonnen + " van de " + WB_OPDRACHTEN.length + " opdrachten begonnen", begonnen + " of the " + WB_OPDRACHTEN.length + " assignments started") : vt("Nog niet begonnen. Kies er hieronder één uit.", "Not started yet. Pick one below.")));
  box.appendChild(kop);
  WB_GROEPEN.forEach(g => {
    box.appendChild(el("div", "wbgroep", vt(g.t, g.te)));
    const lijst = el("div", "card wblijst");
    WB_OPDRACHTEN.filter(o => o.groep === g.k).forEach(o => {
      const r = el("button", "wbrij"); r.type = "button";
      const ic = el("span", "wbtegel"); ic.style.setProperty("--k", o.kleur); ic.appendChild(wbIcoon(o.id, 22));
      r.appendChild(ic);
      const tx = el("span", "wbtx");
      tx.appendChild(el("b", null, vt(o.t, o.te)));
      tx.appendChild(el("small", null, o.status() || vt(o.uit, o.uitEn)));
      const [a, b] = o.voortgang();
      if(a){ const m = el("span", "wbmeter"); const f = el("i"); f.style.width = Math.round(a / b * 100) + "%"; f.style.background = o.kleur; m.appendChild(f); tx.appendChild(m); }
      r.appendChild(tx);
      if(wbKlaar(o)){ const k = el("span", "wbklaar"); k.style.background = o.kleur; k.appendChild(icon("check", 14)); r.appendChild(k); }
      r.appendChild(el("span", "wbpijl", "›"));
      r.onclick = () => { wbOpen = o.id; tvStap = null; gsOpen = null; gsStap = null; nwBewerk = null; neeKaart = null; wbToon(); };
      lijst.appendChild(r);
    });
    box.appendChild(lijst);
  });
}

// ---- G-schema: stap voor stap, daarna een samenvatting ----
const GS_DELEN = [
  {k: "gebeurtenis", t: "Gebeurtenis", te: "Event", v: "Wat gebeurde er? Waar, wanneer en met wie?", ve: "What happened? Where, when and with whom?", p: "Bijvoorbeeld: mijn huisgenoot pakte mijn eten uit de koelkast.", pe: "For example: my housemate took my food from the fridge.",
   tip: "Beschrijf alleen de feiten, zoals een camera het zou filmen. Je mening komt bij de volgende stap.", tipEn: "Describe only the facts, as a camera would film it. Your opinion comes in the next step."},
  {k: "gedachten", t: "Gedachten", te: "Thoughts", v: "Wat dacht ik op dat moment?", ve: "What did I think at that moment?", chips: "gs.gedachten", p: "Wat ging er door je hoofd?", pe: "What went through your head?",
   tip: "Gedachten gaan vaak razendsnel. Schrijf ze op zoals ze in je hoofd klonken, ook als ze overdreven zijn.", tipEn: "Thoughts often go very fast. Write them down as they sounded in your head, even if they are exaggerated."},
  {k: "gevoelens", t: "Gevoelens", te: "Feelings", v: "Wat voelde ik, en hoe sterk?", ve: "What did I feel, and how strongly?", chips: "gs.gevoelens", alleenChips: true,
   tip: "Kies één of meer gevoelens. Geef daarna aan hoe sterk het gevoel was.", tipEn: "Choose one or more feelings. Then say how strong the feeling was."},
  {k: "gedrag", t: "Gedrag", te: "Behaviour", v: "Wat deed ik?", ve: "What did I do?", chips: "gs.gedrag", p: "Wat deed je precies?", pe: "What exactly did you do?",
   tip: "Wat deed je echt, met je handen, je mond en je benen? Niet wat je had willen doen.", tipEn: "What did you actually do, with your hands, your mouth and your legs? Not what you wanted to do."},
  {k: "gevolgen", t: "Gevolgen", te: "Consequences", v: "Wat gebeurde er daarna? Voor mij en voor anderen.", ve: "What happened afterwards? For me and for others.", chips: "gs.gevolgen", p: "Op korte termijn, en later?", pe: "In the short term, and later?",
   tip: "Kijk naar de korte termijn (meteen daarna) en de lange termijn (later die dag, de dagen erna).", tipEn: "Look at the short term (right afterwards) and the long term (later that day, the days after)."},
  {k: "helpend", plus: true, t: "Helpende gedachte", te: "Helpful thought", v: "Wat had ik ook kunnen denken? En wat doe ik de volgende keer?", ve: "What could I have thought instead? And what will I do next time?", chips: "gs.helpend", chips2: "gs.volgende", p: "In je eigen woorden…", pe: "In your own words…",
   tip: "Een helpende gedachte is niet ‘alles is leuk’, maar een eerlijke gedachte die je rustiger maakt.", tipEn: "A helpful thought isn't ‘everything is great’, but an honest thought that calms you down."}
];
const gsVind = id => (wbLees().gschema || []).find(x => x.id === id);
const gsDeelGevuld = (g, d) => !!((g[d.k] || "").trim() || ((g.keuzes || {})[d.k] || []).length || (d.chips2 && ((g.keuzes || {}).volgende || []).length));
function gsNieuw(vooraf){
  const d = wbData(), g = Object.assign({id: wbId(), date: todayKey(), keuzes: {}}, vooraf || {}, {updated: Date.now()});
  d.gschema.unshift(g); tvBewaar();
  wbOpen = "gschema"; gsOpen = g.id; gsStap = vooraf && vooraf.gebeurtenis ? 1 : 0; wbToon();
}
function renderGsLijst(box){
  box.appendChild(wbTerug());
  const kop = wbKop("gschema", vt("G-schema", "ABC diary"), vt("Neem één moment dat je bezighoudt, zoals een ruzie, een craving of een moment dat je boos werd. Je pluist het stap voor stap uit: gebeurtenis, gedachten, gevoelens, gedrag en gevolgen. Daarna bedenk je een helpende gedachte. Zo zie je hoe je gedachten je gevoel en gedrag sturen.", "Take one moment that is on your mind, like an argument, a craving or a moment you got angry. You unpick it step by step: event, thoughts, feelings, behaviour and consequences. Then you come up with a helpful thought. That way you see how your thoughts steer your feelings and behaviour."));
  const b = el("button", "primary", vt("+ Nieuw G-schema", "+ New ABC diary")); b.type = "button"; b.style.marginTop = "14px"; b.onclick = () => gsNieuw();
  kop.appendChild(b); box.appendChild(kop);
  const l = (wbLees().gschema || []).slice().sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.updated || 0) - (a.updated || 0));
  if(!l.length){ const e = note(vt("Tip: bij een conflict, craving of trigger in je dagbeschouwing staat een knop om er meteen een G-schema van te maken.", "Tip: with a conflict, craving or trigger in your daily reflection there is a button to turn it into an ABC diary straight away.")); e.style.margin = "4px 4px 0"; box.appendChild(e); return; }
  l.forEach(g => {
    const c = el("button", "card gskaart"); c.type = "button";
    const top = el("div", "gskaarttop"); top.appendChild(el("span", "gsdatum", wbDatum(g.date)));
    const stip = el("span", "gsstippen"); GS_DELEN.forEach(d => stip.appendChild(el("i", gsDeelGevuld(g, d) ? "on" : null))); top.appendChild(stip);
    c.appendChild(top);
    c.appendChild(el("div", "gstitel", (g.gebeurtenis || "").trim().split("\n")[0] || vt("Nog geen gebeurtenis ingevuld", "No event filled in yet")));
    const gv = (g.keuzes || {}).gevoelens || [];
    if(gv.length) c.appendChild(wbTags(gv.slice(0, 4)));
    c.onclick = () => { gsOpen = g.id; gsStap = GS_DELEN.every(d => gsDeelGevuld(g, d)) ? null : Math.max(0, GS_DELEN.findIndex(d => !gsDeelGevuld(g, d))); wbToon(); };
    box.appendChild(c);
  });
}
function gsBalk(g, huidig){
  const b = el("div", "tvbalk gsbalk");
  GS_DELEN.forEach((d, i) => {
    const x = el("i"); if(gsDeelGevuld(g, d)) x.classList.add("on"); if(i === huidig) x.classList.add("nu");
    x.setAttribute("role", "button"); x.tabIndex = 0; x.setAttribute("aria-label", vt(d.t, d.te));
    x.onclick = () => { gsStap = i; wbToon(); }; toetsKlik(x);
    b.appendChild(x);
  });
  return b;
}
function renderGsStap(box){
  const g = gsVind(gsOpen); if(!g){ gsOpen = null; gsStap = null; return renderGsLijst(box); }
  const i = gsStap, d = GS_DELEN[i], bewaar = () => { g.updated = Date.now(); tvBewaar(); };
  box.appendChild(tvTerugLink(vt("Terug naar G-schema’s", "Back to ABC diaries"), () => { gsOpen = null; gsStap = null; wbToon(); }));
  box.appendChild(el("div", "tvstapkop", vt("Stap " + (i + 1) + " van " + GS_DELEN.length, "Step " + (i + 1) + " of " + GS_DELEN.length) + "  ·  " + wbDatum(g.date)));
  box.appendChild(gsBalk(g, i));
  const c = el("div", "card gsstap");
  const h = el("div", "gskop");
  h.appendChild(el("span", "gsletter groot" + (d.plus ? " plus" : ""), d.plus ? "+" : "G" + (i + 1)));
  const ht = el("div"); ht.appendChild(el("b", "gsdeeltitel", vt(d.t, d.te))); ht.appendChild(el("small", null, vt(d.v, d.ve)));
  h.appendChild(ht); c.appendChild(h);
  c.appendChild(el("div", "tip", vt(d.tip, d.tipEn)));
  const keuze = k => ({get: () => (g.keuzes || {})[k], set: l => { g.keuzes = g.keuzes || {}; if(l.length) g.keuzes[k] = l; else delete g.keuzes[k]; bewaar(); }});
  if(d.chips) c.appendChild(wbChips(Object.assign({k: d.chips, id: g.id, cls: d.k === "gevoelens" ? "feel" : "", l: d.chips2 ? "Wat had ik ook kunnen denken?" : null, le: "What could I have thought instead?"}, keuze(d.k))));
  if(d.k === "gevoelens") c.appendChild(wbChips(Object.assign({k: "gs.sterkte", id: g.id, enkel: true, geenEigen: true, l: "Hoe sterk was het gevoel?", le: "How strong was the feeling?", cls: "sterkte"}, keuze("sterkte"))));
  if(d.chips2) c.appendChild(wbChips(Object.assign({k: d.chips2, id: g.id, l: "Wat doe ik de volgende keer?", le: "What will I do next time?"}, keuze("volgende"))));
  if(!d.alleenChips) c.appendChild(wbTekstveld(g[d.k], d.p, d.pe, v => { g[d.k] = v; bewaar(); }, vt(d.t, d.te)));
  box.appendChild(c);
  const row = el("div", "row");
  const vorige = el("button", "ghost", vt("‹ Vorige", "‹ Previous")); vorige.type = "button"; vorige.disabled = i === 0; vorige.onclick = () => { gsStap = i - 1; wbToon(); };
  const laatste = i === GS_DELEN.length - 1;
  const volgende = el("button", "primary", laatste ? vt("Klaar", "Done") : vt("Volgende ›", "Next ›")); volgende.type = "button";
  volgende.onclick = () => { gsStap = laatste ? null : i + 1; if(laatste) saveSettingsNow(); wbToon(); };
  row.appendChild(vorige); row.appendChild(volgende); box.appendChild(row);
}
// samenvatting: de G's als ketting onder elkaar
function renderGs(box){
  const g = gsVind(gsOpen); if(!g){ gsOpen = null; return renderGsLijst(box); }
  box.appendChild(tvTerugLink(vt("Terug naar G-schema’s", "Back to ABC diaries"), () => { gsOpen = null; wbToon(); }));
  const c = el("div", "card gssamen");
  c.appendChild(el("div", "tvkicker", vt("G-schema · ", "ABC diary · ") + wbDatum(g.date)));
  const kt = el("div", "gsketen");
  GS_DELEN.forEach((d, i) => {
    const s = el("div", "gsschakel" + (d.plus ? " plus" : ""));
    s.appendChild(el("span", "gsletter" + (d.plus ? " plus" : ""), d.plus ? "+" : "G" + (i + 1)));
    const inh = el("div", "gsinh");
    const kop = el("div", "gsinhkop"); kop.appendChild(el("b", null, vt(d.t, d.te)));
    const e = el("button", "linkbtn", gsDeelGevuld(g, d) ? vt("Wijzig", "Edit") : vt("Invullen", "Fill in")); e.type = "button"; e.onclick = () => { gsStap = i; wbToon(); };
    kop.appendChild(e); inh.appendChild(kop);
    const kz = g.keuzes || {};
    if((kz[d.k] || []).length) inh.appendChild(wbTags(kz[d.k]));
    if(d.k === "gevoelens" && (kz.sterkte || []).length){ const st = parseInt(kz.sterkte[0], 10); const m = el("div", "gssterkte"); const f = el("i"); f.style.width = (st * 10) + "%"; m.appendChild(f); inh.appendChild(m); inh.appendChild(el("small", "gssterktetx", wbT(kz.sterkte[0]))); }
    if((g[d.k] || "").trim()) inh.appendChild(el("div", "gstekst", g[d.k].trim()));
    if(d.chips2 && (kz.volgende || []).length){ inh.appendChild(el("div", "tvsub", vt("Volgende keer", "Next time"))); inh.appendChild(wbTags(kz.volgende)); }
    if(!gsDeelGevuld(g, d)) inh.appendChild(el("div", "gsleeg", "–"));
    s.appendChild(inh); kt.appendChild(s);
  });
  c.appendChild(kt);
  box.appendChild(c);
  const k2 = el("div", "card");
  k2.appendChild(el("div", "qtitle", vt("Bespreken of bewaren", "Discuss or keep")));
  const n = note(vt("Neem dit mee naar je 1-op-1 of bespreek het met je sponsor.", "Take this to your 1-to-1 or talk it through with your sponsor.")); n.style.marginTop = "4px"; k2.appendChild(n);
  k2.appendChild(wbDownloadKnoppen(() => ({titel: vt("G-schema", "ABC diary"), intro: wbDatum(g.date), secties: GS_DELEN.map((d, i) => {
    const kz = g.keuzes || {}, rijen = [];
    if((kz[d.k] || []).length) rijen.push({label: "", items: kz[d.k].map(x => cap(wbT(x)))});
    if(d.k === "gevoelens" && (kz.sterkte || []).length) rijen.push({label: vt("Hoe sterk", "How strong"), items: [wbT(kz.sterkte[0])]});
    if(d.chips2 && (kz.volgende || []).length) rijen.push({label: vt("Volgende keer", "Next time"), items: kz.volgende.map(x => cap(wbT(x)))});
    return {kop: d.plus ? vt("Tot slot", "Finally") : "G" + (i + 1) + " · " + vt(d.t, d.te), titel: vt(d.v, d.ve), rijen, notitie: (g[d.k] || "").trim()};
  }).filter(s => s.rijen.length || s.notitie)})));
  const weg = el("button", "linkbtn wbweg", vt("Dit G-schema weggooien", "Delete this ABC diary")); weg.type = "button";
  weg.onclick = async () => {
    if(!(await confirmDialog(vt("G-schema weggooien?", "Delete ABC diary?"), vt("Dit G-schema verdwijnt helemaal.", "This ABC diary will be removed completely."), vt("Weggooien", "Delete")))) return;
    const d = wbData(); d.gschema = d.gschema.filter(x => x.id !== g.id); gsOpen = null; await saveSettingsNow(); wbToon();
  };
  k2.appendChild(weg);
  box.appendChild(k2);
}
// vanuit de dagbeschouwing (vraag 3, 5 of 6): G-schema met wat je al hebt ingevuld
function gsVanuitDag(q){
  const e = entry, kies = r => picked(e, q.id, r).map(vItem);
  let geb = "", gev = [];
  if(q.id === "q3"){ const w = kies(0); geb = vt("Conflict", "Conflict") + (w.length ? vt(" met ", " with ") + w.join(", ") : ""); gev = picked(e, "q3", 1); }
  if(q.id === "q5"){ const w = kies(1); geb = vt("Craving", "Craving") + (w.length ? " " + w.join(", ") : ""); }
  if(q.id === "q6"){ const w = kies(0); geb = vt("Trigger", "Trigger") + (w.length ? ": " + w.join(", ") : ""); gev = picked(e, "q6", 1); }
  gsNieuw({date: curKey || todayKey(), gebeurtenis: geb, keuzes: gev.length ? {gevoelens: gev} : {}});
}

// ---- beslisbalans ----
const BALANS_VAKKEN = [
  {k: "vgebruik", t: "Voordelen van gebruiken", te: "Pros of using", v: "Wat leverde gebruiken me op?", ve: "What did using give me?", kant: "gebruik"},
  {k: "ngebruik", t: "Nadelen van gebruiken", te: "Cons of using", v: "Wat kostte het me?", ve: "What did it cost me?", z: "rood", kant: "clean"},
  {k: "vclean", t: "Voordelen van clean blijven", te: "Pros of staying clean", v: "Wat levert clean zijn me op?", ve: "What does being clean give me?", z: "groen", kant: "clean"},
  {k: "nclean", t: "Nadelen van clean blijven", te: "Cons of staying clean", v: "Wat is er moeilijk aan?", ve: "What is hard about it?", z: "oranje", kant: "gebruik"}
];
// weegschaal: links wat naar gebruiken trekt, rechts wat naar clean blijven trekt
function balansWeegschaal(){
  const it = wbItems("balans"), tel = k => (it[k] || []).length;
  const links = tel("vgebruik") + tel("nclean"), rechts = tel("ngebruik") + tel("vclean"), som = links + rechts;
  const c = el("div", "card balansschaal");
  c.appendChild(el("div", "qtitle", vt("Mijn weegschaal", "My scales")));
  const hoek = som ? Math.max(-14, Math.min(14, (links - rechts) / som * 22)) : 0;
  const svg = '<svg viewBox="0 0 240 120" aria-hidden="true"><path d="M120 22v78M86 104h68" class="voet"/><g transform="rotate(' + hoek.toFixed(1) + ' 120 26)"><path d="M30 26h180" class="arm"/>' +
    '<path d="M30 26 14 62h32z" class="draad"/><path d="M210 26l-16 36h32z" class="draad"/><path d="M10 62h40a20 9 0 0 1-40 0z" class="schaal links"/><path d="M190 62h40a20 9 0 0 1-40 0z" class="schaal rechts"/>' +
    '<text x="30" y="88" class="getal">' + links + '</text><text x="210" y="88" class="getal">' + rechts + '</text></g><circle cx="120" cy="26" r="5" class="as"/></svg>';
  const s = el("div", "balanssvg"); s.innerHTML = svg; c.appendChild(s);
  const lb = el("div", "balanslabels"); lb.appendChild(el("span", null, vt("Trekt naar gebruiken", "Pulls towards using"))); lb.appendChild(el("span", null, vt("Trekt naar clean blijven", "Pulls towards staying clean"))); c.appendChild(lb);
  const zin = !som ? vt("Vul de vakken hieronder in. Dan zie je welke kant voor jou het zwaarst weegt.", "Fill in the boxes below. Then you'll see which side weighs heaviest for you.")
    : rechts > links ? vt("Je redenen om clean te blijven wegen zwaarder. Lees ze terug als je twijfelt.", "Your reasons to stay clean weigh more. Read them back when you're in doubt.")
    : rechts === links ? vt("Het weegt nu ongeveer even zwaar. Kijk welke punten voor jou écht het belangrijkst zijn.", "It's about even right now. Look at which points really matter most to you.")
    : vt("De kant van gebruiken weegt nu zwaarder. Dat is eerlijk, en goed om te bespreken met je sponsor of begeleider.", "The using side weighs more right now. That's honest, and worth talking about with your sponsor or support worker.");
  const n = note(zin); n.style.marginTop = "10px"; c.appendChild(n);
  return c;
}
function renderBalans(box){
  box.appendChild(wbTerug());
  box.appendChild(wbKop("balans", vt("Beslisbalans", "Decision balance"), vt("Eerlijk kijken naar beide kanten. Ook gebruiken had voordelen, anders deed je het niet. Door alles op een rij te zetten, zie je waar het voor jou om gaat. Wat clean zijn je oplevert en wat gebruiken je kost, zie je terug in je noodplan bij oranje en rood.", "An honest look at both sides. Using had its advantages too, or you wouldn't have done it. By putting everything side by side, you see what really matters to you. What being clean gives you and what using costs you show up in your emergency plan under orange and red.")));
  const schaal = balansWeegschaal(); box.appendChild(schaal);
  let huidig = schaal;
  BALANS_VAKKEN.forEach(v => {
    const c = el("div", "card balansvak"); if(v.z) c.dataset.z = v.z;
    const h = el("div", "balanskop"); h.appendChild(el("span", "balanskant", v.kant === "clean" ? vt("Clean", "Clean") : vt("Gebruiken", "Using")));
    h.appendChild(el("div", "qtitle", vt(v.t, v.te))); c.appendChild(h);
    const s = note(vt(v.v, v.ve)); s.style.marginTop = "2px"; c.appendChild(s);
    c.appendChild(wbVakChips("balans", v.k, {na: () => { const n = balansWeegschaal(); huidig.replaceWith(n); huidig = n; }}));
    box.appendChild(c);
  });
  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", vt("Wat weegt voor mij het zwaarst?", "What matters most to me?")));
  c.appendChild(wbTekstveld((wbLees().balans || {}).notitie, "Schrijf het in je eigen woorden…", "Write it in your own words…", v => { const d = wbData(); d.balans.notitie = v; tvBewaar(); }, vt("Wat weegt voor mij het zwaarst?", "What matters most to me?")));
  c.appendChild(wbDownloadKnoppen(() => {
    const it = wbItems("balans"), nt = ((wbLees().balans || {}).notitie || "").trim();
    return {titel: vt("Beslisbalans", "Decision balance"), secties: BALANS_VAKKEN.filter(v => (it[v.k] || []).length).map(v => ({z: v.z, kop: vt(v.t, v.te), titel: vt(v.v, v.ve), rijen: [{label: "", items: it[v.k].map(x => cap(wbT(x)))}], notitie: ""}))
      .concat(nt ? [{kop: vt("Tot slot", "Finally"), titel: vt("Wat weegt voor mij het zwaarst?", "What matters most to me?"), rijen: [], notitie: nt}] : [])};
  }));
  box.appendChild(c);
}

// ---- netwerkkaart ----
const NW_SOORTEN = [
  {k: "helpt", z: "groen", t: "Helpt mij", te: "Helps me", u: "Bij deze mensen kun je terecht.", ue: "You can turn to these people."},
  {k: "twijfel", z: "oranje", t: "Twijfel", te: "Not sure", u: "Soms fijn, soms lastig. Let op hoe het met je gaat na contact.", ue: "Sometimes good, sometimes hard. Notice how you feel after contact."},
  {k: "risico", z: "rood", t: "Risico", te: "Risk", u: "Contact met deze mensen maakt gebruiken dichterbij.", ue: "Contact with these people brings using closer."}
];
const NW_AFSTAND = [{k: "dichtbij", t: "Dichtbij", te: "Close", r: 64}, {k: "tussenin", t: "Tussenin", te: "In between", r: 104}, {k: "ver", t: "Verder weg", te: "Further away", r: 144}];
const nwInNoodplan = p => p.tel && ((settings.sos || {}).contacts || []).some(c => (c.phone || "").replace(/[^\d+]/g, "") === p.tel.replace(/[^\d+]/g, ""));
const nwEsc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// de kaart: jij in het midden, drie ringen, mensen als gekleurde rondjes
function nwKaart(l){
  const W = 320, C = 160;
  let s = '<svg viewBox="0 0 ' + W + ' ' + (W + 22) + '" role="img" aria-label="' + nwEsc(vt("Mijn netwerkkaart", "My network map")) + '">';
  NW_AFSTAND.slice().reverse().forEach((a, i) => { s += '<circle cx="' + C + '" cy="' + C + '" r="' + a.r + '" class="ring r' + i + '"/>'; });
  NW_AFSTAND.forEach(a => { s += '<text x="' + C + '" y="' + (C - a.r + 13) + '" class="ringtx">' + nwEsc(vt(a.t, a.te)) + '</text>'; });
  s += '<circle cx="' + C + '" cy="' + C + '" r="26" class="ik"/><text x="' + C + '" y="' + (C + 5) + '" class="iktx">' + nwEsc(vt("Ik", "Me")) + '</text>';
  NW_AFSTAND.forEach((a, ri) => {
    const mensen = l.filter(p => (p.afstand || "dichtbij") === a.k);
    mensen.forEach((p, i) => {
      const hoek = (-55 + (i + 0.5) * 290 / mensen.length + (ri - 1) * 12) * Math.PI / 180;
      const x = C + a.r * Math.cos(hoek), y = C + a.r * Math.sin(hoek);
      const z = (NW_SOORTEN.find(t => t.k === p.soort) || NW_SOORTEN[0]).z;
      s += '<g data-z="' + z + '" class="nwstip"><title>' + nwEsc(p.naam) + '</title><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="15"/><text x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" class="init">' + nwEsc((p.naam || "?").trim().charAt(0).toUpperCase()) + '</text>' +
        '<text x="' + x.toFixed(1) + '" y="' + (y + 29).toFixed(1) + '" class="naam">' + nwEsc((p.naam || "").slice(0, 10)) + '</text></g>';
    });
  });
  const w = el("div", "nwkaart"); w.innerHTML = s + "</svg>";
  const lg = el("div", "nwlegenda");
  NW_SOORTEN.forEach(t => { const i = el("span"); i.dataset.z = t.z; i.appendChild(el("span", "tvdot")); i.appendChild(document.createTextNode(vt(t.t, t.te))); lg.appendChild(i); });
  w.appendChild(lg);
  return w;
}
function renderNetwerk(box){
  box.appendChild(wbTerug());
  const l = wbLees().netwerk || [];
  const kop = wbKop("netwerk", vt("Netwerkkaart", "Network map"), vt("Zet de mensen om je heen op de kaart. Hoe dichtbij staan ze, en helpen ze je of zijn ze een risico? Mensen die je helpen, kun je met één tik in je noodplan zetten.", "Put the people around you on the map. How close are they, and do they help you or are they a risk? People who help you can be added to your emergency plan with one tap."));
  if(nwBewerk === null){
    const b = el("button", "primary", vt("+ Persoon toevoegen", "+ Add person")); b.type = "button"; b.style.marginTop = "14px";
    b.onclick = () => { nwBewerk = {id: wbId(), naam: "", rol: "", soort: "helpt", afstand: "dichtbij", tel: "", nieuw: true}; renderWerkboek(); };
    kop.appendChild(b);
  }
  box.appendChild(kop);
  if(nwBewerk) box.appendChild(nwFormulier());
  if(l.length){ const k = el("div", "card"); k.appendChild(nwKaart(l)); box.appendChild(k); }
  NW_SOORTEN.forEach(s => {
    const mensen = l.filter(p => p.soort === s.k);
    const c = el("div", "card nwgroep"); c.dataset.z = s.z;
    const h = el("div", "nwkop"); h.appendChild(el("span", "tvdot")); h.appendChild(el("b", null, vt(s.t, s.te))); h.appendChild(el("span", "nwaantal", String(mensen.length)));
    c.appendChild(h);
    const u = note(vt(s.u, s.ue)); u.style.marginTop = "2px"; c.appendChild(u);
    mensen.forEach(p => {
      const r = el("div", "nwpersoon");
      r.appendChild(el("span", "nwav", (p.naam || "?").trim().charAt(0).toUpperCase()));
      const tx = el("div", "nwtx"); tx.appendChild(el("b", null, p.naam || "?"));
      const sub = [p.rol ? cap(wbT(p.rol)) : "", vt((NW_AFSTAND.find(a => a.k === (p.afstand || "dichtbij")) || NW_AFSTAND[0]).t, (NW_AFSTAND.find(a => a.k === (p.afstand || "dichtbij")) || NW_AFSTAND[0]).te).toLowerCase()].filter(Boolean).join(" · ");
      tx.appendChild(el("small", null, sub));
      if(p.tel) tx.appendChild(el("small", "nwtel", fmtPhone(p.tel)));
      if(s.k === "helpt" && p.tel){
        if(nwInNoodplan(p)){ const i = el("span", "nwin"); i.appendChild(icon("check", 13)); i.appendChild(document.createTextNode(vt(" In je noodplan", " In your emergency plan"))); tx.appendChild(i); }
        else {
          const z = el("button", "linkbtn nwnood", vt("+ Zet in noodplan", "+ Add to plan")); z.type = "button";
          z.onclick = async () => { settings.sos = Object.assign({steps: [], contacts: [], reason: ""}, settings.sos || {}); settings.sos.contacts = (settings.sos.contacts || []).concat([{name: p.naam, phone: fmtPhone(p.tel)}]); await saveSettingsNow(); toast(vt(p.naam + " staat nu in je noodplan.", p.naam + " is now in your emergency plan.")); renderWerkboek(); };
          tx.appendChild(z);
        }
      }
      r.appendChild(tx);
      const acties = el("div", "nwacties");
      if(p.tel && s.k !== "risico"){ const a = el("a", "ghost nwbel", vt("Bel", "Call")); a.href = "tel:" + p.tel.replace(/[^\d+]/g, ""); acties.appendChild(a); }
      const e = el("button", "linkbtn", vt("Wijzig", "Edit")); e.type = "button"; e.onclick = () => { nwBewerk = Object.assign({afstand: "dichtbij"}, p); renderWerkboek(); window.scrollTo(0, 0); };
      acties.appendChild(e); r.appendChild(acties);
      c.appendChild(r);
    });
    box.appendChild(c);
  });
  if(l.length){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Bespreken of bewaren", "Discuss or keep")));
    c.appendChild(wbDownloadKnoppen(() => ({titel: vt("Netwerkkaart", "Network map"), secties: NW_SOORTEN.map(s => ({z: s.z, kop: vt(s.t, s.te), titel: vt(s.u, s.ue),
      rijen: [{label: "", items: (wbLees().netwerk || []).filter(p => p.soort === s.k).map(p => p.naam + (p.rol ? " (" + wbT(p.rol) + ")" : "") + (p.tel ? "  " + fmtPhone(p.tel) : ""))}].filter(r => r.items.length), notitie: ""})).filter(s => s.rijen.length)})));
    box.appendChild(c);
  }
}
function nwFormulier(){
  const p = nwBewerk;
  const c = el("div", "card nwform");
  c.appendChild(el("div", "qtitle", p.nieuw ? vt("Nieuwe persoon", "New person") : vt("Persoon wijzigen", "Edit person")));
  c.appendChild(el("div", "label", vt("Naam", "Name")));
  const nm = el("input", "sosinp"); nm.value = p.naam; nm.placeholder = vt("Voornaam of bijnaam", "First name or nickname"); nm.oninput = () => { p.naam = nm.value; };
  c.appendChild(nm);
  c.appendChild(wbChips({k: "nw.rol", l: "Wie is het?", le: "Who is it?", enkel: true, get: () => p.rol ? [p.rol] : [], set: l => { p.rol = l[0] || ""; }}));
  const kies = (label, labelEn, lijst, sleutel, metStip) => {
    c.appendChild(el("div", "label", vt(label, labelEn)));
    const sk = el("div", "tvkies nwsoort");
    lijst.forEach(s => {
      const b = el("button", "tvknop" + (p[sleutel] === s.k ? " on" : "")); b.type = "button"; if(s.z) b.dataset.z = s.z; b.setAttribute("aria-pressed", p[sleutel] === s.k ? "true" : "false");
      if(metStip) b.appendChild(el("span", "tvdot")); b.appendChild(el("b", null, vt(s.t, s.te)));
      b.onclick = () => { p[sleutel] = s.k; sk.querySelectorAll(".tvknop").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); }); };
      sk.appendChild(b);
    });
    c.appendChild(sk);
  };
  kies("Hoe is het contact voor mij?", "How is the contact for me?", NW_SOORTEN, "soort", true);
  kies("Hoe dichtbij staat deze persoon?", "How close is this person?", NW_AFSTAND, "afstand", false);
  c.appendChild(el("div", "label", vt("Telefoon (mag leeg)", "Phone (optional)")));
  const ph = el("input", "sosinp"); ph.type = "tel"; ph.inputMode = "tel"; ph.value = p.tel || ""; ph.placeholder = vt("Bijv. 06 12345678", "E.g. 06 12345678");
  ph.oninput = () => { p.tel = ph.value; }; ph.onblur = () => { ph.value = fmtPhone(ph.value); p.tel = ph.value; };
  c.appendChild(ph);
  const row = el("div", "row"); row.style.marginTop = "14px";
  const annul = el("button", "ghost", vt("Annuleren", "Cancel")); annul.type = "button"; annul.onclick = () => { nwBewerk = null; renderWerkboek(); };
  const ok = el("button", "primary", vt("Opslaan", "Save")); ok.type = "button";
  ok.onclick = async () => {
    if(!p.naam.trim()){ nm.focus(); toast(vt("Vul een naam in.", "Fill in a name."), true); return; }
    const d = wbData(), nieuw = {id: p.id, naam: p.naam.trim(), rol: p.rol || "", soort: p.soort, afstand: p.afstand || "dichtbij", tel: fmtPhone(p.tel || "")};
    const i = d.netwerk.findIndex(x => x.id === p.id); if(i >= 0) d.netwerk[i] = nieuw; else d.netwerk.push(nieuw);
    nwBewerk = null; await saveSettingsNow(); renderWerkboek();
  };
  row.appendChild(annul); row.appendChild(ok); c.appendChild(row);
  if(!p.nieuw){
    const weg = el("button", "linkbtn wbweg", vt("Weghalen uit mijn netwerkkaart", "Remove from my network map")); weg.type = "button";
    weg.onclick = async () => { const d = wbData(); d.netwerk = d.netwerk.filter(x => x.id !== p.id); nwBewerk = null; await saveSettingsNow(); renderWerkboek(); };
    c.appendChild(weg);
  }
  requestAnimationFrame(() => { if(p.nieuw) nm.focus(); });
  return c;
}

// ---- plezierlijst ----
const PL_VAKKEN = [
  {k: "alleen", t: "Alleen", te: "On my own"},
  {k: "samen", t: "Samen met anderen", te: "With others"},
  {k: "buiten", t: "Buiten en bewegen", te: "Outdoors and moving"},
  {k: "nieuw", t: "Iets nieuws", te: "Something new"}
];
const plAlles = () => { const it = wbItems("plezier"); return PL_VAKKEN.reduce((a, v) => a.concat(it[v.k] || []), []); };
function renderPlezier(box){
  box.appendChild(wbTerug());
  box.appendChild(wbKop("plezier", vt("Plezierlijst", "Fun list"), vt("Verveling is een van de bekendste triggers. Maak een lijst met dingen die je leuk vindt of weer wilt leren doen, zonder middelen. Op een lege dag kies je er één uit.", "Boredom is one of the best-known triggers. Make a list of things you enjoy or want to learn again, without substances. On an empty day, pick one.")));
  const kies = el("div", "card plkies");
  const tekenKies = () => {
    kies.innerHTML = "";
    const l = plAlles();
    kies.appendChild(el("div", "qtitle", vt("Ik verveel me", "I'm bored")));
    if(!l.length){ const n = note(vt("Tik hieronder aan wat je leuk vindt. Dan kiest de app hier iets voor je.", "Tap below what you enjoy. Then the app picks something for you here.")); n.style.marginTop = "4px"; kies.appendChild(n); return; }
    if(plKeuze && l.indexOf(plKeuze) >= 0){ const k = el("div", "plkeuze", cap(wbT(plKeuze))); kies.appendChild(k); }
    const b = el("button", "primary", plKeuze ? vt("Kies iets anders", "Pick something else") : vt("Kies iets voor me", "Pick something for me")); b.type = "button"; b.style.marginTop = "12px";
    b.onclick = () => { const andere = l.filter(x => x !== plKeuze); plKeuze = (andere.length ? andere : l)[Math.floor(Math.random() * (andere.length || l.length))]; tekenKies(); };
    kies.appendChild(b);
  };
  tekenKies(); box.appendChild(kies);
  PL_VAKKEN.forEach(v => {
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt(v.t, v.te)));
    c.appendChild(wbVakChips("pl", v.k, {na: tekenKies}));
    box.appendChild(c);
  });
  if(plAlles().length){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Bespreken of bewaren", "Discuss or keep")));
    c.appendChild(wbDownloadKnoppen(() => ({titel: vt("Plezierlijst", "Fun list"), secties: PL_VAKKEN.filter(v => (wbItems("plezier")[v.k] || []).length).map(v => ({hex: "E0A33A", kop: vt("Plezierlijst", "Fun list"), titel: vt(v.t, v.te), rijen: [{label: "", items: wbItems("plezier")[v.k].map(x => cap(wbT(x)))}], notitie: ""}))})));
    box.appendChild(c);
  }
}

// ---- nee zeggen ----
const NEE_TIPS = [["Kijk de ander aan en zeg het rustig.", "Look the other person in the eye and say it calmly."], ["Kort en duidelijk. Je hoeft niets uit te leggen.", "Short and clear. You don't have to explain anything."], ["Zeg het nog een keer als het nodig is.", "Say it again if you need to."], ["Lukt het niet? Ga weg. Dat is ook nee zeggen.", "Not working? Walk away. That's saying no too."]];
function renderNee(box){
  box.appendChild(wbTerug());
  box.appendChild(wbKop("nee", vt("Nee zeggen", "Saying no"), vt("Als iemand je iets aanbiedt, heb je weinig tijd om na te denken. Daarom bereid je het nu voor: in welke situaties kan het gebeuren, en wat zeg jij dan? Oefen je zinnen hardop, zodat ze er vanzelf uitkomen.", "When someone offers you something, you have little time to think. That's why you prepare now: in which situations could it happen, and what will you say? Practise your sentences out loud, so they come out by themselves.")));
  const t = el("div", "card neetips");
  t.appendChild(el("div", "qtitle", vt("Zo zeg je nee", "How to say no")));
  const ol = el("ol", "soslist");
  NEE_TIPS.forEach((x, i) => { const li = el("li"); li.style.cursor = "default"; li.appendChild(el("div", "num", String(i + 1))); li.appendChild(el("span", "t", vt(x[0], x[1]))); ol.appendChild(li); });
  t.appendChild(ol); box.appendChild(t);
  const c1 = el("div", "card"); c1.appendChild(el("div", "qtitle", vt("Wanneer kan het gebeuren?", "When could it happen?")));
  const kaart = el("div", "card neekaart");
  const tekenKaart = () => {
    kaart.innerHTML = "";
    const sit = wbItems("nee").situaties || [], zin = wbItems("nee").zinnen || [];
    kaart.appendChild(el("div", "qtitle", vt("Oefenen", "Practise")));
    if(!sit.length || !zin.length){ const n = note(vt("Kies hierboven minstens één situatie en hieronder minstens één zin. Dan kun je hier oefenen.", "Choose at least one situation above and at least one sentence below. Then you can practise here.")); n.style.marginTop = "4px"; kaart.appendChild(n); return; }
    if(neeKaart){
      const k = el("div", "neevraag"); k.appendChild(el("small", null, vt("Stel je voor:", "Imagine:"))); k.appendChild(el("b", null, cap(wbT(neeKaart.sit)))); kaart.appendChild(k);
      if(neeKaart.toon){ const a = el("div", "neeantwoord"); a.appendChild(el("small", null, vt("Jij zegt:", "You say:"))); a.appendChild(el("b", null, wbT(neeKaart.zin))); kaart.appendChild(a); }
    } else { const n = note(vt("Je krijgt een situatie. Zeg hardop wat je zou zeggen, en kijk dan naar je eigen zin.", "You'll get a situation. Say out loud what you would say, then look at your own sentence.")); n.style.marginTop = "4px"; kaart.appendChild(n); }
    const row = el("div", "row"); row.style.cssText = "justify-content:flex-start;flex-wrap:wrap;margin-top:12px";
    if(neeKaart && !neeKaart.toon){ const b = el("button", "primary", vt("Laat mijn zin zien", "Show my sentence")); b.type = "button"; b.onclick = () => { neeKaart.toon = true; tekenKaart(); }; row.appendChild(b); }
    const nw = el("button", neeKaart && !neeKaart.toon ? "ghost" : "primary", neeKaart ? vt("Nieuwe situatie", "New situation") : vt("Begin met oefenen", "Start practising")); nw.type = "button";
    nw.onclick = () => { neeKaart = {sit: sit[Math.floor(Math.random() * sit.length)], zin: zin[Math.floor(Math.random() * zin.length)], toon: false}; tekenKaart(); };
    row.appendChild(nw); kaart.appendChild(row);
  };
  c1.appendChild(wbVakChips("nee", "situaties", {na: tekenKaart})); box.appendChild(c1);
  const c2 = el("div", "card"); c2.appendChild(el("div", "qtitle", vt("Wat zeg ik dan?", "What do I say?")));
  c2.appendChild(wbVakChips("nee", "zinnen", {hoofdletter: true, na: tekenKaart})); box.appendChild(c2);
  tekenKaart(); box.appendChild(kaart);
  if((wbItems("nee").zinnen || []).length){
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Bespreken of bewaren", "Discuss or keep")));
    c.appendChild(wbDownloadKnoppen(() => ({titel: vt("Nee zeggen", "Saying no"), secties: [
      {z: "oranje", kop: vt("Situaties", "Situations"), titel: vt("Wanneer kan het gebeuren?", "When could it happen?"), rijen: [{label: "", items: (wbItems("nee").situaties || []).map(x => cap(wbT(x)))}].filter(r => r.items.length), notitie: ""},
      {z: "groen", kop: vt("Mijn zinnen", "My sentences"), titel: vt("Wat zeg ik dan?", "What do I say?"), rijen: [{label: "", items: (wbItems("nee").zinnen || []).map(x => wbT(x))}], notitie: ""},
      {kop: vt("Tips", "Tips"), titel: vt("Zo zeg je nee", "How to say no"), rijen: [{label: "", items: NEE_TIPS.map(x => vt(x[0], x[1]))}], notitie: ""}].filter(s => s.rijen.length)})));
    box.appendChild(c);
  }
}
