// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- voor mijn 1-op-1 ----------
// settings.talk = [{id, text, added, done, prio?, goal?, alsDoel?}]; settings.talkNext = "YYYY-MM-DD" (datum van de volgende 1-op-1)
let talkShowDone = false, talkTab = "doel";
const dayMonth = k => parseKey(k).toLocaleDateString(locale(), {day:"numeric", month:"long"});
const TALK_VOORBEELDEN = [["Hoe het ging met mijn weekdoel", "How my weekly goal went"], ["Een moment dat ik trek had", "A moment I had cravings"],
  ["Iets wat me dwarszit", "Something that bothers me"], ["Iets waar ik trots op ben", "Something I'm proud of"], ["Mijn stappenwerk", "My step work"],
  ["Hoe het thuis gaat", "How things are at home"]];
// twee tegels bovenaan: Weekdoel | Bespreekpunten
function renderTalkTabs(){
  const bar = $("talkTabs"); if(!bar) return;
  bar.innerHTML = ""; bar.className = "talktabs";
  const wd = weekData(mondayOf(todayKey())), open = (settings.talk || []).filter(t => !t.done).length;
  const tabs = [["doel", "target", vt("Weekdoel", "Weekly goal"), wd.goals.length ? wd.goals.filter(g => g.done).length + "/" + wd.goals.length : ""],
                ["punten", "book", vt("Bespreekpunten", "Talking points"), open ? String(open) : ""]];
  tabs.forEach(([k, ic, txt, cnt]) => {
    const b = el("button", "wdtab" + (talkTab === k ? " on" : "")); b.type = "button";
    b.setAttribute("role", "tab"); b.setAttribute("aria-selected", talkTab === k ? "true" : "false");
    b.appendChild(icon(ic, 20)); b.appendChild(el("span", null, txt));
    if(cnt) b.appendChild(el("b", "wdtabcnt", cnt));
    b.onclick = () => { if(talkTab !== k){ talkTab = k; renderTalkView(); } };
    bar.appendChild(b);
  });
  $("goalsBox").classList.toggle("hidden", talkTab !== "doel");
  $("talkBox").classList.toggle("hidden", talkTab !== "punten");
}
function renderTalkView(){ renderGoals(); renderTalk(); window.scrollTo(0, 0); }

// "over 3 dagen", "morgen", "vandaag"
function talkWanneer(k){
  const n = Math.round((parseKey(k) - parseKey(todayKey())) / 864e5);
  if(n === 0) return vt("Vandaag", "Today");
  if(n === 1) return vt("Morgen", "Tomorrow");
  if(n > 1) return vt("Over " + n + " dagen", "In " + n + " days");
  return null;
}
function talkVolgendeKaart(open){
  const c = el("div", "card wdheld");
  const rij = el("div", "wdheldrij");
  const kal = el("div", "wdkal");
  const nx = talkVolgendeDatum(), vast = talkVasteDag();
  const wanneer = nx ? talkWanneer(nx) : null;
  if(wanneer){
    const d = parseKey(nx);
    kal.appendChild(el("small", null, d.toLocaleDateString(locale(), {month: "short"}).replace(".", "")));
    kal.appendChild(el("b", null, String(d.getDate())));
  } else kal.appendChild(icon("calendar", 26));
  rij.appendChild(kal);
  const tx = el("div", "wdheldtx");
  tx.appendChild(el("div", "wdklein", vt("Mijn volgende 1-op-1", "My next 1-to-1")));
  tx.appendChild(el("div", "wdgroot", wanneer || (nx ? vt("Was op " + dayMonth(nx), "Was on " + dayMonth(nx)) : vt("Nog geen datum", "No date yet"))));
  tx.appendChild(el("div", "wdklein", open ? vt(open + (open === 1 ? " punt" : " punten") + " om te bespreken", open + (open === 1 ? " point" : " points") + " to discuss") : vt("Nog niets om te bespreken", "Nothing to discuss yet")));
  rij.appendChild(tx);
  c.appendChild(rij);
  // vaste dag: elke week vanzelf de volgende datum
  const vr = el("label", "wddatum");
  vr.appendChild(el("span", null, vt("Vaste dag", "Regular day")));
  const vs = el("select"); vs.setAttribute("aria-label", vt("Vaste dag van je 1-op-1", "Regular day of your 1-to-1"));
  const geen = el("option", null, vt("Geen vaste dag", "No regular day")); geen.value = ""; vs.appendChild(geen);
  DAY_ORDER.forEach(d => { const o = el("option", null, vt("Elke ", "Every ") + dayName(d)); o.value = String(d); vs.appendChild(o); });
  vs.value = vast == null ? "" : String(vast);
  vs.onchange = async () => {
    settings.talkDag = vs.value === "" ? null : Number(vs.value);
    if(settings.talkDag != null) settings.talkNext = "";   // de vaste dag rekent zelf de volgende datum uit
    renderTalk(); await saveSettingsNow();
  };
  vr.appendChild(vs); c.appendChild(vr);
  const dr = el("label", "wddatum");
  dr.appendChild(el("span", null, vast != null ? vt("Deze keer anders", "Different this time") : wanneer ? vt("Andere datum", "Change date") : vt("Datum kiezen", "Choose date")));
  const di = el("input"); di.type = "date"; di.value = nx; di.min = todayKey();
  di.setAttribute("aria-label", vt("Datum van je volgende 1-op-1", "Date of your next 1-to-1"));
  di.onchange = async () => { settings.talkNext = di.value || ""; renderTalk(); await saveSettingsNow(); };
  dr.appendChild(di); c.appendChild(dr);
  // korte samenvatting van de 7 dagen vóór de volgende 1-op-1 (woensdag-gesprek: woensdag t/m dinsdag)
  const [van, tot] = talkPeriode();
  // mailadres van de begeleider (voor het versturen van de samenvatting)
  const mr = el("label", "wddatum");
  mr.appendChild(el("span", null, vt("Mail begeleider", "Support worker's email")));
  const mi = el("input"); mi.type = "email"; mi.inputMode = "email"; mi.autocomplete = "off"; mi.placeholder = vt("naam@voorbeeld.nl", "name@example.com");
  mi.value = settings.talkMail || "";
  mi.onchange = async () => { settings.talkMail = mi.value.trim(); await saveSettingsNow(); };
  mr.appendChild(mi); c.appendChild(mr);
  const sv = el("button", "ghost wdsamen"); sv.type = "button";
  sv.appendChild(el("b", null, vt("Samenvatting maken en versturen (PDF)", "Make and send summary (PDF)")));
  sv.appendChild(el("small", null, dayMonth(van) + " – " + dayMonth(tot)));
  sv.onclick = () => talkVerstuur();
  c.appendChild(sv);
  return c;
}
// samenvatting maken en versturen: op de telefoon via het deelmenu (kies Mail: de PDF zit er dan al in),
// op de computer wordt de PDF opgeslagen en opent je mail met het adres van je begeleider en een onderwerp.
async function talkVerstuur(){
  const [van, tot] = talkPeriode(), naam = (settings.naam || "").trim();
  const onderwerp = vt("Samenvatting voor mijn 1-op-1", "Summary for my 1-to-1") + (naam ? " - " + naam : "") + " (" + dayMonth(van) + " - " + dayMonth(tot) + ")";
  const tekst = vt("Hoi,\n\nIn de bijlage staat mijn samenvatting voor onze 1-op-1.\n\nGroet", "Hi,\n\nAttached is my summary for our 1-to-1.\n\nRegards") + (naam ? ",\n" + naam : "");
  const bestand = vt("Samenvatting 1-op-1 ", "1-to-1 summary ") + tot + ".pdf";
  let pdf;
  try{ pdf = talkSamenvattingPdf(); }catch(e){ toast(vt("Het bestand maken lukte niet.", "Could not create the file."), true); return; }
  const touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  try{
    const file = new File([pdf], bestand, {type: "application/pdf"});
    if(touch && !(window.claude && window.claude.use) && navigator.canShare && navigator.share && navigator.canShare({files: [file]})){
      await navigator.share({files: [file], title: onderwerp, text: tekst});
    } else {
      await offerFile(bestand, pdf, "application/pdf");
      const adres = (settings.talkMail || settings.mail || "").trim();
      if(!touch){
        location.href = "mailto:" + encodeURIComponent(adres).replace("%40", "@") + "?subject=" + encodeURIComponent(onderwerp) + "&body=" + encodeURIComponent(tekst);
        toast(vt("De PDF staat in je Downloads. Voeg hem als bijlage toe aan de mail.", "The PDF is in your Downloads. Add it to the email as an attachment."));
      }
    }
    settings.talkVerstuurd = todayKey();
    if(typeof renderTalkHerinnering === "function") renderTalkHerinnering();
    await saveSettingsNow();
  }catch(e){
    if(e && (e.name === "AbortError" || e.code === "declined")) return;
    toast(vt("Versturen lukte niet. Probeer het nog eens.", "Sending did not work. Please try again."), true);
  }
}
// beginscherm: op de dag van je 1-op-1 een herinnering om de samenvatting te maken en te versturen
function renderTalkHerinnering(){
  const c = $("talkHerinnering"); if(!c) return;
  const tk = todayKey(), toon = talkVolgendeDatum() === tk && settings.talkVerstuurd !== tk;
  c.classList.toggle("hidden", !toon); c.innerHTML = "";
  if(!toon) return;
  const kop = el("div", "plankop"); kop.style.cursor = "default";
  kop.appendChild(icon("calendar", 20)); kop.appendChild(el("div", "qtitle", vt("Vandaag is je 1-op-1", "Your 1-to-1 is today")));
  c.appendChild(kop);
  const n = note(vt("Maak je samenvatting van de afgelopen week en stuur hem naar je begeleider.", "Make your summary of the past week and send it to your support worker.")); n.style.marginTop = "4px"; c.appendChild(n);
  const rij = el("div", "row"); rij.style.cssText = "margin-top:10px;gap:8px;flex-wrap:wrap";
  const ok = el("button", "primary", vt("Samenvatting versturen", "Send summary")); ok.type = "button"; ok.onclick = () => talkVerstuur();
  const nee = el("button", "ghost", vt("Niet nodig", "Not needed")); nee.type = "button";
  nee.onclick = async () => { settings.talkVerstuurd = tk; renderTalkHerinnering(); if(typeof renderMeldingen === "function") renderMeldingen(); await saveSettingsNow(); };
  rij.appendChild(ok); rij.appendChild(nee); c.appendChild(rij);
}
// de 7 dagen tot en met de dag vóór je volgende 1-op-1; zonder datum: de laatste 7 dagen
function talkPeriode(){
  const nx = talkVolgendeDatum(), tot = nx ? addDaysKey(nx, -1) : todayKey();
  return [addDaysKey(tot, -6), tot];
}
// settings.talkDag = 0 (zondag) … 6 (zaterdag) of null; settings.talkNext = een losse datum (gaat voor zolang hij niet voorbij is)
function talkVasteDag(){ const d = settings.talkDag; return typeof d === "number" && d >= 0 && d <= 6 ? d : null; }
function talkVolgendeDatum(){
  const los = settings.talkNext && /^\d{4}-\d\d-\d\d$/.test(settings.talkNext) ? settings.talkNext : "", tk = todayKey(), vast = talkVasteDag();
  if(vast == null) return los;
  if(los && los >= tk) return los;
  return addDaysKey(tk, (vast - parseKey(tk).getDay() + 7) % 7);   // vandaag telt mee
}

function talkRow(t){
  const row = el("div", "wdpunt" + (t.done ? " done" : "") + (t.prio && !t.done ? " prio" : ""));
  const vink = el("button", "wdvink" + (t.done ? " af" : "")); vink.type = "button"; vink.appendChild(icon("check", 18));
  vink.setAttribute("aria-pressed", t.done ? "true" : "false");
  vink.setAttribute("aria-label", t.done ? vt("Toch niet besproken", "Not discussed after all") : vt("Besproken", "Discussed"));
  vink.onclick = async () => { t.done = t.done ? "" : todayKey(); row.classList.toggle("done", !!t.done); vink.classList.toggle("af", !!t.done); setTimeout(renderTalk, 350); await saveSettingsNow(); };
  row.appendChild(vink);
  const tx = el("div", "wdtx"); tx.appendChild(el("span", "wdtekst", t.text));
  tx.appendChild(el("small", null, t.done ? vt("Besproken op ", "Discussed on ") + dayMonth(t.done) : vt("Toegevoegd op ", "Added on ") + dayMonth(t.added)));
  if(!t.done){
    const acts = el("div", "wdacties");
    const pr = el("button", "linkbtn" + (t.prio ? " aan" : ""), t.prio ? vt("★ Belangrijk", "★ Important") : vt("Markeer als belangrijk", "Mark as important")); pr.type = "button";
    pr.setAttribute("aria-pressed", t.prio ? "true" : "false");
    pr.onclick = async () => { t.prio = !t.prio; renderTalk(); await saveSettingsNow(); };
    acts.appendChild(pr);
    if(t.alsDoel) acts.appendChild(el("span", "wdok", vt("✓ Staat bij je weekdoelen", "✓ In your weekly goals")));
    else {
      const wd = el("button", "linkbtn", vt("Maak er een weekdoel van", "Turn into a weekly goal")); wd.type = "button";
      wd.onclick = async () => {
        const wk = mondayOf(todayKey()), d = JSON.parse(JSON.stringify(weekData(wk)));
        d.goals.push({id: newId(), text: t.text, done: "", stuck: ""}); setWeek(wk, d);
        t.alsDoel = 1; renderTalk(); renderGoals(); renderGoalsMini();
        toast(vt("Toegevoegd aan je weekdoelen van deze week.", "Added to this week's goals."));
        await saveSettingsNow();
      };
      acts.appendChild(wd);
    }
    tx.appendChild(acts);
  }
  row.appendChild(tx);
  const del = el("button", "xbtn"); del.appendChild(icon("x", 16)); del.type = "button"; del.setAttribute("aria-label", vt("Punt wissen", "Delete point"));
  del.onclick = async () => {
    if(!(await confirmDialog(vt("Bespreekpunt wissen?", "Delete talking point?"), "“" + t.text + "”" + vt(" wordt gewist.", " will be deleted."), vt("Wissen", "Delete")))) return;
    settings.talk = (settings.talk || []).filter(x => x.id !== t.id); renderTalk(); await saveSettingsNow();
  };
  row.appendChild(del);
  return row;
}
function renderTalk(){
  const box = $("talkBox"); box.innerHTML = "";
  const list = settings.talk || [];
  const open = list.filter(t => !t.done).sort((a, b) => (b.prio ? 1 : 0) - (a.prio ? 1 : 0));
  const done = list.filter(t => t.done).sort((a,b) => a.done < b.done ? 1 : -1);
  box.appendChild(talkVolgendeKaart(open.length));

  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", vt("Wat wil ik bespreken?", "What do I want to discuss?")));
  const n = note(vt("Schrijf het op zodra je eraan denkt. Vink af wat besproken is.", "Write it down as soon as you think of it. Tick off what has been discussed.")); n.style.marginTop = "4px"; c.appendChild(n);
  const add = el("div", "wdinvoer");
  const inp = el("input", "sosinp"); inp.placeholder = vt("Nieuw bespreekpunt…", "New talking point…"); inp.id = "talkInput";
  inp.setAttribute("aria-label", vt("Nieuw bespreekpunt", "New talking point"));
  const btn = el("button", "primary", vt("Toevoegen", "Add")); btn.type = "button";
  const doAdd = async () => {
    const v = inp.value.trim(); if(!v){ inp.focus(); return; }
    settings.talk = list.concat([{id: newId(), text: v, added: todayKey(), done: ""}]);
    renderTalk(); $("talkInput").focus();
    await saveSettingsNow();
  };
  btn.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
  add.appendChild(inp); add.appendChild(btn); c.appendChild(add);
  const vb = TALK_VOORBEELDEN.map(p => vt(p[0], p[1])).filter(v => !open.some(t => t.text === v));
  if(vb.length){
    const ch = el("div", "wdchips");
    vb.forEach(v => { const b = el("button", "chip", "+ " + v); b.type = "button"; b.onclick = () => { inp.value = v; inp.focus(); }; ch.appendChild(b); });
    c.appendChild(ch);
  }
  if(!open.length){ const e = note(vt("Geen open punten.", "No open points.")); e.style.marginTop = "12px"; c.appendChild(e); }
  const lijst = el("div", "wdlijst"); open.forEach(t => lijst.appendChild(talkRow(t))); c.appendChild(lijst);
  const acties = el("div"); acties.style.cssText = "display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-top:12px";
  if(open.length){
    const cp = el("button", "ghost", vt("Kopieer lijst", "Copy list")); cp.type = "button";
    cp.onclick = async () => {
      const txt = vt("Wat ik wil bespreken:\n", "What I want to discuss:\n") + open.map(t => "- " + t.text).join("\n");
      try{ await navigator.clipboard.writeText(txt); cp.textContent = vt("Gekopieerd", "Copied"); }catch(e){ cp.textContent = vt("Kopiëren lukte niet", "Copying failed"); }
      setTimeout(() => cp.textContent = vt("Kopieer lijst", "Copy list"), 1800);
    };
    acties.appendChild(cp);
  }
  if(done.length){
    const tg = el("button", "linkbtn", (talkShowDone ? "▾ " : "▸ ") + vt("Besproken (", "Discussed (") + done.length + ")"); tg.type = "button";
    tg.setAttribute("aria-expanded", talkShowDone ? "true" : "false");
    tg.onclick = () => { talkShowDone = !talkShowDone; renderTalk(); };
    acties.appendChild(tg);
  }
  if(acties.children.length) c.appendChild(acties);
  if(done.length && talkShowDone){
    const d = el("div", "wdlijst"); d.style.marginTop = "6px";
    done.forEach(t => d.appendChild(talkRow(t)));
    c.appendChild(d);
    const clr = el("button", "ghost", vt("Besproken punten wissen", "Delete discussed points")); clr.type = "button"; clr.style.marginTop = "10px";
    clr.onclick = async () => {
      if(!(await confirmDialog(vt("Besproken punten wissen?", "Delete discussed points?"), vt("Alle punten die je hebt afgevinkt, worden gewist.", "All points you have ticked off will be deleted."), vt("Wissen", "Delete")))) return;
      settings.talk = (settings.talk || []).filter(t => !t.done); renderTalk(); await saveSettingsNow();
    };
    c.appendChild(clr);
  }
  box.appendChild(c);
  renderTalkTabs();
}
