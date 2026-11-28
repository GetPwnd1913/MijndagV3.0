// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- meetings ----------
// d: 0 = zondag … 6 = zaterdag
const MEETINGS = [
  {id:"na-nij-zo-man", f:"NA", d:0, t:"10:30", city:"Nijmegen", loc:"Jongeren Stip Lab", addr:"Van Berchenstraat 3b, Nijmegen", nt:"Mannenmeeting"},
  {id:"na-wag-zo", f:"NA", d:0, t:"19:00", city:"Wageningen", loc:"Ons Huis", addr:"Harnjesweg 84, Wageningen"},
  {id:"na-amf-zo", f:"NA", d:0, t:"10:00", city:"Amersfoort", loc:"Sporthal de Bron", addr:"Oceaan 12, Amersfoort", nt:"Literatuurstudie"},
  {id:"na-arn-zo", f:"NA", d:0, t:"19:30", city:"Arnhem", loc:"Buurthuis De Oosthof", addr:"Kinderkamp 9, Arnhem"},
  {id:"na-elst-ma", f:"NA", d:1, t:"19:30", city:"Elst (Utr.)", loc:"Vergaderruimte achter de kerk", addr:"Rijksstraatweg 26, Elst", nt:"Vanaf 19:00 welkom, ingang achterom"},
  {id:"na-arn-ma", f:"NA", d:1, t:"19:30", city:"Arnhem", loc:"Wijkcentrum Symfonie", addr:"Valckenierstraat 1, Arnhem", nt:"Jongeren en nieuwkomers"},
  {id:"na-nij-ma", f:"NA", d:1, t:"19:30", city:"Nijmegen", loc:"Wijkcentrum Villa Nova", addr:"Derde van Hezewijkstraat 2, Nijmegen"},
  {id:"na-amf-di", f:"NA", d:2, t:"10:00", city:"Amersfoort", loc:"Het Klokhuis", addr:"Weberstraat 2, Amersfoort"},
  {id:"na-ede-di", f:"NA", d:2, t:"19:30", city:"Ede", loc:"Stichting Jonah", addr:"Bettekamp 99, Ede"},
  {id:"na-arn-di", f:"NA", d:2, t:"19:30", city:"Arnhem", loc:"Buurthuis De Oosthof", addr:"Kinderkamp 9, Arnhem"},
  {id:"na-nij-di", f:"NA", d:2, t:"19:30", city:"Nijmegen", loc:"Wijkcentrum Villa Nova", addr:"Derde van Hezewijkstraat 2, Nijmegen"},
  {id:"na-cul-di", f:"NA", d:2, t:"19:30", city:"Culemborg", loc:"Buurtcentrum Bolderburen", addr:"Prijsseweg 1b, Culemborg"},
  {id:"na-tiel-wo", f:"NA", d:3, t:"19:30", city:"Tiel", loc:"Inloophuis", addr:"Doctor Schaepmanstraat 23, Tiel"},
  {id:"na-zst-wo", f:"NA", d:3, t:"19:30", city:"Zeist", loc:"Pand van De Vertaalslag", addr:"Rozenstraat 5, Zeist"},
  {id:"na-vnd-do", f:"NA", d:4, t:"19:30", city:"Veenendaal", loc:"Bedrijfsverzamelgebouw", addr:"Wiltonstraat 40, Veenendaal", nt:"Ingang aan de achterkant"},
  {id:"na-nij-do", f:"NA", d:4, t:"19:30", city:"Nijmegen", loc:"Wijkcentrum De Brack", addr:"Leuvensbroek 1200, Nijmegen"},
  {id:"na-nij-do-vr", f:"NA", d:4, t:"19:30", city:"Nijmegen", loc:"Wijkcentrum Villa Nova", addr:"Derde van Hezewijkstraat 2, Nijmegen", nt:"Vrouwenmeeting"},
  {id:"na-arn-vr", f:"NA", d:5, t:"19:30", city:"Arnhem", loc:"Wijkcentrum Symfonie", addr:"Valckenierstraat 1, Arnhem"},
  {id:"na-nij-vr", f:"NA", d:5, t:"19:30", city:"Nijmegen", loc:"Wijkcentrum Villa Nova", addr:"Derde van Hezewijkstraat 2, Nijmegen"},
  {id:"na-nij-za", f:"NA", d:6, t:"10:00", city:"Nijmegen", loc:"Wijkcentrum De Ster", addr:"Queenstraat 37b, Nijmegen", nt:"Double Trouble"},
  {id:"na-arn-za", f:"NA", d:6, t:"19:30", city:"Arnhem", loc:"Inloophuis Sint Marten", addr:"Van Slichtenhorststraat 34, Arnhem"},

  {id:"aa-nij-zo", f:"AA", d:0, t:"10:30", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen"},
  {id:"aa-arn-ma-mid", f:"AA", d:1, t:"14:00", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem"},
  {id:"aa-arn-ma-vr", f:"AA", d:1, t:"19:30", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem", nt:"Vrouwenmeeting"},
  {id:"aa-hui-ma", f:"AA", d:1, t:"19:30", city:"Huissen", loc:"Dominicanenklooster", addr:"Stadsdam 1, Huissen"},
  {id:"aa-ede-ma", f:"AA", d:1, t:"19:50", city:"Ede", loc:"GGZ de Riethorst", addr:"Willy Brandtlaan 20, Ede"},
  {id:"aa-arn-di", f:"AA", d:2, t:"19:30", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem"},
  {id:"aa-nij-di", f:"AA", d:2, t:"19:30", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen"},
  {id:"aa-arn-wo", f:"AA", d:3, t:"19:30", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem"},
  {id:"aa-bem-wo", f:"AA", d:3, t:"19:30", city:"Bemmel", loc:"Kasteel de Kinkelenburg", addr:"Kinkelenburglaan 1, Bemmel"},
  {id:"aa-nij-wo", f:"AA", d:3, t:"19:30", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen"},
  {id:"aa-arn-do", f:"AA", d:4, t:"19:30", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem"},
  {id:"aa-ede-do", f:"AA", d:4, t:"19:30", city:"Ede", loc:"GGZ de Riethorst", addr:"Willy Brandtlaan 20, Ede"},
  {id:"aa-nij-do", f:"AA", d:4, t:"19:30", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen"},
  {id:"aa-nij-vr", f:"AA", d:5, t:"14:00", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen"},
  {id:"aa-amf-vr", f:"AA", d:5, t:"19:30", city:"Amersfoort", loc:"Wijkcentrum Het Klokhuis", addr:"Weberstraat 2, Amersfoort", nt:"Design for Living Sober, Nederlands en Engels"},
  {id:"aa-arn-vr", f:"AA", d:5, t:"19:30", city:"Arnhem", loc:"IrisZorg", addr:"Mr. B.M. Teldersstraat 15, Arnhem"},
  {id:"aa-wag-vr", f:"AA", d:5, t:"20:00", city:"Wageningen", loc:"Ons Huis", addr:"Harnjesweg 84, Wageningen"},
  {id:"aa-vnd-vr", f:"AA", d:5, t:"20:00", city:"Veenendaal", loc:"Een Nieuw Begin", addr:"Willem Dreeshof 2, Veenendaal"},
  {id:"aa-nij-za", f:"AA", d:6, t:"10:30", city:"Nijmegen", loc:"Het Tolhuis", addr:"Tolhuis 1258, Nijmegen", nt:"Alleen de laatste zaterdag van de maand"},

  {id:"ca-nij-ma-man", f:"CA", d:1, t:"19:30", city:"Nijmegen", loc:"", addr:"Heemraadstraat 10, Nijmegen", nt:"Mannenmeeting"},
  {id:"ca-nij-ma-vr", f:"CA", d:1, t:"19:30", city:"Nijmegen", loc:"", addr:"Thijmstraat 40, Nijmegen", nt:"Vrouwenmeeting"},
  {id:"ca-arn-di", f:"CA", d:2, t:"19:30", city:"Arnhem", loc:"", addr:"Van Verschuerplein 16A, Arnhem"},
  {id:"ca-wvt-wo", f:"CA", d:3, t:"19:30", city:"Westervoort", loc:"", addr:"De Rosmolen 27, Westervoort"},
  {id:"ca-wag-do", f:"CA", d:4, t:"19:30", city:"Wageningen", loc:"", addr:"Kortestraat 2, Wageningen"},
  {id:"ca-nij-do", f:"CA", d:4, t:"19:30", city:"Nijmegen", loc:"", addr:"Couwenbergstraat 22, Nijmegen"},
  {id:"ca-amf-do", f:"CA", d:4, t:"19:30", city:"Amersfoort", loc:"", addr:"Utrechtseweg 11-13, Amersfoort"},
  {id:"ca-arn-vr", f:"CA", d:5, t:"19:30", city:"Arnhem", loc:"", addr:"Van Verschuerplein 16A, Arnhem", nt:"Meditatiemeeting"},
  {id:"ca-elst-za", f:"CA", d:6, t:"10:00", city:"Elst (Gld)", loc:"", addr:"Sint Maartenstraat 32B, Elst"},
  {id:"ca-arn-za", f:"CA", d:6, t:"19:30", city:"Arnhem", loc:"", addr:"Van Verschuerplein 16A, Arnhem"}
];
const MEET_GROUPS = [["NA","NA meetings","NA meetings"],["AA","AA meetings","AA meetings"],["CA","CA meetings","CA meetings"],["Anders","Overige meetings","Other meetings"]];
const MEET_LINKS = [["NA","https://www.nanederland.nl/meetings/"],["AA","https://aa-nederland.nl/vind-een-meeting/"],["CA","https://ca-holland.nl/meetings/"]];
const DAYNAMES = ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const DAYNAMES_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const dayName = d => vt(DAYNAMES[d], DAYNAMES_EN[d]);
const DAY_ORDER = [1,2,3,4,5,6,0];
let meetOpen = {}, meetForm = false;

// ---------- meetings in de buurt: actuele lijsten van de websites van NA, AA en CA ----------
// Alle drie gebruiken dezelfde meetinglijst (TSML) die van buitenaf mag worden opgehaald. De opgehaalde lijst
// (alleen meetings op een vaste plek) staat in een eigen key, dus niet in settings en niet in de back-up.
// settings.meetPlek = {naam, lat, lon} (of {gps:1, lat, lon}); zonder plek blijft de vaste lijst hierboven (rond Rhenen).
const MEET_BRONNEN = [["NA","https://www.nanederland.nl/wp-admin/admin-ajax.php?action=meetings"],["AA","https://aa-nederland.nl/wp-admin/admin-ajax.php?action=meetings"],["CA","https://ca-holland.nl/wp-admin/admin-ajax.php?action=meetings"]];
const MEET_CACHE = "dagbeschouwing:meetcache", MEET_STRAAL = 30, MEET_VERS = 7 * 864e5;
let meetOnline = null, meetBezig = false, meetMelding = "", meetGeprobeerd = false;
function meetCacheLees(){
  if(meetOnline) return meetOnline;
  try{ const v = JSON.parse(localStorage.getItem(MEET_CACHE) || "null"); if(v && Array.isArray(v.lijst)) meetOnline = v; }catch(e){}
  return meetOnline;
}
function meetTekst(s){
  s = String(s == null ? "" : s);
  if(s.indexOf("&") < 0) return s.trim();
  const t = document.createElement("textarea"); t.innerHTML = s; return t.value.trim();
}
function meetNorm(f, m){
  if(!m || typeof m !== "object" || m.attendance_option === "online" || m.approximate === "yes") return null;
  const lat = +m.latitude, lon = +m.longitude, d = +m.day;
  if(!isFinite(lat) || !isFinite(lon) || !(d >= 0 && d <= 6)) return null;
  const adres = meetTekst(m.formatted_address).replace(/,\s*(Nederland|Netherlands|België|Belgique|Belgium)$/i, "");
  const delen = adres.split(/,\s*/);
  const city = meetTekst(m.sub_region) || (delen.length > 1 ? delen[delen.length - 1].replace(/^\d{4}\s?[A-Z]{2}\s+/, "") : "") || meetTekst(m.region) || "?";
  const out = {id: f.toLowerCase() + "-" + m.id, f, d, t: String(m.time || "").slice(0, 5), city, loc: meetTekst(m.location), addr: adres, nt: meetTekst(m.name), lat, lon};
  if(m.attendance_option === "hybrid") out.hy = 1;
  if(typeof m.url === "string" && /^https:\/\//.test(m.url)) out.url = m.url;
  return out;
}
async function meetOphalen(){
  if(meetBezig) return;
  meetBezig = true; meetGeprobeerd = true; meetMelding = vt("Meetings ophalen…", "Fetching meetings…"); renderMeetings();
  const res = await Promise.all(MEET_BRONNEN.map(async ([f, u]) => {
    try{
      const r = await fetch(u, {cache: "no-cache"}); if(!r.ok) return null;
      const d = await r.json();
      return Array.isArray(d) ? d.map(m => meetNorm(f, m)).filter(Boolean) : null;
    }catch(e){ return null; }
  }));
  const oud = meetCacheLees(), lijst = [], gelukt = [];
  res.forEach((r, i) => {
    const f = MEET_BRONNEN[i][0];
    if(r && r.length){ lijst.push(...r); gelukt.push(f); }
    else if(oud) lijst.push(...oud.lijst.filter(m => m.f === f));
  });
  meetBezig = false;
  if(gelukt.length){
    meetOnline = {tijd: Date.now(), lijst};
    try{ localStorage.setItem(MEET_CACHE, JSON.stringify(meetOnline)); }catch(e){}
    meetSterrenOmzetten();
  }
  const mis = MEET_BRONNEN.map(b => b[0]).filter(f => gelukt.indexOf(f) < 0);
  meetMelding = !mis.length ? "" : gelukt.length
    ? vt("Ophalen lukte niet voor " + mis.join(", ") + ". Daarvan zie je de laatst bekende lijst.", "Could not fetch " + mis.join(", ") + ". For those you see the last known list.")
    : oud ? vt("Ophalen lukte niet (geen internet?). Je ziet de laatst opgehaalde lijst.", "Could not fetch the meetings (no internet?). You see the last list that was fetched.")
          : vt("Ophalen lukte niet (geen internet?). Je ziet voorlopig de vaste lijst rond Rhenen.", "Could not fetch the meetings (no internet?). For now you see the fixed list around Rhenen.");
  renderMeetings(); renderMeetToday();
}
// sterren van de vaste lijst overzetten naar dezelfde meeting in de opgehaalde lijst
function meetSterrenOmzetten(){
  const o = meetCacheLees(); if(!o) return;
  let veranderd = false;
  const s = meetStars().map(id => {
    const b = MEETINGS.find(m => m.id === id); if(!b) return id;
    const plaats = b.city.split(" (")[0].toLowerCase();
    const n = o.lijst.find(m => m.f === b.f && m.d === b.d && m.t === b.t && m.city.toLowerCase() === plaats);
    if(!n) return id;
    veranderd = true; return n.id;
  });
  if(veranderd){ settings.meetStars = s.filter((x, i) => s.indexOf(x) === i); saveSettingsNow(); }
}
function meetVanaf(){
  const p = settings.meetPlek;
  return p && isFinite(p.lat) && isFinite(p.lon) ? p : {naam: "Rhenen", lat: CITY_LL.Rhenen[0], lon: CITY_LL.Rhenen[1]};
}
const meetPlekNaam = p => p.gps ? vt("je locatie", "your location") : p.naam;
function kmTussen(a1, o1, a2, o2){
  const R = 6371, r = x => x * Math.PI / 180, dLa = r(a2 - a1), dLo = r(o2 - o1);
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a1)) * Math.cos(r(a2)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// hemelsbrede afstand vanaf de gekozen plek (of Rhenen)
function meetKm(m){
  const ll = m.lat != null ? [m.lat, m.lon] : (CITY_LL[m.city] || CITY_LL[String(m.city || "").split(" (")[0]]);
  if(!ll) return 999;
  const p = meetVanaf(); return kmTussen(p.lat, p.lon, ll[0], ll[1]);
}
async function meetZetPlek(p){
  settings.meetPlek = p; meetMelding = "";
  await saveSettingsNow();
  const o = meetCacheLees();
  if(!o || Date.now() - o.tijd > MEET_VERS) meetOphalen(); else renderMeetings();
  renderMeetToday();
}
async function meetZoekPlek(q){
  const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=nl,be&q=" + encodeURIComponent(q);
  const r = await fetch(u); if(!r.ok) throw new Error("zoeken");
  const d = await r.json();
  return Array.isArray(d) && d.length ? {naam: q.charAt(0).toUpperCase() + q.slice(1), lat: +d[0].lat, lon: +d[0].lon} : null;
}
function meetPlekKaart(){
  const c = el("div", "card"); c.style.cssText = "background:var(--accent-soft);border-color:transparent";
  const p = settings.meetPlek, o = p ? meetCacheLees() : null;
  const tekst = p
    ? vt("Meetings binnen " + MEET_STRAAL + " km van " + meetPlekNaam(p) + ". Tik op NA, AA of CA om ze te zien. Met de ster ☆ maak je een meeting vast. Die zie je dan op de dag zelf bij Invullen.",
         "Meetings within " + MEET_STRAAL + " km of " + meetPlekNaam(p) + ". Tap NA, AA or CA to see them. With the star ☆ you make a meeting one of your regulars. You will then see it on that day under Fill in.")
    : vt("Meetings binnen ongeveer 30 km van Rhenen. Vul hieronder je eigen plaats of adres in, dan zie je alle meetings van NA, AA en CA binnen 30 km daarvan. Met de ster ☆ maak je een meeting vast. Die zie je dan op de dag zelf bij Invullen.",
         "Meetings within about 30 km of Rhenen. Enter your own town or address below to see all NA, AA and CA meetings within 30 km of it. With the star ☆ you make a meeting one of your regulars. You will then see it on that day under Fill in.");
  const it = note(tekst); it.style.cssText = "margin:0;font-size:calc(15px*var(--ts));color:var(--ink)"; c.appendChild(it);
  const f = el("div", "field"); f.style.marginTop = "10px";
  const lab = el("label", null, vt("Plaats of adres", "Town or address")); f.appendChild(lab);
  const inp = el("input"); inp.id = "meetPlekInvoer"; lab.htmlFor = inp.id;
  inp.placeholder = vt("Bijv. Utrecht of Dorpsstraat 1, Ede", "E.g. Utrecht or Dorpsstraat 1, Ede"); inp.autocomplete = "off";
  if(p && !p.gps) inp.value = p.naam;
  f.appendChild(inp); c.appendChild(f);
  const msg = note(meetMelding); msg.style.marginTop = "6px"; msg.setAttribute("role", "status");
  const row = el("div", "row"); row.style.cssText = "margin-top:10px;flex-wrap:wrap;gap:8px";
  const zoek = el("button", "primary", vt("Zoeken", "Search")); zoek.type = "button";
  zoek.onclick = async () => {
    const q = inp.value.trim().replace(/\s+/g, " ");
    if(!q){ msg.textContent = vt("Vul eerst een plaats of adres in.", "Please enter a town or address first."); inp.focus(); return; }
    zoek.disabled = true; msg.textContent = vt("Zoeken…", "Searching…");
    try{
      const plek = await meetZoekPlek(q);
      if(!plek){ msg.textContent = vt("Die plek kon ik niet vinden. Probeer een plaatsnaam.", "Could not find that place. Try a town name."); zoek.disabled = false; return; }
      await meetZetPlek(plek);
    }catch(e){ msg.textContent = vt("Zoeken lukte niet. Heb je internet?", "Searching did not work. Are you online?"); zoek.disabled = false; }
  };
  inp.onkeydown = e => { if(e.key === "Enter"){ e.preventDefault(); zoek.click(); } };
  row.appendChild(zoek);
  if(navigator.geolocation){
    const gps = el("button", "ghost", vt("Mijn locatie", "My location")); gps.type = "button";
    gps.onclick = () => {
      msg.textContent = vt("Locatie bepalen…", "Finding your location…");
      navigator.geolocation.getCurrentPosition(
        pos => meetZetPlek({gps: 1, naam: "", lat: +pos.coords.latitude.toFixed(3), lon: +pos.coords.longitude.toFixed(3)}),
        () => { msg.textContent = vt("Je locatie kon niet worden bepaald. Vul een plaats in.", "Your location could not be found. Please enter a town."); },
        {timeout: 15000, maximumAge: 6e5});
    };
    row.appendChild(gps);
  }
  c.appendChild(row);
  c.appendChild(msg);
  if(p){
    const bij = el("div", "links"); bij.style.cssText = "display:flex;gap:16px;margin-top:8px;flex-wrap:wrap;align-items:center";
    if(o){
      const dat = new Date(o.tijd).toLocaleDateString(settings.taal === "en" ? "en-GB" : "nl-NL", {day: "numeric", month: "long"});
      const n = note(vt("Bijgewerkt op " + dat, "Updated on " + dat)); n.style.margin = "0"; bij.appendChild(n);
    }
    const ver = el("button", "linkbtn", vt("Vernieuwen", "Refresh")); ver.type = "button"; ver.disabled = meetBezig; ver.onclick = () => meetOphalen(); bij.appendChild(ver);
    const weg = el("button", "linkbtn", vt("Terug naar de vaste lijst", "Back to the fixed list")); weg.type = "button"; weg.style.color = "var(--muted)";
    weg.onclick = async () => { delete settings.meetPlek; meetMelding = ""; renderMeetings(); renderMeetToday(); await saveSettingsNow(); };
    bij.appendChild(weg);
    c.appendChild(bij);
  }
  return c;
}

function allMeetings(){
  const own = (settings.customMeetings || []).filter(m => m && m.id && typeof m.d === "number").map(m => Object.assign({own: true}, m));
  const o = settings.meetPlek ? meetCacheLees() : null;
  if(o){
    // opgehaalde meetings binnen de straal, plus je vaste meetings (ook als ze verder weg liggen)
    const st = meetStars();
    return o.lijst.filter(m => st.indexOf(m.id) >= 0 || meetKm(m) <= MEET_STRAAL)
      .concat(MEETINGS.filter(m => st.indexOf(m.id) >= 0)).concat(own);
  }
  const weg = typeof meetingVerborgen === "function" ? meetingVerborgen() : [];
  return MEETINGS.filter(m => weg.indexOf(m.id) < 0).concat(own);
}
const meetStars = () => Array.isArray(settings.meetStars) ? settings.meetStars : [];
const isStar = m => meetStars().indexOf(m.id) >= 0;
const meetSort = (a, b) => (DAY_ORDER.indexOf(a.d) - DAY_ORDER.indexOf(b.d)) || String(a.t).localeCompare(String(b.t)) || a.city.localeCompare(b.city);
const routeUrl = m => "https://maps.apple.com/?q=" + encodeURIComponent(m.addr || m.city);
const meetWhere = m => [m.loc, m.addr].filter(Boolean).join(", ");

async function toggleStar(m){
  const s = meetStars().slice(), i = s.indexOf(m.id);
  if(i >= 0) s.splice(i, 1); else s.push(m.id);
  settings.meetStars = s;
  renderMeetings(); renderMeetToday();
  await saveSettingsNow();
}

function meetRow(m, showGroup){
  const r = el("div", "mrow");
  const tx = el("div", "tx");
  const tt = el("div", "tt");
  if(showGroup) tt.appendChild(el("span", "badge", m.f));
  const km = settings.meetPlek && m.lat != null ? meetKm(m) : null;
  tt.appendChild(document.createTextNode((m.t || "?") + " · " + m.city + (km != null ? " · " + Math.round(km) + " km" : "")));
  tx.appendChild(tt);
  if(meetWhere(m)) tx.appendChild(el("div", "ad", meetWhere(m)));
  if(m.nt) tx.appendChild(el("div", "nt", m.nt));
  if(m.hy) tx.appendChild(el("div", "nt", vt("Ook online te volgen", "Can also be joined online")));
  const links = el("div", "links");
  if(m.addr){ const a = el("a", "linkbtn more", vt("Route", "Directions")); a.href = routeUrl(m); a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); }
  if(m.url){ const a = el("a", "linkbtn", vt("Meer info", "More info")); a.href = m.url; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a); }
  if(m.own){
    const del = el("button", "linkbtn", vt("Weghalen", "Remove")); del.type = "button"; del.style.color = "var(--muted)";
    del.onclick = async () => {
      if(!(await confirmDialog(vt("Meeting weghalen?", "Remove meeting?"), m.f + " " + m.city + " (" + dayName(m.d) + ")" + vt(" verdwijnt uit je lijst.", " will be removed from your list."), vt("Weghalen", "Remove")))) return;
      settings.customMeetings = (settings.customMeetings || []).filter(x => x.id !== m.id);
      settings.meetStars = meetStars().filter(x => x !== m.id);
      renderMeetings(); renderMeetToday(); await saveSettingsNow();
    };
    links.appendChild(del);
  }
  if(links.childNodes.length) tx.appendChild(links);
  r.appendChild(tx);
  const st = el("button", "star" + (isStar(m) ? " on" : "")); st.appendChild(icon("star", 24, isStar(m)));
  st.type = "button"; st.setAttribute("aria-label", isStar(m) ? vt("Niet meer vast", "Remove from regular") : vt("Maak vast", "Make regular"));
  st.onclick = () => toggleStar(m);
  r.appendChild(st);
  return r;
}

function meetListByDay(list, showGroup){
  const box = el("div");
  let last = null;
  list.slice().sort(meetSort).forEach(m => {
    if(m.d !== last){ box.appendChild(el("div", "mday", dayName(m.d))); last = m.d; }
    box.appendChild(meetRow(m, showGroup));
  });
  return box;
}

function meetFormCard(){
  const c = el("div", "card mform");
  c.appendChild(el("div", "qtitle", vt("Eigen meeting toevoegen", "Add your own meeting")));
  const field = (label, input) => { const f = el("div", "field"); const l = el("label", null, label); f.appendChild(l); f.appendChild(input); return f; };
  const grp = el("select"); [["NA","NA"],["AA","AA"],["CA","CA"],["Anders",vt("Anders", "Other")]].forEach(([v, l]) => { const o = el("option", null, l); o.value = v; grp.appendChild(o); });
  const day = el("select"); DAY_ORDER.forEach(d => { const o = el("option", null, cap(dayName(d))); o.value = String(d); day.appendChild(o); });
  const time = el("input"); time.type = "time"; time.value = "19:30";
  const two = el("div", "two"); two.appendChild(field(vt("Groep", "Group"), grp)); two.appendChild(field(vt("Dag", "Day"), day));
  c.appendChild(two);
  c.appendChild(field(vt("Tijd", "Time"), time));
  const city = el("input"); city.placeholder = vt("Bijv. Rhenen", "E.g. Rhenen");
  c.appendChild(field(vt("Plaats", "Town"), city));
  const loc = el("input"); loc.placeholder = vt("Bijv. Buurthuis De Kolk (mag leeg)", "E.g. Buurthuis De Kolk (optional)");
  c.appendChild(field(vt("Naam van de locatie", "Name of the venue"), loc));
  const addr = el("input"); addr.placeholder = vt("Straat en huisnummer", "Street and house number");
  c.appendChild(field(vt("Adres", "Address"), addr));
  const msg = note(""); c.appendChild(msg);
  const row = el("div", "row"); row.style.marginTop = "12px";
  const cancel = el("button", "ghost", vt("Annuleren", "Cancel")); cancel.type = "button"; cancel.onclick = () => { meetForm = false; renderMeetings(); };
  const save = el("button", "primary", vt("Opslaan", "Save")); save.type = "button";
  save.onclick = async () => {
    const cv = city.value.trim().replace(/[,:]/g, " ").replace(/\s+/g, " ");
    if(!cv){ msg.textContent = vt("Vul in elk geval de plaats in.", "Please fill in at least the town."); city.focus(); return; }
    const street = addr.value.trim();
    const m = {id: "own-" + newId(), f: grp.value, d: Number(day.value), t: time.value || "", city: cv, loc: loc.value.trim(), addr: street ? street + ", " + cv : ""};
    settings.customMeetings = (settings.customMeetings || []).concat([m]);
    meetForm = false; meetOpen[m.f] = true;
    renderMeetings(); await saveSettingsNow();
  };
  row.appendChild(cancel); row.appendChild(save); c.appendChild(row);
  return c;
}

function renderMeetings(){
  const box = $("meetBox"); if(!box) return;
  box.innerHTML = "";
  // plek gekozen en lijst ontbreekt of is ouder dan een week: één keer per keer openen opnieuw ophalen
  if(settings.meetPlek && !meetBezig && !meetGeprobeerd){
    const o = meetCacheLees();
    if(!o || Date.now() - o.tijd > MEET_VERS){ setTimeout(meetOphalen, 0); }
  }
  const all = allMeetings();
  box.appendChild(meetPlekKaart());

  const stars = all.filter(isStar);
  if(stars.length){
    const c = el("div", "card");
    const sth = el("div", "qtitle withic"); sth.appendChild(icon("star", 20, true)); sth.appendChild(document.createTextNode(vt("Mijn vaste meetings", "My regular meetings"))); sth.firstChild.style.color = "#e0a020"; c.appendChild(sth);
    c.appendChild(meetListByDay(stars, true));
    box.appendChild(c);
  }

  MEET_GROUPS.forEach(([g, labelNl, labelEn]) => {
    const label = vt(labelNl, labelEn);
    const list = all.filter(m => m.f === g);
    if(!list.length) return;
    const c = el("div", "card");
    const head = el("button", "mgroup"); head.type = "button";
    head.appendChild(el("div", "qtitle", label));
    head.appendChild(el("span", "cnt", String(list.length)));
    const chv = el("span", "cnt"); chv.appendChild(icon(meetOpen[g] ? "chevD" : "chevR", 18)); head.appendChild(chv);
    head.onclick = () => { meetOpen[g] = !meetOpen[g]; renderMeetings(); };
    c.appendChild(head);
    if(meetOpen[g]) c.appendChild(meetListByDay(list, false));
    box.appendChild(c);
  });

  if(meetForm) box.appendChild(meetFormCard());
  else {
    const b = el("button", "chip start", vt("+ Eigen meeting toevoegen", "+ Add your own meeting")); b.type = "button"; b.style.margin = "0 2px 12px";
    b.onclick = () => { meetForm = true; renderMeetings(); };
    box.appendChild(b);
  }

  const f = el("div", "card");
  const ft = note(settings.meetPlek && meetCacheLees()
    ? vt("De lijst komt van de websites van NA, AA en CA. Alleen meetings op een vaste plek, afstand hemelsbreed. Kijk bij twijfel op de site zelf.", "The list comes from the NA, AA and CA websites. Only meetings at a fixed place, distance as the crow flies. If in doubt, check the website itself.")
    : vt("Gecontroleerd op 8 november 2026. Tijden en adressen kunnen veranderen. Kijk bij twijfel op de site van NA, AA of CA.", "Checked on 8 November 2026. Times and addresses can change. If in doubt, check the NA, AA or CA website."));
  ft.style.marginTop = "0"; f.appendChild(ft);
  const lr = el("div", "links"); lr.style.cssText = "display:flex;gap:16px;margin-top:8px;flex-wrap:wrap";
  MEET_LINKS.forEach(([n, u]) => { const a = el("a", "linkbtn", n + vt("-meetinglijst ›", " meeting list ›")); a.href = u; a.target = "_blank"; a.rel = "noopener"; lr.appendChild(a); });
  f.appendChild(lr);
  box.appendChild(f);
}

// vraag 4: "een meeting bezocht" + plaats aanvinken
function logMeetingVisit(m){
  const q = QUESTIONS.find(x => x.id === "q4"); if(!q) return "";
  const row = q.rows[0], si = row.sub.item;
  const a = answer(q.id);
  const lines = a.text ? a.text.split("\n") : [];
  let k = findItemLineOf(lines, si);
  const mb = k >= 0 ? bulletIn(lines[k], si) : bullet(si);
  if(k < 0){
    const known = [].concat(...itemsOf(q, row).map(bulletVariants));
    let at = -1; lines.forEach((l, n) => { if(known.some(kb => lineIs(l, kb))) at = n; });
    k = at >= 0 ? at + 1 : lines.length;
    lines.splice(k, 0, mb);
  }
  const i = lines[k].indexOf(": ");
  const places = i < 0 ? [] : lines[k].slice(i + 2).replace(/\.$/, "").split(/,\s*/).filter(Boolean);
  if(places.indexOf(m.city) >= 0) return vt("Stond al genoteerd bij vraag 4.", "Already noted under question 4.");
  places.push(m.city);
  lines[k] = mb + ": " + places.join(", ");
  a.text = lines.join("\n").replace(/^\n+/, "");
  if(!(settings.meetingPlaces || []).includes(m.city)){ settings.meetingPlaces = (settings.meetingPlaces || []).concat([m.city]); saveSettingsNow(); }
  scheduleSave();
  return vt("Genoteerd bij vraag 4.", "Noted under question 4.");
}

let meetTodayOpen = false;
function renderMeetToday(){
  const card = $("meetToday"); if(!card) return;
  const wd = parseKey(curKey).getDay();
  const list = allMeetings().filter(m => isStar(m) && m.d === wd).sort(meetSort);
  card.classList.toggle("hidden", !list.length);
  card.innerHTML = "";
  if(!list.length) return;
  // rustige regel "Meeting vandaag · 19:30 Utrecht ›"; tikken klapt de details en de knop "Ik ben geweest" open
  const head = el("button", "plankop"); head.type = "button"; head.setAttribute("aria-expanded", meetTodayOpen ? "true" : "false");
  head.appendChild(icon("pin", 20));
  head.appendChild(el("div", "qtitle", curKey === todayKey() ? vt("Meeting vandaag", "Meeting today") : vt("Meeting op deze dag", "Meeting on this day")));
  const cnt = el("div", "note", (list[0].t || "?") + (list.length > 1 ? " +" + (list.length - 1) : "") + (meetTodayOpen ? " ▾" : " ›")); cnt.style.cssText = "margin:0;flex:none"; head.appendChild(cnt);
  head.onclick = () => { meetTodayOpen = !meetTodayOpen; renderMeetToday(); };
  card.appendChild(head);
  if(!meetTodayOpen) return;
  const q4 = (entry.answers && entry.answers.q4 && entry.answers.q4.text) || "";
  list.forEach(m => {
    const r = el("div", "mrow"); r.style.borderTop = "0";
    const tx = el("div", "tx");
    const tt = el("div", "tt"); tt.appendChild(el("span", "badge", m.f)); tt.appendChild(document.createTextNode((m.t || "?") + " · " + m.city)); tx.appendChild(tt);
    if(meetWhere(m)) tx.appendChild(el("div", "ad", meetWhere(m)));
    const done = q4.split("\n").some(l => /^- (een meeting bezocht|attended a meeting)/i.test(l.trim()) && l.indexOf(": ") >= 0 && l.slice(l.indexOf(": ") + 2).split(/,\s*/).indexOf(m.city) >= 0);
    const b = el("button", done ? "ghost" : "primary", done ? vt("Geweest ✓", "Went ✓") : vt("Ik ben geweest ✓", "I went ✓")); b.type = "button"; b.style.marginTop = "8px";
    const msg = note(""); msg.style.marginTop = "6px";
    b.disabled = done;
    msg.dataset.mid = m.id;
    b.onclick = () => { const t = logMeetingVisit(m); render(); const nm = $("meetToday").querySelector('[data-mid="' + m.id + '"]'); if(nm) nm.textContent = t; };
    tx.appendChild(b); tx.appendChild(msg);
    r.appendChild(tx);
    card.appendChild(r);
  });
}

// afstand tot Rhenen (hemelsbreed), zodat bij gelijke tijd de dichtstbijzijnde meeting voorgaat
const CITY_LL = {"Rhenen":[51.959,5.568],"Elst (Utr.)":[52.001,5.505],"Veenendaal":[52.027,5.556],"Wageningen":[51.970,5.665],"Ede":[52.040,5.665],
  "Bennekom":[52.004,5.676],"Tiel":[51.886,5.430],"Culemborg":[51.955,5.227],"Zeist":[52.089,5.233],"Amersfoort":[52.156,5.387],"Arnhem":[51.985,5.899],
  "Nijmegen":[51.842,5.853],"Elst (Gld)":[51.919,5.848],"Huissen":[51.936,5.940],"Bemmel":[51.893,5.898],"Westervoort":[51.957,5.973]};
// noodplan: eerstvolgende meeting
function nextMeetingCard(){
  const all = allMeetings();
  const pool = all; // alle meetings uit de lijst (NA, AA en CA), niet alleen favorieten
  const now = new Date(), nowT = pad(now.getHours()) + ":" + pad(now.getMinutes());
  let found = null, off = 0;
  for(off = 0; off < 7 && !found; off++){
    const wd = (now.getDay() + off) % 7;
    const cand = pool.filter(m => m.d === wd && m.t && (off > 0 || m.t >= nowT)).sort((a, b) => String(a.t).localeCompare(String(b.t)) || meetKm(a) - meetKm(b));
    if(cand.length) found = cand[0];
  }
  if(!found) return null;
  off--;
  const when = off === 0 ? vt("vandaag", "today") : off === 1 ? vt("morgen", "tomorrow") : dayName(found.d);
  const c = el("div", "card");
  c.appendChild(el("div", "qtitle", vt("Naar een meeting", "Go to a meeting")));
  const t = note(vt("Eerstvolgende meeting: ", "Next meeting: ") + when + " " + found.t + ", " + found.f + " " + found.city);
  t.style.cssText = "margin-top:6px;font-size:calc(16px*var(--ts));color:var(--ink);font-weight:600"; c.appendChild(t);
  if(meetWhere(found)){ const a = note(meetWhere(found)); a.style.marginTop = "2px"; c.appendChild(a); }
  const lr = el("div"); lr.style.cssText = "display:flex;gap:16px;margin-top:8px;flex-wrap:wrap";
  if(found.addr){ const a = el("a", "linkbtn more", vt("Route", "Directions")); a.href = routeUrl(found); a.target = "_blank"; a.rel = "noopener"; lr.appendChild(a); }
  const all2 = el("button", "linkbtn more", vt("Alle meetings", "All meetings")); all2.type = "button"; all2.onclick = () => showView("meetings"); lr.appendChild(all2);
  c.appendChild(lr);
  return c;
}
