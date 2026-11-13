# Livraison et retour arrière

## Procédure actuelle

Le propriétaire a autorisé le 13 novembre 2026 la publication automatique après fusion dans `main`, avec contrôles, sauvegarde et restauration. **Lire [le guide de déploiement Hostinger](deploiement-hostinger.md) avant une fusion ou une intervention sur la production.** Le ticket #5 et `suivi-refonte.md` consignent l'installation et les preuves réellement observées.

GitHub Actions construit et vérifie le site puis publie le même `dist/` par l'accès SSH limité. Le VPS partagé ne compile rien. Le contrôleur vérifie une préproduction isolée, sauvegarde la version précédente et remplace atomiquement le lien `site/current`. Les contrôles HTTPS valident la version ; leur échec restaure la précédente. Les publications ordinaires ne redémarrent aucun conteneur. Le workflow de retour arrière manuel et la suspension des futures livraisons sont décrits dans le guide.

Les scripts root et la configuration Nginx restent administrés séparément : une modification de ces fichiers dans GitHub ne les installe pas silencieusement sur le VPS.

## Présentation et contrôles locaux

Avec la version Node de `package.json` : `npm ci`, `npm run check`, `npm run build`, `npm test`, puis `python3 -m unittest discover -s tests/deploy -v`. Lancer `npm run preview` et, dans un second terminal, `npm run test:browser`. Les services externes sont simulés pendant les parcours navigateur. Les vidéos locales sont réellement vérifiées.

Les validations locales initiales de la refonte et des six vidéos ont été obtenues le 12 novembre 2026. Elles autorisaient la publication de la branche et de la PR #4, puis une autorisation distincte du propriétaire a permis la fusion et la mise en ligne le 13 novembre 2026. Voir [la revue](revue-github.md) et [le bilan vidéo](videos-locales.md).

## Hébergement et ressources à préserver

- VPS Hostinger `82.112.240.219`, projet `/docker/lads-website`, partagé avec d'autres services.
- Nginx `lads-website` derrière Traefik, montage `site` en lecture seule dans le conteneur ; configuration versionnée dans `deploy/nginx.conf`.
- `public/google4b1cbe2c20a1fb09.html` : vérification Google Search Console à conserver.
- Tous les médias, les sous-titres et les fichiers racine de `dist/` font partie de la publication. Aucun téléchargement ou réencodage vidéo pendant le build.
- Les anciennes mentions légales citent encore OVH : incohérence éditoriale conservée hors du lot technique.

## Historique de la première mise en ligne

La refonte a été publiée le 13 novembre 2026 après fusion de la PR #4 (`fafa1ba`). Le site était auparavant un clone Git mis à jour manuellement, exposant aussi `.git/`. La refonte a remplacé cette structure par le seul export `dist/`, avec sauvegarde de l'ancien site, préproduction et contrôles des routes, vidéos, sous-titres, caches et fichiers cachés.

La méthode initiale renommait le dossier servi et redémarrait le conteneur pour rétablir son montage. **Elle est remplacée par les versions et le lien `current` du guide actuel.** Les sauvegardes historiques `/root/backups/lads-website-avant-astro-20261113.tgz` et `/docker/lads-website/site-html-20261113` sont préservées.
