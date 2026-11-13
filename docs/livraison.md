# Livraison et retour arrière

## Présentation locale

1. Avec la version de Node indiquée dans `package.json`, lancer `npm ci`, `npm run check`, `npm run build` et `npm test`.
2. Lancer `npm run preview`, puis consulter <http://127.0.0.1:4321>.
3. Pour la suite navigateur, conserver ce serveur ouvert et lancer `npm run test:browser`. Windows utilise Chrome ou Edge installé ; ailleurs, installer Chromium avec `npx playwright install chromium`. Les tests simulent les services externes et ne transmettent aucune inscription.
4. Présenter l'accueil, une solution, une réalisation, les deux formations et les pages légales ; fournir le rapport de vérification. Traiter les retours en local.

**Validation locale obtenue le 12 novembre 2026.** L’utilisateur autorise la publication de la branche `feat/refonte-astro-lumos` et d’une seule PR vers `main`, en brouillon pendant les contrôles GitHub puis prête à relire lorsqu’ils réussissent. Voir [le dossier de revue](revue-github.md). Cette autorisation exclut la fusion et la mise en ligne. Le workflow vérifie le site et conserve les preuves ; il ne déploie rien.

## Complément vidéo validé localement

Les six vidéos Vimeo ont été préparées, intégrées et validées localement le 12 novembre 2026. Le propriétaire autorise leur publication sur la même PR #4, maintenue en brouillon jusqu’à la réussite des contrôles GitHub ; voir [le bilan vidéo](videos-locales.md). Lors de la livraison ultérieure, conserver tout `dist/videos/` et vérifier MP4/WebVTT, lecture et requêtes HTTP 206 sur Hostinger. Aucun téléchargement ni réencodage pendant le build.

## Mise en ligne

**Refonte mise en ligne le 13 novembre 2026** (PR #4 fusionnée, commit `fafa1ba`), avec l'accord explicite du propriétaire.

### Hébergement réel

- VPS Hostinger `82.112.240.219` (accès `ssh root@…`), partagé avec d'autres services : **ne jamais y compiler**, on construit sur le poste.
- Conteneur `lads-website` (`nginx:alpine`) derrière Traefik, défini dans `/docker/lads-website/docker-compose.yml`.
- Fichiers servis : `/docker/lads-website/site` (monté en lecture seule). Configuration : `/docker/lads-website/nginx.conf`, copie versionnée dans [`deploy/nginx.conf`](../deploy/nginx.conf).
- Aucune automatisation GitHub → serveur : fusionner sur `main` ne change rien au site en ligne. Avant la refonte, le dossier servi était un clone Git mis à jour à la main par `git pull` (et exposait `.git/`) ; ce n'est plus le cas.
- `public/google4b1cbe2c20a1fb09.html` est la vérification Google Search Console : ne pas le supprimer.

### Procédure de publication

1. Sur le poste, depuis `main` à jour : `npm ci`, `npm run check`, `npm run build`, `npm test` ; CI verte sur le commit.
2. Envoyer `dist/` dans un dossier neuf, sans toucher au site servi :
   `tar -C dist -cf - . | ssh root@82.112.240.219 'mkdir -p /docker/lads-website/site-new && tar -C /docker/lads-website/site-new -xf -'`
   puis droits `755` (dossiers) / `644` (fichiers).
3. Sauvegarder l'existant : `tar -czf /root/backups/lads-website-AAAAMMJJ.tgz site nginx.conf docker-compose.yml`.
4. Préproduction sur le serveur : conteneur temporaire `nginx:alpine` publié sur `127.0.0.1:8099` avec `site-new` et la configuration, `nginx -t`, puis `curl -H Host:lesateliersdustream.fr` sur les routes, redirections, 404, `.vtt`, MP4 (206) et `/_astro/`.
5. Bascule : `mv site site-old-AAAAMMJJ && mv site-new site && docker restart lads-website` (le redémarrage est nécessaire : les montages suivent le dossier d'origine).
6. Contrôler en HTTPS les pages principales, les deux formations (sessions EVA), les vidéos, la 404, le sitemap ; garder `site-old-…` jusqu'à validation.

**Retour arrière** : `mv site site-casse && mv site-old-AAAAMMJJ site && docker restart lads-website` (et restaurer `nginx.conf.bak-…` si la configuration a changé). Sauvegarde complète de l'ancien site HTML : `/root/backups/lads-website-avant-astro-20261113.tgz` et dossier `/docker/lads-website/site-html-20261113`.

### Configuration nginx ajoutée lors de la refonte

Reprise de la configuration précédente (routes sans extension, redirections `.html` et anciennes URL, 404, caches) avec : type `text/vtt` pour les sous-titres (absent de `mime.types`), cache d'un an `immutable` pour `/_astro/`, AVIF dans le cache long, fichiers cachés (`/.git`, `/.env`…) en 404, gzip étendu à JSON/XML/VTT. L'ancienne configuration est conservée dans `nginx.conf.bak-20261113-avant-astro`.

Les anciennes mentions légales citent encore OVH alors que l'hébergeur est Hostinger : incohérence éditoriale conservée hors de ce lot.
