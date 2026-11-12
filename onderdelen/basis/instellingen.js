// ---------- kleur ----------
const THEMES = [["groen","Groen","#2f6f62"],["blauw","Blauw","#2f5f9e"],["paars","Paars","#6a4c9c"],["petrol","Petrol","#1f6f80"],["roze","Roze","#a8437a"],["antraciet","Antraciet","#3d4a52"]];
let pickTheme = null;
function applyTheme(t){
  const th = THEMES.find(x => x[0] === t) || THEMES[0];
  document.documentElement.dataset.theme = th[0];
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.content = th[2];
}
function drawSwatches(){
  const w = $("setTheme"); w.innerHTML = "";
  THEMES.forEach(([k, l, c]) => {
    const wrap = el("div", "swwrap" + (pickTheme === k ? " on" : ""));
    const b = el("button", "swatch" + (pickTheme === k ? " on" : "")); b.type = "button"; b.style.setProperty("--sw", c); b.setAttribute("aria-label", l);
    b.onclick = () => { pickTheme = k; applyTheme(k); drawSwatches(); };
    wrap.appendChild(b); wrap.appendChild(el("span", null, l)); w.appendChild(wrap);
  });
}
function closeSettings(){ applyTheme(settings.theme); $("setOverlay").classList.remove("show"); }

// ---------- settings ----------
$("openSettings").onclick = () => {
  $("setNaam").value = settings.naam||""; $("setSince").value = settings.since||""; $("setMail").value = settings.mail||""; pickTheme = settings.theme || "groen"; drawSwatches();
  $("setOverlay").classList.add("show");
};
$("setCancel").onclick = closeSettings;
$("setSave").onclick = async () => {
  settings = Object.assign({}, settings, {naam:$("setNaam").value.trim(), since:$("setSince").value, mail:$("setMail").value.trim(), theme: pickTheme || settings.theme || "groen", updated:Date.now()});
  local.set("settings", settings);
  $("setOverlay").classList.remove("show");
  render();
  if(setDoc){ try{ await setDoc.set(JSON.parse(JSON.stringify(settings))); }catch(e){} }
};
