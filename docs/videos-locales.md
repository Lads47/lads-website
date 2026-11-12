# Six vidéos Vimeo remplacées en local

Complément du 12 novembre 2026, **en attente de validation locale avant tout nouveau push**. La PR #4 est remise en brouillon. Aucune fusion, publication du site ou modification des droits Vimeo.

## Fichiers et poids

La somme mesurée des six exports est **8 min 41,5 s** (521,47 s), et non les quelque 10 min 19 s estimées dans le plan. Les six identifiants attendus ont été récupérés ; le contrôle des nombres d’images confirme que les encodages ne raccourcissent pas les films.

Les six copies ont été obtenues par les liens officiels de téléchargement du compte propriétaire connecté. Ce sont les meilleurs exports proposés (1080p), pas les fichiers maîtres initialement téléversés. Les copies sources et les liens signés restent dans `.scratch/`, ignoré par Git et inaccessible depuis le serveur de prévisualisation. Aucun cookie n'a été exporté ou versionné.

| Vidéo | Export source (Mio) | Bureau 1080p (Mio) | Mobile 720p (Mio) |
| --- | ---: | ---: | ---: |
| Peer Gynt | 58,13 | 31,92 | 10,70 |
| Runik TCG | 22,15 | 14,32 | 4,46 |
| Multiplex Inovae | 53,37 | 29,31 | 10,94 |
| Cérémonie des docteurs Bordeaux | 62,52 | 40,26 | 16,47 |
| Histoire 2016 | 3,48 | 2,23 | 0,99 |
| Histoire 2018 | 41,01 | 22,92 | 9,04 |
| **Total** | **240,65** | **140,96** | **52,60** |

Les deux jeux représentent environ 193,6 Mio stockés, hors vignettes et sous-titres (moins de 0,5 Mio). Un visiteur lit la version sélectionnée, pas les deux. Gain par rapport aux exports : environ 41 % sur bureau et 78 % sur mobile. Aucun MP4 ne dépasse 90 Mio ; le plus gros fait 40,26 Mio.

## Préparation reproductible et provenance

`src/data/local-videos.json` contient pour chaque export et chaque MP4 : identifiant Vimeo, route, titre accessible, dimensions, durée, cadence, codecs, poids, SHA-256 et méthode de compression. Les vignettes et pistes possèdent aussi leurs empreintes. Il ne contient aucune URL signée ni donnée de session.

La commande manuelle `npm run videos:prepare` lit les six exports et leurs pistes dans `.scratch/video-sources/`. Définir `FFMPEG_PATH`, `FFPROBE_PATH` et éventuellement `VIDEO_SOURCE_DIR` si nécessaire. Elle ne télécharge rien et ne fait pas partie du build. Le script de téléchargement authentifié reste privé ; il ne constitue pas une dépendance de fabrication du site.

- MP4 H.264, `yuv420p`, AAC stéréo 128 kbit/s, index `moov` avant `mdat` (`faststart`).
- Bureau : preset `slow`, CRF 23, débit vidéo maximal 4 Mbit/s, tampon 8 Mbit.
- Mobile : preset `slow`, CRF 25, plafond 2 Mbit/s, tampon 4 Mbit.
- Aucune coupe, accélération, normalisation sonore, déformation ou interpolation. 50 images/s pour Peer Gynt, 25 images/s pour les cinq autres. Les nombres d'images et durées des flux vidéo sont identiques aux exports. La durée globale du conteneur diminue d'environ 42 ms après réencodage AAC ; la durée vidéo et son nombre d'images restent strictement identiques. Les comparaisons audio ne détectent aucun décalage.
- Toutes les sources sont en 1920 × 1080. Les versions mobiles sont en 1280 × 720. Aucun agrandissement. Les douze encodages obtenus sont plus légers que leur export de référence ; le repli par remuxage n'a pas été nécessaire.
- Six vignettes WebP extraites à 20 % de la durée. Six pistes françaises déjà disponibles, copiées en WebVTT sans réécriture, avec le libellé « Français (générés automatiquement) ». Leurs éventuelles erreurs de transcription restent celles de Vimeo.

`npm ci`, `npm run check`, `npm run build`, `npm test` et la CI consomment uniquement les fichiers préparés dans `public/videos/`. Aucun FFmpeg, compte Vimeo ou téléchargement supplémentaire n'est nécessaire pour construire le site.

## Intégration

`LocalVideo` configure le composant `Video` de Lumos : commandes natives, son disponible, `playsinline`, `preload="none"`, sans lecture automatique ni boucle, dimensions explicites, poster et pistes de sous-titres. Un slot a été ajouté au composant natif pour accueillir les pistes. L'indication progressive `loading="lazy"` concerne uniquement ces lecteurs sous la ligne de flottaison ; les navigateurs qui l'ignorent conservent `preload="none"`.

La condition existante `--mq-compact-max` (640 px) choisit la source mobile au chargement. Aucun script ne recharge le média au redimensionnement : la lecture en cours continue avec sa source initiale. Les lecteurs ne recadrent pas les images et conservent leurs cadres 16:9. Les commandes, le son, le plein écran et les sous-titres dépendent de l'interface native du navigateur.

Dans la frise, lancer une vidéo met l'autre en pause ; sans JavaScript, les deux lecteurs restent utilisables et cette amélioration seule disparaît. Les six iframes et l'unique SDK Vimeo sont retirés. Les vidéos YouTube, Wisio et celle d'accueil ne sont pas modifiées.

La politique de confidentialité change uniquement pour décrire ce nouvel hébergement local et les intégrations YouTube/Wisio restantes, avec sa date de mise à jour. Seule la fixture approuvée de cette page est ajoutée ; les textes métier, métadonnées, données structurées et fixtures historiques restent conservés.

## Vérifications

Le script manuel `scripts/verify-video-quality.mjs`, avec les mêmes variables FFmpeg, compare les exports privés et les douze fichiers préparés. Le décodage complet est effectué lors de la préparation ; le contrôle de qualité compare les nombres d'images, les durées vidéo/audio et 36 extraits audio (10 %, 50 %, 90 % de chaque version). La corrélation dépasse 0,90 et le meilleur alignement testé est à 0 ms. Cette vérification technique ne constitue pas une nouvelle transcription ni une expertise sonore.

`npm test` vérifie les empreintes, profils, proportions, cadence, durée, limite de poids, index de début de fichier, posters et WebVTT, en plus des 40 routes et des tokens Lumos. La suite navigateur comprend 18 parcours vidéo (six × trois largeurs), six lectures sans scripts, sélection mobile, maintien de la lecture au redimensionnement et pause mutuelle dans la frise. Elle vérifie le clavier, lecture/pause, recherche, audio effectivement décodé, volume, sous-titres chargés, fin, plein écran, MIME MP4, requêtes 206 et absence de requête Vimeo/CDN. Les services EVA restent simulés pour éviter toute inscription ou statistique de test.

Les rapports de cette exécution et les captures sont dans `test-results/` ; la CI les conservera en artefacts après la validation locale et le prochain push autorisé. Les captures représentatives sont jointes au dossier de revue local : [frise bureau](revue/videos-histoire-bureau.png) et [TCG mobile](revue/videos-tcg-mobile.png). Les différences visibles sont les commandes natives du navigateur et les nouvelles vignettes extraites des films ; les textes et les cadres restent conservés. Les essais mobile/tablette sont effectués par émulation de viewport dans Chrome Windows, sans certification sur un appareil iOS/Safari.

## Défaut Wisio distinct

L'ancienne intégration de `/solutions/chapitrage-automatique` demande `https://wisio.io/?yvc_embed=1&seance=408` et `https://wisio.io/?yvc_css=1`. Lors de la vérification, ces adresses renvoient HTTP 200 avec une page HTML du site Wisio, au lieu des ressources JavaScript/CSS attendues. Ce problème préexistant explique le dysfonctionnement du widget ; aucun septième lecteur Vimeo n'y a été identifié. Aucune réparation de Wisio ni modification des droits vidéo dans ce lot.

## Livraison ultérieure

Prévisualisation : <http://127.0.0.1:4321/histoire> et les quatre pages `/solutions/multiplex`, `/realisations/peer-gynt`, `/realisations/ceremonie-docteurs-bordeaux`, `/realisations/tcg`.

Attendre la validation explicite de ce complément. Ensuite seulement : pousser cette même branche, actualiser la PR #4, attendre les contrôles verts et la rendre prête à relire. La livraison Hostinger reste séparée : copier intégralement le `dist/` approuvé, dont `videos/`, vérifier les types MIME MP4/WebVTT et les réponses 206 sur le serveur réel, puis appliquer la procédure existante de sauvegarde/retour arrière. Aucune modification de l'hébergement n'a été faite pour ces essais locaux.

## Résultat de l’exécution locale du 12 novembre 2026

- Réinstallation verrouillée : `npm ci --no-audit --no-fund`, 272 paquets installés.
- Astro/TypeScript : 127 fichiers, zéro erreur, avertissement ou hint.
- Build statique : 40 routes. Contrôles statiques : textes métier et métadonnées conservés, modification de confidentialité approuvée, 1 206 liens locaux, 5 736 déclarations CSS et contrat Lumos vérifiés.
- Suite navigateur complète réussie : 70 rendus des 35 pages (390 et 1 440 px), cinq gabarits tablette, menu, photos, EVA, accueil et animations ; zéro erreur JavaScript relevée.
- Vidéos : 18 parcours à 390, 768 et 1 440 px, six lectures et pauses clavier sans scripts ; sélection mobile, redimensionnement dans les deux sens sans changement de source, sous-titres, plein écran, recherche, son décodé et fin de lecture. MIME MP4/WebVTT et HTTP 206 vérifiés, aucune iframe/requête Vimeo/CDN sur les pages migrées. Pause mutuelle testée dans les deux sens.
- Frise : huit étapes, sept largeurs et texte à 200 %, ratios et centrage conservés, 64 franchissements du fil ; 68 parcours du header inchangé.
- Détecteur Impeccable sur les composants modifiés : aucun constat retourné. Contrôle visuel des six vignettes, d’un lecteur mobile et des deux vidéos de la frise sur bureau.

Preuves conservées avec le dossier local : [24 parcours vidéo](revue/videos-navigation-report.json), [durées, images et 36 comparaisons audio](revue/videos-quality-report.json), [capture bureau](revue/videos-histoire-bureau.png), [capture mobile](revue/videos-tcg-mobile.png). Le rapport exhaustif `test-results/browser-report.json` et les 70 captures restent dans les artefacts régénérables.

Le test du mouvement réduit de l’accueil utilise désormais une page neuve, configurée avant navigation, pour ne pas compter une requête MP4 déjà engagée sur la page précédente. L’absence de téléchargement automatique reste exigée ; le comportement de l’accueil n’a pas été modifié. L’observation du repli sans scripts interroge l’état vidéo depuis Node, car le polling par `requestAnimationFrame` dans une page dont JavaScript est désactivé ne progresse pas. La lecture elle-même est déclenchée par la commande native, et la pause par le clavier.

**État de livraison : local uniquement, validation du propriétaire encore attendue.** PR #4 en brouillon ; aucun nouveau push et aucun déploiement. Les anciens problèmes Wisio, les incohérences éditoriales et le débordement du courriel à 200 % restent documentés hors de ce complément.
