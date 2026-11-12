// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- Alleen voor vandaag (own PDF, read on the device) ----------
const MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MDAYS = [31,29,31,30,31,30,31,31,30,31,30,31];
const JFT_KEY = "dagbeschouwing:jft";
let jft = (function(){ try{ const v = localStorage.getItem(JFT_KEY); return v ? JSON.parse(v) : null; }catch(e){ return null; } })();
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
    return {text: txt.replace(/\s+/g," ").trim(), y: l.y, h: l.h, page: page};
  }).filter(l => l.text);
}

function parseJft(lines){
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
  const has = jft && jft.entries;
  $("jftHave").classList.toggle("hidden", !has);
  $("jftNone").classList.toggle("hidden", !!has);
  if(!has) return;
  const base = parseKey(curKey);
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + jftShift);
  const key = pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const e = jft.entries[key];
  const DAGEN = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
  $("jftDate").textContent = isEn() ? d.toLocaleDateString("en-GB", {weekday:"long", day:"numeric", month:"long"}) : DAGEN[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  $("jftRel").textContent = jftShift === 0 ? vt("vandaag", "today") : jftShift === -1 ? vt("gisteren", "yesterday") : (-jftShift) + vt(" dagen geleden", " days ago");
  $("jftNext").disabled = jftShift >= 0;
  $("jftToday").classList.toggle("hidden", jftShift === 0);
  $("jftPickDate").max = curKey; $("jftPickDate").value = keyOf(d);
  $("jftTitle").textContent = e ? e.title : vt("Geen tekst gevonden voor deze datum", "No text found for this date");
  const body = $("jftBody"); body.innerHTML = "";
  if(e) e.paras.forEach((t,i) => {
    const p = document.createElement("p"); p.textContent = t;
    if(/^Alleen voor vandaag\s*:/i.test(t)) p.className = "avv";
    else if(i===0 && /^[‘'“"]/.test(t)) p.className = "quote";
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
    const entries = await readPdf(f);
    if(!entries){ msg.textContent = vt("In dit bestand kon ik de dagen niet vinden. Is het de PDF van ‘Alleen voor vandaag’?", "I could not find the days in this file. Is it the Dutch ‘Alleen voor vandaag’ PDF?"); return; }
    jft = {entries: entries, count: Object.keys(entries).length, loaded: Date.now()};
    let stored = true;
    try{ localStorage.setItem(JFT_KEY, JSON.stringify(jft)); }catch(e){ stored = false; }
    msg.textContent = jft.count + vt(" dagen gevonden.", " days found.") + (stored ? "" : vt(" Let op: opslaan op dit toestel lukte niet, dus je moet het bestand de volgende keer opnieuw kiezen.", " Note: saving on this device did not work, so you will have to choose the file again next time."));
    jftOpen = false;
    renderJft();
  }catch(e){
    msg.textContent = vt("Het bestand lezen lukte niet. Probeer het nog eens of kies het bestand opnieuw.", "Reading the file did not work. Try again or choose the file again.");
  }
};
