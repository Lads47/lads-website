# Les Ateliers du Stream — refonte Astro et Lumos

@C:\Users\webat\.codex\RTK.md

## Mandat et autonomie

Le projet consiste à refondre le site de `Lads47/lads-website` avec Astro et Lumos. Le propriétaire souhaite déléguer la conduite du projet aux agents, sans gérer les choix techniques ni le suivi quotidien.

- Examiner le code, les ressources du projet et les sources officielles avant de choisir une solution. Vérifier le socle Lumos adapté à Astro avant son installation.
- Prendre les décisions courantes, documenter les hypothèses utiles et avancer par étapes vérifiables. Consulter l'utilisateur seulement lorsqu'une information indispensable reste introuvable ou qu'une action engageante dépasse le mandat reçu.
- Prendre en charge le découpage en tickets, leur mise à jour, l'implémentation, les contrôles et les corrections. Reprendre le travail à partir des tickets ouverts et de leurs dépendances.
- Conserver les contenus métier, coordonnées, médias, fonctionnalités et URL utiles du site source. Justifier les changements de comportement et prévoir les redirections avant de changer les URL.
- Préserver les modifications locales existantes. Travailler sur une branche dédiée, enregistrer des commits cohérents et relire les changements avant toute fusion.
- Vérifier chaque étape avec les contrôles adaptés ; pour l'interface, examiner le rendu mobile et bureau, la navigation et les interactions. Rapporter les résultats réellement observés et les limites restantes.
- Distinguer l'état local, GitHub et le site publié. Préparer une livraison vérifiée avant toute mise en production ; la demande de configuration ne constitue pas à elle seule une instruction de déploiement.

## Agent skills

### Issue tracker

Les tickets et spécifications sont suivis dans GitHub Issues de `Lads47/lads-website`. Lire `docs/agents/issue-tracker.md` avant toute opération sur le suivi.

### Triage labels

Les cinq rôles de triage utilisent les labels standards. Lire `docs/agents/triage-labels.md` avant de qualifier ou sélectionner un ticket.

### Domain docs

Organisation single-context : `GLOSSARY.md` et `docs/adr/` à la racine. Lire `docs/agents/domain.md` avant l'exploration du domaine ou une décision d'architecture.
