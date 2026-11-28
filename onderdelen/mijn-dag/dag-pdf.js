// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- PDF file ----------
const HELV=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,761,556,500,222,556,333,1000,556,556,333,1000,667,333,1000,500,611,500,500,222,222,333,333,350,556,1000,333,1000,500,333,944,500,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const HELVB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,761,556,500,278,556,500,1000,556,556,333,1000,667,333,1000,500,611,500,500,278,278,500,500,350,556,1000,333,1000,556,333,944,500,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];
const CP_EXTRA = {"€":128,"‚":130,"ƒ":131,"„":132,"…":133,"†":134,"‡":135,"ˆ":136,"‰":137,"Š":138,"‹":139,"Œ":140,"Ž":142,"‘":145,"’":146,"“":147,"”":148,"•":149,"–":150,"—":151,"˜":152,"™":153,"š":154,"›":155,"œ":156,"ž":158,"Ÿ":159};
function cp1252(s){
  let out = "";
  for(const ch of String(s).normalize("NFC")){
    const c = ch.codePointAt(0);
    if(c === 9) out += " ";
    else if((c >= 32 && c < 127) || (c >= 160 && c < 256)) out += String.fromCharCode(c);
    else if(CP_EXTRA[ch]) out += String.fromCharCode(CP_EXTRA[ch]);
    else if(c === 0x2010 || c === 0x2011) out += "-";
    else if(c > 0xFFFF || (c >= 0x2600 && c < 0x2800)) out += "";
    else out += "?";
  }
  return out;
}
function textW(bin, size, bold){
  const t = bold ? HELVB : HELV; let w = 0;
  for(let i=0;i<bin.length;i++){ const c = bin.charCodeAt(i); w += (c>=32 && c<256) ? t[c-32] : 500; }
  return w * size / 1000;
}
function wrap(text, size, bold, maxW){
  const out = [];
  String(text).split("\n").forEach(par => {
    const words = cp1252(par).split(" ");
    let line = "";
    words.forEach(wd => {
      const cand = line ? line + " " + wd : wd;
      if(textW(cand, size, bold) <= maxW || !line){
        if(!line && textW(wd, size, bold) > maxW){
          let piece = "";
          for(const ch of wd){ if(textW(piece+ch,size,bold) > maxW){ out.push(piece); piece = ch; } else piece += ch; }
          line = piece;
        } else line = cand;
      } else { out.push(line); line = wd; }
    });
    out.push(line);
  });
  return out;
}
const pesc = b => b.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
// logo (afgeronde tegel met zon en open boek) op positie lx/ltop, maat LS; ook gebruikt door de weekformulieren
function pdfLogo(ops, lx, ltop, LS, rrect, circle){
  const f = v => v.toFixed(2), TH = exportTheme();
  rrect(lx, ltop - LS, LS, LS, 11, TH.rgb.map(v => v * 0.82 + 0.18));
  const X = sx => lx + (sx - 40) / 432 * LS, Y = sy => ltop - (sy - 40) / 432 * LS, sc = LS / 432;
  circle(X(256), Y(128), 30 * sc, [0.957, 0.706, 0.373]);
  LOGO_RAYS.forEach(r => ops.push("0.957 0.706 0.373 RG " + f(13 * sc) + " w 1 J " + f(X(r[0])) + " " + f(Y(r[1])) + " m " + f(X(r[2])) + " " + f(Y(r[3])) + " l S"));
  const kq = 0.5523;
  const page = m => { const P = (a, b) => f(X(m ? 512 - a : a)) + " " + f(Y(b));
    return P(100,222)+" m "+P(192,222)+" l "+P(192+kq*64,222)+" "+P(256,286-kq*64)+" "+P(256,286)+" c "+P(256,422)+" l "+P(256,422-kq*40)+" "+P(216+kq*40,382)+" "+P(216,382)+" c "+P(100,382)+" l h S"; };
  ops.push("1 1 1 RG " + f(24 * sc) + " w 1 J 1 j " + page(false) + " " + page(true));
}
// afgeronde rechthoek en cirkel als PDF-opdracht (kleur als [r,g,b] van 0-1)
function pdfShapes(ops){
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const rrect = (x, yy, w, h, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + [f(x+rd)+" "+f(yy)+" m", f(x+w-rd)+" "+f(yy)+" l", f(x+w-rd+k)+" "+f(yy)+" "+f(x+w)+" "+f(yy+rd-k)+" "+f(x+w)+" "+f(yy+rd)+" c", f(x+w)+" "+f(yy+h-rd)+" l", f(x+w)+" "+f(yy+h-rd+k)+" "+f(x+w-rd+k)+" "+f(yy+h)+" "+f(x+w-rd)+" "+f(yy+h)+" c", f(x+rd)+" "+f(yy+h)+" l", f(x+rd-k)+" "+f(yy+h)+" "+f(x)+" "+f(yy+h-rd+k)+" "+f(x)+" "+f(yy+h-rd)+" c", f(x)+" "+f(yy+rd)+" l", f(x)+" "+f(yy+rd-k)+" "+f(x+rd-k)+" "+f(yy)+" "+f(x+rd)+" "+f(yy)+" c"].join(" ") + " f"); };
  const circle = (cx, cy, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + f(cx+rd)+" "+f(cy)+" m "+f(cx+rd)+" "+f(cy+k)+" "+f(cx+k)+" "+f(cy+rd)+" "+f(cx)+" "+f(cy+rd)+" c "+f(cx-k)+" "+f(cy+rd)+" "+f(cx-rd)+" "+f(cy+k)+" "+f(cx-rd)+" "+f(cy)+" c "+f(cx-rd)+" "+f(cy-k)+" "+f(cx-k)+" "+f(cy-rd)+" "+f(cx)+" "+f(cy-rd)+" c "+f(cx+k)+" "+f(cy-rd)+" "+f(cx+rd)+" "+f(cy-k)+" "+f(cx+rd)+" "+f(cy)+" c f"); };
  return {rrect, circle};
}

function buildPdf(e){
  const W = 595.28, H = 841.89, M = 50, CW = W - 2*M, IND = 32, BOTTOM = 58;
  const F = typeof dagFeest === "function" ? dagFeest(e) : null;   // dag-feest.js: feestelijke versie op de dag van een mijlpaal
  const TH = F ? {rgb: F.rgb, soft: F.soft} : exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const pages = []; let ops = [], y = 0;
  const txt = (s, x, yy, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const rrect = (x, yy, w, h, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + [f(x+rd)+" "+f(yy)+" m", f(x+w-rd)+" "+f(yy)+" l", f(x+w-rd+k)+" "+f(yy)+" "+f(x+w)+" "+f(yy+rd-k)+" "+f(x+w)+" "+f(yy+rd)+" c", f(x+w)+" "+f(yy+h-rd)+" l", f(x+w)+" "+f(yy+h-rd+k)+" "+f(x+w-rd+k)+" "+f(yy+h)+" "+f(x+w-rd)+" "+f(yy+h)+" c", f(x+rd)+" "+f(yy+h)+" l", f(x+rd-k)+" "+f(yy+h)+" "+f(x)+" "+f(yy+h-rd+k)+" "+f(x)+" "+f(yy+h-rd)+" c", f(x)+" "+f(yy+rd)+" l", f(x)+" "+f(yy+rd-k)+" "+f(x+rd-k)+" "+f(yy)+" "+f(x+rd)+" "+f(yy)+" c"].join(" ") + " f"); };
  const circle = (cx, cy, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + f(cx+rd)+" "+f(cy)+" m "+f(cx+rd)+" "+f(cy+k)+" "+f(cx+k)+" "+f(cy+rd)+" "+f(cx)+" "+f(cy+rd)+" c "+f(cx-k)+" "+f(cy+rd)+" "+f(cx-rd)+" "+f(cy+k)+" "+f(cx-rd)+" "+f(cy)+" c "+f(cx-rd)+" "+f(cy-k)+" "+f(cx-k)+" "+f(cy-rd)+" "+f(cx)+" "+f(cy-rd)+" c "+f(cx+k)+" "+f(cy-rd)+" "+f(cx+rd)+" "+f(cy-k)+" "+f(cx+rd)+" "+f(cy)+" c f"); };
  const hline = (x1, x2, yy, c) => ops.push(col(c) + " RG 0.7 w " + f(x1) + " " + f(yy) + " m " + f(x2) + " " + f(yy) + " l S");
  // ---- feest: hulpjes (afgeronde rechthoek als pad, vierpuntige ster, keytag als vectortekening) ----
  const rpad = (x, yy, w, h, rd) => { const k = 0.5523 * rd; return [f(x+rd)+" "+f(yy)+" m", f(x+w-rd)+" "+f(yy)+" l", f(x+w-rd+k)+" "+f(yy)+" "+f(x+w)+" "+f(yy+rd-k)+" "+f(x+w)+" "+f(yy+rd)+" c", f(x+w)+" "+f(yy+h-rd)+" l", f(x+w)+" "+f(yy+h-rd+k)+" "+f(x+w-rd+k)+" "+f(yy+h)+" "+f(x+w-rd)+" "+f(yy+h)+" c", f(x+rd)+" "+f(yy+h)+" l", f(x+rd-k)+" "+f(yy+h)+" "+f(x)+" "+f(yy+h-rd+k)+" "+f(x)+" "+f(yy+h-rd)+" c", f(x)+" "+f(yy+rd)+" l", f(x)+" "+f(yy+rd-k)+" "+f(x+rd-k)+" "+f(yy)+" "+f(x+rd)+" "+f(yy)+" c"].join(" "); };
  const ster = (x, yy, r, c) => ops.push(col(c) + " rg " + f(x) + " " + f(yy + r) + " m " + f(x) + " " + f(yy) + " " + f(x + r) + " " + f(yy) + " v " + f(x) + " " + f(yy) + " " + f(x) + " " + f(yy - r) + " v " + f(x) + " " + f(yy) + " " + f(x - r) + " " + f(yy) + " v " + f(x) + " " + f(yy) + " " + f(x) + " " + f(yy + r) + " v f");
  const feestRand = () => {
    if(!F) return;
    ops.push(col(F.rand) + " RG 1.4 w " + rpad(14, 14, W - 28, H - 28, 16) + " S");
    [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]].forEach(([x, yy]) => ster(x, yy, 7, F.rgb));
  };
  // keytag (zelfde vorm als keytagSvg) met linksboven op (X, Y) en breedte b; tekst erop in Helvetica
  const feestTag = (t, X, Y, b) => {
    const sc = b / 60, light = t.c === "#ffffff" || t.c === "#EEF2E6", kl = [1, 3, 5].map(i => parseInt(t.c.slice(i, i + 2), 16) / 255);
    const rand = light ? [0.71, 0.70, 0.66] : kl.map(v => v * .7), tc = [1, 3, 5].map(i => parseInt(t.tc.slice(i, i + 2), 16) / 255);
    const body = "20 34 m 40 34 l 50 34 55 48 56 64 c 57 84 48 98 30 98 c 12 98 3 84 4 64 c 5 48 10 34 20 34 c h";
    const inner = "21 38 m 39 38 l 47 38 51 50 52 64 c 53 81 45 94 30 94 c 15 94 7 81 8 64 c 9 50 13 38 21 38 c h";
    ops.push("q " + f(sc) + " 0 0 " + f(-sc) + " " + f(X) + " " + f(Y) + " cm");
    ops.push("0.62 0.62 0.6 RG 3 w 39 11 m 39 15.97 34.97 20 30 20 c 25.03 20 21 15.97 21 11 c 21 6.03 25.03 2 30 2 c 34.97 2 39 6.03 39 11 c S");
    ops.push(col(kl) + " rg " + col(rand) + " RG 0.8 w 23 18 14 20 re B");
    ops.push(col(kl) + " rg " + col(rand) + " RG 0.8 w " + body + " B");
    circle(30, 24, 2.6, [0.86, 0.86, 0.84]);
    ops.push(col(tc) + " RG 0.6 w [2 2] 0 d " + inner + " S [] 0 d");
    ops.push("1 1 1 RG 2 w 1 J 14 46 m 18 40 24 38 30 38 c S 0 J");
    ops.push("Q");
    const big = cp1252(t.big), bs = (t.big.length > 3 ? 11 : t.big.length > 2 ? 16 : 19) * sc;
    txt(big, X + 30 * sc - textW(big, bs, true) / 2, Y - (t.small ? 70 : 72) * sc, bs, "F2", tc);
    if(t.small){ const sm = cp1252(t.small); txt(sm, X + 30 * sc - textW(sm, 9 * sc, true) / 2, Y - 84 * sc, 9 * sc, "F2", tc); }
  };
  const newPage = first => {
    ops = []; pages.push(ops);
    feestRand();
    if(first){ y = H - M; return; }
    txt(cp1252(vt("Dagbeschouwing · ", "Daily reflection · ") + shortDate(e.date)), M, H - 34, 8.5, "F1", MUT);
    hline(M, M + CW, H - 42, LINE);
    y = H - 64;
  };
  newPage(true);
  const d = daysClean(e.date);
  // kop
  if(F){
    // feestelijke kop: kleurverloop met confetti en sterretjes, titel en de keytag rechts
    const bandH = 112, by = y - bandH;
    ops.push("q " + rpad(M, by, CW, bandH, 14) + " W n");
    for(let i = 0; i < 60; i++){ const t = i / 59, c = t < .55 ? F.licht.map((v, j) => v + (F.rgb[j] - v) * (t / .55)) : F.rgb.map((v, j) => v + (F.donker[j] - v) * ((t - .55) / .45)); rrect(M + i * CW / 60, by, CW / 60 + 1, bandH, 0, c); }
    let z = 11; const r = () => (z = (z * 16807) % 2147483647) / 2147483647;
    for(let i = 0; i < 64; i++){
      const x = M + r() * CW, yy = by + r() * bandH, kl = [[1, 1, 1], [1, .86, .5], F.rgb.map(v => v + (1 - v) * .65)][Math.floor(r() * 3)];
      const hoek = r() * 6.28;
      if(r() > .55) ops.push("q 1 0 0 1 " + f(x) + " " + f(yy) + " cm " + f(Math.cos(hoek)) + " " + f(Math.sin(hoek)) + " " + f(-Math.sin(hoek)) + " " + f(Math.cos(hoek)) + " 0 0 cm " + col(kl) + " rg -3 -0.9 6 1.8 re f Q");
      else ster(x, yy, 1.6 + r() * 2.4, kl);
    }
    ops.push("Q");
    ops.push("1 1 1 rg BT /F2 8 Tf 2.2 Tc " + f(M + 20) + " " + f(y - 24) + " Td (" + pesc(cp1252(F.kick)) + ") Tj 0 Tc ET");
    txt(cp1252(F.titel), M + 20, y - 54, 26, "F2", WHITE);
    txt(cp1252(vt("Dagbeschouwing · ", "Daily reflection · ") + cap(longDate2(e.date))), M + 20, y - 74, 10.5, "F1", WHITE);
    if(F.tag) feestTag(F.tag, M + CW - 82, y - 3, 62);
    else { circle(M + CW - 46, y - bandH / 2, 30, [.95, .75, .3]); const nn = cp1252(F.kort.split(" ")[0]); txt(nn, M + CW - 46 - textW(nn, 20, true) / 2, y - bandH / 2 - 7, 20, "F2", [.42, .29, .06]); }
    y -= bandH + 14;
  } else {
  const bandH = 76;
  rrect(M, y - bandH, CW, bandH, 12, TH.rgb);
  txt(vt("Dagbeschouwing", "Daily reflection"), M + 22, y - 34, 22, "F2", WHITE);
  txt(cp1252(cap(longDate2(e.date))), M + 22, y - 55, 11, "F1", WHITE);
  const LS = 50, lx = M + CW - 16 - LS, ltop = y - (bandH - LS) / 2;
  pdfLogo(ops, lx, ltop, LS, rrect, circle);
  if(d !== null){
    const big = cp1252(String(d)), small = cp1252(d === 1 ? vt("dag clean", "day clean") : vt("dagen clean", "days clean")), rx = lx - 14;
    txt(big, rx - textW(big, 24, true), y - 38, 24, "F2", WHITE);
    txt(small, rx - textW(small, 9.5, false), y - 54, 9.5, "F1", WHITE);
  }
  y -= bandH + 14;
  }
  // gegevens
  const gap = 10, bw = (CW - 2*gap) / 3, bh = 44;
  [[vt("NAAM", "NAME"), settings.naam || "–"], [vt("DAGEN NUCHTER/CLEAN", "DAYS SOBER/CLEAN"), d === null ? "–" : String(d)], [vt("DATUM", "DATE"), shortDate(e.date)]].forEach(([k, v], i) => {
    const x = M + i * (bw + gap);
    rrect(x, y - bh, bw, bh, 8, TH.soft);
    txt(cp1252(k), x + 12, y - 15, 7.5, "F2", MUT);
    txt(cp1252(v), x + 12, y - 33, 12, "F2", INK);
  });
  y -= bh + 16;
  // feest: vak "Vandaag is een bijzondere dag"
  if(F){
    const regels = wrap(F.tekst, 10.5, false, CW - 40), hb = 34 + regels.length * 14;
    rrect(M, y - hb, CW, hb, 10, F.soft); rrect(M, y - hb, 5, hb, 2, F.rgb);
    txt(cp1252(vt("Vandaag is een bijzondere dag", "Today is a special day")), M + 20, y - 20, 12.5, "F2", INK);
    regels.forEach((l, i) => txt(l, M + 20, y - 37 - i * 14, 10.5, "F1", INK));
    y -= hb + 16;
  }
  wrap(vt("Bij een dagbeschouwing doe je zelfonderzoek. Je gaat na wat er op de dag goed verlopen is en wat voor verbetering vatbaar is. Wees open en eerlijk.", "In a daily reflection you take a personal inventory. You look at what went well during the day and what could be better. Be open and honest."), 9.5, false, CW).forEach(l => { txt(l, M, y - 9.5, 9.5, "F3", MUT); y -= 13; });
  y -= 10;
  hline(M, M + CW, y, LINE); y -= 18;
  // ochtendmoment (alleen als het is ingevuld); oranje rondje als zon (☀ zit niet in het PDF-lettertype)
  const ochR = ochtendRegels(e);
  if(ochR){
    circle(M + 11, y - 9, 8, [0.878, 0.627, 0.125]);
    txt(cp1252(vt("Ochtend", "Morning")), M + IND, y - 13, 11, "F2", INK);
    y -= 15 + 8;
    ochR.forEach(([k, v]) => wrap(k + ": " + v, 10.5, false, CW - IND).forEach(l => { if(y - 14 < BOTTOM) newPage(false); txt(l, M + IND, y - 10.5, 10.5, "F1", INK); y -= 14; }));
    y -= 6; hline(M, M + CW, y, LINE); y -= 15;
  }
  // vragen
  QUESTIONS.forEach((q, i) => {
    const ql = wrap(qTitle(q), 11, true, CW - IND);
    const rows = [];
    answerLines(q, e).forEach(l => {
      if(l.k === "bullet") wrap(l.t, 10.5, false, CW - IND - 14).forEach((t, j) => rows.push({t, x: IND + 14, font: "F1", size: 10.5, c: INK, bullet: j === 0}));
      else if(l.k === "head") wrap(l.t, 9.5, true, CW - IND).forEach((t, j) => rows.push({t, x: IND, font: "F2", size: 9.5, c: TH.rgb, pre: j === 0 ? 4 : 0}));
      else if(l.k === "label") wrap(l.t, 10.5, true, CW - IND).forEach(t => rows.push({t, x: IND, font: "F2", size: 10.5, c: INK}));
      else if(l.k === "empty") rows.push({t: cp1252("–"), x: IND, font: "F1", size: 10.5, c: MUT});
      else if(l.k === "blank") rows.push({blank: true});
      else wrap(l.t, 10.5, false, CW - IND).forEach(t => rows.push({t, x: IND, font: "F1", size: 10.5, c: INK}));
    });
    const need = ql.length * 15 + 8 + Math.min(rows.length, 2) * 14;
    if(y - need < BOTTOM) newPage(false);
    circle(M + 11, y - 9, 11, TH.rgb);
    const num = String(i + 1);
    txt(num, M + 11 - textW(num, 10, true) / 2, y - 12.6, 10, "F2", WHITE);
    ql.forEach((l, j) => txt(l, M + IND, y - 13 - j * 15, 11, "F2", INK));
    y -= ql.length * 15 + 8;
    rows.forEach(rw => {
      if(rw.blank){ y -= 14; return; }
      if(rw.pre) y -= rw.pre;
      if(y - 14 < BOTTOM) newPage(false);
      if(rw.bullet) txt(cp1252("•"), M + IND + 2, y - 10.5, 10.5, "F2", TH.rgb);
      txt(rw.t, M + rw.x, y - 10.5, rw.size, rw.font, rw.c);
      y -= 14;
    });
    y -= 6;
    if(i < QUESTIONS.length - 1){ if(y - 20 > BOTTOM) hline(M, M + CW, y, LINE); y -= 15; }
  });
  // voettekst
  pages.forEach((p, i) => {
    ops = p;
    if(F){ circle(M + 3, 33, 3.2, F.rgb); txt(cp1252(vt("Mijn dag", "My day") + " · " + F.kort), M + 10, 30, 8, "F1", MUT); }
    else txt(cp1252(vt("Mijn dag", "My day")), M, 30, 8, "F1", MUT);
    const pg = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + pages.length);
    txt(pg, M + CW - textW(pg, 8, false), 30, 8, "F1", MUT);
  });
  // assemble
  const objs = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const fontObj = n => "<< /Type /Font /Subtype /Type1 /BaseFont /"+n+" /Encoding /WinAnsiEncoding >>";
  objs[3] = fontObj("Helvetica"); objs[4] = fontObj("Helvetica-Bold"); objs[5] = fontObj("Helvetica-Oblique");
  const kids = [];
  pages.forEach((p, i) => {
    const pid = 6 + i*2, cid = pid + 1;
    const stream = p.join("\n");
    objs[cid] = "<< /Length "+stream.length+" >>\nstream\n"+stream+"\nendstream";
    objs[pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents "+cid+" 0 R >>";
    kids.push(pid+" 0 R");
  });
  objs[2] = "<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+pages.length+" >>";
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offs = [];
  for(let i=1;i<objs.length;i++){ offs[i] = out.length; out += i+" 0 obj\n"+objs[i]+"\nendobj\n"; }
  const xref = out.length;
  out += "xref\n0 "+objs.length+"\n0000000000 65535 f \n";
  for(let i=1;i<objs.length;i++) out += String(offs[i]).padStart(10,"0")+" 00000 n \n";
  out += "trailer\n<< /Size "+objs.length+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  const bytes = new Uint8Array(out.length);
  for(let i=0;i<out.length;i++) bytes[i] = out.charCodeAt(i) & 255;
  return bytes;
}
window.__dagPdf = e => buildPdf(e);

$("savePdf").onclick = async () => {
  const msg = $("docxMsg");
  if(!sumEntry) return;
  if(dirty){ clearTimeout(saveTimer); await flush(); }
  try{
    const bytes = buildPdf(sumEntry);
    await offerFile(vt("Dagbeschouwing ", "Daily reflection ")+sumEntry.date+".pdf", bytes, "application/pdf");
    msg.textContent = ""; toast(vt("Bestand gemaakt. Kies Mail om het te versturen.", "File created. Choose Mail to send it."));
  }catch(err){
    const c = err && err.code;
    if(c==="declined") msg.textContent = vt("Niet opgeslagen.", "Not saved.");
    else if(c==="rate_limited") msg.textContent = vt("Even wachten en dan opnieuw proberen.", "Wait a moment and try again.");
    else msg.textContent = vt("Opslaan lukte niet hier. Gebruik Kopieer tekst en plak het in je mail.", "Saving did not work here. Use Copy text and paste it into your email.");
  }
};
