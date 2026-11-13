// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- noodplan ----------
const SOS_DEFAULT = ["Even stoppen en rustig ademhalen","Mijn sponsor of iemand uit het programma bellen","Weggaan van de plek of de mensen","Naar buiten gaan en een stuk lopen","Naar een meeting gaan (of online)","De film doorspoelen tot het eind","Wachten: de zucht gaat weer voorbij"];
const SOS_DEFAULT_EN = ["Stop for a moment and breathe calmly","Call my sponsor or someone from the programme","Leave the place or the people","Go outside and take a walk","Go to a meeting (or online)","Play the tape through to the end","Wait: the craving will pass"];
const SOS_FIXED = [{name:"Noodnummer Addisa", phone:"06 23557417"}];
let sosEdit = false, sosDraft = null;
function fmtPhone(v){
  const t = String(v || "").trim(), d = t.replace(/[^\d+]/g, "");
  if(/^06\d{8}$/.test(d)) return "06 " + d.slice(2);
  if(/^(\+|00)316\d{8}$/.test(d)) return "06 " + d.slice(-8);
  return t;
}
function el(tag, cls, txt){ const n = document.createElement(tag); if(cls) n.className = cls; if(txt != null) n.textContent = txt; return n; }
async function saveSettingsNow(){
  settings.updated = Date.now(); local.set("settings", settings);
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
}
function startSosEdit(){
  const cur = settings.sos || {};
  sosDraft = {
    steps: (cur.steps && cur.steps.length) ? cur.steps.slice() : (isEn() ? SOS_DEFAULT_EN : SOS_DEFAULT).slice(),
    contacts: (cur.contacts && cur.contacts.length) ? cur.contacts.map(c => ({name:c.name||"", phone:c.phone||""})) : [{name:vt("Mijn sponsor", "My sponsor"), phone:""}],
    reason: cur.reason || ""
  };
  sosEdit = true; renderSos();
}
const SOS_QUOTES = [
  "Deze zucht gaat voorbij. Dat heeft hij altijd gedaan.",
  "Je hoeft het alleen vandaag te doen. Alleen vandaag.",
  "Bel iemand. Je hoeft het niet alleen te doen.",
  "Speel de film door tot het eind. Hoe voel je je morgenochtend?",
  "Een moeilijk moment is nog geen moeilijke dag.",
  "Je bent sterker dan deze ene gedachte.",
  "Eerst ademhalen. Dan de volgende kleine stap.",
  "Kijk hoe ver je al gekomen bent. Dat heb jij gedaan.",
  "Wat zou je sponsor nu tegen je zeggen?",
  "Elke keer dat je dit doorstaat, laat je zien dat het kan.",
  "Je verdient een rustig hoofd. Daar werk je elke dag aan."
];
const SOS_QUOTES_EN = [
  "This craving will pass. It always has.",
  "You only have to do it today. Just for today.",
  "Call someone. You don't have to do it alone.",
  "Play the tape through to the end. How will you feel tomorrow morning?",
  "A difficult moment is not yet a difficult day.",
  "You are stronger than this one thought.",
  "Breathe first. Then the next small step.",
  "Look how far you have come. You did that.",
  "What would your sponsor say to you right now?",
  "Every time you get through this, you show that it can be done.",
  "You deserve a calm mind. You work on it every day."
];
let quoteAdd = false;
function quotesCard(){
  const wrap = el("div"); wrap.style.margin = "4px 0 14px";
  const d = daysClean(todayKey());
  const own = Array.isArray(settings.sosQuotes) ? settings.sosQuotes : [];
  const list = [];
  if(d !== null && d > 0) list.push({t: isEn() ? "You are already " + aantal(d, "", "", "day", "days") + " clean. Don't throw that away for one moment." : "Je bent al " + d + (d === 1 ? " dag" : " dagen") + " clean. Dat gooi je niet weg voor één moment."});
  (isEn() ? SOS_QUOTES_EN : SOS_QUOTES).forEach(t => list.push({t}));
  own.forEach((t, i) => list.push({t, own: i}));
  const row = el("div", "qwrap");
  const dots = el("div", "qdots");
  list.forEach(q => {
    const b = el("div", "bubble"); b.appendChild(el("div", null, q.t));
    if(q.own !== undefined){
      const x = el("button", "bdel"); x.appendChild(icon("x", 16)); x.type = "button"; x.setAttribute("aria-label", vt("Tekst weghalen", "Remove text"));
      x.onclick = async () => {
        if(!(await confirmDialog(vt("Deze tekst weghalen?", "Remove this text?"), vt("Je eigen tekst verdwijnt uit de wolkjes.", "Your own text will disappear from the bubbles."), vt("Weghalen", "Remove")))) return;
        settings.sosQuotes = own.filter((_, j) => j !== q.own); renderSos(); await saveSettingsNow();
      };
      b.appendChild(x);
    }
    row.appendChild(b); dots.appendChild(el("i"));
  });
  wrap.appendChild(row); wrap.appendChild(dots);
  const setDot = () => {
    const kids = row.children; if(!kids.length) return;
    const w = kids[0].getBoundingClientRect().width + 10;
    const n = Math.max(0, Math.min(kids.length - 1, Math.round(row.scrollLeft / w)));
    Array.from(dots.children).forEach((dd, i) => dd.classList.toggle("on", i === n));
  };
  row.addEventListener("scroll", () => requestAnimationFrame(setDot), {passive: true});
  const start = Math.floor(Math.random() * list.length);
  requestAnimationFrame(() => { const k = row.children[start]; if(k) row.scrollLeft = k.offsetLeft - row.offsetLeft - (row.clientWidth - k.clientWidth) / 2; setDot(); });

  if(quoteAdd){
    const f = el("div"); f.style.cssText = "display:flex;gap:6px;margin-top:12px";
    const inp = el("input", "sosinp"); inp.placeholder = vt("Een zin die jou helpt…", "A sentence that helps you…");
    const ok = el("button", "primary", vt("Toevoegen", "Add")); ok.type = "button"; ok.style.cssText = "flex:none;padding:10px 14px";
    const doAdd = async () => { const v = inp.value.trim(); if(!v){ inp.focus(); return; } settings.sosQuotes = own.concat([v]); quoteAdd = false; renderSos(); await saveSettingsNow(); };
    ok.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
    f.appendChild(inp); f.appendChild(ok); wrap.appendChild(f);
    requestAnimationFrame(() => inp.focus());
  } else {
    const add = el("button", "chip start", vt("+ Eigen tekst", "+ Own text")); add.type = "button"; add.style.marginTop = "10px";
    add.onclick = () => { quoteAdd = true; renderSos(); };
    wrap.appendChild(add);
  }
  return wrap;
}
function renderSos(){
  const box = $("sosBox"); box.innerHTML = "";
  if(sosEdit) return renderSosEdit(box);
  const sos = settings.sos || {};
  const steps = sos.steps || [], contacts = sos.contacts || [], reason = (sos.reason || "").trim();

  const calm = el("div", "card"); calm.style.cssText = "background:var(--warm-soft);border-color:transparent";
  calm.appendChild(el("div", "qtitle", vt("Zucht? Dit is je plan", "Craving? This is your plan")));
  const ct = note(vt("Je hebt dit plan gemaakt op een moment dat je helder was. Vertrouw daar nu op. Begin bij stap 1, neem de tijd en bel iemand als je merkt dat het niet zakt. Je hoeft het niet alleen te doen.", "You made this plan at a moment when you were clear-headed. Trust that now. Start at step 1, take your time and call someone if you notice it isn't easing. You don't have to do it alone."));
  ct.style.marginTop = "6px"; calm.appendChild(ct);
  box.appendChild(calm);
  box.appendChild(quotesCard());

  const contactCard = () => {
    const all = SOS_FIXED.concat(contacts);
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Wie kan ik bellen?", "Who can I call?")));
    all.forEach(p => {
      const r = el("div", "contact");
      const info = el("div"); info.style.cssText = "flex:1;min-width:0";
      info.appendChild(el("div", null, p.name || "Contact")).style.fontWeight = "600";
      if(p.phone) info.appendChild(el("div", null, fmtPhone(p.phone))).style.cssText = "font-size:18px;letter-spacing:.3px";
      r.appendChild(info);
      if(p.phone){
        const call = el("a", "primary", vt("Bel", "Call")); call.href = "tel:" + p.phone.replace(/[^\d+]/g, ""); r.appendChild(call);
        const cp = el("button", "ghost", vt("Kopieer", "Copy")); cp.type = "button";
        cp.onclick = async () => { try{ await navigator.clipboard.writeText(p.phone); cp.textContent = vt("Gekopieerd", "Copied"); }catch(e){ cp.textContent = vt("Lukt niet", "Failed"); } setTimeout(() => cp.textContent = vt("Kopieer", "Copy"), 1800); };
        r.appendChild(cp);
      }
      c.appendChild(r);
    });
    c.appendChild(note(vt("Opent bellen niet vanuit de app? Tik op Kopieer en plak het nummer in je telefoon.", "Calling doesn't open from the app? Tap Copy and paste the number into your phone.")));
    return c;
  };
  if(!steps.length && !contacts.length && !reason){
    box.appendChild(contactCard());
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", vt("Maak je eigen noodplan", "Make your own emergency plan")));
    const t = note(vt("Zet hier wat jij doet als de zucht opkomt, wie je nog meer kunt bellen en waarom je clean blijft. Dan heb je het meteen bij de hand als het zwaar is.", "Write down what you do when a craving comes up, who else you can call and why you stay clean. Then you have it right at hand when things get hard."));
    t.style.marginTop = "6px"; c.appendChild(t);
    const b = el("button", "primary", vt("Mijn noodplan maken", "Make my emergency plan")); b.type = "button"; b.style.marginTop = "12px"; b.onclick = startSosEdit;
    c.appendChild(b); box.appendChild(c);
    const nm0 = nextMeetingCard(); if(nm0) box.appendChild(nm0);
  } else {
    if(steps.length){
      const c = el("div", "card");
      c.appendChild(el("div", "qtitle", vt("Mijn stappen", "My steps")));
      const h = note(vt("Tik een stap aan als je hem gedaan hebt.", "Tap a step when you have done it.")); h.style.marginTop = "2px"; c.appendChild(h);
      const ol = el("ol", "soslist");
      steps.forEach((s, i) => {
        const li = el("li"); li.appendChild(el("div", "num", String(i+1))); li.appendChild(el("span", "t", s));
        li.onclick = () => { li.classList.toggle("done"); li.setAttribute("aria-pressed", li.classList.contains("done") ? "true" : "false"); };
        toetsKlik(li); li.setAttribute("aria-pressed", "false");
        ol.appendChild(li);
      });
      c.appendChild(ol); box.appendChild(c);
    }
    box.appendChild(contactCard());
    if(reason){
      const c = el("div", "card");
      c.appendChild(el("div", "qtitle", vt("Waarom ik clean blijf", "Why I stay clean")));
      const t = el("div", null, reason); t.style.cssText = "white-space:pre-wrap;margin-top:8px;font-size:17px"; c.appendChild(t);
      box.appendChild(c);
    }
    const b = el("button", "ghost", vt("Noodplan aanpassen", "Edit emergency plan")); b.type = "button"; b.onclick = startSosEdit;
    const nm = nextMeetingCard(); if(nm) box.appendChild(nm);
    const row = el("div", "row"); row.style.justifyContent = "flex-start"; row.appendChild(b); box.appendChild(row);
  }
}
function renderSosEdit(box){
  const d = sosDraft;
  const c1 = el("div", "card");
  c1.appendChild(el("div", "qtitle", vt("Mijn stappen", "My steps")));
  const n1 = note(vt("Wat doe je als de zucht opkomt? Zet de stappen in de volgorde die voor jou werkt.", "What do you do when a craving comes up? Put the steps in the order that works for you.")); n1.style.marginTop = "4px"; c1.appendChild(n1);
  d.steps.forEach((s, i) => {
    const r = el("div"); r.style.cssText = "display:flex;gap:8px;margin-top:8px;align-items:center";
    r.appendChild(el("div", "num", String(i+1)));
    const inp = el("input", "sosinp"); inp.value = s; inp.dataset.step = i; inp.placeholder = vt("Bijvoorbeeld: mijn sponsor bellen", "For example: call my sponsor");
    inp.oninput = () => { d.steps[i] = inp.value; };
    const x = el("button", "iconbtn"); x.appendChild(icon("x")); x.type = "button"; x.setAttribute("aria-label", vt("Stap weghalen", "Remove step")); x.style.flex = "none";
    x.onclick = () => { d.steps.splice(i, 1); renderSos(); };
    r.appendChild(inp); r.appendChild(x); c1.appendChild(r);
  });
  const a1 = el("button", "chip start", vt("+ Stap toevoegen", "+ Add step")); a1.type = "button"; a1.style.marginTop = "12px";
  a1.onclick = () => { d.steps.push(""); renderSos(); const l = box.querySelectorAll("[data-step]"); if(l.length) l[l.length-1].focus(); };
  c1.appendChild(a1); box.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("div", "qtitle", vt("Wie kan ik bellen?", "Who can I call?")));
  const n2 = note(vt("Het noodnummer van Addisa staat er altijd al bij. Hier zet je wie je nog meer kunt bellen.", "The Addisa emergency number is always included. Here you add who else you can call.")); n2.style.marginTop = "4px"; c2.appendChild(n2);
  d.contacts.forEach((p, i) => {
    const r = el("div"); r.style.cssText = "display:flex;gap:6px;margin-top:8px;align-items:center";
    const nm = el("input", "sosinp"); nm.value = p.name; nm.placeholder = vt("Naam", "Name"); nm.dataset.contact = i; nm.oninput = () => { p.name = nm.value; };
    const ph = el("input", "sosinp"); ph.type = "tel"; ph.inputMode = "tel"; ph.value = p.phone; ph.placeholder = vt("Bijv. 06 12345678", "E.g. 06 12345678"); ph.oninput = () => {
      const d = ph.value.replace(/[^\d+]/g, "");
      if(/^06/.test(d)){ const v = "06" + (d.length > 2 ? " " + d.slice(2) : ""); if(v !== ph.value){ ph.value = v; try{ ph.setSelectionRange(v.length, v.length); }catch(e){} } }
      p.phone = ph.value;
    }; ph.onblur = () => { ph.value = fmtPhone(ph.value); p.phone = ph.value; };
    const x = el("button", "iconbtn"); x.appendChild(icon("x")); x.type = "button"; x.setAttribute("aria-label", vt("Contact weghalen", "Remove contact")); x.style.flex = "none";
    x.onclick = () => { d.contacts.splice(i, 1); renderSos(); };
    r.appendChild(nm); r.appendChild(ph); r.appendChild(x); c2.appendChild(r);
  });
  const a2 = el("button", "chip start", vt("+ Contact toevoegen", "+ Add contact")); a2.type = "button"; a2.style.marginTop = "12px";
  a2.onclick = () => { d.contacts.push({name:"", phone:""}); renderSos(); const l = box.querySelectorAll("[data-contact]"); if(l.length) l[l.length-1].focus(); };
  c2.appendChild(a2); box.appendChild(c2);

  const c3 = el("div", "card");
  c3.appendChild(el("div", "qtitle", vt("Waarom ik clean blijf", "Why I stay clean")));
  const n3 = note(vt("Schrijf op waarvoor je het doet. Dit lees je terug als het moeilijk is.", "Write down what you do it for. You can read this back when it's hard.")); n3.style.marginTop = "4px"; c3.appendChild(n3);
  const ta = el("textarea"); ta.value = d.reason; ta.placeholder = vt("Bijvoorbeeld: voor mezelf, voor mijn familie, voor een rustig hoofd…", "For example: for myself, for my family, for a calm mind…"); ta.oninput = () => { d.reason = ta.value; };
  c3.appendChild(ta); box.appendChild(c3);

  const row = el("div", "row");
  const cancel = el("button", "ghost", vt("Annuleren", "Cancel")); cancel.type = "button"; cancel.onclick = () => { sosEdit = false; renderSos(); window.scrollTo(0,0); };
  const save = el("button", "primary", vt("Opslaan", "Save")); save.type = "button";
  save.onclick = async () => {
    settings.sos = {
      steps: d.steps.map(s => s.trim()).filter(Boolean),
      contacts: d.contacts.map(p => ({name:p.name.trim(), phone:fmtPhone(p.phone)})).filter(p => p.name || p.phone),
      reason: d.reason.trim()
    };
    sosEdit = false; renderSos(); window.scrollTo(0,0);
    await saveSettingsNow();
  };
  row.appendChild(cancel); row.appendChild(save); box.appendChild(row);
}
