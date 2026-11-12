// ---------- voor mijn 1-op-1 ----------
let talkShowDone = false;
const dayMonth = k => parseKey(k).toLocaleDateString("nl-NL", {day:"numeric", month:"long"});
function talkRow(t){
  const row = el("label", "talkrow" + (t.done ? " done" : ""));
  const cb = el("input"); cb.type = "checkbox"; cb.checked = !!t.done;
  cb.onchange = async () => { t.done = cb.checked ? todayKey() : ""; row.classList.toggle("done", cb.checked); setTimeout(renderTalk, 350); await saveSettingsNow(); };
  const tx = el("div", "tx"); tx.appendChild(el("span", null, t.text));
  tx.appendChild(el("small", null, t.done ? "Besproken op " + dayMonth(t.done) : "Toegevoegd op " + dayMonth(t.added)));
  const del = el("button", "del"); del.appendChild(icon("x", 16)); del.type = "button"; del.setAttribute("aria-label", "Punt wissen");
  let timer = null;
  del.onclick = async e => {
    e.preventDefault(); e.stopPropagation();
    if(!(await confirmDialog("Bespreekpunt wissen?", "\u201c" + t.text + "\u201d wordt gewist.", "Wissen"))) return;
    settings.talk = (settings.talk || []).filter(x => x.id !== t.id); renderTalk(); await saveSettingsNow();
  };
  row.appendChild(cb); row.appendChild(tx); row.appendChild(del);
  return row;
}
function renderTalk(){
  const box = $("talkBox"); box.innerHTML = "";
  const list = settings.talk || [];
  const open = list.filter(t => !t.done), done = list.filter(t => t.done).sort((a,b) => a.done < b.done ? 1 : -1);
  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", "Wat wil ik bespreken?"));
  const n = note("Schrijf op wat je in je volgende 1-op-1 wilt bespreken. Vink af wat besproken is."); n.style.marginTop = "4px"; c.appendChild(n);
  const add = el("div"); add.style.cssText = "display:flex;gap:6px;margin:12px 0 6px";
  const inp = el("input", "sosinp"); inp.placeholder = "Nieuw bespreekpunt…"; inp.id = "talkInput";
  const btn = el("button", "primary", "Toevoegen"); btn.type = "button"; btn.style.cssText = "flex:none;padding:10px 14px";
  const doAdd = async () => {
    const v = inp.value.trim(); if(!v) return;
    settings.talk = list.concat([{id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: v, added: todayKey(), done: ""}]);
    renderTalk(); $("talkInput").focus();
    await saveSettingsNow();
  };
  btn.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
  add.appendChild(inp); add.appendChild(btn); c.appendChild(add);
  if(!open.length){ const e = note("Geen open punten."); e.style.marginTop = "8px"; c.appendChild(e); }
  open.forEach(t => c.appendChild(talkRow(t)));
  if(open.length){
    const cp = el("button", "ghost", "Kopieer lijst"); cp.type = "button"; cp.style.marginTop = "10px";
    cp.onclick = async () => {
      const txt = "Wat ik wil bespreken:\n" + open.map(t => "- " + t.text).join("\n");
      try{ await navigator.clipboard.writeText(txt); cp.textContent = "Gekopieerd"; }catch(e){ cp.textContent = "Kopiëren lukte niet"; }
      setTimeout(() => cp.textContent = "Kopieer lijst", 1800);
    };
    c.appendChild(cp);
  }
  box.appendChild(c);
  if(done.length){
    const d = el("div", "card");
    const tg = el("button", "linkbtn", (talkShowDone ? "▾ " : "▸ ") + "Besproken (" + done.length + ")"); tg.type = "button";
    tg.onclick = () => { talkShowDone = !talkShowDone; renderTalk(); };
    d.appendChild(tg);
    if(talkShowDone){
      done.forEach(t => d.appendChild(talkRow(t)));
      const clr = el("button", "ghost", "Besproken punten wissen"); clr.type = "button"; clr.style.marginTop = "10px";
      clr.onclick = async () => {
        if(!(await confirmDialog("Besproken punten wissen?", "Alle punten die je hebt afgevinkt, worden gewist.", "Wissen"))) return;
        settings.talk = (settings.talk || []).filter(t => !t.done); renderTalk(); await saveSettingsNow();
      };
      d.appendChild(clr);
    }
    box.appendChild(d);
  }
}
