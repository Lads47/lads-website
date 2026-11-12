# Suivi de la refonte locale

Mandat validé le 11 novembre 2026 : migration fidèle Astro et Lumos, prestations prioritaires, contenus gérés par les agents, tous les textes conservés. Présentation et validation locales avant tout push ou PR. Aucune mise en ligne dans ce lot.

| Lot | État | Validation attendue |
| --- | --- | --- |
| Socle Astro et Lumos 1.0.3 | Terminé | Installation propre, check et build réussis |
| Reprise avec composants Lumos actifs | Terminé | Sections, grilles, cartes, typographie, médias et éléments communs natifs ; reset de neutralisation supprimé |
| Tokens et noms des couleurs | Terminé | Échelle Lumos par rôle, 245 primitives retirées, huit extensions globales documentées dans `docs/lumos.md` |
| Accueil et éléments partagés | Terminé | Rendu comparé, navigation et lightbox testées |
| Solutions et réalisations | Terminé | Pages, médias et liens préservés |
| Formations | Terminé | 8 scénarios EVA ; débordement mobile réparé |
| Pages légales, anciennes routes et 404 | Terminé | Textes conservés, destinations et 404 contrôlées |
| Vidéo d'accueil rapatriée | Terminé | MP4 local de 9,8 Mo ; lecture, pause/reprise et HTTP 206 vérifiés |
| Vérification et présentation locales | Prêt pour revue | 70 rendus mobile/bureau et 5 gabarits tablette ; http://127.0.0.1:4321 |
| Validation utilisateur | En attente | Aucun push ni PR avant validation locale explicite |

Source de référence : `Lads47/lads-website`, commit `a4a264380f80e3570bcb3d01a6776bb582439527`. `main` distant revérifié inchangé après la reprise native Lumos ; les 40 HTML publiés correspondent toujours à cette source après normalisation des fins de ligne.

Preuves et limites : `docs/rapport-verification.md`. Publication et retour arrière : `docs/livraison.md`. La mise en ligne reste hors de cette livraison.

12 novembre 2026 — Le header passe au blanc avec un fondu de 200 ms utilisant les variables de transition Lumos. Les deux versions du logo se fondent progressivement. Vérification locale du défilement aller/retour, de la stabilité du logo, du mode de réduction des animations et du menu mobile. Check Astro, build et contrôles statiques réussis.

12 novembre 2026 — Les deux photos de régies dans le bloc « Les Ateliers du Stream » remplissent les cartes cover Lumos au ratio 3:4, avec les légendes superposées sur un dégradé inférieur. Les quatre bords des images et l’ouverture depuis les légendes sont vérifiés à 1 440 et 390 px. Check Astro, build, contrôle des 40 routes et interactions de l’accueil réussis.

12 novembre 2026 — Les icônes Email, Téléphone et Localisation du contact sont intégrées en SVG inline par le composant Icon de Lumos. Leurs tracés d’origine et libellés accessibles sont conservés. La couleur suit currentColor et la règle .icon-brand dans src/styles/site.css. Vérification de la recoloration via --brand-500 sur l’accueil et la formation IA à 1 440 et 390 px, puis des interactions du site. Check Astro, build et contrôle des 40 routes réussis.

12 novembre 2026 — Défilement doux activé sur html avec scroll-behavior: smooth. Les ancres et le bouton de retour en haut suivent ce réglage CSS. La préférence de réduction des animations active le défilement immédiat. Vérification du défilement progressif avec et sans JavaScript, de l’arrivée sous le header et du retour en haut. Check Astro, build et contrôles des 40 routes réussis.

12 novembre 2026 — Les trois adresses de « Nos bureaux » sont regroupées dans un seul bloc de petit texte Lumos. L’écart entre les lignes passe d’environ 34 à 22 px sur bureau. Vérification du rendu à 1 440 et 390 px, des couleurs et de la conservation des textes sur les 40 routes. Check Astro et build réussis.

12 novembre 2026 — Année du copyright calculée à la construction puis actualisée dans le navigateur à chaque chargement. Les 34 pieds de page affichent l’année courante. Les années 2027 et 2030 ont été simulées sur le même build pour vérifier la mise à jour, avec vérification du contenu disponible sans JavaScript. Check Astro, build et contrôles statiques réussis.
