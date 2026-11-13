// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- keytags ----------
const KT_BODY = "M20 34 H40 C50 34 55 48 56 64 C57 84 48 98 30 98 C12 98 3 84 4 64 C5 48 10 34 20 34 Z";
const KT_INNER = "M21 38 H39 C47 38 51 50 52 64 C53 81 45 94 30 94 C15 94 7 81 8 64 C9 50 13 38 21 38 Z";
const KT_SEEN = "dagbeschouwing:ktConfetti";
const SVGNS = "http://www.w3.org/2000/svg";

function keytagList(since){
  const yrs = (() => { let n = 0; while(addMonthsKey(since, 12 * (n + 1)) <= curKey) n++; return n; })();
  const multi = Math.max(2, yrs);
  if(isEn()) return [
    {c:"#ffffff", tc:"#3d3d3a", big:"Welcome", small:"", name:"White", nx:"white keytag", label:"Welcome", key: since},
    {c:"#FF5A2E", tc:"#ffffff", big:"30", small:"days", name:"Orange", nx:"orange keytag", label:"30 days", key: addDaysKey(since, 30)},
    {c:"#2FC94A", tc:"#ffffff", big:"60", small:"days", name:"Green", nx:"green keytag", label:"60 days", key: addDaysKey(since, 60)},
    {c:"#9E1B22", tc:"#ffffff", big:"90", small:"days", name:"Red", nx:"red keytag", label:"90 days", key: addDaysKey(since, 90)},
    {c:"#1F3FA8", tc:"#ffffff", big:"180", small:"days", name:"Blue", nx:"blue keytag", label:"180 days", key: addDaysKey(since, 180)},
    {c:"#F7D51D", tc:"#5a4a00", big:"270", small:"days", name:"Yellow", nx:"yellow keytag", label:"270 days", key: addDaysKey(since, 270)},
    {c:"#EEF2E6", tc:"#4a5a40", big:"1", small:"year", name:"Moonglow", nx:"Moonglow keytag", label:"1 year", key: addMonthsKey(since, 12), glow: true},
    {c:"#7A7A78", tc:"#ffffff", big:"18", small:"months", name:"Grey", nx:"grey keytag", label:"18 months", key: addMonthsKey(since, 18)},
    {c:"#1B1B1B", tc:"#ffffff", big:String(multi), small:"years", name:"Black", nx:"black keytag", label: multi + " years", key: addMonthsKey(since, 12 * multi), years: yrs}
  ];
  return [
    {c:"#ffffff", tc:"#3d3d3a", big:"Welkom", small:"", name:"Wit", nx:"witte keytag", label:"Welkom", key: since},
    {c:"#FF5A2E", tc:"#ffffff", big:"30", small:"dagen", name:"Oranje", nx:"oranje keytag", label:"30 dagen", key: addDaysKey(since, 30)},
    {c:"#2FC94A", tc:"#ffffff", big:"60", small:"dagen", name:"Groen", nx:"groene keytag", label:"60 dagen", key: addDaysKey(since, 60)},
    {c:"#9E1B22", tc:"#ffffff", big:"90", small:"dagen", name:"Rood", nx:"rode keytag", label:"90 dagen", key: addDaysKey(since, 90)},
    {c:"#1F3FA8", tc:"#ffffff", big:"180", small:"dagen", name:"Blauw", nx:"blauwe keytag", label:"180 dagen", key: addDaysKey(since, 180)},
    {c:"#F7D51D", tc:"#5a4a00", big:"270", small:"dagen", name:"Geel", nx:"gele keytag", label:"270 dagen", key: addDaysKey(since, 270)},
    {c:"#EEF2E6", tc:"#4a5a40", big:"1", small:"jaar", name:"Moonglow", nx:"Moonglow-keytag", label:"1 jaar", key: addMonthsKey(since, 12), glow: true},
    {c:"#7A7A78", tc:"#ffffff", big:"18", small:"maanden", name:"Grijs", nx:"grijze keytag", label:"18 maanden", key: addMonthsKey(since, 18)},
    {c:"#1B1B1B", tc:"#ffffff", big:String(multi), small:"jaar", name:"Zwart", nx:"zwarte keytag", label: multi + " jaar", key: addMonthsKey(since, 12 * multi), years: yrs}
  ];
}

function svgEl(tag, attrs){ const n = document.createElementNS(SVGNS, tag); Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k])); return n; }
let ktUid = 0;
function keytagSvg(t, on, w){
  // echt voorwerp: metalen ring, glans op het plastic en een zachte schaduw (via CSS)
  const id = "ktg" + (++ktUid);
  const light = t.c === "#ffffff" || t.c === "#EEF2E6";
  const fill = on ? t.c : "none", stroke = on ? (light ? "#B4B2A9" : "rgba(0,0,0,.25)") : "var(--muted)";
  const txt = on ? t.tc : "var(--muted)";
  const dash = on ? {} : {"stroke-dasharray": "3 3"};
  const s = svgEl("svg", {width: w, height: Math.round(w * 104 / 60), viewBox: "0 0 60 104", role: "img", class: on ? "kton" : "ktoff", "aria-label": t.label + (on ? vt(", behaald", ", achieved") : vt(", nog niet behaald", ", not yet achieved"))});
  const defs = svgEl("defs", {});
  const grad = (gid, stops, x2, y2) => { const g = svgEl("linearGradient", {id: gid, x1: 0, y1: 0, x2: x2, y2: y2}); stops.forEach(([o, c, op]) => g.appendChild(svgEl("stop", {offset: o, "stop-color": c, "stop-opacity": op}))); defs.appendChild(g); };
  grad(id + "m", [[0, "#fbfbf9", 1], [.45, "#a7a7a2", 1], [.7, "#eeeeea", 1], [1, "#8d8d88", 1]], 1, 1);           // metaal
  grad(id + "s", [[0, "#ffffff", .62], [.32, "#ffffff", .12], [.55, "#ffffff", 0], [1, "#000000", .16]], .8, 1);   // glans
  s.appendChild(defs);
  s.appendChild(svgEl("circle", {cx: 30, cy: 11, r: 9, fill: "none", stroke: on ? "url(#" + id + "m)" : "#9a9a96", "stroke-width": on ? 3 : 2.5}));
  s.appendChild(svgEl("rect", Object.assign({class: "ktb", x: 23, y: 18, width: 14, height: 20, rx: 4, fill, stroke}, dash)));
  if(on) s.appendChild(svgEl("rect", {class: "ktglans", x: 23, y: 18, width: 14, height: 20, rx: 4, fill: "url(#" + id + "s)"}));
  s.appendChild(svgEl("circle", {cx: 30, cy: 24, r: 2.6, fill: on ? "url(#" + id + "m)" : "#b8a46a", stroke: on ? "rgba(0,0,0,.25)" : "none", "stroke-width": .6}));
  s.appendChild(svgEl("path", Object.assign({class: "ktb", d: KT_BODY, fill, stroke}, dash)));
  if(on){
    s.appendChild(svgEl("path", {class: "ktglans", d: KT_BODY, fill: "url(#" + id + "s)"}));
    s.appendChild(svgEl("path", {d: KT_INNER, fill: "none", stroke: t.tc, "stroke-opacity": .35, "stroke-dasharray": "2 2"}));
    s.appendChild(svgEl("path", {class: "ktglans", d: "M14 46 C18 40 24 38 30 38", fill: "none", stroke: "#fff", "stroke-opacity": .55, "stroke-width": 2.2, "stroke-linecap": "round"}));
  }
  const bs = t.big.length > 3 ? 11 : t.big.length > 2 ? 16 : 19;
  const b = svgEl("text", {class: "ktt", x: 30, y: t.small ? 70 : 72, "text-anchor": "middle", "font-size": bs, "font-weight": 600, fill: txt});
  b.textContent = t.big; s.appendChild(b);
  if(t.small){ const sm = svgEl("text", {class: "ktt", x: 30, y: 84, "text-anchor": "middle", "font-size": 9, fill: txt}); sm.textContent = t.small; s.appendChild(sm); }
  return s;
}
// lichte kanteling bij aanraken of bewegen (niet bij "minder beweging")
const KT_RUSTIG = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function ktKantel(node, max){
  if(!node || KT_RUSTIG()) return node;
  const m = max || 14;
  const zet = e => { const r = node.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    node.style.setProperty("--ry", (x * m * 2).toFixed(1) + "deg"); node.style.setProperty("--rx", (-y * m).toFixed(1) + "deg"); node.classList.add("kantelt"); };
  const terug = () => { node.style.setProperty("--ry", "0deg"); node.style.setProperty("--rx", "0deg"); node.classList.remove("kantelt"); };
  node.classList.add("ktkantel");
  node.addEventListener("pointermove", zet); node.addEventListener("pointerdown", e => { zet(e); node.classList.remove("ktzwaai"); void node.offsetWidth; node.classList.add("ktzwaai"); });
  node.addEventListener("pointerleave", terug); node.addEventListener("pointerup", () => setTimeout(terug, 260)); node.addEventListener("pointercancel", terug);
  return node;
}

const KT_HOVER = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
// vroeger confetti; nu (rustiger) een zachte gloed om de keytag of de kaart
let ktLastBurst = 0;
function ktConfetti(card, tagEl, auto){
  if(auto && KT_RUSTIG()) return;
  const doel = tagEl || card; if(!doel) return;
  const now = Date.now(); if(now - ktLastBurst < 400) return; ktLastBurst = now;
  doel.classList.remove("ktgloed"); void doel.offsetWidth; doel.classList.add("ktgloed");
  setTimeout(() => doel.classList.remove("ktgloed"), 1900);
}

function renderKeytags(){
  const card = $("ktCard"); if(!card) return;
  card.innerHTML = ""; card.classList.remove("ktdark");
  const since = settings.since;
  const show = !!since && curKey >= since;
  card.classList.toggle("hidden", !show);
  const cel = $("msCelTag"); if(cel) cel.innerHTML = "";
  if(!show) return;
  const list = keytagList(since);
  const done = list.filter(t => t.key <= curKey);
  const last = done[done.length - 1];
  const d = daysClean(curKey);

  const head = el("div"); head.style.cssText = "display:flex;justify-content:space-between;align-items:baseline;gap:8px";
  const h = el("div", "qtitle ktti", vt("Mijn keytags", "My keytags")); head.appendChild(h);
  head.appendChild(el("div", "note", aantal(d, "dag", "dagen", "day", "days") + " clean")).style.margin = "0";
  card.appendChild(head);
  const sub = note(done.length + vt(" van ", " of ") + list.length + vt(" behaald", " achieved") + (last ? vt(" · laatst: ", " · latest: ") + last.label : "")); sub.style.marginTop = "2px"; card.appendChild(sub);

  const row = el("div", "ktrow");
  const info = note(""); info.style.cssText = "margin-top:8px;text-align:center;min-height:18px";
  let glowEl = null, lastEl = null;
  const setGlow = on => { if(!glowEl) return; glowEl.classList.toggle("glow", on); card.classList.toggle("ktdark", on); };
  list.forEach(t => {
    const on = t.key <= curKey;
    const w = el("div", "kt"); w.tabIndex = 0;
    w.appendChild(keytagSvg(t, on, 48)); if(on) ktKantel(w);
    w.onclick = () => {
      if(on){
        // behaalde tag: info + linkje naar het mijlpaal-overzicht (geteld tot die datum)
        info.textContent = t.name + " · " + t.label + vt(" · behaald op ", " · achieved on ") + shortDate(t.key) + " ";
        const lk = el("button", "linkbtn more", vt("Bekijk overzicht", "See overview")); lk.type = "button"; lk.style.cssText = "display:block;margin:4px auto 0";
        const mk = t.years !== undefined ? addMonthsKey(since, 12 * t.years) : t.key;
        lk.onclick = ev => { ev.stopPropagation(); openMijlpaal(mk); };
        info.appendChild(lk);
        return;
      }
      info.textContent = on ? "" : t.name + " · " + t.label + (isEn() ? " · " + Math.round((parseKey(t.key) - parseKey(curKey)) / 864e5) + " days to go (" : " · nog " + Math.round((parseKey(t.key) - parseKey(curKey)) / 864e5) + " dagen (") + shortDate(t.key) + ")";
    };
    if(on && t.glow){
      glowEl = w;
      if(KT_HOVER){ w.addEventListener("mouseenter", () => setGlow(true)); w.addEventListener("mouseleave", () => setGlow(false)); }
      w.addEventListener("click", () => setGlow(KT_HOVER ? true : !w.classList.contains("glow")));
    }
    if(on && t === last){
      lastEl = w;
      // de glow-in-the-dark-keytag krijgt geen warme gloed vooraf: die licht meteen groen op
      if(!t.glow){
        if(KT_HOVER) w.addEventListener("mouseenter", () => ktConfetti(card, w));
        w.addEventListener("click", () => ktConfetti(card, w));
      }
    }
    row.appendChild(w);
  });
  card.appendChild(row);
  card.appendChild(info);

  const next = list.find(t => t.key > curKey) || (last && last.years >= 2 ? {name: vt("Zwart", "Black"), nx: vt("zwarte keytag", "black keytag"), label: (last.years + 1) + vt(" jaar", " years"), key: addMonthsKey(since, 12 * (last.years + 1))} : null);
  if(next){
    const left = Math.round((parseKey(next.key) - parseKey(curKey)) / 864e5);
    const prevKey = last ? last.key : since;
    const span = Math.round((parseKey(next.key) - parseKey(prevKey)) / 864e5) || 1;
    const nt = note(isEn() ? "Next: " + next.nx + " · " + next.label + ", " + aantal(left, "", "", "day", "days") + " to go" : "Volgende: " + next.nx + " · " + next.label + ", nog " + left + (left === 1 ? " dag" : " dagen"));
    nt.style.cssText = "margin-top:10px;font-size:14px;color:var(--ink)"; nt.classList.add("ktnext");
    card.appendChild(nt);
    const bar = el("div", "bar"); const bi = el("i"); bi.style.width = Math.max(2, Math.min(100, (1 - left / span) * 100)) + "%"; bar.appendChild(bi); card.appendChild(bar);
  }

  // nieuwe keytag op deze dag: groot in het feestkaartje + één keer confetti (vandaag)
  if(last && last.key === curKey && cel){
    cel.appendChild(ktKantel(el("div", "kt groot"), 10)).appendChild(keytagSvg(last, true, 72));
    const emo = $("msCelEmoji"); if(emo) emo.classList.add("hidden");
    if(curKey === todayKey()){
      let seen = ""; try{ seen = localStorage.getItem(KT_SEEN) || ""; }catch(e){}
      if(seen !== curKey){
        try{ localStorage.setItem(KT_SEEN, curKey); }catch(e){}
        if(!last.glow) setTimeout(() => ktConfetti(card, lastEl, true), 500);
      }
    }
  } else { const emo = $("msCelEmoji"); if(emo) emo.classList.remove("hidden"); }
}
