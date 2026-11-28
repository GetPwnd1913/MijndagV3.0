// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- levende lucht (#hemel in index.html) ----------
// - Wolken in drie lagen (ver, midden, dichtbij), elk met een eigen snelheid; kleur per moment van de dag (app.css, blok "Levende lucht").
// - 's Nachts: sterrenbeelden (Grote Beer, Cassiopeia, Orion) en af en toe een vallende ster.
// - Overdag: af en toe een groepje vogels.
// - Optioneel het echte weer (settings.weerLucht, standaard uit): regen, sneeuw, bewolking, mist of onweer.
//   Plek: de plaats bij Meetings (settings.meetPlek) of je locatie; weer van Open-Meteo, elk half uur opnieuw (eigen key, niet in de back-up).
// Alles staat stil bij "beweging verminderen" en als de app op de achtergrond staat.
const LUCHT_RUSTIG = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
const luchtTod = () => document.documentElement.getAttribute("data-tod") || "middag";
const luchtActief = () => !document.hidden && !LUCHT_RUSTIG();

// ---- wolken: vaste vormen (zelfde startwaarde = geen verspringen bij herladen) ----
(function luchtWolken(){
  const box = document.querySelector("#hemel .wolken"); if(!box) return;
  box.querySelectorAll(".wolk").forEach(w => w.remove());
  let z = 11; const r = () => (z = (z * 16807) % 2147483647) / 2147483647;
  // [laag, aantal, alleen bij bewolkt weer]
  [[1, 3, false], [2, 3, false], [3, 2, false], [2, 3, true], [3, 2, true]].forEach(([laag, n, extra]) => {
    for(let i = 0; i < n; i++){
      const w = document.createElement("div"); w.className = "wk l" + laag + (extra ? " extra" : "");
      const duur = laag === 1 ? 170 + r() * 60 : laag === 2 ? 115 + r() * 40 : 80 + r() * 25;
      w.style.setProperty("--y", Math.round((laag === 1 ? 30 : laag === 2 ? 70 : 120) + r() * (laag === 3 ? 160 : 130)) + "px");
      w.style.setProperty("--s", ((laag === 1 ? .38 : laag === 2 ? .55 : .75) * (.8 + r() * .4)).toFixed(2));
      w.style.animationDuration = duur.toFixed(0) + "s";
      w.style.animationDelay = (-r() * duur).toFixed(0) + "s";
      const vorm = document.createElement("div"); vorm.className = "wkvorm";
      const bollen = 4 + Math.floor(r() * 3);
      for(let b = 0; b < bollen; b++){
        const s = document.createElement("i"), midden = 1 - Math.abs(b - (bollen - 1) / 2) / bollen, d = 34 + midden * 52 + r() * 18, x = 18 + b * (140 / bollen) + r() * 10;
        s.style.cssText = "width:" + d.toFixed(0) + "px;height:" + d.toFixed(0) + "px;left:" + x.toFixed(0) + "px;bottom:" + (6 + r() * 14).toFixed(0) + "px";
        vorm.appendChild(s);
      }
      const voet = document.createElement("i"); voet.className = "wkvoet"; vorm.appendChild(voet);
      w.appendChild(vorm); box.appendChild(w);
    }
  });
})();

// ---- sterrenbeelden ----
(function luchtSterrenbeelden(){
  const box = document.getElementById("sterren"); if(!box) return;
  const beelden = [
    {p: [[38,70],[70,76],[98,90],[126,100],[140,134],[184,132],[190,98]], l: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},   // Grote Beer
    {p: [[262,44],[282,74],[306,58],[330,84],[354,60]], l: [[0,1],[1,2],[2,3],[3,4]]},                                         // Cassiopeia
    {p: [[276,168],[252,192],[302,188],[266,232],[277,236],[288,240],[246,284],[310,280]], l: [[0,1],[0,2],[1,3],[2,5],[3,4],[4,5],[3,6],[5,7]]}   // Orion
  ];
  let svg = '<svg class="sterrenbeeld" viewBox="0 0 400 320" preserveAspectRatio="xMidYMin slice" aria-hidden="true">';
  beelden.forEach((b, i) => {
    svg += '<g style="animation-delay:' + (-i * 3.5) + 's">';
    b.l.forEach(([a, c]) => { svg += '<line x1="' + b.p[a][0] + '" y1="' + b.p[a][1] + '" x2="' + b.p[c][0] + '" y2="' + b.p[c][1] + '"/>'; });
    b.p.forEach(([x, y]) => { svg += '<circle cx="' + x + '" cy="' + y + '" r="1.9"/>'; });
    svg += "</g>";
  });
  box.insertAdjacentHTML("beforeend", svg + "</svg>");
})();

// ---- vallende sterren ('s nachts) en vogels (overdag): af en toe, op een willekeurig moment ----
function luchtVallendeSter(){
  const box = document.getElementById("sterren"); if(!box || !box.animate) return;
  const s = document.createElement("i"); s.className = "vallster";
  s.style.left = (25 + Math.random() * 65) + "%"; s.style.top = (20 + Math.random() * 160) + "px";
  box.appendChild(s);
  const hoek = 24 + Math.random() * 18, afstand = 180 + Math.random() * 140, rad = hoek * Math.PI / 180;
  s.animate([
    {transform: "translate(0,0) rotate(" + hoek + "deg) scaleX(.2)", opacity: 0},
    {opacity: 1, offset: .15},
    {transform: "translate(" + (-Math.cos(rad) * afstand).toFixed(0) + "px," + (Math.sin(rad) * afstand).toFixed(0) + "px) rotate(" + hoek + "deg) scaleX(1)", opacity: 0}
  ], {duration: 1100 + Math.random() * 500, easing: "cubic-bezier(.3,.1,.6,1)"}).onfinish = () => s.remove();
}
function luchtVogels(){
  const hemel = document.getElementById("hemel"); if(!hemel || !hemel.animate) return;
  const g = document.createElement("div"); g.className = "vogels";
  const n = 2 + Math.floor(Math.random() * 3);
  for(let i = 0; i < n; i++){
    const v = document.createElement("i"); v.className = "vogel";
    v.style.left = (i * 22 + Math.random() * 10) + "px"; v.style.top = ((i % 2) * 12 + Math.random() * 8) + "px";
    v.style.animationDelay = (-Math.random()) + "s";
    v.innerHTML = '<svg viewBox="0 0 24 10"><path d="M1 6 Q6 1 12 6 Q18 1 23 6"/></svg>';
    g.appendChild(v);
  }
  const links = Math.random() < .5, y = 70 + Math.random() * 130;
  g.style.top = y + "px";
  hemel.appendChild(g);
  const van = links ? -120 : innerWidth + 40, naar = links ? innerWidth + 40 : -120;
  g.animate([{transform: "translate(" + van + "px,0)" + (links ? "" : " scaleX(-1)")}, {transform: "translate(" + ((van + naar) / 2) + "px,-18px)" + (links ? "" : " scaleX(-1)")}, {transform: "translate(" + naar + "px,6px)" + (links ? "" : " scaleX(-1)")}],
    {duration: 15000 + Math.random() * 6000, easing: "linear"}).onfinish = () => g.remove();
}
(function luchtMomenten(){
  const plan = () => setTimeout(() => {
    if(luchtActief()){
      const t = luchtTod(), weer = document.documentElement.getAttribute("data-weer") || "";
      const helder = !/regen|sneeuw|onweer|mist|bewolkt/.test(weer);
      if(t === "nacht" && helder) luchtVallendeSter();
      else if((t === "ochtend" || t === "middag") && Math.random() < .45 && !/regen|sneeuw|onweer/.test(weer)) luchtVogels();
    }
    plan();
  }, 9000 + Math.random() * 22000);
  plan();
})();

// ---- het echte weer (optioneel) ----
const WEER_KEY = "dagbeschouwing:weer";
function weerSoort(code){
  if(code == null) return "";
  if(code >= 95) return "onweer";
  if((code >= 71 && code <= 77) || code === 85 || code === 86) return "sneeuw";
  if((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "regen";
  if(code === 45 || code === 48) return "mist";
  if(code === 3) return "bewolkt";
  if(code === 2) return "halfbewolkt";
  return "helder";
}
function weerNeerslag(soort){
  const hemel = document.getElementById("hemel"); if(!hemel) return;
  let box = hemel.querySelector(".neerslag");
  if(!soort || (soort !== "regen" && soort !== "sneeuw" && soort !== "onweer")){ if(box) box.remove(); return; }
  if(box && box.dataset.soort === (soort === "sneeuw" ? "sneeuw" : "regen")) return;
  if(box) box.remove();
  box = document.createElement("div"); box.className = "neerslag"; box.dataset.soort = soort === "sneeuw" ? "sneeuw" : "regen";
  const n = soort === "sneeuw" ? 46 : 70;
  for(let i = 0; i < n; i++){
    const d = document.createElement("i"); d.className = soort === "sneeuw" ? "vlok" : "drup";
    d.style.left = (Math.random() * 104 - 2).toFixed(1) + "%";
    d.style.animationDuration = (soort === "sneeuw" ? 7 + Math.random() * 7 : .7 + Math.random() * .5).toFixed(2) + "s";
    d.style.animationDelay = (-Math.random() * 10).toFixed(2) + "s";
    if(soort === "sneeuw"){ const s = (3 + Math.random() * 4).toFixed(1); d.style.width = d.style.height = s + "px"; d.style.opacity = (.5 + Math.random() * .5).toFixed(2); }
    box.appendChild(d);
  }
  hemel.appendChild(box);
}
let weerFlitsT = null;
function weerFlits(){
  clearTimeout(weerFlitsT);
  if(document.documentElement.getAttribute("data-weer") !== "onweer") return;
  weerFlitsT = setTimeout(() => {
    const h = document.getElementById("hemel");
    if(h && h.animate && luchtActief()){
      const f = document.createElement("div"); f.className = "weerflits"; h.appendChild(f);
      f.animate([{opacity: 0}, {opacity: .7, offset: .08}, {opacity: .1, offset: .2}, {opacity: .55, offset: .3}, {opacity: 0}], {duration: 900}).onfinish = () => f.remove();
    }
    weerFlits();
  }, 8000 + Math.random() * 16000);
}
function weerZet(soort){
  const html = document.documentElement;
  if(soort) html.setAttribute("data-weer", soort); else html.removeAttribute("data-weer");
  weerNeerslag(soort); weerFlits();
}
function weerPlek(){
  const p = settings.meetPlek;
  if(p && isFinite(p.lat) && isFinite(p.lon)) return Promise.resolve({lat: p.lat, lon: p.lon});
  if(settings.weerPlek && isFinite(settings.weerPlek.lat)) return Promise.resolve(settings.weerPlek);
  if(!navigator.geolocation) return Promise.resolve(null);
  return new Promise(res => navigator.geolocation.getCurrentPosition(
    pos => { const pl = {lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2)}; settings.weerPlek = pl; saveSettingsNow(); res(pl); },
    () => res(null), {timeout: 15000, maximumAge: 36e5}));
}
async function luchtWeer(){
  if(typeof settings === "undefined" || !settings.weerLucht){ weerZet(""); return; }
  let oud = null; try{ oud = JSON.parse(localStorage.getItem(WEER_KEY) || "null"); }catch(e){}
  if(oud && Date.now() - oud.t < 30 * 60000){ weerZet(weerSoort(oud.code)); return; }
  try{
    const p = await weerPlek(); if(!p){ weerZet(""); return; }
    // afgerond op 2 decimalen (ongeveer 1 km): genoeg voor het weer, niet je precieze adres
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=" + (+p.lat).toFixed(2) + "&longitude=" + (+p.lon).toFixed(2) + "&current=weather_code&timezone=auto");
    const d = await r.json(), code = d && d.current ? d.current.weather_code : null;
    try{ localStorage.setItem(WEER_KEY, JSON.stringify({t: Date.now(), code})); }catch(e){}
    weerZet(weerSoort(code));
  }catch(e){ if(oud) weerZet(weerSoort(oud.code)); }
}
document.addEventListener("visibilitychange", () => { if(!document.hidden) luchtWeer(); });
setInterval(() => { if(!document.hidden) luchtWeer(); }, 30 * 60000);

// ---- diepte: de lagen van de lucht bewegen elk op hun eigen tempo mee met scrollen (en met de muis of het kantelen
// van een Android-telefoon). Waarden als CSS-variabelen op <html>: --sy (scroll), --mx/--my (-0,5 … 0,5). Zie app.css "Diepte".
(function luchtDiepte(){
  if(LUCHT_RUSTIG()) return;
  const html = document.documentElement; let wacht = false, mx = 0, my = 0;
  const zet = () => {
    wacht = false;
    html.style.setProperty("--sy", Math.min(window.scrollY || 0, 900).toFixed(0));
    html.style.setProperty("--mx", mx.toFixed(3)); html.style.setProperty("--my", my.toFixed(3));
  };
  const vraag = () => { if(!wacht){ wacht = true; requestAnimationFrame(zet); } };
  addEventListener("scroll", vraag, {passive: true});
  addEventListener("pointermove", e => { if(e.pointerType !== "mouse") return; mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; vraag(); }, {passive: true});
  addEventListener("deviceorientation", e => {
    if(e.gamma == null || e.beta == null) return;
    mx = Math.max(-.5, Math.min(.5, e.gamma / 60)); my = Math.max(-.5, Math.min(.5, (e.beta - 45) / 60)); vraag();
  }, {passive: true});
})();
