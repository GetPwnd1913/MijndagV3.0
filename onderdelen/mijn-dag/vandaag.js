// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- startpagina Vandaag ----------
// Rustige startpagina: begroeting + dagen clean, mijlpaal, ochtendmoment, knop naar de dagbeschouwing,
// wat er vandaag is, meldingen in één regel en snelknoppen. Alleen tonen, er wordt niets anders opgeslagen.
let ktOpen = false, meldOpen = false, introOpen = false;

function homeNu(){ return typeof ochKlok === "function" ? ochKlok() : new Date(); }

// Keytags-kaart alleen als je hem zelf openklapt: de keytags staan al als haltes op Jouw weg
// (op een mijlpaaldag toont het feestkaartje de nieuwe keytag)
function renderHomeKeytags(){
  const kt = $("ktCard"), tg = $("ktToggle"), tk = todayKey();
  const heeft = !!settings.since && tk >= settings.since;
  if(!heeft || !ktOpen) kt.classList.add("hidden");
  tg.classList.toggle("hidden", !heeft);
  tg.textContent = (ktOpen ? "▾ " : "▸ ") + vt("Mijn keytags", "My keytags");
  tg.setAttribute("aria-expanded", ktOpen ? "true" : "false");
}

// grote knop naar de dagbeschouwing: het hoofdelement van het beginscherm, altijd bovenaan.
// "Levend": de ring rond het potlood loopt vol met de vragen, en de regel erboven past zich aan het moment van de dag aan.
function dbKnopMoment(u, n, T){
  if(n === T) return vt("Vandaag", "Today");
  if(n > 0) return vt("Ga verder waar je was", "Pick up where you left off");
  if(u < 6) return vt("Nog even terugkijken?", "Look back before you sleep?");
  if(u < 12) return vt("Voor vanavond", "For tonight");
  if(u < 18) return vt("Straks, als je dag erop zit", "Later, when your day is done");
  return vt("Nu is een goed moment", "Now is a good moment");
}
function renderDbKnop(){
  const k = $("dbKnop"); if(!k) return;
  const tk = todayKey(), e = curKey === tk ? entry : (local.get("day:" + tk) || {});
  const T = QUESTIONS.length, n = QUESTIONS.filter(q => isDoneIn(e, q)).length, klaar = n === T;
  const nu = homeNu(), u = nu.getHours() + nu.getMinutes() / 60;
  k.classList.toggle("klaar", klaar);
  k.classList.toggle("bezig", n > 0 && !klaar);
  k.style.setProperty("--dbf", (n / T).toFixed(3));
  $("dbKnopIc").textContent = "";
  $("dbKnopIc").appendChild(klaar ? icon("check", 24) : el("span", null, "✎"));
  $("dbKnopMoment").textContent = dbKnopMoment(u, n, T);
  $("dbKnopTitel").textContent = klaar ? vt("Dagbeschouwing ingevuld", "Daily reflection done") : vt("Dagbeschouwing invullen", "Fill in your daily reflection");
  $("dbKnopSub").textContent = klaar ? vt("Bekijk of pas aan", "View or change") : n + vt(" van ", " of ") + T + vt(" vragen", " questions");
  $("dbKnopBar").style.width = (n / T * 100) + "%";
  renderDagRing();
}

// meldingen (weekterugblik, back-up, weekformulieren) samen in één regel; kopje "Vandaag" alleen als er iets staat
const MELD_IDS = ["reviewBanner", "backupBanner", "wfRemind"], VANDAAG_IDS = ["talkHerinnering", "meetToday", "planCard", "goalsMini", "bespaardKaart"];
function renderMeldingen(){
  const rij = $("meldRij"), box = $("meldBox"); if(!rij) return;
  const n = MELD_IDS.filter(id => !$(id).classList.contains("hidden")).length;
  if(!n) meldOpen = false;
  rij.classList.toggle("hidden", !n);
  box.classList.toggle("hidden", !n || !meldOpen);
  rij.setAttribute("aria-expanded", meldOpen ? "true" : "false");
  // belletje als lijnicoon (zelfde set als de rest), geen emoji
  rij.textContent = ""; rij.appendChild(icon("bell", 20));
  rij.appendChild(document.createTextNode(aantal(n, "melding", "meldingen", "notification", "notifications") + (meldOpen ? " ▾" : " ›")));
  $("homeVandaagKop").classList.toggle("hidden", VANDAAG_IDS.every(id => $(id).classList.contains("hidden")));
  // de rustige lijst zelf verdwijnt als er niets in staat
  $("homeVandaag").classList.toggle("leeg", VANDAAG_IDS.concat(["meldRij", "ochtendRij"]).every(id => $(id).classList.contains("hidden")));
}
$("meldRij").onclick = () => { meldOpen = !meldOpen; renderMeldingen(); };
// de kaarten worden door hun eigen onderdeel getoond/verborgen (soms pas later): dan de telling bijwerken
if(window.MutationObserver){
  const mo = new MutationObserver(() => renderMeldingen());
  MELD_IDS.concat(VANDAAG_IDS, ["ochtendRij"]).forEach(id => mo.observe($(id), {attributes: true, attributeFilter: ["class"]}));
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
  const leegToestel = !settings.naam && !settings.since && !local.days().some(e => e && bkTeBewaren(e));
  c.classList.toggle("hidden", weg || !leegToestel);
  // na "Ik begin nieuw": zolang het toestel leeg is nog een kleine regel om een back-up terug te zetten
  const r = $("terugRegel"); if(r) r.classList.toggle("hidden", !weg || !leegToestel);
}
$("welkomTerugKnop").onclick = () => { showView("backup"); $("backupFile").click(); };
$("terugRegelKnop").onclick = () => { showView("backup"); $("backupRestore").click(); };
$("welkomNieuw").onclick = () => { try{ localStorage.setItem(WELKOM_WEG, "1"); }catch(e){} renderWelkomTerug(); };
function renderHome(){
  renderWelkomTerug();
  renderHomeKeytags();
  if(typeof renderWeg === "function") renderWeg();
  if(typeof wegMomenten === "function") wegMomenten();   // stapje vooruit na je dagbeschouwing, feest bij een nieuwe keytag
  renderDbKnop();
  if(typeof renderTvSein === "function") renderTvSein();
  if(typeof renderBespaard === "function") renderBespaard();
  if(typeof renderTalkHerinnering === "function") renderTalkHerinnering();
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
  if(typeof zetLaag === "function") zetLaag();
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
// ochtend = ochtendmoment ingevuld; dag = planning van ochtend/middag afgevinkt (zonder zulke planning: je hebt teruggekeken op je voornemen);
// avond = vragen van de dagbeschouwing. Alleen tonen, er wordt niets opgeslagen.
let dagRingOpen = false, dagRingWasRond = null;
function dagRingStand(){
  const tk = todayKey(), e = curKey === tk ? entry : (local.get("day:" + tk) || {});
  const o = e.ochtend || {};
  const groups = typeof planFrom === "function" ? planFrom(local.get("day:" + addDaysKey(tk, -1))) : [];
  // alleen ochtend, middag en overig: de avondpunten (meeting, dagbeschouwing) horen bij de avond
  const keys = []; groups.filter(g => !/avond/i.test(g.title)).forEach(g => g.items.forEach(it => keys.push(g.title + "|" + it)));
  const af = keys.filter(k => e.planDone && e.planDone[k]).length;
  const T = QUESTIONS.length, n = QUESTIONS.filter(q => isDoneIn(e, q)).length;
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
  const st = dagRingStand();
  // een deel van de dag dat al voorbij is, wordt ook afgevinkt: ochtend na 12:00, dag na 18:00, avond na 22:00
  const uur = homeNu().getHours(), voorbij = [uur >= 12, uur >= 18, uur >= 22];
  const delen = [st.ochtend, st.dag, st.avond].map((f, i) => voorbij[i] ? 1 : f);
  const namen = [vt("Ochtend", "Morning"), vt("Dag", "Day"), vt("Avond", "Evening")];
  const pos = [[6, 92], [50, 12], [94, 92]];   // dezelfde punten als de boog zelf (boogPunt met t = 0, 0,5 en 1)
  const box = $("dagStations"); box.innerHTML = "";
  delen.forEach((f, i) => {
    f = Math.max(0, Math.min(1, f));
    const s = el("span", "station" + (f >= 1 ? " klaar" : f > 0 ? " deel" : ""));
    s.style.left = pos[i][0] + "%"; s.style.top = pos[i][1] + "%"; s.style.setProperty("--f", f.toFixed(3));
    const p = el("span", "punt"); p.appendChild(icon("check", 16)); s.appendChild(p);
    s.appendChild(el("span", "stl", namen[i]));
    box.appendChild(s);
  });
  const rond = delen.every(f => f >= 1);
  ring.classList.toggle("rond", rond);
  if(rond && dagRingWasRond === false){ ring.classList.remove("netrond"); void ring.offsetWidth; ring.classList.add("netrond"); }
  dagRingWasRond = rond;
  ring.setAttribute("aria-label", vt("Je dag: ", "Your day: ") + st.uitleg.join(", "));
  const zin = $("dagRondZin");
  zin.textContent = vt("Je dag is rond. Rust goed.", "Your day is complete. Rest well.");
  zin.classList.toggle("hidden", !rond);
  const u = $("dagRingUitleg"); u.innerHTML = "";
  st.uitleg.forEach((t, i) => { const r = el("div", "drregel"); const sp = el("i", "drbol d" + i); r.appendChild(sp); r.appendChild(el("span", null, t)); u.appendChild(r); });
  u.classList.toggle("hidden", !dagRingOpen);
  ring.setAttribute("aria-expanded", dagRingOpen ? "true" : "false");
}
$("dagRing").onclick = () => { dagRingOpen = !dagRingOpen; renderDagRing(); };
