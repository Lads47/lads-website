# Publication automatique sur Hostinger

## Déclenchement et responsabilité

Le propriétaire a demandé le 13 novembre 2026 la publication automatique après fusion dans `main`, avec contrôles, sauvegarde et retour arrière. **Fusionner une PR dans `main` engage la mise en ligne.** Les PR ordinaires exécutent les contrôles sans recevoir la clé de production.

Le workflow `.github/workflows/quality.yml` construit le commit, vérifie Astro/TypeScript, les invariants de contenu et de médias, les interactions dans Chrome et les tests de déploiement. Il transmet ensuite **le même `dist/` vérifié** au job de publication. Aucun build, `npm install`, mise à jour système, redémarrage du VPS ou modification de Traefik n'est exécuté sur Hostinger.

La publication exige un événement `push` sur `main`, un commit associé à une PR effectivement fusionnée dans `main` et encore en tête de la branche. Un push direct sans PR fusionnée et une ancienne exécution dépassée sont ignorés. Un déploiement déjà commencé se termine ; les jobs de publication et de retour arrière partagent le groupe de concurrence `hostinger-production`, sans annulation en cours. Le serveur prend aussi un verrou exclusif. Le compte actuel dispose de droits d'écriture, pas d'administration : la protection GitHub de `main` reste du ressort d'un administrateur.

## Serveur et frontières

- VPS Hostinger `82.112.240.219`, Ubuntu 24.04 ; projet `/docker/lads-website`.
- Conteneur existant `lads-website`, Nginx derrière Traefik. Le montage `site` reste identique.
- `site/.releases/<commit>-<run_id>-<attempt>/` : versions complètes, en lecture seule dans Nginx.
- `site/current` : lien relatif vers la version active. Le remplacement atomique du lien publie toutes les pages ensemble, sans redémarrage ni rechargement Nginx.
- `site/.assets/` : ressources Astro à noms versionnés, conservées entre versions pour les onglets déjà ouverts. Un même nom avec un contenu différent fait échouer la livraison.
- `backups-auto/<horodatage>/` : copie complète de la version précédente dans `site.tar`, `nginx.conf`, `docker-compose.yml` et `backup.json`.
- `automation-state.json` : version active, précédente, sauvegarde ou transaction interrompue.
- `/usr/local/libexec/lads/` : contrôleur Python et passerelle SSH **détenus par root**. Le workflow ne peut pas les remplacer.

Seul le site LADS est géré. Les autres projets Docker, le réseau existant, la configuration Traefik, le système et les accès des autres utilisateurs sont préservés.

## Authentification

Le secret GitHub `HOSTINGER_SSH_KEY` contient une clé Ed25519 dédiée à l'utilisateur `lads-deploy`. Sa clé publique sur le serveur impose `restrict,command="/usr/local/libexec/lads/ssh-gateway.sh"`. Aucun shell interactif, SFTP/SCP, transfert de port, accès au groupe Docker ou écriture des scripts privilégiés. Sudo autorise uniquement le contrôleur pour `status`, `deploy …` et `rollback …` ; toutes les valeurs sont validées une seconde fois par le contrôleur.

La clé publique du serveur a été lue dans la console Hostinger authentifiée et est épinglée dans `deploy/known_hosts`. Garder `StrictHostKeyChecking=yes`. Si l'identité du VPS change, faire vérifier la nouvelle clé par un administrateur avant de modifier ce fichier. Les clés privées restent hors Git et hors journaux.

## Déroulement d'une publication

1. Construire et tester dans GitHub Actions. `scripts/package-release.mjs` produit `release.json` avec le commit, l'exécution et les SHA-256 des fichiers.
2. Recevoir l'archive par SSH dans une **nouvelle** version. Refuser les traversées de chemins, fichiers cachés, liens, périphériques, doublons, inventaires incomplets et empreintes incorrectes. Limites : 750 Mio décompressés, 10 000 entrées, réception limitée à 5 minutes ; refuser si moins de 3 Gio sont libres avant l'opération.
3. Vérifier la version dans un conteneur Nginx jetable, utilisant l'image **déjà présente** du site, sans téléchargement : 64 Mio de RAM, 0,25 CPU, 64 processus, système de fichiers en lecture seule, port publié uniquement sur `127.0.0.1`. Le supprimer après le contrôle.
4. Préserver les ressources Astro déjà publiées, sauvegarder complètement la version active, puis écrire le journal de transaction avant toute bascule.
5. Remplacer le lien `current` atomiquement ; contrôler en HTTPS les pages principales, formations, sitemap, fichier Google, redirections, 404, exclusion `.git`, CSS, sous-titres et requête partielle MP4 (206). `/release.json` doit annoncer le commit attendu.
6. En cas d'échec après bascule, restaurer le lien précédent et contrôler cette version ; le job reste en échec pour rendre l'incident visible. Si le processus a été interrompu brutalement, la prochaine opération récupère d'abord la transaction journalisée. `status` reste en lecture seule.

Les contrôles HTTP ne transmettent aucune inscription EVA et n'exécutent pas le JavaScript de statistiques. Les tests navigateur de CI simulent les services externes.

## Vérifier l'état et diagnostiquer

Consulter GitHub **Actions → Vérification du site Astro → Publication Hostinger** : les chemins de sauvegarde et identifiants sont dans le journal, et le résumé donne le commit publié. Les artefacts du site sont conservés 7 jours ; les rapports navigateur 14 jours.

Avec une clé dédiée autorisée, depuis un poste d'administration :

```bash
ssh -T -i /chemin/cle -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile=deploy/known_hosts lads-deploy@82.112.240.219 status
```

Comparer `main`, le résultat du job et `https://lesateliersdustream.fr/release.json`. La copie locale et les branches de travail peuvent être en retard ; ne pas déduire la version en ligne du seul checkout local.

Un job en échec avant bascule préserve la version active. Un échec après bascule doit montrer `RETOUR ARRIERE verifie`. Si la vérification de la restauration échoue également, demander une inspection administrative ciblée du site et conserver tous les fichiers et journaux.

## Retour arrière manuel

1. Pour suspendre les futures publications, définir la variable de dépôt `HOSTINGER_AUTO_DEPLOY=false`. Un administrateur peut également désactiver le workflow dans GitHub. Cette suspension ne termine pas une livraison en cours.
2. Dans **Actions → Retour arrière Hostinger → Run workflow**, sélectionner `main`, saisir un identifiant complet conservé (`<sha40>-<run_id>-<attempt>` ou `baseline-<horodatage>`), puis lancer. La restauration passe par la même préproduction, sauvegarde et vérification HTTPS que la livraison.
3. Vérifier le résultat et `/release.json`. Corriger ensuite le code dans une PR ; réactiver les publications en supprimant la variable de suspension ou en lui donnant la valeur `true`.

Équivalent SSH : `ssh … lads-deploy@82.112.240.219 'rollback IDENTIFIANT_COMPLET'`.

**Le retour arrière ne réécrit pas GitHub.** Une fusion ultérieure réactive la publication du nouveau `main` si l'automatisation n'a pas été suspendue. Pour réessayer une livraison échouée du `main` courant, relancer son workflow : `run_attempt` distingue les réceptions.

## Installation ou modification par un administrateur

Examiner les scripts et leurs tests avant installation. La commande d'installation crée uniquement l'utilisateur dédié, sa commande forcée, son fichier sudoers et `/usr/local/libexec/lads/` ; elle ne change pas Nginx :

```bash
bash deploy/server/install.sh /chemin/cle-publique.pub
```

L'initialisation est distincte et réservée à l'administrateur : `/usr/local/libexec/lads/release.py initialize`. Elle exige que `nginx.conf` soit **identique à la copie historique examinée** `deploy/nginx.legacy.conf`. Elle sauvegarde d'abord l'existant, copie la version initiale et vérifie la nouvelle configuration dans le conteneur isolé avant toute écriture de Nginx actif. Elle prépare `current` et les ressources partagées, puis change uniquement la racine et l'alias Astro de Nginx. Le fichier est écrit en place pour conserver son montage Docker ; `nginx -t` précède un **rechargement progressif du seul Nginx LADS**, sans redémarrage du conteneur. Un échec restaure la configuration précédente. Après un rechargement, les fichiers créés sont conservés pour les workers encore en cours et l'état `initialization_failed` permet de relancer la même commande ; les publications restent bloquées jusque-là. Un échec de précontrôle nettoie uniquement les nouveaux dossiers, sans toucher aux pages d'origine.

Les scripts serveur sont installés par un administrateur, jamais exécutés depuis l'archive de publication. Une PR les modifiant doit prévoir une installation administrative revue avant fusion. `deploy/nginx.conf` n'est pas appliqué automatiquement à chaque livraison ; les changements de configuration restent une opération administrative ciblée.

## Conservation et reprise exceptionnelle

Les versions, ressources partagées et sauvegardes sont conservées ; aucune purge automatique n'est effectuée. Surveiller l'espace disque dans Hostinger. Avant toute suppression administrative, identifier les versions active/précédente et les sauvegardes de référence ; préserver les ressources encore utilisées par les pages conservées. En cas d'espace insuffisant, la livraison est refusée plutôt que de purger silencieusement.

Les anciennes sauvegardes `/root/backups/lads-website-avant-astro-20261113.tgz` et `/docker/lads-website/site-html-20261113` restent historiques. Ne pas remplacer ni renommer le dossier monté `site` pour une publication courante : cela nécessiterait de recréer le montage. Restaurer une sauvegarde exceptionnelle dans une nouvelle version, la vérifier, puis basculer le lien ; réserver les réparations de Nginx à un administrateur.

## Preuves de validation

Les tests reproductibles sont dans `tests/deploy/` (`python3 -m unittest discover -s tests/deploy -v`) : archives corrompues, traversées, liens, limites, échecs de préproduction et de sauvegarde, échec HTTPS avec restauration, restauration manuelle et collisions de ressources. Le résultat de l'installation et de la première publication est consigné dans `docs/suivi-refonte.md` et le ticket GitHub #5. Distinguer ces tests simulés des contrôles réellement effectués sur le VPS.
