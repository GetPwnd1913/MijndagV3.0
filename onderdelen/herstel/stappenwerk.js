// ---------- stappenwerk ----------
const STEPS = [
  "Toegeven dat ik machteloos ben",
  "Hoop: er is iets groters dat kan helpen",
  "De beslissing om mijn leven toe te vertrouwen",
  "Een eerlijke inventaris van mezelf maken",
  "Mijn fouten toegeven aan mezelf, een hogere macht en iemand anders",
  "Klaar zijn om mijn karaktergebreken los te laten",
  "Nederig vragen om mijn tekortkomingen weg te nemen",
  "Een lijst maken van mensen die ik schade heb gedaan",
  "Het goedmaken waar dat kan",
  "Elke dag mijn inventaris bijhouden",
  "Contact zoeken via gebed en meditatie",
  "De boodschap doorgeven en de principes toepassen"
];
// kort in eigen woorden (niet de officiële tekst), in dezelfde volgorde als STEPS
const STEPS_EN = [
  "Admitting that I am powerless",
  "Hope: there is something greater that can help",
  "The decision to entrust my life",
  "Making an honest inventory of myself",
  "Admitting my wrongs to myself, a higher power and another person",
  "Being ready to let go of my character defects",
  "Humbly asking for my shortcomings to be removed",
  "Making a list of people I have harmed",
  "Making amends where possible",
  "Keeping up my inventory every day",
  "Seeking contact through prayer and meditation",
  "Passing on the message and living the principles"
];
let stepOpen = null, stepTimer = null;
function setStep(n, v){ settings.steps = Object.assign({}, settings.steps || {}); settings.steps[n] = v; }
function renderSteps(){
  const box = $("stepsBox"); box.innerHTML = "";
  const st = settings.steps || {};
  const doneN = STEPS.filter((_, i) => (st[i+1] || {}).status === "klaar").length;
  const top = el("div", "card");
  top.appendChild(el("div", "qtitle", doneN + vt(" van de 12 stappen klaar", " of the 12 steps done")));
  const bar = el("div", "bar"); bar.style.marginTop = "10px"; const bi = el("i"); bi.style.width = (doneN / 12 * 100) + "%"; bar.appendChild(bi); top.appendChild(bar);
  top.appendChild(note(vt("Tik op een stap om je status en notities bij te houden. De stappen staan hier kort in eigen woorden; de officiële tekst staat in je Basistekst.", "Tap a step to keep track of your status and notes. The steps are summarised here in our own words; the official text is in your Basic Text.")));
  box.appendChild(top);
  STEPS.forEach((title, idx) => {
    const n = idx + 1, s = st[n] || {};
    const c = el("div", "card" + (s.status === "klaar" ? " done" : ""));
    const head = el("div", "qhead"); head.style.cursor = "pointer";
    head.appendChild(el("div", "num", String(n)));
    const hb = el("div"); hb.style.cssText = "flex:1;min-width:0";
    hb.appendChild(el("div", "qtitle", vt(title, STEPS_EN[idx])));
    const lab = s.status === "klaar" ? vt("Klaar", "Done") + (s.finished ? vt(" op ", " on ") + shortDate(s.finished) : "")
      : s.status === "bezig" ? vt("Bezig", "In progress") + (s.started ? vt(" sinds ", " since ") + shortDate(s.started) : "") : vt("Nog niet begonnen", "Not started yet");
    const sl = note(lab); sl.style.cssText = "margin-top:2px;font-size:14px" + (s.status === "bezig" ? ";color:var(--warm);font-weight:600" : "");
    hb.appendChild(sl);
    head.appendChild(hb);
    const arrow = el("div"); arrow.appendChild(icon(stepOpen === n ? "chevD" : "chevR", 18)); arrow.style.color = "var(--muted)"; head.appendChild(arrow);
    head.onclick = () => { stepOpen = stepOpen === n ? null : n; renderSteps(); };
    c.appendChild(head);
    if(stepOpen === n){
      const sc = el("div", "scale");
      [["", "Niet begonnen", "Not started"], ["bezig", "Bezig", "In progress"], ["klaar", "Klaar", "Done"]].forEach(([v, l, len]) => {
        const b = el("button", null, vt(l, len)); b.type = "button";
        if((s.status || "") === v) b.classList.add("on");
        b.onclick = async () => {
          const cur = Object.assign({}, (settings.steps || {})[n] || {}); cur.status = v;
          if(v && !cur.started) cur.started = todayKey();
          cur.finished = v === "klaar" ? todayKey() : "";
          if(!v) cur.started = "";
          setStep(n, cur); renderSteps(); await saveSettingsNow();
        };
        sc.appendChild(b);
      });
      c.appendChild(sc);
      if(n === 10){ const t = note(vt("Je dagbeschouwing in deze app is je dagelijkse inventaris.", "Your daily reflection in this app is your daily inventory.")); c.appendChild(t); }
      const ta = el("textarea"); ta.value = s.notes || "";
      ta.placeholder = vt("Notities: waar ben je mee bezig, wat wil je bespreken met je sponsor…", "Notes: what are you working on, what do you want to discuss with your sponsor…");
      ta.oninput = () => {
        setStep(n, Object.assign({}, (settings.steps || {})[n] || {}, {notes: ta.value}));
        settings.updated = Date.now(); local.set("settings", settings);
        clearTimeout(stepTimer); stepTimer = setTimeout(saveSettingsNow, 900);
      };
      c.appendChild(ta);
    }
    box.appendChild(c);
  });
}
