// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- menu & pagina's ----------
const VIEWS = {home:["Vandaag","Today"], today:["Dagbeschouwing","Daily reflection"], jft:["Alleen voor vandaag","Just for Today"], hist:["Eerdere dagen","Earlier days"], month:["Maandoverzicht","Month overview"], patterns:["Mijn patronen","My patterns"], review:["Weekterugblik","Week in review"], talk:["1-op-1 & weekdoel","1-to-1 & weekly goal"], wf:["Weekformulieren","Weekly forms"], meetings:["Meetings","Meetings"], steps:["Stappenwerk","Step work"], sos:["Noodplan","Emergency plan"], backup:["Back-up","Backup"]};
function openMenu(){ const d = daysClean(todayKey()); $("drawerSub").textContent = d === null ? vt("Dagbeschouwing", "Daily reflection") : aantal(d, "dag", "dagen", "day", "days") + " clean"; $("drawer").classList.add("open"); $("drawerBg").classList.add("show"); }
function closeMenu(){ $("drawer").classList.remove("open"); $("drawerBg").classList.remove("show"); }
function showView(v){
  Object.keys(VIEWS).forEach(k => $("view-"+k).classList.toggle("hidden", k !== v));
  const sv = $("view-" + v); if(sv){ sv.classList.remove("fadein"); void sv.offsetWidth; sv.classList.add("fadein"); }
  $("pageTitle").textContent = vt(VIEWS[v][0], VIEWS[v][1]);
  $("bottomBar").classList.toggle("hidden", v !== "today");
  $("sosBtn").classList.toggle("hidden", v === "sos");
  document.querySelectorAll("#drawer [data-view]").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  closeMenu(); window.scrollTo(0,0);
  if(v === "hist" || v === "month") renderHistory();
  if(v === "patterns") renderPatterns();
  if(v === "sos"){ sosEdit = false; renderSos(); }
  if(v === "jft"){ jftShift = 0; renderJft(); }
  if(v === "talk"){ renderTalk(); goalWeek = null; renderGoals(); }
  if(v === "steps") renderSteps();
  if(v === "meetings") renderMeetings();
  if(v === "wf") renderWf();
  if(v === "home"){
    if(curKey !== todayKey()) loadDay(todayKey());   // de startpagina gaat altijd over vandaag
    else { renderGoalsMini(); renderReviewBanner(); renderMeetToday(); renderGreetingWf(); }
  }
  if(v === "backup" || v === "home") renderBackupReminder();
  if(v === "home" || v === "today") renderHome();
  if(v === "review"){ reviewWeek = null; renderReview(); }
}
// na het wisselen van taal: het scherm dat open staat opnieuw tekenen
function hertekenAlles(){
  const v = Object.keys(VIEWS).find(k => !$("view-" + k).classList.contains("hidden")) || "home";
  ["jftMsg", "backupMsg", "docxMsg", "copyMsg"].forEach(id => { const n = $(id); if(n) n.textContent = ""; });  // oude meldingen in de vorige taal
  pasTaalToe(); showView(v); setStatus(baseStatus());
}
$("menuBtn").onclick = openMenu;
$("drawerBg").onclick = closeMenu;
document.querySelectorAll("#drawer [data-view]").forEach(b => b.onclick = () => showView(b.dataset.view));
$("menuSettings").onclick = () => { closeMenu(); $("openSettings").click(); };
// taal wisselen in één tik (de knop toont de andere taal: "English" of "Nederlands")
$("menuTaal").onclick = async () => {
  settings = Object.assign({}, settings, {taal: isEn() ? "nl" : "en", updated: Date.now()});
  local.set("settings", settings);
  closeMenu(); render(); hertekenAlles();
  toast(vt("De app is nu in het Nederlands.", "The app is now in English."));
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
};
$("sosBtn").onclick = () => showView("sos");
