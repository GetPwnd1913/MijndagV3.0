// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- mijn werkboek: het mooie overzicht, voorbeelden, suggesties uit je app en een stempel als een opdracht af is ----------
// Overzicht: grote kleurige kaart per opdracht met een tekening; "Verder met" bovenaan.
// Stempels: settings.werkboek.af = {opdrachtId: "YYYY-MM-DD"} (de dag dat de opdracht af was).
// Uit je app: knopjes uit je dagbeschouwingen (triggers, gevoelens), noodplan en netwerkkaart; laden één keer per bezoek.

// ---- voorbeelden: per vraag één of twee ingevulde voorbeelden (nl, en) ----
const WBX_VOORBEELDEN = {
  "tv.groen": [["Ik sta op tijd op en heb zin in de dag. Ik ga twee keer per week naar een meeting en bel mijn sponsor op zondag. Ik voel me rustig.", "I get up on time and look forward to the day. I go to a meeting twice a week and call my sponsor on Sundays. I feel calm."],
    ["Ik slaap goed, eet op tijd en lach weer met mijn familie. Ik denk: één dag tegelijk.", "I sleep well, eat on time and laugh with my family again. I think: one day at a time."]],
  "tv.terugblik": [["Een paar weken voor mijn terugval ging ik niet meer naar meetings. Ik zei dat ik het druk had. Ik sliep slecht en zat veel alleen.", "A few weeks before my relapse I stopped going to meetings. I said I was busy. I slept badly and was alone a lot."],
    ["Ik zocht een oude vriend op, ‘gewoon voor de gezelligheid’. Ik vertelde niemand hoe het echt ging.", "I looked up an old friend, ‘just for company’. I didn't tell anyone how I was really doing."]],
  "tv.oranje": [["Ik word snel boos om kleine dingen en zit ’s avonds tot laat op mijn telefoon. Ik denk: het gaat wel, ik hoef niet naar een meeting. Als ik dit merk, bel ik mijn sponsor.", "I get angry quickly over small things and stay on my phone late at night. I think: I'm fine, I don't need a meeting. When I notice this, I call my sponsor."],
    ["Ik voel me leeg en verveel me. Ik sla afspraken over. Als ik dit merk, pak ik mijn dagritme weer op en ga ik op tijd naar bed.", "I feel empty and bored. I skip appointments. When I notice this, I get back into my daily routine and go to bed on time."]],
  "tv.rood": [["Ik denk: niemand merkt het. Ik voel sterke zucht en neem mijn telefoon niet op. Dan bel ik meteen mijn sponsor en ga ik weg van de plek.", "I think: nobody will notice. I feel a strong craving and don't answer my phone. Then I call my sponsor straight away and leave the place."],
    ["Ik ga geld regelen en denk aan waar ik het kan halen. Dan ga ik meteen naar iemand toe en speel ik de film door tot het eind.", "I start arranging money and think about where I can get it. Then I go to someone straight away and play the tape through to the end."]],
  "tv.situaties": [["Vrijdagavond alleen thuis, net nadat ik mijn salaris heb gekregen.", "Friday night alone at home, just after I've been paid."],
    ["Verjaardagen waar gedronken wordt, en door mijn oude buurt fietsen.", "Birthdays where people drink, and cycling through my old neighbourhood."]],
  "tv.gedachten": [["De gedachte: ‘Ik heb het verdiend, één keer kan wel.’ Wat ik terugzeg: ‘Eén keer is nooit één keer. Ik bel eerst iemand.’", "The thought: ‘I deserve it, once won't hurt.’ What I say back: ‘Once is never once. First I call someone.’"],
    ["De gedachte: ‘Het was toch niet zo erg.’ Wat ik terugzeg: ‘Denk aan hoe het echt was, en speel de film door.’", "The thought: ‘It wasn't that bad.’ What I say back: ‘Remember how it really was, and play the tape through.’"]],
  "tv.aanspreken": [["Mijn sponsor en mijn zus mogen het zeggen als ik me terugtrek of meetings oversla. Ze mogen me eerlijk vragen hoe het echt gaat.", "My sponsor and my sister can say something when I withdraw or skip meetings. They can ask me honestly how I'm really doing."],
    ["Mijn begeleider mag mijn plan met me doorlopen als ze ziet dat ik slecht slaap.", "My support worker can go through my plan with me when she sees I'm sleeping badly."]],
  "tv.uitglijder": [["Ik stop meteen en bel dezelfde dag mijn sponsor. Ik vertel het eerlijk aan mijn begeleiding en ga de volgende dag naar een meeting.", "I stop straight away and call my sponsor that same day. I tell my support workers honestly and go to a meeting the next day."],
    ["Ik kraak mezelf niet af. Ik kijk wat de aanleiding was en pas dit plan aan.", "I don't beat myself up. I look at what triggered it and update this plan."]],
  "gs.gebeurtenis": [["Zaterdagmiddag in de supermarkt. Een man drong voor in de rij.", "Saturday afternoon in the supermarket. A man pushed in front of me in the queue."],
    ["Mijn moeder belde en vroeg of ik wel naar mijn afspraak was geweest.", "My mother called and asked whether I had actually gone to my appointment."]],
  "gs.gedachten": [["‘Hij vindt mij niks. Hij doet het expres.’", "‘He thinks I'm nothing. He's doing it on purpose.’"],
    ["‘Ze vertrouwt me nog steeds niet. Het maakt toch niet uit wat ik doe.’", "‘She still doesn't trust me. It doesn't matter what I do anyway.’"]],
  "gs.gevoelens": [["Boos, 8 uit 10. Ook een beetje schaamte.", "Angry, 8 out of 10. A bit of shame too."],
    ["Verdrietig en gefrustreerd, 6 uit 10.", "Sad and frustrated, 6 out of 10."]],
  "gs.gedrag": [["Ik zei iets onaardigs en liep weg zonder boodschappen.", "I said something nasty and walked out without my shopping."],
    ["Ik hing op en zei de rest van de dag niks meer.", "I hung up and didn't say anything for the rest of the day."]],
  "gs.gevolgen": [["Meteen: even opluchting. Later: spijt, en ik had nog steeds geen eten in huis.", "Straight away: a moment of relief. Later: regret, and I still had no food in the house."],
    ["Ik voelde me eenzaam en kreeg ’s avonds zucht.", "I felt lonely and got a craving in the evening."]],
  "gs.helpend": [["‘Hij had gewoon haast, het gaat niet om mij.’ De volgende keer adem ik eerst rustig in.", "‘He was just in a hurry, it's not about me.’ Next time I'll take a calm breath first."],
    ["‘Ze vraagt het omdat ze om me geeft.’ De volgende keer zeg ik rustig wat ik voel.", "‘She asks because she cares about me.’ Next time I'll calmly say what I feel."]],
  "balans.vgebruik": [["Even geen zorgen, en ik hoorde erbij in mijn oude groep.", "No worries for a while, and I fitted in with my old crowd."]],
  "balans.ngebruik": [["Schulden, ruzie thuis, en mijn kinderen zag ik bijna niet meer.", "Debts, fights at home, and I hardly saw my children any more."]],
  "balans.vclean": [["Ik zie mijn kinderen weer elk weekend en heb geld over aan het eind van de maand.", "I see my children every weekend again and have money left at the end of the month."]],
  "balans.nclean": [["Ik verveel me ’s avonds en mis soms mijn oude vrienden.", "I get bored in the evenings and sometimes miss my old friends."]],
  "netwerk": [["Mark, mijn sponsor: helpt mij, dichtbij. Sandra, mijn zus: helpt mij, tussenin. Een oude vriend van vroeger: risico, verder weg.", "Mark, my sponsor: helps me, close. Sandra, my sister: helps me, in between. An old friend from the past: risk, further away."]],
  "plezier": [["Alleen: muziek luisteren en tekenen. Samen: koffie drinken met een fellow. Buiten: zaterdag vissen met mijn broer.", "On my own: listening to music and drawing. With others: coffee with a fellow. Outdoors: fishing with my brother on Saturday."]],
  "nee.situaties": [["Op een verjaardag waar iemand me een biertje aanbiedt.", "At a birthday party where someone offers me a beer."]],
  "nee.zinnen": [["‘Nee, dank je. Ik drink liever cola.’ Daarna praat ik gewoon verder over iets anders.", "‘No thanks. I'd rather have a cola.’ Then I just carry on talking about something else."]]
};
// knop "Geef een voorbeeld" met een vakje dat open- en dichtgaat; bij meer voorbeelden: "Nog een voorbeeld"
function wbxVoorbeeld(sleutel){
  const l = WBX_VOORBEELDEN[sleutel]; if(!l) return document.createDocumentFragment();
  const w = el("div", "wbvb");
  const knop = el("button", "linkbtn wbvbknop"); knop.type = "button"; knop.setAttribute("aria-expanded", "false");
  const ic = icon("x", 17); ic.innerHTML = '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>';
  knop.appendChild(ic); knop.appendChild(document.createTextNode(vt("Geef een voorbeeld", "Show an example")));
  const vak = el("div", "wbvbvak hidden");
  let nr = 0;
  const teken = () => {
    vak.innerHTML = "";
    vak.appendChild(el("small", "wbvbkop", l.length > 1 ? vt("Voorbeeld " + (nr + 1) + " van " + l.length, "Example " + (nr + 1) + " of " + l.length) : vt("Voorbeeld", "Example")));
    vak.appendChild(el("div", "wbvbtekst", vt(l[nr][0], l[nr][1])));
    const rij = el("div", "wbvbrij");
    if(l.length > 1){ const n = el("button", "linkbtn", vt("Nog een voorbeeld", "Another example")); n.type = "button"; n.onclick = () => { nr = (nr + 1) % l.length; teken(); }; rij.appendChild(n); }
    const d = el("button", "linkbtn", vt("Sluiten", "Close")); d.type = "button"; d.onclick = () => { vak.classList.add("hidden"); knop.classList.remove("hidden"); knop.setAttribute("aria-expanded", "false"); knop.focus(); };
    rij.appendChild(d); vak.appendChild(rij);
    vak.appendChild(el("small", "wbvbnoot", vt("Dit is een voorbeeld van iemand anders. Jouw antwoord mag heel anders zijn.", "This is someone else's example. Your answer can be completely different.")));
  };
  knop.onclick = () => { teken(); vak.classList.remove("hidden"); knop.classList.add("hidden"); knop.setAttribute("aria-expanded", "true"); };
  w.appendChild(knop); w.appendChild(vak);
  return w;
}

// ---- uit je app: wat je al eerder hebt ingevuld ----
let wbxApp = null, wbxAppLaadt = false, wbxAppTijd = 0;
const WBX_TIJDSTIP = ["’s ochtends", "’s middags", "’s avonds"];
async function wbxAppLaad(){
  if(wbxAppLaadt || (wbxApp && Date.now() - wbxAppTijd < 60000)) return;
  wbxAppLaadt = true;
  try{
    const map = await allDays(), tk = todayKey(), van = addDaysKey(tk, -90), van14 = addDaysKey(tk, -14);
    const dagen = Object.values(map).filter(e => e && e.date && e.date >= van && e.date <= tk && hasContent(e)).sort((a, b) => a.date < b.date ? 1 : -1);
    const top = (lijsten, n) => tally(lijsten).slice(0, n).map(x => x[0]);
    const triggers = top(dagen.map(e => picked(e, "q6", 0).concat(picked(e, "q5", 1).filter(x => WBX_TIJDSTIP.indexOf(x) < 0))), 6);
    const gevoel = top(dagen.map(e => picked(e, "q6", 1).concat(picked(e, "q3", 1))), 6);
    const momenten = [];
    dagen.filter(e => e.date >= van14).forEach(e => ["q3", "q5", "q6"].forEach(q => { if(hadIt(e, q)) momenten.push({e, q}); }));
    const oud = wbxApp;
    wbxApp = {triggers, gevoel, momenten}; wbxAppTijd = Date.now();
    const v = $("view-werkboek");
    if(v && !v.classList.contains("hidden") && JSON.stringify(oud && [oud.triggers, oud.gevoel, oud.momenten.length]) !== JSON.stringify([triggers, gevoel, momenten.length])){
      const ae = document.activeElement;
      if(!ae || !/^(TEXTAREA|INPUT)$/.test(ae.tagName)) renderWerkboek();
    }
  }catch(e){}
  wbxAppLaadt = false;
}
// mensen die je al kent: noodplan-contacten en "helpt mij" uit je netwerkkaart
const wbxMensen = () => {
  const namen = ((settings.sos || {}).contacts || []).map(c => (c.name || "").trim())
    .concat((wbLees().netwerk || []).filter(p => p.soort === "helpt").map(p => (p.naam || "").trim()));
  return namen.filter((n, i) => n && namen.findIndex(x => x.toLowerCase() === n.toLowerCase()) === i);
};
// welke suggesties bij welke rij van het terugvalpreventieplan
function wbxVoorRij(k){
  if(k === "aanspreken.wie"){ const l = wbxMensen(); return l.length ? {l, t: vt("Uit je noodplan en netwerkkaart", "From your emergency plan and network map")} : null; }
  if(!wbxApp) return null;
  if(k === "situaties" && wbxApp.triggers.length) return {l: wbxApp.triggers, t: vt("Kwam vaak voor in je dagbeschouwingen", "Came up often in your daily reflections")};
  if(k === "oranje.voel" && wbxApp.gevoel.length) return {l: wbxApp.gevoel, t: vt("Zo voelde je je bij triggers en conflicten", "How you felt with triggers and conflicts")};
  return null;
}
// een rijtje "uit je app"-knopjes; tik = toevoegen. gekozen = wat al gekozen is (die vallen weg).
function wbxAppRij(doos, k, gekozen, voegToe){
  doos.innerHTML = "";
  const s = wbxVoorRij(k); if(!s) return;
  const kl = gekozen.map(x => String(x).toLowerCase()), l = s.l.filter(x => kl.indexOf(String(x).toLowerCase()) < 0);
  if(!l.length) return;
  const w = el("div", "wbapp");
  const kop = el("div", "wbappkop"); const ic = icon("x", 15); ic.innerHTML = '<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>';
  kop.appendChild(ic); kop.appendChild(document.createTextNode(s.t)); w.appendChild(kop);
  const ch = el("div", "chips");
  l.forEach(x => { const b = el("button", "chip wbappchip", "+ " + tvCap(tvT(x))); b.type = "button"; b.onclick = () => voegToe(x); ch.appendChild(b); });
  w.appendChild(ch); doos.appendChild(w);
}
// G-schema: momenten uit je dagbeschouwingen van de afgelopen twee weken, met één tik een G-schema
function wbxMomenten(box){
  if(!wbxApp || !wbxApp.momenten.length) return;
  const al = (wbLees().gschema || []).map(g => g.bron).filter(Boolean);
  const l = wbxApp.momenten.filter(m => al.indexOf(m.e.date + m.q) < 0).slice(0, 3);
  if(!l.length) return;
  const c = el("div", "card wbmomenten");
  const kop = el("div", "wbappkop"); const ic = icon("x", 15); ic.innerHTML = '<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/>';
  kop.appendChild(ic); kop.appendChild(document.createTextNode(vt("Uit je dagbeschouwingen", "From your daily reflections"))); c.appendChild(kop);
  const n = note(vt("Deze momenten heb je de afgelopen twee weken opgeschreven. Tik erop om er een G-schema van te maken.", "You wrote down these moments in the past two weeks. Tap one to turn it into an ABC diary.")); n.style.margin = "2px 0 6px"; c.appendChild(n);
  l.forEach(m => {
    const kies = r => picked(m.e, m.q, r).map(vItem);
    const soort = {q3: vt("Conflict", "Conflict"), q5: vt("Craving", "Craving"), q6: vt("Trigger", "Trigger")}[m.q];
    const wat = m.q === "q3" ? kies(0).map(x => vt("met ", "with ") + x).join(", ") : m.q === "q5" ? kies(1).join(", ") : kies(0).join(", ");
    const r = el("button", "wbrij wbmoment"); r.type = "button";
    const z = el("span", "wbmomentsoort", soort); z.dataset.q = m.q; r.appendChild(z);
    const tx = el("span", "wbtx"); tx.appendChild(el("b", null, wat ? cap(wat) : soort)); tx.appendChild(el("small", null, wbDatum(m.e.date))); r.appendChild(tx);
    r.appendChild(el("span", "wbpijl", "›"));
    r.onclick = () => gsVanuitDag({id: m.q}, m.e);
    c.appendChild(r);
  });
  box.appendChild(c);
}
// netwerkkaart: mensen uit je noodplan die nog niet op de kaart staan
function wbxNoodplanMensen(kop){
  const net = (wbLees().netwerk || []), tel = s => String(s || "").replace(/[^\d+]/g, "");
  const l = ((settings.sos || {}).contacts || []).filter(c => (c.name || "").trim() && !net.some(p => (p.naam || "").trim().toLowerCase() === c.name.trim().toLowerCase() || (tel(p.tel) && tel(p.tel) === tel(c.phone))));
  if(!l.length) return;
  const w = el("div", "wbapp"); w.style.marginTop = "14px";
  const k = el("div", "wbappkop"); const ic = icon("x", 15); ic.innerHTML = '<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/>';
  k.appendChild(ic); k.appendChild(document.createTextNode(vt("Uit je noodplan", "From your emergency plan"))); w.appendChild(k);
  const ch = el("div", "chips");
  l.forEach(c => { const b = el("button", "chip wbappchip", "+ " + c.name.trim()); b.type = "button";
    b.onclick = () => { nwBewerk = {id: wbId(), naam: c.name.trim(), rol: "", soort: "helpt", afstand: "dichtbij", tel: c.phone || "", nieuw: true}; renderWerkboek(); window.scrollTo(0, 0); };
    ch.appendChild(b); });
  w.appendChild(ch); kop.appendChild(w);
}

// ---- tekeningen voor de kaarten (wit op de kleur van de opdracht) ----
const WBX_PLAAT = {
  terugval: '<path d="M0 78q40-10 80-4t80-2V90H0z" class="g"/><rect x="62" y="10" width="36" height="66" rx="16" class="d"/><circle cx="80" cy="27" r="8" fill="#7ee08f" class="lamp"/><circle cx="80" cy="43" r="8" fill="#ffc15a"/><circle cx="80" cy="59" r="8" fill="#ff7a6b"/><circle cx="80" cy="27" r="14" fill="#7ee08f" opacity=".35"/><path d="M80 76v10" class="l"/>',
  nee: '<path d="M30 20h70a12 12 0 0 1 12 12v22a12 12 0 0 1-12 12H58l-16 12v-12H30a12 12 0 0 1-12-12V32a12 12 0 0 1 12-12z" class="w"/><circle cx="65" cy="43" r="14" fill="#e0504a"/><rect x="56" y="40" width="18" height="6" rx="3" fill="#fff"/><circle cx="128" cy="30" r="10" class="z"/><circle cx="140" cy="58" r="6" class="z"/>',
  gschema: '<path d="M20 60q20-36 40-16t40-8 40 4" class="l"/><circle cx="20" cy="60" r="9" class="w"/><circle cx="46" cy="38" r="9" class="w"/><circle cx="72" cy="48" r="9" class="w"/><circle cx="98" cy="35" r="9" class="w"/><circle cx="124" cy="38" r="9" class="w"/><circle cx="146" cy="40" r="11" fill="#ffd66b"/><path d="M146 34v12M140 40h12" stroke="#7a5a10" stroke-width="2.6" stroke-linecap="round"/>',
  balans: '<path d="M80 18v56M58 78h44" class="l"/><g transform="rotate(-8 80 22)"><path d="M28 22h104" class="l"/><path d="M28 22 16 50h24zM132 22l-12 28h24z" class="lt"/><path d="M12 50h32a16 7 0 0 1-32 0z" class="w"/><path d="M116 50h32a16 7 0 0 1-32 0z" fill="#9ff0b0"/></g><circle cx="80" cy="22" r="5" class="w"/>',
  netwerk: '<circle cx="80" cy="46" r="38" class="r"/><circle cx="80" cy="46" r="24" class="r"/><circle cx="80" cy="46" r="10" class="w"/><circle cx="100" cy="30" r="6" fill="#9ff0b0"/><circle cx="58" cy="60" r="6" fill="#9ff0b0"/><circle cx="114" cy="66" r="6" fill="#ffc15a"/><circle cx="44" cy="22" r="6" fill="#ff8a7a"/><circle cx="64" cy="26" r="6" fill="#9ff0b0"/>',
  plezier: '<path d="M0 74q30-16 60-6t50-2 50 0V90H0z" class="g"/><circle cx="64" cy="38" r="15" fill="#ffe08a"/><g class="stralen"><path d="M64 12v-6M64 70v-6M38 38h-6M96 38h-6M46 20l-4-4M86 60l-4-4M46 56l-4 4M86 16l-4 4" class="l"/></g><path d="M118 20l12 6-12 6-3-6z" class="w"/><path d="M118 32q-6 14 6 28" class="lt"/>'
};
function wbxPlaat(id){
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 160 90"); s.setAttribute("aria-hidden", "true"); s.setAttribute("class", "wbplaatsvg");
  s.innerHTML = WBX_PLAAT[id] || ""; return s;
}
// ring met voortgang (0..1) en tekst in het midden
function wbxRing(f, midden, onder, kleur){
  const r = 30, omtrek = 2 * Math.PI * r;
  const w = el("div", "wbring");
  w.innerHTML = '<svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="' + r + '" class="bg"/><circle cx="38" cy="38" r="' + r + '" class="vg" style="stroke:' + (kleur || "var(--accent)") +
    ';stroke-dasharray:' + omtrek.toFixed(1) + ';stroke-dashoffset:' + (omtrek * (1 - Math.max(0, Math.min(1, f)))).toFixed(1) + '"/></svg>';
  const tx = el("div", "wbringtx"); tx.appendChild(el("b", null, midden)); if(onder) tx.appendChild(el("small", null, onder)); w.appendChild(tx);
  return w;
}
const wbxDeel = o => { const [a, b] = o.voortgang(); return b ? Math.min(1, a / b) : 0; };
const wbxAf = () => (wbLees().af || {});
const wbxKortDatum = k => parseKey(k).toLocaleDateString(locale(), {day: "numeric", month: "short"});
// de stempel op een kaart
function wbxStempel(o, nieuw){
  const s = el("span", "wbstempel" + (nieuw ? " nieuw" : "")); s.style.setProperty("--k", o.kleur);
  s.appendChild(icon("check", 18)); s.appendChild(el("b", null, vt("Af", "Done")));
  const d = wbxAf()[o.id]; if(d) s.appendChild(el("small", null, wbxKortDatum(d)));
  return s;
}

// ---- het overzicht ----
let wbxNieuwGestempeld = [];
function wbxOverzicht(box){
  const alle = WB_OPDRACHTEN, klaar = alle.filter(wbKlaar).length, begonnen = alle.filter(wbBegonnen).length;
  const held = el("div", "card wbheld");
  const boven = el("div", "wbheldrij");
  boven.appendChild(wbxRing(alle.reduce((s, o) => s + wbxDeel(o), 0) / alle.length, klaar + "/" + alle.length, vt("af", "done")));
  const tx = el("div", "wbheldtx");
  tx.appendChild(el("div", "qtitle", vt("Mijn werkboek", "My workbook")));
  const n = note(klaar === alle.length ? vt("Alle opdrachten zijn af. Knap gedaan! Lees ze af en toe terug en houd ze bij.", "All assignments are done. Well done! Read them back now and then and keep them up to date.")
    : begonnen ? vt("Opdrachten zoals je ze ook in de verslavingszorg krijgt. Doe ze in je eigen tempo en bespreek ze met je sponsor of begeleider.", "Assignments like the ones you get in addiction care. Do them at your own pace and talk them through with your sponsor or support worker.")
    : vt("Opdrachten zoals je ze ook in de verslavingszorg krijgt. Kies er één uit en doe hem in je eigen tempo. Elke opdracht die af is, krijgt een stempel.", "Assignments like the ones you get in addiction care. Pick one and do it at your own pace. Every finished assignment gets a stamp."));
  n.style.marginTop = "4px"; tx.appendChild(n);
  boven.appendChild(tx); held.appendChild(boven);
  // verder met: eerst een begonnen opdracht die nog niet af is, anders de eerste die nog niet begonnen is
  const volgende = alle.find(o => wbBegonnen(o) && !wbKlaar(o)) || alle.find(o => !wbBegonnen(o));
  if(volgende){
    const b = el("button", "wbverder"); b.type = "button"; b.style.setProperty("--k", volgende.kleur);
    const ic = el("span", "wbtegel"); ic.style.setProperty("--k", volgende.kleur); ic.appendChild(wbIcoon(volgende.id, 22)); b.appendChild(ic);
    const t = el("span", "wbtx"); t.appendChild(el("small", null, wbBegonnen(volgende) ? vt("Verder met", "Continue with") : vt("Begin met", "Start with"))); t.appendChild(el("b", null, vt(volgende.t, volgende.te))); b.appendChild(t);
    b.appendChild(el("span", "wbpijl", "›"));
    b.onclick = () => wbxOpen(volgende);
    held.appendChild(b);
  }
  box.appendChild(held);
  WB_GROEPEN.forEach(g => {
    box.appendChild(el("div", "wbgroep", vt(g.t, g.te)));
    const grid = el("div", "wbgrid");
    alle.filter(o => o.groep === g.k).forEach(o => {
      const k = el("button", "card wbkaart" + (wbKlaar(o) ? " klaar" : "")); k.type = "button"; k.style.setProperty("--k", o.kleur); k.dataset.id = o.id;
      const plaat = el("span", "wbplaat"); plaat.appendChild(wbxPlaat(o.id)); k.appendChild(plaat);
      if(wbKlaar(o)) k.appendChild(wbxStempel(o, wbxNieuwGestempeld.indexOf(o.id) >= 0));
      const t = el("span", "wbkaarttx");
      t.appendChild(el("b", null, vt(o.t, o.te)));
      t.appendChild(el("small", null, o.status() || vt(o.uit, o.uitEn)));
      const m = el("span", "wbmeter"); const f = el("i"); f.style.width = Math.round(wbxDeel(o) * 100) + "%"; f.style.background = o.kleur; m.appendChild(f); t.appendChild(m);
      k.appendChild(t);
      k.setAttribute("aria-label", vt(o.t, o.te) + ". " + (wbKlaar(o) ? vt("Af.", "Done.") : (o.status() || vt(o.uit, o.uitEn))));
      k.onclick = () => wbxOpen(o);
      grid.appendChild(k);
    });
    box.appendChild(grid);
  });
  // net gestempeld: stempel landt met een klap en een beetje confetti
  const nieuw = wbxNieuwGestempeld; wbxNieuwGestempeld = [];
  if(nieuw.length){ const k = box.querySelector('.wbkaart[data-id="' + nieuw[0] + '"]'); if(k) k.scrollIntoView({block: "center"}); }
  if(nieuw.length && !KT_RUSTIG()) setTimeout(() => nieuw.forEach((id, i) => setTimeout(() => {
    const s = box.querySelector('.wbkaart[data-id="' + id + '"] .wbstempel'); if(!s || !s.isConnected) return;
    const o = alle.find(x => x.id === id), [x, y] = ktMidden(s), show = ktShow();
    show.knal(x, y, ktFeestKleuren(wbxKleurVan(o.kleur)), 46, 7, ["strook", "stip", "ster"]);
    if(navigator.vibrate) try{ navigator.vibrate(30); }catch(e){}
  }, 380 + i * 500)), 50);
}
function wbxOpen(o){ wbOpen = o.id; tvStap = null; gsOpen = null; gsStap = null; nwBewerk = null; neeKaart = null; wbToon(); }
// css-kleur (ook var(--…)) naar #rrggbb voor de confetti
function wbxKleurVan(k){
  if(/^#/.test(k)) return k;
  const m = /var\((--[\w-]+)\)/.exec(k); const v = m ? getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() : "";
  return /^#/.test(v) ? v : "#3b8a57";
}

// ---- een opdracht is af: stempel bewaren en vieren ----
let wbxCheckTimer = null, wbxPopNu = null;
function wbxCheckAf(){
  clearTimeout(wbxCheckTimer);
  wbxCheckTimer = setTimeout(() => {
    const af = wbxAf(), nieuw = WB_OPDRACHTEN.filter(o => wbKlaar(o) && !af[o.id]);
    if(!nieuw.length) return;
    const d = wbData(); d.af = Object.assign({}, d.af || {}); nieuw.forEach(o => { d.af[o.id] = todayKey(); });
    settings.updated = Date.now(); local.set("settings", settings); saveSettingsNow();
    const v = $("view-werkboek"); if(!v || v.classList.contains("hidden")) return;
    if(wbOpen === null){ wbxNieuwGestempeld = nieuw.map(o => o.id); renderWerkboek(); }
    else { wbxNieuwGestempeld = nieuw.map(o => o.id); wbxPop(nieuw[0]); }
  }, 450);
}
// venstertje midden in beeld: "Opdracht af!" met een stempel en confetti
function wbxPop(o){
  if(wbxPopNu) wbxPopNu.remove();
  const alleAf = WB_OPDRACHTEN.every(wbKlaar);
  const p = el("div", "wbafpop"); p.setAttribute("role", "status"); p.style.setProperty("--k", o.kleur);
  const s = el("span", "wbstempel groot"); s.style.setProperty("--k", o.kleur); s.appendChild(icon("check", 30)); s.appendChild(el("b", null, vt("Af", "Done"))); p.appendChild(s);
  p.appendChild(el("b", "wbafkop", alleAf ? vt("Alles af!", "All done!") : vt("Opdracht af!", "Assignment done!")));
  p.appendChild(el("div", "wbafnaam", vt(o.t, o.te)));
  p.appendChild(el("small", null, alleAf ? vt("Je hebt alle opdrachten van je werkboek gedaan. Wat een werk!", "You've done every assignment in your workbook. What an effort!") : vt("Je stempel staat nu op je werkboek.", "Your stamp is now on your workbook.")));
  const sluit = () => { if(!p.isConnected) return; p.classList.add("weg"); setTimeout(() => p.remove(), 300); if(wbxPopNu === p) wbxPopNu = null; };
  p.onclick = sluit; document.body.appendChild(p); wbxPopNu = p;
  setTimeout(sluit, alleAf ? 4200 : 3000);
  if(KT_RUSTIG()) return;
  requestAnimationFrame(() => {
    const [x, y] = ktMidden(s), show = ktShow(), kl = ktFeestKleuren(wbxKleurVan(o.kleur));
    setTimeout(() => { show.knal(x, y, kl, 90, 11, ["strook", "strook", "stip", "ster"]); show.ring(x, y, kl[0], 0, 7, 4); if(navigator.vibrate) try{ navigator.vibrate([20, 40, 30]); }catch(e){} }, 260);
    if(alleAf) show.vuurwerk(5, kl, 700);
  });
}
