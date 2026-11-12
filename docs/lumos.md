# Lumos for Astro : composants et tokens actifs

Source officielle : <https://github.com/lumosframework/lumos-for-astro/tree/v1.0.3>.

- Version **1.0.3**, commit `9f149ee80244afc0a98f809a74b70c67a009177e`.
- Licence MIT conservée dans `LICENSE-LUMOS`.
- Astro **7.4.7** ; versions exactes et résolution dans `package.json` et `package-lock.json`.

## Structure des pages

Les pages utilisent les composants du starter officiel : `Section`, `ContentWrapper`, `Grid`, `Card`, `Heading`, `Paragraph`, `Eyebrow`, `Img`, `Video`, `Overlay` et `Button`. Le menu, le pied de page et les photos utilisent `Nav`, `NavLink`, `Footer` et `Modal`. La couche de reset qui neutralisait Lumos a été supprimée, ainsi que les anciennes implémentations de navigation et de pied de page.

Les fichiers de contenu contiennent 89 occurrences de `Section`, 70 de `Grid`, 65 de `Card`, 190 de `Heading`, 228 de `Paragraph`, 111 de `Img` et 66 de `Button`. Ce sont des occurrences dans les sources, avant répétition du contact partagé dans les pages construites. Les variantes typographiques sont actives ; aucun titre de contenu n'utilise le style hérité.

Les extensions restent dans les composants qui possèdent leur rendu : largeur et surface de `Section`, proportions et espacement de `Grid`, variantes panel/profile et lien global de `Card`, rôles de taille de `Img`, variante photo de `Modal` et rendu textuel de `Button` dans une carte déjà cliquable. Les variantes existantes sont conservées. `TrainingMeta` mutualise les informations des deux formations ; `ContactSection` reçoit les textes et coordonnées propres à chaque page.

Les détails spécifiques conservés, comme la frise historique, les légendes et les métadonnées, utilisent du CSS dans la couche `components`, avec les mêmes tokens. Les textes, images, arrière-plans et URL historiques sont vérifiés séparément du rendu.

Les quatre cartes de solutions immersives de l’accueil sont regroupées par `solution-cards`. Leur texte secondaire reprend localement `--text` et leur interligne principal reprend `--line-height-huge` (1,5), sans modifier la typographie du reste du site. `Card` transmet son option `overlayStrength` au composant natif `Overlay` : 90 pour ces quatre cartes, 50 par défaut pour les autres. Aucun nouveau token global n’est ajouté.

## Échelle native et réglages du site

Les boutons principaux, secondaires et icônes disposent d’un retour inspiré de la skill Emil : soulèvement au survol d’un demi `--space-1`, compression à `scale: 0.97` à l’appui et retour interrompable par transitions CSS. Le déplacement utilise `--hover-duration` et `--hover-ease` ; la compression utilise 60 % de cette durée avec `ease-out` (120 ms avec le thème actuel). Les propriétés individuelles `translate` et `scale` coexistent avec le `transform` de l’entrée GSAP. Les éléments textuels non interactifs des cartes, liens de variante `link` et boutons désactivés ne reçoivent pas ce mouvement. Les conditions partagées `--mq-hover-fine` et `--mq-motion-full` réservent le soulèvement aux pointeurs fins et suppriment tout mouvement lorsque l’utilisateur demande une réduction des animations. Le focus natif Lumos est conservé. Aucun JavaScript d’interaction supplémentaire ni variable copiant une mesure n’est ajouté.

Pour composer une section, choisir les variantes de `Section`, `Grid`, `Heading` et `Paragraph`. Les cartes du portfolio utilisent un titre HTML h2 présenté avec la variante h4 et un résumé en texte principal. Les cartes des formations utilisent également la variante h4 et le texte principal. Les titres longs sont alignés à gauche ; les résumés ne sont plus tronqués. Les cartes immersives de l’accueil emploient la variante h4. Les légendes utilisent le texte petit et l’approche emploie l’interlettrage normal.

Le rôle natif `--heading-accent` mélange le bleu et le marine sur fond clair, et reprend le bleu clair sur fond sombre. Les liens utilisent `--link-text` ; les boutons orange utilisent le marine avec `--button-text`. Les couleurs sources de la marque sont conservées. Le texte secondaire clair utilise `--text-2`, ajusté pour rester lisible aussi sur les fonds gris du site. Le texte petit utilise les bornes natives à 14 px ; les interlignes h4/h5 reprennent `--line-height-large`.

`TrainingLayout` compose trois zones avec `Grid` : résumé pratique et accès aux sessions, contenu pédagogique, informations complémentaires. Sur mobile, cet ordre suit aussi le DOM. Sur bureau, le contenu reste à gauche et les deux blocs pratiques occupent la colonne de droite. Les anciennes coordonnées et tous les textes restent présents. `TrainingMeta` transmet les attributs HTML, dont l’identifiant de l’ancre des sessions.

Lumos définit les rôles et les échelles dans `src/styles/base.css`. Le thème les personnalise dans `src/styles/brand.css`. Pour modifier le rythme des pages, régler les bornes fluides des paliers `--space-1` à `--space-8`, puis celles des espacements de section. Les grilles utilisent les utilitaires d’espacement du starter. Les valeurs structurelles comme `0`, `100%`, `1fr` et les proportions d’image s’écrivent directement en CSS.

Les 33 bandeaux internes utilisent le même cadre dans `src/styles/site.css`, sur la première `Section` avec l’espacement natif `navoverlap`. Leur hauteur minimale combine `--nav-height`, quatre espacements `--section-space-large` et `--space-6`. Le token natif `--section-space-nav-overlap` est réglé localement avec la hauteur du menu et l’espacement `--section-space-small` ; la variante native de section conserve la maîtrise du padding. Le contenu reste centré, avec une hauteur extensible sur petit écran et lorsque le texte est agrandi. L’accueil et la page 404 conservent leur présentation pleine hauteur. Aucune propriété globale supplémentaire n’est ajoutée.

La largeur principale du site utilise le token natif `--max-width-main`, réglé à `81.25rem` (1 300 px à la taille de texte par défaut) dans `brand.css`. Le header et les conteneurs de section partagent ce plafond et conservent leurs marges fluides sur les écrans plus étroits. L’écart logo/navigation utilise à nouveau le réglage natif `--space-6` de `Nav`, sans surcharge desktop vers `--space-4`.

La navigation comporte sept liens, avec « Accueil » en premier. Les conditions partagées `--mq-navigation-desktop` et `--mq-navigation-mobile` basculent à `80rem` (1 280 px) pour garder les sept liens sur une seule ligne. `NavLink` normalise aussi le chemin de construction `/index.html` vers `/` ; le lien Accueil est actif uniquement à la racine, tandis que les catégories restent actives sur leurs sous-pages.

À la demande du propriétaire, les liens actifs et survolés de la navigation utilisent directement `--brand-500`, le bleu clair du logo, et aucun lien du menu n’est souligné. L’attribut `aria-current` est conservé. Ce choix visuel remplace le rôle d’accent foncé dans ce seul composant ; sa limite de contraste sur blanc est consignée dans `audit-impeccable.md`.

Les huit propriétés globales propres au site se trouvent dans `brand.css`.

| Propriété | Usage partagé |
| --- | --- |
| `--heading-family` | Police Butler pour les titres et les chiffres éditoriaux |
| `--action-500` et `--action-600` | Orange des boutons et de leur survol dans les thèmes clair et sombre |
| `--label-tracking` | Interlettrage des libellés en capitales de la navigation, des boutons et des surtitres |
| `--tag-background` | Fond teinté dérivé du bleu de marque pour les étiquettes |
| `--shadow-surface` | Ombre commune aux surfaces en relief |
| `--hero-image-opacity` | Lisibilité du texte sur les photos de bandeau |
| `--tracks-content-sidebar` | Proportions de la grille contenu et colonne latérale des fiches |

Un cadrage propre à une photo reste auprès de son image. Les conditions responsive partagées avec JavaScript sont définies dans `src/styles/media-tokens.json`. Les résultats EVA gardent leur progression dynamique et leur couleur de réussite dans leur composant.

Les trois icônes du contact sont importées depuis `src/assets/icons/contact-*.svg` et rendues inline par `Icon`. Leur remplissage suit `currentColor`. La règle `.icon-brand` dans `src/styles/site.css` règle leur couleur avec `var(--brand-500)`. Le contrôle statique compare leurs tracés et leurs libellés aux images SVG d’origine.

## Vérifications

`npm test` vérifie les noms de variables, les références, les conditions responsive et l’utilisation des composants Lumos dans les pages construites. Le contrôle accepte le CSS structurel et refuse une déclaration telle que `--size-0-01875rem`. Le test navigateur change temporairement la couleur de marque et le palier d’espacement d’une carte puis vérifie leurs valeurs calculées.

## Médias responsive

`npm run media:prepare` utilise Sharp 0.35.5, verrouillé dans les dépendances de développement, pour préparer 184 déclinaisons des 63 photos raster de `public/photo`. Les fichiers sont générés dans `public/media/responsive`, ignoré par Git, et référencés par `src/data/responsive-images.json`. Cette étape précède automatiquement `dev` et `build`. Les noms dépendent du contenu source ; aucune image n’est agrandie et une déclinaison plus lourde que l’original n’est pas conservée.

Le composant `Img` conserve son URL source et son texte alternatif. Il ajoute les dimensions intrinsèques, le `srcset` et `sizes="auto, 100vw"` pour les photos différées. Les images de bandeau chargées immédiatement ont une priorité haute. La lightbox ouvre toujours l’URL originale, même si la vignette utilise une petite déclinaison.


La vidéo originale reste dans `public/videos`. Sa version mobile complète, `demo-ateliers-du-stream-mobile.mp4`, pèse 2 494 220 octets et conserve une durée de 83,8 secondes. `Video` sélectionne cette source sous le seuil partagé `--mq-compact-max`. Le poster local pèse 57 018 octets. En préférence de mouvement réduit, `preload="none"` conserve le poster et le téléchargement vidéo ne commence qu’après une demande de lecture. Les fichiers vidéo sont livrés dans le dépôt ; FFmpeg n’est pas nécessaire au build.

## Frise « Notre histoire »

`Histoire.astro` emploie une liste ordonnée de huit étapes. Chaque étape utilise `Grid` avec `gap="6"`, `Paragraph` au style h1 pour l’année (un span, sans titre HTML supplémentaire), `Heading` h3, `Paragraph` principal et `Img`. À partir de 1 024 px, la première piste vaut `calc(var(--h1) * 3)` et les deux autres suivent le rapport texte/média 1 / 1,25 ; leurs contenus sont centrés verticalement, conformément au retour de présentation. De 768 à 1 023 px, année et texte occupent la colonne gauche et le média la droite. Sur mobile, l’ordre reste année, texte, média.

Les étapes sont séparées par `--section-space-large`. L’interligne principal est rétabli localement avec `--line-height-huge` (1,5). Le texte suit `--text`, le fil décoratif `--brand-500`, les repères `--space-3` et leur retrait `--space-6`. Aucune couleur ni variable de marque supplémentaire n’est créée. `--_timeline-marker-position` est une position structurelle privée : elle relie les deux moitiés de fil au centre du repère, même après le centrage des colonnes. Les photos gardent leurs dimensions intrinsèques et les lecteurs ont un cadre 16:9.

Le module `src/scripts/history-timeline.ts`, importé uniquement par cette page, utilise ScrollTrigger sans déplacement des contenus, pin ni interception du défilement. Le franchissement du milieu de la zone sous le header colore le repère et le segment suivant ; remonter annule l’état. Les mesures initiales sont recalculées individuellement après les polices et `pageshow` : un refresh global pendant le chargement interrompait la restauration douce native dans Chrome. Les recalculs automatiques au redimensionnement restent actifs. Sans scripts, la liste et son fil restent complets ; en mouvement réduit, les couleurs changent sans transition. Référence : [documentation ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).
