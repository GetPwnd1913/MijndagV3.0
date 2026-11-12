// ---------- ochtendmoment ----------
// 's Ochtends: één regel op Mijn dag ("☀ Begin je dag ›") → scherm over de hele pagina met 3 vragen.
// 's Avonds: alleen als er een voornemen is, een kaart boven de vragen: "Is dat gelukt?".
// Opslag in de dag zelf: entry.ochtend = {gevoel:[...], slaap:"goed|matig|slecht", voornemen:"...", gelukt:"ja|beetje|nee", inDeWeg:[...], tijd}
// Vaste knopjes worden bewaard onder hun Nederlandse naam (vertaling bij tonen); eigen knopjes in settings.customItems.
// Telt NIET mee in de voortgang (x van 13) of "Afronden": dagen zonder ochtend werken precies zoals vroeger.

const OCH_GEVOEL = ["uitgerust","moe","rustig","onrustig","blij","somber","gespannen","hoopvol"];
const OCH_SLAAP = ["goed","matig","slecht"];
const OCH_WIL = ["een meeting bezoeken","mijn sponsor bellen","rustig blijven","eerlijk zijn","goed voor mezelf zorgen","om hulp vragen"];
const OCH_WEG = ["geen tijd","vergeten","geen zin","het was te moeilijk","iets anders kwam ertussen"];
const OCH_EN = {uitgerust:"rested", moe:"tired", rustig:"calm", onrustig:"restless", blij:"happy", somber:"down", gespannen:"tense", hoopvol:"hopeful",
  goed:"well", matig:"so-so", slecht:"badly",
  "een meeting bezoeken":"go to a meeting", "mijn sponsor bellen":"call my sponsor", "rustig blijven":"stay calm", "eerlijk zijn":"be honest",
  "goed voor mezelf zorgen":"take good care of myself", "om hulp vragen":"ask for help",
  "geen tijd":"no time", "vergeten":"forgot", "geen zin":"didn't feel like it", "het was te moeilijk":"it was too hard", "iets anders kwam ertussen":"something else came up"};
const och = s => isEn() ? (OCH_EN[s] || s) : s;
const OCH_GELUKT = [["ja","Ja","Yes"],["beetje","Een beetje","A little"],["nee","Nee","No"]];
// testhaakje: de klok nabootsen (window.__ochtend.zetNu("2026-11-12T08:30"))
let ochNu = null;
// proberen zonder te wachten: ?klok=08:30 achter het adres doet alsof het vandaag 08:30 is (alleen als je het zelf intypt)
try{ const kl = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(location.search).get("klok") || ""); if(kl){ const t = new Date(); t.setHours(+kl[1], +kl[2], 0, 0); ochNu = t.toISOString(); } }catch(e){}
const ochKlok = () => ochNu ? new Date(ochNu) : new Date();
const ochEigen = deel => ((settings.customItems || {})["ochtend|" + deel] || []);
async function ochEigenBewaar(deel, lijst){
  settings.customItems = Object.assign({}, settings.customItems || {});
  if(lijst.length) settings.customItems["ochtend|" + deel] = lijst; else delete settings.customItems["ochtend|" + deel];
  await saveSettingsNow();
}

// ---- de regel op Mijn dag ----
function renderOchtendRij(){
  const rij = $("ochtendRij"); if(!rij) return;
  const o = entry.ochtend, vandaag = curKey === todayKey();
  const toon = vandaag && ((o && o.voornemen) || ochKlok().getHours() < 12);
  rij.classList.toggle("hidden", !toon);
  if(!toon) return;
  rij.innerHTML = "";
  const t = el("span", null, o && o.voornemen ? vt("Vandaag wil ik: ", "Today I want to: ") + och(o.voornemen) : vt("Begin je dag", "Start your day"));
  t.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
  const zon = el("span", null, "☀"); zon.setAttribute("aria-hidden", "true"); zon.style.cssText = "color:#e0a020;font-size:20px";
  const pijl = el("span"); pijl.appendChild(icon("chevR", 18)); pijl.style.cssText = "color:var(--muted);display:flex";
  rij.appendChild(zon); rij.appendChild(t); rij.appendChild(pijl);
  rij.onclick = () => openOchtend();
}

// ---- het ochtendscherm ----
function openOchtend(){
  const oud = entry.ochtend || {};
  const d = {gevoel: (oud.gevoel || []).slice(), slaap: oud.slaap || "", voornemen: oud.voornemen || ""};
  let stap = 0;
  const back = el("div"); back.setAttribute("role", "dialog"); back.setAttribute("aria-modal", "true"); back.setAttribute("aria-label", vt("Begin je dag", "Start your day"));
  back.id = "ochtendScherm";
  back.style.cssText = "position:fixed;inset:0;z-index:420;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;transition:opacity .2s ease";
  const wrap = el("div"); wrap.style.cssText = "max-width:560px;margin:0 auto;padding:calc(14px + env(safe-area-inset-top)) 16px calc(28px + env(safe-area-inset-bottom));min-height:100%;box-sizing:border-box;display:flex;flex-direction:column";
  back.appendChild(wrap);
  const sluit = () => { back.style.opacity = "0"; document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); setTimeout(() => back.remove(), 200); };
  const onKey = e => { if(e.key === "Escape") sluit(); };
  document.addEventListener("keydown", onKey);

  const bewaar = () => {
    const o = Object.assign({}, entry.ochtend || {}, {gevoel: d.gevoel, slaap: d.slaap, voornemen: d.voornemen, tijd: Date.now()});
    if((entry.ochtend || {}).voornemen !== d.voornemen){ delete o.gelukt; delete o.inDeWeg; }   // nieuw voornemen: avondantwoord opnieuw
    entry.ochtend = o; scheduleSave(); render();
  };

  const chip = (tekst, aan, klik) => { const b = el("button", "chip" + (aan ? " on" : ""), tekst); b.type = "button"; b.style.cssText = "min-height:46px;padding:10px 16px;font-size:16px"; b.onclick = klik; return b; };
  const eigenInvoer = (plaats, bijToevoegen) => {
    const r = el("div"); r.style.cssText = "display:flex;gap:8px;margin-top:12px";
    const inp = el("input", "sosinp"); inp.placeholder = vt("Eigen woord…", "Your own word…"); inp.style.minHeight = "46px";
    const ok = el("button", "ghost", vt("Toevoegen", "Add")); ok.type = "button"; ok.style.flex = "none";
    const doe = () => { const v = inp.value.trim().replace(/[,:]/g, " ").replace(/\s+/g, " "); if(!v){ inp.focus(); return; } bijToevoegen(v); };
    ok.onclick = doe; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doe(); } };
    r.appendChild(inp); r.appendChild(ok); plaats.appendChild(r);
    requestAnimationFrame(() => inp.focus());
  };

  const teken = () => {
    wrap.innerHTML = "";
    // kop: terug · bolletjes · sluiten
    const kop = el("div"); kop.style.cssText = "display:flex;align-items:center;gap:8px;min-height:48px";
    const terug = el("button", "linkbtn back", vt("Terug", "Back")); terug.type = "button"; terug.style.cssText = "min-height:44px;visibility:" + (stap > 0 ? "visible" : "hidden");
    terug.onclick = () => { stap--; teken(); };
    const bol = el("div"); bol.style.cssText = "flex:1;display:flex;justify-content:center;gap:8px"; bol.setAttribute("aria-label", vt("Stap ", "Step ") + Math.min(stap + 1, 3) + vt(" van 3", " of 3"));
    for(let i = 0; i < 3; i++){ const b = el("i"); b.style.cssText = "width:10px;height:10px;border-radius:50%;background:" + (i <= stap ? "var(--accent)" : "var(--line)"); bol.appendChild(b); }
    const x = el("button", "xbtn"); x.appendChild(icon("x", 22)); x.type = "button"; x.setAttribute("aria-label", vt("Sluiten zonder opslaan", "Close without saving")); x.style.cssText = "min-width:44px;min-height:44px;margin:0";
    x.onclick = sluit;
    kop.appendChild(terug); kop.appendChild(bol); kop.appendChild(x); wrap.appendChild(kop);

    const vak = el("div"); vak.style.cssText = "flex:1;padding-top:12px"; wrap.appendChild(vak);
    const vraag = t => { const h = el("div", null, t); h.style.cssText = "font-size:26px;font-weight:750;letter-spacing:-.02em;line-height:1.25;margin:8px 0 18px"; vak.appendChild(h); };
    const rij = el("div", "chips"); rij.style.gap = "10px";

    if(stap === 0){
      vraag(vt("Hoe voel ik me nu?", "How do I feel right now?"));
      const sub = note(vt("Kies er één of meer.", "Choose one or more.")); sub.style.cssText = "margin:-10px 0 14px;font-size:15px"; vak.appendChild(sub);
      OCH_GEVOEL.concat(ochEigen("gevoel").filter(x => OCH_GEVOEL.indexOf(x) < 0)).forEach(g => {
        rij.appendChild(chip(och(g), d.gevoel.indexOf(g) >= 0, () => { d.gevoel = d.gevoel.indexOf(g) >= 0 ? d.gevoel.filter(x => x !== g) : d.gevoel.concat([g]); teken(); }));
      });
      const plus = chip(vt("+ Eigen", "+ Own"), false, () => { plus.remove(); eigenInvoer(vak, async v => { if(OCH_GEVOEL.indexOf(v) < 0 && ochEigen("gevoel").indexOf(v) < 0) await ochEigenBewaar("gevoel", ochEigen("gevoel").concat([v])); if(d.gevoel.indexOf(v) < 0) d.gevoel.push(v); teken(); }); });
      plus.classList.add("start"); rij.appendChild(plus); vak.appendChild(rij);
      const verder = el("button", "primary", d.gevoel.length ? vt("Verder", "Next") : vt("Sla over", "Skip")); verder.type = "button";
      verder.style.cssText = "width:100%;min-height:52px;font-size:17px;margin-top:24px"; verder.onclick = () => { stap = 1; teken(); };
      wrap.appendChild(verder);
    } else if(stap === 1){
      vraag(vt("Hoe heb ik geslapen?", "How did I sleep?"));
      const sc = el("div", "scale");
      OCH_SLAAP.forEach(s => { const b = el("button", d.slaap === s ? "on" : null, cap(och(s))); b.type = "button"; b.style.minHeight = "56px"; b.style.fontSize = "17px";
        b.onclick = () => { d.slaap = s; teken(); setTimeout(() => { stap = 2; teken(); }, 250); }; sc.appendChild(b); });
      vak.appendChild(sc);
    } else if(stap === 2){
      vraag(vt("Vandaag wil ik…", "Today I want to…"));
      // vooraan: activiteiten uit de weekplanning van vandaag en het weekdoel, daarna de vaste knopjes en eigen knopjes
      const tk = todayKey(), dagIdx = (parseKey(tk).getDay() + 6) % 7;
      const uitPlan = planRuns((planOf(addDaysKey(mondayOf(tk), -7)) || {})[dagIdx] || {}).map(r => r.text);
      const uitDoel = (weekData(mondayOf(tk)).goals || []).filter(g => !g.done).map(g => g.text);
      const opties = [];
      uitPlan.concat(uitDoel, OCH_WIL, ochEigen("voornemen")).forEach(x => { if(x && opties.indexOf(x) < 0) opties.push(x); });
      if(d.voornemen && opties.indexOf(d.voornemen) < 0) opties.unshift(d.voornemen);
      opties.forEach(v => rij.appendChild(chip(och(v), d.voornemen === v, () => { d.voornemen = v; teken(); setTimeout(() => { stap = 3; teken(); }, 250); })));
      const plus = chip(vt("+ Eigen", "+ Own"), false, () => { plus.remove(); eigenInvoer(vak, async v => { if(OCH_WIL.indexOf(v) < 0 && ochEigen("voornemen").indexOf(v) < 0) await ochEigenBewaar("voornemen", ochEigen("voornemen").concat([v])); d.voornemen = v; stap = 3; teken(); }); });
      plus.classList.add("start"); rij.appendChild(plus); vak.appendChild(rij);
    } else {
      vraag(vt("Klaar voor vandaag", "Ready for today"));
      const sam = el("div", "card"); sam.style.marginBottom = "12px";
      [[vt("Gevoel", "Feeling"), d.gevoel.map(och).join(", ")], [vt("Slaap", "Sleep"), d.slaap ? cap(och(d.slaap)) : ""], [vt("Vandaag wil ik", "Today I want to"), d.voornemen ? och(d.voornemen) : ""]].forEach(([k, v]) => {
        if(!v) return;
        const r = el("div"); r.style.cssText = "padding:6px 0;font-size:16px"; r.appendChild(el("div", "label", k)).style.margin = "0 0 2px"; r.appendChild(el("div", null, v)).style.fontWeight = "600";
        sam.appendChild(r);
      });
      vak.appendChild(sam);
      if(typeof jft !== "undefined" && jft && jft.entries){
        const lk = el("button", "linkbtn more", vt("Lees Alleen voor vandaag", "Read Just for Today")); lk.type = "button"; lk.style.cssText = "min-height:44px;font-size:16px";
        lk.onclick = () => { bewaar(); sluit(); showView("jft"); }; vak.appendChild(lk);
      }
      const klaar = el("button", "primary", vt("Klaar", "Done")); klaar.type = "button";
      klaar.style.cssText = "width:100%;min-height:52px;font-size:17px;margin-top:24px";
      klaar.onclick = () => { bewaar(); sluit(); toast(vt("Fijne dag.", "Have a good day.")); };
      wrap.appendChild(klaar);
    }
  };
  teken();
  document.body.appendChild(back); document.body.style.overflow = "hidden";
  requestAnimationFrame(() => { back.style.opacity = "1"; });
}

// ---- de avondkaart (boven de vragen, alleen met een voornemen) ----
// voornemen → knopje van vraag 4 dat alvast aangevinkt wordt bij "Ja"
function ochNaarQ4(v){
  const s = String(v || "").toLowerCase();
  if(/sponsor/.test(s)) return "mijn sponsor gebeld";
  if(/meeting/.test(s)) return "een meeting bezocht";
  if(/stappen|step/.test(s)) return "aan mijn stappen gewerkt";
  if(/service/.test(s)) return "service gedaan";
  return null;
}
function buildOchtendKaart(){
  const o = entry.ochtend;
  if(!o || !o.voornemen) return null;
  const card = el("div", "card" + (o.gelukt ? " done" : "")); card.id = "ochtendKaart";
  const head = el("div", "qhead");
  const num = el("div", "num", "☀"); num.setAttribute("aria-hidden", "true"); num.style.color = "#e0a020";
  const tx = el("div"); tx.style.cssText = "flex:1;min-width:0";
  const nt = note(vt("Vanochtend wilde je:", "This morning you wanted to:")); nt.style.cssText = "margin:0;font-size:14px"; tx.appendChild(nt);
  tx.appendChild(el("div", "qtitle", cap(och(o.voornemen)) + vt(". Is dat gelukt?", ". Did that work out?")));
  head.appendChild(num); head.appendChild(tx); card.appendChild(head);
  const sc = el("div", "scale");
  OCH_GELUKT.forEach(([v, nl, en]) => {
    const b = el("button", o.gelukt === v ? "on" : null, vt(nl, en)); b.type = "button";
    b.onclick = () => {
      const nieuw = o.gelukt === v ? "" : v;
      entry.ochtend = Object.assign({}, o, {gelukt: nieuw});
      if(nieuw === "ja"){
        // bij "Ja": het passende knopje van vraag 4 alvast aanvinken (als het er nog niet staat)
        const item = ochNaarQ4(o.voornemen), a = answer("q4");
        if(item && !(a.text || "").split("\n").some(l => lineIsItem(l, item))) a.text = ((a.text || "").replace(/\s*$/, "") + "\n" + bullet(item)).replace(/^\n+/, "");
      }
      scheduleSave(); render();
    };
    sc.appendChild(b);
  });
  card.appendChild(sc);
  if(o.gelukt === "beetje" || o.gelukt === "nee"){
    card.appendChild(el("div", "label", vt("Wat zat in de weg?", "What got in the way?")));
    const rij = el("div", "chips"), weg = o.inDeWeg || [];
    const eigen = (settings.customItems || {})["avond|inDeWeg"] || [];
    OCH_WEG.concat(eigen.filter(x => OCH_WEG.indexOf(x) < 0)).forEach(w => {
      const b = el("button", "chip" + (weg.indexOf(w) >= 0 ? " on" : ""), och(w)); b.type = "button";
      b.onclick = () => { entry.ochtend = Object.assign({}, entry.ochtend, {inDeWeg: weg.indexOf(w) >= 0 ? weg.filter(x => x !== w) : weg.concat([w])}); scheduleSave(); render(); };
      rij.appendChild(b);
    });
    const plus = el("button", "chip start", vt("+ Eigen", "+ Own")); plus.type = "button";
    plus.onclick = () => {
      plus.remove();
      const r = el("div"); r.style.cssText = "display:flex;gap:6px;margin-top:8px";
      const inp = el("input", "sosinp"); inp.placeholder = vt("Wat zat in de weg?", "What got in the way?");
      const ok = el("button", "ghost", vt("Toevoegen", "Add")); ok.type = "button"; ok.style.flex = "none";
      const doe = async () => {
        const v = inp.value.trim().replace(/[,:]/g, " ").replace(/\s+/g, " "); if(!v){ inp.focus(); return; }
        if(OCH_WEG.indexOf(v) < 0 && eigen.indexOf(v) < 0){ settings.customItems = Object.assign({}, settings.customItems || {}); settings.customItems["avond|inDeWeg"] = eigen.concat([v]); await saveSettingsNow(); }
        entry.ochtend = Object.assign({}, entry.ochtend, {inDeWeg: (entry.ochtend.inDeWeg || []).concat([v])}); scheduleSave(); render();
      };
      ok.onclick = doe; inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); doe(); } };
      r.appendChild(inp); r.appendChild(ok); card.appendChild(r); inp.focus();
    };
    rij.appendChild(plus); card.appendChild(rij);
  }
  return card;
}
// korte tekst voor samenvatting, Eerdere dagen en Word/PDF (null als er geen ochtend is ingevuld)
function ochtendRegels(e){
  const o = e && e.ochtend; if(!o || !(o.voornemen || o.slaap || (o.gevoel || []).length)) return null;
  const r = [];
  if((o.gevoel || []).length) r.push([vt("Gevoel", "Feeling"), o.gevoel.map(och).join(", ")]);
  if(o.slaap) r.push([vt("Slaap", "Sleep"), och(o.slaap)]);
  if(o.voornemen){
    const g = OCH_GELUKT.find(x => x[0] === o.gelukt);
    r.push([vt("Vandaag wilde ik", "Today I wanted to"), och(o.voornemen) + (g ? " · " + vt("gelukt: ", "done: ") + vt(g[1], g[2]).toLowerCase() : "")]);
    if((o.inDeWeg || []).length) r.push([vt("Wat zat in de weg", "What got in the way"), o.inDeWeg.map(och).join(", ")]);
  }
  return r;
}
window.__ochtend = {open: () => openOchtend(), zetNu: t => { ochNu = t; render(); }, regels: ochtendRegels};
