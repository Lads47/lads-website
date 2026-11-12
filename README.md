# Les Ateliers du Stream — Astro et Lumos

Migration fidèle du site vitrine vers Astro et Lumos for Astro 1.0.3. Les prestations audiovisuelles restent prioritaires ; les formations, leurs informations et leurs intégrations EVA sont conservées. Aucun CMS ni formulaire local n'est ajouté.

## Démarrage local

```powershell
npm ci
npm run check
npm run build
npm test
npm run preview
```

Prévisualisation du site construit : <http://127.0.0.1:4321>. Les routes sans extension sont résolues vers les fichiers HTML comme sur le serveur actuel. Pour modifier les composants avec rechargement automatique : `npm run dev`.

Dans un second terminal, avec la prévisualisation ouverte : `npm run test:browser`. La suite contrôle les rendus mobile/bureau, les principaux gabarits tablette, le menu, les lightboxes, les redirections, l'opposition EVA et les états des formations. Elle simule les services externes ; les vidéos et iframes sont neutralisées dans les captures de comparaison. Les rapports et captures sont dans `test-results/`, ignoré par Git. Définir `BROWSER_PATH` pour utiliser un navigateur spécifique ; hors Windows, installer Chromium avec `npx playwright install chromium`.

## Organisation

- `src/pages/` : les 40 routes et leurs métadonnées originales ; `src/components/content/` : leurs contenus et styles, avec un bloc contact partagé.
- `src/components/global/` : navigation et pied de page Lumos ; `src/components/site/` : dialogue photo et métadonnées de formation partagées.
- `src/styles/` : tokens Lumos, identité visuelle et conditions responsive centralisées.
- `public/` : médias, polices, PDF, scripts EVA, données structurées, robots et sitemap conservés.
- `tests/fixtures/` : inventaire des routes, empreintes des textes et métadonnées de référence.
- `scripts/` : prévisualisation compatible avec les URL de production et contrôles statiques/navigateur.

Le site est construit en HTML statique dans `dist/`. Aucun serveur Node n'est nécessaire sur l'hébergement. Les composants Lumos utilisés et le contrat des tokens sont documentés dans `docs/lumos.md`. `npm test` vérifie aussi la réutilisation des rôles Lumos et le nommage des variables.

Les six anciens lecteurs Vimeo sont remplacés localement par des vidéos natives Lumos en 1080p/720p, avec sous-titres et vignettes. Ce complément attend sa validation locale avant tout nouveau push : voir [le bilan et les poids](docs/videos-locales.md). La PR #4 est en brouillon.

La vidéo d'accueil est incluse dans `public/videos/` et servie par le site, sans appel à Amazon S3. Le serveur de prévisualisation prend en charge son type MP4 et les requêtes partielles.

## Validation et livraison

**Version locale validée le 12 novembre 2026.** La publication de la branche et d’une PR vers `main` est autorisée ; la fusion et la mise en ligne restent des étapes séparées, non autorisées dans ce lot. Le nouveau complément vidéo attend une validation locale distincte. Le [dossier de revue GitHub](docs/revue-github.md) présente le résultat, les captures, les contrôles et les limites. La procédure de livraison et de retour arrière est dans [docs/livraison.md](docs/livraison.md).

Tous les textes sont conservés selon le choix de l'utilisateur. Les contradictions éditoriales et les limites d'intégrations externes sont signalées dans le rapport, sans correction éditoriale automatique.

Source historique : `Lads47/lads-website`, commit `a4a264380f80e3570bcb3d01a6776bb582439527`. Les anciens fichiers restent disponibles dans l'historique Git.
