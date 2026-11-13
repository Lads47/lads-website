# Tester un build unique dans six jobs navigateur

13 novembre 2026 — Le propriétaire demande d'accélérer la CI sans retirer de contrôle ni modifier le VPS. La dernière exécution sur `main` durait 5 min 21 s, dont 3 min 20 s dans Chrome ; les contrôles étaient tous séquentiels et répétés sur la PR puis sur le commit fusionné.

Un job construit et contrôle le site une seule fois. Six jobs GitHub isolés réutilisent cet artefact : rendus bureau, rendus mobile, interactions, frise/audit visuel, vidéos et navigation. Les assertions existantes sont conservées ; aucun filtre par fichier ou réduction du nombre de scénarios n'est introduit. Le mode complet local reste disponible.

Le contrôle final `quality` conserve son nom et exige les succès de construction et de toute la matrice. Il vérifie les six rapports, leurs contrôles, les 70 couples page/largeur et captures, le commit et la tentative. Le déploiement dépend de cette barrière et réutilise le même artefact ; aucun secret de production n'est accessible aux tests. Tous les lots se terminent pour fournir leurs diagnostics même si l'un échoue.

Les artefacts portent aussi la tentative. Une relance doit reprendre tous les jobs : une relance partielle échoue avant transfert pour éviter de mélanger un manifeste d'une ancienne tentative et une nouvelle commande de publication. Ce choix préserve les scripts privilégiés et le protocole du serveur. Les jobs parallèles consomment davantage de capacité GitHub simultanée ; leur temps d'attente dépend des runners disponibles. Le gain sera mesuré sur les exécutions réelles, sans objectif de durée garanti.

La sauvegarde, la préproduction, la bascule, les vérifications HTTPS et le retour arrière de l'ADR 0002 restent inchangés. Source opérationnelle : [guide Hostinger](../deploiement-hostinger.md). Références : [matrices GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations), [partage d'artefacts](https://docs.github.com/en/actions/tutorials/store-and-share-data).
