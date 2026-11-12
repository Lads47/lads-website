# Corrections de l’audit Impeccable — 12 novembre 2026

Les dix recommandations ont été autorisées par l’utilisateur après la présentation de l’audit. Cette livraison reste locale : aucun push, aucune PR et aucun déploiement.

## Changements visibles

| Point audité | Correction |
| --- | --- |
| Contrastes | Accents textuels sur fond clair via `--heading-accent`, liens via `--link-text`, texte marine sur les boutons orange, texte secondaire renforcé sur fond gris |
| Logo IA absent | Cadre de logo de même hauteur dans les deux formations, image avec une largeur et une hauteur rendues non nulles |
| Accès aux sessions | Accès depuis le bandeau des deux formations ; résumé pratique en premier sur mobile ; inscription principale, contact secondaire, réclamation en lien |
| Accueil sans action | Boutons « Nos solutions » et « Nous contacter » sous le titre |
| Cartes trop denses | Titres h4 visuels, interligne Lumos large, alignement à gauche dans le portfolio, texte principal de 16 px, résumés complets et actions alignées en bas |
| Catalogue formations | Deux colonnes sur bureau/tablette, une sur mobile |
| Ergonomie mobile | Header compact calculé depuis l’échelle d’espacement ; zones tactiles des boutons icônes et réseaux sociaux d’au moins 44 px |
| Retour en haut invisible | État masqué retiré du focus et de l’arbre d’accessibilité avec `inert` et `visibility` |
| Titres HTML | Niveaux consécutifs sans modifier les variantes visuelles ; un h1 par page |
| Médias | Photos responsive, originaux conservés pour les lightboxes, vidéo mobile complète de 2,49 Mo, poster local et absence de téléchargement vidéo imposé en mouvement réduit |

Les huit extensions de marque restent celles documentées dans `lumos.md`. Aucun nouveau token global n’a été créé. Les rôles natifs de Lumos possèdent les réglages de couleur, de typographie et d’espacement.

## Conservation des contenus

Les métadonnées, données structurées, canoniques, images sources et anciennes routes restent strictement vérifiées contre les fixtures historiques. Les contrats de texte historiques restent actifs sur les autres pages. Pour l’accueil et les deux fiches formations, `approved-local-refinements.json` conserve l’empreinte de chaque fragment textuel de la version précédant cet audit, avec comparaison du multiensemble de fragments : seul leur ordre peut changer. Les trois groupes de nouvelles commandes sont explicitement contrôlés séparément. Aucun texte métier n’a été réécrit ou retiré.

Les anomalies éditoriales du rapport de vérification restent conservées, notamment les écarts CECA/Ekivia, les nombres de caméras, les coordonnées de formation et les dates de repli EVA. Les métadonnées Open Graph historiques n’ont pas été modifiées.

## Contrôles

- Installation propre via `npm ci --ignore-scripts` : 271 paquets, aucune vulnérabilité signalée par npm.
- Contrôle Astro/TypeScript : 123 fichiers, aucune erreur, aucun avertissement, aucun hint.
- Build statique : 40 routes.
- Contrôle de contenu et de liens : 40 routes, 1 145 références locales ; métadonnées, données structurées, ancres, textes, images et candidats responsive conservés ou vérifiés.
- Contrôle des styles : 5 763 déclarations ; noms de variables et rôles Lumos conformes au contrat du projet.
- Comparaison avant/après : 70 captures des 35 pages, à 1 440 et 390 px ; contrôle des images rendues et des débordements. Cinq gabarits supplémentaires vérifiés sur tablette.
- Interactions : menu et clavier, trois lightboxes avec retour du focus, vidéo locale et pause/reprise, opposition EVA persistante, huit scénarios EVA, anciennes redirections et vraie réponse 404.
- Vérifications ciblées aux largeurs 320, 390, 768, 1 200 et 1 440 px : contrastes calculés, logos visibles, actions dans le premier écran, ancre des sessions sous le header, zones tactiles, état masqué, images et sélection vidéo.

Les mesures de contraste observées sont notamment 5,89:1 pour la navigation active, 5,67:1 pour le texte du bouton orange, 14,42:1 pour le contact secondaire et 5,45:1 pour l’étiquette de formation. Elles concernent les échantillons calculés ; elles ne constituent pas une certification WCAG du site entier.

La hauteur des pages augmente lorsque le texte des cartes devient plus grand et complet. Le catalogue réalisations passe ainsi de 3 838 à 4 271 px sur bureau et de 7 649 à 8 910 px sur mobile. L’accueil reste proche de la hauteur précédente : 7 944 à 7 955 px sur bureau et 12 095 à 12 153 px sur mobile. Le rendu peut être comparé avec les captures `test-results/*-source.png` et leurs versions actuelles.

Le détecteur Impeccable remonte les mêmes six alertes que l’audit initial : quatre messages de diagnostic du composant `Img`, l’image de lightbox remplie à l’ouverture et Open Sans. Ce sont des exceptions vérifiées : aucun de ces messages ne correspond à une image cassée ; Open Sans est une police de l’identité à conserver.

Les tests utilisent Chrome/Chromium et des viewports simulés. Les réponses EVA sont simulées et aucune inscription n’est transmise. Les lectures externes réelles, Safari/iOS, Android physique, les lecteurs d’écran et les Core Web Vitals de production n’ont pas été certifiés par ces contrôles.

Prévisualisation construite : <http://127.0.0.1:4321/>. La validation locale de l’utilisateur reste attendue avant toute opération GitHub.

12 novembre 2026 — Ajustement visuel demandé après l’audit : les liens actifs et survolés du menu utilisent le bleu clair de marque --brand-500 (#7dcef5), sans soulignement, y compris sur le fond blanc des pages internes. Ce bleu présente un contraste d’environ 1,75:1 sur blanc et n’atteint pas le seuil de 4,5:1 des textes. Cette limite est conservée et mesurée dans le rapport : les assertions de navigation vérifient la couleur exacte demandée et l’absence de soulignement ; les assertions de contraste des contenus et boutons restent à 4,5:1. L’attribut aria-current et les indicateurs de focus sont conservés. Cet ajustement ne constitue donc pas une conformité AA de ces états du menu.
