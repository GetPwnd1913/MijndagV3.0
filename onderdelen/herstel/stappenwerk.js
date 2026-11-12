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
let stepOpen = null, stepTimer = null;
function setStep(n, v){ settings.steps = Object.assign({}, settings.steps || {}); settings.steps[n] = v; }
function renderSteps(){
  const box = $("stepsBox"); box.innerHTML = "";
  const st = settings.steps || {};
  const doneN = STEPS.filter((_, i) => (st[i+1] || {}).status === "klaar").length;
  const top = el("div", "card");
  top.appendChild(el("div", "qtitle", doneN + " van de 12 stappen klaar"));
  const bar = el("div", "bar"); bar.style.marginTop = "10px"; const bi = el("i"); bi.style.width = (doneN / 12 * 100) + "%"; bar.appendChild(bi); top.appendChild(bar);
  top.appendChild(note("Tik op een stap om je status en notities bij te houden. De stappen staan hier kort in eigen woorden; de officiële tekst staat in je Basistekst."));
  box.appendChild(top);
  STEPS.forEach((title, idx) => {
    const n = idx + 1, s = st[n] || {};
    const c = el("div", "card" + (s.status === "klaar" ? " done" : ""));
    const head = el("div", "qhead"); head.style.cursor = "pointer";
    head.appendChild(el("div", "num", String(n)));
    const hb = el("div"); hb.style.cssText = "flex:1;min-width:0";
    hb.appendChild(el("div", "qtitle", title));
    const lab = s.status === "klaar" ? "Klaar" + (s.finished ? " op " + shortDate(s.finished) : "")
      : s.status === "bezig" ? "Bezig" + (s.started ? " sinds " + shortDate(s.started) : "") : "Nog niet begonnen";
    const sl = note(lab); sl.style.cssText = "margin-top:2px;font-size:14px" + (s.status === "bezig" ? ";color:var(--warm);font-weight:600" : "");
    hb.appendChild(sl);
    head.appendChild(hb);
    const arrow = el("div"); arrow.appendChild(icon(stepOpen === n ? "chevD" : "chevR", 18)); arrow.style.color = "var(--muted)"; head.appendChild(arrow);
    head.onclick = () => { stepOpen = stepOpen === n ? null : n; renderSteps(); };
    c.appendChild(head);
    if(stepOpen === n){
      const sc = el("div", "scale");
      [["", "Niet begonnen"], ["bezig", "Bezig"], ["klaar", "Klaar"]].forEach(([v, l]) => {
        const b = el("button", null, l); b.type = "button";
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
      if(n === 10){ const t = note("Je dagbeschouwing in deze app is je dagelijkse inventaris."); c.appendChild(t); }
      const ta = el("textarea"); ta.value = s.notes || "";
      ta.placeholder = "Notities: waar ben je mee bezig, wat wil je bespreken met je sponsor…";
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
