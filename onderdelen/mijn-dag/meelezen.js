// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- meelezen: knopjes voorstellen op basis van wat je zelf typt ----------
// Bij vraag 3 (conflicten), 5 (cravings) en 6 (triggers) leest de app mee in je eigen tekst bij die vraag én in vraag 1.
// Herkent hij een woord ("ruzie", "eenzaam", "sponsor gebeld"), dan verschijnt boven de knopjes: "+ Een ruzie (vraag 1)".
// Het blijft een voorstel: niets wordt vanzelf aangevinkt. Zinnen met "niet/geen/nooit" vlak ervoor tellen niet.
// Ingehaakt in buildRows (weergave.js). Eigen knopjes worden herkend op hun eigen tekst.
const LEES_VRAGEN = ["q3", "q5", "q6"];
const LEES_WOORDEN = {
  // triggers
  "bepaalde mensen": ["oude vrienden", "gebruikers", "dealer"],
  "geld": ["geld", "schulden", "schuld", "rekening", "rekeningen", "salaris", "loon", "money", "debt"],
  "stress": ["stress", "gestrest", "druk", "deadline", "stressed"],
  "verveling": ["verveel", "verveelde", "verveling", "niks te doen", "niets te doen", "bored", "boredom"],
  "eenzaamheid": ["eenzaam", "eenzaamheid", "alleen gevoeld", "alleen thuis", "lonely", "loneliness"],
  "boosheid": ["boos", "boosheid", "woedend", "kwaad", "angry", "anger"],
  "vermoeidheid": ["moe", "vermoeid", "uitgeput", "slecht geslapen", "weinig geslapen", "tired", "exhausted"],
  "honger": ["honger", "hungry"],
  "muziek": ["muziek", "liedje", "music", "song"],
  "social media": ["instagram", "facebook", "tiktok", "snapchat", "social media"],
  "middelen zien of ruiken": ["geroken", "ruiken", "rook", "drank", "bier", "wiet", "joint", "zag iemand gebruiken", "alcohol", "beer", "weed"],
  "een herinnering": ["herinnering", "moest denken aan", "vroeger", "memory"],
  "een ruzie": ["ruzie", "conflict", "discussie", "onenigheid", "argument", "fight"],
  // gevoelens
  "onrustig": ["onrustig", "rusteloos", "restless"], "gespannen": ["gespannen", "spanning", "tense"],
  "verdrietig": ["verdrietig", "verdriet", "gehuild", "huilen", "sad"], "eenzaam": ["eenzaam", "lonely"],
  "onzeker": ["onzeker", "insecure"], "boos": ["boos", "kwaad", "woedend", "angry"], "schuldig": ["schuldig", "guilty"],
  "beschaamd": ["beschaamd", "schaamde", "schaamte", "ashamed"], "moe": ["moe", "uitgeput", "tired"],
  "overweldigd": ["overweldigd", "te veel", "overwhelmed"], "jaloers": ["jaloers", "jealous"], "opgelucht": ["opgelucht", "relieved"],
  "rustig": ["rustig", "kalm", "calm"], "blij": ["blij", "vrolijk", "happy"], "angstig": ["angstig", "bang", "angst", "paniek", "scared", "anxious"],
  "leeg": ["leeg", "empty"], "teleurgesteld": ["teleurgesteld", "disappointed"], "gekwetst": ["gekwetst", "hurt"],
  "afgewezen": ["afgewezen", "rejected"], "dankbaar": ["dankbaar", "grateful"], "hoopvol": ["hoopvol", "hopeful"], "trots": ["trots", "proud"],
  "geïrriteerd": ["geïrriteerd", "geirriteerd", "irritatie", "irriteerde", "irritated"], "zenuwachtig": ["zenuwachtig", "nerveus", "nervous"],
  // wat heb ik gedaan
  "mijn sponsor gebeld": ["sponsor gebeld", "sponsor geappt", "sponsor gesproken", "sponsor gebeld", "called my sponsor"],
  "iemand anders gebeld": ["iemand gebeld", "vriend gebeld", "fellow gebeld"],
  "erover gepraat": ["erover gepraat", "over gepraat", "uitgepraat", "talked about"],
  "naar een meeting gegaan": ["meeting", "naar een meeting"],
  "naar buiten gegaan": ["naar buiten", "gewandeld", "wandeling", "frisse lucht", "went outside", "walk"],
  "afleiding gezocht": ["afleiding", "afgeleid", "distraction"],
  "de situatie verlaten": ["weggegaan", "weggelopen", "ben weggegaan", "left the situation"],
  "gebeden of gemediteerd": ["gebeden", "gebed", "gemediteerd", "meditatie", "prayed", "meditated"],
  "de film doorgespoeld tot het eind": ["doorgespoeld", "film doorgespoeld"],
  "iets gegeten of gedronken": ["gegeten", "thee gedronken", "koffie gedronken"],
  "gewacht tot het overging": ["overging", "ging over", "zakte weg", "passed"],
  "literatuur gelezen": ["literatuur", "basistekst", "alleen voor vandaag", "jft", "big book"],
  // met wie (vraag 3)
  "mezelf": ["mezelf", "mijzelf", "myself"], "iemand thuis": ["thuis"], "mijn familie": ["familie", "moeder", "vader", "broer", "zus", "ouders", "mam", "pap", "family", "brother", "sister", "mother", "father"],
  "een vriend": ["vriend", "vriendin", "friend"], "mijn sponsor": ["sponsor"], "een hulpverlener": ["hulpverlener", "therapeut", "psycholoog"],
  "iemand op werk/school": ["werk", "collega", "baas", "school", "leraar", "work", "colleague", "boss"], "een onbekende": ["onbekende", "vreemde", "stranger"],
  "een huisgenoot": ["huisgenoot", "huisgenote", "housemate"], "de begeleiding": ["begeleider", "begeleiding"], "een fellow": ["fellow"]
};
const leesWeg = new Set();   // "datum|vraag": voorstellen weggeklikt (alleen deze sessie)
const LEES_NIET = /\b(niet|geen|nooit|niks|niets|not|no|never)\s+(\S+\s+){0,2}$/i;
const leesEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// komt een van de woorden voor (niet ontkend)? Woordgrenzen ook rond é, ë enzovoort.
function leesVind(tekst, woorden){
  const t = " " + tekst.toLowerCase() + " ";
  return woorden.some(w => {
    const rx = new RegExp("(^|[^a-zà-ÿ])" + leesEsc(w.toLowerCase()) + "(?=[^a-zà-ÿ]|$)", "g"); let m;
    while((m = rx.exec(t))){ if(!LEES_NIET.test(t.slice(Math.max(0, m.index - 40), m.index + m[1].length))) return true; }
    return false;
  });
}
// vrije tekst van een vraag: alles behalve kopjes en knopjes-regels
function leesVrij(q, tekst){
  const kop = new Set([].concat(...(q.rows || []).map(headersOf)));
  return (tekst || "").split("\n").filter(l => l.trim() && l.indexOf("- ") !== 0 && !kop.has(l.trim())).join("\n");
}
function leesMee(q, ta){
  if(LEES_VRAGEN.indexOf(q.id) < 0) return null;
  const box = el("div", "leesmee hidden");
  box.teken = refresh => {
    box.innerHTML = "";
    const sleutel = curKey + "|" + q.id;
    if(leesWeg.has(sleutel)){ box.classList.add("hidden"); return; }
    const eigen = leesVrij(q, ta.value), v1 = (entry.answers && entry.answers.q1 && entry.answers.q1.text) || "";
    // vraag 3: alleen zinnen uit vraag 1 die over een conflict gaan (anders geeft "thuis" of "werk" verkeerde voorstellen)
    const v1Zinnen = q.id === "q3" ? v1.split(/[.!?\n]+/).filter(z => leesVind(z, LEES_WOORDEN["een ruzie"].concat(["boos", "kwaad", "botsing", "aanvaring"]))).join(". ") : v1;
    const gevonden = [];
    (q.rows || []).forEach((row, ri) => {
      if(q.id === "q5" && ri < 2) return;   // sterkte en tijdstip: niet uit tekst te halen
      if(q.id === "q3" && ri > 1) return;   // wat ik deed / eigen deel: te persoonlijk om te raden
      const gekozen = rowSelected(ta.value, q, row);
      itemsOf(q, row).forEach(item => {
        if(gekozen.some(l => lineIsItem(l, item))) return;
        const woorden = (LEES_WOORDEN[item] || []).concat(item.length > 3 ? [item] : []);
        if(!woorden.length) return;
        const inEigen = leesVind(eigen, woorden), in1 = !inEigen && leesVind(v1Zinnen, woorden);
        if((inEigen || in1) && !gevonden.some(g => g.item === item && g.row === row)) gevonden.push({row, item, in1});
      });
    });
    box.classList.toggle("hidden", !gevonden.length);
    if(!gevonden.length) return;
    const kop = el("div", "leeskop");
    const alleen1 = gevonden.every(g => g.in1);
    kop.appendChild(el("span", null, alleen1 ? vt("Uit wat je bij vraag 1 schreef. Aanvinken?", "From what you wrote in question 1. Tick?") : vt("Ik lees mee. Bedoel je:", "Reading along. Do you mean:")));
    const weg = el("button", "linkbtn", vt("Niet nodig", "Not needed")); weg.type = "button";
    weg.onclick = () => { leesWeg.add(sleutel); box.teken(refresh); };
    kop.appendChild(weg); box.appendChild(kop);
    // per rij (trigger, gevoel, wat ik deed …) één regel: kort label + kleine knopjes
    (q.rows || []).forEach(row => {
      const hier = gevonden.filter(g => g.row === row).slice(0, 4); if(!hier.length) return;
      const r = el("div", "leesrij");
      r.appendChild(el("span", "leeslabel", rowLabel(row)));
      hier.forEach(g => {
        const b = el("button", "chip leeschip", "+ " + vItem(g.item)); b.type = "button";
        if(g.in1 && !alleen1) b.title = vt("uit vraag 1", "from question 1");
        b.onclick = () => { toggleRowItem(ta, q, g.row, g.item, refresh); refresh(); };
        r.appendChild(b);
      });
      box.appendChild(r);
    });
  };
  // als je in vraag 1 typt, ook hier opnieuw kijken (één luisteraar voor de hele pagina)
  LEES_OPEN[q.id] = () => { if(box.isConnected && box.__refresh) box.teken(box.__refresh); };
  return box;
}
const LEES_OPEN = {};
let leesT = null;
document.addEventListener("input", e => {
  if(!e.target || e.target.tagName !== "TEXTAREA") return;
  clearTimeout(leesT); leesT = setTimeout(() => Object.values(LEES_OPEN).forEach(f => f()), 400);
});
