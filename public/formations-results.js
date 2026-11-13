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
                '<div class="lads-results-bar-fill" style="--result-progress:' + data.objectifsAtteintsRate + '%"></div>' +
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

  // Masque toute la <section> hôte (et donc son padding), pas seulement le
  // conteneur : sinon une section vide laisse ~180px de blanc dans la page.
  function hide(container) {
    var section = container.closest ? container.closest("section") : null;
    (section || container).style.display = "none";
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
          // Pas assez de stagiaires formés (< 5) → on masque la section
          hide(container);
          return;
        }
        renderResults(container, data);
      })
      .catch(function () {
        // Erreur réseau → masquer plutôt qu'afficher du vide
        hide(container);
      });
  }

  function init() {
    var nodes = document.querySelectorAll("[data-formation-results-code]");
    if (nodes.length === 0) return;

    Array.prototype.forEach.call(nodes, loadFor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
