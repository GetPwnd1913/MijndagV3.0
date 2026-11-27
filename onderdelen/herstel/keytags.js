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
  card.classList.toggle("hidden", !show || (typeof ktOpen !== "undefined" && !ktOpen));   // alleen als je "Mijn keytags" openklapt
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
    const tagSvg = keytagSvg(t, on, 48); w.appendChild(tagSvg); if(on) ktKantel(w);
    // toetsenbord en schermlezer: een knop met een naam, Enter en Spatie werken als een tik
    w.setAttribute("role", "button"); w.setAttribute("aria-label", tagSvg.getAttribute("aria-label")); tagSvg.setAttribute("aria-hidden", "true");
    w.addEventListener("keydown", ev => { if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); w.click(); } });
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
    nt.style.cssText = "margin-top:10px;font-size:calc(14px*var(--ts));color:var(--ink)"; nt.classList.add("ktnext");
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

// ---------- Jouw weg (beginscherm): je clean-tijd als kronkelend pad door een landschap ----------
// Alleen tonen: er wordt niets opgeslagen. Het pad begint vooraan (groot) en slingert naar de horizon.
// De laatst behaalde keytags staan als haltes in het landschap (dezelfde tekeningen als "Mijn keytags", keytagSvg),
// de lichtende bol is "jij", en de volgende keytag staat klein in de verte met een bordje "nog … dagen".
// Oudere keytags staan verder naar beneden langs hetzelfde pad: in het venster (eigen schuifgebied) veeg je omlaag
// tot aan je welkomstag. Het vegen doet de app zelf (wegVegenAan), het beginscherm schuift dan niet mee.
// Tikken op een behaalde keytag opent het mijlpaal-overzicht, op de komende toont hoeveel dagen nog.
// Het landschap past precies in de breedte van het scherm (geen zijwaarts scrollen) en wordt opnieuw getekend als die verandert.
const WEG_H = 380, WEG_HZ = 112, WEG_MAX = 3;
const WEG_DY = (WEG_H - 22 - WEG_HZ) * 1.4;   // hoe snel het pad vooraan (t = 0) naar beneden loopt; onder t = 0 gaat het zo recht door
let wegSig = "", wegHintWeg = false;
function wegPunt(t, W){
  if(t < 0){   // onder het landschap: het pad slingert in een gelijkmatige golf verder naar beneden
    return [W * .5 + W * .33 * Math.sin(t * Math.PI * 1.9 - 1.2), WEG_H - 22 - WEG_DY * t];
  }
  const y = WEG_H - 22 - (WEG_H - 22 - WEG_HZ) * (1 - Math.pow(1 - Math.min(1, t), 1.4));
  const x = W * .5 + W * .33 * (1 - .65 * t) * Math.sin(t * Math.PI * 1.9 - 1.2);
  return [x, y];
}
const wegKant = (t, W) => wegPunt(t, W)[0] < W / 2 ? -1 : 1;   // keytags aan de buitenkant van de bocht
const wegBreed = t => 22 * (1 - .8 * Math.max(0, t)) + 1.5;   // halve breedte van het pad: vooraan breed, in de verte smal
const wegSchaal = t => 1 - .55 * Math.max(0, t);
const wegBocht = n => (Math.PI / 2 + n * Math.PI + 1.2) / (1.9 * Math.PI);   // diepte t van de n-de bocht (n = -2, -3, … liggen onder het landschap)
function wegLint(a, b, W){   // het pad als vlak tussen diepte a en b (linker- en rechterrand)
  const L = [], R = [], n = Math.max(2, Math.round((b - a) * 60));
  for(let i = 0; i <= n; i++){
    const t = a + (b - a) * i / n, [x, y] = wegPunt(t, W), [x2, y2] = wegPunt(t + .002, W);
    let dx = x2 - x, dy = y2 - y; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = wegBreed(t);
    L.push((x - dy * w).toFixed(1) + " " + (y + dx * w).toFixed(1)); R.unshift((x + dy * w).toFixed(1) + " " + (y - dx * w).toFixed(1));
  }
  return "M" + L.join(" L") + " L" + R.join(" L") + "Z";
}
function wegLijn(a, b, W){
  const p = [], n = Math.max(2, Math.round((b - a) * 60));
  for(let i = 0; i <= n; i++){ const [x, y] = wegPunt(a + (b - a) * i / n, W); p.push(x.toFixed(1) + " " + y.toFixed(1)); }
  return "M" + p.join(" L");
}
function wegHeuvel(W, y0, amp, f, fase, H){   // een heuvelrug van links naar rechts, naar beneden opgevuld (tot H)
  let d = "M0 " + H;
  for(let x = 0; x <= W + 8; x += 8) d += " L" + x + " " + (y0 + amp * Math.sin(x / W * Math.PI * f + fase)).toFixed(1);
  return d + " L" + W + " " + H + "Z";
}
// ---- mijlpaal-show: tik op een behaalde keytag op Jouw weg ----
// 1. wegViering: een komeet loopt over je gelopen pad (van je begin tot de mijlpaal), keytags onderweg lichten op, schokgolf bij aankomst
// 2. ktVlucht: scherm wordt donker, de keytag vliegt draaiend naar het midden; flits, draaiende lichtstralen, confetti en schokgolven;
//    dan verschijnt de mijlpaalpagina en zweeft de keytag naar zijn plek. Alles getekend op één canvas (ktShow).
// Bij "minder beweging" (KT_RUSTIG) gebeurt niets hiervan: dan meteen de mijlpaalpagina.
let wegBezig = false, ktShowNu = null;
const ktRgb = kleur => {
  let k = String(kleur || "").trim();
  if(k.indexOf("var(") === 0) k = getComputedStyle(document.documentElement).getPropertyValue(k.slice(4, -1)).trim() || "#2f6f62";
  if(/^#[0-9a-f]{3}$/i.test(k)) k = "#" + k.slice(1).split("").map(c => c + c).join("");
  return /^#[0-9a-f]{6}$/i.test(k) ? [1, 3, 5].map(i => parseInt(k.slice(i, i + 2), 16)) : [255, 255, 255];
};
const ktRgba = (rgb, a) => "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + Math.max(0, Math.min(1, a)).toFixed(3) + ")";
// kleuren voor de confetti: de keytag zelf (witte/lichte keytags: de themakleur), plus goud en wit
const ktFeestKleuren = c => { const eigen = c === "#ffffff" || c === "#EEF2E6" ? ktRgb("var(--accent)") : ktRgb(c); return [eigen, eigen, [244, 213, 141], [255, 255, 255], eigen.map(v => Math.min(255, v + 70))]; };
// één canvas over het hele scherm met deeltjes, schokgolven, lichtstralen, flits en verduistering
function ktShow(){
  if(ktShowNu) return ktShowNu;
  const c = document.createElement("canvas"); c.className = "ktshow"; c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  const ctx = c.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
  const maat = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  maat(); window.addEventListener("resize", maat);
  const S = {deeltjes: [], ringen: [], stralen: null, flits: 0, dim: 0, dimDoel: 0, vast: 0};
  // gloeiende stip en ster één keer per kleur als plaatje maken (gloed per beeldje uitrekenen is te zwaar voor een telefoon)
  const sprites = {};
  const sprite = (vorm, rgb) => {
    const k = vorm + rgb.join(","); if(sprites[k]) return sprites[k];
    const z = 64, o = document.createElement("canvas"); o.width = o.height = z; const g = o.getContext("2d"), m = z / 2;
    const gl = g.createRadialGradient(m, m, 0, m, m, m); gl.addColorStop(0, ktRgba(rgb, .9)); gl.addColorStop(.25, ktRgba(rgb, .45)); gl.addColorStop(1, ktRgba(rgb, 0));
    g.fillStyle = gl; g.fillRect(0, 0, z, z);
    g.fillStyle = "rgba(255,255,255,.95)";
    if(vorm === "ster"){ g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 6 : 15; g.lineTo(m + Math.cos(a) * rr, m + Math.sin(a) * rr); } g.closePath(); g.fillStyle = ktRgba(rgb.map(v => Math.min(255, v + 90)), 1); g.fill(); }
    else { g.beginPath(); g.arc(m, m, 5, 0, Math.PI * 2); g.fill(); }
    return (sprites[k] = o);
  };
  // lichtstralen: één keer tekenen, daarna alleen draaien
  const stralenBeeld = rgb => {
    const R = Math.ceil(Math.hypot(innerWidth, innerHeight) * .75), o = document.createElement("canvas"); o.width = o.height = R * 2; const g = o.getContext("2d");
    g.translate(R, R);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, ktRgba(rgb, .75)); gr.addColorStop(.3, ktRgba(rgb, .28)); gr.addColorStop(1, ktRgba(rgb, 0));
    g.fillStyle = gr;
    for(let i = 0; i < 18; i++){ const a = i * Math.PI * 2 / 18; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, a, a + Math.PI / 28); g.closePath(); g.fill(); }
    const k = g.createRadialGradient(0, 0, 0, 0, 0, 160); k.addColorStop(0, "rgba(255,255,255,.6)"); k.addColorStop(.4, ktRgba(rgb, .4)); k.addColorStop(1, ktRgba(rgb, 0));
    g.fillStyle = k; g.beginPath(); g.arc(0, 0, 160, 0, Math.PI * 2); g.fill();
    return {o, R};
  };
  let vorige = 0, loopt = false;
  const tik = nu => {
    const dt = Math.min(2.5, (nu - (vorige || nu)) / 16.7) || 1; vorige = nu;
    const W = innerWidth, H = innerHeight;
    ctx.clearRect(0, 0, W, H);
    S.dim += (S.dimDoel - S.dim) * Math.min(1, .09 * dt);
    if(S.dim > .004){ ctx.fillStyle = "rgba(3,6,18," + S.dim.toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }
    const st = S.stralen;
    if(st){
      st.rot += .0045 * dt; st.a += (st.doel - st.a) * Math.min(1, .08 * dt);
      if(st.a > .005){
        if(!st.beeld) st.beeld = stralenBeeld(st.rgb);
        ctx.save(); ctx.translate(st.x, st.y); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = Math.min(1, st.a);
        ctx.rotate(st.rot); ctx.drawImage(st.beeld.o, -st.beeld.R, -st.beeld.R);
        ctx.rotate(-st.rot * 2.6); ctx.globalAlpha = Math.min(1, st.a) * .45; ctx.scale(.7, .7); ctx.drawImage(st.beeld.o, -st.beeld.R, -st.beeld.R);
        ctx.restore();
      }
      if(st.doel === 0 && st.a < .005) S.stralen = null;
    }
    // schokgolven
    S.ringen = S.ringen.filter(r => r.a > .01);
    S.ringen.forEach(r => {
      if(r.wacht > 0){ r.wacht -= dt * 16.7; return; }
      r.r += r.v * dt; r.v *= Math.pow(.965, dt); r.a -= r.af * dt;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = ktRgba(r.rgb, r.a * .3); ctx.lineWidth = r.w * 4; ctx.stroke();
      ctx.strokeStyle = ktRgba(r.rgb, r.a); ctx.lineWidth = r.w * (.4 + r.a); ctx.stroke(); ctx.restore();
    });
    // deeltjes: stippen (gloed), sterren en confetti-strookjes
    S.deeltjes = S.deeltjes.filter(p => p.l > 0 && p.y < H + 40);
    S.deeltjes.forEach(p => {
      p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.l -= dt;
      const a = Math.min(1, p.l / (p.max * .35));
      if(p.vorm === "strook"){
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.rot * 2.2));
        ctx.fillStyle = ktRgba(p.rgb, a); ctx.fillRect(-p.m, -p.m * .45, p.m * 2, p.m * .9); ctx.restore();
      } else {
        const sp = sprite(p.vorm, p.rgb), z = p.m * (p.vorm === "ster" ? 4.2 : 5);
        ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a;
        if(p.vorm === "ster"){ ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(sp, -z / 2, -z / 2, z, z); ctx.restore(); }
        else ctx.drawImage(sp, p.x - z / 2, p.y - z / 2, z, z);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
      }
    });
    if(S.flits > .004){ ctx.fillStyle = "rgba(255,255,255," + S.flits.toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); S.flits *= Math.pow(.86, dt); }
    const bezig = S.vast > 0 || S.deeltjes.length || S.ringen.length || S.stralen || S.dim > .004 || S.dimDoel > 0 || S.flits > .004;
    if(bezig) requestAnimationFrame(tik);
    else { loopt = false; window.removeEventListener("resize", maat); c.remove(); if(ktShowNu === S) ktShowNu = null; }
  };
  S.start = () => { if(!loopt){ loopt = true; vorige = 0; requestAnimationFrame(tik); } };
  // uitbarsting: n deeltjes vanuit (x, y); kracht = snelheid; soorten = welke vormen
  S.knal = (x, y, kleuren, n, kracht, soorten, extra) => {
    for(let i = 0; i < n; i++){
      const hoek = Math.random() * Math.PI * 2, v = (.35 + Math.random() * .65) * kracht, vorm = soorten[i % soorten.length];
      S.deeltjes.push(Object.assign({x, y, vx: Math.cos(hoek) * v, vy: Math.sin(hoek) * v - kracht * .25, g: vorm === "strook" ? .16 : .09, drag: vorm === "strook" ? .975 : .955,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .3, m: vorm === "stip" ? 1.6 + Math.random() * 2.6 : vorm === "ster" ? 4 + Math.random() * 5 : 4 + Math.random() * 4,
        l: 0, max: 0, vorm, rgb: kleuren[i % kleuren.length]}, extra || {}));
      const p = S.deeltjes[S.deeltjes.length - 1]; p.max = p.l = (extra && extra.l) || 70 + Math.random() * 80;
    }
    S.start();
  };
  S.ring = (x, y, rgb, wacht, v, w) => { S.ringen.push({x, y, rgb, r: 8, v: v || 9, a: .95, af: .016, w: w || 5, wacht: wacht || 0}); S.start(); };
  ktShowNu = S;
  return S;
}
// midden van een element op het scherm
const ktMidden = n => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r]; };
function wegViering(svg, d, tag, kleur, verder){
  if(KT_RUSTIG() || !svg || !svg.animate || !svg.getScreenCTM){ verder(); return; }
  if(wegBezig) return; wegBezig = true;
  const show = ktShow(), kl = ktFeestKleuren(kleur), wit = [255, 255, 255];
  const spoor = svgEl("path", {class: "wegspoor", d, pathLength: "1"}), vonk = svgEl("circle", {class: "wegvonk", r: 7, cx: -99, cy: -99});
  svg.appendChild(spoor); svg.appendChild(vonk);
  const lang = spoor.getTotalLength(), duur = Math.max(650, Math.min(1100, lang * 1.7)), t0 = performance.now();
  spoor.animate([{strokeDashoffset: 1}, {strokeDashoffset: 0}], {duration: duur, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards"});
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  // keytags langs de weg (behaald) lichten op als de komeet erlangs komt
  const langs = [...document.querySelectorAll("#wegBaan .wegstop:not(.komt) .wegtag")].filter(n => n !== tag).map(n => ({n, geweest: false}));
  show.vast++;
  const vak = ($("wegScroll") || svg).getBoundingClientRect(), inBeeld = (x, y) => x >= vak.left && x <= vak.right && y >= vak.top && y <= vak.bottom;
  const stap = nu => {
    const x = Math.min(1, (nu - t0) / duur), p = spoor.getPointAtLength(lang * ease(x));
    vonk.setAttribute("cx", p.x.toFixed(1)); vonk.setAttribute("cy", p.y.toFixed(1));
    const m = svg.getScreenCTM(), sx = m.a * p.x + m.c * p.y + m.e, sy = m.b * p.x + m.d * p.y + m.f;
    if(inBeeld(sx, sy)) show.knal(sx, sy, [wit, kl[0], kl[2]], 3, 2.2, ["stip", "stip", "ster"], {g: -.015, drag: .93, l: 26 + Math.random() * 22});
    langs.forEach(o => {
      if(o.geweest) return; const [tx, ty] = ktMidden(o.n);
      if(Math.hypot(tx - sx, ty - sy) < 60){ o.geweest = true; o.n.animate([{transform: "scale(1)", filter: "brightness(1)"}, {transform: "scale(1.35) translateY(-5px)", filter: "brightness(1.6)"}, {transform: "scale(1)", filter: "brightness(1)"}], {duration: 520, easing: "ease-out"}); show.knal(tx, ty, [wit, kl[2]], 10, 4, ["ster", "stip"], {l: 40}); }
    });
    if(x < 1) return requestAnimationFrame(stap);
    // aangekomen: schokgolf, vonkenregen en de keytag springt op
    show.vast--;
    const [tx, ty] = tag ? ktMidden(tag) : [sx, sy];
    show.ring(tx, ty, kl[0], 0, 7, 4); show.ring(tx, ty, wit, 90, 5, 2.5);
    show.knal(tx, ty, kl, 26, 7, ["ster", "stip", "stip"], {l: 55});
    if(tag) tag.animate([{transform: "scale(1)"}, {transform: "scale(1.45) translateY(-8px) rotate(-8deg)"}, {transform: "scale(1.2) translateY(-4px) rotate(5deg)"}], {duration: 420, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "forwards"});
    [spoor, vonk].forEach(n => n.animate([{opacity: 1}, {opacity: 0}], {duration: 900, delay: 400, fill: "forwards"}).onfinish = () => n.remove());
    setTimeout(() => { wegBezig = false; verder(); if(tag) setTimeout(() => tag.getAnimations().forEach(a => a.cancel()), 1200); }, 380);
  };
  requestAnimationFrame(stap);
}
// de keytag vliegt van de weg (bron) via het midden van het scherm (de knal) naar de grote keytag op de mijlpaalpagina (doel).
// toonPagina() laat de mijlpaalpagina verschijnen, klaar() na de landing.
function ktVlucht(bron, doel, kleur, toonPagina, klaar){
  const a = bron.getBoundingClientRect();
  if(!a.width || !bron.animate){ toonPagina(); klaar(); return; }
  const show = ktShow(), kl = ktFeestKleuren(kleur), wit = [255, 255, 255], goud = [244, 213, 141];
  show.vast++;
  const kloon = bron.cloneNode(true);
  kloon.classList.remove("wegglow");
  // de kloon is net zo groot als in het midden (scherp), en wordt via scale kleiner getekend; s in tf() is t.o.v. de keytag op de weg
  const cx = innerWidth / 2, cy = innerHeight * .44, groot = Math.min(190, innerWidth * .46) / a.width;
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2, dx = cx - ax, dy = cy - ay, bw = a.width * groot * 1.25, bh = a.height * groot * 1.25;
  kloon.setAttribute("width", bw.toFixed(0)); kloon.setAttribute("height", bh.toFixed(0));
  kloon.style.cssText = "position:fixed;left:" + (ax - bw / 2) + "px;top:" + (ay - bh / 2) + "px;width:" + bw + "px;height:" + bh + "px;margin:0;z-index:430;pointer-events:none;animation:none;transform-origin:50% 50%";
  document.body.appendChild(kloon);
  doel.style.visibility = "hidden"; bron.style.visibility = "hidden";
  const tf = (x, y, s, ry, r) => "perspective(800px) translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + (s / groot / 1.25).toFixed(4) + ") rotateY(" + ry + "deg) rotate(" + r + "deg)";
  show.dimDoel = .78;
  // vonkenspoor achter de vliegende keytag
  let spoorAan = true;
  const spoor = () => { if(!spoorAan) return; const [x, y] = ktMidden(kloon); show.knal(x, y, [wit, kl[0], goud], 4, 2.6, ["stip", "ster"], {g: .03, drag: .94, l: 30 + Math.random() * 25}); requestAnimationFrame(spoor); };
  requestAnimationFrame(spoor);
  const omhoog = kloon.animate([
    {transform: tf(0, 0, 1.2, 0, 0)},
    {transform: tf(dx * .25, dy * .25 - 50, groot * .45, 300, -14), offset: .45},
    {transform: tf(dx * .85, dy * .85 - 20, groot * 1.15, 650, 8), offset: .82},
    {transform: tf(dx, dy, groot, 720, 0)}
  ], {duration: 950, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards"});
  omhoog.onfinish = () => {
    spoorAan = false;
    // de knal
    show.flits = .9;
    show.stralen = {x: cx, y: cy, rgb: kl[0], rot: 0, a: 0, doel: 1};
    show.knal(cx, cy, kl, 110, 17, ["strook", "strook", "ster", "stip"], {});
    show.knal(cx, cy, [wit, goud], 40, 9, ["stip", "ster"], {g: .05, l: 60});
    [0, 140, 300].forEach((w, i) => show.ring(cx, cy, i === 1 ? wit : kl[0], w, 12 - i * 2, 7 - i * 2));
    try{ if(navigator.vibrate) navigator.vibrate([35, 40, 90]); }catch(e){}
    kloon.style.filter = "drop-shadow(0 0 18px " + ktRgba(kl[0], .9) + ") drop-shadow(0 0 40px rgba(255,255,255,.5))";
    const hart = kloon.animate([
      {transform: tf(dx, dy, groot, 720, 0)},
      {transform: tf(dx, dy, groot * 1.22, 720, -5), offset: .18},
      {transform: tf(dx, dy, groot * .96, 720, 4), offset: .4},
      {transform: tf(dx, dy, groot * 1.06, 720, -2), offset: .62},
      {transform: tf(dx, dy, groot, 720, 0)}
    ], {duration: 900, easing: "ease-out", fill: "forwards"});
    // halverwege nog een kleinere knal met sterren
    setTimeout(() => show.knal(cx, cy, [goud, wit, kl[0]], 30, 11, ["ster"], {l: 70}), 420);
    hart.onfinish = () => {
      // de mijlpaalpagina verschijnt, de keytag zweeft naar zijn plek
      toonPagina();
      show.dimDoel = 0; show.stralen.doel = 0;
      requestAnimationFrame(() => {
        const b = doel.getBoundingClientRect(), ex = b.left + b.width / 2 - ax, ey = b.top + b.height / 2 - ay, es = b.width / a.width;
        const land = kloon.animate([
          {transform: tf(dx, dy, groot, 720, 0), filter: kloon.style.filter},
          {transform: tf(ex, ey - 14, es * 1.08, 720, 0), offset: .75},
          {transform: tf(ex, ey, es, 720, 0), filter: "drop-shadow(0 0 0 rgba(0,0,0,0))"}
        ], {duration: 700, easing: "cubic-bezier(.35,0,.15,1)", fill: "forwards"});
        land.onfinish = () => {
          doel.style.visibility = ""; bron.style.visibility = ""; kloon.remove();
          const [lx, ly] = ktMidden(doel);
          show.ring(lx, ly, kl[0], 0, 6, 3); show.knal(lx, ly, [wit, goud, kl[0]], 24, 6, ["ster", "stip"], {l: 50});
          show.vast--;
          klaar();
        };
      });
    };
  };
}
function renderWeg(){
  const box = $("weg"), baan = $("wegBaan"), rij = $("wegRij"), sc = $("wegScroll"); if(!box || !baan || !rij || !sc) return;
  const since = settings.since, tk = todayKey();
  const toon = !!since && tk >= since;
  rij.classList.toggle("hidden", !toon);
  if(!toon){ wegSig = ""; baan.innerHTML = ""; return; }
  const W = Math.round(rij.clientWidth); if(!W){ wegSig = ""; return; }   // scherm nog niet zichtbaar: later tekenen
  const list = keytagList(since).slice();
  if(!list.some(t => t.key > tk)){   // alle tags behaald (2 jaar of meer): de volgende zwarte keytag staat in de verte
    const last = list[list.length - 1], jr = (last.years || 2) + 1;
    list.push(Object.assign({}, last, {big: String(jr), label: jr + vt(" jaar", " years"), name: last.name, key: addMonthsKey(since, 12 * jr), years: jr}));
  }
  const d = daysClean(tk);
  const sig = [since, tk, isEn() ? "en" : "nl", list.length, list[list.length - 1].label, W].join("|");
  if(sig === wegSig) return;
  const eerste = wegSig === ""; wegSig = sig;
  baan.innerHTML = "";
  let L = -1; list.forEach((t, i) => { if(t.key <= tk) L = i; });
  const volg = list[L + 1];
  const behaald = list.slice(Math.max(0, L + 1 - WEG_MAX), L + 1);
  const ouder = list.slice(0, Math.max(0, L + 1 - WEG_MAX)).reverse();   // verder terug in de tijd = verder naar beneden
  const tOud = ouder.map((t, j) => wegBocht(-2 - j));
  const tEind = ouder.length ? tOud[tOud.length - 1] - .2 : -.2;   // het pad loopt nog even door en vervaagt onderaan
  const H = ouder.length ? Math.round(wegPunt(tEind, W)[1] + 10) : WEG_H;
  baan.style.width = W + "px"; baan.style.height = H + "px";
  rij.classList.toggle("lang", ouder.length > 0);
  const dagenTot = k => Math.round((parseKey(k) - parseKey(since)) / 864e5);
  const tLaatst = behaald.length > 1 ? .36 : .16, tVolg = .94;
  const tStop = i => behaald.length > 1 ? .04 + (tLaatst - .04) * i / (behaald.length - 1) : tLaatst;
  const a = dagenTot(list[L].key), b = dagenTot(volg.key);
  const tJij = tLaatst + (tVolg - tLaatst) * Math.max(.28, Math.min(.82, (dagenTot(tk) - a) / ((b - a) || 1)));   // nooit bovenop een keytag

  const svg = svgEl("svg", {class: "wegpad", viewBox: "0 0 " + W + " " + H, "aria-hidden": "true"});
  svg.appendChild(svgEl("path", {class: "wegheuvel h-ver", d: wegHeuvel(W, WEG_HZ - 14, 12, 2.6, .6, H)}));
  svg.appendChild(svgEl("path", {class: "wegheuvel h-mid", d: wegHeuvel(W, WEG_HZ + 54, 16, 1.7, 2.2, H)}));
  svg.appendChild(svgEl("path", {class: "wegheuvel h-voor", d: wegHeuvel(W, WEG_H - 70, 18, 1.3, 4, H)}));
  // boompjes aan de kant waar geen keytag staat, kleiner naarmate ze verder weg staan
  const boom = (bx, y, s) => {
    const r = 11 * s; if(bx < r || bx > W - r) return;
    svg.appendChild(svgEl("rect", {class: "wegstam", x: (bx - 1.2 * s).toFixed(1), y: (y - 8 * s).toFixed(1), width: (2.4 * s).toFixed(1), height: (8 * s).toFixed(1), rx: 1}));
    svg.appendChild(svgEl("ellipse", {class: "wegboom", cx: bx.toFixed(1), cy: (y - 8 * s - r * .9).toFixed(1), rx: (r * .8).toFixed(1), ry: r.toFixed(1)}));
  };
  [[.12, -1], [.3, 1], [.44, -1], [.66, 1], [.8, -1], [.97, 1.6]].forEach(([t, kant]) => {
    const [x, y] = wegPunt(t, W), s = wegSchaal(t), side = -wegKant(t, W) * kant;
    boom(x + side * (wegBreed(t) + 26 * s), y, s);
  });
  // langs het lagere stuk: een boompje in elke bocht, aan de buitenkant (de keytag staat binnen de bocht)
  tOud.forEach(t => { const [x, y] = wegPunt(t, W), k = x < W / 2 ? -1 : 1; boom(x + k * (wegBreed(t) + 14), y + 30, .9); });
  svg.appendChild(svgEl("path", {class: "weglint komt", d: wegLint(tJij, 1, W)}));
  svg.appendChild(svgEl("path", {class: "weglint", d: wegLint(tEind, tJij, W)}));
  svg.appendChild(svgEl("path", {class: "wegtoekomst", d: wegLijn(tJij, tVolg, W)}));
  if(ouder.length) svg.appendChild(svgEl("path", {class: "weggelopen", d: wegLijn(tEind, -.2, W)}));
  svg.appendChild(svgEl("path", {class: "weggelopen" + (eerste ? " tekent" : ""), d: wegLijn(-.2, tJij, W), pathLength: "1"}));
  baan.appendChild(svg);

  const halte = (t, tag, on, i, binnen) => {
    const [x, y] = wegPunt(t, W), s = Math.max(.62, wegSchaal(t));
    // binnen = in de holte van de bocht, iets lager en verder van het pad, zodat de keytag niet op de weg hangt
    const side = wegKant(t, W) * (binnen ? -1 : 1), hx = Math.max(26, Math.min(W - 26, x + side * (wegBreed(t) + (binnen ? 56 : 16 * s))));
    const knop = el("button", "wegstop" + (on ? "" : " komt")); knop.type = "button";
    knop.style.left = hx.toFixed(1) + "px"; knop.style.top = (y + (binnen ? 34 : 0)).toFixed(1) + "px";
    const svgTag = keytagSvg(tag, on, Math.round(44 * s));
    knop.setAttribute("aria-label", svgTag.getAttribute("aria-label")); svgTag.setAttribute("aria-hidden", "true"); svgTag.classList.add("wegtag");
    if(on && tag.glow) svgTag.classList.add("wegglow");
    if(i % 2) svgTag.style.animationDelay = "-2.4s";
    knop.appendChild(svgTag); const paal = el("span", "wegpaal"); paal.style.height = Math.round(16 * s) + "px"; knop.appendChild(paal);
    knop.dataset.kant = side < 0 ? "l" : "r";
    return knop;
  };
  // tik op een behaalde keytag: een lichtje loopt over je weg van je begin tot deze mijlpaal, dan vliegt de keytag naar de mijlpaalpagina
  const tBegin = ouder.length ? tEind : -.2;
  const tikBehaald = (t, tH) => function(){
    if(t.key === since){ toast(vt("Welkom · je begon op ", "Welcome · you started on ") + shortDate(since)); return; }
    const key = t.years !== undefined ? addMonthsKey(since, 12 * t.years) : t.key, tag = this.querySelector(".wegtag");
    wegViering(svg, wegLijn(tBegin, tH, W), tag, t.c, () => openMijlpaal(key, tag));
  };
  behaald.forEach((t, i) => {
    const knop = halte(tStop(i), t, true, i);
    knop.onclick = tikBehaald(t, tStop(i));
    baan.appendChild(knop);
  });
  // oudere keytags langs het pad naar beneden, met naam en datum ernaast
  ouder.forEach((t, j) => {
    const knop = halte(tOud[j], t, true, j + 1, true);
    knop.classList.add("wegoud");
    const lab = el("span", "wegdatum"); lab.appendChild(el("b", null, t.key === since ? vt("Je begin", "Your start") : t.label)); lab.appendChild(el("span", null, shortDate(t.key)));
    knop.appendChild(lab);
    knop.setAttribute("aria-label", knop.getAttribute("aria-label") + " · " + shortDate(t.key));
    knop.onclick = tikBehaald(t, tOud[j]);
    baan.appendChild(knop);
  });
  const links = Math.round((parseKey(volg.key) - parseKey(tk)) / 864e5);
  const nogTekst = isEn() ? aantal(links, "", "", "day", "days") + " to go" : "nog " + links + (links === 1 ? " dag" : " dagen");
  const ver = halte(tVolg, volg, false, 1);
  const bord = el("span", "wegbord"); bord.appendChild(el("b", null, volg.label)); bord.appendChild(el("span", null, nogTekst));
  ver.insertBefore(bord, ver.firstChild);
  ver.setAttribute("aria-label", volg.name + " · " + volg.label + " · " + nogTekst);
  ver.onclick = () => toast(volg.name + " · " + volg.label + " · " + nogTekst + " (" + shortDate(volg.key) + ")");
  baan.appendChild(ver);

  const [jx, jy] = wegPunt(tJij, W);
  const jij = el("div", "wegjij" + (eerste ? " komt-aan" : "")); jij.style.left = jx.toFixed(1) + "px"; jij.style.top = jy.toFixed(1) + "px";
  jij.setAttribute("role", "img"); jij.setAttribute("aria-label", vt("Jij bent hier: dag ", "You are here: day ") + (d === null ? "" : d));
  const wie = el("span", "wegwie", vt("Jij · dag ", "You · day ") + (d === null ? "" : d));
  if(wegKant(tJij, W) > 0) wie.classList.add("links");   // het naamlabel aan de andere kant dan de keytags
  jij.appendChild(wie);
  jij.appendChild(el("span", "wegorb"));
  baan.appendChild(jij);

  // hint onderaan het venster: alleen als er iets te vegen valt, weg zodra je veegt
  const hint = $("wegHint");
  hint.textContent = vt("Veeg omlaag langs je weg", "Swipe down along your road");
  hint.classList.toggle("hidden", !ouder.length || wegHintWeg);
  wegMax = Math.max(0, H - (sc.clientHeight || WEG_H));
  wegStop(); wegZet(wegKlem(wegPos));
  wegVegenAan(sc);
}
// ander schermformaat (draaien, venster groter): het landschap opnieuw passend tekenen
let wegResizeT = null;
window.addEventListener("resize", () => { clearTimeout(wegResizeT); wegResizeT = setTimeout(() => { if($("wegRij") && $("wegRij").clientWidth) renderWeg(); }, 200); });
// Vegen door Jouw weg: de app volgt zelf je vinger (niet de browser), zodat het op iPhone, Android en computer hetzelfde werkt.
// Alleen de weg schuift; een veeg op de weg laat het beginscherm stilstaan. Loslaten met vaart schiet door en remt rustig af.
let wegPos = 0, wegMax = 0, wegVaart = null;
function wegZet(p){
  const baan = $("wegBaan"); if(!baan) return;
  wegPos = p; baan.style.transform = "translate3d(0," + (-p).toFixed(1) + "px,0)";
  if(p > 24 && !wegHintWeg){ wegHintWeg = true; const h = $("wegHint"); if(h) h.classList.add("hidden"); }
}
const wegKlem = p => Math.max(0, Math.min(wegMax, p));
function wegStop(){ if(wegVaart){ cancelAnimationFrame(wegVaart); wegVaart = null; } }
function wegTerug(){   // na overtrekken voorbij het begin of eind: zacht terugveren
  wegStop();
  const doel = wegKlem(wegPos); if(doel === wegPos) return;
  const stap = () => { const d = doel - wegPos; if(Math.abs(d) < .5){ wegZet(doel); wegVaart = null; return; } wegZet(wegPos + d * .2); wegVaart = requestAnimationFrame(stap); };
  wegVaart = requestAnimationFrame(stap);
}
function wegGlij(v){   // v in px per ms; afremmen tot stilstand
  wegStop();
  if(KT_RUSTIG()) return;
  let t0 = performance.now();
  const stap = now => {
    const dt = Math.min(40, now - t0); t0 = now;
    let p = wegPos + v * dt;
    if(p < 0 || p > wegMax){ wegZet(wegKlem(p)); wegVaart = null; return; }
    wegZet(p); v *= Math.pow(.995, dt);
    if(Math.abs(v) < .02){ wegVaart = null; return; }
    wegVaart = requestAnimationFrame(stap);
  };
  wegVaart = requestAnimationFrame(stap);
}
function wegVegenAan(sc){
  if(sc.dataset.veeg) return; sc.dataset.veeg = "1";
  const lang = () => $("wegRij").classList.contains("lang") && wegMax > 0;
  let y0 = 0, x0 = 0, p0 = 0, richting = "", sporen = [], bewogen = false;
  sc.addEventListener("touchstart", e => {
    if(!lang() || e.touches.length !== 1) return;
    wegStop();
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; p0 = wegPos; richting = ""; bewogen = false;
    sporen = [[performance.now(), y0]];
  }, {passive: true});
  sc.addEventListener("touchmove", e => {
    if(!lang() || e.touches.length !== 1) return;
    const y = e.touches[0].clientY, x = e.touches[0].clientX, dy = y - y0, dx = x - x0;
    if(!richting){ if(Math.abs(dy) < 5 && Math.abs(dx) < 5) return; richting = Math.abs(dy) >= Math.abs(dx) ? "v" : "h"; }
    if(richting !== "v") return;
    e.preventDefault();   // het beginscherm blijft staan
    bewogen = true;
    let p = p0 - dy;
    if(p < 0) p = p * .35; else if(p > wegMax) p = wegMax + (p - wegMax) * .35;   // voorbij het eind: een beetje meegeven
    wegZet(p);
    const nu = performance.now(); sporen.push([nu, y]); while(sporen.length > 2 && nu - sporen[0][0] > 100) sporen.shift();
  }, {passive: false});
  const los = () => {
    if(richting !== "v"){ richting = ""; return; }
    richting = "";
    if(wegPos < 0 || wegPos > wegMax){ wegTerug(); return; }
    const a = sporen[0], b = sporen[sporen.length - 1], dt = b[0] - a[0];
    const v = dt > 0 ? -(b[1] - a[1]) / dt : 0;
    if(Math.abs(v) > .1) wegGlij(v);
  };
  sc.addEventListener("touchend", los); sc.addEventListener("touchcancel", los);
  // na een veeg geen tik doorgeven aan een keytag
  sc.addEventListener("click", e => { if(bewogen){ e.stopPropagation(); e.preventDefault(); bewogen = false; } }, true);
  // muiswiel en touchpad op de computer
  sc.addEventListener("wheel", e => {
    if(!lang()) return;
    e.preventDefault(); wegStop();
    wegZet(wegKlem(wegPos + (e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY)));
  }, {passive: false});
  // toetsenbord: pijltjes, Page Up/Down, Home/End als het venster de focus heeft
  sc.addEventListener("keydown", e => {
    if(!lang()) return;
    const m = {ArrowDown: 60, ArrowUp: -60, PageDown: 300, PageUp: -300, Home: -1e6, End: 1e6}[e.key];
    if(m === undefined) return;
    e.preventDefault(); wegStop(); wegZet(wegKlem(wegPos + m));
  });
}
