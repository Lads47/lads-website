# Présentation locale de la frise « Notre histoire »

> **Complément vidéos validé localement le 12 novembre 2026.** Le propriétaire autorise sa publication sur la même PR #4, maintenue en brouillon pendant les contrôles GitHub puis prête à relire après leur réussite. Aucune fusion ni mise en ligne autorisée. Voir [le bilan des vidéos locales](videos-locales.md). Les résultats historiques ci-dessous concernent la première refonte.

12 novembre 2026. Prévisualisation du build statique : http://127.0.0.1:4321/histoire.
État de cette présentation : aucun push, PR ni déploiement. La version locale a ensuite été validée le 12 novembre 2026 et sa proposition sur GitHub autorisée ; voir [le dossier de revue actuel](revue-github.md). Aucune fusion ni mise en ligne n’est autorisée dans ce lot.

## Résultat

La liste continue conserve les huit années de 1998 à 2025, leurs huit titres h3, tous les paragraphes, six photos et deux vidéos, désormais locales dans le complément vidéo. Les années emploient le style h1 de Lumos sur des spans ; le hero garde l’unique h1 de la page. Le conteneur conserve son plafond de 1 300 px. Les encadrés, ombres et survols du texte ont été retirés.

Sur bureau, les trois colonnes sont année, texte et média, avec un rapport texte/média de 1 / 1,25. À la demande de présentation, les années et blocs de texte sont **centrés verticalement sur les médias pour les huit étapes**. Sur tablette, année et texte restent à gauche du média ; sur mobile, la lecture s’empile. L’interligne principal est de 1,5. Les photos, dont les montages d’archives, sont entières ; les lecteurs ont un cadre 16:9, y compris à 320 px. Le fil bleu clair reste à gauche et se termine au dernier repère.

Le module ScrollTrigger appartient uniquement à cette page. Le repère et son segment suivant se colorent au passage de l’année au milieu de la zone visible sous le header ; remonter restaure l’état précédent. Aucune entrée n’est masquée et le défilement reste natif. La restauration douce de Chrome exige un recalcul individuel des déclencheurs au chargement : un refresh global interrompait cette restauration. Les recalculs au redimensionnement restent automatiques. Sans scripts, les huit étapes et le fil statique sont présents. En mouvement réduit, les changements de couleur n’ont pas de transition.

Le hero, le menu et le contact sont conservés, ainsi que les URL, ancres et métadonnées. Les styles et tokens communs n’ont pas changé. Aucune extension de marque n’est ajoutée : la frise utilise les rôles Lumos et la couleur existante `--brand-500`. La seule propriété privée `--_timeline-marker-position` décrit la jonction géométrique du fil, sans introduire de palier de taille.

## Vérifications et preuves

- Astro/TypeScript : 125 fichiers contrôlés, aucune erreur, aucun avertissement.
- Export statique : 40 routes. Contrôle des textes, métadonnées, médias et 1 181 liens locaux avec les fixtures conservées ; aucune empreinte de contenu modifiée.
- `scripts/verify-history-timeline.mjs`, intégré à `npm run test:browser` : huit étapes à 320, 390, 768, 1 023, 1 024, 1 440 et 1 600 px, avec texte normal et à 200 %. Structure HTML, ordre, interligne, contraste ≥ 4,5:1, proportions, centrage desktop et absence de débordement de la frise vérifiés.
- 64 franchissements de seuil en descendant et remontant, répartis entre mouvement normal et réduit ; restauration au rechargement et changement de largeur vérifiés. Sans JavaScript : huit étapes visibles.
- Captures et examen visuel dans la prévisualisation réelle sur mobile, tablette et bureau. Le centrage des huit années et textes a aussi été mesuré dans le navigateur visible, avec moins de 0,01 px d’écart entre leurs centres et celui des médias.
- Détecteur Impeccable sur le composant et son module : aucune alerte.
- Régression finale complète : 70 rendus des 35 pages sur mobile et bureau, cinq gabarits tablette, 68 parcours de header, menu/clavier/Échap, ancres, lightboxes, vidéo MP4 locale, opposition aux statistiques et huit scénarios EVA simulés réussis. Aucune inscription transmise. Les cinq anciennes redirections et la réponse 404 sont vérifiées. Ces contrôles simulent les intégrations externes ; ils ne certifient pas la lecture Vimeo réelle.

Preuves locales régénérables : `test-results/history-timeline-report.json`, les quatorze captures `history-{largeur}-{100|200}.png`, `history-mobile-preview.png`, `history-tablet-preview.png`, `history-centered-desktop.png` et `history-centered-2024.png`. La suite générale écrit `test-results/browser-report.json`, `visual-report.json` et `navigation-report.json`.

## Diagnostic Vimeo initial, avant remplacement local

Le diagnostic ci-dessous décrit les anciens lecteurs. Ils sont désormais remplacés par des MP4 locaux avec leurs sous-titres ; voir [le bilan actuel](videos-locales.md).

### Observation historique

Les deux iframes affichent **« Sign in to Vimeo to watch this video »** dans la prévisualisation réelle. Les identifiants, URL, titres et permissions d’intégration sont inchangés. Une lecture publique de leur configuration renvoie HTTP 200 mais aucun fichier vidéo exploitable, aussi bien avec le référent du domaine publié qu’avec celui de localhost. Cela ne permet pas d’attribuer avec certitude la demande à un réglage de confidentialité, une restriction de contenu ou au contexte du lecteur. La lecture des vidéos n’est donc pas certifiée ; les proportions le sont. Aucun compte, cookie de connexion ou droit Vimeo n’a été modifié. Vidéos concernées : [2016](https://player.vimeo.com/video/1006969061) et [2018](https://player.vimeo.com/video/1013489106).

### Limite conservée hors du lot vidéo

À 200 % de texte sur les plus petits écrans, l’adresse électronique du contact/pied de page peut dépasser. Ce défaut préexistant est extérieur à la frise ; ces sections étaient explicitement hors du périmètre de modification. La frise ne déborde à aucune des largeurs testées. Les incohérences éditoriales déjà listées dans `rapport-verification.md` sont conservées.

## Validation du complément vidéo local

Les deux lecteurs natifs conservent les cadres 16:9 et le centrage vertical des huit étapes. Les contrôles des sept largeurs/texte à 200 %, de la progression et des médias ont été rejoués avec succès. La lecture, les sous-titres et la pause mutuelle sont maintenant vérifiés sur les deux fichiers locaux, avec lecture native sans scripts ; la connexion Vimeo décrite dans le diagnostic historique n’est plus requise. Voir [les résultats et captures](videos-locales.md). Cette version est validée localement ; sa publication est autorisée sur la PR #4, sans fusion ni déploiement.
