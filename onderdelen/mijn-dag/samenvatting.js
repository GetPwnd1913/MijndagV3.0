// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- summary ----------
function answerText(q, e){
  const a = e.answers && e.answers[q.id];
  const txt = a ? (a.text||"").trim() : "";
  if(q.type==="score") return [e.cijfer && !/^(Ik geef deze dag een|I give this day a) \d+/m.test(txt) ? vt("Cijfer: ", "Score: ")+e.cijfer : "", txt].filter(Boolean).join("\n");
  if(q.type==="scale" && a){
    if(q.doneOn.indexOf(a.level)>=0 && !txt) return (q.yesText ? vt(q.yesText, q.yesTextEn) : q.noText ? vt(q.noText, q.noTextEn) : "") || optLabel(q, a.level) || "";
    const lab = optLabel(q, a.level);
    return [lab, txt].filter(Boolean).join("\n");
  }
  return txt;
}
function summaryText(e){
  const d = daysClean(e.date);
  const lines = [
    vt("Naam: ", "Name: ") + (settings.naam||""),
    vt("Aantal dagen nuchter/clean: ", "Days sober/clean: ") + (d===null ? "" : d),
    vt("Datum: ", "Date: ") + shortDate(e.date),
    ""
  ];
  // ochtendmoment (alleen als het is ingevuld)
  const ochR = ochtendRegels(e);
  if(ochR){ lines.push("☀ " + vt("Ochtend", "Morning")); ochR.forEach(([k, v]) => lines.push(k + ": " + v)); lines.push(""); }
  QUESTIONS.forEach((q,i)=>{
    lines.push((i+1)+". "+qTitle(q));
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
  let note = n===QUESTIONS.length ? vt("Goed gedaan, je hebt alle vragen ingevuld.", "Well done, you have answered all the questions.") : n+vt(" van ", " of ")+QUESTIONS.length+vt(" vragen ingevuld.", " questions answered.");
  $("sumNote").textContent = note;
  const old = $("sumDone"); if(old) old.remove();
  $("sumNote").classList.remove("hidden");
  if(!fromHistory && n === QUESTIONS.length){
    const dn = el("div", "sumdone"); dn.id = "sumDone";
    dn.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28"/><path d="M20 33l8 8 16-17"/></svg>';
    const first = (settings.naam || "").trim().split(/\s+/)[0];
    dn.appendChild(el("div", "st", vt("Dag afgerond. Goed bezig", "Day finished. Well done") + (first ? ", " + first : "") + "."));
    $("sumNote").parentNode.insertBefore(dn, $("sumNote"));
    $("sumNote").classList.add("hidden");
  }
  $("copyMsg").textContent = "";
  const mr = $("mailRow"); mr.innerHTML = "";
  if(settings.mail){
    mr.appendChild(document.createTextNode(vt("Versturen naar: ", "Send to: ") + settings.mail + vt(" — kopieer eerst de tekst, dan ", " — copy the text first, then ")));
    const a = document.createElement("a");
    a.href = "mailto:" + encodeURIComponent(settings.mail).replace("%40","@") + "?subject=" + encodeURIComponent(vt("Dagbeschouwing ", "Daily reflection ") + shortDate(e.date));
    a.textContent = vt("open je mail", "open your email"); a.style.color="var(--accent)";
    mr.appendChild(a);
    mr.appendChild(document.createTextNode(vt(" en plak de tekst erin.", " and paste the text into it.")));
  }
  $("editDay").classList.toggle("hidden", !fromHistory);
  $("editDay").onclick = () => { $("overlay").classList.remove("show"); showView("today"); loadDay(e.date); window.scrollTo(0,0); };
  $("overlay").classList.add("show");
}
$("summaryBtn").onclick = async () => {
  const open = QUESTIONS.map((q, i) => ({q, i})).filter(o => !isDone(o.q));
  if(open.length){ showOpenQuestions(open); return; } if(dirty){ clearTimeout(saveTimer); await flush(); }
  if(curKey === todayKey()){ try{ localStorage.setItem("dagbeschouwing:wegStap", curKey); }catch(e){} }   // op het beginscherm loopt je bolletje dan een stapje verder (keytags.js: wegMomenten)
  if(curKey === todayKey() && typeof toonDagRond === "function") toonDagRond(() => openSummary(entry, false)); else openSummary(entry, false); };
$("closeSum").onclick = () => $("overlay").classList.remove("show");
$("overlay").onclick = e => { if(e.target.id==="overlay") $("overlay").classList.remove("show"); };
$("setOverlay").onclick = e => { if(e.target.id==="setOverlay") closeSettings(); };
$("copySum").onclick = async () => {
  const t = $("sumText").textContent;
  try{ await navigator.clipboard.writeText(t); $("copyMsg").textContent=""; toast(vt("Gekopieerd. Plak het in je mail.", "Copied. Paste it into your email.")); }
  catch(e){
    const r=document.createRange(); r.selectNodeContents($("sumText")); const s=getSelection(); s.removeAllRanges(); s.addRange(r);
    $("copyMsg").textContent=vt("Kopiëren lukte niet automatisch. De tekst is geselecteerd: kies Kopieer.", "Copying did not work automatically. The text is selected: choose Copy.");
  }
};

const isHeaderLine = (q, line) => (q.rows||[]).length > 1 && q.rows.some(r => headersOf(r).indexOf(line) >= 0);

// ---------- "Je dag is rond": afsluitend scherm als alle vragen klaar zijn en je afrondt (alleen voor vandaag) ----------
// De hemel gaat tijdelijk naar nacht (een kopie van #hemel in het scherm zelf, data-laag wordt na sluiten hersteld).
function toonDagRond(opSamenvatting){
  const oud = $("dagRondScherm"); if(oud) oud.remove();
  const h = document.documentElement, terug = document.activeElement;
  const ov = el("div", "dagrondscherm"); ov.id = "dagRondScherm"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-labelledby", "dagRondTitel");
  const hemel = $("hemel");
  if(hemel){ const c = hemel.cloneNode(true); c.removeAttribute("id"); c.querySelectorAll("[id]").forEach(n => n.removeAttribute("id")); ov.appendChild(c); }
  const inh = el("div", "dagrondinhoud");
  const sluit = el("button", "dagrondsluit"); sluit.type = "button"; sluit.appendChild(icon("x", 22)); sluit.setAttribute("aria-label", vt("Sluiten", "Close"));
  const mid = el("div", "dagrondmidden");
  const ring = el("div", "rondring"); ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = '<svg viewBox="0 0 120 120"><circle class="b" cx="60" cy="60" r="56"/><circle class="v" cx="60" cy="60" r="56"/><path class="vink" d="M38 62l15 15 30-33"/></svg>';
  const t = el("h2", null, vt("Je dag is rond.", "Your day is complete.")); t.id = "dagRondTitel";
  const p = el("p", null, vt("Goed gedaan, je hebt alle " + QUESTIONS.length + " vragen ingevuld. Rust goed.", "Well done, you have answered all " + QUESTIONS.length + " questions. Rest well."));
  const kn = el("div", "dagrondknoppen");
  const b1 = el("button", "primary", vt("Bekijk je samenvatting", "View your summary")); b1.type = "button";
  const b2 = el("button", "ghost", vt("Terug naar Vandaag", "Back to Today")); b2.type = "button";
  kn.appendChild(b1); kn.appendChild(b2);
  mid.appendChild(ring); mid.appendChild(t); mid.appendChild(p); mid.appendChild(kn);
  inh.appendChild(sluit); inh.appendChild(mid); ov.appendChild(inh);
  const donker = h.hasAttribute("data-donker");
  const sluiten = () => {
    document.removeEventListener("keydown", opToets);
    ov.classList.remove("aan"); h.classList.remove("dagrond"); zetLaag();
    setTimeout(() => ov.remove(), 700);
    if(terug && terug.focus && document.contains(terug)) try{ terug.focus(); }catch(e){}
  };
  const opToets = e => { if(e.key === "Escape") sluiten(); };
  document.addEventListener("keydown", opToets);
  sluit.onclick = sluiten;
  b1.onclick = () => { sluiten(); opSamenvatting(); };
  b2.onclick = () => { sluiten(); showView("home"); };
  document.body.appendChild(ov);
  h.classList.add("dagrond"); h.setAttribute("data-laag", "nacht" + (donker ? "D" : ""));
  requestAnimationFrame(() => { ov.classList.add("aan"); b1.focus(); });
}
