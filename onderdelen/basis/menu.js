// ---------- menu & pagina's ----------
const VIEWS = {today:"Mijn dag", jft:"Alleen voor vandaag", hist:"Eerdere dagen", month:"Maandoverzicht", review:"Weekterugblik", talk:"Voor mijn 1-op-1", wf:"Weekformulieren", meetings:"Meetings", steps:"Stappenwerk", sos:"Noodplan", backup:"Back-up"};
function openMenu(){ const d = daysClean(todayKey()); $("drawerSub").textContent = d === null ? "Dagbeschouwing" : d + (d === 1 ? " dag" : " dagen") + " clean"; $("drawer").classList.add("open"); $("drawerBg").classList.add("show"); }
function closeMenu(){ $("drawer").classList.remove("open"); $("drawerBg").classList.remove("show"); }
function showView(v){
  Object.keys(VIEWS).forEach(k => $("view-"+k).classList.toggle("hidden", k !== v));
  const sv = $("view-" + v); if(sv){ sv.classList.remove("fadein"); void sv.offsetWidth; sv.classList.add("fadein"); }
  $("pageTitle").textContent = VIEWS[v];
  $("bottomBar").classList.toggle("hidden", v !== "today");
  $("sosBtn").classList.toggle("hidden", v === "sos");
  document.querySelectorAll("#drawer [data-view]").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  closeMenu(); window.scrollTo(0,0);
  if(v === "hist" || v === "month") renderHistory();
  if(v === "sos"){ sosEdit = false; renderSos(); }
  if(v === "jft"){ jftShift = 0; renderJft(); }
  if(v === "talk"){ renderTalk(); goalWeek = null; renderGoals(); }
  if(v === "steps") renderSteps();
  if(v === "meetings") renderMeetings();
  if(v === "wf") renderWf();
  if(v === "today"){ renderGoalsMini(); renderReviewBanner(); renderMeetToday(); }
  if(v === "backup" || v === "today") renderBackupReminder();
  if(v === "review"){ reviewWeek = null; renderReview(); }
}
$("menuBtn").onclick = openMenu;
$("drawerBg").onclick = closeMenu;
document.querySelectorAll("#drawer [data-view]").forEach(b => b.onclick = () => showView(b.dataset.view));
$("menuSettings").onclick = () => { closeMenu(); $("openSettings").click(); };
$("sosBtn").onclick = () => showView("sos");
