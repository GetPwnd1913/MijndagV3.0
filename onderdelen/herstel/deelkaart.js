// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- mijlpaal delen: een mooie kaart (1080 × 1920, formaat van een WhatsApp-status / Instagram-verhaal) ----------
// Knop "Deel je mijlpaal" op de mijlpaalpagina (mijlpaal.js). Eerst een voorbeeld; naam standaard UIT (anonimiteit);
// tekst eronder kiezen. Delen via het deelmenu (iPhone) of opslaan (computer). Er staat niets uit de dagbeschouwing op.
// Tekening: nachtlucht met melkweg en sterren, poollicht in de kleur van de keytag, lichtstralen, gloed, de keytag
// (keytagSvg uit keytags.js, letters erop in Figtree), fonkelingen, heuvels met een gouden rand, titel in Fraunces.
const DK_TEKSTEN = [["Alleen voor vandaag", "Just for today"], ["Het werkt als je eraan werkt", "It works if you work it"], ["Eén dag tegelijk", "One day at a time"], ["Ik ben trots op mezelf", "I am proud of myself"]];
let dkOpen = null;
const dkRgb = hex => { const h = hex.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const dkRgba = (rgb, a) => "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
// accentkleur van de kaart: de keytag zelf, behalve bij wit/licht/zwart/grijs (dan goud)
function dkAccent(tag){ const c = tag ? tag.c.toUpperCase() : ""; return !tag || ["#FFFFFF", "#EEF2E6", "#1B1B1B", "#7A7A78"].indexOf(c) >= 0 ? [245, 196, 92] : dkRgb(tag.c); }
function dkKeytagBeeld(tag){
  return new Promise(res => {
    if(!tag){ res(null); return; }
    const svg = keytagSvg(tag, true, 600);
    svg.querySelectorAll(".ktt").forEach(n => n.remove());
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const img = new Image();
    img.onload = () => res(img); img.onerror = () => res(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  });
}
// vierpuntige fonkeling
function dkFonkel(ctx, x, y, r, kleur, a){
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = kleur; ctx.shadowColor = kleur; ctx.shadowBlur = r * 2.2;
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  ctx.restore();
}
async function dkTeken(key, opt){
  const since = settings.since, s = mpSoort(since, key), tag = s ? mpKeytag(since, key, s) : null;
  const W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), acc = dkAccent(tag), licht = acc.map(v => Math.round(v * .45 + 255 * .55));   // licht: de kleur gemengd met warm wit, zodat ook rood en blauw stralen
  let z = 0; for(const ch of key) z = (z * 31 + ch.charCodeAt(0)) % 2147483647; z = z || 7;
  const r = () => (z = (z * 16807) % 2147483647) / 2147483647;
  try{ await Promise.all([document.fonts.load("600 120px Fraunces"), document.fonts.load("italic 400 60px Fraunces"), document.fonts.load("700 60px Figtree"), document.fonts.load("500 40px Figtree")]); }catch(e){}
  // 1. lucht
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#070b24"); g.addColorStop(.35, "#141a4a"); g.addColorStop(.62, "#3a2766"); g.addColorStop(.8, "#8a4a78"); g.addColorStop(.92, "#e8875e"); g.addColorStop(1, "#f6b26b");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 2. melkweg: zachte band schuin over de lucht
  ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(-.42);
  for(let i = 0; i < 26; i++){
    const x = (r() - .5) * 1700, y = (r() - .5) * 170, rr = 120 + r() * 220, mg = ctx.createRadialGradient(x, y, 0, x, y, rr);
    mg.addColorStop(0, "rgba(190,180,255," + (.05 + r() * .06).toFixed(3) + ")"); mg.addColorStop(1, "rgba(190,180,255,0)");
    ctx.fillStyle = mg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  for(let i = 0; i < 520; i++){ const x = (r() - .5) * 1800, y = (r() - .5) * 260 * (r() + .2); ctx.fillStyle = "rgba(255,255,255," + (.15 + r() * .55).toFixed(2) + ")"; ctx.fillRect(x, y, 1.6, 1.6); }
  ctx.restore();
  // 3. sterren
  for(let i = 0; i < 380; i++){
    const x = r() * W, y = r() * H * .72, big = r() > .93, rr = big ? 2.2 + r() * 1.6 : .8 + r() * 1.2;
    ctx.save(); ctx.globalAlpha = .35 + r() * .65; ctx.fillStyle = r() > .85 ? "#ffe9c4" : "#ffffff";
    if(big){ ctx.shadowColor = "#fff"; ctx.shadowBlur = 10; }
    ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  // 4. poollicht in de kleur van de keytag
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.filter = "blur(14px)";
  for(let b = 0; b < 3; b++){
    const basis = 300 + b * 90, amp = 70 + b * 25, fase = r() * 6;
    for(let x = -40; x < W + 40; x += 6){
      const y = basis + Math.sin(x / 210 + fase) * amp + Math.sin(x / 90 + fase * 2) * 18, h = 220 + Math.sin(x / 140 + b) * 90;
      const ag = ctx.createLinearGradient(0, y - h, 0, y + 30);
      ag.addColorStop(0, dkRgba(acc, 0)); ag.addColorStop(.75, dkRgba(acc, .11 - b * .025)); ag.addColorStop(1, dkRgba(acc, 0));
      ctx.fillStyle = ag; ctx.fillRect(x, y - h, 7, h + 30);
    }
  }
  ctx.filter = "none"; ctx.restore();
  // 5. lichtstralen en gloed achter de keytag
  const cx = W / 2, cy = 820;
  ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = "lighter";
  ctx.filter = "blur(10px)";
  for(let i = 0; i < 36; i++){
    const a = i * Math.PI * 2 / 36 + r() * .06, br = .018 + r() * .03, len = 700 + r() * 500;
    const sg = ctx.createRadialGradient(0, 0, 80, 0, 0, len); sg.addColorStop(0, dkRgba(licht, .2)); sg.addColorStop(.6, dkRgba(licht, .06)); sg.addColorStop(1, dkRgba(licht, 0));
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, len, a - br, a + br); ctx.closePath(); ctx.fill();
  }
  ctx.filter = "none";
  ctx.restore();
  const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 560);
  gl.addColorStop(0, "rgba(255,250,235,.7)"); gl.addColorStop(.22, dkRgba(licht, .5)); gl.addColorStop(.5, dkRgba(acc, .2)); gl.addColorStop(1, dkRgba(acc, 0));
  ctx.fillStyle = gl; ctx.fillRect(0, cy - 560, W, 1120);
  // ringen van licht
  ctx.save(); ctx.strokeStyle = "rgba(255,240,210,.18)";
  [330, 390, 470].forEach((rr, i) => { ctx.lineWidth = 2 - i * .5; ctx.setLineDash(i === 1 ? [4, 14] : []); ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke(); });
  ctx.restore();
  // 6. de keytag
  const img = await dkKeytagBeeld(tag), tw = 400, th = tw * 104 / 60;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.07);
  if(img){
    ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
    ctx.drawImage(img, -tw / 2, -th / 2, tw, th);
    ctx.shadowColor = "transparent";
    const sc = tw / 60, ox = -tw / 2, oy = -th / 2, bs = tag.big.length > 3 ? 11 : tag.big.length > 2 ? 16 : 19;
    ctx.fillStyle = tag.tc; ctx.textAlign = "center";
    ctx.font = "700 " + (bs * sc).toFixed(0) + "px Figtree, Arial, sans-serif"; ctx.fillText(tag.big, ox + 30 * sc, oy + (tag.small ? 70 : 72) * sc);
    if(tag.small){ ctx.font = "600 " + (9 * sc).toFixed(0) + "px Figtree, Arial, sans-serif"; ctx.fillText(tag.small, ox + 30 * sc, oy + 84 * sc); }
  } else {
    // mijlpaal zonder keytag (24 uur, 120 of 150 dagen): gouden penning
    const pg = ctx.createRadialGradient(-60, -60, 20, 0, 0, 230); pg.addColorStop(0, "#fff1c2"); pg.addColorStop(.5, "#f2c04d"); pg.addColorStop(1, "#b07a1c");
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, 210, 0, Math.PI * 2); ctx.fill(); ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.beginPath(); ctx.arc(0, 0, 180, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#6b4a10"; ctx.textAlign = "center"; ctx.font = "600 150px Fraunces, Georgia, serif";
    ctx.fillText(s && s.t === "d1" ? "24" : s ? s.t.slice(1) : "", 0, 40);
    ctx.font = "700 44px Figtree, Arial, sans-serif"; ctx.fillText(s && s.t === "d1" ? vt("uur", "hours") : vt("dagen", "days"), 0, 105);
  }
  ctx.restore();
  // 7. fonkelingen rond de keytag
  for(let i = 0; i < 26; i++){
    const a = r() * Math.PI * 2, d = 260 + r() * 300, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .9;
    if(y > 1130) continue;
    dkFonkel(ctx, x, y, 5 + r() * 16, r() > .5 ? "#fff6dc" : dkRgba(acc, 1), .55 + r() * .45);
  }
  // 8. heuvels met een gouden rand
  const heuvel = (y0, amp, kleur, rand, fase) => {
    ctx.beginPath(); ctx.moveTo(0, H);
    for(let x = 0; x <= W; x += 12) ctx.lineTo(x, y0 + Math.sin(x / 260 + fase) * amp + Math.sin(x / 110 + fase) * amp * .25);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = kleur; ctx.fill();
    if(rand){ ctx.save(); ctx.strokeStyle = rand; ctx.lineWidth = 3; ctx.shadowColor = rand; ctx.shadowBlur = 18; ctx.beginPath();
      for(let x = 0; x <= W; x += 12){ const y = y0 + Math.sin(x / 260 + fase) * amp + Math.sin(x / 110 + fase) * amp * .25; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore(); }
  };
  const hz = ctx.createRadialGradient(cx, 1640, 40, cx, 1640, 760);
  hz.addColorStop(0, "rgba(255,214,150,.75)"); hz.addColorStop(.35, "rgba(250,150,100,.35)"); hz.addColorStop(1, "rgba(250,150,100,0)");
  ctx.fillStyle = hz; ctx.fillRect(0, 900, W, 1020);
  heuvel(1575, 38, "rgba(80,44,84,.9)", "rgba(255,200,140,.7)", 1.2);
  heuvel(1665, 46, "#2e1d46", "rgba(255,175,115,.45)", 3.1);
  heuvel(1760, 32, "#1a1230", null, 5.2);
  // 9. teksten
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = "700 34px Figtree, Arial, sans-serif";
  if(ctx.letterSpacing !== undefined) ctx.letterSpacing = "6px";
  ctx.fillText(vt("MIJLPAAL", "MILESTONE"), cx, 190);
  if(ctx.letterSpacing !== undefined) ctx.letterSpacing = "0px";
  const titel = s ? mpTitel(s).replace(/!$/, "") : "";
  const m = /^(.*?)\s*(clean|nuchter)?$/i.exec(titel), hoofd = (m && m[1]) || titel;
  ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 24;
  ctx.fillStyle = "#ffffff"; let fs = 150; ctx.font = "600 " + fs + "px Fraunces, Georgia, serif";
  while(ctx.measureText(hoofd).width > W - 140 && fs > 80){ fs -= 6; ctx.font = "600 " + fs + "px Fraunces, Georgia, serif"; }
  ctx.fillText(hoofd, cx, 1300);
  const cl = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0); cl.addColorStop(0, "#ffe3a3"); cl.addColorStop(.5, "#fff6dc"); cl.addColorStop(1, "#ffd27a");
  ctx.fillStyle = cl; ctx.font = "italic 400 96px Fraunces, Georgia, serif"; ctx.fillText(vt("clean", "clean"), cx, 1405);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.font = "500 38px Figtree, Arial, sans-serif";
  const datum = parseKey(key).toLocaleDateString(locale(), {day: "numeric", month: "long", year: "numeric"});
  ctx.fillText((opt.naam && (settings.naam || "").trim() ? settings.naam.trim() + "  ·  " : "") + datum, cx, 1478);
  if(opt.tekst){
    ctx.fillStyle = "#fff4dc"; let ts = 58; ctx.font = "italic 400 " + ts + "px Fraunces, Georgia, serif";
    while(ctx.measureText("“" + opt.tekst + "”").width > W - 160 && ts > 34){ ts -= 4; ctx.font = "italic 400 " + ts + "px Fraunces, Georgia, serif"; }
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 16; ctx.fillText("“" + opt.tekst + "”", cx, 1745); ctx.shadowBlur = 0;
  }
  ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = "600 30px Figtree, Arial, sans-serif"; ctx.fillText(vt("Mijn dag", "My day"), cx, 1868);
  return cv;
}
// het venster: voorbeeld, naam aan/uit, tekst kiezen, delen
function openDeelkaart(key){
  if(dkOpen) dkOpen.remove();
  const back = el("div", "dkback"); dkOpen = back;
  back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-label", vt("Deel je mijlpaal", "Share your milestone"));
  const doos = el("div", "dkdoos"); back.appendChild(doos);
  const sluit = () => { back.classList.remove("show"); document.removeEventListener("keydown", onKey); setTimeout(() => { back.remove(); if(dkOpen === back) dkOpen = null; }, 250); };
  const onKey = e => { if(e.key === "Escape") sluit(); };
  document.addEventListener("keydown", onKey);
  back.onclick = e => { if(e.target === back) sluit(); };
  doos.appendChild(el("div", "dktitel", vt("Deel je mijlpaal", "Share your milestone")));
  const voorbeeld = el("div", "dkvoorbeeld"); const plaatje = el("img"); plaatje.alt = vt("Voorbeeld van je kaart", "Preview of your card"); voorbeeld.appendChild(plaatje);
  const laden = el("div", "dkladen", vt("Kaart maken…", "Making your card…")); voorbeeld.appendChild(laden);
  doos.appendChild(voorbeeld);
  const opt = {naam: false, tekst: vt(DK_TEKSTEN[0][0], DK_TEKSTEN[0][1])};
  let doek = null, teller = 0;
  const vernieuw = async () => {
    const nr = ++teller; laden.classList.remove("hidden");
    const c = await dkTeken(key, opt); if(nr !== teller) return;
    doek = c; plaatje.src = c.toDataURL("image/jpeg", .9); laden.classList.add("hidden");
  };
  // naam
  if((settings.naam || "").trim()){
    const nl = el("label", "schakel dkoptie"); const cb = el("input"); cb.type = "checkbox"; cb.checked = false;
    cb.onchange = () => { opt.naam = cb.checked; vernieuw(); };
    nl.appendChild(cb); nl.appendChild(el("span", null, vt("Mijn naam erop zetten", "Put my name on it"))); doos.appendChild(nl);
  }
  // tekst
  doos.appendChild(el("div", "label", vt("Tekst onderaan", "Text at the bottom")));
  const chips = el("div", "chips");
  const eigen = el("input"); eigen.className = "sosinp hidden"; eigen.maxLength = 48; eigen.placeholder = vt("Je eigen tekst", "Your own text");
  const kies = (b, tekst) => { [...chips.children].forEach(x => x.classList.remove("on")); b.classList.add("on"); opt.tekst = tekst; vernieuw(); };
  DK_TEKSTEN.forEach(([nl, en], i) => { const b = el("button", "chip" + (i === 0 ? " on" : ""), vt(nl, en)); b.type = "button"; b.onclick = () => { eigen.classList.add("hidden"); kies(b, vt(nl, en)); }; chips.appendChild(b); });
  const eb = el("button", "chip start", vt("+ Eigen tekst", "+ Own text")); eb.type = "button";
  eb.onclick = () => { eigen.classList.remove("hidden"); eigen.focus(); kies(eb, eigen.value.trim()); };
  const geenB = el("button", "chip", vt("Geen tekst", "No text")); geenB.type = "button"; geenB.onclick = () => { eigen.classList.add("hidden"); kies(geenB, ""); };
  chips.appendChild(eb); chips.appendChild(geenB); doos.appendChild(chips);
  let eigenT = null; eigen.oninput = () => { opt.tekst = eigen.value.trim(); clearTimeout(eigenT); eigenT = setTimeout(vernieuw, 450); };
  eigen.style.marginTop = "8px"; doos.appendChild(eigen);
  doos.appendChild(el("div", "note dkprivacy", vt("Op de kaart staat alleen je mijlpaal: niets uit je dagbeschouwing en geen logo.", "The card only shows your milestone: nothing from your daily reflection and no logo.")));
  const rij = el("div", "row"); rij.style.cssText = "margin-top:14px;gap:8px;justify-content:flex-end";
  const nee = el("button", "ghost", vt("Sluiten", "Close")); nee.type = "button"; nee.onclick = sluit;
  const deel = el("button", "primary", vt("Delen", "Share")); deel.type = "button";
  deel.onclick = async () => {
    if(!doek) return;
    const blob = await new Promise(res => doek.toBlob(res, "image/png"));
    const naam = vt("Mijlpaal ", "Milestone ") + key + ".png";
    try{
      const file = new File([blob], naam, {type: "image/png"});
      if(!(window.claude && window.claude.use) && navigator.canShare && navigator.share && navigator.canShare({files: [file]})) await navigator.share({files: [file]});
      else await offerFile(naam, blob, "image/png");
    }catch(e){ if(!(e && (e.name === "AbortError" || e.code === "declined"))) toast(vt("Delen lukte niet. Probeer het nog eens.", "Sharing did not work. Please try again."), true); }
  };
  rij.appendChild(nee); rij.appendChild(deel); doos.appendChild(rij);
  document.body.appendChild(back);
  requestAnimationFrame(() => back.classList.add("show"));
  vernieuw();
}
window.__deelkaart = (key, opt) => dkTeken(key, opt || {naam: false, tekst: vt(DK_TEKSTEN[0][0], DK_TEKSTEN[0][1])});
