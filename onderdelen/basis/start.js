// ---------- start ----------
render();
showView("home");
showSplash();
setInterval(() => { renderGreeting(); renderGreetingWf(); }, 60000);
document.addEventListener("visibilitychange", () => { if(!document.hidden){ renderGreeting(); renderGreetingWf(); } });
setStatus(baseStatus());
initDb().then(async ()=>{ setStatus(baseStatus()); if(col){ await syncSettings(); loadDay(curKey); } });
