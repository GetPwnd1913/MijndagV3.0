// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- terugvalpreventieplan (in het noodplan) ----------
// Stoplicht: groen (het gaat goed), oranje (let op), rood (gevaar). Het plan maak je met opdrachten.
// Opslag: settings.terugval = {items: {"groen.denk": [...]}, notes: {groen: "..."}}; settings.kleuren = {"2026-11-24": "oranje"}.
// Knopjes worden in het Nederlands bewaard (sleutel); TV_EN geeft de Engelse tekst.
const TV_ZONES = {
  groen:  {nl: "Groen",  en: "Green",  kop: "Het gaat goed", kopEn: "Doing well"},
  oranje: {nl: "Oranje", en: "Orange", kop: "Let op",        kopEn: "Watch out"},
  rood:   {nl: "Rood",   en: "Red",    kop: "Gevaar",        kopEn: "Danger"}
};
// [nl, en] paren per lijst
const TV_LIJSTEN = {
  "groen.denk": [["ik kan dit aan","I can handle this"],["ik heb hulp om me heen","I have help around me"],["het is goed zoals het is","it's fine as it is"],["ik heb zin in de dag","I'm looking forward to the day"],["ik ben dankbaar","I'm grateful"],["één dag tegelijk","one day at a time"]],
  "groen.voel": [["rustig","calm"],["blij","happy"],["dankbaar","grateful"],["hoopvol","hopeful"],["trots","proud"],["uitgerust","rested"],["ontspannen","relaxed"]],
  "groen.doe": [["ik ga naar meetings","I go to meetings"],["ik bel mijn sponsor","I call my sponsor"],["ik slaap goed","I sleep well"],["ik eet op tijd","I eat on time"],["ik kom mijn afspraken na","I keep my appointments"],["ik vul mijn dagbeschouwing in","I fill in my daily reflection"],["ik praat over wat ik voel","I talk about what I feel"],["ik sport of wandel","I exercise or walk"]],
  "groen.actie": [["mijn vaste dagritme","my regular daily routine"],["meetings","meetings"],["contact met mijn sponsor","contact with my sponsor"],["service doen","doing service"],["goed slapen","sleeping well"],["stappenwerk","step work"],["tijd met fijne mensen","time with good people"],["gebed of meditatie","prayer or meditation"]],
  "terugblik": [["ik ging minder naar meetings","I went to fewer meetings"],["ik belde mijn sponsor niet meer","I stopped calling my sponsor"],["ik trok me terug","I withdrew"],["ik sliep slecht","I slept badly"],["ik loog over kleine dingen","I lied about small things"],["ik zocht oude vrienden op","I looked up old friends"],["ik dacht dat ik het alleen kon","I thought I could do it alone"],["ik had veel stress","I had a lot of stress"],["ik verveelde me","I was bored"],["ik had geld op zak","I had money on me"],["ik werd snel boos","I got angry quickly"]],
  "oranje.denk": [["het gaat wel, ik hoef niet naar een meeting","I'm fine, I don't need a meeting"],["niemand begrijpt me","nobody understands me"],["ik heb het verdiend","I deserve it"],["het maakt toch niet uit","it doesn't matter anyway"],["ik heb het onder controle","I have it under control"],["ik denk vaak aan vroeger","I often think about the old days"]],
  "oranje.voel": [["onrustig","restless"],["gespannen","tense"],["prikkelbaar","irritable"],["eenzaam","lonely"],["verveeld","bored"],["moe","tired"],["somber","low"],["leeg","empty"]],
  "oranje.doe": [["ik sla meetings over","I skip meetings"],["ik bel mijn sponsor niet","I don't call my sponsor"],["ik trek me terug","I withdraw"],["ik slaap slecht","I sleep badly"],["ik eet slecht","I eat badly"],["ik lieg over kleine dingen","I lie about small things"],["ik zoek ruzie","I pick fights"],["ik kom afspraken niet na","I don't keep appointments"],["ik zit veel op mijn telefoon","I'm on my phone a lot"]],
  "oranje.actie": [["mijn sponsor bellen","call my sponsor"],["naar een meeting gaan","go to a meeting"],["het bespreken met mijn begeleider","talk it through with my support worker"],["eerlijk vertellen hoe het gaat","say honestly how I'm doing"],["mijn dagritme weer oppakken","get back into my daily routine"],["op tijd naar bed","go to bed on time"],["HALT checken: honger, boos, eenzaam, moe","check HALT: hungry, angry, lonely, tired"],["dit plan teruglezen","read this plan again"]],
  "rood.denk": [["één keer kan wel","once won't hurt"],["niemand merkt het","nobody will notice"],["het is toch al mislukt","it has already failed anyway"],["ik wil even weg uit mijn hoofd","I just want to escape my head"],["ik weet waar ik het kan halen","I know where I can get it"],["ik kan het toch niet","I can't do it anyway"]],
  "rood.voel": [["sterke zucht","strong craving"],["paniek","panic"],["wanhoop","despair"],["woede","rage"],["leeg","empty"],["schaamte","shame"],["alleen","alone"]],
  "rood.doe": [["ik zoek contact met oude gebruiksvrienden","I contact old using friends"],["ik ga naar plekken waar ik gebruikte","I go to places where I used"],["ik regel geld","I arrange money"],["ik neem mijn telefoon niet op","I don't answer my phone"],["ik lieg over waar ik ben","I lie about where I am"],["ik houd me niet meer aan mijn plan","I stop following my plan"]],
  "rood.actie": [["nu mijn sponsor bellen","call my sponsor now"],["iemand van mijn lijst bellen","call someone on my list"],["weggaan van de plek","leave the place"],["naar iemand toe gaan","go to someone"],["naar een meeting gaan","go to a meeting"],["de film doorspoelen tot het eind","play the tape through to the end"],["mijn begeleiding inlichten","inform my support workers"],["geen geld bij me houden","not keep money on me"]],
  "situaties": [["alleen thuis","alone at home"],["feestjes","parties"],["uitgaan","going out"],["geld krijgen","getting money"],["ruzie","an argument"],["verjaardagen","birthdays"],["feestdagen","holidays"],["mijn oude buurt","my old neighbourhood"],["oude vrienden tegenkomen","running into old friends"],["slecht nieuws","bad news"],["een weekend zonder plan","a weekend without a plan"],["na een hele goede dag","after a really good day"],["drukte en stress","busyness and stress"]],
  "gedachten.ziek": [["één keer kan wel","once won't hurt"],["ik heb het verdiend","I deserve it"],["het was toch niet zo erg","it wasn't that bad"],["ik kan het nu wel aan","I can handle it now"],["niemand merkt het","nobody will notice"],["morgen begin ik weer","I'll start again tomorrow"]],
  "gedachten.tegen": [["één keer is nooit één keer","once is never once"],["speel de film door tot het eind","play the tape through to the end"],["ik heb hier hard voor gewerkt","I worked hard for this"],["de zucht gaat voorbij","the craving will pass"],["alleen voor vandaag","just for today"],["eerst bel ik iemand","first I call someone"],["denk aan waarom ik clean blijf","remember why I stay clean"]],
  "aanspreken.wat": [["eerlijk zeggen wat ze zien","say honestly what they see"],["vragen hoe het echt gaat","ask how I'm really doing"],["mijn sponsor bellen","call my sponsor"],["met me naar een meeting gaan","go to a meeting with me"],["mijn plan met me doorlopen","go through my plan with me"]],
  "uitglijder": [["meteen stoppen","stop straight away"],["het eerlijk vertellen","tell the truth about it"],["mijn sponsor bellen","call my sponsor"],["mijn begeleiding inlichten","inform my support workers"],["naar een meeting gaan","go to a meeting"],["mezelf niet afkraken","not beat myself up"],["kijken wat de aanleiding was","look at what triggered it"],["dit plan aanpassen","update this plan"],["opnieuw beginnen: alleen voor vandaag","start again: just for today"]]
};
// wie mag me aanspreken: de lijst "wie" uit de dagbeschouwing (zonder mezelf en een onbekende)
function tvLijst(k){
  if(k === "aanspreken.wie") return WHO.map((w, i) => [w, WHO_EN[i]]).filter(p => p[0] !== "mezelf" && p[0] !== "een onbekende");
  return TV_LIJSTEN[k] || [];
}
const TV_EN = {};
Object.keys(TV_LIJSTEN).forEach(k => TV_LIJSTEN[k].forEach(p => { TV_EN[p[0]] = p[1]; }));
const tvT = s => { if(!isEn()) return s; if(TV_EN[s]) return TV_EN[s]; const i = WHO.indexOf(s); return i >= 0 ? WHO_EN[i] : s; };
const tvCap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// rijen per kleur: zelfde vier vragen, eigen woorden per kleur
const tvZoneRijen = z => {
  const L = {
    groen:  [["Wat denk ik als het goed gaat?", "What do I think when things are going well?"], ["Hoe voel ik me dan?", "How do I feel then?"], ["Wat doe ik dan?", "What do I do then?"], ["Wat houdt mij in het groen?", "What keeps me in the green?"]],
    oranje: [["Welke gedachten zijn een eerste waarschuwing?", "Which thoughts are an early warning?"], ["Wat voel ik dan?", "What do I feel then?"], ["Wat doe ik dan anders dan normaal?", "What do I do differently from usual?"], ["Wat doe ik als ik dit merk?", "What do I do when I notice this?"]],
    rood:   [["Welke gedachten betekenen gevaar?", "Which thoughts mean danger?"], ["Wat voel ik dan?", "What do I feel then?"], ["Wat doe ik dan?", "What do I do then?"], ["Wat doe ik nu meteen?", "What do I do right away?"]]
  }[z];
  return ["denk", "voel", "doe", "actie"].map((d, i) => ({k: z + "." + d, l: L[i][0], le: L[i][1]}));
};
const TV_STAPPEN = [
  {id: "groen", zone: "groen", t: "Groen: zo gaat het goed met mij", te: "Green: this is me doing well",
   tip: "Begin met hoe het eruitziet als het goed gaat. Dan merk je sneller wanneer het verandert. Tik aan wat bij jou past en voeg je eigen woorden toe.",
   tipEn: "Start with what it looks like when things go well. Then you notice sooner when it changes. Tap what fits you and add your own words.",
   rows: tvZoneRijen("groen")},
  {id: "terugblik", t: "Terugblik: wat ging eraan vooraf?", te: "Looking back: what came before?",
   tip: "Denk aan een eerdere terugval, of een moment dat het bijna misging. Wat waren de eerste tekenen, dagen of weken ervoor? Wat je hier vindt, hoort vaak ook bij oranje.",
   tipEn: "Think of an earlier relapse, or a moment when it nearly went wrong. What were the first signs, days or weeks before? What you find here often belongs with orange too.",
   rows: [{k: "terugblik", l: "Wat waren de eerste tekenen?", le: "What were the first signs?"}]},
  {id: "oranje", zone: "oranje", t: "Oranje: de eerste waarschuwingen", te: "Orange: the first warnings",
   tip: "Oranje is het moment dat het begint te schuiven. Je gebruikt niet, maar je bent er wel minder goed bij. Hoe eerder je dit ziet, hoe makkelijker je terug naar groen gaat.",
   tipEn: "Orange is when things start to slip. You are not using, but you are less on top of things. The sooner you see it, the easier it is to get back to green.",
   rows: tvZoneRijen("oranje")},
  {id: "rood", zone: "rood", t: "Rood: hier is het gevaarlijk", te: "Red: this is where it gets dangerous",
   tip: "Rood is het moment dat gebruik dichtbij is. Schrijf op wat je dan meteen doet. Houd het kort en concreet, zodat je het ook kunt als je hoofd vol zit.",
   tipEn: "Red is when using is close. Write down what you do right away. Keep it short and concrete, so you can still do it when your head is full.",
   rows: tvZoneRijen("rood")},
  {id: "situaties", t: "Gevaarlijke situaties", te: "Risky situations",
   tip: "In sommige situaties is de kans op gebruik groter. Als je ze kent, kun je je erop voorbereiden of ze vermijden.",
   tipEn: "In some situations the chance of using is higher. If you know them, you can prepare for them or avoid them.",
   rows: [{k: "situaties", l: "Welke situaties zijn gevaarlijk voor mij?", le: "Which situations are risky for me?"}]},
  {id: "gedachten", t: "Gedachten die me willen laten gebruiken", te: "Thoughts that want me to use",
   tip: "De verslaving praat soms mee in je hoofd. Als je die gedachten herkent, kun je er iets tegenover zetten.",
   tipEn: "The addiction sometimes talks along in your head. If you recognise those thoughts, you can put something against them.",
   rows: [{k: "gedachten.ziek", l: "Welke gedachten herken ik?", le: "Which thoughts do I recognise?"}, {k: "gedachten.tegen", l: "Wat zeg ik daartegen?", le: "What do I say back?"}]},
  {id: "aanspreken", t: "Wie mag me aanspreken?", te: "Who can speak up to me?",
   tip: "Anderen zien het soms eerder dan jij. Spreek met ze af dat ze er iets van mogen zeggen als ze signalen zien.",
   tipEn: "Others sometimes see it before you do. Agree with them that they can say something when they see signs.",
   rows: [{k: "aanspreken.wie", l: "Wie mag me aanspreken als ze signalen zien?", le: "Who can speak up when they see signs?"}, {k: "aanspreken.wat", l: "Wat mogen ze dan doen?", le: "What can they do then?"}]},
  {id: "uitglijder", t: "Als ik toch gebruikt heb", te: "If I have used anyway",
   tip: "Een uitglijder hoeft geen terugval te worden. Hoe sneller je eerlijk bent en hulp vraagt, hoe beter. Je kunt altijd opnieuw beginnen.",
   tipEn: "A slip doesn't have to become a relapse. The sooner you are honest and ask for help, the better. You can always start again.",
   rows: [{k: "uitglijder", l: "Wat doe ik dan?", le: "What do I do then?"}]}
];

let tvStap = null, tvOpen = null, tvEigen = null, tvSaveTimer = null;
const tvData = () => { if(!settings.terugval || typeof settings.terugval !== "object") settings.terugval = {}; const d = settings.terugval; d.items = d.items || {}; d.notes = d.notes || {}; return d; };
const tvGet = k => ((settings.terugval || {}).items || {})[k] || [];
const tvNote = id => (((settings.terugval || {}).notes || {})[id] || "").trim();
const tvStapGevuld = s => s.rows.some(r => tvGet(r.k).length) || !!tvNote(s.id);
const tvZoneGevuld = z => tvZoneRijen(z).some(r => tvGet(r.k).length) || !!tvNote(z);
function tvBewaar(){ settings.updated = Date.now(); local.set("settings", settings); clearTimeout(tvSaveTimer); tvSaveTimer = setTimeout(() => saveSettingsNow(), 500); }
const tvKleurVandaag = () => (settings.kleuren || {})[todayKey()] || null;
function tvZetKleur(z){
  settings.kleuren = Object.assign({}, settings.kleuren || {});
  if(z) settings.kleuren[todayKey()] = z; else delete settings.kleuren[todayKey()];
  tvBewaar();
}
function tvNaarStap(i){ tvStap = i; tvEigen = null; wbOpen = "terugval"; wbToon(); }
const tvStapVan = id => TV_STAPPEN.findIndex(s => s.id === id);

function tvKicker(z, tekst){
  const k = el("div", "tvkicker"); if(z){ k.dataset.z = z; k.appendChild(el("span", "tvdot")); }
  k.appendChild(document.createTextNode(tekst)); return k;
}
function tvTags(list){ const w = el("div", "tvtags"); list.forEach(s => w.appendChild(el("span", "tvtag", tvCap(tvT(s))))); return w; }
function tvTerugLink(tekst, fn){ const b = el("button", "linkbtn tvterug"); b.type = "button"; b.appendChild(icon("chevL", 18)); b.appendChild(document.createTextNode(tekst)); b.onclick = fn; return b; }
function tvAfvinkLijst(list){
  const ol = el("ol", "soslist");
  list.forEach((s, i) => {
    const li = el("li"); li.appendChild(el("div", "num", String(i + 1))); li.appendChild(el("span", "t", tvCap(tvT(s))));
    li.onclick = () => { li.classList.toggle("done"); li.setAttribute("aria-pressed", li.classList.contains("done") ? "true" : "false"); };
    toetsKlik(li); li.setAttribute("aria-pressed", "false");
    ol.appendChild(li);
  });
  return ol;
}

// ---- "Waar sta ik nu?" bovenaan het noodplan ----
function tvNuCard(){
  const c = el("div", "card tvnu");
  c.appendChild(el("div", "qtitle", vt("Waar sta ik nu?", "Where am I right now?")));
  const n = note(vt("Tik aan hoe het nu met je gaat. Je ziet meteen hoe je het herkent en wat je kunt doen.", "Tap how you are doing right now. You'll see straight away how to recognise it and what you can do.")); n.style.marginTop = "4px"; c.appendChild(n);
  const gekozen = tvKleurVandaag();
  if(tvOpen === null) tvOpen = gekozen;
  const rij = el("div", "tvkies"); rij.setAttribute("role", "group"); rij.setAttribute("aria-label", vt("Waar sta ik nu?", "Where am I right now?"));
  Object.keys(TV_ZONES).forEach(z => {
    const Z = TV_ZONES[z];
    const b = el("button", "tvknop" + (tvOpen === z ? " on" : "")); b.type = "button"; b.dataset.z = z;
    b.setAttribute("aria-pressed", tvOpen === z ? "true" : "false");
    b.appendChild(el("span", "tvdot"));
    b.appendChild(el("b", null, vt(Z.nl, Z.en)));
    b.appendChild(el("small", null, vt(Z.kop, Z.kopEn)));
    b.onclick = () => {
      if(tvOpen === z){ tvOpen = ""; tvZetKleur(null); } else { tvOpen = z; tvZetKleur(z); }
      renderSos();
      requestAnimationFrame(() => { const p = $("sosBox").querySelector(".tvpaneel"); if(p && p.getBoundingClientRect().top > window.innerHeight * 0.6) p.scrollIntoView({block: "start", behavior: "smooth"}); });
    };
    rij.appendChild(b);
  });
  c.appendChild(rij);
  if(tvOpen) c.appendChild(tvPaneel(tvOpen));
  return c;
}
function tvPaneel(z){
  const p = el("div", "tvpaneel"); p.dataset.z = z;
  const si = tvStapVan(z);
  if(!tvZoneGevuld(z)){
    p.appendChild(el("div", "tvkop", vt("Je hebt " + TV_ZONES[z].nl.toLowerCase() + " nog niet ingevuld", "You haven't filled in " + TV_ZONES[z].en.toLowerCase() + " yet")));
    p.appendChild(note(vt("Maak de opdracht voor deze kleur. Dan staat hier precies hoe jij het herkent en wat je dan doet.", "Do the assignment for this colour. Then this shows exactly how you recognise it and what you do.")));
    const b = el("button", "primary", vt("Nu invullen", "Fill in now")); b.type = "button"; b.style.marginTop = "12px"; b.onclick = () => tvNaarStap(si);
    p.appendChild(b);
    if(z === "rood") p.appendChild(tvBelLijst());
    return p;
  }
  const [denk, voel, doe, actie] = tvZoneRijen(z).map(r => tvGet(r.k));
  const actieKop = {groen: vt("Dit houdt mij in het groen", "This keeps me in the green"), oranje: vt("Wat ik nu doe", "What I do now"), rood: vt("Doe dit nu meteen", "Do this right away")}[z];
  // bij rood eerst de acties en bellen; bij groen en oranje eerst herkennen
  const herken = () => {
    if(!(denk.length || voel.length || doe.length)) return;
    p.appendChild(el("div", "tvkop", z === "groen" ? vt("Zo merk ik dat het goed gaat", "This is how I notice I'm doing well") : vt("Zo herken ik het", "This is how I recognise it")));
    [[denk, vt("Gedachten", "Thoughts")], [voel, vt("Gevoelens", "Feelings")], [doe, vt("Gedrag", "Behaviour")]].forEach(([l, kop]) => {
      if(!l.length) return;
      p.appendChild(el("div", "tvsub", kop)); p.appendChild(tvTags(l));
    });
  };
  const doen = () => {
    if(!actie.length) return;
    p.appendChild(el("div", "tvkop", actieKop));
    if(z !== "groen"){ const h = note(vt("Tik een stap aan als je hem gedaan hebt.", "Tap a step when you have done it.")); h.style.marginTop = "0"; p.appendChild(h); }
    p.appendChild(tvAfvinkLijst(actie));
  };
  if(z === "rood"){ doen(); p.appendChild(tvBelLijst()); herken(); }
  else { herken(); doen(); }
  if(z === "oranje"){
    const wie = tvGet("aanspreken.wie");
    if(wie.length){ p.appendChild(el("div", "tvkop", vt("Vertel het aan", "Tell"))); p.appendChild(tvTags(wie)); }
  }
  if(tvNote(z)){ const t = el("div", "tvnotitie", tvNote(z)); p.appendChild(t); }
  if(z === "rood"){
    const ug = tvGet("uitglijder");
    if(ug.length){
      const d = el("details", "tvtoch"); const s = el("summary", null, vt("Heb je toch gebruikt?", "Have you used anyway?")); d.appendChild(s);
      const t = note(vt("Een uitglijder hoeft geen terugval te worden. Dit had je afgesproken:", "A slip doesn't have to become a relapse. This is what you agreed:")); t.style.marginTop = "6px"; d.appendChild(t);
      d.appendChild(tvAfvinkLijst(ug)); p.appendChild(d);
    }
  }
  // uit de beslisbalans (werkboek): wat clean zijn oplevert en wat gebruiken kost
  if(z !== "groen" && typeof wbLees === "function"){
    const it = (wbLees().balans || {}).items || {};
    if((it.vclean || []).length){ p.appendChild(el("div", "tvkop", vt("Wat clean zijn me oplevert", "What being clean gives me"))); p.appendChild(wbTags(it.vclean.slice(0, 6))); }
    if((it.ngebruik || []).length){ p.appendChild(el("div", "tvkop", vt("Wat gebruiken me kost", "What using costs me"))); p.appendChild(wbTags(it.ngebruik.slice(0, 6))); }
  }
  if(z === "oranje" && typeof plAlles === "function" && plAlles().length){
    const l = plAlles().slice().sort(() => Math.random() - 0.5).slice(0, 3);
    p.appendChild(el("div", "tvkop", vt("Iets doen wat ik leuk vind", "Do something I enjoy"))); p.appendChild(wbTags(l));
  }
  if(z !== "groen" && typeof potCard === "function"){
    const pk = el("button", "linkbtn tvpotlink", vt("Schud je pot met mooie momenten", "Shake your jar of good moments")); pk.type = "button";
    pk.onclick = () => { const pc = $("sosBox").querySelector(".potcard"); if(!pc) return; const k = pc.querySelector(".primary:not(.hidden)"); if(k) k.click(); pc.scrollIntoView({block: "start", behavior: "smooth"}); };
    p.appendChild(pk);
  }
  const r = el("div", "tvlinks");
  const a = el("button", "linkbtn", vt("Hele plan bekijken", "View my whole plan")); a.type = "button"; a.onclick = () => { tvStap = null; wbOpen = "terugval"; wbToon(); };
  const e = el("button", "linkbtn", vt("Aanpassen", "Edit")); e.type = "button"; e.onclick = () => tvNaarStap(si);
  r.appendChild(a); r.appendChild(e); p.appendChild(r);
  return p;
}
// bellen vanuit rood: de contacten uit het noodplan
function tvBelLijst(){
  const w = el("div", "tvbel");
  const cs = ((settings.sos || {}).contacts || []).filter(c => c.phone);
  if(!cs.length) return w;
  w.appendChild(el("div", "tvkop", vt("Bel nu", "Call now")));
  cs.slice(0, 3).forEach(c => {
    const naam = (/^(mijn|my) sponsor$/i.test((c.name || "").trim()) ? vt("mijn sponsor", "my sponsor") : (c.name || fmtPhone(c.phone)).replace(/^(Mijn|My) /, m => m.toLowerCase()));
    const a = el("a", "primary tvbelknop", vt("Bel ", "Call ") + naam);
    a.href = "tel:" + c.phone.replace(/[^\d+]/g, ""); w.appendChild(a);
  });
  return w;
}

// ---- voortgang en knop om te beginnen (kop van het plan in het werkboek) ----
function tvVoortgang(c){
  const gedaan = TV_STAPPEN.filter(tvStapGevuld).length;
  const t = note(gedaan
    ? vt(gedaan + " van de " + TV_STAPPEN.length + " opdrachten ingevuld. Dit plan heb je zelf gemaakt. Lees het af en toe terug, en bespreek het met je sponsor of begeleider.", gedaan + " of the " + TV_STAPPEN.length + " assignments filled in. You made this plan yourself. Read it back now and then, and talk it through with your sponsor or support worker.")
    : vt("Met " + TV_STAPPEN.length + " korte opdrachten maak je je eigen plan: hoe herken je groen, oranje en rood, en wat doe je dan? Wat je invult, zie je terug in je noodplan bij ‘Waar sta ik nu?’.", "With " + TV_STAPPEN.length + " short assignments you make your own plan: how do you recognise green, orange and red, and what do you do then? What you fill in shows up in your emergency plan under ‘Where am I right now?’."));
  t.style.marginTop = "4px"; c.appendChild(t);
  c.appendChild(tvBalk(null));
  const row = el("div", "row"); row.style.cssText = "justify-content:flex-start;flex-wrap:wrap;margin-top:12px";
  const eerste = TV_STAPPEN.findIndex(s => !tvStapGevuld(s));
  const o = el("button", "primary", gedaan ? (eerste >= 0 ? vt("Verder met de opdrachten", "Continue the assignments") : vt("Opdrachten doorlopen", "Go through the assignments")) : vt("Begin met de opdrachten", "Start the assignments"));
  o.type = "button"; o.onclick = () => tvNaarStap(eerste >= 0 ? eerste : 0);
  row.appendChild(o); c.appendChild(row);
}
// balk met een streepje per opdracht (gekleurd als ingevuld); huidig = index van de open opdracht
function tvBalk(huidig){
  const b = el("div", "tvbalk");
  TV_STAPPEN.forEach((s, i) => {
    const d = el("i"); if(s.zone) d.dataset.z = s.zone;
    if(tvStapGevuld(s)) d.classList.add("on"); if(i === huidig) d.classList.add("nu");
    if(huidig !== null){ d.setAttribute("role", "button"); d.tabIndex = 0; d.setAttribute("aria-label", vt("Opdracht ", "Assignment ") + (i + 1)); d.onclick = () => tvNaarStap(i); toetsKlik(d); }
    b.appendChild(d);
  });
  return b;
}

// ---- een opdracht invullen ----
function renderTvStap(box){
  const i = tvStap, s = TV_STAPPEN[i], d = tvData();
  box.appendChild(tvTerugLink(vt("Terug naar mijn plan", "Back to my plan"), () => { tvStap = null; wbToon(); }));
  const kop = el("div", "tvstapkop"); kop.appendChild(el("span", null, vt("Opdracht " + (i + 1) + " van " + TV_STAPPEN.length, "Assignment " + (i + 1) + " of " + TV_STAPPEN.length)));
  box.appendChild(kop); box.appendChild(tvBalk(i));
  const c = el("div", "card tvstap"); if(s.zone) c.dataset.z = s.zone;
  if(s.zone) c.appendChild(tvKicker(s.zone, vt(TV_ZONES[s.zone].nl + " · " + TV_ZONES[s.zone].kop, TV_ZONES[s.zone].en + " · " + TV_ZONES[s.zone].kopEn)));
  c.appendChild(el("div", "qtitle tvtitel", vt(s.t, s.te)));
  const tip = el("div", "tip", vt(s.tip, s.tipEn));
  const tb = el("button", "linkbtn tipbtn", vt("Verberg hulp", "Hide help")); tb.type = "button"; tb.setAttribute("aria-expanded", "true");
  tb.onclick = () => { tip.classList.toggle("hidden"); const dicht = tip.classList.contains("hidden"); tb.textContent = dicht ? vt("Hulp bij deze opdracht", "Help with this assignment") : vt("Verberg hulp", "Hide help"); tb.setAttribute("aria-expanded", dicht ? "false" : "true"); };
  c.appendChild(tb); c.appendChild(tip);
  s.rows.forEach(r => c.appendChild(tvRij(r)));
  c.appendChild(el("div", "label", vt("Eigen aantekening", "Own notes")));
  const ta = el("textarea"); ta.value = d.notes[s.id] || ""; ta.placeholder = vt("Schrijf het in je eigen woorden (mag ook leeg blijven)…", "Write it in your own words (can stay empty)…");
  ta.setAttribute("aria-label", vt("Eigen aantekening", "Own notes"));
  ta.oninput = () => { const dd = tvData(); if(ta.value.trim()) dd.notes[s.id] = ta.value; else delete dd.notes[s.id]; tvBewaar(); };
  c.appendChild(ta);
  box.appendChild(c);
  const row = el("div", "row");
  const vorige = el("button", "ghost", vt("‹ Vorige", "‹ Previous")); vorige.type = "button"; vorige.disabled = i === 0; vorige.onclick = () => tvNaarStap(i - 1);
  const laatste = i === TV_STAPPEN.length - 1;
  const volgende = el("button", "primary", laatste ? vt("Klaar", "Done") : vt("Volgende ›", "Next ›")); volgende.type = "button";
  volgende.onclick = () => { if(laatste){ tvStap = null; wbToon(); saveSettingsNow(); } else tvNaarStap(i + 1); };
  row.appendChild(vorige); row.appendChild(volgende); box.appendChild(row);
}
// een rij knopjes: vaste keuzes + eigen knopjes (eigen = gekozen maar niet in de vaste lijst)
function tvRij(r){
  const w = el("div");
  w.appendChild(el("div", "label", vt(r.l, r.le)));
  const chips = el("div", "chips"); w.appendChild(chips);
  const teken = () => {
    chips.innerHTML = "";
    const vast = tvLijst(r.k).map(p => p[0]), gekozen = tvGet(r.k);
    vast.concat(gekozen.filter(x => vast.indexOf(x) < 0)).forEach(item => {
      const on = gekozen.indexOf(item) >= 0;
      const b = el("button", "chip" + (on ? " on" : ""), tvT(item)); b.type = "button"; b.setAttribute("aria-pressed", on ? "true" : "false");
      b.onclick = () => {
        const dd = tvData(), cur = (dd.items[r.k] || []).slice(), j = cur.indexOf(item);
        if(j >= 0) cur.splice(j, 1); else cur.push(item);
        if(cur.length) dd.items[r.k] = cur; else delete dd.items[r.k];
        tvBewaar(); teken();
      };
      chips.appendChild(b);
    });
    if(tvEigen === r.k){
      const f = el("div"); f.style.cssText = "display:flex;gap:6px;flex-basis:100%;margin-top:4px";
      const inp = el("input", "sosinp"); inp.placeholder = vt("Typ je eigen woorden…", "Type your own words…");
      const ok = el("button", "primary", vt("Toevoegen", "Add")); ok.type = "button"; ok.style.cssText = "flex:none;padding:10px 14px";
      const doAdd = () => {
        const v = inp.value.trim().replace(/\s+/g, " "); if(!v){ inp.focus(); return; }
        const val = v.length > 1 && v.charAt(1) !== v.charAt(1).toUpperCase() ? v.charAt(0).toLowerCase() + v.slice(1) : v;
        const dd = tvData(), cur = (dd.items[r.k] || []).slice(); if(cur.indexOf(val) < 0) cur.push(val); dd.items[r.k] = cur;
        tvEigen = null; tvBewaar(); teken();
      };
      ok.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } if(e.key === "Escape"){ tvEigen = null; teken(); } };
      f.appendChild(inp); f.appendChild(ok); chips.appendChild(f);
      requestAnimationFrame(() => inp.focus());
    } else {
      const plus = el("button", "chip start", vt("+ Eigen", "+ Own")); plus.type = "button";
      plus.onclick = () => { tvEigen = r.k; teken(); };
      chips.appendChild(plus);
    }
  };
  teken();
  return w;
}

// ---- het hele plan in één overzicht ----
function renderTvOverzicht(box){
  box.appendChild(tvTerugLink(vt("Terug naar werkboek", "Back to workbook"), () => { wbOpen = null; wbToon(); }));
  const kop = el("div", "card tvkopkaart");
  kop.appendChild(el("div", "qtitle", vt("Mijn terugvalpreventieplan", "My relapse prevention plan")));
  tvVoortgang(kop);
  if(TV_STAPPEN.some(tvStapGevuld)) kop.appendChild(wbDownloadKnoppen(() => ({titel: vt("Terugvalpreventieplan", "Relapse prevention plan"), intro: TV_INTRO(), stoplicht: true, secties: tvExportSecties()})));
  box.appendChild(kop);
  // nog niet ingevulde opdrachten compact in één lijstje, daarna de ingevulde als kaart
  const todo = TV_STAPPEN.map((s, i) => [s, i]).filter(([s]) => !tvStapGevuld(s));
  if(todo.length){
    const l = el("div", "card wblijst tvtodo");
    l.appendChild(el("div", "tvtodokop", vt("Nog te doen", "Still to do")));
    todo.forEach(([s, i]) => {
      const r = el("button", "wbrij"); r.type = "button";
      const d = el("span", "tvtodonr", String(i + 1)); if(s.zone) d.dataset.z = s.zone; r.appendChild(d);
      const tx = el("span", "wbtx"); tx.appendChild(el("b", null, vt(s.t, s.te))); r.appendChild(tx);
      r.appendChild(el("span", "wbpijl", "›"));
      r.onclick = () => tvNaarStap(i);
      l.appendChild(r);
    });
    box.appendChild(l);
  }
  TV_STAPPEN.forEach((s, i) => {
    if(!tvStapGevuld(s)) return;
    const c = el("div", "card tvzone"); if(s.zone) c.dataset.z = s.zone;
    const h = el("div", "tvzonekop");
    h.appendChild(tvKicker(s.zone || null, vt("Opdracht " + (i + 1), "Assignment " + (i + 1))));
    const e = el("button", "linkbtn", tvStapGevuld(s) ? vt("Aanpassen", "Edit") : vt("Invullen", "Fill in")); e.type = "button"; e.onclick = () => tvNaarStap(i);
    h.appendChild(e); c.appendChild(h);
    c.appendChild(el("div", "qtitle", vt(s.t, s.te)));
    s.rows.forEach(r => {
      const l = tvGet(r.k); if(!l.length) return;
      c.appendChild(el("div", "tvsub", vt(r.l, r.le)));
      c.appendChild(tvTags(l));
    });
    if(tvNote(s.id)) c.appendChild(el("div", "tvnotitie", tvNote(s.id)));
    box.appendChild(c);
  });
  const row = el("div", "row"); row.style.justifyContent = "flex-start";
  const b = el("button", "ghost", vt("Terug naar werkboek", "Back to workbook")); b.type = "button"; b.onclick = () => { wbOpen = null; wbToon(); };
  row.appendChild(b); box.appendChild(row);
}

// ---- de app denkt mee: seintje op het beginscherm ----
// Kijkt naar de dagbeschouwing van vandaag (of gisteren als vandaag nog leeg is). Telt waarschuwingssignalen;
// genoeg signalen = oranje, veel = rood. Wegtikken geldt voor die dag. Niet tonen als je zelf al oranje/rood koos.
const TV_SEIN_WEG = "dagbeschouwing:tvSeinWeg";
function tvSignalen(e){
  if(!e || !e.answers) return {punten: 0, redenen: []};
  const a = id => (e.answers[id] || {}).level || "";
  let punten = 0; const redenen = [];
  const plus = (n, nl, en) => { punten += n; redenen.push(vt(nl, en)); };
  if(a("q5") === "ja") plus(2, "zucht", "cravings"); else if(a("q5") === "beetje") plus(1, "een beetje zucht", "some cravings");
  const st = parseInt((picked(e, "q5", 0)[0] || ""), 10); if(st >= 7){ punten += 1; }
  if(a("q6") === "ja") plus(1, "triggers", "triggers");
  if(a("q3") === "ja") plus(1, "een conflict", "a conflict");
  if(a("q2") === "nee") plus(1, "niet helemaal eerlijk", "not fully honest");
  const c = parseInt(e.cijfer, 10);
  if(c > 0 && c <= 4) plus(2, "een laag cijfer (" + c + ")", "a low score (" + c + ")"); else if(c === 5) plus(1, "een 5 als cijfer", "a score of 5");
  if(typeof SCORE_ZWAAR !== "undefined"){ const zw = picked(e, "q12", 0).filter(x => SCORE_ZWAAR.indexOf(x) >= 0); if(zw.length >= 3) plus(1, "veel dingen die de dag zwaar maakten", "lots of things that made the day hard"); }
  // eigen signalen uit je plan: gevoelens bij conflict of trigger die je bij oranje of rood hebt gezet
  const eigen = tvGet("oranje.voel").concat(tvGet("rood.voel"));
  const voel = picked(e, "q3", 1).concat(picked(e, "q6", 1)).filter(x => eigen.indexOf(x) >= 0);
  if(voel.length){ const t = vt("gevoelens uit je eigen plan (", "feelings from your own plan (") + voel.map(tvT).join(", ") + ")"; plus(1, t, t); }
  return {punten, redenen: redenen.filter(Boolean)};
}
function tvSeinDag(){
  const tk = todayKey(), gk = addDaysKey(tk, -1);
  const alle = local.days().filter(x => x && x.date);
  const vind = k => (typeof entry !== "undefined" && entry && entry.date === k) ? entry : alle.find(x => x.date === k);
  const v = vind(tk);
  if(v && v.answers && Object.keys(v.answers).some(id => (v.answers[id].level || (v.answers[id].text || "").trim()))) return v;
  return vind(gk) || null;
}
function renderTvSein(){
  const c = $("tvSein"); if(!c) return;
  const tk = todayKey();
  let weg = ""; try{ weg = localStorage.getItem(TV_SEIN_WEG) || ""; }catch(e){}
  const e = tvSeinDag(), s = tvSignalen(e), eigen = tvKleurVandaag();
  const z = s.punten >= 5 ? "rood" : s.punten >= 3 ? "oranje" : null;
  const toon = z && weg !== tk && eigen !== "oranje" && eigen !== "rood";
  c.classList.toggle("hidden", !toon); c.innerHTML = "";
  if(!toon) return;
  c.dataset.z = z;
  c.appendChild(tvKicker(z, vt(TV_ZONES[z].nl + " · " + TV_ZONES[z].kop, TV_ZONES[z].en + " · " + TV_ZONES[z].kopEn)));
  c.appendChild(el("div", "qtitle", z === "rood" ? vt("Het lijkt zwaar te zijn", "It looks like things are hard") : vt("Let even goed op jezelf", "Take good care of yourself")));
  const wanneer = e && e.date === tk ? vt("vandaag", "today") : vt("gisteren", "yesterday");
  const t = note(vt("In je dagbeschouwing van " + wanneer + " zie ik: ", "In your daily reflection from " + wanneer + " I see: ") + s.redenen.slice(0, 4).join(", ") + ". " +
    (z === "rood" ? vt("Kijk wat je in je plan bij rood hebt gezet, en bel iemand.", "Look at what you put under red in your plan, and call someone.")
                  : vt("Kijk even wat je in je plan bij oranje doet.", "Have a look at what you do under orange in your plan.")));
  t.style.cssText = "margin-top:6px;color:var(--ink);font-size:var(--fs-tekst);line-height:1.5"; c.appendChild(t);
  const row = el("div", "row"); row.style.cssText = "justify-content:flex-start;flex-wrap:wrap;margin-top:12px";
  const b = el("button", "primary", vt("Bekijk mijn plan", "View my plan")); b.type = "button";
  b.onclick = () => { showView("sos"); tvOpen = z; renderSos(); requestAnimationFrame(() => { const n = document.querySelector("#sosBox .tvnu"); if(n) n.scrollIntoView({block: "start", behavior: "smooth"}); }); };
  const n = el("button", "ghost", vt("Niet nu", "Not now")); n.type = "button";
  n.onclick = () => { try{ localStorage.setItem(TV_SEIN_WEG, tk); }catch(e){} renderTvSein(); };
  row.appendChild(b); row.appendChild(n); c.appendChild(row);
}

// ---- plan downloaden als Word of PDF (zelfde stijl als de dagbeschouwing) ----
const TV_HEX = {groen: "3B8A57", oranje: "D27A1F", rood: "C62828"};
const tvRgb = hex => [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
function tvExportSecties(){
  const out = [];
  TV_STAPPEN.forEach((s, i) => {
    if(!tvStapGevuld(s)) return;
    out.push({z: s.zone || null, kop: s.zone ? vt(TV_ZONES[s.zone].nl + " · " + TV_ZONES[s.zone].kop, TV_ZONES[s.zone].en + " · " + TV_ZONES[s.zone].kopEn) : vt("Opdracht " + (i + 1), "Assignment " + (i + 1)),
      titel: vt(s.t, s.te), rijen: s.rows.map(r => ({label: vt(r.l, r.le), items: tvGet(r.k).map(x => tvCap(tvT(x)))})).filter(r => r.items.length), notitie: tvNote(s.id)});
  });
  const cs = ((settings.sos || {}).contacts || []).filter(c => c.name || c.phone);
  if(cs.length) out.push({z: null, kop: vt("Noodplan", "Emergency plan"), titel: vt("Wie kan ik bellen?", "Who can I call?"), rijen: [{label: "", items: cs.map(c => (c.name || "") + (c.phone ? "  " + fmtPhone(c.phone) : ""))}], notitie: ""});
  const reden = ((settings.sos || {}).reason || "").trim();
  if(reden) out.push({z: null, kop: vt("Noodplan", "Emergency plan"), titel: vt("Waarom ik clean blijf", "Why I stay clean"), rijen: [], notitie: reden});
  return out;
}
const tvBestand = (titel, ext) => titel + ((settings.naam || "").trim() ? " " + settings.naam.trim() : "") + " " + todayKey() + "." + ext;
const TV_INTRO = () => vt("Dit plan helpt je om op tijd te zien hoe het met je gaat. Groen: het gaat goed. Oranje: let op, de eerste signalen. Rood: gevaar, nu handelen.", "This plan helps you notice in time how you are doing. Green: doing well. Orange: watch out, the first signs. Red: danger, act now.");
function tvWordXml(doc){
  const TH = exportTheme(), GRAY = "6B7370", INK = "1F2A28";
  const r = (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + '<w:color w:val="' + (o.c || INK) + '"/>' + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + '</w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; };
  const p = (runs, o) => { o = o || {}; return '<w:p><w:pPr>' + (o.keep ? '<w:keepNext/>' : '') + (o.top ? '<w:pBdr><w:top w:val="single" w:sz="4" w:space="12" w:color="E3DED3"/></w:pBdr>' : '') + '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 60 : o.after) + '"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '"' + (o.hang ? ' w:hanging="' + o.hang + '"' : '') + '/>' : '') + '</w:pPr>' + runs + '</w:p>'; };
  let body = p(r(doc.titel, {b: 1, sz: 48, c: TH.hex}), {after: 40});
  body += p(r(((settings.naam || "").trim() ? settings.naam.trim() + "  ·  " : "") + cap(longDate2(todayKey())), {sz: 22, c: GRAY}), {after: 200});
  if(doc.intro) body += p(r(doc.intro, {i: 1, sz: 19, c: GRAY}), {after: 120});
  doc.secties.forEach(s => {
    const kleur = s.z ? TV_HEX[s.z] : (s.hex || TH.hex);
    body += p((s.z ? r("●  ", {sz: 22, c: kleur}) : "") + r(s.kop, {b: 1, sz: 16, c: kleur, caps: 1}), {keep: 1, top: 1, before: 280, after: 20});
    body += p(r(s.titel, {b: 1, sz: 24}), {keep: 1, after: 80});
    s.rijen.forEach(rij => {
      if(rij.label) body += p(r(rij.label, {b: 1, sz: 18, c: GRAY}), {keep: 1, ind: 200, before: 80, after: 30});
      rij.items.forEach(t => { body += p(r("•", {b: 1, c: kleur, sz: 22}) + r("  " + t, {sz: 21}), {ind: 480, hang: 260, after: 20}); });
    });
    if(s.notitie) s.notitie.split("\n").forEach(l => { body += p(r(l, {sz: 21, i: s.rijen.length ? 1 : 0}), {ind: 200, before: 60, after: 20}); });
  });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + body +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function tvWordFooter(doc){
  const rr = t => '<w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr>' + rr(vt("Mijn dag  ·  ", "My day  ·  ") + doc.titel) + '</w:p></w:ftr>';
}
window.__tvDocParts = doc => Object.assign({}, DOCX_PARTS, {"word/document.xml": tvWordXml(doc), "word/footer1.xml": tvWordFooter(doc)});
function tvPdf(doc){
  const W = 595.28, H = 841.89, M = 50, CW = W - 2 * M, IND = 18, BOTTOM = 58;
  const TH = exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const pages = []; let ops = [], y = 0;
  const txt = (s, x, yy, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const hline = (x1, x2, yy, c) => ops.push(col(c) + " RG 0.7 w " + f(x1) + " " + f(yy) + " m " + f(x2) + " " + f(yy) + " l S");
  const vorm = () => pdfShapes(ops);
  const newPage = first => {
    ops = []; pages.push(ops);
    if(first){ y = H - M; return; }
    txt(cp1252(doc.titel), M, H - 34, 8.5, "F1", MUT); hline(M, M + CW, H - 42, LINE); y = H - 64;
  };
  newPage(true);
  // kop
  const bandH = 76, sh = vorm();
  sh.rrect(M, y - bandH, CW, bandH, 12, TH.rgb);
  txt(cp1252(doc.titel), M + 22, y - 34, 22, "F2", WHITE);
  txt(cp1252(((settings.naam || "").trim() ? settings.naam.trim() + "  ·  " : "") + cap(longDate2(todayKey()))), M + 22, y - 55, 11, "F1", WHITE);
  pdfLogo(ops, M + CW - 16 - 50, y - (bandH - 50) / 2, 50, sh.rrect, sh.circle);
  y -= bandH + 16;
  // stoplicht-uitleg: drie bolletjes
  const bw = CW / 3;
  if(doc.stoplicht) Object.keys(TV_ZONES).forEach((z, i) => {
    const x = M + i * bw; sh.circle(x + 8, y - 8, 6, tvRgb(TV_HEX[z]));
    txt(cp1252(vt(TV_ZONES[z].nl + ": " + TV_ZONES[z].kop.toLowerCase(), TV_ZONES[z].en + ": " + TV_ZONES[z].kopEn.toLowerCase())), x + 20, y - 11.5, 10, "F2", INK);
  });
  if(doc.stoplicht) y -= 26;
  if(doc.intro) wrap(doc.intro, 9.5, false, CW).forEach(l => { txt(l, M, y - 9.5, 9.5, "F3", MUT); y -= 13; });
  y -= 8;
  const ruimte = n => { if(y - n < BOTTOM) newPage(false); };
  doc.secties.forEach(s => {
    const kleur = s.z ? tvRgb(TV_HEX[s.z]) : (s.hex ? tvRgb(s.hex) : TH.rgb);
    const tl = wrap(s.titel, 12.5, true, CW);
    ruimte(44 + tl.length * 16);
    hline(M, M + CW, y, LINE); y -= 18;
    if(s.z) vorm().circle(M + 5, y - 4.5, 5, kleur);
    txt(cp1252(s.kop.toUpperCase()), M + (s.z ? 16 : 0), y - 7.5, 8, "F2", kleur); y -= 18;
    tl.forEach(l => { txt(l, M, y - 12.5, 12.5, "F2", INK); y -= 16; });
    y -= 2;
    s.rijen.forEach(rij => {
      if(rij.label){ ruimte(30); y -= 4; wrap(rij.label, 9.5, true, CW - IND).forEach(l => { txt(l, M + IND, y - 9.5, 9.5, "F2", MUT); y -= 13; }); }
      rij.items.forEach(t => wrap(t, 10.5, false, CW - IND - 14).forEach((l, j) => {
        ruimte(14);
        if(j === 0) txt(cp1252("•"), M + IND + 2, y - 10.5, 10.5, "F2", kleur);
        txt(l, M + IND + 14, y - 10.5, 10.5, "F1", INK); y -= 14;
      }));
    });
    if(s.notitie){ y -= 4; wrap(s.notitie, 10.5, false, CW - IND).forEach(l => { ruimte(14); txt(l, M + IND, y - 10.5, 10.5, s.rijen.length ? "F3" : "F1", INK); y -= 14; }); }
    y -= 8;
  });
  pages.forEach((p, i) => {
    ops = p;
    txt(cp1252(vt("Mijn dag", "My day")), M, 30, 8, "F1", MUT);
    const pg = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + pages.length);
    txt(pg, M + CW - textW(pg, 8, false), 30, 8, "F1", MUT);
  });
  return pdfAssemble(pages, W, H);
}
window.__tvPdf = doc => tvPdf(doc);
// knoppen Word/PDF voor elke opdracht in het werkboek; maakDoc() geeft {titel, intro, stoplicht, secties}
function wbDownloadKnoppen(maakDoc){
  const w = el("div");
  const row = el("div", "row"); row.style.cssText = "justify-content:flex-start;flex-wrap:wrap;margin-top:12px";
  const msg = note(""); msg.setAttribute("role", "status");
  const fout = err => { const c = err && err.code; msg.textContent = c === "declined" ? vt("Niet opgeslagen.", "Not saved.") : c === "rate_limited" ? vt("Even wachten en dan opnieuw proberen.", "Wait a moment and try again.") : vt("Opslaan lukte niet hier.", "Saving did not work here."); };
  const wd = el("button", "ghost", vt("Download als Word", "Download as Word")); wd.type = "button";
  wd.onclick = async () => {
    msg.textContent = vt("Bestand maken…", "Creating file…");
    try{
      if(!window.JSZip) throw {code: "nozip"};
      const doc = maakDoc(), zip = new JSZip(), parts = window.__tvDocParts(doc); Object.keys(parts).forEach(k => zip.file(k, parts[k]));
      const mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = await zip.generateAsync({type: "blob", mimeType: mime});
      await offerFile(tvBestand(doc.titel, "docx"), blob, mime); msg.textContent = ""; toast(vt("Bestand gemaakt.", "File created."));
    }catch(err){ fout(err); }
  };
  const pd = el("button", "ghost", vt("Download als PDF", "Download as PDF")); pd.type = "button";
  pd.onclick = async () => { try{ const doc = maakDoc(); await offerFile(tvBestand(doc.titel, "pdf"), tvPdf(doc), "application/pdf"); msg.textContent = ""; toast(vt("Bestand gemaakt.", "File created.")); }catch(err){ fout(err); } };
  row.appendChild(wd); row.appendChild(pd); w.appendChild(row); w.appendChild(msg);
  return w;
}
