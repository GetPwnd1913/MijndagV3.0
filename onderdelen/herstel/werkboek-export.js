// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- werkboek: Word- en PDF-bestand (om te bespreken met je begeleider) ----------
// Zelfde stijl als de dagbeschouwing en de weekformulieren: gekleurde kopbalk met logo en tegels met naam en datum.
// Daarna per opdracht een gekleurde kaart (rondje met stapnummer, kop, titel) met witte invulvakken, zoals een
// papieren werkblad. Kleuren: het kleurthema van de app; groen/oranje/rood voor de stoplichtkleuren.
// doc = {titel, intro, stoplicht, tegel: [label, waarde], secties: [sectie]}
// sectie = {z ("groen"/"oranje"/"rood") of hex, nr, kop, titel, uitleg, half (twee naast elkaar),
//           rijen: [{label, items}], tabel: {kop: [...], breed: [fracties], rijen: [[...]]}, notitie, eigen (kopje boven de notitie)}
const TV_HEX = {groen: "3B8A57", oranje: "D27A1F", rood: "C62828"};
const tvRgb = hex => [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const tvBestand = (titel, ext) => titel + ((settings.naam || "").trim() ? " " + settings.naam.trim() : "") + " " + todayKey() + "." + ext;
const TV_INTRO = () => vt("Dit plan helpt je om op tijd te zien hoe het met je gaat. Groen: het gaat goed. Oranje: let op, de eerste signalen. Rood: gevaar, nu handelen.", "This plan helps you notice in time how you are doing. Green: doing well. Orange: watch out, the first signs. Red: danger, act now.");
const wbMix = (rgb, w) => rgb.map(v => v + (1 - v) * w);
const wbHex = rgb => rgb.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
// kleuren van één kaart: vol (rondje, bolletjes), donker (kopje), tint (achtergrond kaart), rand (witte vakken)
function wbKleur(s){
  const rgb = s.z ? tvRgb(TV_HEX[s.z]) : s.hex ? tvRgb(s.hex) : exportTheme().rgb;
  const donker = rgb.map(v => v * 0.82), tint = wbMix(rgb, 0.89), rand = wbMix(rgb, 0.62);
  return {rgb, donker, tint, rand, hex: wbHex(rgb), donkerHex: wbHex(donker), tintHex: wbHex(tint), randHex: wbHex(rand)};
}
const wbNaam = () => (settings.naam || "").trim();
const wbTegels = doc => [[vt("NAAM", "NAME"), wbNaam() || "–"], [vt("DATUM", "DATE"), shortDate(todayKey())]].concat(doc.tegel ? [doc.tegel] : []);
const wbStoplicht = () => Object.keys(TV_ZONES).map(z => [z, vt(TV_ZONES[z].nl, TV_ZONES[z].en), vt(TV_ZONES[z].kop, TV_ZONES[z].kopEn).toLowerCase()]);
const wbEigenKop = s => s.eigen || vt("In mijn eigen woorden", "In my own words");
// halve kaarten (half: true) die na elkaar komen, staan in het bestand naast elkaar
function wbGroepen(secties){
  const out = [];
  secties.forEach(s => { const l = out[out.length - 1]; if(s.half && l && l.length === 1 && l[0].half) l.push(s); else out.push([s]); });
  return out;
}

// ---- PDF ----
function tvPdf(doc){
  const W = 595.28, H = 841.89, M = 46, CW = W - 2 * M, BOTTOM = 56, PAD = 14, IP = 9, GAP = 12, BR = 11;
  const TH = exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const pages = []; let ops = [], y = 0;
  const txt = (s, x, yy, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const hline = (x1, x2, yy, c) => ops.push(col(c) + " RG 0.7 w " + f(x1) + " " + f(yy) + " m " + f(x2) + " " + f(yy) + " l S");
  const circle = (cx, cy, r, c) => pdfShapes(ops).circle(cx, cy, r, c);
  // afgeronde rechthoek als losse opdracht (om later onder de tekst te schuiven), met of zonder randje
  const vlak = (x, yy, w, h, rd, fill, rand) => { const t = []; pdfShapes(t).rrect(x, yy, w, h, rd, fill); return rand ? col(rand) + " RG 0.8 w " + t[0].replace(/ f$/, " B") : t[0]; };
  const newPage = first => {
    ops = []; pages.push(ops);
    if(first){ y = H - M; return; }
    txt(cp1252(doc.titel + (wbNaam() ? "  ·  " + wbNaam() : "")), M, H - 34, 8.5, "F1", MUT); hline(M, M + CW, H - 42, LINE); y = H - 60;
  };
  newPage(true);
  // kopbalk
  const bandH = 84, sh = pdfShapes(ops);
  sh.rrect(M, y - bandH, CW, bandH, 14, TH.rgb);
  txt(cp1252(doc.titel), M + 24, y - 38, 24, "F2", WHITE);
  txt(cp1252(vt("Mijn werkboek", "My workbook") + "  ·  " + cap(longDate2(todayKey()))), M + 24, y - 60, 11, "F1", WHITE);
  pdfLogo(ops, M + CW - 18 - 52, y - (bandH - 52) / 2, 52, sh.rrect, sh.circle);
  y -= bandH + 12;
  // tegels
  const tg = wbTegels(doc), tgap = 10, tw = (CW - (tg.length - 1) * tgap) / tg.length, th = 44;
  tg.forEach(([k, v], i) => {
    const x = M + i * (tw + tgap);
    sh.rrect(x, y - th, tw, th, 9, TH.soft);
    txt(cp1252(k), x + 12, y - 15, 7.5, "F2", MUT);
    const vv = wrap(v, 12, true, tw - 24)[0];
    txt(vv, x + 12, y - 33, 12, "F2", INK);
  });
  y -= th + 12;
  // uitleg (+ stoplicht)
  if(doc.intro || doc.stoplicht){
    const il = doc.intro ? wrap(doc.intro, 9.5, false, CW - 2 * PAD) : [];
    const ih = PAD + il.length * 13.5 + (doc.stoplicht ? (il.length ? 8 : 0) + 24 : 0) + PAD - 3;
    sh.rrect(M, y - ih, CW, ih, 12, wbMix(TH.rgb, 0.93));
    let yy = y - PAD;
    il.forEach(l => { txt(l, M + PAD, yy - 9.5, 9.5, "F1", INK); yy -= 13.5; });
    if(doc.stoplicht){
      if(il.length) yy -= 8;
      const sl = wbStoplicht(), pw = (CW - 2 * PAD - 2 * 8) / 3;
      sl.forEach(([z, n, k], i) => {
        const x = M + PAD + i * (pw + 8);
        ops.push(vlak(x, yy - 24, pw, 24, 12, WHITE, wbMix(tvRgb(TV_HEX[z]), 0.6)));
        circle(x + 14, yy - 12, 5.5, tvRgb(TV_HEX[z]));
        const a = cp1252(n + ": "), b = cp1252(k);
        txt(a, x + 26, yy - 15.3, 9.5, "F2", INK); txt(b, x + 26 + textW(a, 9.5, true), yy - 15.3, 9.5, "F1", INK);
      });
    }
    y -= ih + GAP + 2;
  }
  // inhoud van één kaart als regels: {h, draw(x, top)} en {box: "start"/"end"} voor de witte vakken
  const regels = (s, w) => {
    const k = wbKleur(s), iw = w - 2 * PAD, out = [];
    const tx = 2 * BR + 10, tl = wrap(s.titel, 12.5, true, iw - tx), kl = wrap(s.kop.toUpperCase(), 8, true, iw - tx);
    const kh = kl.length * 10;
    out.push({h: Math.max(2 * BR + 2, kh + 6 + tl.length * 15.5), kop: 1, draw: (x, t) => {
      circle(x + BR, t - BR, BR, k.rgb);
      if(s.nr != null){ const n = cp1252(String(s.nr)), sz = n.length > 1 ? 8.5 : 10; txt(n, x + BR - textW(n, sz, true) / 2, t - BR - sz * 0.36, sz, "F2", WHITE); }
      else circle(x + BR, t - BR, 3.8, WHITE);
      kl.forEach((l, i) => txt(l, x + tx, t - 7.5 - i * 10, 8, "F2", k.donker));
      tl.forEach((l, i) => txt(l, x + tx, t - kh - 13 - i * 15.5, 12.5, "F2", INK));
    }});
    if(s.uitleg) wrap(s.uitleg, 9, false, iw).forEach((l, i, a) => out.push({h: 12 + (i === 0 ? 2 : 0) + (i === a.length - 1 ? 2 : 0), draw: (x, t) => txt(l, x, t - 9 - (i === 0 ? 2 : 0), 9, "F3", MUT)}));
    const label = l => wrap(l, 9.5, true, iw).forEach((r, i) => out.push({h: 13 + (i === 0 ? 7 : 0), draw: (x, t) => txt(r, x, t - 9.5 - (i === 0 ? 7 : 0), 9.5, "F2", INK)}));
    const vak = items => {
      out.push({h: 5}); out.push({box: "start"});
      if(!items.length) out.push({h: 14.5, draw: (x, t) => txt(cp1252("–"), x + IP, t - 10.5, 10.5, "F1", MUT)});
      items.forEach((it, n) => wrap(it, 10.5, false, iw - 2 * IP - 13).forEach((l, j) => out.push({h: 14.5 + (j === 0 && n ? 2 : 0), draw: (x, t) => {
        const tt = t - (j === 0 && n ? 2 : 0);
        if(j === 0) txt(cp1252("•"), x + IP + 1, tt - 10.5, 10.5, "F2", k.rgb);
        txt(l, x + IP + 13, tt - 10.5, 10.5, "F1", INK);
      }})));
      out.push({box: "end"});
    };
    (s.rijen || []).forEach(r => { if(r.label) label(r.label); vak(r.items); });
    if(s.tabel){
      const tb = s.tabel, br = tb.breed || tb.kop.map(() => 1 / tb.kop.length), xs = [0];
      br.forEach((b, i) => xs.push(xs[i] + b * iw));
      out.push({h: 22, draw: (x, t) => tb.kop.forEach((c, i) => txt(cp1252(c), x + xs[i] + 7, t - 16, 9, "F2", k.donker))});
      tb.rijen.forEach(rij => {
        const cel = rij.map((c, i) => wrap(c || "", 10.5, i === 0, xs[i + 1] - xs[i] - 14));
        const h = Math.max(...cel.map(c => c.length)) * 14 + 10;
        out.push({h, draw: (x, t) => cel.forEach((c, i) => {
          const t2 = []; pdfShapes(t2).rrect(x + xs[i], t - h, xs[i + 1] - xs[i], h, 0, WHITE);
          ops.push(col(k.rand) + " RG 0.8 w " + t2[0].replace(/ f$/, " B"));
          c.forEach((l, j) => txt(l, x + xs[i] + 7, t - 15.5 - j * 14, 10.5, i === 0 ? "F2" : "F1", INK));
        })});
      });
      out.push({h: 2});
    }
    if(s.notitie){
      if((s.rijen || []).length || s.tabel) label(wbEigenKop(s));
      out.push({h: 5}); out.push({box: "start"});
      wrap(s.notitie, 10.5, false, iw - 2 * IP).forEach(l => out.push({h: 14.5, draw: (x, t) => txt(l, x + IP, t - 10.5, 10.5, "F1", INK)}));
      out.push({box: "end"});
    }
    return {k, out};
  };
  const hoogte = r => r.out.reduce((a, e) => a + (e.box ? IP : e.h), 0) + 2 * PAD;
  // kaart tekenen; vrij = mag over meerdere pagina's (vakken worden dan netjes afgesloten en op de volgende pagina verder gezet)
  const kaart = (r, x, w, vast) => {
    const stapel = [];
    const open = soort => stapel.push({soort, idx: ops.length, top: y});
    const dicht = (b, onder) => {
      const kaartVlak = b.soort === "kaart";
      ops.splice(b.idx, 0, kaartVlak ? vlak(x, onder, w, b.top - onder, 12, r.k.tint) : vlak(x + PAD, onder, w - 2 * PAD, b.top - onder, 8, WHITE, r.k.rand));
    };
    const breek = () => {
      for(let i = stapel.length - 1; i >= 0; i--){ y -= stapel[i].soort === "kaart" ? PAD : IP; dicht(stapel[i], y); }
      newPage(false);
      stapel.forEach(b => { b.idx = ops.length; b.top = y; y -= b.soort === "kaart" ? PAD : IP; });
    };
    open("kaart"); y -= PAD;
    r.out.forEach((e, i) => {
      if(e.box === "start"){
        const vlg = r.out[i + 1];
        if(!vast && y - IP - (vlg && vlg.h || 0) - IP - PAD < BOTTOM) breek();
        open("vak"); y -= IP; return;
      }
      if(e.box === "end"){ y -= IP; dicht(stapel.pop(), y); return; }
      const binnen = stapel.length > 1 ? IP : 0;
      if(!vast && y - e.h - binnen - PAD < BOTTOM) breek();
      if(e.draw) e.draw(x + PAD, y);
      y -= e.h;
    });
    if(vast) y = stapel[0].top - vast + PAD;
    y -= PAD; dicht(stapel.pop(), y);
  };
  wbGroepen(doc.secties).forEach(g => {
    const ruimte = H - 60 - BOTTOM;
    if(g.length === 2){
      const w = (CW - GAP) / 2, a = regels(g[0], w), b = regels(g[1], w), hh = Math.max(hoogte(a), hoogte(b));
      if(hh <= ruimte){
        if(y - hh < BOTTOM) newPage(false);
        const top = y;
        kaart(a, M, w, hh); y = top; kaart(b, M + w + GAP, w, hh);
        y = top - hh - GAP; return;
      }
    }
    g.forEach(s => {
      const r = regels(s, CW), kop = r.out.slice(0, 4).reduce((a, e) => a + (e.box ? IP : e.h), 0) + PAD + 20;
      if(y - Math.min(hoogte(r), kop) < BOTTOM) newPage(false);
      kaart(r, M, CW, 0); y -= GAP;
    });
  });
  pages.forEach((p, i) => {
    ops = p;
    txt(cp1252(vt("Mijn dag  ·  Mijn werkboek", "My day  ·  My workbook")), M, 30, 8, "F1", MUT);
    const pg = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + pages.length);
    txt(pg, M + CW - textW(pg, 8, false), 30, 8, "F1", MUT);
  });
  return pdfAssemble(pages, W, H);
}
window.__tvPdf = doc => tvPdf(doc);

// ---- Word ----
function tvWordXml(doc, metLogo){
  const TH = exportTheme(), GRAY = "6B7370", INK = "1F2A28", BREED = 9638;
  const r = (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + '<w:color w:val="' + (o.c || INK) + '"/>' + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + (o.sp ? '<w:spacing w:val="' + o.sp + '"/>' : '') + '</w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; };
  const p = (runs, o) => { o = o || {}; return '<w:p><w:pPr>' + (o.keep ? '<w:keepNext/>' : '') + '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 40 : o.after) + '"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '"' + (o.hang ? ' w:hanging="' + o.hang + '"' : '') + '/>' : '') + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '<w:rPr><w:sz w:val="' + (o.leeg || 20) + '"/></w:rPr></w:pPr>' + runs + '</w:p>'; };
  const tussen = h => p("", {after: 0, leeg: h || 8});   // houdt tabellen uit elkaar (anders plakt Word ze aan elkaar)
  const geen = '<w:tblBorders>' + ["top", "left", "bottom", "right", "insideH", "insideV"].map(x => '<w:' + x + ' w:val="nil"/>').join("") + '</w:tblBorders>';
  const lijn = c => '<w:tblBorders>' + ["top", "left", "bottom", "right", "insideH", "insideV"].map(x => '<w:' + x + ' w:val="single" w:sz="6" w:space="0" w:color="' + c + '"/>').join("") + '</w:tblBorders>';
  const mar = (t, l) => '<w:tcMar><w:top w:w="' + t + '" w:type="dxa"/><w:bottom w:w="' + t + '" w:type="dxa"/><w:left w:w="' + l + '" w:type="dxa"/><w:right w:w="' + l + '" w:type="dxa"/></w:tcMar>';
  const tc = (w, inner, o) => { o = o || {}; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + mar(o.mt == null ? 160 : o.mt, o.ml == null ? 200 : o.ml) + (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + inner + '</w:tc>'; };
  const tbl = (breed, rand, kols, rijen, extra) => '<w:tbl><w:tblPr><w:tblW w:w="' + breed + '" w:type="dxa"/>' + rand + '<w:tblLayout w:type="fixed"/>' + (extra || "") + '<w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + kols.map(k => '<w:gridCol w:w="' + k + '"/>').join("") + '</w:tblGrid>' + rijen + '</w:tbl>';
  // kopbalk met logo
  const EMU = 560000;
  const pic = metLogo ? '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + EMU + '" cy="' + EMU + '"/><wp:docPr id="1" name="Logo Mijn dag"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + EMU + '" cy="' + EMU + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>' : "";
  let body = tbl(BREED, geen, [8238, 1400], '<w:tr>' +
    tc(8238, p(r(doc.titel, {b: 1, sz: 44, c: "FFFFFF"}), {after: 20}) + p(r(vt("Mijn werkboek", "My workbook") + "  ·  " + cap(longDate2(todayKey())), {sz: 20, c: "FFFFFF"}), {after: 0}), {fill: TH.hex, mt: 200, ml: 360, va: "center"}) +
    tc(1400, p(pic, {jc: "right", after: 0}), {fill: TH.hex, mt: 160, ml: 200, va: "center"}) + '</w:tr>');
  body += tussen(10);
  // tegels
  const tg = wbTegels(doc), gat = 140, tw = Math.floor((BREED - (tg.length - 1) * gat) / tg.length), kols = [];
  let rij = '<w:tr>';
  tg.forEach(([k, v], i) => {
    rij += tc(tw, p(r(k, {b: 1, sz: 14, c: GRAY, sp: 6}), {after: 20}) + p(r(v, {b: 1, sz: 22}), {after: 0}), {fill: TH.softHex, mt: 110, ml: 180});
    kols.push(tw);
    if(i < tg.length - 1){ rij += tc(gat, p("", {after: 0}), {mt: 0, ml: 0}); kols.push(gat); }
  });
  body += tbl(BREED, geen, kols, rij + '</w:tr>') + tussen(10);
  // uitleg + stoplicht
  if(doc.intro || doc.stoplicht){
    let inh = doc.intro ? p(r(doc.intro, {sz: 19}), {after: doc.stoplicht ? 100 : 0}) : "";
    if(doc.stoplicht) inh += p(wbStoplicht().map(([z, n, k], i) => (i ? r("      ", {sz: 19}) : "") + r("● ", {sz: 22, c: TV_HEX[z]}) + r(n + ": ", {b: 1, sz: 19}) + r(k, {sz: 19})).join(""), {after: 0});
    body += tbl(BREED, geen, [BREED], '<w:tr>' + tc(BREED, inh, {fill: wbHex(wbMix(TH.rgb, 0.93)), mt: 160, ml: 220}) + '</w:tr>') + tussen(10);
  }
  // één kaart: inhoud van een cel met breedte w
  const kaartInh = (s, w) => {
    const k = wbKleur(s), iw = w - 2 * 200;
    let x = p((s.nr != null ? r(String(s.nr) + "   ", {b: 1, sz: 18, c: k.hex}) : r("●  ", {sz: 18, c: k.hex})) + r(s.kop, {b: 1, sz: 15, c: k.donkerHex, caps: 1, sp: 8}), {keep: 1, after: 20});
    x += p(r(s.titel, {b: 1, sz: 25}), {keep: 1, after: s.uitleg ? 30 : 60});
    if(s.uitleg) x += p(r(s.uitleg, {i: 1, sz: 18, c: GRAY}), {keep: 1, after: 60});
    const label = l => p(r(l, {b: 1, sz: 19}), {keep: 1, before: 100, after: 50});
    const vak = inner => tbl(iw, lijn(k.randHex), [iw], '<w:tr>' + tc(iw, inner, {fill: "FFFFFF", mt: 100, ml: 160}) + '</w:tr>') + p("", {after: 0, leeg: 8});
    (s.rijen || []).forEach(rj => {
      if(rj.label) x += label(rj.label);
      x += vak(rj.items.length ? rj.items.map(t => p(r("•", {b: 1, sz: 22, c: k.hex}) + r("\t" + t, {sz: 21}), {ind: 300, hang: 300, after: 30})).join("") : p(r("–", {sz: 21, c: GRAY}), {after: 0}));
    });
    if(s.tabel){
      const tb = s.tabel, br = tb.breed || tb.kop.map(() => 1 / tb.kop.length), kw = br.map(b => Math.floor(b * iw));
      kw[kw.length - 1] = iw - kw.slice(0, -1).reduce((a, b) => a + b, 0);
      const cel = (wd, inner, kop) => tc(wd, inner, {fill: kop ? null : "FFFFFF", mt: kop ? 40 : 90, ml: 120});
      const kopRij = '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + tb.kop.map((c, i) => cel(kw[i], p(r(c, {b: 1, sz: 18, c: k.donkerHex}), {after: 0}), true)).join("") + '</w:tr>';
      const rand = '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:right w:val="nil"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="' + k.randHex + '"/><w:insideH w:val="single" w:sz="6" w:space="0" w:color="' + k.randHex + '"/><w:insideV w:val="single" w:sz="6" w:space="0" w:color="' + k.randHex + '"/></w:tblBorders>';
      x += tbl(iw, rand, kw, kopRij + tb.rijen.map(rj => '<w:tr><w:trPr><w:cantSplit/></w:trPr>' + rj.map((c, i) => cel(kw[i], String(c || "").split("\n").map(l => p(r(l, {sz: 21, b: i === 0}), {after: 0})).join(""))).join("") + '</w:tr>').join("")) + p("", {after: 0, leeg: 8});
    }
    if(s.notitie){
      if((s.rijen || []).length || s.tabel) x += label(wbEigenKop(s));
      x += vak(s.notitie.split("\n").map(l => p(l ? r(l, {sz: 21}) : "", {after: 30})).join(""));
    }
    return x;
  };
  wbGroepen(doc.secties).forEach(g => {
    if(g.length === 2){
      const w = Math.floor((BREED - 200) / 2);
      body += tbl(BREED, geen, [w, 200, BREED - 200 - w], '<w:tr><w:trPr><w:cantSplit/></w:trPr>' + tc(w, kaartInh(g[0], w), {fill: wbKleur(g[0]).tintHex}) + tc(200, p("", {after: 0}), {mt: 0, ml: 0}) + tc(BREED - 200 - w, kaartInh(g[1], BREED - 200 - w), {fill: wbKleur(g[1]).tintHex}) + '</w:tr>') + tussen(12);
    } else g.forEach(s => { body += tbl(BREED, geen, [BREED], '<w:tr>' + tc(BREED, kaartInh(s, BREED), {fill: wbKleur(s).tintHex}) + '</w:tr>') + tussen(12); });
  });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>' + body +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1134" w:bottom="1000" w:left="1134" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function tvWordFooter(doc){
  const rr = t => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>';
  const fld = c => ["begin", null, "separate", "1", "end"].map((x, i) => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr>' + (i === 1 ? '<w:instrText xml:space="preserve"> ' + c + ' </w:instrText>' : i === 3 ? '<w:t>1</w:t>' : '<w:fldChar w:fldCharType="' + x + '"/>') + '</w:r>').join("");
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D5D9D7"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="9638"/></w:tabs><w:spacing w:before="0" w:after="0"/></w:pPr>' +
    rr(vt("Mijn dag  ·  ", "My day  ·  ") + doc.titel + (wbNaam() ? "  ·  " + wbNaam() : "")) + '<w:r><w:tab/></w:r>' + rr(vt("Pagina ", "Page ")) + fld("PAGE") + rr(vt(" van ", " of ")) + fld("NUMPAGES") + '</w:p></w:ftr>';
}
window.__tvDocParts = (doc, metLogo) => {
  const parts = Object.assign({}, DOCX_PARTS, {"word/document.xml": tvWordXml(doc, metLogo), "word/footer1.xml": tvWordFooter(doc)});
  if(metLogo){
    parts["[Content_Types].xml"] = parts["[Content_Types].xml"].replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"');
    parts["word/_rels/document.xml.rels"] = parts["word/_rels/document.xml.rels"].replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>');
  }
  return parts;
};

// knoppen Word/PDF voor elke opdracht in het werkboek; maakDoc() geeft het doc (zie boven)
function wbDownloadKnoppen(maakDoc){
  const w = el("div");
  const row = el("div", "row"); row.style.cssText = "justify-content:flex-start;flex-wrap:wrap;margin-top:12px";
  const msg = note(""); msg.setAttribute("role", "status");
  const fout = err => { const c = err && err.code; msg.textContent = c === "declined" ? vt("Niet opgeslagen.", "Not saved.") : c === "rate_limited" ? vt("Even wachten en dan opnieuw proberen.", "Wait a moment and try again.") : c === "nozip" ? vt("Het Word-bestand kon niet worden gemaakt. Probeer PDF.", "The Word file could not be created. Try PDF.") : vt("Opslaan lukte niet hier.", "Saving did not work here."); };
  const klaar = () => { msg.textContent = ""; toast(vt("Bestand gemaakt. Kies Mail om het te versturen.", "File created. Choose Mail to send it.")); };
  const wd = el("button", "ghost", vt("Download als Word", "Download as Word")); wd.type = "button";
  wd.onclick = async () => {
    msg.textContent = vt("Bestand maken…", "Creating file…");
    try{
      if(!window.JSZip) throw {code: "nozip"};
      let logo = null;
      try{ logo = await logoPng(240); }catch(err){ logo = null; }
      const doc = maakDoc(), zip = new JSZip(), parts = window.__tvDocParts(doc, !!logo);
      Object.keys(parts).forEach(k => zip.file(k, parts[k]));
      if(logo) zip.file("word/media/logo.png", logo);
      const mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = await zip.generateAsync({type: "blob", mimeType: mime});
      await offerFile(tvBestand(doc.titel, "docx"), blob, mime); klaar();
    }catch(err){ fout(err); }
  };
  const pd = el("button", "ghost", vt("Download als PDF", "Download as PDF")); pd.type = "button";
  pd.onclick = async () => { try{ const doc = maakDoc(); await offerFile(tvBestand(doc.titel, "pdf"), tvPdf(doc), "application/pdf"); klaar(); }catch(err){ fout(err); } };
  row.appendChild(wd); row.appendChild(pd); w.appendChild(row); w.appendChild(msg);
  return w;
}
