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
  const TH = exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const pages = []; let ops = [], y = 0;
  const txt = (s, x, yy, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const rrect = (x, yy, w, h, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + [f(x+rd)+" "+f(yy)+" m", f(x+w-rd)+" "+f(yy)+" l", f(x+w-rd+k)+" "+f(yy)+" "+f(x+w)+" "+f(yy+rd-k)+" "+f(x+w)+" "+f(yy+rd)+" c", f(x+w)+" "+f(yy+h-rd)+" l", f(x+w)+" "+f(yy+h-rd+k)+" "+f(x+w-rd+k)+" "+f(yy+h)+" "+f(x+w-rd)+" "+f(yy+h)+" c", f(x+rd)+" "+f(yy+h)+" l", f(x+rd-k)+" "+f(yy+h)+" "+f(x)+" "+f(yy+h-rd+k)+" "+f(x)+" "+f(yy+h-rd)+" c", f(x)+" "+f(yy+rd)+" l", f(x)+" "+f(yy+rd-k)+" "+f(x+rd-k)+" "+f(yy)+" "+f(x+rd)+" "+f(yy)+" c"].join(" ") + " f"); };
  const circle = (cx, cy, rd, c) => { const k = 0.5523 * rd; ops.push(col(c) + " rg " + f(cx+rd)+" "+f(cy)+" m "+f(cx+rd)+" "+f(cy+k)+" "+f(cx+k)+" "+f(cy+rd)+" "+f(cx)+" "+f(cy+rd)+" c "+f(cx-k)+" "+f(cy+rd)+" "+f(cx-rd)+" "+f(cy+k)+" "+f(cx-rd)+" "+f(cy)+" c "+f(cx-rd)+" "+f(cy-k)+" "+f(cx-k)+" "+f(cy-rd)+" "+f(cx)+" "+f(cy-rd)+" c "+f(cx+k)+" "+f(cy-rd)+" "+f(cx+rd)+" "+f(cy-k)+" "+f(cx+rd)+" "+f(cy)+" c f"); };
  const hline = (x1, x2, yy, c) => ops.push(col(c) + " RG 0.7 w " + f(x1) + " " + f(yy) + " m " + f(x2) + " " + f(yy) + " l S");
  const newPage = first => {
    ops = []; pages.push(ops);
    if(first){ y = H - M; return; }
    txt(cp1252(vt("Dagbeschouwing · ", "Daily reflection · ") + shortDate(e.date)), M, H - 34, 8.5, "F1", MUT);
    hline(M, M + CW, H - 42, LINE);
    y = H - 64;
  };
  newPage(true);
  const d = daysClean(e.date);
  // kop
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
  // gegevens
  const gap = 10, bw = (CW - 2*gap) / 3, bh = 44;
  [[vt("NAAM", "NAME"), settings.naam || "–"], [vt("DAGEN NUCHTER/CLEAN", "DAYS SOBER/CLEAN"), d === null ? "–" : String(d)], [vt("DATUM", "DATE"), shortDate(e.date)]].forEach(([k, v], i) => {
    const x = M + i * (bw + gap);
    rrect(x, y - bh, bw, bh, 8, TH.soft);
    txt(cp1252(k), x + 12, y - 15, 7.5, "F2", MUT);
    txt(cp1252(v), x + 12, y - 33, 12, "F2", INK);
  });
  y -= bh + 16;
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
    txt(cp1252(vt("Mijn dag", "My day")), M, 30, 8, "F1", MUT);
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
