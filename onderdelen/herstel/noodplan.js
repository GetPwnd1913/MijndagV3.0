// ---------- noodplan ----------
const SOS_DEFAULT = ["Even stoppen en rustig ademhalen","Mijn sponsor of iemand uit het programma bellen","Weggaan van de plek of de mensen","Naar buiten gaan en een stuk lopen","Naar een meeting gaan (of online)","De film doorspoelen tot het eind","Wachten: de zucht gaat weer voorbij"];
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
    steps: (cur.steps && cur.steps.length) ? cur.steps.slice() : SOS_DEFAULT.slice(),
    contacts: (cur.contacts && cur.contacts.length) ? cur.contacts.map(c => ({name:c.name||"", phone:c.phone||""})) : [{name:"Mijn sponsor", phone:""}],
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
let quoteAdd = false;
function quotesCard(){
  const wrap = el("div"); wrap.style.margin = "4px 0 14px";
  const d = daysClean(todayKey());
  const own = Array.isArray(settings.sosQuotes) ? settings.sosQuotes : [];
  const list = [];
  if(d !== null && d > 0) list.push({t: "Je bent al " + d + (d === 1 ? " dag" : " dagen") + " clean. Dat gooi je niet weg voor één moment."});
  SOS_QUOTES.forEach(t => list.push({t}));
  own.forEach((t, i) => list.push({t, own: i}));
  const row = el("div", "qwrap");
  const dots = el("div", "qdots");
  list.forEach(q => {
    const b = el("div", "bubble"); b.appendChild(el("div", null, q.t));
    if(q.own !== undefined){
      const x = el("button", "bdel"); x.appendChild(icon("x", 16)); x.type = "button"; x.setAttribute("aria-label", "Tekst weghalen");
      x.onclick = async () => {
        if(!(await confirmDialog("Deze tekst weghalen?", "Je eigen tekst verdwijnt uit de wolkjes.", "Weghalen"))) return;
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
    const inp = el("input", "sosinp"); inp.placeholder = "Een zin die jou helpt…";
    const ok = el("button", "primary", "Toevoegen"); ok.type = "button"; ok.style.cssText = "flex:none;padding:10px 14px";
    const doAdd = async () => { const v = inp.value.trim(); if(!v){ inp.focus(); return; } settings.sosQuotes = own.concat([v]); quoteAdd = false; renderSos(); await saveSettingsNow(); };
    ok.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
    f.appendChild(inp); f.appendChild(ok); wrap.appendChild(f);
    requestAnimationFrame(() => inp.focus());
  } else {
    const add = el("button", "chip start", "+ Eigen tekst"); add.type = "button"; add.style.marginTop = "10px";
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
  calm.appendChild(el("div", "qtitle", "Zucht? Dit is je plan"));
  const ct = note("Je hebt dit plan gemaakt op een moment dat je helder was. Vertrouw daar nu op. Begin bij stap 1, neem de tijd en bel iemand als je merkt dat het niet zakt. Je hoeft het niet alleen te doen.");
  ct.style.marginTop = "6px"; calm.appendChild(ct);
  box.appendChild(calm);
  box.appendChild(quotesCard());

  const contactCard = () => {
    const all = SOS_FIXED.concat(contacts);
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", "Wie kan ik bellen?"));
    all.forEach(p => {
      const r = el("div", "contact");
      const info = el("div"); info.style.cssText = "flex:1;min-width:0";
      info.appendChild(el("div", null, p.name || "Contact")).style.fontWeight = "600";
      if(p.phone) info.appendChild(el("div", null, fmtPhone(p.phone))).style.cssText = "font-size:18px;letter-spacing:.3px";
      r.appendChild(info);
      if(p.phone){
        const call = el("a", "primary", "Bel"); call.href = "tel:" + p.phone.replace(/[^\d+]/g, ""); r.appendChild(call);
        const cp = el("button", "ghost", "Kopieer"); cp.type = "button";
        cp.onclick = async () => { try{ await navigator.clipboard.writeText(p.phone); cp.textContent = "Gekopieerd"; }catch(e){ cp.textContent = "Lukt niet"; } setTimeout(() => cp.textContent = "Kopieer", 1800); };
        r.appendChild(cp);
      }
      c.appendChild(r);
    });
    c.appendChild(note("Opent bellen niet vanuit de app? Tik op Kopieer en plak het nummer in je telefoon."));
    return c;
  };
  if(!steps.length && !contacts.length && !reason){
    box.appendChild(contactCard());
    const c = el("div", "card");
    c.appendChild(el("div", "qtitle", "Maak je eigen noodplan"));
    const t = note("Zet hier wat jij doet als de zucht opkomt, wie je nog meer kunt bellen en waarom je clean blijft. Dan heb je het meteen bij de hand als het zwaar is.");
    t.style.marginTop = "6px"; c.appendChild(t);
    const b = el("button", "primary", "Mijn noodplan maken"); b.type = "button"; b.style.marginTop = "12px"; b.onclick = startSosEdit;
    c.appendChild(b); box.appendChild(c);
    const nm0 = nextMeetingCard(); if(nm0) box.appendChild(nm0);
  } else {
    if(steps.length){
      const c = el("div", "card");
      c.appendChild(el("div", "qtitle", "Mijn stappen"));
      const h = note("Tik een stap aan als je hem gedaan hebt."); h.style.marginTop = "2px"; c.appendChild(h);
      const ol = el("ol", "soslist");
      steps.forEach((s, i) => {
        const li = el("li"); li.appendChild(el("div", "num", String(i+1))); li.appendChild(el("span", "t", s));
        li.onclick = () => li.classList.toggle("done");
        ol.appendChild(li);
      });
      c.appendChild(ol); box.appendChild(c);
    }
    box.appendChild(contactCard());
    if(reason){
      const c = el("div", "card");
      c.appendChild(el("div", "qtitle", "Waarom ik clean blijf"));
      const t = el("div", null, reason); t.style.cssText = "white-space:pre-wrap;margin-top:8px;font-size:17px"; c.appendChild(t);
      box.appendChild(c);
    }
    const b = el("button", "ghost", "Noodplan aanpassen"); b.type = "button"; b.onclick = startSosEdit;
    const nm = nextMeetingCard(); if(nm) box.appendChild(nm);
    const row = el("div", "row"); row.style.justifyContent = "flex-start"; row.appendChild(b); box.appendChild(row);
  }
}
function renderSosEdit(box){
  const d = sosDraft;
  const c1 = el("div", "card");
  c1.appendChild(el("div", "qtitle", "Mijn stappen"));
  const n1 = note("Wat doe je als de zucht opkomt? Zet de stappen in de volgorde die voor jou werkt."); n1.style.marginTop = "4px"; c1.appendChild(n1);
  d.steps.forEach((s, i) => {
    const r = el("div"); r.style.cssText = "display:flex;gap:8px;margin-top:8px;align-items:center";
    r.appendChild(el("div", "num", String(i+1)));
    const inp = el("input", "sosinp"); inp.value = s; inp.dataset.step = i; inp.placeholder = "Bijvoorbeeld: mijn sponsor bellen";
    inp.oninput = () => { d.steps[i] = inp.value; };
    const x = el("button", "iconbtn"); x.appendChild(icon("x")); x.type = "button"; x.setAttribute("aria-label", "Stap weghalen"); x.style.flex = "none";
    x.onclick = () => { d.steps.splice(i, 1); renderSos(); };
    r.appendChild(inp); r.appendChild(x); c1.appendChild(r);
  });
  const a1 = el("button", "chip start", "+ Stap toevoegen"); a1.type = "button"; a1.style.marginTop = "12px";
  a1.onclick = () => { d.steps.push(""); renderSos(); const l = box.querySelectorAll("[data-step]"); if(l.length) l[l.length-1].focus(); };
  c1.appendChild(a1); box.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("div", "qtitle", "Wie kan ik bellen?"));
  const n2 = note("Het noodnummer van Addisa staat er altijd al bij. Hier zet je wie je nog meer kunt bellen."); n2.style.marginTop = "4px"; c2.appendChild(n2);
  d.contacts.forEach((p, i) => {
    const r = el("div"); r.style.cssText = "display:flex;gap:6px;margin-top:8px;align-items:center";
    const nm = el("input", "sosinp"); nm.value = p.name; nm.placeholder = "Naam"; nm.dataset.contact = i; nm.oninput = () => { p.name = nm.value; };
    const ph = el("input", "sosinp"); ph.type = "tel"; ph.inputMode = "tel"; ph.value = p.phone; ph.placeholder = "Bijv. 06 12345678"; ph.oninput = () => {
      const d = ph.value.replace(/[^\d+]/g, "");
      if(/^06/.test(d)){ const v = "06" + (d.length > 2 ? " " + d.slice(2) : ""); if(v !== ph.value){ ph.value = v; try{ ph.setSelectionRange(v.length, v.length); }catch(e){} } }
      p.phone = ph.value;
    }; ph.onblur = () => { ph.value = fmtPhone(ph.value); p.phone = ph.value; };
    const x = el("button", "iconbtn"); x.appendChild(icon("x")); x.type = "button"; x.setAttribute("aria-label", "Contact weghalen"); x.style.flex = "none";
    x.onclick = () => { d.contacts.splice(i, 1); renderSos(); };
    r.appendChild(nm); r.appendChild(ph); r.appendChild(x); c2.appendChild(r);
  });
  const a2 = el("button", "chip start", "+ Contact toevoegen"); a2.type = "button"; a2.style.marginTop = "12px";
  a2.onclick = () => { d.contacts.push({name:"", phone:""}); renderSos(); const l = box.querySelectorAll("[data-contact]"); if(l.length) l[l.length-1].focus(); };
  c2.appendChild(a2); box.appendChild(c2);

  const c3 = el("div", "card");
  c3.appendChild(el("div", "qtitle", "Waarom ik clean blijf"));
  const n3 = note("Schrijf op waarvoor je het doet. Dit lees je terug als het moeilijk is."); n3.style.marginTop = "4px"; c3.appendChild(n3);
  const ta = el("textarea"); ta.value = d.reason; ta.placeholder = "Bijvoorbeeld: voor mezelf, voor mijn familie, voor een rustig hoofd…"; ta.oninput = () => { d.reason = ta.value; };
  c3.appendChild(ta); box.appendChild(c3);

  const row = el("div", "row");
  const cancel = el("button", "ghost", "Annuleren"); cancel.type = "button"; cancel.onclick = () => { sosEdit = false; renderSos(); window.scrollTo(0,0); };
  const save = el("button", "primary", "Opslaan"); save.type = "button";
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
