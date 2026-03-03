// Schema.org LocalBusiness - Les Ateliers du Stream
(function() {
    var schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://lesateliersdustream.fr/#organization",
        "name": "Les Ateliers du Stream",
        "alternateName": "Web Vid\u00e9o Production",
        "description": "Captation vid\u00e9o multicam\u00e9ra et production live pour vos \u00e9v\u00e9nements professionnels. Interventions \u00e0 Bordeaux, Paris et partout en France.",
        "url": "https://lesateliersdustream.fr",
        "telephone": "+33661968858",
        "email": "prod@lesateliersdustream.fr",
        "foundingDate": "1998",
        "image": "https://lesateliersdustream.fr/images/logo-lads.svg",
        "logo": "https://lesateliersdustream.fr/images/logo-lads.svg",
        "priceRange": "$$",
        "currenciesAccepted": "EUR",
        "paymentAccepted": "Virement bancaire, Ch\u00e8que",
        "areaServed": [
            {
                "@type": "Country",
                "name": "France"
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
        "address": [
            {
                "@type": "PostalAddress",
                "streetAddress": "39 bis rue Robert Creuzet",
                "addressLocality": "Marmande",
                "postalCode": "47200",
                "addressRegion": "Nouvelle-Aquitaine",
                "addressCountry": "FR"
            },
            {
                "@type": "PostalAddress",
                "streetAddress": "22 rue Marcelin Berthelot",
                "addressLocality": "M\u00e9rignac",
                "postalCode": "33700",
                "addressRegion": "Nouvelle-Aquitaine",
                "addressCountry": "FR"
            },
            {
                "@type": "PostalAddress",
                "streetAddress": "108 Bd Gallieni",
                "addressLocality": "Issy-les-Moulineaux",
                "postalCode": "92130",
                "addressRegion": "\u00cele-de-France",
                "addressCountry": "FR"
            }
        ],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Services de captation vid\u00e9o",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Captation vid\u00e9o \u00e9v\u00e9nementielle",
                        "description": "Captation vid\u00e9o multicam\u00e9ra pour congr\u00e8s, s\u00e9minaires et \u00e9v\u00e9nements professionnels"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Captation multicam",
                        "description": "R\u00e9gies vid\u00e9o mobiles de 3 \u00e0 4 cam\u00e9ras pour la diffusion en direct ou en replay"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Live streaming",
                        "description": "Diffusion en direct de vos \u00e9v\u00e9nements sur Internet"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Plateau Web TV",
                        "description": "Plateau Web TV sur site pour produire des contenus dynamiques"
                    }
                }
            ]
        },
        "sameAs": []
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
})();
