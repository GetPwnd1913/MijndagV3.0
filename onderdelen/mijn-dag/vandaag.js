// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- startpagina Vandaag ----------
// Rustige startpagina: begroeting + dagen clean, mijlpaal, ochtendmoment, knop naar de dagbeschouwing,
// wat er vandaag is, meldingen in één regel en snelknoppen. Alleen tonen, er wordt niets anders opgeslagen.
let ktOpen = false, meldOpen = false, introOpen = false;

function homeNu(){ return typeof ochKlok === "function" ? ochKlok() : new Date(); }

// Keytags-kaart alleen tonen op een mijlpaaldag of als je hem zelf openklapt
function renderHomeKeytags(){
  const kt = $("ktCard"), tg = $("ktToggle"), tk = todayKey();
  const heeft = !!settings.since && tk >= settings.since;
  const mijlpaal = heeft && (keytagList(settings.since).some(t => t.key === tk) || milestones(settings.since).some(m => m.key === tk));
  if(!heeft || !(mijlpaal || ktOpen)) kt.classList.add("hidden");
  tg.classList.toggle("hidden", !heeft || mijlpaal);
  tg.textContent = (ktOpen ? "▾ " : "▸ ") + vt("Mijn keytags", "My keytags");
  tg.setAttribute("aria-expanded", ktOpen ? "true" : "false");
}

// grote knop naar de dagbeschouwing, met voortgang; na 18:00 bovenaan
function renderDbKnop(){
  const k = $("dbKnop"); if(!k) return;
  const T = QUESTIONS.length, n = curKey === todayKey() ? QUESTIONS.filter(isDone).length : 0, klaar = n === T;
  k.classList.toggle("klaar", klaar);
  $("dbKnopIc").textContent = klaar ? "✓" : "✎";
  $("dbKnopTitel").textContent = klaar ? vt("Dagbeschouwing ingevuld", "Daily reflection done") : vt("Dagbeschouwing invullen", "Fill in your daily reflection");
  $("dbKnopSub").textContent = klaar ? vt("Bekijk of pas aan", "View or change") : n + vt(" van ", " of ") + T + vt(" vragen", " questions");
  $("dbKnopBar").style.width = (n / T * 100) + "%";
  renderDagRing();
  const avond = homeNu().getHours() >= 18, top = $("homeTop");
  if(avond && k.parentNode !== top) top.appendChild(k);
  else if(!avond && k.parentNode === top) $("homeVandaag").before(k);
}

// meldingen (weekterugblik, back-up, weekformulieren) samen in één regel; kopje "Vandaag" alleen als er iets staat
const MELD_IDS = ["reviewBanner", "backupBanner", "wfRemind"], VANDAAG_IDS = ["meetToday", "planCard", "goalsMini"];
function renderMeldingen(){
  const rij = $("meldRij"), box = $("meldBox"); if(!rij) return;
  const n = MELD_IDS.filter(id => !$(id).classList.contains("hidden")).length;
  if(!n) meldOpen = false;
  rij.classList.toggle("hidden", !n);
  box.classList.toggle("hidden", !n || !meldOpen);
  rij.setAttribute("aria-expanded", meldOpen ? "true" : "false");
  rij.textContent = "🔔 " + aantal(n, "melding", "meldingen", "notification", "notifications") + (meldOpen ? " ▾" : " ›");
  $("homeVandaagKop").classList.toggle("hidden", VANDAAG_IDS.every(id => $(id).classList.contains("hidden")));
}
$("meldRij").onclick = () => { meldOpen = !meldOpen; renderMeldingen(); };
// de kaarten worden door hun eigen onderdeel getoond/verborgen (soms pas later): dan de telling bijwerken
if(window.MutationObserver){
  const mo = new MutationObserver(() => renderMeldingen());
  MELD_IDS.concat(VANDAAG_IDS).forEach(id => mo.observe($(id), {attributes: true, attributeFilter: ["class"]}));
}

// uitleg op de Dagbeschouwing: eerste 5 ingevulde dagen open, daarna achter een ⓘ-knopje
function renderIntro(){
  const n = local.days().filter(e => e && e.updated).length, kort = n >= 5;
  $("introKnop").classList.toggle("hidden", !kort);
  $("introKnop").setAttribute("aria-expanded", introOpen ? "true" : "false");
  $("introTekst").classList.toggle("hidden", kort && !introOpen);
}
$("introKnop").onclick = () => { introOpen = !introOpen; renderIntro(); };

// leeg toestel (nog geen dagen en geen gegevens): vraag of je een back-up wilt terugzetten
const WELKOM_WEG = "dagbeschouwing:welkomTerugWeg";
function renderWelkomTerug(){
  const c = $("welkomTerug"); if(!c) return;
  let weg = false; try{ weg = localStorage.getItem(WELKOM_WEG) === "1"; }catch(e){}
  const leegToestel = !settings.naam && !settings.since && !local.days().some(e => e && hasContent(e));
  c.classList.toggle("hidden", weg || !leegToestel);
}
$("welkomTerugKnop").onclick = () => { showView("backup"); $("backupFile").click(); };
$("welkomNieuw").onclick = () => { try{ localStorage.setItem(WELKOM_WEG, "1"); }catch(e){} renderWelkomTerug(); };
function renderHome(){
  renderWelkomTerug();
  renderHomeKeytags();
  renderDbKnop();
  renderMeldingen();
  renderIntro();
}

$("ktToggle").onclick = () => { ktOpen = !ktOpen; renderKeytags(); renderHomeKeytags(); };
$("dbKnop").onclick = () => { if(curKey !== todayKey()) loadDay(todayKey()); showView("today"); };
document.querySelectorAll("#snelKnoppen [data-naar]").forEach(b => b.onclick = () => showView(b.dataset.naar));

// ---------- dagboog: de zon (of 's nachts de maan) loopt mee met de echte tijd ----------
// Overdag (6:00–22:00) gaat de zon van links naar rechts over de boog; 's nachts de maan.
// Het moment van de dag (data-tod op <html>) geeft de hele app een zachte kleurtoets.
function boogPunt(t){ return [6 + 88 * t, 92 - 80 * Math.sin(Math.PI * t)]; }
function boogPad(tot){
  const n = Math.max(1, Math.round(40 * tot)), pts = [];
  for(let i = 0; i <= n; i++) pts.push(boogPunt(tot * i / n).map(v => v.toFixed(2)).join(" "));
  return "M" + pts.join(" L");
}
function renderDagboog(nu){
  const d = nu || (typeof ochKlok === "function" ? ochKlok() : new Date());
  const u = d.getHours() + d.getMinutes() / 60;
  const tod = u < 6 ? "nacht" : u < 12 ? "ochtend" : u < 18 ? "middag" : u < 22 ? "avond" : "nacht";
  document.documentElement.dataset.tod = tod;
  const zon = $("skyZon"); if(!zon) return;
  const nacht = u < 6 || u >= 22;
  const t = nacht ? ((u + 24 - 22) % 24) / 8 : (u - 6) / 16;
  const [x, y] = boogPunt(Math.min(1, Math.max(0, t)));
  zon.style.left = x + "%"; zon.style.top = y + "%";
  zon.classList.toggle("maan", nacht);
  $("boogSpoor").setAttribute("d", boogPad(1));
  $("boogGedaan").setAttribute("d", boogPad(Math.min(1, Math.max(0.001, t))));
}

// ---------- dag-ring: ochtend, dag en avond lopen vol ----------
// ochtend = ochtendmoment ingevuld; dag = planning afgevinkt (zonder planning: je hebt teruggekeken op je voornemen);
// avond = vragen van de dagbeschouwing. Alleen tonen, er wordt niets opgeslagen.
let dagRingOpen = false, dagRingWasRond = null;
function dagRingStand(){
  const tk = todayKey(), e = curKey === tk ? entry : (local.get("day:" + tk) || {});
  const o = e.ochtend || {};
  const groups = typeof planFrom === "function" ? planFrom(local.get("day:" + addDaysKey(tk, -1))) : [];
  const keys = []; groups.forEach(g => g.items.forEach(it => keys.push(g.title + "|" + it)));
  const af = keys.filter(k => e.planDone && e.planDone[k]).length;
  const T = QUESTIONS.length, n = curKey === tk ? QUESTIONS.filter(isDone).length : 0;
  return {
    ochtend: o.voornemen ? 1 : 0,
    dag: keys.length ? af / keys.length : (o.gelukt ? 1 : 0),
    avond: n / T,
    uitleg: [
      o.voornemen ? vt("Ochtend: je dag begonnen ✓", "Morning: you started your day ✓") : vt("Ochtend: nog niet begonnen", "Morning: not started yet"),
      keys.length ? vt("Dag: " + af + " van " + keys.length + " uit je planning", "Day: " + af + " of " + keys.length + " from your plan")
        : (o.gelukt ? vt("Dag: teruggekeken op je voornemen ✓", "Day: looked back at your intention ✓") : vt("Dag: nog geen planning afgevinkt", "Day: nothing ticked off yet")),
      vt("Avond: " + n + " van " + T + " vragen", "Evening: " + n + " of " + T + " questions")
    ]
  };
}
function renderDagRing(){
  const ring = $("dagRing"); if(!ring) return;
  const st = dagRingStand(), delen = [st.ochtend, st.dag, st.avond];
  const R = 26, C = 2 * Math.PI * R, seg = C / 3, gat = 7;
  const boog = (cls, i, f) => '<circle class="' + cls + ' d' + i + '" cx="32" cy="32" r="' + R + '" stroke-dasharray="' + ((seg - gat) * f).toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-(i * seg + gat / 2)).toFixed(2) + '"/>';
  ring.querySelector(".drsporen").innerHTML = [0, 1, 2].map(i => boog("drspoor", i, 1)).join("");
  ring.querySelector(".drvul").innerHTML = delen.map((f, i) => f > 0 ? boog("drdeel", i, Math.min(1, f)) : "").join("");
  const rond = delen.every(f => f >= 1);
  ring.classList.toggle("rond", rond);
  if(rond && dagRingWasRond === false){ ring.classList.remove("netrond"); void ring.offsetWidth; ring.classList.add("netrond"); }
  dagRingWasRond = rond;
  ring.setAttribute("aria-label", vt("Je dag: ", "Your day: ") + st.uitleg.join(", "));
  const zin = $("dagRondZin");
  zin.textContent = vt("Je dag is rond. Rust goed.", "Your day is complete. Rest well.");
  zin.classList.toggle("hidden", !rond);
  const u = $("dagRingUitleg"); u.innerHTML = "";
  st.uitleg.forEach((t, i) => { const r = el("div", "drregel"); const s = el("i", "drbol d" + i); r.appendChild(s); r.appendChild(el("span", null, t)); u.appendChild(r); });
  u.classList.toggle("hidden", !dagRingOpen);
  ring.setAttribute("aria-expanded", dagRingOpen ? "true" : "false");
}
$("dagRing").onclick = () => { dagRingOpen = !dagRingOpen; renderDagRing(); };
