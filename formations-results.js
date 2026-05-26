/*
 * Résultats publics d'une formation — synchronisation avec EVA.
 *
 * Cherche tous les éléments avec [data-formation-results-code] et y injecte
 * un bloc "Nos résultats" avec les indicateurs agrégés de la formation
 * (stagiaires formés, satisfaction, NPS, atteinte objectifs).
 *
 * Si la formation a moins de 5 stagiaires formés (hasEnoughData=false) ou
 * si l'API renvoie une erreur, le conteneur est masqué (display:none).
 *
 * Couvre l'indicateur Qualiopi 1 (informations publiques sur les prestations).
 *
 * Usage côté HTML :
 *   <div data-formation-results-code="vMixV1"></div>
 *   <script src="../formations-results.js"></script>
 */
(function () {
  "use strict";
  var API_BASE = "https://evaremote.com/api/public/formations";

  // Injection du CSS au load — autonome, pas besoin de toucher footer.css
  var STYLE_ID = "lads-results-style";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".lads-results-block{background:linear-gradient(180deg,#fafbff 0%,#f0f4ff 100%);" +
      "border:1px solid #e0e7ff;border-radius:16px;padding:28px 32px;margin:32px 0;}" +
      ".lads-results-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;}" +
      ".lads-results-icon{font-size:24px;}" +
      ".lads-results-title{margin:0;font-size:18px;font-weight:600;color:#1f2244;" +
      "letter-spacing:0.5px;text-transform:uppercase;}" +
      ".lads-results-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));" +
      "gap:16px;margin-bottom:20px;}" +
      ".lads-results-card{background:#fff;border-radius:12px;padding:18px 16px;text-align:center;" +
      "box-shadow:0 1px 3px rgba(31,34,68,0.06);}" +
      ".lads-results-value{font-size:32px;font-weight:700;color:#1f2244;line-height:1;" +
      "font-family:'JetBrains Mono',monospace;}" +
      ".lads-results-unit{font-size:18px;color:#727485;margin-left:2px;}" +
      ".lads-results-label{font-size:12px;color:#727485;margin-top:6px;" +
      "text-transform:uppercase;letter-spacing:0.3px;}" +
      ".lads-results-bar-wrap{margin:18px 0 12px;}" +
      ".lads-results-bar-label{display:flex;justify-content:space-between;font-size:13px;" +
      "color:#1f2244;margin-bottom:8px;}" +
      ".lads-results-bar-label strong{font-family:'JetBrains Mono',monospace;color:#166534;}" +
      ".lads-results-bar-track{height:8px;background:#e5e7eb;border-radius:8px;overflow:hidden;}" +
      ".lads-results-bar-fill{height:100%;background:linear-gradient(90deg,#7dcef5,#166534);" +
      "border-radius:8px;transition:width 1s ease;}" +
      ".lads-results-footer{font-size:11px;color:#9ca3af;text-align:center;margin-top:16px;" +
      "padding-top:14px;border-top:1px solid #e0e7ff;font-family:'JetBrains Mono',monospace;}" +
      "@media(max-width:600px){.lads-results-block{padding:20px 18px;}" +
      ".lads-results-value{font-size:26px;}}";
    document.head.appendChild(style);
  }

  function renderResults(container, data) {
    var hasSat = data.satisfactionAverage !== null;
    var hasNps = data.npsScore !== null;
    var lastDate = new Date(data.lastUpdated).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    container.innerHTML =
      '<div class="lads-results-block">' +
        '<div class="lads-results-header">' +
          '<span class="lads-results-icon" aria-hidden="true">📊</span>' +
          '<h3 class="lads-results-title">Nos résultats</h3>' +
        '</div>' +
        '<div class="lads-results-grid">' +
          '<div class="lads-results-card">' +
            '<div class="lads-results-value">' + data.traineesAccueillisTotal + '</div>' +
            '<div class="lads-results-label">stagiaires formés</div>' +
          '</div>' +
          (hasSat
            ? '<div class="lads-results-card">' +
                '<div class="lads-results-value">' + data.satisfactionAverage + '<span class="lads-results-unit">/5</span></div>' +
                '<div class="lads-results-label">satisfaction moyenne</div>' +
              '</div>'
            : '') +
          (hasNps
            ? '<div class="lads-results-card">' +
                '<div class="lads-results-value">' + (data.npsScore > 0 ? "+" : "") + data.npsScore + '</div>' +
                '<div class="lads-results-label">NPS (recommandation)</div>' +
              '</div>'
            : '') +
          '<div class="lads-results-card">' +
            '<div class="lads-results-value">' + data.sessionsCount + '</div>' +
            '<div class="lads-results-label">sessions réalisées</div>' +
          '</div>' +
        '</div>' +
        (data.objectifsAtteintsRate > 0
          ? '<div class="lads-results-bar-wrap">' +
              '<div class="lads-results-bar-label">' +
                '<span>Objectifs pédagogiques atteints</span>' +
                '<strong>' + data.objectifsAtteintsRate + ' %</strong>' +
              '</div>' +
              '<div class="lads-results-bar-track">' +
                '<div class="lads-results-bar-fill" style="width:' + data.objectifsAtteintsRate + '%"></div>' +
              '</div>' +
            '</div>'
          : '') +
        '<div class="lads-results-footer">' +
          'Données mises à jour le ' + lastDate +
          (data.responseRate > 0
            ? ' · Taux de réponse aux évaluations : ' + data.responseRate + ' %'
            : '') +
        '</div>' +
      '</div>';
  }

  function loadFor(container) {
    var code = container.getAttribute("data-formation-results-code");
    if (!code) return;
    fetch(API_BASE + "/" + encodeURIComponent(code) + "/results")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data.hasEnoughData) {
          // Pas assez de stagiaires formés (< 5) → on masque
          container.style.display = "none";
          return;
        }
        renderResults(container, data);
      })
      .catch(function () {
        // Erreur réseau → masquer plutôt qu'afficher du vide
        container.style.display = "none";
      });
  }

  function init() {
    var nodes = document.querySelectorAll("[data-formation-results-code]");
    if (nodes.length === 0) return;
    injectStyles();
    Array.prototype.forEach.call(nodes, loadFor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
