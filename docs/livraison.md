# Livraison et retour arrière

## Présentation locale

1. Avec la version de Node indiquée dans `package.json`, lancer `npm ci`, `npm run check`, `npm run build` et `npm test`.
2. Lancer `npm run preview`, puis consulter <http://127.0.0.1:4321>.
3. Pour la suite navigateur, conserver ce serveur ouvert et lancer `npm run test:browser`. Windows utilise Chrome ou Edge installé ; ailleurs, installer Chromium avec `npx playwright install chromium`. Les tests simulent les services externes et ne transmettent aucune inscription.
4. Présenter l'accueil, une solution, une réalisation, les deux formations et les pages légales ; fournir le rapport de vérification. Traiter les retours en local.

**Validation locale obtenue le 12 novembre 2026.** L’utilisateur autorise la publication de la branche `feat/refonte-astro-lumos` et d’une seule PR vers `main`, en brouillon pendant les contrôles GitHub puis prête à relire lorsqu’ils réussissent. Voir [le dossier de revue](revue-github.md). Cette autorisation exclut la fusion et la mise en ligne. Le workflow vérifie le site et conserve les preuves ; il ne déploie rien.

## Complément vidéo en attente

Les six vidéos Vimeo ont été préparées et intégrées en local. La PR #4 est en brouillon, sans nouveau push. La validation locale précédente ne couvre pas ce complément ; voir [le bilan vidéo](videos-locales.md). Lors de la livraison ultérieure, conserver tout `dist/videos/` et vérifier MP4/WebVTT, lecture et requêtes HTTP 206 sur Hostinger. Aucun téléchargement ni réencodage pendant le build.

## Publication ultérieure

La présente livraison n'autorise ni la fusion ni la mise en ligne. Hostinger est confirmé par le propriétaire. Avant une future livraison, identifier le document root, le moyen d'accès et une éventuelle automatisation extérieure liée à GitHub ; ces paramètres ne sont pas établis par le dépôt. Les anciennes mentions légales citent encore OVH : incohérence éditoriale conservée hors de ce lot.

Avant le remplacement, sauvegarder les fichiers réellement publiés, leurs droits et la configuration de résolution des routes. Construire le commit approuvé avec `npm ci` et `npm run build`, puis préparer une copie de `dist/` dans un emplacement de préproduction. Vérifier les chemins sans extension, `.html`, les ressources `/_astro/`, la 404 et les redirections anciennes avant la bascule.

Publier uniquement `dist/`, avec ses sous-dossiers et ses fichiers racine. Le serveur de prévisualisation Node et les sources Astro ne sont pas nécessaires en production. Préserver la configuration serveur existante, les droits et les éventuels fichiers d'exploitation absents du dépôt. Ne pas utiliser de synchronisation destructive qui supprimerait des fichiers inconnus du serveur.

Après bascule, contrôler les pages principales, les deux formations, les liens EVA, la vidéo, Wisio, les pages légales, le sitemap et les codes HTTP. En cas de régression, restaurer la sauvegarde complète de la version précédente avec la configuration et les droits d'origine, puis vérifier de nouveau les routes publiques. Conserver la sauvegarde jusqu'à validation de la publication.
