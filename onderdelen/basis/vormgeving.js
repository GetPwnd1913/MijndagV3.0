// ---------- vormgeving: iconen, meldingen, bevestiging, lege schermen ----------
const ICONS = {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>', chevR: '<path d="M9 6l6 6-6 6"/>', chevD: '<path d="M6 9l6 6 6-6"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.6 13.4 7 21l5-2.8 5 2.8-1.6-7.6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  book: '<path d="M3 6.5h6a3 3 0 0 1 3 3V20a2.2 2.2 0 0 0-2.2-2.2H3z"/><path d="M21 6.5h-6a3 3 0 0 0-3 3V20a2.2 2.2 0 0 1 2.2-2.2H21z"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
};
function icon(name, size, filled){
  const NS = "http://www.w3.org/2000/svg", sv = document.createElementNS(NS, "svg");
  sv.setAttribute("viewBox", "0 0 24 24"); sv.setAttribute("class", "i"); sv.setAttribute("aria-hidden", "true");
  if(size){ sv.style.width = size + "px"; sv.style.height = size + "px"; }
  sv.innerHTML = ICONS[name] || "";
  if(filled) sv.style.fill = "currentColor";
  return sv;
}
let toastTimer = null;
function showOpenQuestions(open){
  const nums = open.map(o => o.i + 1);
  const lijst = nums.length === 1 ? vt("vraag ", "question ") + nums[0] : vt("vraag ", "questions ") + nums.slice(0, -1).join(", ") + vt(" en ", " and ") + nums[nums.length - 1];
  const q1 = open.length === 1 && open[0].q.type === "free" && ((entry.answers[open[0].q.id] || {}).text || "").trim();
  toast(q1 ? vt("Bijna klaar! Vink vraag 1 nog af, dan kun je afronden.", "Almost done! Tick off question 1 and then you can finish.")
           : vt("Vul eerst alle vragen in voordat je afrondt. ", "Answer all the questions before you finish. ") + (nums.length > 5 ? vt("Er staan nog " + nums.length + " vragen open.", nums.length + " questions are still open.") : vt("Nog open: ", "Still open: ") + lijst + "."), true);
  open.forEach(o => {
    const c = document.querySelector('[data-q="' + o.q.id + '"]'); if(!c) return;
    setFold(c, o.q, false);
    c.classList.remove("needfill"); void c.offsetWidth; c.classList.add("needfill");
    setTimeout(() => c.classList.remove("needfill"), 2600);
  });
  const first = document.querySelector('[data-q="' + open[0].q.id + '"]');
  if(first) first.scrollIntoView({block: "center", behavior: "smooth"});
}
function toast(text, warn){
  let t = $("toast");
  if(!t){ t = el("div"); t.id = "toast"; t.setAttribute("role", "status"); t.setAttribute("aria-live", "polite"); document.body.appendChild(t); }
  t.innerHTML = ""; t.appendChild(icon(warn ? "info" : "check")); t.appendChild(el("span", null, text));
  t.classList.toggle("warn", !!warn);
  void t.offsetWidth; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), warn ? 4200 : 2600);
}
function confirmDialog(title, text, okLabel, calm){
  return new Promise(resolve => {
    const back = el("div", "dlgback"); back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true");
    const d = el("div", "dlg");
    d.appendChild(el("h3", null, title));
    if(text) d.appendChild(el("p", null, text));
    const row = el("div", "row");
    const no = el("button", "ghost", vt("Annuleren", "Cancel")); no.type = "button";
    const yes = el("button", calm ? "primary" : "danger", okLabel || vt("Wissen", "Delete")); yes.type = "button";
    const done = v => { back.classList.remove("show"); setTimeout(() => back.remove(), 200); document.removeEventListener("keydown", onKey); resolve(v); };
    const onKey = e => { if(e.key === "Escape") done(false); };
    no.onclick = () => done(false); yes.onclick = () => done(true);
    back.onclick = e => { if(e.target === back) done(false); };
    document.addEventListener("keydown", onKey);
    row.appendChild(no); row.appendChild(yes); d.appendChild(row); back.appendChild(d);
    document.body.appendChild(back);
    requestAnimationFrame(() => { back.classList.add("show"); no.focus(); });
  });
}
function emptyState(ic, title, text){
  const w = el("div", "card emptystate");
  const c = el("div", "eic"); c.appendChild(icon(ic)); w.appendChild(c);
  w.appendChild(el("div", "et", title));
  if(text) w.appendChild(el("div", "es", text));
  return w;
}

// ---------- openingsscherm ----------
function showSplash(){
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const h = new Date().getHours(), night = h < 6 || h >= 18;
  const NS = "http://www.w3.org/2000/svg";
  const sp = el("div"); sp.id = "splash"; sp.setAttribute("aria-hidden", "true");
  const sv = document.createElementNS(NS, "svg"); sv.setAttribute("viewBox", "0 0 512 512");
  const mk = (parent, tag, a) => { const n = document.createElementNS(NS, tag); Object.keys(a).forEach(k => n.setAttribute(k, a[k])); parent.appendChild(n); return n; };
  const sun = mk(sv, "g", {class: "sun"});
  if(night){
    mk(sun, "path", {d: "M276 104a52 52 0 1 0 30 92a42 42 0 0 1-30-92z", fill: "#f4b45f"});
    [[338, 96, 6], [372, 150, 4.5], [182, 108, 5], [150, 168, 3.5]].forEach(([x, y, r], i) => { const c = mk(sun, "circle", {cx: x, cy: y, r, fill: "#f4b45f", class: "ray"}); c.style.animationDelay = (0.95 + i * 0.12) + "s"; });
  } else {
    mk(sun, "circle", {cx: 256, cy: 150, r: 34, fill: "#f4b45f"});
    for(let i = 0; i < 8; i++){ const a = i * Math.PI / 4; const l = mk(sun, "line", {x1: (256 + 52 * Math.cos(a)).toFixed(1), y1: (150 + 52 * Math.sin(a)).toFixed(1), x2: (256 + 74 * Math.cos(a)).toFixed(1), y2: (150 + 74 * Math.sin(a)).toFixed(1), stroke: "#f4b45f", "stroke-width": 14, "stroke-linecap": "round", class: "ray"}); l.style.animationDelay = (0.9 + i * 0.06) + "s"; }
  }
  const bk = mk(sv, "g", {class: "book", fill: "none", stroke: "#fff", "stroke-width": 24, "stroke-linecap": "round", "stroke-linejoin": "round"});
  mk(bk, "path", {d: "M90 250h96a70 70 0 0 1 70 70v130a44 44 0 0 0-44-44H90z"});
  mk(bk, "path", {d: "M422 250h-96a70 70 0 0 0-70 70v130a44 44 0 0 1 44-44h122z"});
  sp.appendChild(sv);
  sp.appendChild(el("div", "nm", vt("Mijn dag", "My day")));
  const close = () => { if(sp.classList.contains("out")) return; sp.classList.add("out"); setTimeout(() => sp.remove(), 600); };
  sp.onclick = close;
  document.body.appendChild(sp);
  setTimeout(close, 2300);
}

// ---------- kleine animaties ----------
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest(".chip,.scale button,.score button,button.primary,button.ghost,.star,.daytabs button,.iconbtn");
  if(!b) return;
  b.classList.remove("tap"); void b.offsetWidth; b.classList.add("tap");
  if(!b.matches(".star,.iconbtn") && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)){
    const R = b.getBoundingClientRect(), dd = Math.max(R.width, R.height), r = document.createElement("span");
    const x = e.clientX || (R.left + R.width / 2), y = e.clientY || (R.top + R.height / 2);
    r.className = "rip"; r.style.width = r.style.height = dd + "px"; r.style.left = (x - R.left - dd / 2) + "px"; r.style.top = (y - R.top - dd / 2) + "px";
    b.appendChild(r); setTimeout(() => r.remove(), 600);
  }
  setTimeout(() => b.classList.remove("tap"), 400);
}, true);
document.addEventListener("touchstart", () => {}, {passive: true});
function flyPlane(){
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const NS = "http://www.w3.org/2000/svg", sv = document.createElementNS(NS, "svg");
  sv.setAttribute("viewBox", "0 0 48 48"); sv.setAttribute("class", "plane"); sv.setAttribute("aria-hidden", "true");
  const mk = (d, fill) => { const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("fill", fill); p.setAttribute("stroke", "var(--accent)"); p.setAttribute("stroke-width", "1.4"); p.setAttribute("stroke-linejoin", "round"); sv.appendChild(p); };
  mk("M4 22 L44 6 L30 42 L22 28 Z", "#ffffff");
  mk("M22 28 L44 6 L26 34 Z", "#dfe6e4");
  mk("M22 28 L26 34 L20 38 Z", "#c9d3d0");
  document.body.appendChild(sv);
  setTimeout(() => sv.remove(), 1800);
}
window.__flyPlane = flyPlane;
