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

function renderHome(){
  renderHomeKeytags();
  renderDbKnop();
  renderMeldingen();
  renderIntro();
}

$("ktToggle").onclick = () => { ktOpen = !ktOpen; renderKeytags(); renderHomeKeytags(); };
$("dbKnop").onclick = () => { if(curKey !== todayKey()) loadDay(todayKey()); showView("today"); };
document.querySelectorAll("#snelKnoppen [data-naar]").forEach(b => b.onclick = () => showView(b.dataset.naar));
$("menuKeytags").onclick = () => {
  ktOpen = true; showView("home");
  if(!settings.since){ toast(vt("Vul bij Instellingen je cleandatum in, dan zie je je keytags.", "Enter your clean date under Settings to see your keytags.")); return; }
  renderKeytags(); renderHomeKeytags();
  setTimeout(() => $("ktCard").scrollIntoView({block: "start", behavior: "smooth"}), 60);
};
