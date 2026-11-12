// ---------- summary ----------
function answerText(q, e){
  const a = e.answers && e.answers[q.id];
  const txt = a ? (a.text||"").trim() : "";
  if(q.type==="score") return [e.cijfer && !/^Ik geef deze dag een \d+/m.test(txt) ? "Cijfer: "+e.cijfer : "", txt].filter(Boolean).join("\n");
  if(q.type==="scale" && a){
    if(q.doneOn.indexOf(a.level)>=0 && !txt) return q.yesText || q.noText || (q.opts.find(o=>o[0]===a.level)||[])[1] || "";
    const lab = (q.opts.find(o=>o[0]===a.level)||[])[1];
    return [lab, txt].filter(Boolean).join("\n");
  }
  return txt;
}
function summaryText(e){
  const d = daysClean(e.date);
  const lines = [
    "Naam: " + (settings.naam||""),
    "Aantal dagen nuchter/clean: " + (d===null ? "" : d),
    "Datum: " + shortDate(e.date),
    ""
  ];
  QUESTIONS.forEach((q,i)=>{
    lines.push((i+1)+". "+q.title);
    lines.push(answerText(q,e) || "-");
    lines.push("");
  });
  return lines.join("\n").trim();
}
function openSummary(e, fromHistory){
  sumEntry = e;
  $("docxMsg").textContent = "";
  $("sumText").textContent = summaryText(e);
  const n = QUESTIONS.filter(q=>isDoneIn(e,q)).length;
  let note = n===QUESTIONS.length ? "Goed gedaan, je hebt alle vragen ingevuld." : n+" van "+QUESTIONS.length+" vragen ingevuld.";
  $("sumNote").textContent = note;
  const old = $("sumDone"); if(old) old.remove();
  $("sumNote").classList.remove("hidden");
  if(!fromHistory && n === QUESTIONS.length){
    const dn = el("div", "sumdone"); dn.id = "sumDone";
    dn.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><path d="M20 33l8 8 16-17"/></svg>';
    const first = (settings.naam || "").trim().split(/\s+/)[0];
    dn.appendChild(el("div", "st", "Dag afgerond. Goed bezig" + (first ? ", " + first : "") + "."));
    $("sumNote").parentNode.insertBefore(dn, $("sumNote"));
    $("sumNote").classList.add("hidden");
  }
  $("copyMsg").textContent = "";
  const mr = $("mailRow"); mr.innerHTML = "";
  if(settings.mail){
    mr.appendChild(document.createTextNode("Versturen naar: " + settings.mail + " — kopieer eerst de tekst, dan "));
    const a = document.createElement("a");
    a.href = "mailto:" + encodeURIComponent(settings.mail).replace("%40","@") + "?subject=" + encodeURIComponent("Dagbeschouwing " + shortDate(e.date));
    a.textContent = "open je mail"; a.style.color="var(--accent)";
    mr.appendChild(a);
    mr.appendChild(document.createTextNode(" en plak de tekst erin."));
  }
  $("editDay").classList.toggle("hidden", !fromHistory);
  $("editDay").onclick = () => { $("overlay").classList.remove("show"); showView("today"); loadDay(e.date); window.scrollTo(0,0); };
  $("overlay").classList.add("show");
}
$("summaryBtn").onclick = async () => {
  const open = QUESTIONS.map((q, i) => ({q, i})).filter(o => !isDone(o.q));
  if(open.length){ showOpenQuestions(open); return; } if(dirty){ clearTimeout(saveTimer); await flush(); } openSummary(entry, false); };
$("closeSum").onclick = () => $("overlay").classList.remove("show");
$("overlay").onclick = e => { if(e.target.id==="overlay") $("overlay").classList.remove("show"); };
$("setOverlay").onclick = e => { if(e.target.id==="setOverlay") closeSettings(); };
$("copySum").onclick = async () => {
  const t = $("sumText").textContent;
  try{ await navigator.clipboard.writeText(t); $("copyMsg").textContent=""; toast("Gekopieerd. Plak het in je mail."); }
  catch(e){
    const r=document.createRange(); r.selectNodeContents($("sumText")); const s=getSelection(); s.removeAllRanges(); s.addRange(r);
    $("copyMsg").textContent="Kopiëren lukte niet automatisch. De tekst is geselecteerd: kies Kopieer.";
  }
};

const isHeaderLine = (q, line) => (q.rows||[]).length > 1 && q.rows.some(r => headerOf(r) === line);
