// ---------- start ----------
render();
showSplash();
setInterval(() => { renderGreeting(); renderGreetingWf(); }, 60000);
document.addEventListener("visibilitychange", () => { if(!document.hidden){ renderGreeting(); renderGreetingWf(); } });
document.querySelector('#drawer [data-view="today"]').classList.add("on");
setStatus(baseStatus());
initDb().then(async ()=>{ setStatus(baseStatus()); if(col){ await syncSettings(); loadDay(curKey); } });
