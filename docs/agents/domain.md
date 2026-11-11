# Domain docs

## Lecture avant exploration

- Lire `GLOSSARY.md` à la racine s'il existe.
- Lire les décisions de `docs/adr/` concernant le sujet traité.
- Si un futur `GLOSSARY-MAP.md` existe, suivre ses liens vers les contextes pertinents.

Si ces fichiers sont absents, poursuivre silencieusement. Le skill `/domain-modeling` les crée lorsque des termes ou des décisions sont effectivement résolus ; leur absence seule ne justifie pas de les créer.

## Organisation retenue

Projet single-context : un `GLOSSARY.md` à la racine et des décisions numérotées dans `docs/adr/`. Le site source est un seul site statique ; aucun signal de monorepo n'a été trouvé lors de la configuration du 11 novembre 2026.

## Vocabulaire

Dans les tickets, spécifications, hypothèses, tests et propositions de refonte, employer les termes définis dans le glossaire. Lorsqu'un concept manque, vérifier d'abord le vocabulaire du site source ; consigner une définition lorsque le sens est établi.

## Décisions

Confronter les choix d'architecture aux ADR pertinents. Signaler explicitement toute contradiction et sa raison avant de remplacer une décision existante. Documenter les choix durables et leurs conséquences ; les détails directement lisibles dans la configuration restent dans le code.
