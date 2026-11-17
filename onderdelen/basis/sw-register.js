// © 2026 Roy van Dalem. Alle rechten voorbehouden.
// Registreert de service worker (offline werken). Werkt alleen via http://localhost of https://, niet via file://.
// Bijwerken: een app op het iPhone-beginscherm blijft vaak op de achtergrond openstaan en laadt dan niet opnieuw.
// Daarom kijken we elke keer dat de app weer in beeld komt of er een nieuwe versie is (reg.update()).
// publiceer-github.ps1 zet bij elke upload een versienummer in sw.js, dus elke nieuwe versie geeft een nieuwe service worker;
// zodra die het overneemt (controllerchange), laadt de pagina zich één keer opnieuw met de nieuwe bestanden.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    const hadWorker = !!navigator.serviceWorker.controller;   // eerste keer installeren: niet herladen
    let herladen = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if(!hadWorker || herladen) return;
      herladen = true; location.reload();
    });
    navigator.serviceWorker.register("sw.js").then(reg => {
      const kijk = () => { reg.update().catch(() => {}); };
      document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible") kijk(); });
      window.addEventListener("pageshow", e => { if(e.persisted) kijk(); });
    }).catch((err) => console.warn("Service worker niet geregistreerd:", err));
  });
}
