# Livraison et retour arrière

## Présentation locale

1. Avec la version de Node indiquée dans `package.json`, lancer `npm ci`, `npm run check`, `npm run build` et `npm test`.
2. Lancer `npm run preview`, puis consulter <http://127.0.0.1:4321>.
3. Pour la suite navigateur, conserver ce serveur ouvert et lancer `npm run test:browser`. Windows utilise Chrome ou Edge installé ; ailleurs, installer Chromium avec `npx playwright install chromium`. Les tests simulent les services externes et ne transmettent aucune inscription.
4. Présenter l'accueil, une solution, une réalisation, les deux formations et les pages légales ; fournir le rapport de vérification. Traiter les retours en local.

**Attendre la validation explicite de l'utilisateur avant tout push ou PR.** Le suivi de cette phase reste local. La configuration GitHub Actions est préparée mais ne s'exécute sur GitHub qu'après publication autorisée de la branche.

## Publication ultérieure

La présente livraison n'autorise ni la fusion ni la mise en ligne. Une fois ces actions demandées, identifier le document root et le moyen d'accès au serveur : le README historique indique Hostinger, les mentions légales indiquent OVH et les réponses HTTP indiquent Nginx ; ces éléments ne suffisent pas à localiser l'hébergement.

Avant le remplacement, sauvegarder les fichiers réellement publiés, leurs droits et la configuration de résolution des routes. Construire le commit approuvé avec `npm ci` et `npm run build`, puis préparer une copie de `dist/` dans un emplacement de préproduction. Vérifier les chemins sans extension, `.html`, les ressources `/_astro/`, la 404 et les redirections anciennes avant la bascule.

Publier uniquement `dist/`, avec ses sous-dossiers et ses fichiers racine. Le serveur de prévisualisation Node et les sources Astro ne sont pas nécessaires en production. Préserver la configuration serveur existante, les droits et les éventuels fichiers d'exploitation absents du dépôt. Ne pas utiliser de synchronisation destructive qui supprimerait des fichiers inconnus du serveur.

Après bascule, contrôler les pages principales, les deux formations, les liens EVA, la vidéo, Wisio, les pages légales, le sitemap et les codes HTTP. En cas de régression, restaurer la sauvegarde complète de la version précédente avec la configuration et les droits d'origine, puis vérifier de nouveau les routes publiques. Conserver la sauvegarde jusqu'à validation de la publication.
