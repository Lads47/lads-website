# Lumos for Astro

Source officielle : <https://github.com/lumosframework/lumos-for-astro/tree/v1.0.3>.

- Version : **1.0.3**.
- Commit : `9f149ee80244afc0a98f809a74b70c67a009177e`.
- Documentation : <https://lumosframework.com/docs/>.
- Licence MIT conservée dans `LICENSE-LUMOS`.
- Versions exactes des dépendances et provenance dans `package.json` ; résolution verrouillée dans `package-lock.json`.

Les composants, styles, utilitaires et ressources du framework officiel sont disponibles dans `src/`. Les composants éditoriaux du site utilisent notamment le composant `Heading`, avec le style hérité, pour conserver la typographie originale.

La demande de migration fidèle impose de conserver le CSS du site, ses dimensions et ses breakpoints. Les styles de chaque page restent donc associés à son composant de contenu. Une couche `source-reset` rétablit les valeurs du navigateur sous ces styles, afin que le reset et les classes génériques Lumos ne changent pas le rendu de la source. Les tokens et utilitaires Lumos restent disponibles ; les styles hérités n'ont pas été convertis arbitrairement vers de nouveaux espacements ou des composants aux dimensions différentes.

Les composants `site/` possèdent les comportements spécifiques au menu et aux photos. `ContactSection` mutualise le bloc contact en recevant les libellés et coordonnées propres à chaque page, y compris les différences déjà présentes dans le site source.
