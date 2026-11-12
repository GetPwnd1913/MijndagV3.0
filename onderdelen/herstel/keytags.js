// ---------- keytags ----------
const KT_BODY = "M20 34 H40 C50 34 55 48 56 64 C57 84 48 98 30 98 C12 98 3 84 4 64 C5 48 10 34 20 34 Z";
const KT_INNER = "M21 38 H39 C47 38 51 50 52 64 C53 81 45 94 30 94 C15 94 7 81 8 64 C9 50 13 38 21 38 Z";
const KT_CONF = ["#FF5A2E","#2FC94A","#1F3FA8","#F7D51D","#9E1B22","#E28BBB"];
const KT_SEEN = "dagbeschouwing:ktConfetti";
const SVGNS = "http://www.w3.org/2000/svg";

function keytagList(since){
  const yrs = (() => { let n = 0; while(addMonthsKey(since, 12 * (n + 1)) <= curKey) n++; return n; })();
  const multi = Math.max(2, yrs);
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
function keytagSvg(t, on, w){
  const light = t.c === "#ffffff" || t.c === "#EEF2E6";
  const fill = on ? t.c : "none", stroke = on ? (light ? "#B4B2A9" : "rgba(0,0,0,.25)") : "var(--muted)";
  const txt = on ? t.tc : "var(--muted)";
  const dash = on ? {} : {"stroke-dasharray": "3 3"};
  const s = svgEl("svg", {width: w, height: Math.round(w * 104 / 60), viewBox: "0 0 60 104", role: "img", "aria-label": t.label + (on ? ", behaald" : ", nog niet behaald")});
  s.appendChild(svgEl("circle", {cx: 30, cy: 11, r: 9, fill: "none", stroke: "#9a9a96", "stroke-width": 2.5}));
  s.appendChild(svgEl("rect", Object.assign({class: "ktb", x: 23, y: 18, width: 14, height: 20, rx: 4, fill, stroke}, dash)));
  s.appendChild(svgEl("circle", {cx: 30, cy: 24, r: 2.4, fill: "#b8a46a"}));
  s.appendChild(svgEl("path", Object.assign({class: "ktb", d: KT_BODY, fill, stroke}, dash)));
  if(on) s.appendChild(svgEl("path", {d: KT_INNER, fill: "none", stroke: t.tc, "stroke-opacity": .35, "stroke-dasharray": "2 2"}));
  const bs = t.big.length > 3 ? 11 : t.big.length > 2 ? 16 : 19;
  const b = svgEl("text", {class: "ktt", x: 30, y: t.small ? 70 : 72, "text-anchor": "middle", "font-size": bs, "font-weight": 600, fill: txt});
  b.textContent = t.big; s.appendChild(b);
  if(t.small){ const sm = svgEl("text", {class: "ktt", x: 30, y: 84, "text-anchor": "middle", "font-size": 9, fill: txt}); sm.textContent = t.small; s.appendChild(sm); }
  return s;
}

const KT_HOVER = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
let ktLastBurst = 0;
function ktConfetti(card, tagEl, auto){
  if(auto && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if(!card || !tagEl) return;
  const now = Date.now(); if(now - ktLastBurst < 400) return; ktLastBurst = now;
  const cr = card.getBoundingClientRect(), r = tagEl.getBoundingClientRect();
  const ox = r.left - cr.left + r.width / 2, oy = r.top - cr.top + 30;
  for(let i = 0; i < 34; i++){
    const p = el("div", "ktcf"); p.style.background = KT_CONF[i % KT_CONF.length];
    p.style.left = ox + "px"; p.style.top = oy + "px";
    p.style.webkitTransform = p.style.transform = "translate3d(0,0,0) rotate(0deg)"; p.style.opacity = "1";
    card.appendChild(p);
    const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 70, dx = Math.cos(a) * v, dy = Math.sin(a) * v - 50, rot = Math.random() * 720;
    const dur = 1300 + Math.random() * 500;
    void p.offsetWidth;
    p.style.transition = "transform " + dur + "ms cubic-bezier(.2,.7,.4,1), opacity " + dur + "ms ease-in";
    requestAnimationFrame(() => {
      p.style.webkitTransform = p.style.transform = "translate3d(" + dx.toFixed(1) + "px," + (dy + 120).toFixed(1) + "px,0) rotate(" + rot.toFixed(0) + "deg)";
      p.style.opacity = "0";
    });
    setTimeout(() => p.remove(), dur + 150);
  }
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
  const h = el("div", "qtitle ktti", "Mijn keytags"); head.appendChild(h);
  head.appendChild(el("div", "note", d + (d === 1 ? " dag" : " dagen") + " clean")).style.margin = "0";
  card.appendChild(head);
  const sub = note(done.length + " van " + list.length + " behaald" + (last ? " · laatst: " + last.label : "")); sub.style.marginTop = "2px"; card.appendChild(sub);

  const row = el("div", "ktrow");
  const info = note(""); info.style.cssText = "margin-top:8px;text-align:center;min-height:18px";
  let glowEl = null, lastEl = null;
  const setGlow = on => { if(!glowEl) return; glowEl.classList.toggle("glow", on); card.classList.toggle("ktdark", on); };
  list.forEach(t => {
    const on = t.key <= curKey;
    const w = el("div", "kt"); w.tabIndex = 0;
    w.appendChild(keytagSvg(t, on, 48));
    w.onclick = () => {
      info.textContent = on ? t.name + " · " + t.label + " · behaald op " + shortDate(t.key)
        : t.name + " · " + t.label + " · nog " + Math.round((parseKey(t.key) - parseKey(curKey)) / 864e5) + " dagen (" + shortDate(t.key) + ")";
    };
    if(on && t.glow){
      glowEl = w;
      if(KT_HOVER){ w.addEventListener("mouseenter", () => setGlow(true)); w.addEventListener("mouseleave", () => setGlow(false)); }
      w.addEventListener("click", () => setGlow(KT_HOVER ? true : !w.classList.contains("glow")));
    }
    if(on && t === last){
      lastEl = w;
      if(KT_HOVER) w.addEventListener("mouseenter", () => ktConfetti(card, w));
      w.addEventListener("click", () => ktConfetti(card, w));
    }
    row.appendChild(w);
  });
  card.appendChild(row);
  card.appendChild(info);

  const next = list.find(t => t.key > curKey) || (last && last.years >= 2 ? {name: "Zwart", nx: "zwarte keytag", label: (last.years + 1) + " jaar", key: addMonthsKey(since, 12 * (last.years + 1))} : null);
  if(next){
    const left = Math.round((parseKey(next.key) - parseKey(curKey)) / 864e5);
    const prevKey = last ? last.key : since;
    const span = Math.round((parseKey(next.key) - parseKey(prevKey)) / 864e5) || 1;
    const nt = note("Volgende: " + next.nx + " · " + next.label + ", nog " + left + (left === 1 ? " dag" : " dagen"));
    nt.style.cssText = "margin-top:10px;font-size:14px;color:var(--ink)"; nt.classList.add("ktnext");
    card.appendChild(nt);
    const bar = el("div", "bar"); const bi = el("i"); bi.style.width = Math.max(2, Math.min(100, (1 - left / span) * 100)) + "%"; bar.appendChild(bi); card.appendChild(bar);
  }

  // nieuwe keytag op deze dag: groot in het feestkaartje + één keer confetti (vandaag)
  if(last && last.key === curKey && cel){
    cel.appendChild(keytagSvg(last, true, 72));
    const emo = $("msCelEmoji"); if(emo) emo.classList.add("hidden");
    if(curKey === todayKey()){
      let seen = ""; try{ seen = localStorage.getItem(KT_SEEN) || ""; }catch(e){}
      if(seen !== curKey){
        try{ localStorage.setItem(KT_SEEN, curKey); }catch(e){}
        setTimeout(() => ktConfetti(card, lastEl, true), 500);
      }
    }
  } else { const emo = $("msCelEmoji"); if(emo) emo.classList.remove("hidden"); }
}
