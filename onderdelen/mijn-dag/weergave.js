// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- rendering ----------
function answer(id){ return entry.answers[id] || (entry.answers[id] = {level:"", text:""}); }
function isDoneIn(e, q){
  const a = e.answers && e.answers[q.id];
  const txt = a && (a.text||"").trim();
  if(q.type==="score") return !!e.cijfer && !!txt;
  if(!a) return false;
  if(q.type==="scale") return q.doneOn.indexOf(a.level)>=0 || (q.detailOn.indexOf(a.level)>=0 && !!txt);
  if(q.type==="free") return !!txt && (!!a.klaar || (e.date && e.date < todayKey()));
  return !!txt;
}
const isDone = q => isDoneIn(entry, q);

function insertText(ta, q, txt, asLine){
  const a = answer(q.id);
  let v = ta.value;
  if(asLine) v = v.trim() ? v.replace(/\s*$/,"") + "\n• " + txt : "• " + txt;
  else if(txt.indexOf("…")>=0) v = v.trim() ? v.replace(/\s*$/,"") + "\n" + txt : txt;
  else v = v.trim() ? v.replace(/\s*$/,"") + (/[\s,(]$/.test(v)?"":", ") + txt : txt;
  ta.value = v; a.text = v;
  scheduleSave(); markCard(q);
  ta.focus();
  const pos = v.indexOf("…", Math.max(0, v.length - txt.length - 2));
  try{ if(pos>=0) ta.setSelectionRange(pos, pos+1); else ta.setSelectionRange(v.length, v.length); }catch(e){}
}

function chipRow(label, items, cls, onTap){
  const wrap = document.createElement("div");
  const l = document.createElement("div"); l.className="label"; l.textContent=label; wrap.appendChild(l);
  const row = document.createElement("div"); row.className="chips";
  items.forEach(t=>{ const b=document.createElement("button"); b.type="button"; b.className="chip "+(cls||""); b.textContent=t; b.onclick=()=>onTap(t); row.appendChild(b); });
  wrap.appendChild(row);
  return wrap;
}
function markCard(q){
  const c = document.querySelector('[data-q="'+q.id+'"]');
  if(!c) return;
  const was = c.classList.contains("done");
  c.classList.toggle("done", isDone(q));
  if(!was && isDone(q)){ c.classList.remove("justdone"); void c.offsetWidth; c.classList.add("justdone"); }
  if(!isDone(q)) setFold(c, q, false);
}
function setFold(card, q, on){
  card.classList.toggle("fold", on);
  const ch = card.querySelector(".fchev"); if(ch){ ch.innerHTML = ""; ch.appendChild(icon(on ? "chevR" : "chevD", 18)); }
  const fs = card.querySelector(".fsum");
  if(fs) fs.textContent = on ? (answerText(q, entry) || "").split("\n").map(l => l.replace(/^- /, "").trim()).filter(Boolean).join(" · ") : "";
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// Nieuwe regels en kopjes in de gekozen taal; herkennen in beide talen (een oude Nederlandse dag werkt ook in het Engels).
const bullet = item => "- " + cap(vItem(item));
const bulletVariants = item => itemVariants(item).map(x => "- " + cap(x));
const hdr = l => /[?:]$/.test(l) ? l : l + ":";
const headerOf = row => hdr(rowLabel(row));
const headersOf = row => [hdr(row.label)].concat(row.labelEn ? [hdr(row.labelEn)] : []);
const useHeader = q => (q.rows||[]).length > 1;
function blockRange(lines, row){
  const hs = headersOf(row), i = lines.findIndex(l => hs.indexOf(l) >= 0); if(i < 0) return null;
  let j = i + 1; while(j < lines.length && lines[j].indexOf("- ") === 0) j++;
  return [i, j];
}
const rowKey = (q, row) => q.id + "|" + q.rows.indexOf(row);
const customOf = (q, row) => ((settings.customItems||{})[rowKey(q, row)] || []);
const dynItems = q => { if(q.id !== "trots") return []; const n = daysClean(curKey); return n === null ? [] : [n + (n === 1 ? " dag clean" : " dagen clean")]; };
// vaste knopjes (zonder de verborgen, zie eigen-lijsten.js) + eigen knopjes uit Instellingen + eigen knopjes van deze rij
const itemsOf = (q, row) => {
  const naam = typeof lijstVanRij === "function" ? lijstVanRij(row) : null;
  const weg = naam ? lijstVerborgen(naam) : [];
  const base = dynItems(q).concat(row.items.filter(it => weg.indexOf(it) < 0));
  const extra = (naam ? lijstEigen(naam) : []).concat(customOf(q, row));
  return base.concat(extra.filter((c, i, a) => base.indexOf(c) < 0 && a.indexOf(c) === i));
};
// knopjes die in deze dag gekozen zijn maar niet (meer) in de lijst staan (verborgen of verwijderd): toch tonen
function gekozenBuitenLijst(text, q, row){
  if(!(typeof lijstVanRij === "function" && lijstVanRij(row))) return [];
  const zicht = itemsOf(q, row), uit = [];
  rowSelected(text, q, row).forEach(l => {
    if(l.indexOf("- ") !== 0 || zicht.some(it => lineIsItem(l, it))) return;
    const vast = row.items.find(it => lineIsItem(l, it));
    let s = l.slice(2); const i = s.indexOf(": "); if(i >= 0) s = s.slice(0, i);
    const item = vast || (s.length > 1 && s.charAt(1) !== s.charAt(1).toUpperCase() ? s.charAt(0).toLowerCase() + s.slice(1) : s);
    if(item && uit.indexOf(item) < 0) uit.push(item);
  });
  return uit;
}
async function saveCustom(q, row, list){
  settings.customItems = Object.assign({}, settings.customItems||{});
  if(list.length) settings.customItems[rowKey(q, row)] = list; else delete settings.customItems[rowKey(q, row)];
  settings.updated = Date.now();
  local.set("settings", settings);
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
}
const lineIs = (l, b) => l === b || l.indexOf(b + ": ") === 0;
const findItemLine = (lines, b) => lines.findIndex(l => lineIs(l, b));
const lineIsItem = (l, item) => bulletVariants(item).some(b => lineIs(l, b));
const findItemLineOf = (lines, item) => lines.findIndex(l => lineIsItem(l, item));
// het opsommingsteken zoals het in die regel staat (nl of en), anders in de gekozen taal
const bulletIn = (line, item) => bulletVariants(item).find(b => lineIs(line || "", b)) || bullet(item);
function rowSelected(text, q, row){
  const lines = (text||"").split("\n");
  if(useHeader(q)){ const r = blockRange(lines, row); return r ? lines.slice(r[0]+1, r[1]) : []; }
  return lines.filter(l => l.indexOf("- ") === 0);
}
function toggleRowItem(ta, q, row, item, refresh){
  const a = answer(q.id);
  const lines = ta.value ? ta.value.split("\n") : [];
  const b = bullet(item), bv = bulletVariants(item);
  if(useHeader(q)){
    const r = blockRange(lines, row);
    if(r){
      let items = lines.slice(r[0]+1, r[1]);
      const has = items.some(x => bv.indexOf(x) >= 0);
      if(row.single) items = has ? [] : [b];
      else items = has ? items.filter(x => bv.indexOf(x) < 0) : items.concat([b]);
      // het bestaande kopje (nl of en) blijft staan
      lines.splice(r[0], r[1]-r[0], ...(items.length ? [lines[r[0]]].concat(items) : []));
    } else {
      let at = lines.length;
      for(let n = q.rows.indexOf(row) + 1; n < q.rows.length; n++){ const nr = blockRange(lines, q.rows[n]); if(nr){ at = nr[0]; break; } }
      lines.splice(at, 0, headerOf(row), b);
    }
  } else {
    const k = findItemLineOf(lines, item);
    if(k >= 0) lines.splice(k, 1);
    else {
      const known = [].concat(...itemsOf(q, row).map(bulletVariants));
      let at = -1; lines.forEach((l, n) => { if(known.some(kb => lineIs(l, kb))) at = n; });
      lines.splice(at >= 0 ? at + 1 : lines.length, 0, b);
    }
  }
  ta.value = lines.join("\n").replace(/^\n+/, "");
  a.text = ta.value;
  scheduleSave(); markCard(q); refresh();
  if(ta._update) ta._update();
}
function buildSub(q, ta, row, refresh, subs){
  const si = row.sub.item;
  const sb = document.createElement("div");
  sb.style.cssText = "margin:10px 0 0 10px;padding-left:10px;border-left:3px solid var(--accent)";
  const getPlaces = line => { const i = line.indexOf(": "); return i < 0 ? [] : line.slice(i+2).replace(/\.$/,"").split(/,\s*/).filter(Boolean); };
  const setLine = places => {
    const lines = ta.value ? ta.value.split("\n") : [];
    const k = findItemLineOf(lines, si);
    if(k < 0) return;
    const mb = bulletIn(lines[k], si);
    lines[k] = places.length ? mb + ": " + places.join(", ") : mb;
    ta.value = lines.join("\n"); answer(q.id).text = ta.value;
    scheduleSave(); markCard(q); refresh(); if(ta._update) ta._update();
  };
  const draw = () => {
    const lines = (ta.value||"").split("\n");
    const k = findItemLineOf(lines, si);
    sb.classList.toggle("hidden", k < 0);
    if(k < 0) return;
    const chosen = getPlaces(lines[k]);
    sb.innerHTML = "";
    const l = document.createElement("div"); l.className = "label"; l.style.marginTop = "0"; l.textContent = vt(row.sub.label, row.sub.labelEn); sb.appendChild(l);
    const wrapEl = document.createElement("div"); wrapEl.className = "chips";
    const places = (settings.meetingPlaces||[]);
    places.forEach(p => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip" + (chosen.indexOf(p) >= 0 ? " on" : ""); b.textContent = p;
      b.onclick = () => { const cur = getPlaces((ta.value.split("\n"))[findItemLineOf(ta.value.split("\n"), si)] || ""); setLine(cur.indexOf(p) >= 0 ? cur.filter(x => x !== p) : cur.concat([p])); };
      wrapEl.appendChild(b);
    });
    sb.appendChild(wrapEl);
    const add = document.createElement("div"); add.style.cssText = "display:flex;gap:6px;margin-top:8px";
    const inp = document.createElement("input"); inp.placeholder = places.length ? vt("Andere plaats toevoegen…", "Add another place…") : vt("Typ een plaats, bijv. Utrecht of online…", "Type a place, e.g. Utrecht or online…");
    inp.style.cssText = "flex:1;min-width:0;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:16px;background:var(--card);color:var(--ink)";
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "ghost"; btn.textContent = vt("Toevoegen", "Add"); btn.style.padding = "8px 12px"; btn.style.flex = "none";
    const doAdd = async () => {
      const p = inp.value.trim().replace(/[,:]/g, " ").replace(/\s+/g, " ");
      if(!p) return;
      if(!(settings.meetingPlaces||[]).includes(p)){
        settings.meetingPlaces = (settings.meetingPlaces||[]).concat([p]); settings.updated = Date.now();
        local.set("settings", settings);
        if(setDoc){ try{ await setDoc.set(Object.assign({}, settings)); }catch(e){} }
      }
      const cur = getPlaces((ta.value.split("\n"))[findItemLineOf(ta.value.split("\n"), si)] || "");
      setLine(cur.includes(p) ? cur : cur.concat([p]));
    };
    btn.onclick = doAdd;
    inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
    add.appendChild(inp); add.appendChild(btn); sb.appendChild(add);
  };
  subs.push(draw);
  return sb;
}
function buildRows(q, ta){
  const box = document.createElement("div");
  const chips = [];
  const subs = [];
  const refresh = () => {
    chips.forEach(c => c.el.classList.toggle("on", rowSelected(ta.value, q, c.row).some(l => lineIsItem(l, c.item))));
    subs.forEach(f => f());
  };
  (q.rows||[]).forEach(row => {
    const l = document.createElement("div"); l.className = "label"; l.textContent = rowLabel(row); box.appendChild(l);
    const wrapEl = document.createElement("div"); wrapEl.className = "chips";
    const addBox = document.createElement("div"); addBox.className = "hidden"; addBox.style.marginTop = "8px";
    let editing = false;
    const drawRow = () => {
      for(let n = chips.length - 1; n >= 0; n--) if(chips[n].row === row) chips.splice(n, 1);
      wrapEl.innerHTML = "";
      const custom = customOf(q, row);
      const buiten = gekozenBuitenLijst(ta.value, q, row);
      itemsOf(q, row).concat(buiten).forEach(item => {
        const b = document.createElement("button"); b.type = "button"; b.className = "chip " + (row.cls||""); b.textContent = vItem(item);
        const mine = custom.indexOf(item) >= 0;
        if(dynItems(q).indexOf(item) >= 0) b.classList.add("cleanchip");
        if(editing && mine){
          b.textContent = item + " "; b.appendChild(icon("x", 14)); b.classList.add("start");
          b.onclick = async () => { await saveCustom(q, row, customOf(q, row).filter(x => x !== item)); drawRow(); refresh(); };
        } else if(buiten.indexOf(item) >= 0){
          // gekozen in deze dag, maar niet meer in de lijst: uitzetten haalt het knopje ook hier weg
          b.onclick = () => { toggleRowItem(ta, q, row, item, refresh); drawRow(); refresh(); };
          chips.push({el:b, row, item});
        } else {
          b.onclick = () => toggleRowItem(ta, q, row, item, refresh);
          chips.push({el:b, row, item});
        }
        wrapEl.appendChild(b);
      });
      const plus = document.createElement("button"); plus.type = "button"; plus.className = "chip start";
      plus.textContent = editing ? vt("Klaar", "Done") : vt("+ Eigen", "+ Own");
      plus.onclick = () => { editing = !editing; addBox.classList.toggle("hidden", !editing); drawRow(); refresh(); if(editing) inp.focus(); };
      wrapEl.appendChild(plus);
    };
    const inp = document.createElement("input");
    inp.placeholder = vt("Eigen knopje, bijv. ", "Your own button, e.g. ") + (row.single ? vt("iets anders", "something else") : vt("mijn rust gepakt", "took time to rest"));
    inp.style.cssText = "flex:1;min-width:0;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font:inherit;font-size:16px;background:var(--card);color:var(--ink)";
    const addBtn = document.createElement("button"); addBtn.type = "button"; addBtn.className = "ghost"; addBtn.textContent = vt("Toevoegen", "Add");
    addBtn.style.cssText = "padding:8px 12px;flex:none";
    const doAdd = async () => {
      const v = inp.value.trim().replace(/[,:]/g, " ").replace(/\s+/g, " ");
      if(!v) return;
      const val = v.charAt(0).toLowerCase() === v.charAt(0) ? v : (v.length > 1 && v.charAt(1) === v.charAt(1).toUpperCase() ? v : v.charAt(0).toLowerCase() + v.slice(1));
      if(itemsOf(q, row).indexOf(val) < 0) await saveCustom(q, row, customOf(q, row).concat([val]));
      inp.value = ""; drawRow(); refresh(); inp.focus();
    };
    addBtn.onclick = doAdd;
    inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
    const addRow = document.createElement("div"); addRow.style.cssText = "display:flex;gap:6px";
    addRow.appendChild(inp); addRow.appendChild(addBtn); addBox.appendChild(addRow);
    const hint = document.createElement("div"); hint.className = "note"; hint.style.marginTop = "6px";
    hint.textContent = vt("Tik op ✕ bij een eigen knopje om het weg te halen. Tik op Klaar als je klaar bent.", "Tap ✕ on one of your own buttons to remove it. Tap Done when you are finished.");
    addBox.appendChild(hint);
    drawRow();
    box.appendChild(wrapEl);
    box.appendChild(addBox);
    if(row.sub) box.appendChild(buildSub(q, ta, row, refresh, subs));
  });
  ta.addEventListener("input", refresh);
  refresh();
  return box;
}

window.__rows = {toggleRowItem: (...a)=>toggleRowItem(...a), QUESTIONS, entryRef: ()=>entry};
function attachView(q, ta, parent){
  if((q.rows||[]).length < 2) return;
  const view = document.createElement("div"); view.className = "tview";
  const update = () => {
    const show = document.activeElement !== ta && ta.value.trim() !== "";
    view.classList.toggle("hidden", !show); ta.classList.toggle("hidden", show);
    if(!show) return;
    view.innerHTML = "";
    ta.value.split("\n").forEach((line, n, arr) => {
      const node = isHeaderLine(q, line) ? document.createElement("b") : document.createElement("span");
      node.textContent = line; view.appendChild(node);
      if(n < arr.length - 1) view.appendChild(document.createTextNode("\n"));
    });
    const h = document.createElement("span"); h.className = "hint"; h.textContent = vt("Tik om te bewerken", "Tap to edit"); view.appendChild(h);
  };
  view.onclick = () => { view.classList.add("hidden"); ta.classList.remove("hidden"); ta.focus(); try{ ta.setSelectionRange(ta.value.length, ta.value.length); }catch(e){} };
  toetsKlik(view);
  ta.addEventListener("blur", update);
  ta._update = update;
  parent.insertBefore(view, ta);
  update();
}
function buildQuestion(q, i){
  const a = answer(q.id);
  const card = document.createElement("div");
  card.className = "card"; card.dataset.q = q.id;

  const head = document.createElement("div"); head.className="qhead";
  head.innerHTML = '<div class="num">'+(i+1)+'</div><div style="flex:1;min-width:0"><div class="qtitle"></div><div class="fsum"></div><button class="tipbtn" type="button"></button><div class="tip hidden"></div></div><div class="fchev"></div>';
  head.querySelector(".qtitle").textContent = qTitle(q);
  head.querySelector(".tipbtn").textContent = vt("Hulp bij deze vraag", "Help with this question");
  const tip = head.querySelector(".tip"); tip.textContent = qTip(q);
  if(q.id === "q9"){
    tip.appendChild(document.createTextNode(vt(" Wil je het bespreken met je begeleider? Zet het dan als bespreekpunt bij ‘Voor mijn 1-op-1’ in het menu.", " Want to discuss it with your support worker? Add it as a talking point under ‘For my 1-to-1’ in the menu.")));
    const tl = el("button", "linkbtn more", vt("Naar Voor mijn 1-op-1", "Go to For my 1-to-1")); tl.type = "button"; tl.style.cssText = "display:block;margin-top:6px;font-weight:600";
    tl.onclick = () => showView("talk"); tip.appendChild(tl);
  }
  head.querySelector(".tipbtn").onclick = e => { tip.classList.toggle("hidden"); e.target.textContent = tip.classList.contains("hidden") ? vt("Hulp bij deze vraag", "Help with this question") : vt("Verberg hulp", "Hide help"); };
  card.appendChild(head);

  const ta = document.createElement("textarea");
  ta.value = a.text || "";
  ta.oninput = () => { a.text = ta.value; scheduleSave(); markCard(q); };
  ta.placeholder = vt("Eigen tekst toevoegen…", "Add your own text…");

  if(q.type==="free"){
    ta.className = "big";
    ta.placeholder = vt("Schrijf hier over je dag…", "Write about your day here…");
    card.appendChild(ta);
    // groot schrijfscherm: openen bij aantikken, kruisje om terug te gaan
    const fsx = document.createElement("button"); fsx.type = "button"; fsx.className = "fsclose"; fsx.setAttribute("aria-label", vt("Kleiner maken", "Make smaller"));
    fsx.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    head.appendChild(fsx);
    // zelf afvinken
    const kb = document.createElement("button"); kb.type = "button"; kb.className = "klaarbtn";
    const paintK = () => {
      const has = !!(a.text || "").trim();
      kb.classList.toggle("on", !!a.klaar && has);
      kb.disabled = !has;
      kb.innerHTML = '<span class="kc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span></span>';
      kb.lastChild.textContent = !has ? vt("Schrijf eerst iets, dan kun je vraag 1 afvinken", "Write something first, then you can tick off question 1")
        : a.klaar ? vt("Vraag 1 is afgevinkt (tik om weer open te zetten)", "Question 1 is ticked off (tap to open it again)") : vt("Klaar met schrijven? Vink vraag 1 af", "Done writing? Tick off question 1");
    };
    kb.onclick = () => {
      if(!(a.text || "").trim()) return;
      a.klaar = !a.klaar; paintK(); scheduleSave(); markCard(q);
      if(a.klaar) setTimeout(() => { if(isDone(q)) setFold(card, q, true); }, 450);
    };
    card.appendChild(kb); paintK();
    ta.addEventListener("input", () => { if(kb.disabled === !!(a.text || "").trim()) paintK(); });
    const vv = window.visualViewport;
    const fit = () => { if(!card.classList.contains("fs")) return;
      const h = vv ? vv.height : window.innerHeight, t = vv ? vv.offsetTop : 0;
      card.style.height = h + "px"; card.style.top = t + "px"; };
    const openFs = () => {
      if(card.classList.contains("fs")) return;
      card.classList.remove("fold");
      card.classList.add("fs"); document.body.classList.add("fsopen"); fit();
      if(vv){ vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
      setTimeout(() => { fit(); ta.scrollTop = ta.scrollHeight; }, 350);
    };
    const closeFs = () => {
      card.classList.remove("fs"); document.body.classList.remove("fsopen");
      card.style.height = ""; card.style.top = "";
      if(vv){ vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); }
      ta.blur(); markCard(q);
      setTimeout(() => card.scrollIntoView({block:"center", behavior:"smooth"}), 50);
    };
    ta.addEventListener("focus", openFs);
    fsx.addEventListener("pointerdown", e => e.preventDefault());
    fsx.onclick = e => { e.stopPropagation(); closeFs(); };
    card.addEventListener("keydown", e => { if(e.key === "Escape" && card.classList.contains("fs")){ e.preventDefault(); closeFs(); } });
  }
  else if(q.type==="scale"){
    const sc = document.createElement("div"); sc.className="scale";
    const detail = document.createElement("div");
    const showDetail = () => detail.classList.toggle("hidden", q.detailOn.indexOf(a.level)<0);
    q.opts.forEach(([val,lab,labEn])=>{
      const b=document.createElement("button"); b.type="button"; b.textContent=vt(lab, labEn || lab);
      b._paint = ()=>{ b.classList.toggle("on", a.level===val); b.classList.toggle("warn", q.detailOn.indexOf(val)>=0); };
      b._paint();
      b.onclick=()=>{
        a.level = a.level===val ? "" : val;
        sc.querySelectorAll("button").forEach(x=>x._paint());
        showDetail();
        scheduleSave(); markCard(q);
      };
      sc.appendChild(b);
    });
    card.appendChild(sc);
    showDetail();
    if(q.id === "q5" || q.id === "q6"){
      const s = el("button", "linkbtn more", vt("Is het zwaar? Open mijn noodplan", "Is it hard? Open my emergency plan")); s.type = "button";
      s.style.cssText = "margin-top:12px;color:var(--warm-text);font-weight:600";
      s.onclick = () => showView("sos");
      detail.appendChild(s);
    }
    detail.appendChild(buildRows(q, ta));
    card.appendChild(detail);
    card.appendChild(ta);
    attachView(q, ta, card);
  }
  else if(q.type==="score"){
    const sc = document.createElement("div"); sc.className="score";
    const scoreRx = SCORE_RX;
    for(let n=1;n<=10;n++){
      const b=document.createElement("button"); b.type="button"; b.textContent=n; if(n<=5) b.dataset.low="1"; if(n===6) b.dataset.mid="1";
      if(String(n)===entry.cijfer) b.classList.add("on");
      b.onclick=()=>{
        entry.cijfer = entry.cijfer===String(n) ? "" : String(n);
        sc.querySelectorAll("button").forEach(x=>x.classList.toggle("on", x.textContent===entry.cijfer));
        const lines = ta.value ? ta.value.split("\n") : [];
        const j = lines.findIndex(l => scoreRx.test(l));
        if(entry.cijfer){ const s = vt("Ik geef deze dag een ", "I give this day a ") + entry.cijfer + "."; if(j>=0) lines[j] = s; else lines.unshift(s); }
        else if(j>=0) lines.splice(j,1);
        ta.value = lines.join("\n"); a.text = ta.value;
        scheduleSave(); markCard(q); };
      sc.appendChild(b);
    }
    card.appendChild(sc);
    card.appendChild(buildRows(q, ta));
    card.appendChild(ta);
    attachView(q, ta, card);
  }
  else {
    card.appendChild(buildRows(q, ta));
    card.appendChild(ta);
    attachView(q, ta, card);
  }
  card.classList.toggle("done", isDone(q));
  if(isDone(q)) setFold(card, q, true);
  head.addEventListener("click", e => {
    if(e.target.closest(".tipbtn") || e.target.closest(".tip") || card.classList.contains("fs")) return;
    if(card.classList.contains("fold")) setFold(card, q, false);
    else if(isDone(q)) setFold(card, q, true);
  });
  return card;
}

function addMonthsKey(k, n){
  const d = parseKey(k), y = d.getFullYear(), m = d.getMonth() + n, day = d.getDate();
  const last = new Date(y, m + 1, 0).getDate();
  return keyOf(new Date(y, m, Math.min(day, last)));
}
function addDaysKey(k, n){ const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
function milestones(since){
  const list = isEn() ? [
    [1,"24 hours (1 day)","24 hours"],[30,"30 days (1 month)","30 days"],[60,"60 days (2 months)","60 days"],
    [90,"90 days (3 months)","90 days"],[120,"120 days (4 months)","120 days"],[150,"150 days (5 months)","150 days"],
    [180,"180 days (6 months)","180 days"],[270,"270 days (9 months)","270 days"]
  ].map(([n,l,sh]) => ({label: l, short: sh, key: addDaysKey(since, n)})) : [
    [1,"24 uur (1 dag)","24 uur"],[30,"30 dagen (1 maand)","30 dagen"],[60,"60 dagen (2 maanden)","60 dagen"],
    [90,"90 dagen (3 maanden)","90 dagen"],[120,"120 dagen (4 maanden)","120 dagen"],[150,"150 dagen (5 maanden)","150 dagen"],
    [180,"180 dagen (6 maanden)","180 dagen"],[270,"270 dagen (9 maanden)","270 dagen"]
  ].map(([n,l,sh]) => ({label: l, short: sh, key: addDaysKey(since, n)}));
  list.push({label: vt("18 maanden (1,5 jaar)", "18 months (1.5 years)"), short: vt("18 maanden", "18 months"), key: addMonthsKey(since, 18)});
  for(let y=1; y<=60; y++){ const l = y===1 ? vt("1 jaar", "1 year") : y + vt(" jaar", " years"); list.push({label: l, short: l, key: addMonthsKey(since, 12*y)}); }
  return list.sort((a,b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}
let msOpen = false;
$("msDoneBtn").onclick = () => { msOpen = !msOpen; renderMilestones(); };
function renderMilestones(){
  const box = $("msBox"), cel = $("msCelebrate");
  if(!settings.since || curKey < settings.since){
    cel.classList.add("hidden"); box.classList.remove("hidden");
    $("msNext").textContent = settings.since ? vt("Mijlpalen beginnen vanaf je cleandatum.", "Milestones start from your clean date.") : vt("Mijlpalen: vul bij ‘Instellingen’ je cleandatum in, dan zie je hier je mijlpalen.", "Milestones: enter your clean date under ‘Settings’ and your milestones will appear here.");
    $("msBar").parentNode.classList.add("hidden"); $("msDone").classList.add("hidden"); $("msDoneBtn").classList.add("hidden");
    return;
  }
  $("msBar").parentNode.classList.remove("hidden");
  const list = milestones(settings.since);
  const today = list.find(m => m.key === curKey);
  cel.classList.toggle("hidden", !today);
  // tik op de felicitatiekaart → mijlpaal-overzicht (mijlpaal.js)
  cel.onclick = today ? () => openMijlpaal(today.key) : null;
  cel.onkeydown = today ? e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openMijlpaal(today.key); } } : null;
  if(today){
    $("msCelTitle").textContent = today.label + vt(" clean / nuchter!", " clean / sober!");
    $("msCelText").textContent = isEn()
      ? (curKey === todayKey() ? "Today" : "On this day") + " you are " + today.label + " sober/clean. Congratulations, be proud of yourself."
      : (curKey === todayKey() ? "Vandaag" : "Op deze dag") + " ben je " + today.label + " nuchter/clean. Gefeliciteerd, wees trots op jezelf.";
  }
  const done = list.filter(m => m.key <= curKey);
  const next = list.find(m => m.key > curKey);
  box.classList.remove("hidden");
  if(next){
    const prevKey = done.length ? done[done.length-1].key : settings.since;
    const left = Math.round((parseKey(next.key) - parseKey(curKey)) / 864e5);
    const span = Math.round((parseKey(next.key) - parseKey(prevKey)) / 864e5) || 1;
    $("msNext").textContent = isEn()
      ? "Next milestone: " + next.label + " — " + left + (left===1 ? " day" : " days") + " to go (" + shortDate(next.key) + ")"
      : "Volgende mijlpaal: " + next.label + " — nog " + left + (left===1 ? " dag" : " dagen") + " (" + shortDate(next.key) + ")";
    $("msBar").style.width = Math.max(2, Math.min(100, (1 - left/span) * 100)) + "%";
  }
  const btn = $("msDoneBtn"), listEl = $("msDone");
  btn.classList.toggle("hidden", !done.length);
  btn.textContent = (msOpen ? "▾ " : "▸ ") + vt("Behaald (", "Achieved (") + done.length + ")";
  listEl.classList.toggle("hidden", !msOpen || !done.length);
  listEl.innerHTML = "";
  done.forEach(m => {
    const r = document.createElement("div");
    r.style.cssText = "display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:15px";
    const a = document.createElement("span"); a.textContent = "✓ " + m.label; a.style.fontWeight = "600";
    const b = document.createElement("span"); b.textContent = shortDate(m.key); b.style.color = "var(--muted)";
    r.appendChild(a); r.appendChild(b); listEl.appendChild(r);
  });
}
function renderInfo(){
  applyTheme(settings.theme);
  renderMilestones();
  if(settings.since && curKey >= settings.since){ $("msDoneBtn").classList.add("hidden"); $("msDone").classList.add("hidden"); }  // behaalde mijlpalen: zie keytags / mijlpaal-overzicht
  renderKeytags();
  // dagen clean op de startpagina (die gaat altijd over vandaag)
  const d = daysClean(todayKey());
  $("homeDagen").textContent = d===null ? "" : aantal(d, "dag", "dagen", "day", "days") + " clean";
  $("homeDagen").classList.toggle("hidden", d===null);
  if(d !== null && d > 1 && !countedUp && curKey === todayKey()){ countedUp = true; countUp($("homeDagen"), d); }
  const ingesteld = !!(settings.naam || settings.since);
  $("openSettings").textContent = ingesteld ? vt("Gegevens wijzigen", "Change details") : vt("Gegevens instellen (eenmalig)", "Set up your details (one time)");
  $("openSettings").classList.toggle("hidden", ingesteld);
}

let countedUp = false;
function countUp(elx, to){
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const fmt = n => aantal(n, "dag", "dagen", "day", "days") + " clean";
  elx.textContent = fmt(0);
  const go = () => {
    if(document.getElementById("splash")){ setTimeout(go, 200); return; }
    const t0 = performance.now(), dur = Math.min(1600, 600 + to * 2);
    const f = now => { const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      if(elx.textContent.indexOf(vt("dag", "day")) < 0) return;
      elx.textContent = fmt(Math.round(to * k)); if(p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  setTimeout(go, 250);
}
function renderGreeting(){
  const g = $("greet"); if(!g) return;
  g.innerHTML = "";
  const h = (typeof ochKlok === "function" ? ochKlok() : new Date()).getHours();
  const word = isEn() ? (h < 6 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening")
    : (h < 6 ? "Goedenacht" : h < 12 ? "Goedemorgen" : h < 18 ? "Goedemiddag" : "Goedenavond");
  const night = h < 6 || h >= 18;
  const NS = "http://www.w3.org/2000/svg";
  const sv = document.createElementNS(NS, "svg"); sv.setAttribute("viewBox", "0 0 32 32"); sv.setAttribute("aria-hidden", "true");
  const mk = (t, a) => { const n = document.createElementNS(NS, t); Object.keys(a).forEach(k => n.setAttribute(k, a[k])); sv.appendChild(n); };
  if(night){
    mk("path", {d: "M21 5a11 11 0 1 0 6 18A9 9 0 0 1 21 5z", fill: "#f4b45f"});
    mk("circle", {cx: 25, cy: 7, r: 1.2, fill: "#f4b45f"}); mk("circle", {cx: 28, cy: 13, r: .9, fill: "#f4b45f"});
  } else {
    mk("circle", {cx: 16, cy: 16, r: 6, fill: "#f4b45f"});
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4; mk("line", {x1: (16 + 9.5 * Math.cos(a)).toFixed(1), y1: (16 + 9.5 * Math.sin(a)).toFixed(1), x2: (16 + 13 * Math.cos(a)).toFixed(1), y2: (16 + 13 * Math.sin(a)).toFixed(1), stroke: "#f4b45f", "stroke-width": 2.6, "stroke-linecap": "round"}); }
  }
  g.appendChild(sv);
  const sky = $("sky"); if(sky) sky.dataset.tod = h < 6 ? "nacht" : h < 12 ? "ochtend" : h < 18 ? "middag" : h < 22 ? "avond" : "nacht";
  if(typeof renderDagboog === "function") renderDagboog();
  const first = (settings.naam || "").trim().split(/\s+/)[0];
  g.appendChild(document.createTextNode(word + (first ? ", " + first : "")));
}
function render(){
  pasTaalToe();
  renderGreeting();
  renderOchtendRij();
  $("dateLabel").textContent = niceDate(curKey);
  $("nextDay").disabled = curKey >= todayKey();
  renderInfo();
  renderPlan();
  renderGoalsMini();
  renderReviewBanner(); renderBackupReminder();
  renderMeetToday();
  renderGreetingWf();
  if(typeof renderJft === "function") try{ renderJft(); }catch(e){}
  const qs = $("questions"); qs.innerHTML="";
  const ochKaart = buildOchtendKaart(); if(ochKaart) qs.appendChild(ochKaart);   // alleen op dagen met een ochtendvoornemen
  QUESTIONS.forEach((q,i)=>qs.appendChild(buildQuestion(q,i)));
  // het grote schrijfscherm (vraag 1) bestaat na opnieuw tekenen niet meer: pagina niet laten vastzitten
  if(!document.querySelector(".card.fs")) document.body.classList.remove("fsopen");
  updateProgress();
  if(typeof renderHome === "function") renderHome();
}
function updateProgress(){
  const n = QUESTIONS.filter(isDone).length;
  $("summaryBtn").classList.toggle("notyet", n < QUESTIONS.length);
  $("progText").textContent = n + vt(" van ", " of ") + QUESTIONS.length + vt(" vragen", " questions");
  $("progBar").style.width = (n/QUESTIONS.length*100)+"%";
  const T = QUESTIONS.length;
  $("progArc").setAttribute("stroke-dashoffset", (113.1 * (1 - n / T)).toFixed(1));
  $("progNum").textContent = n;
  $("progRing").classList.toggle("full", n === T);
  if(typeof renderDbKnop === "function") renderDbKnop();
}

$("prevDay").onclick = () => { const d=parseKey(curKey); d.setDate(d.getDate()-1); loadDay(keyOf(d)); window.scrollTo(0,0); };
$("nextDay").onclick = () => { const d=parseKey(curKey); d.setDate(d.getDate()+1); const k=keyOf(d); if(k<=todayKey()){ loadDay(k); window.scrollTo(0,0);} };
