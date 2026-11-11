# Issue tracker: GitHub

Les tickets et spécifications de cette refonte vivent dans GitHub Issues : <https://github.com/Lads47/lads-website/issues>.

## Cible et outils

- Dépôt autorisé par l'utilisateur : `Lads47/lads-website` ; remote `origin` : `https://github.com/Lads47/lads-website.git`.
- Utiliser `gh` pour les opérations du suivi. Si le CLI est indisponible, utiliser le connecteur GitHub sur ce même dépôt.
- Avant la première écriture d'une session, vérifier `git remote -v` et `gh repo view --json nameWithOwner`. Fournir explicitement `--repo Lads47/lads-website` aux commandes de mutation.
- Le dépôt cible a été fourni par l'utilisateur : son propriétaire GitHub différent du compte connecté ne nécessite pas une nouvelle confirmation.
- Les agents créent, découpent et tiennent les tickets à jour dans le mandat de refonte. Un ticket décrit le résultat attendu, le périmètre, les dépendances et les critères de validation.

## Opérations

- Créer : `gh issue create --repo Lads47/lads-website --title "..." --body-file <fichier-utf8>`.
- Lire : `gh issue view <numero> --repo Lads47/lads-website --json number,title,body,labels,comments`.
- Lister : `gh issue list --repo Lads47/lads-website --state open --limit 100 --json number,title,body,labels,assignees` ; paginer si nécessaire.
- Modifier le corps : `gh issue edit <numero> --repo Lads47/lads-website --body-file <fichier-utf8>`.
- Appliquer ou retirer un label : `gh issue edit <numero> --repo Lads47/lads-website --add-label "..."` ou `--remove-label "..."`.
- Commenter : `gh issue comment <numero> --repo Lads47/lads-website --body-file <fichier-utf8>`.
- Clore : publier d'abord les résultats de validation dans un commentaire, puis `gh issue close <numero> --repo Lads47/lads-website`.

Utiliser un fichier UTF-8 pour les textes multilignes afin de préserver les sauts de ligne et les caractères littéraux sous PowerShell.

## Dépendances et sous-tickets

- Lier un sous-ticket au parent avec `gh issue edit <parent> --repo Lads47/lads-website --add-sub-issue <enfant>` si disponible. Sinon, inscrire `Part of #<parent>` en tête du sous-ticket et l'ajouter à la liste de tâches du parent.
- Ajouter une dépendance avec `gh issue edit <enfant> --repo Lads47/lads-website --add-blocked-by <bloqueur>` si disponible.
- Repli API : `gh api --method POST repos/Lads47/lads-website/issues/<enfant>/dependencies/blocked_by -F issue_id=<id-base-bloqueur>` ; obtenir l'identifiant numérique avec `gh api repos/Lads47/lads-website/issues/<bloqueur> --jq .id`.
- Si les dépendances natives sont indisponibles, inscrire `Blocked by: #<numero>` en tête du ticket. Un ticket devient démarrable lorsque tous ses bloqueurs sont clos.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Consommation par les skills

- « Publish to the issue tracker » : créer un ticket GitHub dans ce dépôt.
- « Fetch the relevant ticket » : lire le ticket et ses commentaires.
- Lire `triage-labels.md` pour les cinq rôles canoniques. Choisir un ticket `ready-for-agent` sans dépendance ouverte et vérifier ses critères avant de le commencer.
- Une demande d'information appelle d'abord une recherche dans le dépôt et les ressources accessibles. Appliquer `needs-info` seulement si la réponse indispensable reste absente.

## Wayfinding

Si `/wayfinder` est utilisé, créer une carte sous forme d'issue `wayfinder:map` et ses sous-tickets `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` ou `wayfinder:task`. Créer ces labels à leur première utilisation s'ils manquent. Choisir le premier enfant non assigné et sans bloqueur ouvert, puis l'assigner à `@me`. Après résolution, publier les preuves, clore le sous-ticket et reporter la décision et son lien dans la carte.
