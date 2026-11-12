// Registreert de service worker (offline werken). Werkt alleen via http://localhost of https://, niet via file://.
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => console.warn("Service worker niet geregistreerd:", err));
  });
}
