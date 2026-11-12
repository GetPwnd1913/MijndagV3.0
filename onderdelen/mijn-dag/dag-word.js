// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- Word file ----------
async function offerFile(filename, data, mime){
  const dl = (window.claude && window.claude.use) ? await window.claude.use("downloads") : null;
  if(dl) return dl.save({filename, data});
  const blob = data instanceof Blob ? data : new Blob([data], {type: mime});
  // Deelmenu alleen op telefoon/tablet (touch). Op een computer gewoon downloaden:
  // Windows ondersteunt navigator.share ook, maar dan opent het Windows-deelvenster in plaats van een download.
  const touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  try{
    const file = new File([blob], filename, {type: mime});
    if(touch && navigator.canShare && navigator.share && navigator.canShare({files: [file]})){
      try{ await navigator.share({files: [file], title: filename}); return {status: "saved"}; }
      catch(err){ if(err && err.name === "AbortError") throw {code: "declined"}; }
    }
  }catch(err){ if(err && err.code === "declined") throw err; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 60000);
  return {status:"saved"};
}

let sumEntry = null;
const xesc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function wRun(text, opts){
  opts = opts || {};
  const rpr = (opts.b?"<w:b/>":"") + (opts.i?"<w:i/>":"") + (opts.color?'<w:color w:val="'+opts.color+'"/>':"") + (opts.sz?'<w:sz w:val="'+opts.sz+'"/>':"");
  return '<w:r>'+(rpr?'<w:rPr>'+rpr+'</w:rPr>':'')+'<w:t xml:space="preserve">'+xesc(text)+'</w:t></w:r>';
}
function wPara(text, opts){
  opts = opts || {};
  const spacing = '<w:spacing w:before="'+(opts.before||0)+'" w:after="'+(opts.after==null?80:opts.after)+'"/>';
  return '<w:p><w:pPr>'+spacing+'</w:pPr>'+(text?wRun(text,opts):'')+'</w:p>';
}
function wCell(paras, shade){
  return '<w:tc><w:tcPr><w:tcW w:w="9360" w:type="dxa"/>'+(shade?'<w:shd w:val="clear" w:color="auto" w:fill="'+shade+'"/>':'')+
    '<w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar></w:tcPr>'+paras+'</w:tc>';
}
function exportTheme(){
  const th = THEMES.find(x => x[0] === settings.theme) || THEMES[0];
  const hex = th[2], rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const soft = rgb.map(c => c + (1 - c) * 0.88);
  return {hex: hex.slice(1).toUpperCase(), rgb, soft, softHex: soft.map(c => Math.round(c * 255).toString(16).padStart(2, "0")).join("").toUpperCase()};
}
const LOGO_RAYS = [0,1,2,3,4,5,6,7].map(i => { const a = i * Math.PI / 4; return [256 + 46*Math.cos(a), 128 + 46*Math.sin(a), 256 + 64*Math.cos(a), 128 + 64*Math.sin(a)]; });
function logoSvg(){
  const TH = exportTheme(), hx = c => "#" + c.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
  const light = hx(TH.rgb.map(v => v * 0.82 + 0.18)), dark = hx(TH.rgb.map(v => v * 0.78));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient></defs>' +
    '<rect width="512" height="512" rx="112" fill="url(#g)"/><circle cx="256" cy="128" r="30" fill="#f4b45f"/><g stroke="#f4b45f" stroke-width="13" stroke-linecap="round">' +
    LOGO_RAYS.map(r => '<line x1="' + r[0].toFixed(1) + '" y1="' + r[1].toFixed(1) + '" x2="' + r[2].toFixed(1) + '" y2="' + r[3].toFixed(1) + '"/>').join("") +
    '</g><g fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"><path d="M100 222h92a64 64 0 0 1 64 64v136a40 40 0 0 0-40-40h-116z"/><path d="M412 222h-92a64 64 0 0 0-64 64v136a40 40 0 0 1 40-40h116z"/></g></svg>';
}
async function logoPng(size){
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(logoSvg());
  await img.decode();
  const c = document.createElement("canvas"); c.width = c.height = size;
  c.getContext("2d").drawImage(img, 0, 0, size, size);
  const blob = await new Promise(r => c.toBlob(r, "image/png"));
  return new Uint8Array(await blob.arrayBuffer());
}
window.__dagLogo = async () => Array.from(await logoPng(240));
function answerLines(q, e){
  const raw = answerText(q, e) || "";
  if(!raw.trim()) return [{t: "–", k: "empty"}];
  const a = e.answers && e.answers[q.id];
  const lab = q.type === "scale" && a ? optLabel(q, a.level) : null;
  let src = raw.split("\n");
  if(q.type === "free"){
    // vraag 1: lege regels behouden als witregel (meerdere achter elkaar = één witregel)
    src = src.filter((l, i) => l.trim() !== "" || (i > 0 && src[i-1].trim() !== ""));
    while(src.length && src[src.length-1].trim() === "") src.pop();
  } else src = src.filter(l => l.trim() !== "");
  return src.map((l, i) => {
    if(l.trim() === "") return {t: "", k: "blank"};
    if(i === 0 && lab && l === lab) return {t: l, k: "label"};
    if(isHeaderLine(q, l)) return {t: l, k: "head"};
    if(/^- /.test(l)) return {t: l.slice(2), k: "bullet"};
    if(q.type === "score" && /^(Ik geef deze dag een|Cijfer:|I give this day a|Score:)/.test(l)) return {t: l, k: "label"};
    return {t: l, k: "text"};
  });
}
const longDate2 = k => parseKey(k).toLocaleDateString(locale(), {weekday: "long", day: "numeric", month: "long", year: "numeric"});
function documentXml(e, withLogo){
  const TH = exportTheme(), d = daysClean(e.date), GRAY = "6B7370", INK = "1F2A28";
  const r = (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + (o.caps ? '<w:caps/>' : '') + '<w:color w:val="' + (o.c || INK) + '"/>' + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : '') + (o.sp ? '<w:spacing w:val="' + o.sp + '"/>' : '') + '</w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; };
  const p = (runs, o) => { o = o || {}; return '<w:p><w:pPr>' + (o.keep ? '<w:keepNext/>' : '') + (o.bdrTop ? '<w:pBdr><w:top w:val="single" w:sz="4" w:space="12" w:color="E3DED3"/></w:pBdr>' : '') + '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 60 : o.after) + '"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '"' + (o.hang ? ' w:hanging="' + o.hang + '"' : '') + '/>' : '') + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '</w:pPr>' + runs + '</w:p>'; };
  let body = "";
  const titleP = p(r(vt("Dagbeschouwing", "Daily reflection"), {b: 1, sz: 52, c: TH.hex}), {after: 40}) + p(r(cap(longDate2(e.date)) + (d !== null ? "  ·  " + aantal(d, "dag", "dagen", "day", "days") + " clean" : ""), {sz: 22, c: GRAY}), {after: 0});
  if(withLogo){
    const EMU = 594360;
    const pic = '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + EMU + '" cy="' + EMU + '"/><wp:docPr id="1" name="Logo Mijn dag"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + EMU + '" cy="' + EMU + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    const nb = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="nil"/>').join("") + '</w:tblBorders>';
    const tc = (w, inner, va) => '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/><w:tcMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tcMar><w:vAlign w:val="' + va + '"/></w:tcPr>' + inner + '</w:tc>';
    body += '<w:tbl><w:tblPr><w:tblW w:w="9638" w:type="dxa"/>' + nb + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="8200"/><w:gridCol w:w="1438"/></w:tblGrid><w:tr>' +
      tc(8200, titleP, "center") + tc(1438, p(pic, {jc: "right", after: 0}), "center") + '</w:tr></w:tbl>' + p("", {after: 200});
  } else {
    body += titleP + p("", {after: 200});
  }
  const cell = (label, value) => '<w:tc><w:tcPr><w:tcW w:w="3060" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="' + TH.softHex + '"/><w:tcMar><w:top w:w="140" w:type="dxa"/><w:bottom w:w="140" w:type="dxa"/><w:left w:w="180" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar></w:tcPr>' +
    p(r(label, {sz: 15, c: GRAY, caps: 1, sp: 10}), {after: 40}) + p(r(value || "–", {b: 1, sz: 24}), {after: 0}) + '</w:tc>';
  const none = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="nil"/>').join("") + '</w:tblBorders>';
  body += '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblCellSpacing w:w="60" w:type="dxa"/>' + none + '<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid><w:gridCol w:w="3120"/><w:gridCol w:w="3120"/><w:gridCol w:w="3120"/></w:tblGrid><w:tr>' +
    cell(vt("Naam", "Name"), settings.naam || "") + cell(vt("Dagen nuchter/clean", "Days sober/clean"), d === null ? "" : String(d)) + cell(vt("Datum", "Date"), shortDate(e.date)) + '</w:tr></w:tbl>';
  body += p(r(vt("Bij een dagbeschouwing doe je zelfonderzoek. Je gaat na wat er op de dag goed verlopen is en wat voor verbetering vatbaar is. Wees open en eerlijk.", "In a daily reflection you take a personal inventory. You look at what went well during the day and what could be better. Be open and honest."), {i: 1, sz: 19, c: GRAY}), {before: 240, after: 120});
  // ochtendmoment (alleen als het is ingevuld)
  const ochR = ochtendRegels(e);
  if(ochR){
    body += p(r("☀   ", {b: 1, sz: 24, c: "E0A020"}) + r(vt("Ochtend", "Morning"), {b: 1, sz: 23}), {keep: 1, bdrTop: 1, before: 280, after: 100});
    ochR.forEach(([k, v]) => { body += p(r(k + ": ", {b: 1, sz: 21}) + r(v, {sz: 21}), {ind: 400, after: 40}); });
  }
  QUESTIONS.forEach((q, i) => {
    body += p(r(String(i + 1) + "   ", {b: 1, sz: 24, c: TH.hex}) + r(qTitle(q), {b: 1, sz: 23}), {keep: 1, bdrTop: 1, before: 280, after: 100});
    answerLines(q, e).forEach(l => {
      if(l.k === "head") body += p(r(l.t, {b: 1, sz: 18, c: TH.hex}), {keep: 1, ind: 400, before: 100, after: 40});
      else if(l.k === "bullet") body += p(r("•", {b: 1, c: TH.hex, sz: 22}) + r("  " + l.t, {sz: 21}), {ind: 680, hang: 260, after: 30});
      else if(l.k === "label") body += p(r(l.t, {b: 1, sz: 21}), {ind: 400, after: 40});
      else if(l.k === "empty") body += p(r("–", {sz: 21, c: GRAY}), {ind: 400, after: 40});
      else if(l.k === "blank") body += p("", {ind: 400, after: 40});
      else body += p(r(l.t, {sz: 21}), {ind: 400, after: 40});
    });
  });
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>' + body +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function footerXml(e){
  const rr = t => '<w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>';
  const fld = '<w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="8A928F"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr>' + rr(vt("Mijn dag  ·  Dagbeschouwing ", "My day  ·  Daily reflection ") + shortDate(e.date) + vt("  ·  pagina ", "  ·  page ")) + fld + '</w:p></w:ftr>';
}
const DOCX_PARTS = {
  "[Content_Types].xml": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>',
  "_rels/.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  "word/_rels/document.xml.rels": '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>',
  // taal van het Word-document volgt de gekozen taal (getter: Object.assign neemt de waarde van dat moment over)
  get "word/styles.xml"(){ return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="' + locale() + '"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>'; }
};
window.__dagDocParts = (e, withLogo) => {
  const parts = Object.assign({}, DOCX_PARTS, {"word/document.xml": documentXml(e, withLogo), "word/footer1.xml": footerXml(e)});
  if(withLogo){
    parts["[Content_Types].xml"] = parts["[Content_Types].xml"].replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"');
    parts["word/_rels/document.xml.rels"] = parts["word/_rels/document.xml.rels"].replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>');
  }
  return parts;
};

$("saveDocx").onclick = async () => {
  const msg = $("docxMsg");
  if(!sumEntry) return;
  if(dirty){ clearTimeout(saveTimer); await flush(); }
  msg.textContent = vt("Bestand maken…", "Creating file…");
  try{
    if(!window.JSZip) throw {code:"nozip"};
    const zip = new JSZip();
    let logo = null; try{ logo = await logoPng(240); }catch(err){ logo = null; }
    const parts = window.__dagDocParts(sumEntry, !!logo);
    Object.keys(parts).forEach(k=>zip.file(k, parts[k]));
    if(logo) zip.file("word/media/logo.png", logo);
    const blob = await zip.generateAsync({type:"blob", mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
    await offerFile(vt("Dagbeschouwing ", "Daily reflection ")+sumEntry.date+".docx", blob, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    msg.textContent = ""; toast(vt("Bestand gemaakt. Kies Mail om het te versturen.", "File created. Choose Mail to send it."));
  }catch(err){
    const c = err && err.code;
    if(c==="declined") msg.textContent = vt("Niet opgeslagen.", "Not saved.");
    else if(c==="rate_limited") msg.textContent = vt("Even wachten en dan opnieuw proberen.", "Wait a moment and try again.");
    else if(c==="nozip") msg.textContent = vt("Het bestand kon niet worden gemaakt. Gebruik Kopieer tekst.", "The file could not be created. Use Copy text.");
    else msg.textContent = vt("Opslaan lukte niet hier. Gebruik Kopieer tekst en plak het in je mail.", "Saving did not work here. Use Copy text and paste it into your email.");
  }
};
