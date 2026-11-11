# Vérification de la refonte locale — 11 novembre 2026

## Version présentée

- Adresse : <http://127.0.0.1:4321>.
- Branche locale : `feat/refonte-astro-lumos`.
- Source historique : `a4a264380f80e3570bcb3d01a6776bb582439527` de `Lads47/lads-website`, inchangée au démarrage de l'implémentation.
- Astro **7.4.7**, Lumos for Astro **1.0.3**, dépendances exactes et lockfile vérifiés par une installation propre `npm ci`.
- **Aucun push, aucune PR, aucune fusion, aucune mise en ligne.** La version locale attend la validation de l'utilisateur.

## Contrôles réussis

| Contrôle | Résultat |
| --- | --- |
| Astro / TypeScript | 123 fichiers, aucune erreur, aucun avertissement ni hint |
| Build statique | 40 fichiers HTML : 34 pages de contenu, 5 anciennes routes, 404 |
| Contenus | Empreintes des textes identiques pour les 40 pages après normalisation des espaces et entités HTML |
| Référencement | Titres, descriptions, canoniques et autres métadonnées conservés ; JSON-LD de la formation IA identique ; sitemap contenant les 34 pages |
| Ressources et navigation | Images et textes alternatifs conservés ; 1 256 références locales et leurs ancres contrôlées ; aucun identifiant HTML dupliqué |
| Comparaisons visuelles | 35 pages × bureau 1440 px et mobile 390 px ; aucun débordement horizontal ni image cassée |
| Résultat des comparaisons | 68 paires de captures identiques selon le comparateur ; les 2 autres correspondent aux formations mobiles dont le débordement est corrigé |
| Tablette | Accueil, catalogue solutions, réalisation, formation IA et mentions légales contrôlés à 768 px |
| Menu | Ouverture, navigation clavier, Échap, retour du focus et lien actif |
| Photos | Accueil, réalisation et solution : ouverture par souris/clavier, fermeture par bouton/Échap/clic extérieur et retour du focus |
| EVA | 8 scénarios : les deux formations avec sessions disponibles, aucune session, panne réseau et résultats publics ; paramètres de retour et événements d'inscription conservés |
| Opposition aux statistiques | Choix `evaStat_off` mémorisé après rechargement et réactivation testée |
| Vidéo locale | Chargement réel du MP4 local, lecture, pause et reprise ; vidéo en pause avec réduction des animations |
| Sans JavaScript | Navigation et contenu accessibles sur mobile |
| Anciennes URL | 5 destinations de redirection conservées, vraie réponse 404 pour une page inexistante |
| Sensibilité des tests | Une condition du menu a été inversée dans une copie isolée du build : le test a détecté la régression. La version présentée n'a pas été modifiée par cet essai |

Les captures automatisées fixent les réponses EVA et neutralisent visuellement les zones vidéo/iframe pour obtenir des comparaisons reproductibles. Les images différées sont chargées avant capture et les animations sont figées. Les résultats ne constituent donc pas un visionnage exhaustif des vidéos Vimeo/YouTube ni un contrôle du rendu dynamique de Wisio. Leurs intégrations d'origine sont conservées ; aucune inscription ni réclamation réelle n'a été transmise.

Les rapports et captures détaillés sont conservés localement dans `test-results/`. `npm test` vérifie le contenu de `dist/` ; `npm run test:browser` vérifie la prévisualisation ouverte. `COMPARE_SOURCE_URL=http://127.0.0.1:4320` active la comparaison avec la référence locale historique, si ce serveur temporaire est démarré.

## Vidéo rapatriée

La demande complémentaire de l'utilisateur est réalisée : `public/videos/demo-ateliers-du-stream.mp4` remplace l'URL S3 de l'accueil. Le site construit ne charge plus aucune source média sur `amazonaws.com`.

- Taille : **9 820 625 octets** (environ 9,8 Mo), vidéo d'origine sans réencodage.
- SHA-256 : `4ec18ae586b4f202e5c56d8c7245cd9d4208bfedafa096fde57cdc2901893676`.
- Serveur local : MIME `video/mp4`, prise en charge des requêtes partielles ; essai `bytes=0-15` reçu en HTTP 206 avec les 16 octets attendus.
- Le dossier `videos/` de l'export devra être transféré avec le reste de `dist/` lors d'une publication ultérieure.

## Réparations effectuées

- Navigation et pied de page rendus directement en HTML, avec état accessible du menu et contenu disponible sans JavaScript.
- Lien « Nous contacter » des pages légales dirigé vers le contact de l'accueil.
- Script tronqué de l'accueil remplacé par un dialogue photo partagé et accessible.
- Affichage des contenus indépendant du déclenchement des animations de défilement.
- Retour à la ligne du message EVA sans session : le site source débordait jusqu'à 403 px dans une fenêtre de 390 px ; les deux formations restent désormais dans la fenêtre.
- Bordures d'iframes et espaces HTML conservés pour retrouver le rendu source.
- L'image CSS vMix absente du dépôt et du site publié n'est plus demandée inutilement ; le même fond uni reste affiché.

## Textes et incohérences conservés

Le choix explicite est de conserver **tous les textes**, sans harmonisation éditoriale. Les points suivants restent donc présents :

- CECA 2024 dans le catalogue et Ekivia 2025 dans d'autres présentations de la même réalisation ; l'URL historique CECA reste en place.
- Captation légère annoncée à 2–3 caméras sur l'accueil et 3–4 dans certaines fiches.
- Compteur fixe de 27 ans malgré l'historique commençant en 1998 ; copyright du pied de page toujours daté de 2025.
- Numéro de production dans le contact du catalogue formations, distinct du numéro formation présent dans les fiches détaillées.
- Dates statiques de repli IA dont certaines sont passées : elles restent visibles en cas de panne EVA, comme dans la source.
- Mention d'Amazon Web Services dans la politique de confidentialité, désormais obsolète depuis le rapatriement de la vidéo. Ce texte n'a pas été modifié, conformément à la consigne de conservation.
- Divergences des textes légaux sur la collecte et liste des services tiers incomplète. Cette migration n'a pas réécrit les déclarations de confidentialité ni audité le traitement interne d'EVA Stat.
- Image `photo/vmix.jpg` déjà absente du dépôt et de la publication : sa référence Open Graph reste inchangée dans les métadonnées.
- Hébergement exact et procédure d'accès non déterminés : indications historiques Hostinger/OVH contradictoires. Aucun accès serveur n'est nécessaire pour la revue locale.

La procédure de remplacement et de retour arrière est préparée dans `docs/livraison.md`. La configuration GitHub Actions est uniquement locale et ne contient aucun déploiement automatique.
