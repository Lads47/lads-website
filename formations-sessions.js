/*
 * Sessions de formation — synchronisation avec EVA.
 *
 * Cherche tous les éléments avec [data-formation-code] (typiquement le bloc
 * .meta-dates-list des sidebars formations) et remplace leur contenu par les
 * 3 prochaines sessions ouvertes aux inscriptions, sous forme de chips
 * cliquables qui mènent au formulaire d'inscription d'EVA pour cette session.
 *
 * Le contenu HTML initial (dates statiques) sert de fallback :
 * - si l'API est down → on le laisse en place (pas de modification)
 * - si l'API renvoie 0 session → on affiche "Prochaines dates à venir"
 *
 * Usage côté HTML :
 *   <div class="meta-dates-list" data-formation-code="vMixV1">
 *     <span class="meta-date-chip">07/12/2026 – 11/12/2026</span>
 *   </div>
 *   <script src="../formations-sessions.js"></script>
 */
(function () {
  "use strict";
  var API_BASE = "https://evaremote.com/api/public/formations";

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function fmtRange(debutIso, finIso) {
    var debut = new Date(debutIso);
    var fin = new Date(finIso);
    var sameDay = debut.toDateString() === fin.toDateString();
    var sameMonth = debut.getFullYear() === fin.getFullYear() && debut.getMonth() === fin.getMonth();

    if (sameDay) {
      return debut.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
    }
    if (sameMonth) {
      var monthYear = debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      return pad(debut.getDate()) + "–" + pad(fin.getDate()) + " " + monthYear;
    }
    // Mois différents : "30 nov → 04 déc 2026"
    var debutShort = debut.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(".", "");
    var finShort = fin.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(".", "");
    return debutShort + " → " + finShort + " " + fin.getFullYear();
  }

  function renderChips(container, sessions) {
    container.innerHTML = "";
    sessions.forEach(function (s) {
      var a = document.createElement("a");
      a.href = s.inscriptionUrl;
      a.className = "meta-date-chip";
      a.style.textDecoration = "none";
      a.style.cursor = "pointer";
      a.style.transition = "transform 0.15s, box-shadow 0.15s";
      a.textContent = fmtRange(s.dateDebut, s.dateFin);
      var placesLabel =
        s.placesRestantes > 0 && s.placesRestantes <= 3
          ? " · " + s.placesRestantes + " place" + (s.placesRestantes > 1 ? "s" : "")
          : "";
      a.title = "S'inscrire à la session du " + fmtRange(s.dateDebut, s.dateFin) + placesLabel;
      a.addEventListener("mouseenter", function () {
        a.style.transform = "translateY(-2px)";
        a.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
      });
      a.addEventListener("mouseleave", function () {
        a.style.transform = "";
        a.style.boxShadow = "";
      });
      container.appendChild(a);
    });
  }

  function renderEmpty(container) {
    container.innerHTML =
      '<span class="meta-date-chip" style="background:#f0f0f0;color:#666;font-weight:500;">' +
      "Prochaines dates à venir — nous contacter" +
      "</span>";
  }

  function loadFor(container) {
    var code = container.getAttribute("data-formation-code");
    if (!code) return;
    fetch(API_BASE + "/" + encodeURIComponent(code) + "/upcoming-sessions")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data.sessions || data.sessions.length === 0) {
          renderEmpty(container);
          return;
        }
        renderChips(container, data.sessions);
      })
      .catch(function () {
        // En cas d'échec, on laisse le contenu HTML d'origine (dates statiques).
        // Ne rien faire = résilience maximale.
      });
  }

  function init() {
    var nodes = document.querySelectorAll("[data-formation-code]");
    Array.prototype.forEach.call(nodes, loadFor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
