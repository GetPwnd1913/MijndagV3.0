// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- voor mijn 1-op-1 ----------
let talkShowDone = false, talkTab = "doel";
const dayMonth = k => parseKey(k).toLocaleDateString(locale(), {day:"numeric", month:"long"});
// twee tabbladen bovenaan: Weekdoel | Bespreekpunten
function renderTalkTabs(){
  const bar = $("talkTabs"); if(!bar) return;
  bar.innerHTML = "";
  const wd = weekData(mondayOf(todayKey())), open = (settings.talk || []).filter(t => !t.done).length;
  const tabs = [["doel", vt("Weekdoel", "Weekly goal") + (wd.goals.length ? " · " + wd.goals.filter(g => g.done).length + "/" + wd.goals.length : "")],
                ["punten", vt("Bespreekpunten", "Talking points") + (open ? " · " + open : "")]];
  tabs.forEach(([k, txt]) => {
    const b = el("button", talkTab === k ? "on" : null, txt); b.type = "button";
    b.setAttribute("role", "tab"); b.setAttribute("aria-selected", talkTab === k ? "true" : "false");
    b.onclick = () => { if(talkTab !== k){ talkTab = k; renderTalkView(); } };
    bar.appendChild(b);
  });
  $("goalsBox").classList.toggle("hidden", talkTab !== "doel");
  $("talkBox").classList.toggle("hidden", talkTab !== "punten");
}
function renderTalkView(){ renderGoals(); renderTalk(); window.scrollTo(0, 0); }
function talkRow(t){
  const row = el("label", "talkrow" + (t.done ? " done" : ""));
  const cb = el("input"); cb.type = "checkbox"; cb.checked = !!t.done;
  cb.onchange = async () => { t.done = cb.checked ? todayKey() : ""; row.classList.toggle("done", cb.checked); setTimeout(renderTalk, 350); await saveSettingsNow(); };
  const tx = el("div", "tx"); tx.appendChild(el("span", null, t.text));
  tx.appendChild(el("small", null, t.done ? vt("Besproken op ", "Discussed on ") + dayMonth(t.done) : vt("Toegevoegd op ", "Added on ") + dayMonth(t.added)));
  const del = el("button", "del"); del.appendChild(icon("x", 16)); del.type = "button"; del.setAttribute("aria-label", vt("Punt wissen", "Delete point"));
  del.onclick = async e => {
    e.preventDefault(); e.stopPropagation();
    if(!(await confirmDialog(vt("Bespreekpunt wissen?", "Delete talking point?"), "“" + t.text + "”" + vt(" wordt gewist.", " will be deleted."), vt("Wissen", "Delete")))) return;
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
  c.appendChild(el("div", "qtitle", vt("Wat wil ik bespreken?", "What do I want to discuss?")));
  const n = note(vt("Voor je volgende 1-op-1. Vink af wat besproken is.", "For your next 1-to-1. Tick off what has been discussed.")); n.style.marginTop = "4px"; c.appendChild(n);
  const add = el("div"); add.style.cssText = "display:flex;gap:6px;margin:12px 0 6px";
  const inp = el("input", "sosinp"); inp.placeholder = vt("Nieuw bespreekpunt…", "New talking point…"); inp.id = "talkInput";
  inp.setAttribute("aria-label", vt("Nieuw bespreekpunt", "New talking point"));
  const btn = el("button", "primary", vt("Toevoegen", "Add")); btn.type = "button"; btn.style.cssText = "flex:none;padding:10px 14px";
  const doAdd = async () => {
    const v = inp.value.trim(); if(!v) return;
    settings.talk = list.concat([{id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: v, added: todayKey(), done: ""}]);
    renderTalk(); $("talkInput").focus();
    await saveSettingsNow();
  };
  btn.onclick = doAdd; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doAdd(); } };
  add.appendChild(inp); add.appendChild(btn); c.appendChild(add);
  if(!open.length){ const e = note(vt("Geen open punten.", "No open points.")); e.style.marginTop = "8px"; c.appendChild(e); }
  open.forEach(t => c.appendChild(talkRow(t)));
  const acties = el("div"); acties.style.cssText = "display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;margin-top:10px";
  if(open.length){
    const cp = el("button", "ghost", vt("Kopieer lijst", "Copy list")); cp.type = "button";
    cp.onclick = async () => {
      const txt = vt("Wat ik wil bespreken:\n", "What I want to discuss:\n") + open.map(t => "- " + t.text).join("\n");
      try{ await navigator.clipboard.writeText(txt); cp.textContent = vt("Gekopieerd", "Copied"); }catch(e){ cp.textContent = vt("Kopiëren lukte niet", "Copying failed"); }
      setTimeout(() => cp.textContent = vt("Kopieer lijst", "Copy list"), 1800);
    };
    acties.appendChild(cp);
  }
  if(done.length){
    const tg = el("button", "linkbtn", (talkShowDone ? "▾ " : "▸ ") + vt("Besproken (", "Discussed (") + done.length + ")"); tg.type = "button";
    tg.setAttribute("aria-expanded", talkShowDone ? "true" : "false");
    tg.onclick = () => { talkShowDone = !talkShowDone; renderTalk(); };
    acties.appendChild(tg);
  }
  if(acties.children.length) c.appendChild(acties);
  if(done.length && talkShowDone){
    const d = el("div"); d.style.marginTop = "6px";
    done.forEach(t => d.appendChild(talkRow(t)));
    const clr = el("button", "ghost", vt("Besproken punten wissen", "Delete discussed points")); clr.type = "button"; clr.style.marginTop = "10px";
    clr.onclick = async () => {
      if(!(await confirmDialog(vt("Besproken punten wissen?", "Delete discussed points?"), vt("Alle punten die je hebt afgevinkt, worden gewist.", "All points you have ticked off will be deleted."), vt("Wissen", "Delete")))) return;
      settings.talk = (settings.talk || []).filter(t => !t.done); renderTalk(); await saveSettingsNow();
    };
    d.appendChild(clr);
    c.appendChild(d);
  }
  box.appendChild(c);
  renderTalkTabs();
}
