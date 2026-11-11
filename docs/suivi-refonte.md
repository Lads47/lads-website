# Suivi de la refonte locale

Mandat validé le 11 novembre 2026 : migration fidèle Astro et Lumos, prestations prioritaires, contenus gérés par les agents, tous les textes conservés. Présentation et validation locales avant tout push ou PR. Aucune mise en ligne dans ce lot.

| Lot | État | Validation attendue |
| --- | --- | --- |
| Socle Astro et Lumos 1.0.3 | Terminé | Installation propre, check et build réussis |
| Reprise avec composants Lumos actifs | Terminé | Sections, grilles, cartes, typographie, médias et éléments communs natifs ; reset de neutralisation supprimé |
| Tokens et noms des couleurs | Terminé | Valeurs visuelles centralisées, aucun ancien préfixe, contrôle automatique et essai de modification des tokens |
| Accueil et éléments partagés | Terminé | Rendu comparé, navigation et lightbox testées |
| Solutions et réalisations | Terminé | Pages, médias et liens préservés |
| Formations | Terminé | 8 scénarios EVA ; débordement mobile réparé |
| Pages légales, anciennes routes et 404 | Terminé | Textes conservés, destinations et 404 contrôlées |
| Vidéo d'accueil rapatriée | Terminé | MP4 local de 9,8 Mo ; lecture, pause/reprise et HTTP 206 vérifiés |
| Vérification et présentation locales | Prêt pour revue | 70 rendus mobile/bureau et 5 gabarits tablette ; http://127.0.0.1:4321 |
| Validation utilisateur | En attente | Aucun push ni PR avant validation locale explicite |

Source de référence : `Lads47/lads-website`, commit `a4a264380f80e3570bcb3d01a6776bb582439527`. `main` distant revérifié inchangé après la reprise native Lumos ; les 40 HTML publiés correspondent toujours à cette source après normalisation des fins de ligne.

Preuves et limites : `docs/rapport-verification.md`. Publication et retour arrière : `docs/livraison.md`. La mise en ligne reste hors de cette livraison.
