# Publier les fusions vérifiées avec GitHub Actions

13 novembre 2026 — À la demande du propriétaire, GitHub Actions construit et vérifie le site puis transmet le même artefact au VPS après fusion dans `main`. Le VPS est partagé : aucun build ni runner GitHub installé dessus. Un utilisateur SSH dédié accède uniquement à une passerelle et un contrôleur root détenus par l'administrateur ; il ne peut pas modifier leur code ou les autres services.

La racine du site Nginx suit un lien `current` interne au montage Docker existant. Une initialisation nécessite un rechargement progressif du seul Nginx LADS ; les publications ultérieures remplacent atomiquement le lien, sans redémarrage. Les ressources Astro à noms versionnés sont partagées pour préserver les onglets déjà ouverts. Une préproduction isolée précède une sauvegarde complète, un journal de transaction et une bascule vérifiée en HTTPS ; l'échec restaure la version précédente.

Cette décision remplace la publication manuelle par renommage du dossier monté et redémarrage du conteneur. Les URL et l'export statique en fichiers restent ceux de l'ADR 0001. Les permissions, déclencheurs, limites, diagnostics et procédures de retour arrière sont décrits dans [le guide d'exploitation](../deploiement-hostinger.md), source de vérité pour les agents.
