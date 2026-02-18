# Les Ateliers du Stream - Site Web

Site vitrine de **Les Ateliers du Stream**, entreprise de captation multicam et de production audiovisuelle en direct.

## Stack technique

- **HTML5** / **CSS3** / **JavaScript** vanilla (aucun framework)
- Polices : Butler (serif) et Open Sans (variable)
- Formats d'images : WebP, SVG, AVIF
- Header et footer dynamiques via JS (`header.js`, `footer.js`)
- Lightbox photo intégrée
- Design responsive (breakpoints : 1024px, 768px, 480px)

## Arborescence

```
lads-website/
├── index.html                  # Page d'accueil
├── solutions.html              # Nos solutions
├── realisations.html           # Nos réalisations
├── formations.html             # Nos formations
├── approche.html               # Notre accompagnement
├── histoire.html               # Notre histoire
├── mentions-legales.html       # Mentions légales
│
├── solutions/                  # 12 sous-pages solutions
│   ├── captation-multicam.html
│   ├── captation-evenementielle.html
│   ├── captation-multi-regies.html
│   ├── cameras-tourelle-hf.html
│   ├── multiplex.html
│   ├── plateau-web-tv.html
│   ├── fond-vert.html
│   ├── retranscription-synthese.html
│   ├── chapitrage-automatique.html
│   ├── videoprojection.html
│   ├── sonorisation.html
│   └── diffusion-gestion-medias.html
│
├── realisations/               # 10 sous-pages réalisations
│   ├── peer-gynt.html
│   ├── jeu-de-role.html
│   ├── ceremonie-docteurs-bordeaux.html
│   ├── festival-imprime.html
│   ├── universite-ete-ceca.html
│   ├── destination-europe.html
│   ├── salon-agriculture-bordeaux.html
│   ├── inova-e.html
│   ├── etourisme-pau.html
│   └── festival-journalisme-couthures.html
│
├── formations/                 # Sous-pages formations
│   └── vmix.html
│
├── header.js / header.css      # Navigation dynamique
├── footer.js / footer.css      # Footer dynamique + scroll reveal
│
├── fonts/                      # Polices (woff2)
├── images/                     # Logos, icônes, favicon
├── logos-clients/              # Logos des clients (SVG + WebP)
└── photo/                      # Photos du site (WebP)
```

## Navigation

Le header et le footer sont générés dynamiquement par `header.js` et `footer.js` avec détection automatique du préfixe de chemin (`../` pour les sous-dossiers).

## Développement local

Ouvrir directement `index.html` dans un navigateur (`file://`). Tous les liens internes incluent l'extension `.html` pour la compatibilité en navigation locale.

## Déploiement

Site statique hébergé sur **Hostinger**. Aucun build nécessaire : les fichiers sont déployés tels quels.

## Contact

- **Email** : prod@lesateliersdustream.fr
- **Téléphone** : 06 61 96 88 58
- **Bureaux** : Marmande (47) | Mérignac (33) | Issy-les-Moulineaux (92)
