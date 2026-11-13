# Vérification de la refonte locale — 12 novembre 2026

Ce rapport conserve les mesures historiques de la reprise native Lumos. La version locale a depuis été validée et sa proposition sur GitHub autorisée le 12 novembre 2026. Le [dossier de revue actuel](revue-github.md) rassemble les derniers résultats, captures et limites ; ses compteurs remplacent ceux de cette passe.

## Version présentée

- Adresse : <http://127.0.0.1:4321>.
- Branche locale : `feat/refonte-astro-lumos`.
- La référence visuelle de cette passe est le build local de la branche avant simplification (HEAD `a049c8c`).
- Source historique : `a4a264380f80e3570bcb3d01a6776bb582439527` de `Lads47/lads-website`. Lors du contrôle du 11 novembre, le pointeur GitHub `main` a été revérifié inchangé ; les 40 HTML publiés correspondent à la référence après normalisation des seules fins de ligne. Aucune modification publiée absente de cette source n'a été détectée dans ces HTML.
- Astro **7.4.7**, Lumos for Astro **1.0.3**, dépendances exactes et lockfile vérifiés par une installation propre `npm ci`.
- Reprise native Lumos : suppression du reset de neutralisation, migration des composants, noms de couleurs corrigés et valeurs visuelles déplacées dans les tokens. Voir `docs/lumos.md`.
- **État lors de cette passe historique : aucun push, aucune PR, aucune fusion, aucune mise en ligne.** La validation locale a été obtenue ultérieurement ; la fusion et la mise en ligne restent exclues de la proposition GitHub.

## Contrôles réussis

| Contrôle | Résultat |
| --- | --- |
| Astro / TypeScript | 122 fichiers, aucune erreur, aucun avertissement ni hint |
| Build statique | 40 fichiers HTML : 34 pages de contenu, 5 anciennes routes, 404 |
| Contenus | Empreintes des textes identiques pour les 40 pages après normalisation des espaces et entités HTML |
| Référencement | Titres, descriptions, canoniques et autres métadonnées conservés ; JSON-LD de la formation IA identique ; sitemap contenant les 34 pages |
| Ressources et navigation | Images et textes alternatifs conservés ; 1 234 références locales et leurs ancres contrôlées ; aucun identifiant HTML dupliqué |
| Comparaisons visuelles | 35 pages × bureau 1440 px et mobile 390 px ; aucun débordement horizontal ni image cassée |
| Résultat des comparaisons | Tailles et espacements adaptés aux composants natifs Lumos ; compositions, textes, photos et identité conservés. Les captures ne sont plus revendiquées identiques au pixel |
| Tablette | Accueil, catalogue solutions, réalisation, formation IA et mentions légales contrôlés à 768 px |
| Menu | Ouverture, navigation clavier, Échap, retour du focus et lien actif |
| Photos | Accueil, réalisation et solution : ouverture par souris/clavier, fermeture par bouton/Échap/clic extérieur et retour du focus |
| EVA | 8 scénarios : les deux formations avec sessions disponibles, aucune session, panne réseau et résultats publics ; paramètres de retour et événements d'inscription conservés |
| Opposition aux statistiques | Choix `evaStat_off` mémorisé après rechargement et réactivation testée |
| Vidéo locale | Chargement réel du MP4 local, lecture, pause et reprise ; vidéo en pause avec réduction des animations |
| Sans JavaScript | Navigation et contenu accessibles sur mobile |
| Anciennes URL | 5 destinations de redirection conservées, vraie réponse 404 pour une page inexistante |
| Lumos et tokens actifs | 89 sections, 64 grilles et 65 cartes dans les sources de contenu ; 5 327 déclarations CSS contrôlées, y compris les styles inline ; le test navigateur confirme qu'un changement des tokens de couleur et d'espacement modifie les composants |
| Photos de fond | 36 références d'origine vérifiées, désormais rendues par des composants `Img` Lumos |

Les captures automatisées fixent les réponses EVA et neutralisent visuellement les zones vidéo/iframe pour obtenir des comparaisons reproductibles. Les images différées sont chargées avant capture et les animations sont figées. Les résultats ne constituent donc pas un visionnage exhaustif des vidéos Vimeo/YouTube ni un contrôle du rendu dynamique de Wisio. Leurs intégrations d'origine sont conservées ; aucune inscription ni réclamation réelle n'a été transmise.

Les rapports et captures détaillés sont conservés localement dans `test-results/`. `npm test` vérifie le contenu de `dist/` ; `npm run test:browser` vérifie la prévisualisation ouverte. `COMPARE_SOURCE_URL=http://127.0.0.1:4320` active la comparaison avec la référence locale historique, si ce serveur temporaire est démarré.

Le rapport navigateur contient les 70 comparaisons avec le build local précédent et aucune erreur JavaScript. Les 892 liens rendus conservent leurs destinations dans le même ordre. Les données des formations ont été simulées.

## Échelle Lumos et écarts de rendu

Les 245 déclarations de l’ancienne feuille de primitives ont été revues et la feuille a été supprimée. Les huit extensions globales du thème et leurs usages sont documentés dans [le contrat Lumos](lumos.md). Le contrôle de nommage a été éprouvé avec une déclaration temporaire de `--size-0-01875rem` et avec des déclarations structurelles valides.

Les titres de cartes utilisent directement les variantes de titre du starter. Les légendes, les étiquettes et les métadonnées adoptent le petit texte fluide. L’interlettrage des légendes suit le réglage normal du thème. Les chiffres de l’accueil et le numéro 404 suivent désormais la taille d’affichage fluide. Les ombres des surfaces sont communes et les fiches formation regroupent leurs métadonnées plus étroitement sur mobile.

Variation de la hauteur totale des quatre pages repères par rapport à la version locale précédente. Une valeur positive indique une page plus longue.

| Page | Bureau (1 440 px) | Mobile (390 px) |
| --- | ---: | ---: |
| Accueil | 16 px | -57 px |
| Solutions | 18 px | 6 px |
| Réalisations | -57 px | -143 px |
| Formation IA | 43 px | -213 px |

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
- Bordures d'iframes et espaces HTML conservés ; tous les titres et paragraphes utilisent désormais les styles Lumos actifs.
- Réservation de l'espace des images de cartes par ratio ; icônes des formations et cadrages des photos préservés.
- Plus de CSS visuel injecté par les scripts EVA : styles externalisés et tokens partagés. Les mots-clés CSS structurels, définitions de tokens, paramètres de composants et données SVG restent natifs.
- L'image CSS vMix absente du dépôt et du site publié n'est plus demandée inutilement ; le même fond uni reste affiché.

## Textes et incohérences conservés

Le choix explicite est de conserver **tous les textes**, sans harmonisation éditoriale. Les points suivants restent donc présents :

- CECA 2024 dans le catalogue et Ekivia 2025 dans d'autres présentations de la même réalisation ; l'URL historique CECA reste en place.
- Captation légère annoncée à 2–3 caméras sur l'accueil et 3–4 dans certaines fiches.
- Compteur fixe de 27 ans malgré l'historique commençant en 1998. L’année du copyright est désormais dynamique, à la demande de l’utilisateur.
- Numéro de production dans le contact du catalogue formations, distinct du numéro formation présent dans les fiches détaillées.
- Dates statiques de repli IA dont certaines sont passées : elles restent visibles en cas de panne EVA, comme dans la source.
- Mention d'Amazon Web Services dans la politique de confidentialité, désormais obsolète depuis le rapatriement de la vidéo. Ce texte n'a pas été modifié, conformément à la consigne de conservation.
- Divergences des textes légaux sur la collecte et liste des services tiers incomplète. Cette migration n'a pas réécrit les déclarations de confidentialité ni audité le traitement interne d'EVA Stat.
- Image `photo/vmix.jpg` déjà absente du dépôt et de la publication : sa référence Open Graph reste inchangée dans les métadonnées.
- Hébergement exact et procédure d'accès non déterminés : indications historiques Hostinger/OVH contradictoires. Aucun accès serveur n'est nécessaire pour la revue locale.

La procédure de remplacement et de retour arrière est préparée dans `docs/livraison.md`. La configuration GitHub Actions est uniquement locale et ne contient aucun déploiement automatique.

## Ajustements autorisés après l’audit Impeccable

Les améliorations de contraste, de typographie, de composition, d’accès aux sessions et de médias sont détaillées dans [audit-impeccable.md](audit-impeccable.md). Ce compte rendu plus récent complète les mesures historiques ci-dessus : 1 145 références locales, nouveaux contrôles des titres HTML et des images rendues, texte préservé malgré les déplacements explicitement autorisés. La version précédente est conservée localement pour les captures avant/après. La validation locale avant GitHub reste obligatoire.
