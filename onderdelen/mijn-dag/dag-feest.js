// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// ---------- feestelijke dag-export op de dag van een mijlpaal ----------
// Alleen op de dag zelf (e.date = datum van de mijlpaal). Gebruikt door dag-pdf.js (buildPdf) en dag-word.js (documentXml).
// Geeft null op gewone dagen; anders kleur (per keytag), titel, bovenregel en een tekst voor het vak "Vandaag is een bijzondere dag".
// Kleuren: de keytag zelf, behalve waar witte tekst er slecht op leest (wit → goud, groen/geel → donkerder).
const FEEST_KLEUR = {"#ffffff": "#d9a441", "#FF5A2E": "#FF5A2E", "#2FC94A": "#22a23a", "#9E1B22": "#9E1B22", "#1F3FA8": "#1F3FA8", "#F7D51D": "#d2a50f", "#EEF2E6": "#8fa07c", "#7A7A78": "#6f6f6c", "#1B1B1B": "#2a2a2a"};
const FEEST_TEKST = {
  welkom: ["Vandaag begint je nieuwe weg. De eerste stap is de moeilijkste, en die heb je gezet.", "Today your new road begins. The first step is the hardest, and you have taken it."],
  d1: ["Je eerste 24 uur. Eén dag tegelijk, en deze dag is van jou.", "Your first 24 hours. One day at a time, and this day is yours."],
  d30: ["Een maand lang, elke dag opnieuw gekozen. Dat is geen toeval, dat is jouw werk.", "A whole month, chosen again every day. That is no coincidence, that is your work."],
  d60: ["Twee maanden. Je merkt dat het werkt als je eraan werkt.", "Two months. You notice it works if you work it."],
  d90: ["Negentig dagen. Het fundament staat. Vandaag mag je even stilstaan bij hoe ver je bent gekomen.", "Ninety days. The foundation is there. Today you may stop for a moment and see how far you have come."],
  d120: ["Vier maanden. Stap voor stap wordt dit gewoon jouw leven.", "Four months. Step by step this is becoming your life."],
  d150: ["Vijf maanden. Je laat elke dag zien wat je waard bent.", "Five months. Every day you show what you are worth."],
  d180: ["Een half jaar. Kijk eens terug naar waar je begon. Wat een verschil.", "Half a year. Look back at where you started. What a difference."],
  d270: ["Negen maanden. Iets nieuws is gegroeid, en dat ben jij.", "Nine months. Something new has grown, and that is you."],
  j1: ["Een heel jaar. Vier seizoenen, 365 keer gekozen voor jezelf. Wat een prestatie.", "A whole year. Four seasons, 365 times you chose yourself. What an achievement."],
  m18: ["Anderhalf jaar. Je herstel staat steviger. Geef door wat je hebt gekregen.", "Eighteen months. Your recovery stands stronger. Pass on what you have been given."],
  jn: ["Weer een jaar erbij. Je bent een voorbeeld, ook als je dat zelf niet zo ziet.", "Another year. You are an example, even if you do not see it that way yourself."]
};
function dagFeest(e){
  const since = settings.since; if(!since || !e || !e.date || typeof mpSoort !== "function") return null;
  const s = mpSoort(since, e.date); if(!s) return null;
  const tag = mpKeytag(since, e.date, s);
  const hex = tag ? (FEEST_KLEUR[tag.c] || tag.c) : "#d9a441";
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const meng = (a, t) => rgb.map((c, i) => c + ((a ? a[i] : 1) - c) * t);   // naar wit (of naar a) mengen
  const soft = meng(null, .9), licht = meng(null, .35), donker = rgb.map(c => c * .72);
  const toHex = c => c.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
  const kleurNaam = tag ? (tag.nx || "").replace(/-?keytag$/i, "").trim() : "";
  const tx = FEEST_TEKST[s.t] || FEEST_TEKST.jn;
  return {
    s, tag, rgb, licht, donker, soft, rand: meng(null, .5),
    hex: toHex(rgb), softHex: toHex(soft), randHex: toHex(meng(null, .5)),
    titel: mpTitel(s),
    kort: mpTitel(s).replace(/!$/, ""),
    kick: (vt("Mijlpaal", "Milestone") + (kleurNaam ? " · " + kleurNaam + " " + vt("keytag", "keytag") : "")).toUpperCase(),
    tekst: vt(tx[0], tx[1])
  };
}
