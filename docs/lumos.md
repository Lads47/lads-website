# Lumos for Astro : composants et tokens actifs

Source officielle : <https://github.com/lumosframework/lumos-for-astro/tree/v1.0.3>.

- Version **1.0.3**, commit `9f149ee80244afc0a98f809a74b70c67a009177e`.
- Licence MIT conservée dans `LICENSE-LUMOS`.
- Astro **7.4.7** ; versions exactes et résolution dans `package.json` et `package-lock.json`.

## Structure des pages

Les pages utilisent les composants du starter officiel : `Section`, `ContentWrapper`, `Grid`, `Card`, `Heading`, `Paragraph`, `Eyebrow`, `Img`, `Video`, `Overlay` et `Button`. Le menu, le pied de page et les photos utilisent `Nav`, `NavLink`, `Footer` et `Modal`. La couche de reset qui neutralisait Lumos a été supprimée, ainsi que les anciennes implémentations de navigation et de pied de page.

Les fichiers de contenu contiennent 89 occurrences de `Section`, 64 de `Grid`, 65 de `Card`, 190 de `Heading`, 222 de `Paragraph`, 116 de `Img` et 60 de `Button`. Ce sont des occurrences dans les sources, avant répétition du contact partagé dans les pages construites. Les variantes typographiques sont actives ; aucun titre de contenu n'utilise le style hérité.

Les extensions restent dans les composants qui possèdent leur rendu : largeur et surface de `Section`, proportions et espacement de `Grid`, variantes panel/profile et lien global de `Card`, rôles de taille de `Img`, variante photo de `Modal` et rendu textuel de `Button` dans une carte déjà cliquable. Les variantes existantes sont conservées. `TrainingMeta` mutualise les informations des deux formations ; `ContactSection` reçoit les textes et coordonnées propres à chaque page.

Les détails spécifiques conservés, comme la frise historique, les légendes et les métadonnées, utilisent du CSS dans la couche `components`, avec les mêmes tokens. Les textes, images, arrière-plans et URL historiques sont vérifiés séparément du rendu.

## Tokens et noms

| Source | Responsabilité |
| --- | --- |
| `src/styles/base.css` | Contrat Lumos : échelles fluides, rôles de thème, typographie, espacement, reset |
| `src/styles/brand.css` | Identité : Butler/Open Sans, palette, échelles, surfaces, proportions, positions des photos |
| `src/styles/tokens.css` | Primitives : dimensions, opacités, durées, angles, ombres et effets |
| `src/styles/media-tokens.json` | Conditions responsive, survol et réduction des animations, partagées avec JavaScript |
| `postcss.config.mjs` | Résolution des conditions nommées vers des media queries natives au build |

Les couleurs emploient les noms Lumos `--light-*`, `--dark-*`, `--brand-500`, les rôles d'action `--action-*`, les rôles de thème `--text`, `--text-2`, `--background`, ainsi que des rôles explicites pour les résultats, sessions et superpositions. Aucun préfixe `--at-` ni alias historique français ne reste dans les styles du site.

Les couleurs, dimensions, espacements, tailles typographiques, bordures, rayons, ombres, durées et seuils responsive sont définis dans ces tokens. Les composants référencent ces valeurs, y compris dans leurs styles inline. Les nombres de colonnes, longueurs maximales de texte et pourcentages issus d'EVA sont des paramètres des composants ou des données : ils alimentent des custom properties locales. Les coordonnées et couleurs internes des fichiers SVG restent des données des médias d'origine. Les mots-clés structurels CSS et les déclarations d'enregistrement des polices restent du CSS natif.

Les styles des résultats EVA ont été extraits de JavaScript vers `training-results.css`. Le script conserve son comportement et expose seulement la progression reçue dans `--result-progress`.

## Vérifications

`npm test` contrôle aussi les tokens : absence de valeurs visuelles littérales hors définitions, absence d'anciens préfixes, conditions responsive nommées, styles inline construits et utilisation des composants dans toutes les pages. Un test navigateur modifie temporairement les tokens de couleur et d'espacement, vérifie que les composants changent réellement de couleur et de padding, puis restaure les valeurs.

La refonte admet des adaptations des tailles et espacements, conformément à la demande. Les captures restent comparées à la source ; une identité pixel par pixel n'est pas revendiquée pour cette version native Lumos.
