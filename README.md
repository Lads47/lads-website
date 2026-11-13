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

Les six anciens lecteurs Vimeo sont remplacés par des vidéos natives Lumos en 1080p/720p, avec sous-titres et vignettes : voir [le bilan et les poids](docs/videos-locales.md). Ce complément a été validé localement le 12 novembre 2026 puis publié avec la PR #4.

La vidéo d'accueil est incluse dans `public/videos/` et servie par le site, sans appel à Amazon S3. Le serveur de prévisualisation prend en charge son type MP4 et les requêtes partielles.

## Validation et livraison

**En ligne depuis le 13 novembre 2026** sur lesateliersdustream.fr (PR #4 fusionnée). **Le déploiement automatique est actif et sa première publication a été vérifiée le même jour** : fusionner une PR dans `main` déclenche les contrôles puis la publication du `dist/` vérifié par GitHub Actions sur le VPS Hostinger. Préproduction isolée, sauvegarde, bascule atomique et retour arrière : lire [le guide de déploiement](docs/deploiement-hostinger.md) avant toute fusion ou intervention sur la production. L'état d'installation et les preuves sont dans [le suivi](docs/suivi-refonte.md). Le [dossier de revue GitHub](docs/revue-github.md) présente la refonte, les captures et les limites.

Tous les textes sont conservés selon le choix de l'utilisateur. Les contradictions éditoriales et les limites d'intégrations externes sont signalées dans le rapport, sans correction éditoriale automatique.

Source historique : `Lads47/lads-website`, commit `a4a264380f80e3570bcb3d01a6776bb582439527`. Les anciens fichiers restent disponibles dans l'historique Git.
