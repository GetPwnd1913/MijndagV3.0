// ---------- exporteren ----------
function wfExportCard(wk, f){
  const c = wfCard("Versturen", "Maak een Word- of PDF-bestand en voeg het toe aan je mail.");
  const row = el("div", "row"); row.style.cssText = "margin-top:10px;justify-content:flex-start;gap:8px";
  const msg = note("");
  const go = async kind => {
    msg.textContent = "Bestand maken…";
    try{
      const name = wfFileName(wk, f) + (kind === "pdf" ? ".pdf" : ".docx");
      if(kind === "pdf") await offerFile(name, wfPdf(wk, f.id), "application/pdf");
      else {
        if(!window.JSZip) throw {code: "nozip"};
        let logo = null;
        if(f.id !== "plan"){ try{ logo = await logoPng(240); }catch(err){ logo = null; } }
        const zip = new JSZip(), parts = wfDocParts(wk, f.id, !!logo);
        Object.keys(parts).forEach(k => zip.file(k, parts[k]));
        if(logo) zip.file("word/media/logo.png", logo);
        const blob = await zip.generateAsync({type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
        await offerFile(name, blob, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }
      const d = wfData(wk); d.sent = Object.assign({}, d.sent || {}); d.sent[f.id] = todayKey(); wfStore(wk, d); await saveSettingsNow();
      msg.textContent = ""; toast("Bestand gemaakt. Kies Mail om het te versturen.");
      renderGreetingWf(); flyPlane();
    }catch(err){
      const cd = err && err.code;
      msg.textContent = cd === "declined" ? "Niet opgeslagen." : cd === "nozip" ? "Het Word-bestand kon niet worden gemaakt. Probeer PDF." : "Opslaan lukte niet. Probeer het nog een keer.";
    }
  };
  const w = el("button", "primary", "Word"); w.type = "button"; w.onclick = () => go("docx");
  const p = el("button", "ghost", "PDF"); p.type = "button"; p.onclick = () => go("pdf");
  row.appendChild(w); row.appendChild(p); c.appendChild(row); c.appendChild(msg);
  const s = (wfData(wk).sent || {})[f.id];
  if(s){ const t = note("✓ Al eens verstuurd op " + dayMonth(s) + "."); t.style.color = "var(--accent)"; c.appendChild(t); }
  return c;
}
function wfFileName(wk, f){
  const first = (settings.naam || "").trim().split(/\s+/)[0];
  const w = wfWeekInfo(wk, f.id);
  return f.title + " week " + w.week + " " + w.year + (first ? " " + first : "");
}
function wfDateText(wk, id){
  if(id === "plan") return rangeLabel(planWeekStart(wk), addDaysKey(planWeekStart(wk), 6));
  return shortDate(todayKey() >= wk && todayKey() <= addDaysKey(wk, 6) ? todayKey() : (id === "wv" ? addDaysKey(wk, 2) : addDaysKey(wk, 6)));
}
// gestructureerde inhoud voor Word en PDF
function wfRows(wk, id){
  const u = wfGet(wk, id), yn = v => v === "ja" ? "Ja" : v === "nee" ? "Nee" : "Ja / Nee";
  if(id === "wv"){
    return [
      {cells: [{t: "Wat doe je vrijdag na het programma?"}, {t: u.vr || "", span: 3}], h: 70},
      {cells: [{t: "Wat is je planning zaterdag?"}, {t: u.za || "", span: 3}], h: 70},
      {cells: [{t: "Wat is je planning zondag?"}, {t: u.zo || "", span: 3}], h: 70},
      {cells: [{t: "Welke avond eet je mee in het safehouse?", i: 1}, {t: "Vrijdag: " + yn(u.eet_vr), i: 1, c: 1}, {t: "Zaterdag: " + yn(u.eet_za), i: 1, c: 1}, {t: "Zondag: " + yn(u.eet_zo), i: 1, c: 1}]},
      {cells: [{t: "Is dit afgestemd met je huisgenoten?", i: 1}, {t: yn(u.afg_yn), i: 1, c: 1}, {t: "Zijn je afwas-/afdroogtaken hierop afgestemd: " + yn(u.afwas_yn), i: 1, span: 2}]},
      {cells: [{t: "Welke triggers verwacht je?"}, {t: u.trig || "", span: 3}]},
      {cells: [{t: "Hoe ga je met triggers om?"}, {t: u.omgaan || "", span: 3}]},
      {cells: [{t: "Wie ga je bellen dit weekend?"}, {t: u.bellen || "", span: 3}]},
      {cells: [{t: "Welke meetings bezoek je dit weekend?"}, {t: u.meet || "", span: 3}]},
      {cells: [{t: "Welke dagen ben je komende week bij het programma aanwezig?"}, {t: u.aanw || "", span: 3}]},
      {cells: [{t: "Welke dagen ben je niet bij het programma aanwezig en wat is de reden hiervan?"}, {t: u.afw || "", span: 3}]},
      {cells: [{t: "Reminders"}, {list: WV_REMIND[0], small: 1}, {list: WV_REMIND[1], small: 1, span: 2}]}
    ];
  }
  const hulp = u.hulp || {};
  const hl = HULP.map(h => h + ": " + (hulp[h] ? "ja" : "nee"));
  return [
    {cells: [{t: ""}, {t: "Aantal", c: 1}, {t: "", span: 2}], head: 1},
    {cells: [{t: "Hoeveel meetings heb je bijgewoond?"}, {t: u.meet_n || "", c: 1}, {t: "Waar en wanneer?", sub: u.meet_txt, span: 2}]},
    {cells: [{t: "Hoe vaak heb je afgelopen week gesport, buiten het programma om"}, {t: u.sport_n || "", c: 1}, {t: "Wat heb je qua sport gedaan en wanneer?", sub: u.sport_txt, span: 2}]},
    {cells: [{t: "Heb je een servicepositie?"}, {t: u.serv_n || "", c: 1}, {t: "Zo ja, hoeveel, welke, waar en wanneer?", sub: u.serv_txt, span: 2}]},
    {cells: [{t: "Heb je een sponsor"}, {t: yn(u.sp_yn), c: 1}, {lines: [["Hoe vaak heb je contact met je sponsor", ""], ["Telefonisch: ", u.sp_tel], ["Afgesproken: ", u.sp_afg], ["Overige contactmomenten of afspraken: ", u.sp_ov], ["Zo nee, waarom niet: ", u.sp_nee]], span: 2}]},
    {cells: [{t: "Bij welke stap ben je"}, {t: u.step_n || "", c: 1}, {t: "Hoe vaak, hoeveel en wanneer werk je aan je stappenwerk?", sub: u.step_txt, span: 2}]},
    {cells: [{t: "Hoe vaak heb je contact met\n(licht contact toe)"}, {t: "", c: 1}, {lines: [["Familie: ", u.c_fam], ["Vrienden: ", u.c_vri], ["Partner: ", u.c_par], ["Medebewoners: ", u.c_mede], ["Fellowship: ", u.c_fellow]], span: 2}]},
    {cells: [{t: "Heb je alle programma onderdelen bijgewoond?"}, {t: yn(u.prog_yn), c: 1}, {t: "Zo nee, welke niet en reden afwezigheid:", sub: u.prog_txt, span: 2}]},
    {cells: [{t: "Ben je binnen eigen budget gebleven?"}, {t: yn(u.budget_yn), c: 1}, {t: "Zo nee, licht toe:", sub: u.budget_txt, span: 2}]},
    {cells: [{t: "Heb je vrijwilligerswerk?"}, {t: yn(u.vrijw_yn), c: 1}, {t: "Zo ja, waar, hoeveel uur en welke dagen. Zo nee, licht toe:", sub: u.vrijw_txt, span: 2}]},
    {cells: [{t: "Heb je verder dagbesteding?"}, {t: yn(u.dagb_yn), c: 1}, {t: "Welke:", sub: u.dagb_txt, span: 2}]},
    {cells: [{t: "Wat is je doel deze week?", i: 1}, {t: u.doel || "", span: 3}]},
    {cells: [{t: "Werk je aan dit doel?", i: 1}, {t: yn(u.doel_yn), c: 1}, {t: "Zo ja, hoe?", sub: u.doel_ja, i: 1}, {t: "Zo nee, waarom niet", sub: u.doel_nee, i: 1}]},
    {cells: [{t: "Heb je jouw huishoudelijke taken (Safehouse) uitgevoerd?", i: 1}, {t: yn(u.huis_yn), c: 1}, {t: "Ja:", sub: u.huis_ja, i: 1}, {t: "Zo nee, waarom niet", sub: u.huis_nee, i: 1}]},
    {cells: [{t: "Heb je ergens extra hulp bij nodig aankomende week?"}, {t: "", c: 1}, {list: hl.slice(0, 6), small: 1, plain: 1, hl: hulp}, {list: hl.slice(6).concat(["Anders: " + (u.hulp_anders || "")]), small: 1, plain: 1, hl: hulp}]},
    {cells: [{t: "Heb je een verzoek aan het team?"}, {t: u.verzoek || "", span: 3}], h: 40}
  ];
}

// ---- Word ----
function wfDocParts(wk, id, withLogo){
  const parts = Object.assign({}, DOCX_PARTS);
  if(id !== "plan" && withLogo){
    parts["[Content_Types].xml"] = parts["[Content_Types].xml"].replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"');
    parts["word/_rels/document.xml.rels"] = parts["word/_rels/document.xml.rels"].replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>');
  }
  const rr = t => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>';
  const fld = c => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> ' + c + ' </w:instrText></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>';
  const pw = id === "plan" ? 15838 : 9906;
  parts["word/footer1.xml"] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D5D9D7"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="' + pw + '"/></w:tabs><w:spacing w:before="0" w:after="0"/></w:pPr>' + rr(wfFooterText(wk, id) + "  \u00b7  " + (settings.naam || "")) + '<w:r><w:tab/></w:r>' + rr("Pagina ") + fld("PAGE") + rr(" van ") + fld("NUMPAGES") + '</w:p></w:ftr>';
  parts["word/document.xml"] = id === "plan" ? wfPlanXml(wk) : wfStyledXml(wk, id, withLogo);
  return parts;
}
const WX = {
  r: (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + '<w:color w:val="000000"/><w:sz w:val="' + (o.sz || 20) + '"/><w:szCs w:val="' + (o.sz || 20) + '"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; },
  p: (runs, o) => { o = o || {}; return '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 0 : o.after) + '" w:line="240" w:lineRule="auto"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '" w:hanging="200"/>' : '') + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '</w:pPr>' + runs + '</w:p>'; },
  tc: (w, inner, o) => { o = o || {}; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.span > 1 ? '<w:gridSpan w:val="' + o.span + '"/>' : '') + (o.vm ? '<w:vMerge' + (o.vm === "restart" ? ' w:val="restart"' : '') + '/>' : '') + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '<w:tcMar><w:top w:w="' + (o.mt == null ? 50 : o.mt) + '" w:type="dxa"/><w:bottom w:w="' + (o.mt == null ? 50 : o.mt) + '" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>' + (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + (inner || WX.p("")) + '</w:tc>'; }
};
function wfPlanXml(wk){
  const plan = planOf(wk), name = settings.naam || "";
  const tw = 700, dw = 2160, grid = [tw].concat(Array(7).fill(dw));
  const hdr = t => WX.p('<w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>', {jc: "center"});
  let rows = '<w:tr><w:trPr><w:trHeight w:val="340" w:hRule="exact"/><w:tblHeader/></w:trPr>' + WX.tc(tw, hdr(""), {fill: "00B050", va: "center", mt: 0}) + WF_DAYS.map(d => WX.tc(dw, hdr(d), {fill: "00B050", va: "center", mt: 0})).join("") + '</w:tr>';
  WF_SLOTS.forEach((t, si) => {
    let r = '<w:tr><w:trPr><w:trHeight w:val="322" w:hRule="exact"/></w:trPr>' + WX.tc(tw, WX.p(WX.r(t, {sz: 17, b: 1}), {jc: "center"}), {fill: WF_BAND_T(si), mt: 0, va: "center"});
    for(let d = 0; d < 7; d++){
      let v = ((plan[d] || {})[t]) || "";
      if(v.length > 24) v = v.slice(0, 22).trim() + "…";
      r += WX.tc(dw, WX.p(v ? WX.r(v, {sz: 17}) : ""), {fill: WF_BAND(si), mt: 0, va: "center"});
    }
    rows += r + '</w:tr>';
  });
  const head = WX.p(WX.r("Naam:  ", {sz: 22, b: 1}) + WX.r(name, {sz: 22}) + WX.r("\u00a0".repeat(14), {sz: 22}) + WX.r("Datum:  ", {sz: 22, b: 1}) + WX.r(wfDateText(wk, "plan"), {sz: 22}), {after: 120});
  const brd = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="single" w:sz="4" w:space="0" w:color="7F8C9D"/>').join("") + '</w:tblBorders>';
  const tbl = '<w:tbl><w:tblPr><w:tblW w:w="' + (tw + 7 * dw) + '" w:type="dxa"/>' + brd + '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="50" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + grid.map(g => '<w:gridCol w:w="' + g + '"/>').join("") + '</w:tblGrid>' + rows + '</w:tbl>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>' + head + tbl +
    '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>' +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="500" w:right="500" w:bottom="620" w:left="500" w:header="200" w:footer="220" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
// ---- PDF ----
function pdfAssemble(pages, W, H){
  const objs = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const fontObj = n => "<< /Type /Font /Subtype /Type1 /BaseFont /" + n + " /Encoding /WinAnsiEncoding >>";
  objs[3] = fontObj("Helvetica"); objs[4] = fontObj("Helvetica-Bold"); objs[5] = fontObj("Helvetica-Oblique");
  const kids = [];
  pages.forEach((p, i) => {
    const pid = 6 + i * 2, cid = pid + 1, stream = p.join("\n");
    objs[cid] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
    objs[pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents " + cid + " 0 R >>";
    kids.push(pid + " 0 R");
  });
  objs[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";
  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offs = [];
  for(let i = 1; i < objs.length; i++){ offs[i] = out.length; out += i + " 0 obj\n" + objs[i] + "\nendobj\n"; }
  const xref = out.length;
  out += "xref\n0 " + objs.length + "\n0000000000 65535 f \n";
  for(let i = 1; i < objs.length; i++) out += String(offs[i]).padStart(10, "0") + " 00000 n \n";
  out += "trailer\n<< /Size " + objs.length + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
  const bytes = new Uint8Array(out.length);
  for(let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return bytes;
}
function pdfKit(){
  const f = v => v.toFixed(2), hx = h => [0, 2, 4].map(i => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3)).join(" ");
  const k = {ops: [], pages: []};
  k.page = () => { k.ops = []; k.pages.push(k.ops); };
  k.txt = (s, x, y, size, font) => k.ops.push("0 0 0 rg BT /" + (font || "F1") + " " + size + " Tf " + f(x) + " " + f(y) + " Td (" + pesc(s) + ") Tj ET");
  k.fill = (x, y, w, h, hex) => k.ops.push(hx(hex) + " rg " + f(x) + " " + f(y) + " " + f(w) + " " + f(h) + " re f");
  k.line = (x1, y1, x2, y2) => k.ops.push("0 0 0 RG 0.5 w " + f(x1) + " " + f(y1) + " m " + f(x2) + " " + f(y2) + " l S");
  k.rect = (x, y, w, h) => k.ops.push("0 0 0 RG 0.5 w " + f(x) + " " + f(y) + " " + f(w) + " " + f(h) + " re S");
  return k;
}
function wfPdf(wk, id){
  return id === "plan" ? wfPlanPdf(wk) : wfStyledPdf(wk, id);
}
function wfPlanPdf(wk){
  const W = 841.89, H = 595.28, M = 24, k = pdfKit(); k.page();
  const plan = planOf(wk);
  k.txt(cp1252("Naam:"), M, H - 30, 11, "F2"); k.txt(cp1252(settings.naam || ""), M + 38, H - 30, 11, "F1");
  k.txt(cp1252("Datum:"), M + 300, H - 30, 11, "F2"); k.txt(cp1252(wfDateText(wk, "plan")), M + 343, H - 30, 11, "F1");
  const tw = 38, dw = (W - 2 * M - tw) / 7, top = H - 42, hh = 18, rh = (top - hh - 34) / WF_SLOTS.length;
  const ops = k.ops, white = s => ops.push("1 1 1 rg BT /F2 9.5 Tf " + s + " Tj ET");
  k.fill(M, top - hh, W - 2 * M, hh, "00B050");
  WF_DAYS.forEach((d, i) => { const b = cp1252(d), x = M + tw + i * dw + (dw - textW(b, 9.5, true)) / 2; ops.push("1 1 1 rg BT /F2 9.5 Tf " + x.toFixed(2) + " " + (top - hh + 5.5).toFixed(2) + " Td (" + pesc(b) + ") Tj ET"); });
  WF_SLOTS.forEach((t, si) => {
    const y = top - hh - rh * (si + 1);
    k.fill(M, y, tw, rh, WF_BAND_T(si));
    k.fill(M + tw, y, W - 2 * M - tw, rh, WF_BAND(si));
    k.txt(t, M + (tw - textW(t, 8.5, true)) / 2, y + (rh - 8.5) / 2 + 1.5, 8.5, "F2");
    for(let d = 0; d < 7; d++){
      const v = ((plan[d] || {})[t]) || ""; if(!v) continue;
      let b = cp1252(v); const maxW = dw - 8;
      if(textW(b, 8.5, false) > maxW){ while(b.length > 1 && textW(b + "\x85", 8.5, false) > maxW) b = b.slice(0, -1); b += "\x85"; }
      k.txt(b, M + tw + d * dw + 4, y + (rh - 8.5) / 2 + 1.5, 8.5, "F1");
    }
  });
  const bottom = top - hh - rh * WF_SLOTS.length;
  ops.push("0.498 0.549 0.616 RG 0.5 w");
  const L = (x1, y1, x2, y2) => ops.push(x1.toFixed(2) + " " + y1.toFixed(2) + " m " + x2.toFixed(2) + " " + y2.toFixed(2) + " l S");
  for(let si = 0; si <= WF_SLOTS.length; si++){ const y = top - hh - rh * si; L(M, y, W - M, y); }
  L(M, top, W - M, top);
  for(let c = 0; c <= 8; c++){ const x = c === 0 ? M : M + tw + (c - 1) * dw; L(x, bottom, x, top); }
  pdfFooter(k, W, M, wfFooterText(wk, "plan"));
  return pdfAssemble(k.pages, W, H);
}
function pdfFooter(k, W, M, text){
  const n = k.pages.length;
  k.pages.forEach((p, i) => {
    k.ops = p;
    k.ops.push("0.835 0.851 0.843 RG 0.5 w " + M.toFixed(2) + " 24 m " + (W - M).toFixed(2) + " 24 l S");
    const l = cp1252(text + (settings.naam ? "  \u00b7  " + settings.naam : "")), r = cp1252("Pagina " + (i + 1) + " van " + n);
    k.ops.push("0.42 0.45 0.44 rg BT /F1 8 Tf " + M.toFixed(2) + " 13 Td (" + pesc(l) + ") Tj ET");
    k.ops.push("0.42 0.45 0.44 rg BT /F1 8 Tf " + (W - M - textW(r, 8, false)).toFixed(2) + " 13 Td (" + pesc(r) + ") Tj ET");
  });
}
// ---- Wekelijkse Update en Weekendvoorbespreking in de huisstijl van de dagbeschouwing ----
// Zelfde tabel en inhoud als wfRows(wk, id); alleen de opmaak is anders.
const WFS = {
  wv: {title: "Weekendvoorbespreking", sub: "weekend van", cols: [0.2986, 0.2338, 0.2338, 0.2338]},
  upd: {title: "Wekelijkse Update", sub: "week van", cols: [0.2978, 0.0924, 0.31, 0.2998]}
};
const wfsSubtitle = (wk, id) => { const w = wfWeekInfo(wk, id); return "Week " + w.week + "  ·  " + WFS[id].sub + " " + w.range; };
// Ja/nee-cellen: "Vrijdag: Ja" → label gewoon, antwoord vet in de themakleur (of grijs als nog niet gekozen)
const wfsYn = cell => {
  if(!(cell.c || cell.i) || cell.list || cell.lines || cell.t == null || "sub" in cell) return null;
  const m = String(cell.t).match(/^(.*?:\s*)?(Ja \/ Nee|Ja|Nee)$/);
  return m ? [m[1] || "", m[2]] : null;
};
// "Voedingsbegeleiding: ja" → ["Voedingsbegeleiding: ", "ja"]
const wfsKv = t => { const i = String(t).indexOf(": "); return i < 0 ? [String(t), ""] : [t.slice(0, i + 2), t.slice(i + 2)]; };
// getal of los Ja/Nee in een smalle kolom: horizontaal centreren
const wfsMid = cell => !!cell.c && !cell.list && !cell.lines && !String(cell.t == null ? "" : cell.t).includes(":");
// rijen met de vaste kop van het formulier ervoor (alleen de weekendvoorbespreking heeft naam en datum in de tabel)
const wfsRows = (wk, id) => (id === "wv" ? [{who: 1, cells: [{t: ["Weekendvoorbespreking van:  ", settings.naam || ""], span: 3}, {t: ["Datum:  ", wfDateText(wk, id)]}]}] : []).concat(wfRows(wk, id));

function wfStyledXml(wk, id, withLogo){
  const TH = exportTheme(), GRAY = "6B7370", INK = "1F2A28", LINE = "DDD8CF", S = WFS[id];
  const r = (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + '<w:color w:val="' + (o.c || INK) + '"/>' + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + (o.sp ? '<w:spacing w:val="' + o.sp + '"/>' : '') + '</w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; };
  const p = (runs, o) => { o = o || {}; return '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 0 : o.after) + '"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '"' + (o.hang ? ' w:hanging="' + o.hang + '"' : '') + '/>' : '') + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '</w:pPr>' + runs + '</w:p>'; };
  const nb = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="nil"/>').join("") + '</w:tblBorders>';
  // kop: titel + week links, logo rechts
  const titleP = p(r(S.title, {b: 1, sz: 48, c: TH.hex}), {after: 40}) + p(r(wfsSubtitle(wk, id), {sz: 22, c: GRAY}));
  let body = "";
  if(withLogo){
    const EMU = 594360;
    const pic = '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + EMU + '" cy="' + EMU + '"/><wp:docPr id="1" name="Logo Mijn dag"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + EMU + '" cy="' + EMU + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    const htc = (w, inner) => '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/><w:tcMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tcMar><w:vAlign w:val="center"/></w:tcPr>' + inner + '</w:tc>';
    body += '<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/>' + nb + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="8200"/><w:gridCol w:w="1438"/></w:tblGrid><w:tr>' +
      htc(8200, titleP) + htc(1438, p(pic, {jc: "right"})) + '</w:tr></w:tbl>';
  } else body += titleP;
  body += p("", {after: 200});
  // wekelijkse update: naam, week en datum als vakjes (zoals bij de dagbeschouwing)
  if(id === "upd"){
    const tile = (label, value) => '<w:tc><w:tcPr><w:tcW w:w="3172" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="' + TH.softHex + '"/><w:tcMar><w:top w:w="140" w:type="dxa"/><w:bottom w:w="140" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar></w:tcPr>' +
      p(r(label, {sz: 15, c: GRAY, caps: 1, sp: 10}), {after: 40}) + p(r(value || "–", {b: 1, sz: 24})) + '</w:tc>';
    body += '<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/><w:tblCellSpacing w:w="60" w:type="dxa"/>' + nb + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="3212"/><w:gridCol w:w="3213"/><w:gridCol w:w="3213"/></w:tblGrid><w:tr>' +
      tile("Naam", settings.naam || "") + tile("Week", String(wfWeekInfo(wk, id).week)) + tile("Datum", wfDateText(wk, id)) + '</w:tr></w:tbl>' + p("", {after: 160});
  }
  // tabel
  const W = S.cols.map(x => Math.round(x * 9638)); W[3] = 9638 - W[0] - W[1] - W[2];
  const tc = (w, inner, o) => { const side = w < 1200 ? 70 : 140; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.span > 1 ? '<w:gridSpan w:val="' + o.span + '"/>' : '') + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') +
    '<w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="' + side + '" w:type="dxa"/><w:right w:w="' + side + '" w:type="dxa"/></w:tcMar>' + (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + (inner || p("")) + '</w:tc>'; };
  const lines = (t, o, po) => String(t == null ? "" : t).split("\n").map(l => p(l ? r(l, o) : "", po)).join("");
  const kvColor = v => v === "ja" ? TH.hex : v === "nee" ? GRAY : INK;
  const cellXml = (cell, first, row, w) => {
    const jc = wfsMid(cell) ? {jc: "center"} : null;
    if(row.who) return w < 3000 ? p(r(cell.t[0].trim(), {sz: 17, c: "FFFFFF"})) + p(r(cell.t[1], {sz: 21, b: 1, c: "FFFFFF"})) : p(r(cell.t[0], {sz: 19, c: "FFFFFF"}) + r(cell.t[1], {sz: 22, b: 1, c: "FFFFFF"}));
    if(row.head) return lines(cell.t, {b: 1, sz: 19, c: "FFFFFF"}, jc);
    if(first) return lines(cell.t, {b: 1, sz: 19, i: cell.i});
    if(cell.list) return cell.list.map(t => {
      if(cell.plain){ const kv = wfsKv(t); return p(r(kv[0], {sz: 17}) + r(kv[1], {sz: 17, b: 1, c: kvColor(kv[1])}), {after: 20}); }
      return p(r("•", {b: 1, c: TH.hex, sz: 18}) + r("  " + t, {sz: 17}), {ind: 200, hang: 200, after: 20});
    }).join("");
    if(cell.lines) return cell.lines.map(([l, v]) => p(r(l, {sz: 18, c: GRAY}) + (v ? r(v, {sz: 20}) : ""), {after: 30})).join("");
    const yn = wfsYn(cell);
    if(yn) return p((yn[0] ? r(yn[0], {sz: 19}) : "") + r(yn[1], {b: 1, sz: w < 1200 ? 18 : 20, c: yn[1] === "Ja / Nee" ? GRAY : TH.hex}), jc);
    if("sub" in cell) return lines(cell.t, {sz: 18, c: GRAY, i: cell.i}, {after: 30}) + lines(cell.sub, {sz: 21});
    return lines(cell.t, {sz: 21, i: cell.i}, jc);
  };
  let rows = "";
  wfsRows(wk, id).forEach(row => {
    const band = row.who || row.head;
    let col = 0, rr = '<w:tr><w:trPr><w:cantSplit/>' + (row.h ? '<w:trHeight w:val="' + row.h * 20 + '"/>' : row.who ? '<w:trHeight w:val="460"/>' : '') + (row.head ? '<w:tblHeader/>' : '') + '</w:trPr>';
    row.cells.forEach((cell, ci) => {
      const span = cell.span || 1, w = W.slice(col, col + span).reduce((a, b) => a + b, 0);
      rr += tc(w, cellXml(cell, ci === 0, row, w), {span, fill: band ? TH.hex : ci === 0 ? TH.softHex : null, va: band || cell.c ? "center" : null});
      col += span;
    });
    rows += rr + '</w:tr>';
  });
  const brd = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="single" w:sz="4" w:space="0" w:color="' + LINE + '"/>').join("") + '</w:tblBorders>';
  body += '<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/>' + brd + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' + W.map(g => '<w:gridCol w:w="' + g + '"/>').join("") + '</w:tblGrid>' + rows + '</w:tbl>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>' + body + p("") +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
}

function wfStyledPdf(wk, id){
  const W = 595.28, H = 841.89, M = 50, CW = W - 2 * M, BOTTOM = 52, S = WFS[id];
  const TH = exportTheme(), INK = [0.12, 0.16, 0.16], MUT = [0.44, 0.47, 0.46], LINE = [0.87, 0.85, 0.81], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" ");
  const k = pdfKit(); k.page();
  const txt = (s, x, yy, size, font, c) => k.ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(yy) + " Td (" + pesc(s) + ") Tj ET");
  const fill = (x, yy, w, h, c) => k.ops.push(col(c) + " rg " + f(x) + " " + f(yy) + " " + f(w) + " " + f(h) + " re f");
  const stroke = (x, yy, w, h) => k.ops.push(col(LINE) + " RG 0.7 w " + f(x) + " " + f(yy) + " " + f(w) + " " + f(h) + " re S");
  let y = H - M;
  // kop
  const bandH = 76, sh = pdfShapes(k.ops);
  sh.rrect(M, y - bandH, CW, bandH, 12, TH.rgb);
  txt(cp1252(S.title), M + 22, y - 34, 22, "F2", WHITE);
  txt(cp1252(wfsSubtitle(wk, id)), M + 22, y - 55, 11, "F1", WHITE);
  const LS = 50; pdfLogo(k.ops, M + CW - 16 - LS, y - (bandH - LS) / 2, LS, sh.rrect, sh.circle);
  y -= bandH + 14;
  // wekelijkse update: naam, week en datum als vakjes (zoals bij de dagbeschouwing)
  if(id === "upd"){
    const gap = 10, bw = (CW - 2 * gap) / 3, bh = 44;
    [["NAAM", settings.naam || "–"], ["WEEK", String(wfWeekInfo(wk, id).week)], ["DATUM", wfDateText(wk, id)]].forEach(([lb, v], i) => {
      const x = M + i * (bw + gap);
      sh.rrect(x, y - bh, bw, bh, 8, TH.soft);
      txt(cp1252(lb), x + 12, y - 15, 7.5, "F2", MUT);
      txt(cp1252(v), x + 12, y - 33, 12, "F2", INK);
    });
    y -= bh + 14;
  } else y -= 4;
  // tabel: zelfde kolomverdeling als het formulier
  const cols = S.cols.map(x => x * CW);
  const bold = font => font === "F2";
  // regels: {segs: [{t, f, s, c, x}], lh, w}
  const plain = (t, s, font, c, w, lh) => { const out = []; String(t == null ? "" : t).split("\n").forEach(par => wrap(par, s, bold(font), w).forEach(x => out.push({segs: [{t: x, f: font, s, c, x: 0}], lh, w: textW(x, s, bold(font))}))); return out; };
  const mixed = (label, lf, ls, lc, value, vf, vs, vc, w, lh) => {
    const v = cp1252(value || "");
    if(!label){ let s = vs; while(s > 7 && textW(v, s, bold(vf)) > w) s -= 0.5; return plain(value, s, vf, vc, w, lh); }
    const out = plain(label, ls, lf, lc, w, lh), last = out[out.length - 1];
    if(!v) return out;
    if(last.w + textW(v, vs, bold(vf)) <= w){ last.segs.push({t: v, f: vf, s: vs, c: vc, x: last.w}); last.w += textW(v, vs, bold(vf)); }
    else plain(value, vs, vf, vc, w, lh).forEach(x => out.push(x));
    return out;
  };
  const kvColor = v => v === "ja" ? TH.rgb : v === "nee" ? MUT : INK;
  const layout = (cell, iw, first, row) => {
    if(row.who) return mixed(cell.t[0], "F1", 9.5, WHITE, cell.t[1], "F2", 10.5, WHITE, iw, 13);
    if(row.head) return plain(cell.t, 9.5, "F2", WHITE, iw, 12);
    if(first) return plain(cell.t, 9.5, "F2", INK, iw, 12);
    if(cell.list){
      const out = [];
      cell.list.forEach(t => {
        if(cell.plain){ const kv = wfsKv(t); mixed(kv[0], "F1", 8.5, INK, kv[1], "F2", 8.5, kvColor(kv[1]), iw, 11).forEach(x => out.push(x)); }
        else wrap(t, 8.5, false, iw - 10).forEach((x, j) => out.push({segs: [{t: x, f: "F1", s: 8.5, c: INK, x: 10}], lh: 11, bullet: j === 0}));
      });
      return out;
    }
    if(cell.lines){ const out = []; cell.lines.forEach(([l, v]) => mixed(l, "F1", 9, MUT, v, "F1", 10, INK, iw, 12.5).forEach(x => out.push(x))); return out; }
    const yn = wfsYn(cell);
    if(yn) return mixed(yn[0], "F1", 9.5, INK, yn[1], "F2", 9.5, yn[1] === "Ja / Nee" ? MUT : TH.rgb, iw, 13);
    if("sub" in cell){ const out = plain(cell.t, 9, cell.i ? "F3" : "F1", MUT, iw, 12); if(cell.sub) plain(cell.sub, 10, "F1", INK, iw, 13).forEach(x => out.push(x)); return out; }
    const out = plain(cell.t, 10, cell.i ? "F3" : "F1", INK, iw, 13);
    return out.length === 1 && out[0].segs[0].t === "" ? [] : out;
  };
  const newPage = () => {
    k.page();
    txt(cp1252(S.title + "  ·  week " + wfWeekInfo(wk, id).week), M, H - 34, 8.5, "F1", MUT);
    k.ops.push(col(LINE) + " RG 0.7 w " + f(M) + " " + f(H - 42) + " m " + f(M + CW) + " " + f(H - 42) + " l S");
    y = H - 60;
  };
  wfsRows(wk, id).forEach(row => {
    const band = row.who || row.head;
    let c = 0;
    const laid = row.cells.map((cell, ci) => {
      const span = cell.span || 1, x = M + cols.slice(0, c).reduce((a, b) => a + b, 0), w = cols.slice(c, c + span).reduce((a, b) => a + b, 0), pad = w < 60 ? 4 : 6;
      c += span;
      return {cell, ci, x, w, pad, lines: layout(cell, w - 2 * pad, ci === 0 && !band, row)};
    });
    const textH = l => l.lines.reduce((a, x) => a + x.lh, 0);
    const hh = Math.max(row.h || 0, row.who ? 26 : row.head ? 20 : 0, Math.max(...laid.map(l => textH(l) + 2 * l.pad)));
    if(y - hh < BOTTOM) newPage();
    laid.forEach(l => {
      const bg = band ? TH.rgb : l.ci === 0 ? TH.soft : null;
      if(bg) fill(l.x, y - hh, l.w, hh, bg);
      let ty = (band || l.cell.c) ? y - (hh - textH(l)) / 2 - 9 : y - l.pad - 9;
      const mid = wfsMid(l.cell);
      l.lines.forEach(ln => {
        const x0 = l.x + l.pad + (mid ? Math.max(0, (l.w - 2 * l.pad - ln.w) / 2) : 0);
        if(ln.bullet) txt(cp1252("•"), x0, ty, 8.5, "F2", TH.rgb);
        ln.segs.forEach(s => txt(s.t, x0 + (s.x || 0), ty, s.s, s.f, s.c));
        ty -= ln.lh;
      });
    });
    if(!band) laid.forEach(l => stroke(l.x, y - hh, l.w, hh));
    y -= hh;
  });
  // voettekst
  k.pages.forEach((pg, i) => {
    k.ops = pg;
    const l = cp1252(wfFooterText(wk, id) + (settings.naam ? "  ·  " + settings.naam : "")), rt = cp1252("Pagina " + (i + 1) + " van " + k.pages.length);
    txt(l, M, 30, 8, "F1", MUT);
    txt(rt, M + CW - textW(rt, 8, false), 30, 8, "F1", MUT);
  });
  return pdfAssemble(k.pages, W, H);
}
window.__wf = {wfDocParts, wfPdf, prefillUpd, wfFooterText, wfWeekInfo, wfFileName: (wk, id) => wfFileName(wk, WF_FORMS.find(x => x.id === id))};

// herinnering op Invullen
function renderGreetingWf(){
  const card = $("wfRemind"); if(!card) return;
  card.innerHTML = "";
  const now = new Date(), dow = now.getDay(), tk = todayKey(), wk = mondayOf(tk);
  const sent = (wfData(wk).sent) || {};
  let txt = "", forms = [];
  if(dow === 0){ forms = ["plan", "upd"].filter(x => !sent[x]); if(forms.length) txt = forms.length === 2 ? "Vandaag: weekplanning en wekelijkse update" : "Vandaag nog: " + (forms[0] === "plan" ? "weekplanning" : "wekelijkse update"); }
  else if(dow === 3 && now.getHours() >= 17 && !sent.wv){ forms = ["wv"]; txt = "Vanavond: weekendvoorbespreking"; }
  const show = !!txt && curKey === tk;
  card.classList.toggle("hidden", !show);
  if(!show) return;
  card.appendChild(el("div", "qtitle", txt));
  const b = el("button", "linkbtn more", "Naar weekformulieren"); b.type = "button"; b.style.cssText = "margin-top:6px;font-weight:600";
  b.onclick = () => { wfWeek = wk; wfOpen = forms.length === 1 ? forms[0] : ""; showView("wf"); window.scrollTo(0, 0); };
  card.appendChild(b);
}
