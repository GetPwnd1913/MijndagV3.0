// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- taal: Nederlands / English ----------
// Teksten staan als paar in de code: vt("Nederlands", "English"). De keuze staat in settings.taal ("nl" = standaard).
// Opgeslagen antwoorden worden NIET vertaald. Kopjes en knopjes in antwoorden worden in beide talen herkend
// (woordenlijst in vragen.js: vItem / nlItem), zodat een oude Nederlandse dag ook in de Engelse stand goed werkt.
// Dit bestand staat als eerste in index.html: settings bestaat dan nog niet, daarom de try/catch.
const isEn = () => { try{ return settings.taal === "en"; }catch(e){ return false; } };
const vt = (nl, en) => isEn() ? en : nl;
const locale = () => vt("nl-NL", "en-GB");
// aantal(3, "dag", "dagen", "day", "days") -> "3 dagen" / "3 days"
const aantal = (n, nl1, nlN, en1, enN) => n + " " + (n === 1 ? vt(nl1, en1) : vt(nlN, enN));

// Vaste teksten in index.html: data-en="English" (tekst), data-en-aria (aria-label), data-en-ph (placeholder).
// De Nederlandse tekst wordt bij de eerste keer bewaard in data-nl, zodat terugwisselen ook werkt.
function pasTaalToe(){
  document.documentElement.lang = vt("nl", "en");
  document.querySelectorAll("[data-en]").forEach(n => {
    let tn = null; n.childNodes.forEach(c => { if(c.nodeType === 3 && c.textContent.trim()) tn = c; });
    if(n.dataset.nl == null) n.dataset.nl = tn ? tn.textContent : n.textContent;
    const t = vt(n.dataset.nl, n.dataset.en);
    if(tn) tn.textContent = t; else n.textContent = t;
  });
  [["enAria", "nlAria", "aria-label"], ["enPh", "nlPh", "placeholder"]].forEach(([en, nl, attr]) => {
    document.querySelectorAll("[data-" + en.replace(/[A-Z]/g, c => "-" + c.toLowerCase()) + "]").forEach(n => {
      if(n.dataset[nl] == null) n.dataset[nl] = n.getAttribute(attr) || "";
      n.setAttribute(attr, vt(n.dataset[nl], n.dataset[en]));
    });
  });
}
