// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- Alleen voor vandaag / Just for Today (eigen PDF, gelezen op het toestel) ----------
// De Nederlandse ("Alleen voor vandaag") en de Engelse ("Just for Today") uitgave worden allebei herkend.
// Bewaard als {nl: {entries, count, loaded}, en: {...}}; de oude vorm {entries, count, loaded} was altijd Nederlands
// en wordt bij het laden vanzelf omgezet naar {nl: ...}. Alleen de uitgelezen tekst staat op het toestel, nooit de PDF.
const MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MONTHS_EN = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const MDAYS = [31,29,31,30,31,30,31,31,30,31,30,31];
const JFT_KEY = "dagbeschouwing:jft";
function jftLaad(){
  let v = null;
  try{ const s = localStorage.getItem(JFT_KEY); v = s ? JSON.parse(s) : null; }catch(e){ v = null; }
  if(v && v.entries){ v = {nl: v}; try{ localStorage.setItem(JFT_KEY, JSON.stringify(v)); }catch(e){} }   // oude vorm -> nl
  return v && (v.nl || v.en) ? v : null;
}
let jft = jftLaad();
// welke tekst tonen: de taal van de app, anders de andere ingelezen taal
function jftKeuze(){
  if(!jft) return null;
  const voorkeur = isEn() ? "en" : "nl", ander = voorkeur === "en" ? "nl" : "en";
  if(jft[voorkeur] && jft[voorkeur].entries) return {taal: voorkeur, data: jft[voorkeur], anders: false};
  if(jft[ander] && jft[ander].entries) return {taal: ander, data: jft[ander], anders: true};
  return null;
}
const jftHeeftTekst = () => !!jftKeuze();
let jftOpen = false;
let jftShift = 0; // 0 = vandaag, -1 = gisteren, enz.

function itemsToLines(items, page){
  const its = items.filter(it => it.str && it.str.trim() !== "").map(it => ({
    s: it.str, x: it.transform[4], y: it.transform[5], w: it.width || 0, h: Math.abs(it.height || it.transform[3] || 10)
  })).sort((a,b) => (b.y - a.y) || (a.x - b.x));
  const lines = [];
  its.forEach(it => {
    const last = lines[lines.length-1];
    if(last && Math.abs(last.y - it.y) < Math.max(2, it.h*0.4)) last.parts.push(it);
    else lines.push({y: it.y, h: it.h, parts: [it]});
  });
  return lines.map(l => {
    l.parts.sort((a,b) => a.x - b.x);
    let txt = "", end = null;
    l.parts.forEach(p => {
      if(end !== null){
        const gap = p.x - end;
        if(gap > l.h*0.15 && !/\s$/.test(txt) && !/^\s/.test(p.s)) txt += " ";
      }
      txt += p.s; end = p.x + p.w;
    });
    return {text: txt.replace(/\s+/g," ").trim(), y: l.y, h: l.h, page: page, x: l.parts[0].x};
  }).filter(l => l.text);
}

// Taal van het bestand herkennen aan de kopregels: beide herkenners proberen, de beste (minstens 300 dagen) wint.
function parseJft(lines){
  const nl = parseJftNl(lines), en = parseJftEn(lines);
  const n = x => x ? Object.keys(x).length : 0;
  if(!nl && !en) return null;
  return n(en) > n(nl) ? {taal: "en", entries: en} : {taal: "nl", entries: nl};
}
function parseJftNl(lines){
  const mp = MONTHS.join("|");
  const ra = new RegExp("^(\\d{1,2})\\s+("+mp+")(?:\\s+(.*))?$","i");
  const rb = new RegExp("^(.*\\S)\\s+(\\d{1,2})\\s+("+mp+")$","i");
  const exp = [];
  MONTHS.forEach((m,mi) => { for(let d=1; d<=MDAYS[mi]; d++) exp.push([d,m]); });
  const hits = [];
  let k = 0;
  for(let i=0; i<lines.length && k<exp.length; i++){
    const t = lines[i].text;
    let d=null, m=null, rest="";
    let x = t.match(ra);
    if(x){ d=+x[1]; m=x[2].toLowerCase(); rest=x[3]||""; }
    else { const y = t.length < 100 && t.match(rb); if(y){ d=+y[2]; m=y[3].toLowerCase(); rest=y[1]; } }
    if(d===exp[k][0] && m===exp[k][1]){ hits.push({i, d, m, rest: rest.trim()}); k++; }
  }
  if(hits.length < 300) return null;
  const monthOnly = new RegExp("^("+mp+")$","i");
  const out = {};
  hits.forEach((h, n) => {
    const endI = n+1 < hits.length ? hits[n+1].i : Math.min(lines.length, h.i + 60);
    let body = lines.slice(h.i+1, endI).filter(l => !monthOnly.test(l.text) && !/^\d{1,3}$/.test(l.text));
    let title = h.rest;
    if(!title && body.length){ title = body[0].text; body = body.slice(1); }
    const gaps = [];
    for(let j=1; j<body.length; j++) if(body[j].page===body[j-1].page){ const g = body[j-1].y - body[j].y; if(g>0) gaps.push(g); }
    gaps.sort((a,b)=>a-b);
    const med = gaps.length ? gaps[Math.floor(gaps.length/2)] : 14;
    const paras = [];
    let cur = null, prev = null;
    body.forEach(l => {
      const startAvv = /^Alleen voor vandaag\s*:/i.test(l.text);
      const gapBreak = prev && prev.page === l.page && (prev.y - l.y) > med * 1.45;
      if(!cur || gapBreak || startAvv){ cur = {t: l.text}; paras.push(cur); }
      else cur.t = /-$/.test(cur.t) && !/ -$/.test(cur.t) ? cur.t.slice(0,-1) + l.text : cur.t + " " + l.text;
      prev = l;
    });
    out[pad(MONTHS.indexOf(h.m)+1)+"-"+pad(h.d)] = {title: title, paras: paras.map(p => p.t.trim()).filter(t => /[\p{L}\p{N}]/u.test(t))};
  });
  return out;
}

// Engelse uitgave ("Just for Today", NA): per dag een pagina met
//   kop "<Month> <day> <Title>" (soms "June1", soms zonder titel: dan staat de titel op de regel eronder),
//   een cursief citaat (gecentreerd), een vette bronregel rechts ("Basic Text, p. 57"), dan alinea's die beginnen met
//   een inspringing (x ~37; doorlopende regels x ~26), en tot slot "Just for today: ...".
// Het citaat herkennen we aan zijn plek (alles tussen kop en bron), niet aan aanhalingstekens: die ontbreken soms.
function parseJftEn(lines){
  const mp = MONTHS_EN.join("|");
  const ra = new RegExp("^(" + mp + ")\\s*(\\d{1,2})(?:\\s+(.*))?$", "i");
  const exp = [];
  MONTHS_EN.forEach((m, mi) => { for(let d = 1; d <= MDAYS[mi]; d++) exp.push([d, m]); });
  const hits = [];
  let k = 0;
  for(let i = 0; i < lines.length && k < exp.length; i++){
    const x = lines[i].text.match(ra);
    if(x && +x[2] === exp[k][0] && x[1].toLowerCase() === exp[k][1]){ hits.push({i, d: +x[2], m: x[1].toLowerCase(), rest: (x[3] || "").trim()}); k++; }
  }
  if(hits.length < 300) return null;
  const monthOnly = new RegExp("^(" + mp + ")$", "i");
  const regelX = l => typeof l.x === "number" ? l.x : 0;
  const startJft = t => /^Just for today\s*:/i.test(t);
  // regels aan elkaar: een streepje aan het eind blijft staan (in deze uitgave zijn dat samenstellingen: open-minded, self-centered)
  const plak = (a, b) => /-$/.test(a) ? a + b : a + " " + b;
  const out = {};
  hits.forEach((h, n) => {
    const endI = n + 1 < hits.length ? hits[n + 1].i : Math.min(lines.length, h.i + 60);
    let body = lines.slice(h.i + 1, endI).filter(l => !monthOnly.test(l.text) && !/^\d{1,3}$/.test(l.text));
    let title = h.rest;
    if(!title && body.length){ title = body[0].text; body = body.slice(1); }
    // citaat en bron: de bron staat rechts uitgelijnd (x >= 140), direct voor de eerste ingesprongen alinea (x ~37).
    // Een citaat kan zelf ook links beginnen, dus we zoeken op die combinatie en niet op de eerste regel links.
    const inspr = l => regelX(l) > 31 && regelX(l) <= 45;
    let p0 = -1;
    for(let j = 1; j < Math.min(body.length, 12); j++) if(regelX(body[j - 1]) >= 140 && inspr(body[j])){ p0 = j; break; }
    if(p0 < 0){ p0 = body.findIndex(l => regelX(l) <= 45); if(p0 < 0) p0 = 0; }
    const kop = body.slice(0, p0), rest = body.slice(p0);
    let bron = "", quote = "";
    if(kop.length >= 2){ bron = kop[kop.length - 1].text; quote = kop.slice(0, -1).map(l => l.text).reduce(plak); }
    else if(kop.length === 1){ if(/^[‘'“"….]/.test(kop[0].text)) quote = kop[0].text; else bron = kop[0].text; }
    // alinea's: nieuwe alinea bij inspringing, een grotere witregel of "Just for today:"
    const gaps = [];
    for(let j = 1; j < rest.length; j++) if(rest[j].page === rest[j - 1].page){ const g = rest[j - 1].y - rest[j].y; if(g > 0) gaps.push(g); }
    gaps.sort((a, b) => a - b);
    const med = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 11;
    const paras = [];
    let cur = null, prev = null;
    rest.forEach(l => {
      const inspring = regelX(l) > 31 && regelX(l) <= 45;
      const gapBreak = prev && prev.page === l.page && (prev.y - l.y) > med * 1.45;
      if(!cur || inspring || gapBreak || startJft(l.text)){ cur = {t: l.text}; paras.push(cur); }
      else cur.t = plak(cur.t, l.text);
      prev = l;
    });
    let ps = paras.map(x => x.t.trim()).filter(x => /[\p{L}\p{N}]/u.test(x));
    // een witregel midden in een zin (bron): samenvoegen als de vorige niet op een leesteken eindigt en de volgende klein begint
    ps = ps.reduce((acc, x) => {
      const vorige = acc[acc.length - 1];
      if(vorige && !startJft(x) && !/[.!?:;”"’)]$/.test(vorige) && /^[a-z]/.test(x)) acc[acc.length - 1] = vorige + " " + x;
      else acc.push(x);
      return acc;
    }, []);
    // 9 augustus staat in de bron twee keer een "Just for today" (de tweede hoort bij 8 augustus): alleen de eerste tonen
    let gezien = false;
    ps = ps.filter(x => { if(!startJft(x)) return true; if(gezien) return false; gezien = true; return true; });
    out[pad(MONTHS_EN.indexOf(h.m) + 1) + "-" + pad(h.d)] = {title, quote, bron, paras: ps};
  });
  return out;
}

function loadScript(src){
  return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
async function readPdf(file){
  const base = "externe-bibliotheken/pdf-lezer/";
  if(!window.pdfjsLib){ await loadScript(base+"pdf.min.js"); await loadScript(base+"pdf.worker.min.js"); }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = base+"pdf.worker.min.js";
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({data: new Uint8Array(buf), isEvalSupported: false}).promise;
  const lines = [];
  for(let p=1; p<=pdf.numPages; p++){
    if(p % 10 === 0) $("jftMsg").textContent = vt("Bestand lezen… pagina ", "Reading file… page ") + p + vt(" van ", " of ") + pdf.numPages;
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    itemsToLines(tc.items, p).forEach(l => lines.push(l));
    page.cleanup && page.cleanup();
  }
  return parseJft(lines);
}

function renderJft(){
  const keuze = jftKeuze(), has = !!keuze;
  $("jftHave").classList.toggle("hidden", !has);
  $("jftNone").classList.toggle("hidden", !!has);
  if(!has) return;
  // welke talen zijn ingelezen, en een korte regel als de tekst in de andere taal is
  const talen = ["nl", "en"].filter(x => jft[x] && jft[x].entries).map(x => x === "nl" ? vt("Nederlands", "Dutch") : vt("Engels", "English"));
  $("jftTalen").textContent = vt("Ingelezen: ", "Loaded: ") + talen.join(vt(" en ", " and "));
  $("jftAnders").textContent = keuze.anders ? (keuze.taal === "en" ? vt("Deze tekst is Engels: je hebt nog geen Nederlandse PDF gekozen.", "This text is in English.") : vt("Deze tekst is Nederlands.", "This text is in Dutch: you have not chosen an English PDF yet.")) : "";
  $("jftAnders").classList.toggle("hidden", !keuze.anders);
  const base = parseKey(curKey);
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + jftShift);
  const key = pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const e = keuze.data.entries[key];
  const DAGEN = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
  $("jftDate").textContent = isEn() ? d.toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long"}) : DAGEN[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  $("jftRel").textContent = jftShift === 0 ? vt("vandaag", "today") : jftShift === -1 ? vt("gisteren", "yesterday") : (-jftShift) + vt(" dagen geleden", " days ago");
  $("jftNext").disabled = jftShift >= 0;
  $("jftToday").classList.toggle("hidden", jftShift === 0);
  $("jftPickDate").max = curKey; $("jftPickDate").value = keyOf(d);
  $("jftTitle").textContent = e ? e.title : vt("Geen tekst gevonden voor deze datum", "No text found for this date");
  const body = $("jftBody"); body.innerHTML = "";
  if(e && e.quote){ const q = document.createElement("p"); q.className = "quote"; q.textContent = e.quote; body.appendChild(q); }
  if(e && e.bron){ const b = document.createElement("p"); b.className = "bron"; b.textContent = e.bron; body.appendChild(b); }
  if(e) e.paras.forEach((t,i) => {
    const p = document.createElement("p"); p.textContent = t;
    if(/^(Alleen voor vandaag|Just for today)\s*:/i.test(t)) p.className = "avv";
    else if(i===0 && !e.quote && /^[‘'“"]/.test(t)) p.className = "quote";
    body.appendChild(p);
  });
  body.classList.toggle("hidden", !jftOpen || !e);
  $("jftToggle").classList.toggle("hidden", !e);
  $("jftToggle").textContent = jftOpen ? vt("Tekst inklappen", "Collapse text") : vt("Lees de tekst", "Read the text");
}
$("jftToggle").onclick = () => { jftOpen = !jftOpen; renderJft(); };
const jftGo = n => { jftShift = Math.min(0, n); renderJft(); };
$("jftPrev").onclick = () => jftGo(jftShift - 1);
$("jftNext").onclick = () => jftGo(jftShift + 1);
$("jftToday").onclick = () => jftGo(0);
$("jftPickDate").onchange = ev => {
  if(!ev.target.value) return;
  const diff = Math.round((parseKey(ev.target.value) - parseKey(curKey)) / 86400000);
  jftGo(diff);
};
$("jftPick").onclick = () => $("jftFile").click();
$("jftChange").onclick = () => $("jftFile").click();
$("jftFile").onchange = async ev => {
  const f = ev.target.files && ev.target.files[0];
  ev.target.value = "";
  if(!f) return;
  const msg = $("jftMsg");
  msg.textContent = vt("Bestand lezen… dit kan even duren.", "Reading file… this may take a moment.");
  try{
    const res = await readPdf(f);
    if(!res){ msg.textContent = vt("In dit bestand kon ik de dagen niet vinden. Is het de PDF van ‘Alleen voor vandaag’ of ‘Just for Today’?", "I could not find the days in this file. Is it the ‘Alleen voor vandaag’ or ‘Just for Today’ PDF?"); return; }
    const deel = {entries: res.entries, count: Object.keys(res.entries).length, loaded: Date.now()};
    jft = Object.assign({}, jft || {}, {[res.taal]: deel});
    let stored = true;
    try{ localStorage.setItem(JFT_KEY, JSON.stringify(jft)); }catch(e){ stored = false; }
    msg.textContent = deel.count + vt(" dagen gevonden", " days found") + " (" + (res.taal === "en" ? vt("Engels", "English") : vt("Nederlands", "Dutch")) + ")." + (stored ? "" : vt(" Let op: opslaan op dit toestel lukte niet, dus je moet het bestand de volgende keer opnieuw kiezen.", " Note: saving on this device did not work, so you will have to choose the file again next time."));
    jftOpen = false;
    renderJft();
  }catch(e){
    msg.textContent = vt("Het bestand lezen lukte niet. Probeer het nog eens of kies het bestand opnieuw.", "Reading the file did not work. Try again or choose the file again.");
  }
};
// testhaakje voor de rooktest (zonder echt PDF-bestand): herkenners en het omzetten van de oude opslag
window.__jft = {parseJft, jftLaad};
