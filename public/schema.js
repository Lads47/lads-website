// Schema.org LocalBusiness - Les Ateliers du Stream
// Entite unique du site : toute page qui declare sa propre entite (ex. le Course
// de /formations/ia) doit y faire reference via "@id" plutot que la redeclarer,
// sinon Google voit deux entreprises concurrentes sur la meme URL.
(function() {
    var ORG_ID = "https://lesateliersdustream.fr/#organization";

    var schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": ORG_ID,
        "name": "Les Ateliers du Stream",
        "legalName": "Web Vidéo Production - Les Ateliers du Stream",
        "alternateName": "Web Vidéo Production",
        "description": "Captation vidéo multicaméra, production live et organisme de formation certifié Qualiopi. Siège social à Marmande (Lot-et-Garonne), implantations à Bordeaux et Paris, interventions partout en France.",
        "url": "https://lesateliersdustream.fr",
        "telephone": "+33661968858",
        "email": "prod@lesateliersdustream.fr",
        "foundingDate": "1998",
        "image": "https://lesateliersdustream.fr/photo/20260429_113309.webp",
        "logo": "https://lesateliersdustream.fr/images/LOGO_fonce.svg",
        "priceRange": "$$",
        "currenciesAccepted": "EUR",
        "paymentAccepted": "Virement bancaire, Chèque",
        "identifier": {
            "@type": "PropertyValue",
            "propertyID": "SIREN",
            "value": "819502238"
        },
        // Siege social (cf. mentions legales) : adresse principale de l'entite.
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "39 bis rue Robert Creuzet",
            "addressLocality": "Marmande",
            "postalCode": "47200",
            "addressRegion": "Nouvelle-Aquitaine",
            "addressCountry": "FR"
        },
        // Les deux autres bureaux, rattaches a l'entite principale.
        // image / priceRange / url sont repetes ici : ce sont des champs
        // recommandes par Google pour chaque LocalBusiness, y compris les
        // etablissements rattaches (sinon "problemes non critiques" au test
        // des resultats enrichis).
        "department": [
            {
                "@type": "LocalBusiness",
                "name": "Les Ateliers du Stream — Mérignac",
                "telephone": "+33661968858",
                "email": "prod@lesateliersdustream.fr",
                "url": "https://lesateliersdustream.fr",
                "image": "https://lesateliersdustream.fr/photo/20260429_113309.webp",
                "priceRange": "$$",
                "parentOrganization": { "@id": ORG_ID },
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "22 rue Marcelin Berthelot",
                    "addressLocality": "Mérignac",
                    "postalCode": "33700",
                    "addressRegion": "Nouvelle-Aquitaine",
                    "addressCountry": "FR"
                }
            },
            {
                "@type": "LocalBusiness",
                "name": "Les Ateliers du Stream — Issy-les-Moulineaux",
                "telephone": "+33661968858",
                "email": "prod@lesateliersdustream.fr",
                "url": "https://lesateliersdustream.fr",
                "image": "https://lesateliersdustream.fr/photo/20260429_113309.webp",
                "priceRange": "$$",
                "parentOrganization": { "@id": ORG_ID },
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "108 Bd Gallieni",
                    "addressLocality": "Issy-les-Moulineaux",
                    "postalCode": "92130",
                    "addressRegion": "Île-de-France",
                    "addressCountry": "FR"
                }
            }
        ],
        // Deux points de contact distincts : production et formation.
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "telephone": "+33661968858",
                "email": "prod@lesateliersdustream.fr",
                "areaServed": "FR",
                "availableLanguage": "French"
            },
            {
                "@type": "ContactPoint",
                "contactType": "sales",
                "name": "Formations",
                "telephone": "+33646656577",
                "email": "formation@lesateliersdustream.fr",
                "areaServed": "FR",
                "availableLanguage": "French"
            }
        ],
        "areaServed": [
            {
                "@type": "Country",
                "name": "France"
            },
            {
                "@type": "AdministrativeArea",
                "name": "Nouvelle-Aquitaine"
            },
            {
                "@type": "AdministrativeArea",
                "name": "Lot-et-Garonne"
            },
            {
                "@type": "City",
                "name": "Marmande"
            },
            {
                "@type": "City",
                "name": "Agen"
            },
            {
                "@type": "City",
                "name": "Bordeaux"
            },
            {
                "@type": "City",
                "name": "Paris"
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Services de captation vidéo et formations",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Captation vidéo événementielle",
                        "description": "Captation vidéo multicaméra pour congrès, séminaires et événements professionnels"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Captation multicam",
                        "description": "Régies vidéo mobiles de 3 à 4 caméras pour la diffusion en direct ou en replay"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Live streaming",
                        "description": "Diffusion en direct de vos événements sur Internet"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Plateau Web TV",
                        "description": "Plateau Web TV sur site pour produire des contenus dynamiques"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Formation IA à Marmande",
                        "description": "Formation d'une journée à l'intelligence artificielle générative et aux agents IA, en présentiel à Marmande (Lot-et-Garonne)",
                        "url": "https://lesateliersdustream.fr/formations/ia"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Formation vMix à Marmande",
                        "description": "Formation à la régie vidéo vMix, en présentiel à Marmande (Lot-et-Garonne)",
                        "url": "https://lesateliersdustream.fr/formations/vmix"
                    }
                }
            ]
        },
        "sameAs": [
            "https://www.instagram.com/lesateliersdustream/",
            "https://www.linkedin.com/company/les-ateliers-du-stream/"
        ]
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
})();
