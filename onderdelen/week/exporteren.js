// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- exporteren ----------
function wfExportCard(wk, f){
  const c = wfCard(vt("Versturen", "Send"), vt("Maak een Word- of PDF-bestand en voeg het toe aan je mail.", "Make a Word or PDF file and attach it to your email."));
  const row = el("div", "row"); row.style.cssText = "margin-top:10px;justify-content:flex-start;gap:8px";
  const msg = note("");
  const go = async kind => {
    msg.textContent = vt("Bestand maken…", "Creating file…");
    try{
      const name = wfFileName(wk, f) + (kind === "pdf" ? ".pdf" : ".docx");
      if(kind === "pdf") await offerFile(name, wfPdf(wk, f.id), "application/pdf");
      else {
        if(!window.JSZip) throw {code: "nozip"};
        let logo = null;
        try{ logo = await logoPng(240); }catch(err){ logo = null; }
        const zip = new JSZip(), parts = wfDocParts(wk, f.id, !!logo);
        Object.keys(parts).forEach(k => zip.file(k, parts[k]));
        if(logo) zip.file("word/media/logo.png", logo);
        const blob = await zip.generateAsync({type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
        await offerFile(name, blob, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }
      const d = wfData(wk); d.sent = Object.assign({}, d.sent || {}); d.sent[f.id] = todayKey(); wfStore(wk, d); await saveSettingsNow();
      msg.textContent = ""; toast(vt("Bestand gemaakt. Kies Mail om het te versturen.", "File created. Choose Mail to send it."));
      renderGreetingWf(); flyPlane();
    }catch(err){
      const cd = err && err.code;
      msg.textContent = cd === "declined" ? vt("Niet opgeslagen.", "Not saved.") : cd === "nozip" ? vt("Het Word-bestand kon niet worden gemaakt. Probeer PDF.", "The Word file could not be created. Try PDF.") : vt("Opslaan lukte niet. Probeer het nog een keer.", "Saving did not work. Please try again.");
    }
  };
  const w = el("button", "primary", "Word"); w.type = "button"; w.onclick = () => go("docx");
  const p = el("button", "ghost", "PDF"); p.type = "button"; p.onclick = () => go("pdf");
  row.appendChild(w); row.appendChild(p); c.appendChild(row); c.appendChild(msg);
  const s = (wfData(wk).sent || {})[f.id];
  if(s){ const t = note(vt("✓ Al eens verstuurd op ", "✓ Already sent on ") + dayMonth(s) + "."); t.style.color = "var(--accent)"; c.appendChild(t); }
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
  const u = wfGet(wk, id), yn = v => v === "ja" ? vt("Ja", "Yes") : v === "nee" ? vt("Nee", "No") : vt("Ja / Nee", "Yes / No");
  if(id === "wv"){
    return [
      {cells: [{t: vt("Wat doe je vrijdag na het programma?", "What are you doing on Friday after the programme?")}, {t: u.vr || "", span: 3}], h: 70},
      {cells: [{t: vt("Wat is je planning zaterdag?", "What is your plan for Saturday?")}, {t: u.za || "", span: 3}], h: 70},
      {cells: [{t: vt("Wat is je planning zondag?", "What is your plan for Sunday?")}, {t: u.zo || "", span: 3}], h: 70},
      {cells: [{t: vt("Welke avond eet je mee in het safehouse?", "Which evenings will you eat at the safehouse?"), i: 1}, {t: vt("Vrijdag: ", "Friday: ") + yn(u.eet_vr), i: 1, c: 1}, {t: vt("Zaterdag: ", "Saturday: ") + yn(u.eet_za), i: 1, c: 1}, {t: vt("Zondag: ", "Sunday: ") + yn(u.eet_zo), i: 1, c: 1}]},
      {cells: [{t: vt("Is dit afgestemd met je huisgenoten?", "Have you agreed this with your housemates?"), i: 1}, {t: yn(u.afg_yn), i: 1, c: 1}, {t: vt("Zijn je afwas-/afdroogtaken hierop afgestemd: ", "Have your washing-up/drying tasks been arranged around this: ") + yn(u.afwas_yn), i: 1, span: 2}]},
      {cells: [{t: vt("Welke triggers verwacht je?", "What triggers do you expect?")}, {t: u.trig || "", span: 3}]},
      {cells: [{t: vt("Hoe ga je met triggers om?", "How will you deal with triggers?")}, {t: u.omgaan || "", span: 3}]},
      {cells: [{t: vt("Wie ga je bellen dit weekend?", "Who will you call this weekend?")}, {t: u.bellen || "", span: 3}]},
      {cells: [{t: vt("Welke meetings bezoek je dit weekend?", "Which meetings will you attend this weekend?")}, {t: u.meet || "", span: 3}]},
      {cells: [{t: vt("Welke dagen ben je komende week bij het programma aanwezig?", "Which days will you attend the programme next week?")}, {t: u.aanw || "", span: 3}]},
      {cells: [{t: vt("Welke dagen ben je niet bij het programma aanwezig en wat is de reden hiervan?", "Which days will you not attend the programme, and why?")}, {t: u.afw || "", span: 3}]},
      {cells: [{t: "Reminders"}, {list: WV_REMIND[0], small: 1}, {list: WV_REMIND[1], small: 1, span: 2}]}
    ];
  }
  const hulp = u.hulp || {};
  // u.hulp heeft Nederlandse sleutels; in het bestand staat de naam in de gekozen taal
  const hl = HULP.map(h => hulpNaam(h) + ": " + (hulp[h] ? vt("ja", "yes") : vt("nee", "no")));
  return [
    {cells: [{t: ""}, {t: vt("Aantal", "Number"), c: 1}, {t: "", span: 2}], head: 1},
    {cells: [{t: vt("Hoeveel meetings heb je bijgewoond?", "How many meetings did you attend?")}, {t: u.meet_n || "", c: 1}, {t: vt("Waar en wanneer?", "Where and when?"), sub: u.meet_txt, span: 2}]},
    {cells: [{t: vt("Hoe vaak heb je afgelopen week gesport, buiten het programma om", "How often did you exercise last week, outside the programme")}, {t: u.sport_n || "", c: 1}, {t: vt("Wat heb je qua sport gedaan en wanneer?", "What exercise did you do and when?"), sub: u.sport_txt, span: 2}]},
    {cells: [{t: vt("Heb je een servicepositie?", "Do you have a service position?")}, {t: u.serv_n || "", c: 1}, {t: vt("Zo ja, hoeveel, welke, waar en wanneer?", "If so, how many, which, where and when?"), sub: u.serv_txt, span: 2}]},
    {cells: [{t: vt("Heb je een sponsor", "Do you have a sponsor")}, {t: yn(u.sp_yn), c: 1}, {lines: [[vt("Hoe vaak heb je contact met je sponsor", "How often are you in contact with your sponsor"), ""], [vt("Telefonisch: ", "By phone: "), u.sp_tel], [vt("Afgesproken: ", "In person: "), u.sp_afg], [vt("Overige contactmomenten of afspraken: ", "Other contact or appointments: "), u.sp_ov], [vt("Zo nee, waarom niet: ", "If not, why not: "), u.sp_nee]], span: 2}]},
    {cells: [{t: vt("Bij welke stap ben je", "Which step are you on")}, {t: u.step_n || "", c: 1}, {t: vt("Hoe vaak, hoeveel en wanneer werk je aan je stappenwerk?", "How often, how much and when do you work on your step work?"), sub: u.step_txt, span: 2}]},
    {cells: [{t: vt("Hoe vaak heb je contact met\n(licht contact toe)", "How often are you in contact with\n(explain the contact)")}, {t: "", c: 1}, {lines: [[vt("Familie: ", "Family: "), u.c_fam], [vt("Vrienden: ", "Friends: "), u.c_vri], ["Partner: ", u.c_par], [vt("Medebewoners: ", "Housemates: "), u.c_mede], ["Fellowship: ", u.c_fellow]], span: 2}]},
    {cells: [{t: vt("Heb je alle programma onderdelen bijgewoond?", "Did you attend all parts of the programme?")}, {t: yn(u.prog_yn), c: 1}, {t: vt("Zo nee, welke niet en reden afwezigheid:", "If not, which not and reason for absence:"), sub: u.prog_txt, span: 2}]},
    {cells: [{t: vt("Ben je binnen eigen budget gebleven?", "Did you stay within your own budget?")}, {t: yn(u.budget_yn), c: 1}, {t: vt("Zo nee, licht toe:", "If not, explain:"), sub: u.budget_txt, span: 2}]},
    {cells: [{t: vt("Heb je vrijwilligerswerk?", "Do you do volunteer work?")}, {t: yn(u.vrijw_yn), c: 1}, {t: vt("Zo ja, waar, hoeveel uur en welke dagen. Zo nee, licht toe:", "If so, where, how many hours and which days. If not, explain:"), sub: u.vrijw_txt, span: 2}]},
    {cells: [{t: vt("Heb je verder dagbesteding?", "Do you have any other day activities?")}, {t: yn(u.dagb_yn), c: 1}, {t: vt("Welke:", "Which:"), sub: u.dagb_txt, span: 2}]},
    {cells: [{t: vt("Wat is je doel deze week?", "What is your goal this week?"), i: 1}, {t: u.doel || "", span: 3}]},
    {cells: [{t: vt("Werk je aan dit doel?", "Are you working on this goal?"), i: 1}, {t: yn(u.doel_yn), c: 1}, {t: vt("Zo ja, hoe?", "If so, how?"), sub: u.doel_ja, i: 1}, {t: vt("Zo nee, waarom niet", "If not, why not"), sub: u.doel_nee, i: 1}]},
    {cells: [{t: vt("Heb je jouw huishoudelijke taken (Safehouse) uitgevoerd?", "Did you do your household chores (Safehouse)?"), i: 1}, {t: yn(u.huis_yn), c: 1}, {t: vt("Ja:", "Yes:"), sub: u.huis_ja, i: 1}, {t: vt("Zo nee, waarom niet", "If not, why not"), sub: u.huis_nee, i: 1}]},
    {cells: [{t: vt("Heb je ergens extra hulp bij nodig aankomende week?", "Do you need extra help with anything in the coming week?")}, {t: "", c: 1}, {list: hl.slice(0, 6), small: 1, plain: 1, hl: hulp}, {list: hl.slice(6).concat([vt("Anders: ", "Other: ") + (u.hulp_anders || "")]), small: 1, plain: 1, hl: hulp}]},
    {cells: [{t: vt("Heb je een verzoek aan het team?", "Do you have a request for the team?")}, {t: u.verzoek || "", span: 3}], h: 40}
  ];
}

// ---- Word ----
function wfDocParts(wk, id, withLogo){
  const parts = Object.assign({}, DOCX_PARTS);
  if(withLogo){
    parts["[Content_Types].xml"] = parts["[Content_Types].xml"].replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"');
    parts["word/_rels/document.xml.rels"] = parts["word/_rels/document.xml.rels"].replace('</Relationships>', '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/></Relationships>');
  }
  const rr = t => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>';
  const fld = c => '<w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> ' + c + ' </w:instrText></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="6B7370"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>';
  const pw = id === "plan" ? 15838 : 9906;
  parts["word/footer1.xml"] = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D5D9D7"/></w:pBdr><w:tabs><w:tab w:val="right" w:pos="' + pw + '"/></w:tabs><w:spacing w:before="0" w:after="0"/></w:pPr>' + rr(wfFooterText(wk, id) + "  \u00b7  " + (settings.naam || "")) + '<w:r><w:tab/></w:r>' + rr(vt("Pagina ", "Page ")) + fld("PAGE") + rr(vt(" van ", " of ")) + fld("NUMPAGES") + '</w:p></w:ftr>';
  parts["word/document.xml"] = id === "plan" ? wfPlanXml(wk, withLogo) : wfStyledXml(wk, id, withLogo);
  return parts;
}
const WX = {
  r: (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + '<w:color w:val="000000"/><w:sz w:val="' + (o.sz || 20) + '"/><w:szCs w:val="' + (o.sz || 20) + '"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; },
  p: (runs, o) => { o = o || {}; return '<w:p><w:pPr><w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 0 : o.after) + '" w:line="240" w:lineRule="auto"/>' + (o.ind ? '<w:ind w:left="' + o.ind + '" w:hanging="200"/>' : '') + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '</w:pPr>' + runs + '</w:p>'; },
  tc: (w, inner, o) => { o = o || {}; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.span > 1 ? '<w:gridSpan w:val="' + o.span + '"/>' : '') + (o.vm ? '<w:vMerge' + (o.vm === "restart" ? ' w:val="restart"' : '') + '/>' : '') + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') + '<w:tcMar><w:top w:w="' + (o.mt == null ? 50 : o.mt) + '" w:type="dxa"/><w:bottom w:w="' + (o.mt == null ? 50 : o.mt) + '" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>' + (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + (inner || WX.p("")) + '</w:tc>'; }
};
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
// ---- weekplanning: blokken, soorten en kleuren (alleen voor de export) ----
// Blokken: staat exact dezelfde tekst op opeenvolgende halve uren in dezelfde dag, dan is dat één blok (tekst één keer bovenin).
// Een lege rij ertussen geeft twee losse blokken. De opgeslagen planning (per halfuur) verandert niet.
function planBlokken(plan){
  const out = [];
  for(let d = 0; d < 7; d++){
    const dag = plan[d] || {};
    let cur = null;
    WF_SLOTS.forEach((t, si) => {
      const v = (dag[t] || "").trim();
      if(cur && v && v === cur.tekst){ cur.s1 = si + 1; return; }
      if(cur){ out.push(cur); cur = null; }
      if(v) cur = {d, s0: si, s1: si + 1, tekst: v, soort: planSoort(v)};
    });
    if(cur) out.push(cur);
  }
  return out;
}
// Soort van een activiteit: de app kent geen soort per blok, dus we kijken naar trefwoorden (nl en en, kleine letters).
// Volgorde telt: eerst reizen ("Rijden naar Nazorg" is reistijd), dan herstel ("Stappenwerk" is herstel, geen werk),
// dan werk ("Sessie kantoor" is werk), dan vrije tijd. Niets gevonden = "overig". Losse afkortingen (NA, AA, CA) tellen
// alleen als heel woord.
const PLAN_SOORT_WOORDEN = [
  ["reizen", ["rijden", "reizen", "reistijd", "onderweg", "fietsen naar", "trein", "bus naar", "drive", "driving", "travel", "commute", "on the way"]],
  ["herstel", ["nazorg", "aftercare", "meeting", "1-op-1", "een-op-een", "1-to-1", "one-to-one", "sponsor", "stappenwerk", "step work", "steps", "programma", "programme", "program", "groep", "group", "therapie", "therapy", "begeleid", "counsel", "herstel", "recovery", "safehouse", "dagbeschouwing", "daily reflection", "just for today", "alleen voor vandaag", "na", "aa", "ca"]],
  ["werk", ["werk", "kantoor", "dagbesteding", "school", "stage", "vergadering", "office", "work", "job", "daytime activity", "internship"]],
  ["vrij", ["sport", "wandel", "walk", "fitness", "gym", "zwemmen", "swim", "voetbal", "football", "film", "movie", "gamen", "gaming", "lezen", "reading", "vrij", "free time", "rust", "relax", "hobby", "vrienden", "friends", "familie", "family", "ouders", "parents", "koffie", "coffee", "muziek", "music", "uit eten", "dinner out"]]
];
function planSoort(tekst){
  const t = " " + String(tekst || "").toLowerCase() + " ";
  for(const [soort, woorden] of PLAN_SOORT_WOORDEN) if(woorden.some(w => w.length <= 3 ? t.indexOf(" " + w.trim() + " ") >= 0 : t.indexOf(w) >= 0)) return soort;
  return "overig";
}
// zachte tinten (zwarte tekst blijft goed leesbaar) + een randje links dat ook in zwart-wit verschilt
function planSoortStijl(){
  const TH = exportTheme(), mix = (c, w) => c.map(v => v + (1 - v) * w), hx = c => c.map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  const hexRgb = h => [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const herstel = mix(TH.rgb, 0.80), herstelRand = TH.rgb.map(v => v * 0.8);
  const S = {
    herstel: {fill: herstel, rand: herstelRand, lijn: "dik", naam: [vt("Herstel", "Recovery")]},
    werk: {fill: hexRgb("F3E4CF"), rand: hexRgb("A87A4C"), lijn: "dubbel", naam: [vt("Werk", "Work")]},
    // vrije tijd: lila, behalve bij een paars, blauw of roze thema (dan zou het op herstel lijken): zacht mintgroen
    vrij: ["paars", "blauw", "roze"].indexOf(settings.theme) >= 0
      ? {fill: hexRgb("DFF0E4"), rand: hexRgb("4E8E64"), lijn: "streep", naam: [vt("Vrije tijd", "Free time")]}
      : {fill: hexRgb("ECE6F5"), rand: hexRgb("7D6AA6"), lijn: "streep", naam: [vt("Vrije tijd", "Free time")]},
    reizen: {fill: hexRgb("EFEFED"), rand: hexRgb("8A8F8D"), lijn: "stip", naam: [vt("Reizen", "Travel")], cursief: 1},
    overig: {fill: hexRgb("F6F3EE"), rand: null, lijn: "", naam: [vt("Overig", "Other")]}
  };
  Object.keys(S).forEach(k => { S[k].fillHex = hx(S[k].fill); S[k].randHex = S[k].rand ? hx(S[k].rand) : ""; });
  return S;
}
const PLAN_SOORT_VOLGORDE = ["herstel", "werk", "vrij", "reizen", "overig"];
function planDagKop(wk, d){
  const start = planWeekStart(wk), k = addDaysKey(start, d);
  return WF_DAYS[d].slice(0, 2) + " " + parseKey(k).getDate();
}
function planTitel(wk){ const f = WF_FORMS.find(x => x.id === "plan"); return f.title + " " + vt("week", "week") + " " + wfWeekInfo(wk, "plan").week; }
function planOnderTitel(wk){ const n = (settings.naam || "").trim(); return (n ? n + "  ·  " : "") + wfWeekInfo(wk, "plan").range; }

function wfPlanXml(wk, withLogo){
  const plan = planOf(wk), TH = exportTheme(), ST = planSoortStijl(), INK = "1F2A28", GRAY = "6B7370";
  const blokken = planBlokken(plan);
  const blokOp = (d, si) => blokken.find(b => b.d === d && si >= b.s0 && si < b.s1);
  const tw = 760, dw = Math.floor((15838 - tw) / 7), grid = [tw].concat(Array(7).fill(dw));
  const RH = 296;
  const mixHex = (c, w) => c.map(v => Math.round((v + (1 - v) * w) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  const tijdFill = mixHex(TH.rgb, 0.95), kopFill = mixHex(TH.rgb, 0.86), wkndFill = "F6ECE2";
  const run = (t, o) => { o = o || {}; return '<w:r><w:rPr>' + (o.b ? '<w:b/>' : '') + (o.i ? '<w:i/>' : '') + '<w:color w:val="' + (o.c || INK) + '"/><w:sz w:val="' + (o.sz || 18) + '"/><w:szCs w:val="' + (o.sz || 18) + '"/></w:rPr><w:t xml:space="preserve">' + xesc(t) + '</w:t></w:r>'; };
  const par = (runs, o) => { o = o || {}; return '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="' + (o.line || 220) + '" w:lineRule="auto"/>' + (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : '') + '</w:pPr>' + runs + '</w:p>'; };
  const randXml = st => {
    if(!st || !st.lijn) return "";
    const v = st.lijn === "dik" ? ' w:val="single" w:sz="24"' : st.lijn === "dubbel" ? ' w:val="double" w:sz="6"' : st.lijn === "streep" ? ' w:val="dashed" w:sz="12"' : ' w:val="dotted" w:sz="12"';
    return '<w:left' + v + ' w:space="0" w:color="' + st.randHex + '"/>';
  };
  const cel = (w, inner, o) => '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.vm ? '<w:vMerge' + (o.vm === "restart" ? ' w:val="restart"' : '') + '/>' : '') +
    ((o.top || o.rand) ? '<w:tcBorders>' + (o.top ? '<w:top w:val="single" w:sz="' + (o.top === "uur" ? 6 : 2) + '" w:space="0" w:color="' + (o.top === "uur" ? "DAD5CC" : "EFEBE4") + '"/>' : '') + (o.rand || "") + '</w:tcBorders>' : '') +
    (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') +
    '<w:tcMar><w:top w:w="' + (o.mt == null ? 30 : o.mt) + '" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:left w:w="' + (o.ml == null ? 90 : o.ml) + '" w:type="dxa"/><w:right w:w="60" w:type="dxa"/></w:tcMar>' +
    (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + (inner || par("")) + '</w:tc>';
  // kop: dagen met datum, weekend een iets andere tint
  let rows = '<w:tr><w:trPr><w:trHeight w:val="380" w:hRule="exact"/><w:tblHeader/></w:trPr>' + cel(tw, par(""), {fill: kopFill, va: "center", mt: 0}) +
    WF_DAYS.map((dn, d) => cel(dw, par(run(planDagKop(wk, d), {b: 1, sz: 20}), {jc: "center"}), {fill: d >= 5 ? wkndFill : kopFill, va: "center", mt: 0})).join("") + '</w:tr>';
  WF_SLOTS.forEach((t, si) => {
    const heel = /\.00$/.test(t), lijn = heel ? "uur" : "half";
    let r = '<w:tr><w:trPr><w:trHeight w:val="' + RH + '" w:hRule="exact"/></w:trPr>' +
      cel(tw, par(heel ? run(t, {b: 1, sz: 17}) : run(t, {sz: 13, c: GRAY})), {fill: tijdFill, mt: 20, ml: 80, top: lijn});
    for(let d = 0; d < 7; d++){
      const b = blokOp(d, si);
      if(!b){ r += cel(dw, par(""), {top: lijn}); continue; }
      const st = ST[b.soort], rijen = b.s1 - b.s0;
      if(si === b.s0){
        // tekst één keer bovenin; lange tekst wordt ingekort zodat hij in het blok past
        const max = Math.max(1, Math.floor(rijen * 1.3)) * 23;
        const tx = b.tekst.length > max ? b.tekst.slice(0, max - 1).trim() + "…" : b.tekst;
        r += cel(dw, par(run(tx, {sz: 18, i: st.cursief, c: st.cursief ? GRAY : INK})), {vm: rijen > 1 ? "restart" : "", fill: st.fillHex, rand: randXml(st), top: lijn});
      } else r += cel(dw, par(""), {vm: "continue", fill: st.fillHex, rand: randXml(st)});
    }
    rows += r + '</w:tr>';
  });
  const brd = '<w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="DAD5CC"/><w:left w:val="single" w:sz="6" w:space="0" w:color="DAD5CC"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="DAD5CC"/><w:right w:val="single" w:sz="6" w:space="0" w:color="DAD5CC"/><w:insideH w:val="nil"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E6E1D8"/></w:tblBorders>';
  const tbl = '<w:tbl><w:tblPr><w:tblW w:w="' + (tw + 7 * dw) + '" w:type="dxa"/>' + brd + '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + grid.map(g => '<w:gridCol w:w="' + g + '"/>').join("") + '</w:tblGrid>' + rows + '</w:tbl>';
  // titelbalk in de stijl van de dagbeschouwing: kleurbalk met titel, naam en datums, logo rechts
  const nb = '<w:tblBorders>' + ["top","left","bottom","right","insideH","insideV"].map(x => '<w:' + x + ' w:val="nil"/>').join("") + '</w:tblBorders>';
  const titel = par(run(planTitel(wk), {b: 1, sz: 32, c: "FFFFFF"}), {line: 240}) + par(run(planOnderTitel(wk), {sz: 19, c: "FFFFFF"}), {line: 240});
  let band;
  if(withLogo){
    const EMU = 420000;
    const pic = '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + EMU + '" cy="' + EMU + '"/><wp:docPr id="1" name="Logo Mijn dag"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId3"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + EMU + '" cy="' + EMU + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    band = '<w:tr><w:trPr><w:trHeight w:val="760" w:hRule="exact"/></w:trPr>' + cel(14838, titel, {fill: TH.hex, va: "center", mt: 0, ml: 240}) + cel(1000, par(pic, {jc: "right"}), {fill: TH.hex, va: "center", mt: 0, ml: 0}) + '</w:tr>';
  } else band = '<w:tr><w:trPr><w:trHeight w:val="760" w:hRule="exact"/></w:trPr>' + cel(14838, titel, {fill: TH.hex, va: "center", mt: 0, ml: 240}) + cel(1000, par(""), {fill: TH.hex, mt: 0}) + '</w:tr>';
  const bandTbl = '<w:tbl><w:tblPr><w:tblW w:w="15838" w:type="dxa"/>' + nb + '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="14838"/><w:gridCol w:w="1000"/></w:tblGrid>' + band + '</w:tbl>';
  // legenda (tweetalig), met hetzelfde randje als in de planning
  const leg = '<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/>' + nb + '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + PLAN_SOORT_VOLGORDE.map(() => '<w:gridCol w:w="360"/><w:gridCol w:w="1440"/>').join("") + '</w:tblGrid><w:tr><w:trPr><w:trHeight w:val="240" w:hRule="exact"/></w:trPr>' +
    PLAN_SOORT_VOLGORDE.map(s => { const st = ST[s]; return cel(360, par(""), {fill: st.fillHex, rand: randXml(st), mt: 0}) + cel(1440, par(run(st.naam[0], {sz: 15, c: GRAY, i: st.cursief})), {mt: 0, ml: 80, va: "center"}); }).join("") + '</w:tr></w:tbl>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>' +
    bandTbl + par("", {line: 140}) + tbl + par("", {line: 100}) + leg +
    '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="20" w:lineRule="exact"/></w:pPr></w:p>' +
    '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="460" w:right="500" w:bottom="600" w:left="500" w:header="200" w:footer="220" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function wfPlanPdf(wk){
  const W = 841.89, H = 595.28, M = 22, k = pdfKit(); k.page();
  const plan = planOf(wk), TH = exportTheme(), ST = planSoortStijl(), ops = k.ops, sh = pdfShapes(ops);
  const INK = [0.12, 0.16, 0.16], MUT = [0.42, 0.45, 0.44], WHITE = [1, 1, 1];
  const f = v => v.toFixed(2), col = c => c.map(v => v.toFixed(3)).join(" "), mix = (c, w) => c.map(v => v + (1 - v) * w);
  const txt = (s, x, y, size, font, c) => ops.push(col(c || INK) + " rg BT /" + font + " " + size + " Tf " + f(x) + " " + f(y) + " Td (" + pesc(s) + ") Tj ET");
  const fill = (x, y, w, h, c) => ops.push(col(c) + " rg " + f(x) + " " + f(y) + " " + f(w) + " " + f(h) + " re f");
  const lijn = (x1, y1, x2, y2, c, w) => ops.push(col(c) + " RG " + w + " w [] 0 d " + f(x1) + " " + f(y1) + " m " + f(x2) + " " + f(y2) + " l S");
  // randje links per soort (ook in zwart-wit te onderscheiden): dik, dubbel, gestreept, gestippeld
  const rand = (st, x, yTop, h) => {
    if(!st.rand) return;
    const c = col(st.rand), y0 = f(yTop - h + 1.2), y1 = f(yTop - 1.2);
    if(st.lijn === "dik") fill(x, yTop - h + 0.8, 2.8, h - 1.6, st.rand);
    else if(st.lijn === "dubbel"){ fill(x, yTop - h + 0.8, 1, h - 1.6, st.rand); fill(x + 2, yTop - h + 0.8, 1, h - 1.6, st.rand); }
    else if(st.lijn === "streep") ops.push(c + " RG 2.4 w 0 J [3 2] 0 d " + f(x + 1.3) + " " + y0 + " m " + f(x + 1.3) + " " + y1 + " l S [] 0 d");
    else ops.push(c + " RG 2.2 w 1 J [0.1 3] 0 d " + f(x + 1.3) + " " + y0 + " m " + f(x + 1.3) + " " + y1 + " l S [] 0 d 0 J");
  };
  // titelbalk
  const bandH = 40, top = H - M;
  sh.rrect(M, top - bandH, W - 2 * M, bandH, 9, TH.rgb);
  txt(cp1252(planTitel(wk)), M + 16, top - 18, 15, "F2", WHITE);
  txt(cp1252(planOnderTitel(wk)), M + 16, top - 32, 9.5, "F1", WHITE);
  const LS = 30; pdfLogo(ops, W - M - 8 - LS, top - (bandH - LS) / 2, LS, sh.rrect, sh.circle);
  // raster
  const tw = 40, dw = (W - 2 * M - tw) / 7, gTop = top - bandH - 8, hh = 20, rTop = gTop - hh, bottom = 46, rh = (rTop - bottom) / WF_SLOTS.length;
  const LH = 10.4, FS = 9;
  fill(M, rTop - rh * WF_SLOTS.length, tw, rh * WF_SLOTS.length, mix(TH.rgb, 0.95));
  WF_DAYS.forEach((dn, d) => {
    const x = M + tw + d * dw;
    fill(x, rTop, dw, hh, d >= 5 ? [0.965, 0.925, 0.886] : mix(TH.rgb, 0.86));
    const b = cp1252(planDagKop(wk, d)); txt(b, x + (dw - textW(b, 10, true)) / 2, rTop + 6.5, 10, "F2", INK);
  });
  fill(M, rTop, tw, hh, mix(TH.rgb, 0.86));
  WF_SLOTS.forEach((t, si) => {
    const y = rTop - rh * si, heel = /\.00$/.test(t);
    lijn(heel ? M : M + tw, y, W - M, y, heel ? [0.855, 0.835, 0.8] : [0.937, 0.922, 0.894], heel ? 0.6 : 0.35);
    if(heel) txt(t, M + 5, y - 10.2, 8.5, "F2", INK); else txt(t, M + 7, y - 9.6, 7, "F1", MUT);
  });
  for(let c = 0; c <= 8; c++){ const x = c === 0 ? M : M + tw + (c - 1) * dw; lijn(x, bottom, x, gTop, [0.88, 0.86, 0.82], c === 0 || c === 8 ? 0.6 : 0.4); }
  lijn(M, gTop, W - M, gTop, [0.855, 0.835, 0.8], 0.6); lijn(M, bottom, W - M, bottom, [0.855, 0.835, 0.8], 0.6);
  // blokken: één vlak per aaneengesloten activiteit, tekst links bovenin, netjes afgebroken of ingekort
  planBlokken(plan).forEach(b => {
    const st = ST[b.soort], x = M + tw + b.d * dw + 0.7, yTop = rTop - rh * b.s0 - 0.7, h = rh * (b.s1 - b.s0) - 1.4, w = dw - 1.4;
    fill(x, yTop - h, w, h, st.fill); rand(st, x, yTop, h);
    const font = st.cursief ? "F3" : "F1", c = st.cursief ? MUT : INK, maxW = w - 9 - 3;
    const max = Math.max(1, Math.floor((h - 2) / LH));
    let regels = wrap(cp1252(b.tekst), FS, false, maxW);
    if(regels.length > max){
      regels = regels.slice(0, max);
      let last = regels[max - 1];
      while(last.length > 1 && textW(last + "\x85", FS, false) > maxW) last = last.slice(0, -1);
      regels[max - 1] = last.replace(/\s+$/, "") + "\x85";
    }
    regels.forEach((r, i) => {
      let s = r; while(s.length > 1 && textW(s, FS, false) > maxW) s = s.slice(0, -1);
      txt(s, x + 8, yTop - 10.3 - i * LH, FS, font, c);
    });
  });
  // legenda
  let lx = M;
  PLAN_SOORT_VOLGORDE.forEach(s => {
    const st = ST[s]; fill(lx, 30, 14, 9, st.fill); rand(st, lx, 39, 9);
    const n = cp1252(st.naam[0]); txt(n, lx + 19, 31.5, 8, st.cursief ? "F3" : "F1", MUT);
    lx += 19 + textW(n, 8, false) + 18;
  });
  pdfFooter(k, W, M, wfFooterText(wk, "plan"));
  return pdfAssemble(k.pages, W, H);
}
function pdfFooter(k, W, M, text){
  const n = k.pages.length;
  k.pages.forEach((p, i) => {
    k.ops = p;
    k.ops.push("0.835 0.851 0.843 RG 0.5 w " + M.toFixed(2) + " 24 m " + (W - M).toFixed(2) + " 24 l S");
    const l = cp1252(text + (settings.naam ? "  \u00b7  " + settings.naam : "")), r = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + n);
    k.ops.push("0.42 0.45 0.44 rg BT /F1 8 Tf " + M.toFixed(2) + " 13 Td (" + pesc(l) + ") Tj ET");
    k.ops.push("0.42 0.45 0.44 rg BT /F1 8 Tf " + (W - M - textW(r, 8, false)).toFixed(2) + " 13 Td (" + pesc(r) + ") Tj ET");
  });
}
// ---- Wekelijkse Update en Weekendvoorbespreking in de huisstijl van de dagbeschouwing ----
// Zelfde tabel en inhoud als wfRows(wk, id); alleen de opmaak is anders.
const WFS = {
  wv: {get title(){ return vt("Weekendvoorbespreking", "Weekend plan"); }, get sub(){ return vt("weekend van", "weekend of"); }, cols: [0.2986, 0.2338, 0.2338, 0.2338]},
  upd: {get title(){ return vt("Wekelijkse Update", "Weekly update"); }, get sub(){ return vt("week van", "week of"); }, cols: [0.2978, 0.0924, 0.31, 0.2998]}
};
const wfsSubtitle = (wk, id) => { const w = wfWeekInfo(wk, id); return "Week " + w.week + "  ·  " + WFS[id].sub + " " + w.range; };
// Ja/nee-cellen: "Vrijdag: Ja" → label gewoon, antwoord vet in de themakleur (of grijs als nog niet gekozen)
const wfsYn = cell => {
  if(!(cell.c || cell.i) || cell.list || cell.lines || cell.t == null || "sub" in cell) return null;
  const m = String(cell.t).match(/^(.*?:\s*)?(Ja \/ Nee|Ja|Nee|Yes \/ No|Yes|No)$/);
  return m ? [m[1] || "", m[2]] : null;
};
// "Voedingsbegeleiding: ja" → ["Voedingsbegeleiding: ", "ja"]
const wfsKv = t => { const i = String(t).indexOf(": "); return i < 0 ? [String(t), ""] : [t.slice(0, i + 2), t.slice(i + 2)]; };
// getal of los Ja/Nee in een smalle kolom: horizontaal centreren
const wfsMid = cell => !!cell.c && !cell.list && !cell.lines && !String(cell.t == null ? "" : cell.t).includes(":");
// rijen met de vaste kop van het formulier ervoor (alleen de weekendvoorbespreking heeft naam en datum in de tabel)
const wfsRows = (wk, id) => (id === "wv" ? [{who: 1, cells: [{t: [vt("Weekendvoorbespreking van:  ", "Weekend plan of:  "), settings.naam || ""], span: 3}, {t: [vt("Datum:  ", "Date:  "), wfDateText(wk, id)]}]}] : []).concat(wfRows(wk, id));
const wfsNiet = v => v === "Ja / Nee" || v === "Yes / No";
const wfsJa = v => v === "ja" || v === "yes", wfsNee = v => v === "nee" || v === "no";

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
      tile(vt("Naam", "Name"), settings.naam || "") + tile("Week", String(wfWeekInfo(wk, id).week)) + tile(vt("Datum", "Date"), wfDateText(wk, id)) + '</w:tr></w:tbl>' + p("", {after: 160});
  }
  // tabel
  const W = S.cols.map(x => Math.round(x * 9638)); W[3] = 9638 - W[0] - W[1] - W[2];
  const tc = (w, inner, o) => { const side = w < 1200 ? 70 : 140; return '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (o.span > 1 ? '<w:gridSpan w:val="' + o.span + '"/>' : '') + (o.fill ? '<w:shd w:val="clear" w:color="auto" w:fill="' + o.fill + '"/>' : '') +
    '<w:tcMar><w:top w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:left w:w="' + side + '" w:type="dxa"/><w:right w:w="' + side + '" w:type="dxa"/></w:tcMar>' + (o.va ? '<w:vAlign w:val="' + o.va + '"/>' : '') + '</w:tcPr>' + (inner || p("")) + '</w:tc>'; };
  const lines = (t, o, po) => String(t == null ? "" : t).split("\n").map(l => p(l ? r(l, o) : "", po)).join("");
  const kvColor = v => wfsJa(v) ? TH.hex : wfsNee(v) ? GRAY : INK;
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
    if(yn) return p((yn[0] ? r(yn[0], {sz: 19}) : "") + r(yn[1], {b: 1, sz: w < 1200 ? 18 : 20, c: wfsNiet(yn[1]) ? GRAY : TH.hex}), jc);
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
    [[vt("NAAM", "NAME"), settings.naam || "–"], ["WEEK", String(wfWeekInfo(wk, id).week)], [vt("DATUM", "DATE"), wfDateText(wk, id)]].forEach(([lb, v], i) => {
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
  const kvColor = v => wfsJa(v) ? TH.rgb : wfsNee(v) ? MUT : INK;
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
    if(yn) return mixed(yn[0], "F1", 9.5, INK, yn[1], "F2", 9.5, wfsNiet(yn[1]) ? MUT : TH.rgb, iw, 13);
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
    const l = cp1252(wfFooterText(wk, id) + (settings.naam ? "  ·  " + settings.naam : "")), rt = cp1252(vt("Pagina ", "Page ") + (i + 1) + vt(" van ", " of ") + k.pages.length);
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
  if(dow === 0){ forms = ["plan", "upd"].filter(x => !sent[x]); if(forms.length) txt = forms.length === 2 ? vt("Vandaag: weekplanning en wekelijkse update", "Today: weekly planning and weekly update") : vt("Vandaag nog: ", "Still to do today: ") + (forms[0] === "plan" ? vt("weekplanning", "weekly planning") : vt("wekelijkse update", "weekly update")); }
  else if(dow === 3 && now.getHours() >= 17 && !sent.wv){ forms = ["wv"]; txt = vt("Vanavond: weekendvoorbespreking", "Tonight: weekend plan"); }
  const show = !!txt && curKey === tk;
  card.classList.toggle("hidden", !show);
  if(!show) return;
  card.appendChild(el("div", "qtitle", txt));
  const b = el("button", "linkbtn more", vt("Naar weekformulieren", "Go to weekly forms")); b.type = "button"; b.style.cssText = "margin-top:6px;font-weight:600";
  b.onclick = () => { wfWeek = wk; wfOpen = forms.length === 1 ? forms[0] : ""; showView("wf"); window.scrollTo(0, 0); };
  card.appendChild(b);
}
