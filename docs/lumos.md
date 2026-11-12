# Lumos for Astro : composants et tokens actifs

Source officielle : <https://github.com/lumosframework/lumos-for-astro/tree/v1.0.3>.

- Version **1.0.3**, commit `9f149ee80244afc0a98f809a74b70c67a009177e`.
- Licence MIT conservée dans `LICENSE-LUMOS`.
- Astro **7.4.7** ; versions exactes et résolution dans `package.json` et `package-lock.json`.

## Structure des pages

Les pages utilisent les composants du starter officiel : `Section`, `ContentWrapper`, `Grid`, `Card`, `Heading`, `Paragraph`, `Eyebrow`, `Img`, `Video`, `Overlay` et `Button`. Le menu, le pied de page et les photos utilisent `Nav`, `NavLink`, `Footer` et `Modal`. La couche de reset qui neutralisait Lumos a été supprimée, ainsi que les anciennes implémentations de navigation et de pied de page.

Les fichiers de contenu contiennent 89 occurrences de `Section`, 64 de `Grid`, 65 de `Card`, 190 de `Heading`, 222 de `Paragraph`, 116 de `Img` et 62 de `Button`. Ce sont des occurrences dans les sources, avant répétition du contact partagé dans les pages construites. Les variantes typographiques sont actives ; aucun titre de contenu n'utilise le style hérité.

Les extensions restent dans les composants qui possèdent leur rendu : largeur et surface de `Section`, proportions et espacement de `Grid`, variantes panel/profile et lien global de `Card`, rôles de taille de `Img`, variante photo de `Modal` et rendu textuel de `Button` dans une carte déjà cliquable. Les variantes existantes sont conservées. `TrainingMeta` mutualise les informations des deux formations ; `ContactSection` reçoit les textes et coordonnées propres à chaque page.

Les détails spécifiques conservés, comme la frise historique, les légendes et les métadonnées, utilisent du CSS dans la couche `components`, avec les mêmes tokens. Les textes, images, arrière-plans et URL historiques sont vérifiés séparément du rendu.

## Échelle native et réglages du site

Pour composer une section, choisir les variantes de `Section`, `Grid`, `Heading` et `Paragraph`. Les cartes du portfolio utilisent un titre HTML h3 présenté avec la variante h5 et un résumé en texte petit. Les cartes immersives de l’accueil emploient la variante h4. Les légendes utilisent le texte petit et l’approche emploie l’interlettrage normal.

Lumos définit les rôles et les échelles dans `src/styles/base.css`. Le thème les personnalise dans `src/styles/brand.css`. Pour modifier le rythme des pages, régler les bornes fluides des paliers `--space-1` à `--space-8`, puis celles des espacements de section. Les grilles utilisent les utilitaires d’espacement du starter. Les valeurs structurelles comme `0`, `100%`, `1fr` et les proportions d’image s’écrivent directement en CSS.

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

## Vérifications

`npm test` vérifie les noms de variables, les références, les conditions responsive et l’utilisation des composants Lumos dans les pages construites. Le contrôle accepte le CSS structurel et refuse une déclaration telle que `--size-0-01875rem`. Le test navigateur change temporairement la couleur de marque et le palier d’espacement d’une carte puis vérifie leurs valeurs calculées.
